from pydantic import BaseModel

from app.core.constants import DiscountType


class PromoValidateRequest(BaseModel):
    code: str
    cart_total: float


class PromoValidateResponse(BaseModel):
    valid: bool
    discount_type: DiscountType | None = None
    discount_value: float | None = None
    discount_amount: float = 0
    total: float
    error: str | None = None
