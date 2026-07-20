from fastapi import APIRouter

from app.api.admin import auth as admin_auth
from app.api.admin import categories as admin_categories
from app.api.admin import orders as admin_orders
from app.api.admin import products as admin_products
from app.api.admin import promo_codes as admin_promo_codes
from app.api.admin import references as admin_references
from app.api.admin import settings as admin_settings
from app.api.public import cart, catalog, delivery, orders, products

api_router = APIRouter(prefix="/api")
api_router.include_router(products.router, tags=["products"])
api_router.include_router(catalog.router, tags=["catalog"])
api_router.include_router(cart.router, tags=["cart"])
api_router.include_router(orders.router, tags=["orders"])
api_router.include_router(delivery.router, tags=["delivery"])
api_router.include_router(admin_auth.router, tags=["admin-auth"])
api_router.include_router(admin_products.router, tags=["admin-products"])
api_router.include_router(admin_references.router, tags=["admin-references"])
api_router.include_router(admin_categories.router, tags=["admin-categories"])
api_router.include_router(admin_orders.router, tags=["admin-orders"])
api_router.include_router(admin_promo_codes.router, tags=["admin-promo-codes"])
api_router.include_router(admin_settings.router, tags=["admin-settings"])
