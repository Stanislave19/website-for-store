from datetime import date

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.constants import DiscountType
from app.models.shop import PromoCode
from app.schemas.cart import PromoValidateResponse


def validate_promo(db: Session, code: str, cart_total: float) -> PromoValidateResponse:
    promo = db.scalar(select(PromoCode).where(func.lower(PromoCode.code) == code.strip().lower()))

    if promo is None or not promo.is_active:
        return PromoValidateResponse(valid=False, total=cart_total, error="Промокод не знайдено")

    if promo.expires_at is not None and promo.expires_at < date.today():
        return PromoValidateResponse(valid=False, total=cart_total, error="Термін дії промокоду закінчився")

    if promo.usage_limit is not None and promo.usage_count >= promo.usage_limit:
        return PromoValidateResponse(valid=False, total=cart_total, error="Ліміт використань промокоду вичерпано")

    if promo.discount_type == DiscountType.percent:
        discount_amount = round(cart_total * float(promo.discount_value) / 100, 2)
    else:
        discount_amount = float(promo.discount_value)
    discount_amount = min(discount_amount, cart_total)

    return PromoValidateResponse(
        valid=True,
        discount_type=promo.discount_type,
        discount_value=float(promo.discount_value),
        discount_amount=discount_amount,
        total=round(cart_total - discount_amount, 2),
    )
