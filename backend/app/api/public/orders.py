from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.rate_limit import make_rate_limiter
from app.database import get_db
from app.schemas.order import OrderCreateRequest, OrderCreateResponse
from app.services.order_service import (
    ProductNotFoundError,
    PromoInvalidError,
    create_order,
    get_order_notification_items,
)
from app.services.telegram_service import (
    OrderNotificationData,
    OrderNotificationItem,
    send_order_notification,
)

router = APIRouter()

rate_limit = make_rate_limiter(
    max_requests=5, window_seconds=60, message="Забагато заявок. Спробуйте пізніше."
)


@router.post(
    "/orders",
    response_model=OrderCreateResponse,
    status_code=201,
    dependencies=[Depends(rate_limit)],
)
def create_order_endpoint(
    payload: OrderCreateRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    try:
        order, promo_code = create_order(db, payload)
    except ProductNotFoundError as exc:
        raise HTTPException(status_code=404, detail=f"Товари не знайдено або неактивні: {exc.product_ids}")
    except PromoInvalidError as exc:
        raise HTTPException(status_code=422, detail={"promo_error": exc.message})

    notification_items = [
        OrderNotificationItem(name=name, sku=sku, price=price, quantity=quantity)
        for name, sku, price, quantity in get_order_notification_items(db, order.id)
    ]
    notification = OrderNotificationData(
        order_id=order.id,
        first_name=order.first_name,
        last_name=order.last_name,
        phone=order.phone,
        city=order.city,
        delivery_method=order.delivery_method,
        np_office=order.np_office,
        contact_method=order.contact_method,
        comment=order.comment,
        items_total=float(order.items_total),
        discount_amount=float(order.discount_amount),
        total=float(order.total),
        promo_code=promo_code,
        items=notification_items,
    )
    background_tasks.add_task(send_order_notification, notification)

    return OrderCreateResponse(
        order_id=order.id,
        items_total=float(order.items_total),
        discount_amount=float(order.discount_amount),
        total=float(order.total),
    )
