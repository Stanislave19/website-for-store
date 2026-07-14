from fastapi import APIRouter

from app.api.public import cart, catalog, products

api_router = APIRouter(prefix="/api")
api_router.include_router(products.router, tags=["products"])
api_router.include_router(catalog.router, tags=["catalog"])
api_router.include_router(cart.router, tags=["cart"])
