from pydantic import BaseModel, EmailStr, Field, UUID4
from typing import List, Optional, Dict, Any
from datetime import datetime
from decimal import Decimal

class OrderStatusBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None


class OrderStatus(OrderStatusBase):
    id: UUID4
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DeliveryMethodBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    is_active: bool = True


class DeliveryMethod(DeliveryMethodBase):
    id: UUID4
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PaymentMethodBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    is_active: bool = True


class PaymentMethod(PaymentMethodBase):
    id: UUID4
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class OrderItemBase(BaseModel):
    product_id: UUID4
    product_snapshot_name: str
    product_snapshot_price: Decimal = Field(..., ge=0)
    quantity: int = Field(..., gt=0)


class OrderItemCreate(BaseModel):
    product_id: UUID4
    product_snapshot_name: str
    product_snapshot_price: Decimal = Field(..., ge=0)
    quantity: int = Field(..., gt=0)
    product_snapshot_metadata: Optional[Dict[str, Any]] = None


class OrderItem(OrderItemBase):
    id: UUID4
    order_id: UUID4
    subtotal_amount: Decimal
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ShippingAddressBase(BaseModel):
    recipient_name: Optional[str] = None
    recipient_phone: Optional[str] = None
    country: str = "Россия"
    city: str
    street_address: str
    apartment: Optional[str] = None
    postal_code: Optional[str] = None
    address_notes: Optional[str] = None


class ShippingAddressCreate(ShippingAddressBase):
    pass


class ShippingAddress(ShippingAddressBase):
    id: UUID4
    order_id: UUID4
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PaymentDetailBase(BaseModel):
    payment_provider: Optional[str] = None
    transaction_id: Optional[str] = None
    payment_status_code: str = "PENDING"
    amount: Decimal = Field(..., ge=0)
    currency: str = "RUB"
    paid_at: Optional[datetime] = None
    payment_details_snapshot: Optional[Dict[str, Any]] = None


class PaymentDetailCreate(BaseModel):
    payment_method_id: UUID4
    payment_provider: Optional[str] = None
    transaction_id: Optional[str] = None
    amount: Decimal = Field(..., ge=0)
    currency: str = "RUB"
    payment_details_snapshot: Optional[Dict[str, Any]] = None


class PaymentDetail(PaymentDetailBase):
    id: UUID4
    order_id: UUID4
    payment_method_id: UUID4
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class OrderStatusHistoryBase(BaseModel):
    status_id: UUID4
    actor_details: Optional[str] = None
    notes: Optional[str] = None


class OrderStatusHistoryCreate(OrderStatusHistoryBase):
    pass


class OrderStatusHistory(OrderStatusHistoryBase):
    id: UUID4
    order_id: UUID4
    changed_at: datetime

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    customer_name: str
    customer_phone: str
    customer_email: Optional[EmailStr] = None
    delivery_method_id: UUID4
    customer_notes: Optional[str] = None


class OrderCreate(OrderBase):
    order_items: List[OrderItemCreate]
    payment_method_id: UUID4
    shipping_address: Optional[ShippingAddressCreate] = None
    payment_details_client: Optional[Dict[str, Any]] = None


class OrderCreateWithMethodCodes(BaseModel):
    customer_name: str
    customer_phone: str
    customer_email: Optional[EmailStr] = None
    delivery_method_code: str
    payment_method_code: str
    order_items: List[OrderItemCreate]
    shipping_address: Optional[ShippingAddressCreate] = None
    customer_notes: Optional[str] = None
    payment_details_client: Optional[Dict[str, Any]] = None


class OrderUpdate(BaseModel):
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_email: Optional[EmailStr] = None
    delivery_method_id: Optional[UUID4] = None
    customer_notes: Optional[str] = None


class OrderStatusUpdate(BaseModel):
    status_id: UUID4
    actor_details: Optional[str] = None
    notes: Optional[str] = None


