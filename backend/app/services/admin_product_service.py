import math
import os
import uuid
from pathlib import Path

from fastapi import UploadFile
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.config import settings
from app.core.slug import make_unique_slug, slugify
from app.models.attributes import AttributeValue, ProductAttribute
from app.models.catalog import Brand, Category, MechanismType, Product, ProductImage
from app.models.orders import OrderItem
from app.schemas.admin_product import AdminProductDetail, ProductCreateRequest, ProductUpdateRequest

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


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


class InvalidImageError(Exception):
    def __init__(self, message: str):
        super().__init__(message)


class ImageNotFoundError(Exception):
    pass


def _validate_references(db: Session, category_id: int, brand_id: int, mechanism_type_id: int) -> None:
    if not db.get(Category, category_id):
        raise ReferenceNotFoundError("category_id")
    if not db.get(Brand, brand_id):
        raise ReferenceNotFoundError("brand_id")
    if not db.get(MechanismType, mechanism_type_id):
        raise ReferenceNotFoundError("mechanism_type_id")


def _validate_attribute_value_ids(db: Session, attribute_value_ids: list[int]) -> None:
    if not attribute_value_ids:
        return
    found = db.execute(
        select(AttributeValue.id).where(AttributeValue.id.in_(attribute_value_ids))
    ).scalars().all()
    if set(found) != set(attribute_value_ids):
        raise ReferenceNotFoundError("attribute_value_ids")


def _set_product_attributes(db: Session, product_id: int, attribute_value_ids: list[int]) -> None:
    db.query(ProductAttribute).filter(ProductAttribute.product_id == product_id).delete()
    for attribute_value_id in attribute_value_ids:
        db.add(ProductAttribute(product_id=product_id, attribute_value_id=attribute_value_id))


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


def get_product_by_sku(db: Session, sku: str) -> Product | None:
    return db.scalar(select(Product).where(Product.sku == sku).options(selectinload(Product.images)))


def get_admin_product(db: Session, product_id: int) -> Product:
    product = db.execute(
        select(Product).where(Product.id == product_id).options(selectinload(Product.images))
    ).scalar_one_or_none()
    if product is None:
        raise ProductNotFoundError()
    return product


def get_product_attribute_value_ids(db: Session, product_id: int) -> list[int]:
    return list(
        db.execute(
            select(ProductAttribute.attribute_value_id).where(ProductAttribute.product_id == product_id)
        ).scalars()
    )


def to_admin_product_detail(db: Session, product: Product) -> AdminProductDetail:
    return AdminProductDetail(
        id=product.id,
        slug=product.slug,
        name=product.name,
        description=product.description,
        price=float(product.price),
        old_price=float(product.old_price) if product.old_price is not None else None,
        sku=product.sku,
        category_id=product.category_id,
        brand_id=product.brand_id,
        mechanism_type_id=product.mechanism_type_id,
        gender=product.gender,
        case_diameter_mm=product.case_diameter_mm,
        case_thickness_mm=product.case_thickness_mm,
        warranty_months=product.warranty_months,
        package_contents=product.package_contents,
        is_active=product.is_active,
        created_at=product.created_at,
        images=list(product.images),
        attribute_value_ids=get_product_attribute_value_ids(db, product.id),
    )


def create_product(db: Session, payload: ProductCreateRequest) -> Product:
    _validate_references(db, payload.category_id, payload.brand_id, payload.mechanism_type_id)
    _validate_attribute_value_ids(db, payload.attribute_value_ids)

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
        case_thickness_mm=payload.case_thickness_mm,
        warranty_months=payload.warranty_months,
        package_contents=payload.package_contents,
        is_active=payload.is_active,
    )
    db.add(product)
    db.flush()

    _set_product_attributes(db, product.id, payload.attribute_value_ids)

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

    attribute_value_ids = update_data.pop("attribute_value_ids", None)
    if attribute_value_ids is not None:
        _validate_attribute_value_ids(db, attribute_value_ids)

    for field, value in update_data.items():
        setattr(product, field, value)

    if attribute_value_ids is not None:
        _set_product_attributes(db, product.id, attribute_value_ids)

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


def add_product_image_from_bytes(db: Session, product: Product, extension: str, content: bytes) -> ProductImage:
    filename = f"{product.slug}-{uuid.uuid4().hex[:8]}{extension}"
    media_dir = Path(settings.media_dir)
    media_dir.mkdir(parents=True, exist_ok=True)

    with open(media_dir / filename, "wb") as out_file:
        out_file.write(content)

    next_position = len(product.images)
    image = ProductImage(product_id=product.id, url=f"/media/{filename}", position=next_position)
    db.add(image)
    db.commit()
    db.refresh(image)
    return image


async def add_product_image(db: Session, product_id: int, file: UploadFile) -> ProductImage:
    product = get_admin_product(db, product_id)

    extension = Path(file.filename or "").suffix.lower()
    if extension not in ALLOWED_IMAGE_EXTENSIONS:
        raise InvalidImageError(
            f"Непідтримуваний формат файлу. Дозволено: {', '.join(sorted(ALLOWED_IMAGE_EXTENSIONS))}"
        )
    if file.content_type and not file.content_type.startswith("image/"):
        raise InvalidImageError("Файл не є зображенням")

    contents = await file.read()
    return add_product_image_from_bytes(db, product, extension, contents)


def delete_product_image(db: Session, product_id: int, image_id: int) -> None:
    image = db.scalar(
        select(ProductImage).where(ProductImage.id == image_id, ProductImage.product_id == product_id)
    )
    if image is None:
        raise ImageNotFoundError()

    file_path = Path(settings.media_dir) / os.path.basename(image.url)
    if file_path.exists():
        file_path.unlink()

    db.delete(image)
    db.commit()
