from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.cache import ttl_cache
from app.database import SessionLocal, get_db
from app.schemas.category import CategoryNode
from app.schemas.filters import FiltersResponse, NumericRange
from app.services.catalog_service import (
    get_categorical_filters,
    get_category_tree,
    get_numeric_ranges,
    get_on_sale_count,
)

router = APIRouter()


@router.get("/categories", response_model=list[CategoryNode])
def read_categories(db: Session = Depends(get_db)):
    return get_category_tree(db)


@ttl_cache(ttl_seconds=30)
def _compute_filters() -> FiltersResponse:
    # /api/filters рахує лічильники по кожному значенню кожного атрибута —
    # відносно важкий запит, що не міняється часто (лише коли редагують
    # товари в адмінці), тому короткий TTL-кеш замість перерахунку на кожен
    # візит у каталог.
    db = SessionLocal()
    try:
        categorical = get_categorical_filters(db)
        price_range, diameter_range, thickness_range = get_numeric_ranges(db)
        return FiltersResponse(
            categorical=categorical,
            price=NumericRange(min=price_range[0], max=price_range[1]),
            diameter=NumericRange(min=diameter_range[0], max=diameter_range[1]),
            thickness=NumericRange(min=thickness_range[0], max=thickness_range[1]),
            on_sale_count=get_on_sale_count(db),
        )
    finally:
        db.close()


@router.get("/filters", response_model=FiltersResponse)
def read_filters():
    return _compute_filters()
