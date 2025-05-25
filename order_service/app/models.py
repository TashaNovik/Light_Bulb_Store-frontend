from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Boolean, Integer, DECIMAL, Index, text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from .database import Base


class OrderStatus(Base):
    __tablename__ = "order_statuses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    code = Column(String(50), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'))
    updated_at = Column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'), onupdate=text('CURRENT_TIMESTAMP'))

    # Relationships
    orders = relationship("Order", back_populates="status_ref")
    status_history = relationship("OrderStatusHistory", back_populates="status_ref")


class DeliveryMethod(Base):
    __tablename__ = "delivery_methods"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    code = Column(String(50), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'))
    updated_at = Column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'), onupdate=text('CURRENT_TIMESTAMP'))

    # Relationships
    orders = relationship("Order", back_populates="delivery_method_ref")


class PaymentMethod(Base):
    __tablename__ = "payment_methods"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    code = Column(String(50), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'))
    updated_at = Column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'), onupdate=text('CURRENT_TIMESTAMP'))

    # Relationships
    payment_details = relationship("PaymentDetail", back_populates="payment_method_ref")


class Order(Base):
    __tablename__ = "orders"
    __table_args__ = (
        Index('idx_order_status', 'status_id'),
        Index('idx_order_user', 'user_id'),
        Index('idx_order_number', 'order_number'),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    order_number = Column(String(50), unique=True, nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=True)  # For registered users
    status_id = Column(UUID(as_uuid=True), ForeignKey("order_statuses.id"), nullable=False)
    total_amount = Column(DECIMAL(12, 2), nullable=False)
    currency = Column(String(3), nullable=False, default='RUB')
    customer_name = Column(String(255), nullable=False)
    customer_phone = Column(String(50), nullable=False)
    customer_email = Column(String(255), nullable=False)
    delivery_method_id = Column(UUID(as_uuid=True), ForeignKey("delivery_methods.id"), nullable=False)
    shipping_address_id = Column(UUID(as_uuid=True), ForeignKey("shipping_addresses.id", ondelete="SET NULL"), nullable=True)
    customer_notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'))
    updated_at = Column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'), onupdate=text('CURRENT_TIMESTAMP'))

    # Relationships
    status_ref = relationship("OrderStatus", back_populates="orders")
    delivery_method_ref = relationship("DeliveryMethod", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    shipping_address = relationship("ShippingAddress", back_populates="order", uselist=False)
    payment_detail = relationship("PaymentDetail", back_populates="order", uselist=False, cascade="all, delete-orphan")
    status_history = relationship("OrderStatusHistory", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"
    __table_args__ = (
        Index('idx_order_item_order', 'order_id'),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(UUID(as_uuid=True), nullable=False)  # Reference to product service
    product_snapshot_name = Column(String(255), nullable=False)
    product_snapshot_price = Column(DECIMAL(10, 2), nullable=False)
    quantity = Column(Integer, nullable=False)
    subtotal_amount = Column(DECIMAL(12, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'))
    updated_at = Column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'), onupdate=text('CURRENT_TIMESTAMP'))

    # Relationships
    order = relationship("Order", back_populates="items")


class ShippingAddress(Base):
    __tablename__ = "shipping_addresses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    recipient_name = Column(String(255))
    recipient_phone = Column(String(50))
    country = Column(String(100), nullable=False, default='Россия')
    city = Column(String(100), nullable=False)
    street_address = Column(String(255), nullable=False)
    apartment = Column(String(50))
    postal_code = Column(String(20))
    address_notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'))
    updated_at = Column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'), onupdate=text('CURRENT_TIMESTAMP'))

    # Relationships
    order = relationship("Order", back_populates="shipping_address", uselist=False)


class OrderStatusHistory(Base):
    __tablename__ = "order_status_history"
    __table_args__ = (
        Index('idx_status_history_order', 'order_id'),
        Index('idx_status_history_status', 'status_id'),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    status_id = Column(UUID(as_uuid=True), ForeignKey("order_statuses.id"), nullable=False)
    changed_at = Column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'))
    actor_details = Column(Text)
    notes = Column(Text)

    # Relationships
    order = relationship("Order", back_populates="status_history")
    status_ref = relationship("OrderStatus", back_populates="status_history")


class PaymentDetail(Base):
    __tablename__ = "payment_details"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), unique=True, nullable=False)
    payment_method_id = Column(UUID(as_uuid=True), ForeignKey("payment_methods.id"), nullable=False)
    payment_provider = Column(String(100))
    transaction_id = Column(String(255), unique=True)
    payment_status_code = Column(String(50), nullable=False, default='PENDING')
    amount = Column(DECIMAL(12, 2), nullable=False)
    currency = Column(String(3), nullable=False, default='RUB')
    paid_at = Column(DateTime(timezone=True))
    payment_details_snapshot = Column(JSONB)
    created_at = Column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'))
    updated_at = Column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'), onupdate=text('CURRENT_TIMESTAMP'))

    # Relationships
    order = relationship("Order", back_populates="payment_detail")
    payment_method_ref = relationship("PaymentMethod", back_populates="payment_details")
