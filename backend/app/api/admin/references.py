from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_staff_user
from app.database import get_db
from app.schemas.admin_reference import (
    AttributeTypeCreateRequest,
    AttributeTypeOut,
    AttributeTypeUpdateRequest,
    AttributeValueCreateRequest,
    AttributeValueOut,
    AttributeValueUpdateRequest,
    BrandCreateRequest,
    BrandOut,
    BrandUpdateRequest,
    MechanismTypeCreateRequest,
    MechanismTypeOut,
    MechanismTypeUpdateRequest,
)
from app.services.admin_reference_service import (
    ReferenceInUseError,
    ReferenceNameConflictError,
    ReferenceNotFoundError,
    create_attribute_type,
    create_attribute_value,
    create_brand,
    create_mechanism_type,
    delete_attribute_type,
    delete_attribute_value,
    delete_brand,
    delete_mechanism_type,
    list_attribute_types,
    list_attribute_values,
    list_brands,
    list_mechanism_types,
    update_attribute_type,
    update_attribute_value,
    update_brand,
    update_mechanism_type,
)

router = APIRouter(dependencies=[Depends(get_current_staff_user)])


@router.get("/admin/brands", response_model=list[BrandOut])
def read_admin_brands(db: Session = Depends(get_db)):
    return list_brands(db)


@router.post("/admin/brands", response_model=BrandOut, status_code=status.HTTP_201_CREATED)
def create_admin_brand(payload: BrandCreateRequest, db: Session = Depends(get_db)):
    try:
        return create_brand(db, payload)
    except ReferenceNameConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.patch("/admin/brands/{brand_id}", response_model=BrandOut)
def update_admin_brand(brand_id: int, payload: BrandUpdateRequest, db: Session = Depends(get_db)):
    try:
        return update_brand(db, brand_id, payload)
    except ReferenceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ReferenceNameConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.delete("/admin/brands/{brand_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin_brand(brand_id: int, db: Session = Depends(get_db)):
    try:
        delete_brand(db, brand_id)
    except ReferenceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ReferenceInUseError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.get("/admin/mechanism-types", response_model=list[MechanismTypeOut])
def read_admin_mechanism_types(db: Session = Depends(get_db)):
    return list_mechanism_types(db)


@router.post(
    "/admin/mechanism-types", response_model=MechanismTypeOut, status_code=status.HTTP_201_CREATED
)
def create_admin_mechanism_type(payload: MechanismTypeCreateRequest, db: Session = Depends(get_db)):
    try:
        return create_mechanism_type(db, payload)
    except ReferenceNameConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.patch("/admin/mechanism-types/{mechanism_type_id}", response_model=MechanismTypeOut)
def update_admin_mechanism_type(
    mechanism_type_id: int, payload: MechanismTypeUpdateRequest, db: Session = Depends(get_db)
):
    try:
        return update_mechanism_type(db, mechanism_type_id, payload)
    except ReferenceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ReferenceNameConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.delete("/admin/mechanism-types/{mechanism_type_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin_mechanism_type(mechanism_type_id: int, db: Session = Depends(get_db)):
    try:
        delete_mechanism_type(db, mechanism_type_id)
    except ReferenceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ReferenceInUseError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.get("/admin/attribute-types", response_model=list[AttributeTypeOut])
def read_admin_attribute_types(db: Session = Depends(get_db)):
    return list_attribute_types(db)


@router.post(
    "/admin/attribute-types", response_model=AttributeTypeOut, status_code=status.HTTP_201_CREATED
)
def create_admin_attribute_type(payload: AttributeTypeCreateRequest, db: Session = Depends(get_db)):
    try:
        return create_attribute_type(db, payload)
    except ReferenceNameConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.patch("/admin/attribute-types/{attribute_type_id}", response_model=AttributeTypeOut)
def update_admin_attribute_type(
    attribute_type_id: int, payload: AttributeTypeUpdateRequest, db: Session = Depends(get_db)
):
    try:
        return update_attribute_type(db, attribute_type_id, payload)
    except ReferenceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ReferenceNameConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.delete("/admin/attribute-types/{attribute_type_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin_attribute_type(attribute_type_id: int, db: Session = Depends(get_db)):
    try:
        delete_attribute_type(db, attribute_type_id)
    except ReferenceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ReferenceInUseError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.get("/admin/attribute-values", response_model=list[AttributeValueOut])
def read_admin_attribute_values(attribute_type_id: int | None = None, db: Session = Depends(get_db)):
    return list_attribute_values(db, attribute_type_id)


@router.post(
    "/admin/attribute-values", response_model=AttributeValueOut, status_code=status.HTTP_201_CREATED
)
def create_admin_attribute_value(payload: AttributeValueCreateRequest, db: Session = Depends(get_db)):
    try:
        return create_attribute_value(db, payload)
    except ReferenceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ReferenceNameConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.patch("/admin/attribute-values/{attribute_value_id}", response_model=AttributeValueOut)
def update_admin_attribute_value(
    attribute_value_id: int, payload: AttributeValueUpdateRequest, db: Session = Depends(get_db)
):
    try:
        return update_attribute_value(db, attribute_value_id, payload)
    except ReferenceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ReferenceNameConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.delete("/admin/attribute-values/{attribute_value_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin_attribute_value(attribute_value_id: int, db: Session = Depends(get_db)):
    try:
        delete_attribute_value(db, attribute_value_id)
    except ReferenceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ReferenceInUseError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
