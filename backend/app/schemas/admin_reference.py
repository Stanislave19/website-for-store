from pydantic import BaseModel, ConfigDict


class BrandOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class MechanismTypeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class AttributeTypeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class AttributeValueOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    attribute_type_id: int
    value: str
