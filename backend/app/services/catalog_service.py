from collections import defaultdict

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.attributes import AttributeType, AttributeValue, ProductAttribute
from app.models.catalog import Brand, Category, MechanismType, Product


def get_category_tree(db: Session) -> list[dict]:
    categories = db.execute(select(Category)).scalars().all()
    by_parent: dict[int | None, list[Category]] = defaultdict(list)
    for category in categories:
        by_parent[category.parent_id].append(category)

    def build(parent_id: int | None) -> list[dict]:
        return [
            {
                "id": category.id,
                "name": category.name,
                "slug": category.slug,
                "children": build(category.id),
            }
            for category in by_parent.get(parent_id, [])
        ]

    return build(None)


def _count_options(db: Session, id_column, name_column, model) -> list[tuple[str, int]]:
    rows = db.execute(
        select(name_column, func.count(Product.id))
        .select_from(Product)
        .join(model, id_column == model.id)
        .where(Product.is_active.is_(True))
        .group_by(name_column)
    ).all()
    return rows


def get_categorical_filters(db: Session) -> list[dict]:
    groups = []

    brand_rows = db.execute(
        select(Brand.id, Brand.name, func.count(Product.id))
        .join(Product, Product.brand_id == Brand.id)
        .where(Product.is_active.is_(True))
        .group_by(Brand.id, Brand.name)
    ).all()
    groups.append(
        {
            "key": "brand",
            "label": "Бренд",
            "options": [{"value": str(bid), "count": count} for bid, _, count in brand_rows],
        }
    )

    mechanism_rows = db.execute(
        select(MechanismType.id, MechanismType.name, func.count(Product.id))
        .join(Product, Product.mechanism_type_id == MechanismType.id)
        .where(Product.is_active.is_(True))
        .group_by(MechanismType.id, MechanismType.name)
    ).all()
    groups.append(
        {
            "key": "mechanism",
            "label": "Тип механізму",
            "options": [{"value": str(mid), "count": count} for mid, _, count in mechanism_rows],
        }
    )

    gender_rows = db.execute(
        select(Product.gender, func.count(Product.id))
        .where(Product.is_active.is_(True))
        .group_by(Product.gender)
    ).all()
    groups.append(
        {
            "key": "gender",
            "label": "Стать",
            "options": [{"value": gender.value, "count": count} for gender, count in gender_rows],
        }
    )

    attribute_type_rows = db.execute(select(AttributeType)).scalars().all()
    for attribute_type in attribute_type_rows:
        value_rows = db.execute(
            select(AttributeValue.id, func.count(Product.id))
            .join(ProductAttribute, ProductAttribute.attribute_value_id == AttributeValue.id)
            .join(Product, Product.id == ProductAttribute.product_id)
            .where(
                AttributeValue.attribute_type_id == attribute_type.id,
                Product.is_active.is_(True),
            )
            .group_by(AttributeValue.id)
        ).all()
        if value_rows:
            groups.append(
                {
                    "key": f"attr_{attribute_type.id}",
                    "label": attribute_type.name,
                    "options": [{"value": str(vid), "count": count} for vid, count in value_rows],
                }
            )

    return groups


def get_numeric_ranges(db: Session) -> tuple[tuple[float, float], tuple[int, int]]:
    price_min, price_max = db.execute(
        select(func.min(Product.price), func.max(Product.price)).where(Product.is_active.is_(True))
    ).one()
    diameter_min, diameter_max = db.execute(
        select(func.min(Product.case_diameter_mm), func.max(Product.case_diameter_mm)).where(
            Product.is_active.is_(True)
        )
    ).one()
    price_range = (float(price_min or 0), float(price_max or 0))
    diameter_range = (int(diameter_min or 0), int(diameter_max or 0))
    return price_range, diameter_range
