from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, func, and_, or_
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
from decimal import Decimal

from . import models, schemas
import logging
logger = logging.getLogger(__name__)

# Reference data CRUD
def get_order_statuses(db: Session) -> List[models.OrderStatus]:
    return db.query(models.OrderStatus).order_by(models.OrderStatus.name).all()


def get_delivery_methods(db: Session, active_only: bool = True) -> List[models.DeliveryMethod]:
    query = db.query(models.DeliveryMethod)
    if active_only:
        query = query.filter(models.DeliveryMethod.is_active == True)
    return query.order_by(models.DeliveryMethod.name).all()


def get_payment_methods(db: Session, active_only: bool = True) -> List[models.PaymentMethod]:
    query = db.query(models.PaymentMethod)
    if active_only:
        query = query.filter(models.PaymentMethod.is_active == True)
    return query.order_by(models.PaymentMethod.name).all()


def get_order_status_by_code(db: Session, code: str) -> Optional[models.OrderStatus]:
    return db.query(models.OrderStatus).filter(models.OrderStatus.code == code).first()


def get_delivery_method_by_code(db: Session, code: str) -> Optional[models.DeliveryMethod]:
    return db.query(models.DeliveryMethod).filter(models.DeliveryMethod.code == code).first()


def get_payment_method_by_code(db: Session, code: str) -> Optional[models.PaymentMethod]:
    return db.query(models.PaymentMethod).filter(models.PaymentMethod.code == code).first()


# Order CRUD operations
def create_order(db: Session, order_data: schemas.CreateOrderRequest) -> models.Order:
    """Create a new order with all related entities"""
    
    # Get default "NEW" status
    new_status = get_order_status_by_code(db, "NEW")
    if not new_status:
        raise ValueError("Order status 'NEW' not found")
    
    # Calculate total amount
    total_amount = Decimal(0)
    for item in order_data.order_items:
        total_amount += item.product_snapshot_price * item.quantity
    
    # Generate unique order number
    order_number = f"ORD-{datetime.now().strftime('%Y-%m')}-{str(uuid.uuid4())[:8].upper()}"
    
    # Create main order
    db_order = models.Order(
        order_number=order_number,
        status_id=new_status.id,
        total_amount=total_amount,
        currency="RUB",
        customer_name=order_data.customer_name,
        customer_phone=order_data.customer_phone,
        customer_email=order_data.customer_email,
        delivery_method_id=order_data.delivery_method_id,
        customer_notes=order_data.customer_notes
    )
    
    db.add(db_order)
    db.flush()  # Get the order ID
    
    # Create order items
    for item_data in order_data.order_items:
        subtotal = item_data.product_snapshot_price * item_data.quantity
        db_item = models.OrderItem(
            order_id=db_order.id,
            product_id=item_data.product_id,
            product_snapshot_name=item_data.product_snapshot_name,
            product_snapshot_price=item_data.product_snapshot_price,
            quantity=item_data.quantity,
            subtotal_amount=subtotal
        )
        db.add(db_item)
    
    # Create shipping address if provided
    if order_data.shipping_address:
        db_address = models.ShippingAddress(
            recipient_name=order_data.shipping_address.recipient_name or order_data.customer_name,
            recipient_phone=order_data.shipping_address.recipient_phone or order_data.customer_phone,
            country=order_data.shipping_address.country,
            city=order_data.shipping_address.city,
            street_address=order_data.shipping_address.street_address,
            apartment=order_data.shipping_address.apartment,
            postal_code=order_data.shipping_address.postal_code,
            address_notes=order_data.shipping_address.address_notes
        )
        db.add(db_address)
        db.flush()
        db_order.shipping_address_id = db_address.id
      # Create payment details
    db_payment = models.PaymentDetail(
        order_id=db_order.id,
        payment_method_id=order_data.payment_method_id,
        amount=total_amount,
        currency="RUB",
        payment_status_code="PENDING",
        payment_details_snapshot=order_data.payment_details_client
    )
    db.add(db_payment)
    
    # Create initial status history
    db_status_history = models.OrderStatusHistory(
        order_id=db_order.id,
        status_id=new_status.id,
        actor_details="System: Order created",
        notes="Order created automatically"
    )
    db.add(db_status_history)
    
    db.commit()
    db.refresh(db_order)
    
    return db_order


def get_order(db: Session, order_id: uuid.UUID) -> Optional[models.Order]:
    return db.query(models.Order).options(
        joinedload(models.Order.items),
        joinedload(models.Order.shipping_address),
        joinedload(models.Order.payment_detail),
        joinedload(models.Order.status_ref),
        joinedload(models.Order.delivery_method_ref)
    ).filter(models.Order.id == order_id).first()


