from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_owner_user
from app.database import get_db
from app.schemas.admin_settings import SettingOut, SettingsUpdateRequest
from app.services.settings_service import list_settings, update_settings

router = APIRouter(dependencies=[Depends(get_current_owner_user)])


@router.get("/admin/settings", response_model=list[SettingOut])
def read_admin_settings(db: Session = Depends(get_db)):
    return list_settings(db)


@router.patch("/admin/settings", response_model=list[SettingOut])
def update_admin_settings(payload: SettingsUpdateRequest, db: Session = Depends(get_db)):
    return update_settings(db, payload.settings)
