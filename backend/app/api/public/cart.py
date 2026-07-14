from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.cart import PromoValidateRequest, PromoValidateResponse
from app.services.promo_service import validate_promo

router = APIRouter()


@router.post("/cart/validate-promo", response_model=PromoValidateResponse)
def validate_promo_code(payload: PromoValidateRequest, db: Session = Depends(get_db)):
    return validate_promo(db, payload.code, payload.cart_total)
