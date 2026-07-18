from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.order import OrderCreateRequest, OrderCreateResponse
from app.services.order_service import (
    ProductNotFoundError,
    PromoInvalidError,
    create_order,
)

router = APIRouter()


@router.post("/orders", response_model=OrderCreateResponse, status_code=201)
def create_order_endpoint(payload: OrderCreateRequest, db: Session = Depends(get_db)):
    try:
        order = create_order(db, payload)
    except ProductNotFoundError as exc:
        raise HTTPException(status_code=404, detail=f"Товари не знайдено або неактивні: {exc.product_ids}")
    except PromoInvalidError as exc:
        raise HTTPException(status_code=422, detail={"promo_error": exc.message})

    return OrderCreateResponse(
        order_id=order.id,
        items_total=float(order.items_total),
        discount_amount=float(order.discount_amount),
        total=float(order.total),
    )
