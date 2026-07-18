import re

from pydantic import BaseModel, field_validator, model_validator

from app.core.constants import ContactMethod, DeliveryMethod

PHONE_PATTERN = re.compile(r"^\+380\d{9}$")


class OrderItemIn(BaseModel):
    product_id: int
    quantity: int

    @field_validator("quantity")
    @classmethod
    def quantity_positive(cls, value: int) -> int:
        if value < 1:
            raise ValueError("Кількість має бути не менше 1")
        return value


class OrderCreateRequest(BaseModel):
    items: list[OrderItemIn]
    first_name: str
    last_name: str
    phone: str
    delivery_method: DeliveryMethod
    city: str | None = None
    np_office: str | None = None
    contact_method: ContactMethod
    comment: str | None = None
    promo_code: str | None = None
    user_id: int | None = None

    @field_validator("items")
    @classmethod
    def items_not_empty(cls, value: list[OrderItemIn]) -> list[OrderItemIn]:
        if not value:
            raise ValueError("Кошик порожній")
        return value

    @field_validator("first_name", "last_name")
    @classmethod
    def name_not_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Поле обов'язкове")
        return value

    @field_validator("phone")
    @classmethod
    def phone_format(cls, value: str) -> str:
        if not PHONE_PATTERN.match(value.strip()):
            raise ValueError("Телефон має бути у форматі +380XXXXXXXXX")
        return value.strip()

    @model_validator(mode="after")
    def delivery_requires_city(self) -> "OrderCreateRequest":
        if self.delivery_method in (DeliveryMethod.nova_poshta, DeliveryMethod.ukrposhta):
            if not self.city or not self.city.strip():
                raise ValueError("Місто обов'язкове для цього способу доставки")
        if self.delivery_method == DeliveryMethod.nova_poshta:
            if not self.np_office or not self.np_office.strip():
                raise ValueError("Відділення обов'язкове для Нової Пошти")
        return self


class OrderCreateResponse(BaseModel):
    order_id: int
    items_total: float
    discount_amount: float
    total: float
