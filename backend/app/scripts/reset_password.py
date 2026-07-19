"""Скидання пароля персоналу (менеджер/власник), якщо людина забула пароль.
Запускає технар за проханням, без потреби лізти в базу вручну.

Запуск: docker compose run --rm backend python -m app.scripts.reset_password --email you@example.com
Новий пароль скрипт запитає окремо (прихованим вводом), щоб він не лишався в історії команд терміналу.
"""

import argparse
import getpass

from app.core.security import hash_password
from app.database import SessionLocal
from app.models.users import User


def run(email: str, password: str) -> None:
    email = email.strip().lower()
    db = SessionLocal()
    try:
        user = db.query(User).filter_by(email=email).first()
        if not user:
            print(f"Користувача з email {email} не знайдено.")
            return

        user.password_hash = hash_password(password)
        db.commit()
        print(f"Пароль оновлено для {email} (роль: {user.role.value}).")
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Скинути пароль персоналу")
    parser.add_argument("--email", required=True)
    args = parser.parse_args()
    password = getpass.getpass("Новий пароль: ")
    run(args.email, password)
