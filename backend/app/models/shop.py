from datetime import date

from sqlalchemy import Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.constants import DiscountType
from app.models.base import Base


class PromoCode(Base):
    __tablename__ = "promo_codes"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String, unique=True)
    discount_type: Mapped[DiscountType] = mapped_column()
    discount_value: Mapped[float] = mapped_column(Numeric(10, 2))
    expires_at: Mapped[date | None] = mapped_column(nullable=True)
    usage_limit: Mapped[int | None] = mapped_column(nullable=True)
    usage_count: Mapped[int] = mapped_column(default=0)
    is_active: Mapped[bool] = mapped_column(default=True)


class Setting(Base):
    __tablename__ = "settings"

    key: Mapped[str] = mapped_column(String, primary_key=True)
    value: Mapped[str] = mapped_column(Text)
