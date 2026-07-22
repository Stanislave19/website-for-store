from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql://store_user:change_me@db:5432/store_db"
    secret_key: str = "change_me"
    backend_cors_origins: str = "http://localhost:3000"

    telegram_bot_token: str = ""
    telegram_chat_ids: str = ""

    nova_poshta_api_key: str = ""

    # 72 години: адмінський токен не відкликається на сервері (logout лише
    # чистить куку в браузері), тому довший термін життя означає довше вікно
    # зловживання вкраденою кукою. 3 доби — компроміс між безпекою й тим, щоб
    # не перелогинюватись щодня.
    admin_token_expire_minutes: int = 60 * 24 * 3
    admin_cookie_name: str = "admin_token"
    admin_cookie_secure: bool = False

    client_token_expire_minutes: int = 60 * 24 * 30
    client_cookie_name: str = "client_token"

    media_dir: str = "media"

    @property
    def telegram_chat_id_list(self) -> list[str]:
        return [chat_id.strip() for chat_id in self.telegram_chat_ids.split(",") if chat_id.strip()]

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.backend_cors_origins.split(",") if origin.strip()]


settings = Settings()

# SECRET_KEY підписує всі JWT-токени (адмінка й клієнти). Дефолтне значення
# з .env.example ("change_me") не має потрапити на прод чи в жоден реальний
# .env — інакше будь-хто, хто бачив цей код, може підробити токен адміна.
# Падаємо одразу при старті, а не мовчки працюємо з дірявим секретом.
if settings.secret_key.strip() in {"", "change_me"}:
    raise RuntimeError(
        "SECRET_KEY не задано або лишено дефолтним ('change_me'). "
        "Згенеруйте випадковий секрет і впишіть його в .env як SECRET_KEY."
    )
