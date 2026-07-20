from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.attributes import AttributeType, AttributeValue, ProductAttribute
from app.models.catalog import Brand, MechanismType, Product
from app.schemas.admin_reference import (
    AttributeTypeCreateRequest,
    AttributeTypeUpdateRequest,
    AttributeValueCreateRequest,
    AttributeValueUpdateRequest,
    BrandCreateRequest,
    BrandUpdateRequest,
    MechanismTypeCreateRequest,
    MechanismTypeUpdateRequest,
)


class ReferenceNotFoundError(Exception):
    def __init__(self, entity: str):
        self.entity = entity
        super().__init__(f"{entity} не знайдено")


class ReferenceNameConflictError(Exception):
    def __init__(self, entity: str, name: str):
        self.entity = entity
        self.name = name
        super().__init__(f"Значення «{name}» вже існує")


class ReferenceInUseError(Exception):
    def __init__(self, entity: str):
        self.entity = entity
        super().__init__("Значення використовується товарами — видалення заборонено")


def list_brands(db: Session) -> list[Brand]:
    return db.execute(select(Brand).order_by(Brand.name)).scalars().all()


def get_brand(db: Session, brand_id: int) -> Brand:
    brand = db.get(Brand, brand_id)
    if brand is None:
        raise ReferenceNotFoundError("Бренд")
    return brand


def create_brand(db: Session, payload: BrandCreateRequest) -> Brand:
    if db.scalar(select(Brand).where(Brand.name == payload.name)):
        raise ReferenceNameConflictError("Бренд", payload.name)
    brand = Brand(name=payload.name)
    db.add(brand)
    db.commit()
    db.refresh(brand)
    return brand


def update_brand(db: Session, brand_id: int, payload: BrandUpdateRequest) -> Brand:
    brand = get_brand(db, brand_id)
    update_data = payload.model_dump(exclude_unset=True)
    if "name" in update_data and update_data["name"] != brand.name:
        if db.scalar(select(Brand).where(Brand.name == update_data["name"])):
            raise ReferenceNameConflictError("Бренд", update_data["name"])
    for field, value in update_data.items():
        setattr(brand, field, value)
    db.commit()
    db.refresh(brand)
    return brand


def delete_brand(db: Session, brand_id: int) -> None:
    get_brand(db, brand_id)
    if db.scalar(select(Product).where(Product.brand_id == brand_id)) is not None:
        raise ReferenceInUseError("Бренд")
    db.query(Brand).filter(Brand.id == brand_id).delete()
    db.commit()


def list_mechanism_types(db: Session) -> list[MechanismType]:
    return db.execute(select(MechanismType).order_by(MechanismType.name)).scalars().all()


def get_mechanism_type(db: Session, mechanism_type_id: int) -> MechanismType:
    mechanism_type = db.get(MechanismType, mechanism_type_id)
    if mechanism_type is None:
        raise ReferenceNotFoundError("Тип механізму")
    return mechanism_type


def create_mechanism_type(db: Session, payload: MechanismTypeCreateRequest) -> MechanismType:
    if db.scalar(select(MechanismType).where(MechanismType.name == payload.name)):
        raise ReferenceNameConflictError("Тип механізму", payload.name)
    mechanism_type = MechanismType(name=payload.name)
    db.add(mechanism_type)
    db.commit()
    db.refresh(mechanism_type)
    return mechanism_type


def update_mechanism_type(
    db: Session, mechanism_type_id: int, payload: MechanismTypeUpdateRequest
) -> MechanismType:
    mechanism_type = get_mechanism_type(db, mechanism_type_id)
    update_data = payload.model_dump(exclude_unset=True)
    if "name" in update_data and update_data["name"] != mechanism_type.name:
        if db.scalar(select(MechanismType).where(MechanismType.name == update_data["name"])):
            raise ReferenceNameConflictError("Тип механізму", update_data["name"])
    for field, value in update_data.items():
        setattr(mechanism_type, field, value)
    db.commit()
    db.refresh(mechanism_type)
    return mechanism_type


def delete_mechanism_type(db: Session, mechanism_type_id: int) -> None:
    get_mechanism_type(db, mechanism_type_id)
    if db.scalar(select(Product).where(Product.mechanism_type_id == mechanism_type_id)) is not None:
        raise ReferenceInUseError("Тип механізму")
    db.query(MechanismType).filter(MechanismType.id == mechanism_type_id).delete()
    db.commit()


def list_attribute_types(db: Session) -> list[AttributeType]:
    return db.execute(select(AttributeType).order_by(AttributeType.name)).scalars().all()


