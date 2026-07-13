"""Тестові дані для ручної перевірки каталогу через Swagger.
Запуск: docker compose run --rm backend python -m app.scripts.seed_dev_data
"""

from app.core.constants import Gender
from app.database import SessionLocal
from app.models.attributes import AttributeType, AttributeValue, ProductAttribute
from app.models.catalog import Brand, Category, MechanismType, Product, ProductImage


def get_or_create(db, model, defaults=None, **filters):
    instance = db.query(model).filter_by(**filters).first()
    if instance:
        return instance
    instance = model(**filters, **(defaults or {}))
    db.add(instance)
    db.flush()
    return instance


def run():
    db = SessionLocal()
    try:
        men = get_or_create(db, Category, name="Чоловічі", slug="mens")
        women = get_or_create(db, Category, name="Жіночі", slug="womens")

        casio = get_or_create(db, Brand, name="Casio")
        seiko = get_or_create(db, Brand, name="Seiko")

        quartz = get_or_create(db, MechanismType, name="Кварц")
        automatic = get_or_create(db, MechanismType, name="Автомат")

        material_type = get_or_create(db, AttributeType, name="Матеріал корпусу")
        glass_type = get_or_create(db, AttributeType, name="Скло")

        steel = get_or_create(db, AttributeValue, attribute_type_id=material_type.id, value="Сталь")
        brass = get_or_create(db, AttributeValue, attribute_type_id=material_type.id, value="Латунь")
        sapphire = get_or_create(db, AttributeValue, attribute_type_id=glass_type.id, value="Сапфірове")
        mineral = get_or_create(db, AttributeValue, attribute_type_id=glass_type.id, value="Мінеральне")

        products_data = [
            {
                "name": "Casio Heritage MTP-1234",
                "slug": "casio-mtp-1234",
                "price": 2400,
                "old_price": None,
                "sku": "CAS-MTP-1234",
                "category": men,
                "brand": casio,
                "mechanism_type": quartz,
                "gender": Gender.male,
                "case_diameter_mm": 40,
                "attributes": [steel, mineral],
            },
            {
                "name": "Casio Classic LTP-5678",
                "slug": "casio-ltp-5678",
                "price": 1800,
                "old_price": 2200,
                "sku": "CAS-LTP-5678",
                "category": women,
                "brand": casio,
                "mechanism_type": quartz,
                "gender": Gender.female,
                "case_diameter_mm": 34,
                "attributes": [brass, mineral],
            },
            {
                "name": "Seiko Presage SRPB-99",
                "slug": "seiko-srpb-99",
                "price": 8900,
                "old_price": None,
                "sku": "SEI-SRPB-99",
                "category": men,
                "brand": seiko,
                "mechanism_type": automatic,
                "gender": Gender.male,
                "case_diameter_mm": 42,
                "attributes": [steel, sapphire],
            },
            {
                "name": "Seiko Lady SUR-42",
                "slug": "seiko-sur-42",
                "price": 5400,
                "old_price": None,
                "sku": "SEI-SUR-42",
                "category": women,
                "brand": seiko,
                "mechanism_type": quartz,
                "gender": Gender.female,
                "case_diameter_mm": 30,
                "attributes": [steel, mineral],
            },
        ]

        for data in products_data:
            existing = db.query(Product).filter_by(slug=data["slug"]).first()
            if existing:
                continue

            product = Product(
                name=data["name"],
                slug=data["slug"],
                description=f"{data['name']} — надійний годинник для щоденного носіння.",
                price=data["price"],
                old_price=data["old_price"],
                sku=data["sku"],
                category_id=data["category"].id,
                brand_id=data["brand"].id,
                mechanism_type_id=data["mechanism_type"].id,
                gender=data["gender"],
                case_diameter_mm=data["case_diameter_mm"],
                warranty_months=24,
                package_contents="Коробка, гарантійний талон",
                is_active=True,
            )
            db.add(product)
            db.flush()

            db.add(ProductImage(product_id=product.id, url=f"/media/{data['slug']}-1.jpg", position=0))

            for attribute_value in data["attributes"]:
                db.add(
                    ProductAttribute(
                        product_id=product.id,
                        attribute_value_id=attribute_value.id,
                    )
                )

        db.commit()
        print("Тестові дані додано.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
