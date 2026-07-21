from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.config import settings
from app.core.constants import UserRole
from app.core.security import decode_access_token
from app.database import get_db
from app.models.users import User


def get_current_staff_user(request: Request, db: Session = Depends(get_db)) -> User:
    token = request.cookies.get(settings.admin_cookie_name)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Не авторизовано")

    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Токен недійсний або прострочений")

    user = db.get(User, int(payload["sub"]))
    if not user or user.role not in (UserRole.manager, UserRole.owner):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Немає доступу")

    return user


def get_current_owner_user(user: User = Depends(get_current_staff_user)) -> User:
    if user.role != UserRole.owner:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Доступно лише власнику")
    return user


def get_current_client_user(request: Request, db: Session = Depends(get_db)) -> User:
    token = request.cookies.get(settings.client_cookie_name)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Не авторизовано")

    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Токен недійсний або прострочений")

    user = db.get(User, int(payload["sub"]))
    if not user or user.role != UserRole.client:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Не авторизовано")

    return user
