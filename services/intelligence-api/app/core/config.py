"""Application configuration."""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Deevo Intelligence API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:3001"]

    class Config:
        env_prefix = "DEEVO_"


settings = Settings()
