from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.deps import get_current_staff_user
from app.database import get_db
from app.models.attributes import AttributeType, AttributeValue
from app.models.catalog import Brand, MechanismType
from app.schemas.admin_reference import AttributeTypeOut, AttributeValueOut, BrandOut, MechanismTypeOut

router = APIRouter(dependencies=[Depends(get_current_staff_user)])


@router.get("/admin/brands", response_model=list[BrandOut])
def read_admin_brands(db: Session = Depends(get_db)):
    return db.execute(select(Brand).order_by(Brand.name)).scalars().all()


@router.get("/admin/mechanism-types", response_model=list[MechanismTypeOut])
def read_admin_mechanism_types(db: Session = Depends(get_db)):
    return db.execute(select(MechanismType).order_by(MechanismType.name)).scalars().all()


@router.get("/admin/attribute-types", response_model=list[AttributeTypeOut])
def read_admin_attribute_types(db: Session = Depends(get_db)):
    return db.execute(select(AttributeType).order_by(AttributeType.name)).scalars().all()


@router.get("/admin/attribute-values", response_model=list[AttributeValueOut])
def read_admin_attribute_values(attribute_type_id: int | None = None, db: Session = Depends(get_db)):
    query = select(AttributeValue)
    if attribute_type_id is not None:
        query = query.where(AttributeValue.attribute_type_id == attribute_type_id)
    return db.execute(query.order_by(AttributeValue.value)).scalars().all()