def get_attribute_type(db: Session, attribute_type_id: int) -> AttributeType:
    attribute_type = db.get(AttributeType, attribute_type_id)
    if attribute_type is None:
        raise ReferenceNotFoundError("Тип атрибута")
    return attribute_type


def create_attribute_type(db: Session, payload: AttributeTypeCreateRequest) -> AttributeType:
    if db.scalar(select(AttributeType).where(AttributeType.name == payload.name)):
        raise ReferenceNameConflictError("Тип атрибута", payload.name)
    attribute_type = AttributeType(name=payload.name)
    db.add(attribute_type)
    db.commit()
    db.refresh(attribute_type)
    return attribute_type


def update_attribute_type(
    db: Session, attribute_type_id: int, payload: AttributeTypeUpdateRequest
) -> AttributeType:
    attribute_type = get_attribute_type(db, attribute_type_id)
    update_data = payload.model_dump(exclude_unset=True)
    if "name" in update_data and update_data["name"] != attribute_type.name:
        if db.scalar(select(AttributeType).where(AttributeType.name == update_data["name"])):
            raise ReferenceNameConflictError("Тип атрибута", update_data["name"])
    for field, value in update_data.items():
        setattr(attribute_type, field, value)
    db.commit()
    db.refresh(attribute_type)
    return attribute_type


def delete_attribute_type(db: Session, attribute_type_id: int) -> None:
    get_attribute_type(db, attribute_type_id)
    if db.scalar(
        select(AttributeValue).where(AttributeValue.attribute_type_id == attribute_type_id)
    ) is not None:
        raise ReferenceInUseError("Тип атрибута")
    db.query(AttributeType).filter(AttributeType.id == attribute_type_id).delete()
    db.commit()


def list_attribute_values(db: Session, attribute_type_id: int | None = None) -> list[AttributeValue]:
    query = select(AttributeValue)
    if attribute_type_id is not None:
        query = query.where(AttributeValue.attribute_type_id == attribute_type_id)
    return db.execute(query.order_by(AttributeValue.value)).scalars().all()


def get_attribute_value(db: Session, attribute_value_id: int) -> AttributeValue:
    attribute_value = db.get(AttributeValue, attribute_value_id)
    if attribute_value is None:
        raise ReferenceNotFoundError("Значення атрибута")
    return attribute_value


def create_attribute_value(db: Session, payload: AttributeValueCreateRequest) -> AttributeValue:
    if not db.get(AttributeType, payload.attribute_type_id):
        raise ReferenceNotFoundError("attribute_type_id")
    if db.scalar(
        select(AttributeValue).where(
            AttributeValue.attribute_type_id == payload.attribute_type_id,
            AttributeValue.value == payload.value,
        )
    ):
        raise ReferenceNameConflictError("Значення атрибута", payload.value)
    attribute_value = AttributeValue(attribute_type_id=payload.attribute_type_id, value=payload.value)
    db.add(attribute_value)
    db.commit()
    db.refresh(attribute_value)
    return attribute_value


def update_attribute_value(
    db: Session, attribute_value_id: int, payload: AttributeValueUpdateRequest
) -> AttributeValue:
    attribute_value = get_attribute_value(db, attribute_value_id)
    update_data = payload.model_dump(exclude_unset=True)

    if "attribute_type_id" in update_data and update_data["attribute_type_id"] is not None:
        if not db.get(AttributeType, update_data["attribute_type_id"]):
            raise ReferenceNotFoundError("attribute_type_id")

    new_attribute_type_id = update_data.get("attribute_type_id", attribute_value.attribute_type_id)
    new_value = update_data.get("value", attribute_value.value)
    if (new_attribute_type_id, new_value) != (attribute_value.attribute_type_id, attribute_value.value):
        if db.scalar(
            select(AttributeValue).where(
                AttributeValue.attribute_type_id == new_attribute_type_id,
                AttributeValue.value == new_value,
            )
        ):
            raise ReferenceNameConflictError("Значення атрибута", new_value)

    for field, value in update_data.items():
        setattr(attribute_value, field, value)
    db.commit()
    db.refresh(attribute_value)
    return attribute_value


def delete_attribute_value(db: Session, attribute_value_id: int) -> None:
    get_attribute_value(db, attribute_value_id)
    if db.scalar(
        select(ProductAttribute).where(ProductAttribute.attribute_value_id == attribute_value_id)
    ) is not None:
        raise ReferenceInUseError("Значення атрибута")
    db.query(AttributeValue).filter(AttributeValue.id == attribute_value_id).delete()
    db.commit()
