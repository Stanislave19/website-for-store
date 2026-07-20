from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql://store_user:change_me@db:5432/store_db"
    secret_key: str = "change_me"
    backend_cors_origins: str = "http://localhost:3000"

    telegram_bot_token: str = ""
    telegram_chat_ids: str = ""

    nova_poshta_api_key: str = ""

    admin_token_expire_minutes: int = 60 * 24 * 14
    admin_cookie_name: str = "admin_token"
    admin_cookie_secure: bool = False

    media_dir: str = "media"

    @property
    def telegram_chat_id_list(self) -> list[str]:
        return [chat_id.strip() for chat_id in self.telegram_chat_ids.split(",") if chat_id.strip()]

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.backend_cors_origins.split(",") if origin.strip()]


settings = Settings()
