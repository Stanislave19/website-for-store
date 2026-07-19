import logging
import time

import httpx

from app.config import settings
from app.schemas.delivery import CityOut, WarehouseOut

logger = logging.getLogger(__name__)

API_URL = "https://api.novaposhta.ua/v2.0/json/"
CACHE_TTL_SECONDS = 300

_cache: dict[str, tuple[float, list]] = {}


def _cache_get(key: str) -> list | None:
    entry = _cache.get(key)
    if entry is None:
        return None
    cached_at, value = entry
    if time.time() - cached_at > CACHE_TTL_SECONDS:
        del _cache[key]
        return None
    return value


def _cache_set(key: str, value: list) -> None:
    _cache[key] = (time.time(), value)


def _call_api(model_name: str, called_method: str, method_properties: dict) -> list[dict]:
    payload = {
        "apiKey": settings.nova_poshta_api_key,
        "modelName": model_name,
        "calledMethod": called_method,
        "methodProperties": method_properties,
    }
    try:
        response = httpx.post(API_URL, json=payload, timeout=5, follow_redirects=True)
        response.raise_for_status()
        data = response.json()
    except httpx.HTTPError as exc:
        logger.error("Нова Пошта API недоступне (%s.%s): %s", model_name, called_method, type(exc).__name__)
        return []

    if not data.get("success"):
        logger.error("Нова Пошта API повернуло помилку (%s.%s): %s", model_name, called_method, data.get("errors"))
        return []

    return data.get("data", [])


def search_cities(query: str) -> list[CityOut]:
    if not settings.nova_poshta_api_key or not query.strip():
        return []

    cache_key = f"cities:{query.strip().lower()}"
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached

    raw_cities = _call_api("Address", "getCities", {"FindByString": query.strip()})
    cities = [CityOut(ref=item["Ref"], name=item["Description"]) for item in raw_cities]

    _cache_set(cache_key, cities)
    return cities


def search_warehouses(city_ref: str, query: str = "") -> list[WarehouseOut]:
    # Без FindByString Нова Пошта повертає весь список відділень міста (у Києві — тисячі
    # записів), тож для великих міст просимо користувача вводити текст, як і для міст.
    if not settings.nova_poshta_api_key or not city_ref.strip() or not query.strip():
        return []

    cache_key = f"warehouses:{city_ref.strip()}:{query.strip().lower()}"
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached

    method_properties = {"CityRef": city_ref.strip()}
    if query.strip():
        method_properties["FindByString"] = query.strip()

    raw_warehouses = _call_api("Address", "getWarehouses", method_properties)
    warehouses = [
        WarehouseOut(ref=item["Ref"], number=item["Number"], description=item["Description"])
        for item in raw_warehouses
    ]

    _cache_set(cache_key, warehouses)
    return warehouses
