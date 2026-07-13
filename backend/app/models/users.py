from datetime import datetime

from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import DeliveryMethod, UserRole
from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String, unique=True)
    password_hash: Mapped[str] = mapped_column(String)
    role: Mapped[UserRole] = mapped_column()
    phone: Mapped[str | None] = mapped_column(String, nullable=True)
    two_factor_enabled: Mapped[bool] = mapped_column(default=False)
    totp_secret: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)


class WishlistItem(Base):
    __tablename__ = "wishlist_items"
    __table_args__ = (UniqueConstraint("user_id", "product_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))


class SavedAddress(Base):
    __tablename__ = "saved_addresses"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    recipient_first_name: Mapped[str] = mapped_column(String)
    recipient_last_name: Mapped[str] = mapped_column(String)
    city: Mapped[str] = mapped_column(String)
    delivery_method: Mapped[DeliveryMethod] = mapped_column()
    np_office: Mapped[str | None] = mapped_column(String, nullable=True)
    is_default: Mapped[bool] = mapped_column(default=False)
