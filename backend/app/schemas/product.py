from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.core.constants import Gender


class ProductImageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    url: str
    position: int


class ProductListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    name: str
    description: str | None
    price: float
    old_price: float | None
    brand: str
    main_image: str | None


class ProductSitemapItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    slug: str


class ProductListResponse(BaseModel):
    items: list[ProductListItem]
    total: int
    page: int
    page_size: int
    pages: int


class AttributeValueOut(BaseModel):
    attribute_type: str
    value: str


class ProductDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    name: str
    description: str | None
    price: float
    old_price: float | None
    sku: str
    category_id: int
    category: str
    brand: str
    mechanism_type: str
    gender: Gender
    case_diameter_mm: int | None
    case_thickness_mm: int | None
    warranty_months: int | None
    package_contents: str | None
    is_active: bool
    created_at: datetime
    images: list[ProductImageOut]
    attributes: list[AttributeValueOut]
