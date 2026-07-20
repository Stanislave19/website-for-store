from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_staff_user
from app.database import get_db
from app.schemas.admin_category import AdminCategoryOut, CategoryCreateRequest, CategoryUpdateRequest
from app.services.admin_category_service import (
    CategoryCircularParentError,
    CategoryHasChildrenError,
    CategoryHasProductsError,
    CategoryNotFoundError,
    CategoryParentNotFoundError,
    create_category,
    delete_category,
    get_admin_category,
    list_admin_categories,
    update_category,
)

router = APIRouter(dependencies=[Depends(get_current_staff_user)])


@router.get("/admin/categories", response_model=list[AdminCategoryOut])
def read_admin_categories(db: Session = Depends(get_db)):
    return list_admin_categories(db)


@router.get("/admin/categories/{category_id}", response_model=AdminCategoryOut)
def read_admin_category(category_id: int, db: Session = Depends(get_db)):
    try:
        return get_admin_category(db, category_id)
    except CategoryNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Категорію не знайдено") from exc


@router.post("/admin/categories", response_model=AdminCategoryOut, status_code=status.HTTP_201_CREATED)
def create_admin_category(payload: CategoryCreateRequest, db: Session = Depends(get_db)):
    try:
        return create_category(db, payload)
    except CategoryParentNotFoundError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.patch("/admin/categories/{category_id}", response_model=AdminCategoryOut)
def update_admin_category(category_id: int, payload: CategoryUpdateRequest, db: Session = Depends(get_db)):
    try:
        return update_category(db, category_id, payload)
    except CategoryNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Категорію не знайдено") from exc
    except (CategoryParentNotFoundError, CategoryCircularParentError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.delete("/admin/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin_category(category_id: int, db: Session = Depends(get_db)):
    try:
        delete_category(db, category_id)
    except CategoryNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Категорію не знайдено") from exc
    except (CategoryHasChildrenError, CategoryHasProductsError) as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
