from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg2://postgres:postgres@admin_db:5432/admin_db"
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 720  # 12 hours
    
    # CORS settings
    cors_origins: list = ["http://localhost:3000", "http://localhost:8080"]
    
    # Other microservices URLs
    product_service_url: str = "http://product-api:8000"
    order_service_url: str = "http://order-api:8000"
    
    class Config:
        env_file = ".env"


settings = Settings()
