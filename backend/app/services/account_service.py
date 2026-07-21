import math

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.core.constants import UserRole
from app.core.security import hash_password, verify_password
from app.models.catalog import Product
from app.models.orders import Order
from app.models.shop import PromoCode
from app.models.users import SavedAddress, User, WishlistItem
from app.schemas.account import AccountOrderDetail, AccountOrderItemOut, AddressInput, WishlistItemOut
from app.schemas.auth import ClientRegisterRequest


class EmailAlreadyRegisteredError(Exception):
    pass


class OrderNotFoundError(Exception):
    pass


class ProductNotFoundError(Exception):
    pass


class AddressNotFoundError(Exception):
    pass


def register_client(db: Session, payload: ClientRegisterRequest) -> User:
    existing = db.scalar(select(User).where(User.email == payload.email))
    if existing:
        raise EmailAlreadyRegisteredError()

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=UserRole.client,
        phone=payload.phone,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_client(db: Session, email: str, password: str) -> User | None:
    user = db.scalar(select(User).where(User.email == email.strip().lower(), User.role == UserRole.client))
    if not user or not verify_password(password, user.password_hash):
        return None
    return user


def list_account_orders(
    db: Session, user_id: int, *, page: int = 1, page_size: int = 24
) -> tuple[list[Order], int]:
    query = select(Order).where(Order.user_id == user_id)
    total = db.execute(select(func.count()).select_from(query.subquery())).scalar_one()
    query = query.order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    items = db.execute(query).scalars().all()
    return items, total


def account_orders_pages(total: int, page_size: int) -> int:
    return math.ceil(total / page_size) if page_size else 0


def get_account_order(db: Session, user_id: int, order_id: int) -> Order:
    order = db.execute(
        select(Order).where(Order.id == order_id).options(selectinload(Order.items))
    ).scalar_one_or_none()
    if order is None or order.user_id != user_id:
        raise OrderNotFoundError()
    return order


def to_account_order_detail(db: Session, order: Order) -> AccountOrderDetail:
    product_ids = [item.product_id for item in order.items]
    product_names: dict[int, str] = {}
    if product_ids:
        product_names = dict(
            db.execute(select(Product.id, Product.name).where(Product.id.in_(product_ids))).all()
        )

    promo_code = None
    if order.promo_code_id:
        promo_code = db.scalar(select(PromoCode.code).where(PromoCode.id == order.promo_code_id))

    return AccountOrderDetail(
        id=order.id,
        first_name=order.first_name,
        last_name=order.last_name,
        phone=order.phone,
        city=order.city,
        delivery_method=order.delivery_method,
        np_office=order.np_office,
        contact_method=order.contact_method,
        comment=order.comment,
        status=order.status,
        promo_code=promo_code,
        items_total=float(order.items_total),
        discount_amount=float(order.discount_amount),
        total=float(order.total),
        created_at=order.created_at,
        items=[
            AccountOrderItemOut(
                id=item.id,
                product_id=item.product_id,
                product_name=product_names.get(item.product_id, "—"),
                quantity=item.quantity,
                price_at_order=float(item.price_at_order),
            )
            for item in order.items
        ],
    )


def list_wishlist(db: Session, user_id: int) -> list[WishlistItemOut]:
    rows = db.execute(
        select(Product)
        .join(WishlistItem, WishlistItem.product_id == Product.id)
        .where(WishlistItem.user_id == user_id)
        .options(selectinload(Product.images))
    ).scalars().all()
    return [
        WishlistItemOut(
            product_id=product.id,
            slug=product.slug,
            name=product.name,
            price=float(product.price),
            old_price=float(product.old_price) if product.old_price is not None else None,
            main_image=product.images[0].url if product.images else None,
        )
        for product in rows
    ]


def add_wishlist_item(db: Session, user_id: int, product_id: int) -> None:
    product = db.scalar(select(Product).where(Product.id == product_id, Product.is_active.is_(True)))
    if product is None:
        raise ProductNotFoundError()

    existing = db.scalar(
        select(WishlistItem).where(WishlistItem.user_id == user_id, WishlistItem.product_id == product_id)
    )
    if existing:
        return

    db.add(WishlistItem(user_id=user_id, product_id=product_id))
    db.commit()


def remove_wishlist_item(db: Session, user_id: int, product_id: int) -> None:
    item = db.scalar(
        select(WishlistItem).where(WishlistItem.user_id == user_id, WishlistItem.product_id == product_id)
    )
    if item:
        db.delete(item)
        db.commit()


def list_addresses(db: Session, user_id: int) -> list[SavedAddress]:
    return list(
        db.execute(
            select(SavedAddress).where(SavedAddress.user_id == user_id).order_by(SavedAddress.id.desc())
        ).scalars()
    )


def create_address(db: Session, user_id: int, payload: AddressInput) -> SavedAddress:
    address = SavedAddress(
        user_id=user_id,
        recipient_first_name=payload.recipient_first_name,
        recipient_last_name=payload.recipient_last_name,
        city=payload.city,
        delivery_method=payload.delivery_method,
        np_office=payload.np_office,
        is_default=payload.is_default,
    )
    db.add(address)
    db.commit()
    db.refresh(address)
    return address


def delete_address(db: Session, user_id: int, address_id: int) -> None:
    address = db.scalar(
        select(SavedAddress).where(SavedAddress.id == address_id, SavedAddress.user_id == user_id)
    )
    if address is None:
        raise AddressNotFoundError()
    db.delete(address)
    db.commit()
