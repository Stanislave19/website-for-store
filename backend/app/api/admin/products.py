from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_staff_user
from app.database import get_db
from app.schemas.admin_product import (
    AdminProductDetail,
    AdminProductImageOut,
    AdminProductListItem,
    AdminProductListResponse,
    ProductCreateRequest,
    ProductUpdateRequest,
)
from app.services.admin_product_service import (
    ImageNotFoundError,
    InvalidImageError,
    ProductHasOrdersError,
    ProductNotFoundError,
    ReferenceNotFoundError,
    SkuAlreadyExistsError,
    add_product_image,
    admin_products_pages,
    create_product,
    delete_product,
    delete_product_image,
    get_admin_product,
    list_admin_products,
    to_admin_product_detail,
    update_product,
)

router = APIRouter(dependencies=[Depends(get_current_staff_user)])


@router.get("/admin/products", response_model=AdminProductListResponse)
def read_admin_products(
    search: str | None = None,
    page: int = 1,
    page_size: int = 24,
    db: Session = Depends(get_db),
):
    items, total = list_admin_products(db, search=search, page=page, page_size=page_size)
    return AdminProductListResponse(
        items=[
            AdminProductListItem(
                id=product.id,
                slug=product.slug,
                name=product.name,
                sku=product.sku,
                price=float(product.price),
                is_active=product.is_active,
                brand=product.brand.name,
                main_image=product.images[0].url if product.images else None,
            )
            for product in items
        ],
        total=total,
        page=page,
        page_size=page_size,
        pages=admin_products_pages(total, page_size),
    )


@router.post("/admin/products", response_model=AdminProductDetail, status_code=status.HTTP_201_CREATED)
def create_admin_product(payload: ProductCreateRequest, db: Session = Depends(get_db)):
    try:
        product = create_product(db, payload)
    except ReferenceNotFoundError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except SkuAlreadyExistsError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    return to_admin_product_detail(db, product)


@router.get("/admin/products/{product_id}", response_model=AdminProductDetail)
def read_admin_product(product_id: int, db: Session = Depends(get_db)):
    try:
        product = get_admin_product(db, product_id)
    except ProductNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Товар не знайдено") from exc
    return to_admin_product_detail(db, product)


@router.patch("/admin/products/{product_id}", response_model=AdminProductDetail)
def update_admin_product(product_id: int, payload: ProductUpdateRequest, db: Session = Depends(get_db)):
    try:
        product = update_product(db, product_id, payload)
    except ProductNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Товар не знайдено") from exc
    except ReferenceNotFoundError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except SkuAlreadyExistsError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    return to_admin_product_detail(db, product)


@router.delete("/admin/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin_product(product_id: int, db: Session = Depends(get_db)):
    try:
        delete_product(db, product_id)
    except ProductNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Товар не знайдено") from exc
    except ProductHasOrdersError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.post(
    "/admin/products/{product_id}/images",
    response_model=AdminProductImageOut,
    status_code=status.HTTP_201_CREATED,
)
async def upload_admin_product_image(
    product_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)
):
    try:
        return await add_product_image(db, product_id, file)
    except ProductNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Товар не знайдено") from exc
    except InvalidImageError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.delete("/admin/products/{product_id}/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin_product_image(product_id: int, image_id: int, db: Session = Depends(get_db)):
    try:
        delete_product_image(db, product_id, image_id)
    except ImageNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Фото не знайдено") from exc
