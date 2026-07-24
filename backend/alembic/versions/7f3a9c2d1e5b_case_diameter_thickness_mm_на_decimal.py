"""case_diameter_mm та case_thickness_mm на Numeric(4,1)

Revision ID: 7f3a9c2d1e5b
Revises: 0cc1b6a649de
Create Date: 2026-07-24 12:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7f3a9c2d1e5b'
down_revision: Union[str, None] = '0cc1b6a649de'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Реальні технічні дані виробників часто дробові (38.5мм, 44.2мм) —
    # ціле число не могло їх зберегти. Numeric(4,1), а не float/double
    # precision, — той самий підхід, що вже у products.price: точне
    # десяткове представлення без похибок бінарного float.
    op.alter_column(
        'products',
        'case_diameter_mm',
        type_=sa.Numeric(4, 1),
        existing_type=sa.Integer(),
        postgresql_using='case_diameter_mm::numeric(4,1)',
    )
    op.alter_column(
        'products',
        'case_thickness_mm',
        type_=sa.Numeric(4, 1),
        existing_type=sa.Integer(),
        postgresql_using='case_thickness_mm::numeric(4,1)',
    )


def downgrade() -> None:
    op.alter_column(
        'products',
        'case_diameter_mm',
        type_=sa.Integer(),
        existing_type=sa.Numeric(4, 1),
        postgresql_using='round(case_diameter_mm)::integer',
    )
    op.alter_column(
        'products',
        'case_thickness_mm',
        type_=sa.Integer(),
        existing_type=sa.Numeric(4, 1),
        postgresql_using='round(case_thickness_mm)::integer',
    )
