from pydantic import BaseModel


class FilterOption(BaseModel):
    value: str
    label: str
    count: int


class FilterGroup(BaseModel):
    key: str
    label: str
    options: list[FilterOption]


class NumericRange(BaseModel):
    min: float
    max: float


class FiltersResponse(BaseModel):
    categorical: list[FilterGroup]
    price: NumericRange
    diameter: NumericRange
