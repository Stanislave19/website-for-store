from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.catalog import Product
from app.models.orders import Order, OrderItem
from app.models.shop import PromoCode
from app.schemas.order import OrderCreateRequest
from app.services.promo_service import validate_promo


class ProductNotFoundError(Exception):
    def __init__(self, product_ids: list[int]):
        self.product_ids = product_ids
        super().__init__(f"Товари не знайдено або неактивні: {product_ids}")


class PromoInvalidError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


def create_order(db: Session, payload: OrderCreateRequest) -> tuple[Order, str | None]:
    requested_ids = [item.product_id for item in payload.items]

    products = db.execute(
        select(Product).where(Product.id.in_(requested_ids), Product.is_active.is_(True))
    ).scalars().all()
    products_by_id = {product.id: product for product in products}

    missing_ids = [pid for pid in requested_ids if pid not in products_by_id]
    if missing_ids:
        raise ProductNotFoundError(missing_ids)

    items_total = sum(
        float(products_by_id[item.product_id].price) * item.quantity for item in payload.items
    )

    discount_amount = 0.0
    promo: PromoCode | None = None
    if payload.promo_code:
        result = validate_promo(db, payload.promo_code, items_total)
        if not result.valid:
            raise PromoInvalidError(result.error or "Промокод недійсний")
        discount_amount = result.discount_amount
        promo = db.scalar(
            select(PromoCode).where(func.lower(PromoCode.code) == payload.promo_code.strip().lower())
        )

    total = round(items_total - discount_amount, 2)

    order = Order(
        user_id=payload.user_id,
        first_name=payload.first_name,
        last_name=payload.last_name,
        phone=payload.phone,
        city=(payload.city or "").strip(),
        delivery_method=payload.delivery_method,
        np_office=payload.np_office,
        contact_method=payload.contact_method,
        comment=payload.comment,
        promo_code_id=promo.id if promo else None,
        items_total=round(items_total, 2),
        discount_amount=round(discount_amount, 2),
        total=total,
    )
    db.add(order)
    db.flush()

    for item in payload.items:
        product = products_by_id[item.product_id]
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=item.quantity,
                price_at_order=product.price,
            )
        )

    if promo:
        promo.usage_count += 1

    db.commit()
    db.refresh(order)
    return order, (promo.code if promo else None)


def get_order_notification_items(db: Session, order_id: int) -> list[tuple[str, str, float, int]]:
    rows = db.execute(
        select(Product.name, Product.sku, OrderItem.price_at_order, OrderItem.quantity)
        .join(OrderItem, OrderItem.product_id == Product.id)
        .where(OrderItem.order_id == order_id)
    ).all()
    return [(name, sku, float(price), quantity) for name, sku, price, quantity in rows]
