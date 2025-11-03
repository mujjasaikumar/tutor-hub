"""Application configuration and environment settings."""
import os
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

class DatabaseConfig:
    """Database connection configuration."""
    MONGO_URL: str = os.environ['MONGO_URL']
    DB_NAME: str = os.environ['DB_NAME']

class SecurityConfig:
    """Security and authentication configuration."""
    JWT_SECRET_KEY: str = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    PASSWORD_HASH_SCHEMES: list = ["bcrypt"]

class ApplicationConfig:
    """General application configuration."""
    APP_NAME: str = "TutorHub"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.environ.get('DEBUG', 'False').lower() == 'true'
