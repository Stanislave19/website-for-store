from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.core.constants import ContactMethod, DeliveryMethod, OrderStatus


class AdminOrderListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    first_name: str
    last_name: str
    phone: str
    status: OrderStatus
    total: float
    created_at: datetime


class AdminOrderListResponse(BaseModel):
    items: list[AdminOrderListItem]
    total: int
    page: int
    page_size: int
    pages: int


class AdminOrderItemOut(BaseModel):
    id: int
    product_id: int
    product_name: str
    quantity: int
    price_at_order: float


class AdminOrderDetail(BaseModel):
    id: int
    user_id: int | None
    first_name: str
    last_name: str
    phone: str
    city: str
    city_ref: str | None
    delivery_method: DeliveryMethod
    np_office: str | None
    warehouse_ref: str | None
    contact_method: ContactMethod
    comment: str | None
    status: OrderStatus
    promo_code_id: int | None
    promo_code: str | None
    items_total: float
    discount_amount: float
    total: float
    created_at: datetime
    items: list[AdminOrderItemOut]


class OrderStatusUpdateRequest(BaseModel):
    status: OrderStatus
