import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import get_db, Base
from app import crud, schemas

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


def test_root():
    """Test root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "Admin Service API"


def test_health():
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_create_and_login_admin():
    """Test admin user creation and login."""
    # Create admin user
    admin_data = {
        "username": "testadmin",
        "email": "test@example.com",
        "password": "testpass123",
        "first_name": "Test",
        "last_name": "Admin",
        "is_active": True
    }
    
    # First, we need to authenticate as an existing user to create new users
    # For testing, let's create a user directly in the database
    db = TestingSessionLocal()
    user_create = schemas.AdminUserCreate(**admin_data)
    user = crud.admin_user.create(db, obj_in=user_create)
    db.close()
    
    # Test login
    login_data = {
        "username": "testadmin",
        "password": "testpass123"
    }
    
    response = client.post("/auth/login-json", json=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["username"] == "testadmin"


def test_invalid_login():
    """Test login with invalid credentials."""
    login_data = {
        "username": "nonexistent",
        "password": "wrongpass"
    }
    
    response = client.post("/auth/login-json", json=login_data)
    assert response.status_code == 401


if __name__ == "__main__":
    pytest.main([__file__])
