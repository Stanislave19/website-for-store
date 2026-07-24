from collections import defaultdict

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.constants import Gender
from app.models.attributes import AttributeType, AttributeValue, ProductAttribute
from app.models.catalog import Brand, Category, MechanismType, Product

GENDER_LABELS = {
    Gender.male: "Чоловічі",
    Gender.female: "Жіночі",
    Gender.unisex: "Унісекс",
}


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

    category_rows = db.execute(
        select(Category.id, Category.name, func.count(Product.id))
        .join(Product, Product.category_id == Category.id)
        .where(Product.is_active.is_(True))
        .group_by(Category.id, Category.name)
    ).all()
    groups.append(
        {
            "key": "category",
            "label": "Категорія",
            "options": [
                {"value": str(cid), "label": name, "count": count} for cid, name, count in category_rows
            ],
        }
    )

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
            "options": [
                {"value": str(bid), "label": name, "count": count} for bid, name, count in brand_rows
            ],
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
            "options": [
                {"value": str(mid), "label": name, "count": count} for mid, name, count in mechanism_rows
            ],
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
            "options": [
                {"value": gender.value, "label": GENDER_LABELS[gender], "count": count}
                for gender, count in gender_rows
            ],
        }
    )

    attribute_type_rows = db.execute(select(AttributeType)).scalars().all()
    for attribute_type in attribute_type_rows:
        value_rows = db.execute(
            select(AttributeValue.id, AttributeValue.value, func.count(Product.id))
            .join(ProductAttribute, ProductAttribute.attribute_value_id == AttributeValue.id)
            .join(Product, Product.id == ProductAttribute.product_id)
            .where(
                AttributeValue.attribute_type_id == attribute_type.id,
                Product.is_active.is_(True),
            )
            .group_by(AttributeValue.id, AttributeValue.value)
        ).all()
        if value_rows:
            groups.append(
                {
                    "key": f"attr_{attribute_type.id}",
                    "label": attribute_type.name,
                    "options": [
                        {"value": str(vid), "label": value, "count": count}
                        for vid, value, count in value_rows
                    ],
                }
            )

    return groups


def get_numeric_ranges(
    db: Session,
) -> tuple[tuple[float, float], tuple[float, float], tuple[float, float]]:
    price_min, price_max = db.execute(
        select(func.min(Product.price), func.max(Product.price)).where(Product.is_active.is_(True))
    ).one()
    diameter_min, diameter_max = db.execute(
        select(func.min(Product.case_diameter_mm), func.max(Product.case_diameter_mm)).where(
            Product.is_active.is_(True)
        )
    ).one()
    thickness_min, thickness_max = db.execute(
        select(func.min(Product.case_thickness_mm), func.max(Product.case_thickness_mm)).where(
            Product.is_active.is_(True)
        )
    ).one()
    price_range = (float(price_min or 0), float(price_max or 0))
    diameter_range = (float(diameter_min or 0), float(diameter_max or 0))
    thickness_range = (float(thickness_min or 0), float(thickness_max or 0))
    return price_range, diameter_range, thickness_range


def get_on_sale_count(db: Session) -> int:
    return db.execute(
        select(func.count(Product.id)).where(
            Product.is_active.is_(True), Product.old_price.is_not(None)
        )
    ).scalar_one()
