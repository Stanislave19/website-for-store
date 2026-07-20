from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.shop import PromoCode
from app.schemas.admin_promo import PromoCreateRequest, PromoUpdateRequest


class PromoNotFoundError(Exception):
    pass


class PromoCodeAlreadyExistsError(Exception):
    def __init__(self, code: str):
        self.code = code
        super().__init__(f"Промокод {code} вже існує")


class PromoInUseError(Exception):
    def __init__(self):
        super().__init__(
            "Промокод вже використано в замовленнях — видалення заборонено, деактивуйте його замість цього"
        )


def list_admin_promos(db: Session) -> list[PromoCode]:
    return db.execute(select(PromoCode).order_by(PromoCode.id.desc())).scalars().all()


def get_admin_promo(db: Session, promo_id: int) -> PromoCode:
    promo = db.get(PromoCode, promo_id)
    if promo is None:
        raise PromoNotFoundError()
    return promo


def _find_by_code(db: Session, code: str) -> PromoCode | None:
    return db.scalar(select(PromoCode).where(func.lower(PromoCode.code) == code.lower()))


def create_promo(db: Session, payload: PromoCreateRequest) -> PromoCode:
    code = payload.code.strip().upper()
    if _find_by_code(db, code):
        raise PromoCodeAlreadyExistsError(code)

    promo = PromoCode(
        code=code,
        discount_type=payload.discount_type,
        discount_value=payload.discount_value,
        expires_at=payload.expires_at,
        usage_limit=payload.usage_limit,
        is_active=payload.is_active,
    )
    db.add(promo)
    db.commit()
    db.refresh(promo)
    return promo


def update_promo(db: Session, promo_id: int, payload: PromoUpdateRequest) -> PromoCode:
    promo = get_admin_promo(db, promo_id)
    update_data = payload.model_dump(exclude_unset=True)

    if "code" in update_data and update_data["code"] is not None:
        new_code = update_data["code"].strip().upper()
        existing = _find_by_code(db, new_code)
        if existing is not None and existing.id != promo.id:
            raise PromoCodeAlreadyExistsError(new_code)
        update_data["code"] = new_code

    for field, value in update_data.items():
        setattr(promo, field, value)

    db.commit()
    db.refresh(promo)
    return promo


def delete_promo(db: Session, promo_id: int) -> None:
    promo = get_admin_promo(db, promo_id)
    if promo.usage_count > 0:
        raise PromoInUseError()
    db.delete(promo)
    db.commit()
