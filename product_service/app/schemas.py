from pydantic import BaseModel, Field, UUID4, condecimal
from typing import Optional, Dict, Any
from datetime import datetime

class ProductBase(BaseModel):
    name: str = Field(..., max_length=255)
    sku: str = Field(..., max_length=100)
    description: Optional[str] = None
    manufacturer_name: Optional[str] = 'ООО "Лампочка"'
    current_price: condecimal(max_digits=10, decimal_places=2, ge=0)
    stock_quantity: int = Field(0, ge=0)
    image_url: Optional[str] = None
    attributes: Optional[Dict[str, Any]] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    name: Optional[str] = None
    sku: Optional[str] = None
    current_price: Optional[condecimal(max_digits=10, decimal_places=2, ge=0)] = None
    stock_quantity: Optional[int] = None

class ProductInDB(ProductBase):
    id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Product(ProductInDB):
    pass
