from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.shop import Setting


def list_settings(db: Session) -> list[Setting]:
    return db.execute(select(Setting).order_by(Setting.key)).scalars().all()


def update_settings(db: Session, values: dict[str, str]) -> list[Setting]:
    for key, value in values.items():
        setting = db.get(Setting, key)
        if setting is None:
            setting = Setting(key=key, value=value)
            db.add(setting)
        else:
            setting.value = value
    db.commit()
    return list_settings(db)
