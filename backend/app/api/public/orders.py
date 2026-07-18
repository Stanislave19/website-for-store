import time
from collections import defaultdict

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from sqlalchemy.orm import Session

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

# Проста абонована захист від спаму заявок: не більше RATE_LIMIT_MAX запитів
# з одного IP за RATE_LIMIT_WINDOW_SECONDS. Зберігається в пам'яті процесу —
# для MVP з одним backend-контейнером цього достатньо. Якщо колись буде
# кілька інстансів backend, треба винести в Redis (спільний для всіх).
RATE_LIMIT_MAX = 5
RATE_LIMIT_WINDOW_SECONDS = 60
_request_log: dict[str, list[float]] = defaultdict(list)


def rate_limit(request: Request) -> None:
    ip = request.client.host if request.client else "unknown"
    now = time.monotonic()
    recent = [t for t in _request_log[ip] if now - t < RATE_LIMIT_WINDOW_SECONDS]
    if len(recent) >= RATE_LIMIT_MAX:
        raise HTTPException(status_code=429, detail="Забагато заявок. Спробуйте пізніше.")
    recent.append(now)
    _request_log[ip] = recent


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
        order = create_order(db, payload)
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
        items=notification_items,
    )
    background_tasks.add_task(send_order_notification, notification)

    return OrderCreateResponse(
        order_id=order.id,
        items_total=float(order.items_total),
        discount_amount=float(order.discount_amount),
        total=float(order.total),
    )
