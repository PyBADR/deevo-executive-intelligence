from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    app_name: str = "Deevo Executive Intelligence"
    app_version: str = "1.0.0"
    debug: bool = False
    api_version: str = "v1"
    allowed_origins: list = ["*"]
    
    class Config:
        env_file = ".env"

settings = Settings()
