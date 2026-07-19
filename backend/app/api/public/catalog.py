from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.category import CategoryNode
from app.schemas.filters import FiltersResponse, NumericRange
from app.services.catalog_service import get_categorical_filters, get_category_tree, get_numeric_ranges

router = APIRouter()


@router.get("/categories", response_model=list[CategoryNode])
def read_categories(db: Session = Depends(get_db)):
    return get_category_tree(db)


@router.get("/filters", response_model=FiltersResponse)
def read_filters(db: Session = Depends(get_db)):
    categorical = get_categorical_filters(db)
    price_range, diameter_range, thickness_range = get_numeric_ranges(db)
    return FiltersResponse(
        categorical=categorical,
        price=NumericRange(min=price_range[0], max=price_range[1]),
        diameter=NumericRange(min=diameter_range[0], max=diameter_range[1]),
        thickness=NumericRange(min=thickness_range[0], max=thickness_range[1]),
    )
