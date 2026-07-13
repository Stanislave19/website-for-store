from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class CategoryNode(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    children: list["CategoryNode"] = []
