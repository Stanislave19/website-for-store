import math

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.core.constants import OrderStatus
from app.models.catalog import Product
from app.models.orders import Order
from app.models.shop import PromoCode
from app.schemas.admin_order import AdminOrderDetail, AdminOrderItemOut

# Термінальні статуси: назад із них у робочий статус — заборонено.
# У проді сюди додасться OrderStatus.refunded (кошти вже повернуто клієнту).
TERMINAL_STATUSES = {OrderStatus.cancelled}


class OrderNotFoundError(Exception):
    pass


class InvalidStatusTransitionError(Exception):
    def __init__(self, from_status: OrderStatus, to_status: OrderStatus):
        self.from_status = from_status
        self.to_status = to_status
        super().__init__("Не можна повернути скасоване замовлення в роботу")


def list_admin_orders(
    db: Session, *, status: OrderStatus | None = None, page: int = 1, page_size: int = 24
) -> tuple[list[Order], int]:
    query = select(Order)
    if status is not None:
        query = query.where(Order.status == status)

    total = db.execute(select(func.count()).select_from(query.subquery())).scalar_one()

    query = query.order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    items = db.execute(query).scalars().all()
    return items, total


def admin_orders_pages(total: int, page_size: int) -> int:
    return math.ceil(total / page_size) if page_size else 0


def get_admin_order(db: Session, order_id: int) -> Order:
    order = db.execute(
        select(Order).where(Order.id == order_id).options(selectinload(Order.items))
    ).scalar_one_or_none()
    if order is None:
        raise OrderNotFoundError()
    return order


def to_admin_order_detail(db: Session, order: Order) -> AdminOrderDetail:
    product_ids = [item.product_id for item in order.items]
    product_names: dict[int, str] = {}
    if product_ids:
        product_names = dict(
            db.execute(select(Product.id, Product.name).where(Product.id.in_(product_ids))).all()
        )

    promo_code = None
    if order.promo_code_id:
        promo_code = db.scalar(select(PromoCode.code).where(PromoCode.id == order.promo_code_id))

    return AdminOrderDetail(
        id=order.id,
        user_id=order.user_id,
        first_name=order.first_name,
        last_name=order.last_name,
        phone=order.phone,
        city=order.city,
        city_ref=order.city_ref,
        delivery_method=order.delivery_method,
        np_office=order.np_office,
        warehouse_ref=order.warehouse_ref,
        contact_method=order.contact_method,
        comment=order.comment,
        status=order.status,
        promo_code_id=order.promo_code_id,
        promo_code=promo_code,
        items_total=float(order.items_total),
        discount_amount=float(order.discount_amount),
        total=float(order.total),
        created_at=order.created_at,
        items=[
            AdminOrderItemOut(
                id=item.id,
                product_id=item.product_id,
                product_name=product_names.get(item.product_id, "—"),
                quantity=item.quantity,
                price_at_order=float(item.price_at_order),
            )
            for item in order.items
        ],
    )


def update_order_status(db: Session, order_id: int, new_status: OrderStatus) -> Order:
    order = get_admin_order(db, order_id)
    if order.status in TERMINAL_STATUSES and new_status != order.status:
        raise InvalidStatusTransitionError(order.status, new_status)
    order.status = new_status
    db.commit()
    db.refresh(order)
    return order
