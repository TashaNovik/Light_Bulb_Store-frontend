import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import get_db, Base
from app import models
import uuid

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_filtering.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(scope="module")
def setup_test_data():
    # Create test database
    Base.metadata.create_all(bind=engine)
    
    db = TestingSessionLocal()
    
    try:
        # Create test statuses
        status1 = models.OrderStatus(
            id=uuid.uuid4(),
            code="NEW",
            name="Новый"
        )
        status2 = models.OrderStatus(
            id=uuid.uuid4(),
            code="PROCESSING",
            name="В обработке"
        )
        
        # Create test delivery method
        delivery_method = models.DeliveryMethod(
            id=uuid.uuid4(),
            code="COURIER",
            name="Курьер"
        )
        
        # Create test payment method
        payment_method = models.PaymentMethod(
            id=uuid.uuid4(),
            code="CASH",
            name="Наличные"
        )
        
        db.add_all([status1, status2, delivery_method, payment_method])
        db.commit()
        
        # Create test orders
        order1 = models.Order(
            id=uuid.uuid4(),
            order_number="ORD-001",
            customer_name="Иван Иванов",
            customer_phone="+79001234567",
            customer_email="ivan@test.com",
            status_id=status1.id,
            delivery_method_id=delivery_method.id,
            total_amount=1000.00,
            currency="RUB"
        )
        
        order2 = models.Order(
            id=uuid.uuid4(),
            order_number="ORD-002",
            customer_name="Петр Петров",
            customer_phone="+79001234568",
            customer_email="petr@test.com",
            status_id=status2.id,
            delivery_method_id=delivery_method.id,
            total_amount=2000.00,
            currency="RUB"
        )
        
        db.add_all([order1, order2])
        db.commit()
        
        return {
            "status1": status1,
            "status2": status2,
            "order1": order1,
            "order2": order2
        }
        
    finally:
        db.close()

def test_orders_list(setup_test_data):
    """Test getting orders list"""
    response = client.get("/api/v1/orders/")
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert "total" in data
    assert len(data["data"]) == 2

def test_filter_by_status_code(setup_test_data):
    """Test filtering orders by status code"""
    response = client.get("/api/v1/orders/?status=NEW")
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 1
    assert data["data"][0]["status_ref"]["code"] == "NEW"

def test_filter_by_search(setup_test_data):
    """Test filtering orders by search query"""
    response = client.get("/api/v1/orders/?search=Иван")
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 1
    assert "Иван" in data["data"][0]["customer_name"]

def test_filter_by_order_number(setup_test_data):
    """Test filtering orders by order number"""
    response = client.get("/api/v1/orders/?search=ORD-001")
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 1
    assert data["data"][0]["order_number"] == "ORD-001"

def test_pagination(setup_test_data):
    """Test pagination"""
    response = client.get("/api/v1/orders/?limit=1")
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 1
    assert data["total"] == 2
    assert data["limit"] == 1

if __name__ == "__main__":
    pytest.main([__file__])
