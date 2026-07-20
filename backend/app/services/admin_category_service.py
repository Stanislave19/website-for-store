from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.slug import make_unique_slug, slugify
from app.models.catalog import Category, Product
from app.schemas.admin_category import CategoryCreateRequest, CategoryUpdateRequest


class CategoryNotFoundError(Exception):
    pass


class CategoryParentNotFoundError(Exception):
    def __init__(self):
        super().__init__("Батьківську категорію не знайдено")


class CategoryCircularParentError(Exception):
    def __init__(self):
        super().__init__("Категорія не може бути власним предком")


class CategoryHasChildrenError(Exception):
    def __init__(self):
        super().__init__("У категорії є підкатегорії — видалення заборонено")


class CategoryHasProductsError(Exception):
    def __init__(self):
        super().__init__("У категорії є товари — видалення заборонено")


def list_admin_categories(db: Session) -> list[Category]:
    return db.execute(select(Category).order_by(Category.name)).scalars().all()


def get_admin_category(db: Session, category_id: int) -> Category:
    category = db.get(Category, category_id)
    if category is None:
        raise CategoryNotFoundError()
    return category


def _assert_not_circular(db: Session, category_id: int, new_parent_id: int) -> None:
    if new_parent_id == category_id:
        raise CategoryCircularParentError()
    cursor = db.get(Category, new_parent_id)
    while cursor is not None:
        if cursor.id == category_id:
            raise CategoryCircularParentError()
        cursor = db.get(Category, cursor.parent_id) if cursor.parent_id else None


def create_category(db: Session, payload: CategoryCreateRequest) -> Category:
    if payload.parent_id is not None and not db.get(Category, payload.parent_id):
        raise CategoryParentNotFoundError()

    base_slug = slugify(payload.name)
    slug = make_unique_slug(
        base_slug, lambda candidate: db.scalar(select(Category).where(Category.slug == candidate)) is not None
    )

    category = Category(name=payload.name, parent_id=payload.parent_id, slug=slug)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def update_category(db: Session, category_id: int, payload: CategoryUpdateRequest) -> Category:
    category = get_admin_category(db, category_id)
    update_data = payload.model_dump(exclude_unset=True)

    if "parent_id" in update_data and update_data["parent_id"] is not None:
        new_parent_id = update_data["parent_id"]
        if not db.get(Category, new_parent_id):
            raise CategoryParentNotFoundError()
        _assert_not_circular(db, category_id, new_parent_id)

    for field, value in update_data.items():
        setattr(category, field, value)

    db.commit()
    db.refresh(category)
    return category


def delete_category(db: Session, category_id: int) -> None:
    category = get_admin_category(db, category_id)

    if db.scalar(select(Category).where(Category.parent_id == category_id)) is not None:
        raise CategoryHasChildrenError()
    if db.scalar(select(Product).where(Product.category_id == category_id)) is not None:
        raise CategoryHasProductsError()

    db.delete(category)
    db.commit()
