from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator

from app.core.constants import ContactMethod, DeliveryMethod, OrderStatus


class WishlistItemOut(BaseModel):
    product_id: int
    slug: str
    name: str
    price: float
    old_price: float | None
    main_image: str | None


class WishlistAddRequest(BaseModel):
    product_id: int


class AddressOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    recipient_first_name: str
    recipient_last_name: str
    city: str
    delivery_method: DeliveryMethod
    np_office: str | None
    is_default: bool


class AddressInput(BaseModel):
    recipient_first_name: str
    recipient_last_name: str
    city: str
    delivery_method: DeliveryMethod
    np_office: str | None = None
    is_default: bool = False

    @field_validator("recipient_first_name", "recipient_last_name", "city")
    @classmethod
    def not_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Поле обов'язкове")
        return value


class AccountOrderListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: OrderStatus
    total: float
    created_at: datetime


class AccountOrderListResponse(BaseModel):
    items: list[AccountOrderListItem]
    total: int
    page: int
    page_size: int
    pages: int


class AccountOrderItemOut(BaseModel):
    id: int
    product_id: int
    product_name: str
    quantity: int
    price_at_order: float


class AccountOrderDetail(BaseModel):
    id: int
    first_name: str
    last_name: str
    phone: str
    city: str
    delivery_method: DeliveryMethod
    np_office: str | None
    contact_method: ContactMethod
    comment: str | None
    status: OrderStatus
    promo_code: str | None
    items_total: float
    discount_amount: float
    total: float
    created_at: datetime
    items: list[AccountOrderItemOut]
