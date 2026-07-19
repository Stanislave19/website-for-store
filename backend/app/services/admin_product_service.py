import math

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.core.slug import make_unique_slug, slugify
from app.models.attributes import ProductAttribute
from app.models.catalog import Brand, Category, MechanismType, Product
from app.models.orders import OrderItem
from app.schemas.admin_product import ProductCreateRequest, ProductUpdateRequest


class ProductNotFoundError(Exception):
    pass


class ReferenceNotFoundError(Exception):
    def __init__(self, field: str):
        self.field = field
        super().__init__(f"Значення для поля {field} не знайдено")


class SkuAlreadyExistsError(Exception):
    def __init__(self, sku: str):
        self.sku = sku
        super().__init__(f"Артикул {sku} вже використовується")


class ProductHasOrdersError(Exception):
    def __init__(self, product_id: int):
        self.product_id = product_id
        super().__init__("Товар вже фігурує в заявках — видалення заборонено, деактивуйте його замість цього")


def _validate_references(db: Session, category_id: int, brand_id: int, mechanism_type_id: int) -> None:
    if not db.get(Category, category_id):
        raise ReferenceNotFoundError("category_id")
    if not db.get(Brand, brand_id):
        raise ReferenceNotFoundError("brand_id")
    if not db.get(MechanismType, mechanism_type_id):
        raise ReferenceNotFoundError("mechanism_type_id")


def list_admin_products(
    db: Session, *, search: str | None = None, page: int = 1, page_size: int = 24
) -> tuple[list[Product], int]:
    query = select(Product)
    if search:
        pattern = f"%{search}%"
        query = query.where(Product.name.ilike(pattern) | Product.sku.ilike(pattern))

    total = db.execute(select(func.count()).select_from(query.subquery())).scalar_one()

    query = query.options(selectinload(Product.images), selectinload(Product.brand))
    query = query.order_by(Product.created_at.desc()).offset((page - 1) * page_size).limit(page_size)

    items = db.execute(query).scalars().all()
    return items, total


def admin_products_pages(total: int, page_size: int) -> int:
    return math.ceil(total / page_size) if page_size else 0


def get_admin_product(db: Session, product_id: int) -> Product:
    product = db.execute(
        select(Product).where(Product.id == product_id).options(selectinload(Product.images))
    ).scalar_one_or_none()
    if product is None:
        raise ProductNotFoundError()
    return product


def create_product(db: Session, payload: ProductCreateRequest) -> Product:
    _validate_references(db, payload.category_id, payload.brand_id, payload.mechanism_type_id)

    if db.scalar(select(Product).where(Product.sku == payload.sku)):
        raise SkuAlreadyExistsError(payload.sku)

    base_slug = slugify(f"{payload.name} {payload.sku}")
    slug = make_unique_slug(
        base_slug, lambda candidate: db.scalar(select(Product).where(Product.slug == candidate)) is not None
    )

    product = Product(
        name=payload.name,
        slug=slug,
        description=payload.description,
        price=payload.price,
        old_price=payload.old_price,
        sku=payload.sku,
        category_id=payload.category_id,
        brand_id=payload.brand_id,
        mechanism_type_id=payload.mechanism_type_id,
        gender=payload.gender,
        case_diameter_mm=payload.case_diameter_mm,
        warranty_months=payload.warranty_months,
        package_contents=payload.package_contents,
        is_active=payload.is_active,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update_product(db: Session, product_id: int, payload: ProductUpdateRequest) -> Product:
    product = get_admin_product(db, product_id)

    update_data = payload.model_dump(exclude_unset=True)

    category_id = update_data.get("category_id", product.category_id)
    brand_id = update_data.get("brand_id", product.brand_id)
    mechanism_type_id = update_data.get("mechanism_type_id", product.mechanism_type_id)
    if any(field in update_data for field in ("category_id", "brand_id", "mechanism_type_id")):
        _validate_references(db, category_id, brand_id, mechanism_type_id)

    if "sku" in update_data and update_data["sku"] != product.sku:
        if db.scalar(select(Product).where(Product.sku == update_data["sku"])):
            raise SkuAlreadyExistsError(update_data["sku"])

    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: int) -> None:
    product = get_admin_product(db, product_id)

    has_orders = db.scalar(select(OrderItem).where(OrderItem.product_id == product_id)) is not None
    if has_orders:
        raise ProductHasOrdersError(product_id)

    for image in list(product.images):
        db.delete(image)

    for product_attribute in db.execute(
        select(ProductAttribute).where(ProductAttribute.product_id == product_id)
    ).scalars():
        db.delete(product_attribute)

    db.delete(product)
    db.commit()
