from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.core.deps import get_current_staff_user
from app.core.rate_limit import make_rate_limiter
from app.core.security import create_access_token, verify_password
from app.database import get_db
from app.models.users import User
from app.schemas.auth import AdminLoginRequest, AdminLoginResponse

router = APIRouter()

rate_limit = make_rate_limiter(
    max_requests=5, window_seconds=60, message="Забагато спроб входу. Спробуйте пізніше."
)


@router.post("/admin/login", response_model=AdminLoginResponse, dependencies=[Depends(rate_limit)])
def admin_login(payload: AdminLoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == payload.email.strip().lower()))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Невірний email або пароль")

    token = create_access_token(user.id, user.role.value)
    response.set_cookie(
        key=settings.admin_cookie_name,
        value=token,
        httponly=True,
        secure=settings.admin_cookie_secure,
        samesite="lax",
        max_age=settings.admin_token_expire_minutes * 60,
        path="/",
    )
    return AdminLoginResponse(role=user.role)


@router.post("/admin/logout")
def admin_logout(response: Response):
    response.delete_cookie(key=settings.admin_cookie_name, path="/")
    return {"status": "ok"}


@router.get("/admin/me", response_model=AdminLoginResponse)
def admin_me(user: User = Depends(get_current_staff_user)):
    return AdminLoginResponse(role=user.role)
