from pydantic import BaseModel, ConfigDict


class BrandOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class BrandCreateRequest(BaseModel):
    name: str


class BrandUpdateRequest(BaseModel):
    name: str | None = None


class MechanismTypeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class MechanismTypeCreateRequest(BaseModel):
    name: str


class MechanismTypeUpdateRequest(BaseModel):
    name: str | None = None


class AttributeTypeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class AttributeTypeCreateRequest(BaseModel):
    name: str


class AttributeTypeUpdateRequest(BaseModel):
    name: str | None = None


class AttributeValueOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    attribute_type_id: int
    value: str


class AttributeValueCreateRequest(BaseModel):
    attribute_type_id: int
    value: str


class AttributeValueUpdateRequest(BaseModel):
    attribute_type_id: int | None = None
    value: str | None = None
