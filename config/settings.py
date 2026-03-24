from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Deevo Executive Intelligence API"
    app_version: str = "1.0.0"
    debug: bool = False
    api_prefix: str = "/api"
    cors_origins: list = ["*"]
    cors_credentials: bool = True
    cors_methods: list = ["*"]
    cors_headers: list = ["*"]
    
    class Config:
        env_file = ".env"

settings = Settings()
