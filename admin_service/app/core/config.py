from pydantic_settings import BaseSettings
from typing import List, Union
import json


class Settings(BaseSettings):
    
    database_url: str = "postgresql+psycopg2://postgres:postgres@admin_db:5432/admin_db"
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 720  # 12 hours
    
    # CORS settings - allow multiple frontend ports
    cors_origins: Union[List[str], str] = [
        "http://localhost:3000",  # Admin app
        "http://localhost:3001",  # Client app
        "http://localhost:8080",  # Alternative port
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:3000",  # Alternative localhost
        "http://127.0.0.1:3001",  # Alternative localhost
    ]
    
    # Other microservices URLs
    product_service_url: str = "http://product-api:8000"
    order_service_url: str = "http://order-api:8000"
    
    class Config:
        env_file = ".env"
        
        @classmethod
        def parse_env_var(cls, field_name: str, raw_val: str) -> any:
            if field_name == 'cors_origins':
                try:
                    # Try to parse as JSON list
                    return json.loads(raw_val)
                except (json.JSONDecodeError, TypeError):
                    # If it fails, split by comma and strip whitespace
                    return [origin.strip() for origin in raw_val.split(',')]
            return cls.json_loads(raw_val)


settings = Settings()
