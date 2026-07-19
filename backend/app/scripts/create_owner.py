"""Створення акаунта власника (owner) для входу в адмінку.
Немає публічної реєстрації персоналу навмисно — цей скрипт єдиний спосіб завести акаунт.

Запуск: docker compose run --rm backend python -m app.scripts.create_owner --email you@example.com
Пароль скрипт запитає окремо (прихованим вводом), щоб він не лишався в історії команд терміналу.
"""

import argparse
import getpass

from app.core.constants import UserRole
from app.core.security import hash_password
from app.database import SessionLocal
from app.models.users import User


def run(email: str, password: str) -> None:
    email = email.strip().lower()
    db = SessionLocal()
    try:
        existing = db.query(User).filter_by(email=email).first()
        if existing:
            print(f"Користувач із email {email} вже існує (роль: {existing.role.value}).")
            return

        user = User(email=email, password_hash=hash_password(password), role=UserRole.owner)
        db.add(user)
        db.commit()
        print(f"Акаунт власника створено: {email}")
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Створити акаунт власника адмінки")
    parser.add_argument("--email", required=True)
    args = parser.parse_args()
    password = getpass.getpass("Пароль для акаунта власника: ")
    run(args.email, password)
