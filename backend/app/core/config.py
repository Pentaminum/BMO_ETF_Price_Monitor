from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
from pathlib import Path

# project root
BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    """
    Application settings and environment configurations.
    Designed with scalability in mind to support different data sources.
    """
    PROJECT_NAME: str = "BMO ETF Price Monitor"

    # Defaults to 'CSV' for this OA, but architecture allows easy migration to 'DB' for production-grade scalability.
    DATA_SOURCE_TYPE: str = "CSV" 
    DATA_PRICE_PATH: str = str(BASE_DIR / "app/data/prices.csv")

    # Database Configuration (Future-proofing)
    # To be populated when migrating from CSV to a relational database (e.g., PostgreSQL)
    DATABASE_URL: Optional[str] = None 

    # To be used when .env file exists
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()