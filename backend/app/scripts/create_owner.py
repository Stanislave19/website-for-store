"""Створення акаунта персоналу (власник або менеджер) для входу в адмінку.
Немає публічної реєстрації персоналу навмисно — цей скрипт єдиний спосіб завести акаунт.

Запуск: docker compose run --rm backend python -m app.scripts.create_owner --email you@example.com --role owner
За замовчуванням роль owner (для сумісності зі старими викликами без --role).
Щоб створити тестового менеджера для перевірки розмежування доступу: --role manager.
Пароль скрипт запитає окремо (прихованим вводом), щоб він не лишався в історії команд терміналу.
"""

import argparse
import getpass

from app.core.constants import UserRole
from app.core.security import hash_password
from app.database import SessionLocal
from app.models.users import User

ROLE_BY_NAME = {"owner": UserRole.owner, "manager": UserRole.manager}


def run(email: str, password: str, role: UserRole) -> None:
    email = email.strip().lower()
    db = SessionLocal()
    try:
        existing = db.query(User).filter_by(email=email).first()
        if existing:
            print(f"Користувач із email {email} вже існує (роль: {existing.role.value}).")
            return

        user = User(email=email, password_hash=hash_password(password), role=role)
        db.add(user)
        db.commit()
        print(f"Акаунт створено: {email} (роль: {role.value})")
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Створити акаунт персоналу адмінки (owner або manager)")
    parser.add_argument("--email", required=True)
    parser.add_argument("--role", choices=["owner", "manager"], default="owner")
    args = parser.parse_args()
    password = getpass.getpass(f"Пароль для акаунта ({args.role}): ")
    run(args.email, password, ROLE_BY_NAME[args.role])
