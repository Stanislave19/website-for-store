from pydantic import BaseModel, ConfigDict


class SettingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    key: str
    value: str


class SettingsUpdateRequest(BaseModel):
    settings: dict[str, str]
