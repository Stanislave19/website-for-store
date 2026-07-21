from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_client_user
from app.database import get_db
from app.models.users import User
from app.schemas.account import (
    AccountOrderDetail,
    AccountOrderListItem,
    AccountOrderListResponse,
    AddressInput,
    AddressOut,
)
from app.services.account_service import (
    AddressNotFoundError,
    OrderNotFoundError,
    account_orders_pages,
    create_address,
    delete_address,
    get_account_order,
    list_account_orders,
    list_addresses,
    to_account_order_detail,
)

router = APIRouter(dependencies=[Depends(get_current_client_user)])


@router.get("/account/orders", response_model=AccountOrderListResponse)
def read_account_orders(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=24, ge=1, le=100),
    user: User = Depends(get_current_client_user),
    db: Session = Depends(get_db),
):
    items, total = list_account_orders(db, user.id, page=page, page_size=page_size)
    return AccountOrderListResponse(
        items=[AccountOrderListItem.model_validate(order) for order in items],
        total=total,
        page=page,
        page_size=page_size,
        pages=account_orders_pages(total, page_size),
    )


@router.get("/account/orders/{order_id}", response_model=AccountOrderDetail)
def read_account_order(
    order_id: int,
    user: User = Depends(get_current_client_user),
    db: Session = Depends(get_db),
):
    try:
        order = get_account_order(db, user.id, order_id)
    except OrderNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Замовлення не знайдено") from exc
    return to_account_order_detail(db, order)


@router.get("/account/addresses", response_model=list[AddressOut])
def read_addresses(user: User = Depends(get_current_client_user), db: Session = Depends(get_db)):
    return list_addresses(db, user.id)


@router.post("/account/addresses", response_model=AddressOut, status_code=201)
def add_address(
    payload: AddressInput,
    user: User = Depends(get_current_client_user),
    db: Session = Depends(get_db),
):
    return create_address(db, user.id, payload)


@router.delete("/account/addresses/{address_id}", status_code=204)
def remove_address(
    address_id: int,
    user: User = Depends(get_current_client_user),
    db: Session = Depends(get_db),
):
    try:
        delete_address(db, user.id, address_id)
    except AddressNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Адресу не знайдено") from exc