def get_order_by_number(db: Session, order_number: str) -> Optional[models.Order]:
    return db.query(models.Order).options(
        joinedload(models.Order.items),
        joinedload(models.Order.shipping_address),
        joinedload(models.Order.payment_detail),
        joinedload(models.Order.status_ref),
        joinedload(models.Order.delivery_method_ref)
    ).filter(models.Order.order_number == order_number).first()


def get_orders(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    status_id: Optional[uuid.UUID] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None
) -> List[models.Order]:
    query = db.query(models.Order).options(
        joinedload(models.Order.status_ref)
    )

    # Apply filters
    if search:
        query = query.filter(
            or_(
                models.Order.order_number.ilike(f"%{search}%"),
                models.Order.customer_name.ilike(f"%{search}%"),
                models.Order.customer_email.ilike(f"%{search}%")
            )
        )
    if status_id:
        logger.info("Filtering by status_id: %s (type: %s)", status_id, type(status_id))
        query = query.filter(models.Order.status_id == status_id)
    
    if date_from:
        query = query.filter(models.Order.created_at >= date_from)
    
    if date_to:
        query = query.filter(models.Order.created_at <= date_to)
    
    return query.order_by(desc(models.Order.created_at)).offset(skip).limit(limit).all()


def get_orders_count(
    db: Session,
    search: Optional[str] = None,
    status_id: Optional[uuid.UUID] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None
) -> int:
    query = db.query(func.count(models.Order.id))
    
    # Apply same filters as get_orders
    if search:
        query = query.filter(
            or_(
                models.Order.order_number.ilike(f"%{search}%"),
                models.Order.customer_name.ilike(f"%{search}%"),
                models.Order.customer_email.ilike(f"%{search}%")
            )
        )
    
    if status_id:
        query = query.filter(models.Order.status_id == status_id)
    
    if date_from:
        query = query.filter(models.Order.created_at >= date_from)
    
    if date_to:
        query = query.filter(models.Order.created_at <= date_to)
    
    return query.scalar()


def update_order_status(
    db: Session,
    order_id: uuid.UUID,
    status_update: schemas.OrderStatusUpdate
) -> Optional[models.Order]:
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        return None
    
    # Update order status
    old_status_id = db_order.status_id
    db_order.status_id = status_update.status_id
    db_order.updated_at = func.current_timestamp()
    
    # Create status history entry
    db_status_history = models.OrderStatusHistory(
        order_id=order_id,
        status_id=status_update.status_id,
        actor_details=status_update.actor_details,
        notes=status_update.notes
    )
    db.add(db_status_history)
    
    db.commit()
    db.refresh(db_order)
    
    return db_order


def get_order_status_history(db: Session, order_id: uuid.UUID) -> List[models.OrderStatusHistory]:
    return db.query(models.OrderStatusHistory).options(
        joinedload(models.OrderStatusHistory.status_ref)
    ).filter(
        models.OrderStatusHistory.order_id == order_id
    ).order_by(models.OrderStatusHistory.changed_at).all()


# Initialize reference data
def init_reference_data(db: Session):
    """Initialize reference data if not exists"""
    
    # Order statuses

    statuses = [
        {
            "id": uuid.UUID("f7661699-0081-4b93-b227-f51c2a188936"),
            "code": "NEW",
            "name": "Новый",
            "description": "Заказ создан"
        },
        {
            "id": uuid.UUID("d5ee11b3-2dc2-4eeb-81fd-ebeeb7fa35cd"),
            "code": "PENDING_PAYMENT",
            "name": "Ожидает оплаты",
            "description": "Заказ ожидает подтверждения оплаты"
        },
        {
            "id": uuid.UUID("e87d2783-d80f-4a42-a7e4-a7302f6b7510"),
            "code": "PROCESSING",
            "name": "В обработке",
            "description": "Заказ принят к обработке"
        },
        {
            "id": uuid.UUID("823f3c37-200e-4a7c-9466-84ea031e3af3"),
            "code": "SHIPPED",
            "name": "Отправлен",
            "description": "Заказ отправлен"
        },
        {
            "id": uuid.UUID("823d75db-b9c6-4f58-a2f0-1bbc294cc910"),
            "code": "DELIVERED",
            "name": "Доставлен",
            "description": "Заказ доставлен"
        },
        {
            "id": uuid.UUID("0a455718-3182-4366-a857-94ada249ed11"),
            "code": "CANCELLED",
            "name": "Отменен",
            "description": "Заказ отменен"
        },
    ]
    
    for status_data in statuses:
        existing = get_order_status_by_code(db, status_data["code"])
        if not existing:
            db_status = models.OrderStatus(**status_data)
            db.add(db_status)
    
    # Delivery methods
    delivery_methods = [
        {
            "id": uuid.UUID("fad12742-f0f9-4873-952e-3bd25cfdc562"),
            "code": "PICKUP_STORE",
            "name": "Самовывоз из магазина",
            "description": "Самовывоз из пункта выдачи"
        },
        {
            "id": uuid.UUID("3898bb05-83dd-473f-ad5b-3a80ae68b5e0"),
            "code": "PICKUP_POST",
            "name": "Самовывоз из почтового отделения",
            "description": "Самовывоз из ближайшего отделения"
        },
        {
            "id": uuid.UUID("7cd59a83-1d98-450b-abef-b55a9838d3e3"),
            "code": "COURIER_HOME",
            "name": "Доставка курьером на дом",
            "description": "Курьерская доставка по адресу"
        },
    ]
    
    for method_data in delivery_methods:
        existing = get_delivery_method_by_code(db, method_data["code"])
        if not existing:
            db_method = models.DeliveryMethod(**method_data)
            db.add(db_method)

    # Payment methods
    payment_methods = [
        {
            "id": uuid.UUID("7ed3c963-8440-4b57-9ca5-f80e8b150b74"),
            "code": "CASH",
            "name": "Наличные",
            "description": "Оплата наличными при получении"
        },
        {
            "id": uuid.UUID("d9dceffc-29d6-41e8-b861-2f5daf5a498b"),
            "code": "CARD",
            "name": "Картой",
            "description": "Оплата банковской картой"
        },
        {
            "id": uuid.UUID("2cba9518-21a4-4e4d-9dbb-b395cc10a40c"),
            "code": "ONLINE",
            "name": "Онлайн",
            "description": "Онлайн-оплата на сайте"
        },
    ]
    
    for method_data in payment_methods:
        existing = get_payment_method_by_code(db, method_data["code"])
        if not existing:
            db_method = models.PaymentMethod(**method_data)
            db.add(db_method)
    
    db.commit()


