import re

from pydantic import BaseModel, field_validator

from app.core.constants import UserRole

PHONE_PATTERN = re.compile(r"^\+380\d{9}$")
EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _validate_email(value: str) -> str:
    value = value.strip().lower()
    if not EMAIL_PATTERN.match(value):
        raise ValueError("Некоректний формат email")
    return value


class AdminLoginRequest(BaseModel):
    email: str
    password: str


class AdminLoginResponse(BaseModel):
    role: UserRole


class ClientRegisterRequest(BaseModel):
    email: str
    password: str
    phone: str | None = None

    @field_validator("email")
    @classmethod
    def email_format(cls, value: str) -> str:
        return _validate_email(value)

    @field_validator("password")
    @classmethod
    def password_min_length(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Пароль має містити щонайменше 8 символів")
        return value

    @field_validator("phone")
    @classmethod
    def phone_format(cls, value: str | None) -> str | None:
        if value is None or not value.strip():
            return None
        if not PHONE_PATTERN.match(value.strip()):
            raise ValueError("Телефон має бути у форматі +380XXXXXXXXX")
        return value.strip()


class ClientLoginRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def email_format(cls, value: str) -> str:
        return _validate_email(value)


class ClientSession(BaseModel):
    id: int
    email: str
    phone: str | None
