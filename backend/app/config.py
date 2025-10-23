"""
Configuration module for HotRide Driver API.
Manages environment variables and application settings.
"""

from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # MongoDB Configuration
    mongodb_url: str
    mongodb_db_name: str

    # API Security
    api_key: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"

    # File Upload Configuration
    upload_dir: str = "./uploads/profile_photos"
    max_file_size: int = 5242880  # 5MB in bytes
    allowed_extensions: str = "jpg,jpeg,png"

    # Application Configuration
    api_v1_prefix: str = "/api/v1"
    debug: bool = False

    class Config:
        env_file = ".env"
        case_sensitive = False

    @property
    def allowed_extensions_list(self) -> List[str]:
        """Return allowed extensions as a list."""
        return [ext.strip().lower() for ext in self.allowed_extensions.split(",")]


# Create a global settings instance
settings = Settings()