# Get all reference data functions
def get_all_order_statuses(db: Session) -> List[models.OrderStatus]:
    """Get all order statuses"""
    return db.query(models.OrderStatus).order_by(models.OrderStatus.name).all()


def get_all_delivery_methods(db: Session) -> List[models.DeliveryMethod]:
    """Get all delivery methods"""
    return db.query(models.DeliveryMethod).order_by(models.DeliveryMethod.name).all()


def get_all_payment_methods(db: Session) -> List[models.PaymentMethod]:
    """Get all payment methods"""
    return db.query(models.PaymentMethod).order_by(models.PaymentMethod.name).all()


# Create order with method codes (for frontend compatibility)
def create_order_with_codes(db: Session, order_data: schemas.OrderCreateWithMethodCodes) -> models.Order:
    """Create order using delivery and payment method codes instead of UUIDs"""
    
    # Get delivery method by code
    delivery_method = get_delivery_method_by_code(db, order_data.delivery_method_code)
    if not delivery_method:
        raise ValueError(f"Delivery method with code '{order_data.delivery_method_code}' not found")
    
    # Get payment method by code
    payment_method = get_payment_method_by_code(db, order_data.payment_method_code)
    if not payment_method:
        raise ValueError(f"Payment method with code '{order_data.payment_method_code}' not found")
    
    # Convert to regular OrderCreate with UUIDs
    order_create_data = schemas.OrderCreate(
        customer_name=order_data.customer_name,
        customer_phone=order_data.customer_phone,
        customer_email=order_data.customer_email,
        delivery_method_id=delivery_method.id,
        payment_method_id=payment_method.id,
        order_items=order_data.order_items,
        shipping_address=order_data.shipping_address,
        payment_details_client=order_data.payment_details_client
    )
    
    # Use existing create_order function
    return create_order(db, order_create_data)


def get_all_reference_data(db: Session) -> dict:
    """Get all reference data for frontend"""
    return {
        "order_statuses": get_all_order_statuses(db),
        "delivery_methods": get_all_delivery_methods(db),
        "payment_methods": get_all_payment_methods(db)
    }


def get_order_statistics(db: Session) -> dict:
    """Get order statistics for dashboard"""
    from sqlalchemy import func
    
    # Get total orders count
    total_orders = db.query(func.count(models.Order.id)).scalar()
    
    # Get orders by status counts
    status_counts = db.query(
        models.OrderStatus.code,
        func.count(models.Order.id).label('count')
    ).join(
        models.Order, models.OrderStatus.id == models.Order.status_id
    ).group_by(models.OrderStatus.code).all()
    
    # Convert to dictionary
    status_dict = {status_code: count for status_code, count in status_counts}
    
    return {
        "total_orders": total_orders,
        "pending_orders": status_dict.get("PENDING_PAYMENT", 0),
        "processing_orders": status_dict.get("PROCESSING", 0), 
        "shipped_orders": status_dict.get("SHIPPED", 0),
        "delivered_orders": status_dict.get("DELIVERED", 0),
        "cancelled_orders": status_dict.get("CANCELLED", 0),
        "new_orders": status_dict.get("NEW", 0),
        "status_breakdown": status_dict
    }
