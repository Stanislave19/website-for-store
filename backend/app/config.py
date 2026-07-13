from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql://store_user:change_me@db:5432/store_db"
    secret_key: str = "change_me"
    backend_cors_origins: str = "http://localhost:3000"

    telegram_bot_token: str = ""
    telegram_chat_id: str = ""


settings = Settings()
