from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.constants import OrderStatus
from app.core.deps import get_current_staff_user
from app.database import get_db
from app.schemas.admin_order import AdminOrderDetail, AdminOrderListItem, AdminOrderListResponse, OrderStatusUpdateRequest
from app.services.admin_order_service import (
    InvalidStatusTransitionError,
    OrderNotFoundError,
    admin_orders_pages,
    get_admin_order,
    list_admin_orders,
    to_admin_order_detail,
    update_order_status,
)

router = APIRouter(dependencies=[Depends(get_current_staff_user)])


@router.get("/admin/orders", response_model=AdminOrderListResponse)
def read_admin_orders(
    status: OrderStatus | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=24, ge=1, le=100),
    db: Session = Depends(get_db),
):
    items, total = list_admin_orders(db, status=status, page=page, page_size=page_size)
    return AdminOrderListResponse(
        items=[AdminOrderListItem.model_validate(order) for order in items],
        total=total,
        page=page,
        page_size=page_size,
        pages=admin_orders_pages(total, page_size),
    )


@router.get("/admin/orders/{order_id}", response_model=AdminOrderDetail)
def read_admin_order(order_id: int, db: Session = Depends(get_db)):
    try:
        order = get_admin_order(db, order_id)
    except OrderNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Замовлення не знайдено") from exc
    return to_admin_order_detail(db, order)


@router.patch("/admin/orders/{order_id}", response_model=AdminOrderDetail)
def update_admin_order_status(order_id: int, payload: OrderStatusUpdateRequest, db: Session = Depends(get_db)):
    try:
        order = update_order_status(db, order_id, payload.status)
    except OrderNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Замовлення не знайдено") from exc
    except InvalidStatusTransitionError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return to_admin_order_detail(db, order)
