from collections import defaultdict

from sqlalchemy import exists, func, select
from sqlalchemy.orm import Session, selectinload

from app.models.attributes import AttributeValue, ProductAttribute
from app.models.catalog import Brand, Category, MechanismType, Product


def get_descendant_category_ids(db: Session, category_id: int) -> list[int]:
    """Категорія + усі її підкатегорії (рекурсивно), для фільтра за батьківською категорією."""
    rows = db.execute(select(Category.id, Category.parent_id)).all()
    children_map: dict[int | None, list[int]] = defaultdict(list)
    for cat_id, parent_id in rows:
        children_map[parent_id].append(cat_id)

    result = [category_id]
    queue = [category_id]
    while queue:
        current = queue.pop()
        for child_id in children_map.get(current, []):
            result.append(child_id)
            queue.append(child_id)
    return result


def _apply_attribute_filters(query, attribute_value_ids: list[int], db: Session):
    if not attribute_value_ids:
        return query

    values = db.execute(
        select(AttributeValue.id, AttributeValue.attribute_type_id).where(
            AttributeValue.id.in_(attribute_value_ids)
        )
    ).all()

    groups: dict[int, list[int]] = defaultdict(list)
    for value_id, attribute_type_id in values:
        groups[attribute_type_id].append(value_id)

    for value_ids in groups.values():
        query = query.where(
            exists().where(
                (ProductAttribute.product_id == Product.id)
                & (ProductAttribute.attribute_value_id.in_(value_ids))
            )
        )
    return query


def list_products(
    db: Session,
    *,
    category_id: int | None = None,
    brand_id: int | None = None,
    gender: str | None = None,
    mechanism_type_id: int | None = None,
    price_min: float | None = None,
    price_max: float | None = None,
    diameter_min: float | None = None,
    diameter_max: float | None = None,
    thickness_min: float | None = None,
    thickness_max: float | None = None,
    attribute_value_ids: list[int] | None = None,
    search: str | None = None,
    on_sale: bool = False,
    sort: str = "newest",
    page: int = 1,
    page_size: int = 24,
) -> tuple[list[Product], int]:
    query = select(Product).where(Product.is_active.is_(True))

    if on_sale:
        query = query.where(Product.old_price.is_not(None))

    if category_id is not None:
        category_ids = get_descendant_category_ids(db, category_id)
        query = query.where(Product.category_id.in_(category_ids))
    if brand_id is not None:
        query = query.where(Product.brand_id == brand_id)
    if gender is not None:
        query = query.where(Product.gender == gender)
    if mechanism_type_id is not None:
        query = query.where(Product.mechanism_type_id == mechanism_type_id)
    if price_min is not None:
        query = query.where(Product.price >= price_min)
    if price_max is not None:
        query = query.where(Product.price <= price_max)
    if diameter_min is not None:
        query = query.where(Product.case_diameter_mm >= diameter_min)
    if diameter_max is not None:
        query = query.where(Product.case_diameter_mm <= diameter_max)
    if thickness_min is not None:
        query = query.where(Product.case_thickness_mm >= thickness_min)
    if thickness_max is not None:
        query = query.where(Product.case_thickness_mm <= thickness_max)
    if search:
        pattern = f"%{search}%"
        query = query.join(Brand).where(
            Product.name.ilike(pattern) | Brand.name.ilike(pattern)
        )

    query = _apply_attribute_filters(query, attribute_value_ids or [], db)

    total = db.execute(select(func.count()).select_from(query.subquery())).scalar_one()

    if sort == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort == "price_desc":
        query = query.order_by(Product.price.desc())
    else:
        query = query.order_by(Product.created_at.desc())

    query = query.options(selectinload(Product.images), selectinload(Product.brand))
    query = query.offset((page - 1) * page_size).limit(page_size)

    items = db.execute(query).scalars().all()
    return items, total


def list_active_product_slugs(db: Session) -> list[Product]:
    return db.execute(
        select(Product).where(Product.is_active.is_(True)).order_by(Product.id)
    ).scalars().all()


def get_product_by_slug(db: Session, slug: str) -> Product | None:
    query = (
        select(Product)
        .where(Product.slug == slug)
        .options(
            selectinload(Product.images),
            selectinload(Product.brand),
            selectinload(Product.category),
            selectinload(Product.mechanism_type),
        )
    )
    return db.execute(query).scalar_one_or_none()


def get_product_attributes(db: Session, product_id: int) -> list[tuple[str, str]]:
    rows = db.execute(
        select(AttributeValue)
        .join(ProductAttribute, ProductAttribute.attribute_value_id == AttributeValue.id)
        .where(ProductAttribute.product_id == product_id)
        .options(selectinload(AttributeValue.attribute_type))
    ).scalars().all()
    return [(row.attribute_type.name, row.value) for row in rows]
