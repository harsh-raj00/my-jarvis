from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Database
    database_url: str = "mysql+mysqlconnector://root:password@localhost:3306/jarvis_db"
    database_pool_size: int = 20
    database_max_overflow: int = 40
    
    # Gemini API
    gemini_api_key: str = ""
    gemini_model: str = "gemini-3-flash-preview"
    
    # Speech
    speech_recognition_engine: str = "whisper"
    whisper_model: str = "base"
    eleven_labs_api_key: Optional[str] = None
    
    # Security
    secret_key: str = "dev-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    environment: str = "development"
    
    # CORS
    allowed_origins: str = "http://localhost:3000,http://localhost:5173,http://localhost:8080"
    
    # File paths
    upload_dir: str = "uploads"
    audio_dir: str = "audio_files"
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Ignore extra fields from .env

settings = Settings()