class Order(OrderBase):
    id: UUID4
    order_number: str
    user_id: Optional[UUID4] = None
    status_id: UUID4
    total_amount: Decimal
    currency: str
    shipping_address_id: Optional[UUID4] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    items: List[OrderItem] = []
    shipping_address: Optional[ShippingAddress] = None
    payment_detail: Optional[PaymentDetail] = None

    class Config:
        from_attributes = True


class OrderWithDetails(Order):
    status_name: Optional[str] = None
    delivery_method_name: Optional[str] = None
    payment_method_name: Optional[str] = None
    status_history: List[OrderStatusHistory] = []

    class Config:
        from_attributes = True


class OrderSummary(BaseModel):
    id: UUID4
    order_number: str
    customer_name: str
    customer_email: EmailStr
    total_amount: Decimal
    status_name: str
    created_at: datetime

    class Config:
        from_attributes = True


class OrderListResponse(BaseModel):
    data: List[OrderSummary]
    pagination: Dict[str, int]


class CreateOrderRequest(BaseModel):
    customer_name: str
    customer_phone: str
    customer_email: EmailStr
    delivery_method_id: UUID4
    payment_method_id: UUID4
    customer_notes: Optional[str] = None
    shipping_address: Optional[ShippingAddressCreate] = None
    order_items: List[OrderItemCreate]
    payment_details_client: Optional[Dict[str, Any]] = None


class OrderStatusResponse(BaseModel):
    id: UUID4
    code: str
    name: str
    description: Optional[str] = None
    is_active: bool = True
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DeliveryMethodResponse(BaseModel):
    id: UUID4
    code: str
    name: str
    description: Optional[str] = None
    is_active: bool = True
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PaymentMethodResponse(BaseModel):
    id: UUID4
    code: str
    name: str
    description: Optional[str] = None
    is_active: bool = True
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class OrderItemResponse(BaseModel):
    id: UUID4
    product_id: UUID4
    product_snapshot_name: str
    product_snapshot_price: Decimal
    quantity: int
    subtotal_amount: Decimal
    product_snapshot_metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ShippingAddressResponse(BaseModel):
    id: UUID4
    recipient_name: Optional[str] = None
    recipient_phone: Optional[str] = None
    country: str
    city: str
    street_address: str
    apartment: Optional[str] = None
    postal_code: Optional[str] = None
    address_notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PaymentDetailResponse(BaseModel):
    id: UUID4
    payment_method_id: UUID4
    payment_provider: Optional[str] = None
    transaction_id: Optional[str] = None
    payment_status_code: str
    amount: Decimal
    currency: str
    paid_at: Optional[datetime] = None
    payment_details_snapshot: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    payment_method_ref: Optional[PaymentMethodResponse] = None

    class Config:
        from_attributes = True


class OrderStatusHistoryResponse(BaseModel):
    id: UUID4
    order_id: UUID4
    status_id: UUID4
    actor_details: Optional[str] = None
    notes: Optional[str] = None
    changed_at: datetime
    
    status_ref: Optional[OrderStatusResponse] = None

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: UUID4
    order_number: str
    user_id: Optional[UUID4] = None
    status_id: UUID4
    delivery_method_id: UUID4
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    total_amount: Decimal
    currency: str
    customer_notes: Optional[str] = None
    shipping_address_id: Optional[UUID4] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Relationships
    items: List[OrderItemResponse] = []
    shipping_address: Optional[ShippingAddressResponse] = None
    payment_detail: Optional[PaymentDetailResponse] = None
    status_ref: Optional[OrderStatusResponse] = None
    delivery_method_ref: Optional[DeliveryMethodResponse] = None

    class Config:
        from_attributes = True


class OrderSummaryResponse(BaseModel):
    id: UUID4
    order_number: str
    customer_name: str
    customer_email: Optional[str] = None
    total_amount: Decimal
    currency: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    status_ref: Optional[OrderStatusResponse] = None

    class Config:
        from_attributes = True
