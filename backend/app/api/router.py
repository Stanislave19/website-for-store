from fastapi import APIRouter

from app.api.public import cart, catalog, delivery, orders, products

api_router = APIRouter(prefix="/api")
api_router.include_router(products.router, tags=["products"])
api_router.include_router(catalog.router, tags=["catalog"])
api_router.include_router(cart.router, tags=["cart"])
api_router.include_router(orders.router, tags=["orders"])
api_router.include_router(delivery.router, tags=["delivery"])
