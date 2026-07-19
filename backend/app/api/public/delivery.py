from fastapi import APIRouter

from app.schemas.delivery import CityOut, WarehouseOut
from app.services.nova_poshta_service import search_cities, search_warehouses

router = APIRouter()


@router.get("/delivery/cities", response_model=list[CityOut])
def read_cities(query: str = ""):
    return search_cities(query)


@router.get("/delivery/warehouses", response_model=list[WarehouseOut])
def read_warehouses(city_ref: str = "", query: str = ""):
    return search_warehouses(city_ref, query)
