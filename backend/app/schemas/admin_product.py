from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.core.constants import Gender


class AdminProductListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    name: str
    sku: str
    price: float
    is_active: bool
    brand: str
    main_image: str | None


class AdminProductListResponse(BaseModel):
    items: list[AdminProductListItem]
    total: int
    page: int
    page_size: int
    pages: int


class AdminProductImageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    url: str
    position: int


class AdminProductDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    name: str
    description: str | None
    price: float
    old_price: float | None
    sku: str
    category_id: int
    brand_id: int
    mechanism_type_id: int
    gender: Gender
    case_diameter_mm: int | None
    warranty_months: int | None
    package_contents: str | None
    is_active: bool
    created_at: datetime
    images: list[AdminProductImageOut]


class ProductCreateRequest(BaseModel):
    name: str
    description: str | None = None
    price: float
    old_price: float | None = None
    sku: str
    category_id: int
    brand_id: int
    mechanism_type_id: int
    gender: Gender
    case_diameter_mm: int | None = None
    warranty_months: int | None = None
    package_contents: str | None = None
    is_active: bool = True


class ProductUpdateRequest(BaseModel):
    name: str | None = None
    description: str | None = None
    price: float | None = None
    old_price: float | None = None
    sku: str | None = None
    category_id: int | None = None
    brand_id: int | None = None
    mechanism_type_id: int | None = None
    gender: Gender | None = None
    case_diameter_mm: int | None = None
    warranty_months: int | None = None
    package_contents: str | None = None
    is_active: bool | None = None
