import math

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.product import ProductDetail, ProductListItem, ProductListResponse, ProductSitemapItem
from app.services.product_service import (
    get_product_attributes,
    get_product_by_slug,
    list_active_product_slugs,
    list_products,
)

router = APIRouter()


@router.get("/products", response_model=ProductListResponse)
def read_products(
    category: int | None = None,
    brand: int | None = None,
    gender: str | None = None,
    mechanism: int | None = None,
    price_min: float | None = None,
    price_max: float | None = None,
    diameter_min: int | None = None,
    diameter_max: int | None = None,
    thickness_min: int | None = None,
    thickness_max: int | None = None,
    attribute_value_ids: list[int] = Query(default=[]),
    search: str | None = None,
    on_sale: bool = False,
    sort: str = "newest",
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=24, ge=1, le=100),
    db: Session = Depends(get_db),
):
    items, total = list_products(
        db,
        category_id=category,
        brand_id=brand,
        gender=gender,
        mechanism_type_id=mechanism,
        price_min=price_min,
        price_max=price_max,
        diameter_min=diameter_min,
        diameter_max=diameter_max,
        thickness_min=thickness_min,
        thickness_max=thickness_max,
        attribute_value_ids=attribute_value_ids,
        search=search,
        on_sale=on_sale,
        sort=sort,
        page=page,
        page_size=page_size,
    )

    result_items = [
        ProductListItem(
            id=product.id,
            slug=product.slug,
            name=product.name,
            description=product.description,
            price=float(product.price),
            old_price=float(product.old_price) if product.old_price is not None else None,
            brand=product.brand.name,
            main_image=product.images[0].url if product.images else None,
        )
        for product in items
    ]

    return ProductListResponse(
        items=result_items,
        total=total,
        page=page,
        page_size=page_size,
        pages=math.ceil(total / page_size) if page_size else 0,
    )


@router.get("/products/sitemap", response_model=list[ProductSitemapItem])
def read_products_sitemap(db: Session = Depends(get_db)):
    return list_active_product_slugs(db)


@router.get("/products/{slug}", response_model=ProductDetail)
def read_product(slug: str, db: Session = Depends(get_db)):
    product = get_product_by_slug(db, slug)
    if product is None:
        raise HTTPException(status_code=404, detail="Товар не знайдено")

    attributes = get_product_attributes(db, product.id)

    return ProductDetail(
        id=product.id,
        slug=product.slug,
        name=product.name,
        description=product.description,
        price=float(product.price),
        old_price=float(product.old_price) if product.old_price is not None else None,
        sku=product.sku,
        category_id=product.category_id,
        category=product.category.name,
        brand=product.brand.name,
        mechanism_type=product.mechanism_type.name,
        gender=product.gender,
        case_diameter_mm=product.case_diameter_mm,
        case_thickness_mm=product.case_thickness_mm,
        warranty_months=product.warranty_months,
        package_contents=product.package_contents,
        is_active=product.is_active,
        created_at=product.created_at,
        images=list(product.images),
        attributes=[{"attribute_type": t, "value": v} for t, v in attributes],
    )
