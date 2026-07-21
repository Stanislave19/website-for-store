from datetime import datetime

from sqlalchemy import ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import Gender
from app.models.base import Base


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String)
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("categories.id"), nullable=True)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    children: Mapped[list["Category"]] = relationship(back_populates="parent")
    parent: Mapped["Category"] = relationship(back_populates="children", remote_side=[id])
    products: Mapped[list["Product"]] = relationship(back_populates="category")


class Brand(Base):
    __tablename__ = "brands"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String, unique=True)

    products: Mapped[list["Product"]] = relationship(back_populates="brand")


class MechanismType(Base):
    __tablename__ = "mechanism_types"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String, unique=True)

    products: Mapped[list["Product"]] = relationship(back_populates="mechanism_type")


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    price: Mapped[float] = mapped_column(Numeric(10, 2), index=True)
    old_price: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    sku: Mapped[str] = mapped_column(String, unique=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), index=True)
    brand_id: Mapped[int] = mapped_column(ForeignKey("brands.id"), index=True)
    mechanism_type_id: Mapped[int] = mapped_column(ForeignKey("mechanism_types.id"), index=True)
    gender: Mapped[Gender] = mapped_column()
    case_diameter_mm: Mapped[int | None] = mapped_column(nullable=True)
    case_thickness_mm: Mapped[int | None] = mapped_column(nullable=True)
    warranty_months: Mapped[int | None] = mapped_column(nullable=True)
    package_contents: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(default=True, index=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    category: Mapped["Category"] = relationship(back_populates="products")
    brand: Mapped["Brand"] = relationship(back_populates="products")
    mechanism_type: Mapped["MechanismType"] = relationship(back_populates="products")
    images: Mapped[list["ProductImage"]] = relationship(back_populates="product", order_by="ProductImage.position")


class ProductImage(Base):
    __tablename__ = "product_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    url: Mapped[str] = mapped_column(String)
    position: Mapped[int] = mapped_column(default=0)

    product: Mapped["Product"] = relationship(back_populates="images")
