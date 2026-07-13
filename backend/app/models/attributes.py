from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class AttributeType(Base):
    __tablename__ = "attribute_types"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String, unique=True)

    values: Mapped[list["AttributeValue"]] = relationship(back_populates="attribute_type")


class AttributeValue(Base):
    __tablename__ = "attribute_values"
    __table_args__ = (UniqueConstraint("attribute_type_id", "value"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    attribute_type_id: Mapped[int] = mapped_column(ForeignKey("attribute_types.id"))
    value: Mapped[str] = mapped_column(String)

    attribute_type: Mapped["AttributeType"] = relationship(back_populates="values")


class ProductAttribute(Base):
    __tablename__ = "product_attributes"

    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), primary_key=True)
    attribute_value_id: Mapped[int] = mapped_column(ForeignKey("attribute_values.id"), primary_key=True)
