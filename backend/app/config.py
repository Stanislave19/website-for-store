from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql://store_user:change_me@db:5432/store_db"
    secret_key: str = "change_me"
    backend_cors_origins: str = "http://localhost:3000"

    telegram_bot_token: str = ""
    telegram_chat_ids: str = ""

    nova_poshta_api_key: str = ""

    @property
    def telegram_chat_id_list(self) -> list[str]:
        return [chat_id.strip() for chat_id in self.telegram_chat_ids.split(",") if chat_id.strip()]


settings = Settings()
