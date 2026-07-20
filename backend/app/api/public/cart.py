from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.rate_limit import make_rate_limiter
from app.database import get_db
from app.schemas.cart import PromoValidateRequest, PromoValidateResponse
from app.services.promo_service import validate_promo

router = APIRouter()

# Без ліміту цей ендпоінт можна було б використати для перебору промокодів
# брутфорсом (короткий рядок, передбачуваний алфавіт) — той самий захист,
# що на /orders.
rate_limit = make_rate_limiter(
    max_requests=5, window_seconds=60, message="Забагато спроб. Спробуйте пізніше."
)


@router.post(
    "/cart/validate-promo",
    response_model=PromoValidateResponse,
    dependencies=[Depends(rate_limit)],
)
def validate_promo_code(payload: PromoValidateRequest, db: Session = Depends(get_db)):
    return validate_promo(db, payload.code, payload.cart_total)
