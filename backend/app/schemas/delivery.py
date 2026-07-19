from pydantic import BaseModel


class CityOut(BaseModel):
    ref: str
    name: str


class WarehouseOut(BaseModel):
    ref: str
    number: str
    description: str
