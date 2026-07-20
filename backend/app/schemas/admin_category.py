from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AdminCategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    parent_id: int | None
    created_at: datetime


class CategoryCreateRequest(BaseModel):
    name: str
    parent_id: int | None = None


class CategoryUpdateRequest(BaseModel):
    name: str | None = None
    parent_id: int | None = None
