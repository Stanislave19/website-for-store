from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.config import settings
from app.core.deps import get_current_client_user
from app.core.security import create_access_token
from app.database import get_db
from app.models.users import User
from app.schemas.auth import ClientLoginRequest, ClientRegisterRequest, ClientSession
from app.services.account_service import EmailAlreadyRegisteredError, authenticate_client, register_client

router = APIRouter()


def _set_client_cookie(response: Response, user_id: int) -> None:
    token = create_access_token(user_id, "client", settings.client_token_expire_minutes)
    response.set_cookie(
        key=settings.client_cookie_name,
        value=token,
        httponly=True,
        secure=settings.admin_cookie_secure,
        samesite="lax",
        max_age=settings.client_token_expire_minutes * 60,
        path="/",
    )


@router.post("/auth/register", response_model=ClientSession, status_code=201)
def register(payload: ClientRegisterRequest, response: Response, db: Session = Depends(get_db)):
    try:
        user = register_client(db, payload)
    except EmailAlreadyRegisteredError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Цей email вже зареєстровано") from exc

    _set_client_cookie(response, user.id)
    return ClientSession(id=user.id, email=user.email, phone=user.phone)


@router.post("/auth/login", response_model=ClientSession)
def login(payload: ClientLoginRequest, response: Response, db: Session = Depends(get_db)):
    user = authenticate_client(db, payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Невірний email або пароль")

    _set_client_cookie(response, user.id)
    return ClientSession(id=user.id, email=user.email, phone=user.phone)


@router.post("/auth/logout")
def logout(response: Response):
    response.delete_cookie(key=settings.client_cookie_name, path="/")
    return {"status": "ok"}


@router.get("/auth/me", response_model=ClientSession)
def me(user: User = Depends(get_current_client_user)):
    return ClientSession(id=user.id, email=user.email, phone=user.phone)
