from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_staff_user
from app.database import get_db
from app.schemas.admin_promo import AdminPromoOut, PromoCreateRequest, PromoUpdateRequest
from app.services.admin_promo_service import (
    PromoCodeAlreadyExistsError,
    PromoInUseError,
    PromoNotFoundError,
    create_promo,
    delete_promo,
    get_admin_promo,
    list_admin_promos,
    update_promo,
)

router = APIRouter(dependencies=[Depends(get_current_staff_user)])


@router.get("/admin/promo-codes", response_model=list[AdminPromoOut])
def read_admin_promo_codes(db: Session = Depends(get_db)):
    return list_admin_promos(db)


@router.get("/admin/promo-codes/{promo_id}", response_model=AdminPromoOut)
def read_admin_promo_code(promo_id: int, db: Session = Depends(get_db)):
    try:
        return get_admin_promo(db, promo_id)
    except PromoNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Промокод не знайдено") from exc


@router.post("/admin/promo-codes", response_model=AdminPromoOut, status_code=status.HTTP_201_CREATED)
def create_admin_promo_code(payload: PromoCreateRequest, db: Session = Depends(get_db)):
    try:
        return create_promo(db, payload)
    except PromoCodeAlreadyExistsError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.patch("/admin/promo-codes/{promo_id}", response_model=AdminPromoOut)
def update_admin_promo_code(promo_id: int, payload: PromoUpdateRequest, db: Session = Depends(get_db)):
    try:
        return update_promo(db, promo_id, payload)
    except PromoNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Промокод не знайдено") from exc
    except PromoCodeAlreadyExistsError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.delete("/admin/promo-codes/{promo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin_promo_code(promo_id: int, db: Session = Depends(get_db)):
    try:
        delete_promo(db, promo_id)
    except PromoNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Промокод не знайдено") from exc
    except PromoInUseError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
