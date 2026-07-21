from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_client_user
from app.database import get_db
from app.models.users import User
from app.schemas.account import WishlistAddRequest, WishlistItemOut
from app.services.account_service import ProductNotFoundError, add_wishlist_item, list_wishlist, remove_wishlist_item

router = APIRouter(dependencies=[Depends(get_current_client_user)])


@router.get("/wishlist", response_model=list[WishlistItemOut])
def read_wishlist(user: User = Depends(get_current_client_user), db: Session = Depends(get_db)):
    return list_wishlist(db, user.id)


@router.post("/wishlist", response_model=list[WishlistItemOut], status_code=201)
def add_to_wishlist(
    payload: WishlistAddRequest,
    user: User = Depends(get_current_client_user),
    db: Session = Depends(get_db),
):
    try:
        add_wishlist_item(db, user.id, payload.product_id)
    except ProductNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Товар не знайдено") from exc
    return list_wishlist(db, user.id)


@router.delete("/wishlist/{product_id}", response_model=list[WishlistItemOut])
def remove_from_wishlist(
    product_id: int,
    user: User = Depends(get_current_client_user),
    db: Session = Depends(get_db),
):
    remove_wishlist_item(db, user.id, product_id)
    return list_wishlist(db, user.id)
