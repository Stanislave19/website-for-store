from datetime import date

from pydantic import BaseModel, ConfigDict

from app.core.constants import DiscountType


class AdminPromoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    discount_type: DiscountType
    discount_value: float
    expires_at: date | None
    usage_limit: int | None
    usage_count: int
    is_active: bool


class PromoCreateRequest(BaseModel):
    code: str
    discount_type: DiscountType
    discount_value: float
    expires_at: date | None = None
    usage_limit: int | None = None
    is_active: bool = True


class PromoUpdateRequest(BaseModel):
    code: str | None = None
    discount_type: DiscountType | None = None
    discount_value: float | None = None
    expires_at: date | None = None
    usage_limit: int | None = None
    is_active: bool | None = None
