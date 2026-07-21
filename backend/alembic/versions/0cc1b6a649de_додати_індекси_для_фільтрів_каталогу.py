"""додати індекси для фільтрів каталогу

Revision ID: 0cc1b6a649de
Revises: 51891726c19b
Create Date: 2026-07-21 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0cc1b6a649de'
down_revision: Union[str, None] = '51891726c19b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Колонки, за якими каталог фільтрує/сортує на кожен запит /api/products
    # і /api/filters — раніше без індексів, тобто послідовне сканування products
    # при кожному фільтрі.
    op.create_index('ix_products_category_id', 'products', ['category_id'])
    op.create_index('ix_products_brand_id', 'products', ['brand_id'])
    op.create_index('ix_products_mechanism_type_id', 'products', ['mechanism_type_id'])
    op.create_index('ix_products_price', 'products', ['price'])
    op.create_index('ix_products_is_active', 'products', ['is_active'])


def downgrade() -> None:
    op.drop_index('ix_products_is_active', table_name='products')
    op.drop_index('ix_products_price', table_name='products')
    op.drop_index('ix_products_mechanism_type_id', table_name='products')
    op.drop_index('ix_products_brand_id', table_name='products')
    op.drop_index('ix_products_category_id', table_name='products')
