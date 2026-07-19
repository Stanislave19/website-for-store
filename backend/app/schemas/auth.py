from pydantic import BaseModel

from app.core.constants import UserRole


class AdminLoginRequest(BaseModel):
    email: str
    password: str


class AdminLoginResponse(BaseModel):
    role: UserRole
