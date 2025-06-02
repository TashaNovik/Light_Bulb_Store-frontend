from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID

from .. import crud, schemas
from ..database import get_db
router = APIRouter()


# Reference data endpoints
@router.get("/statuses", response_model=List[schemas.OrderStatusResponse])
def get_order_statuses(db: Session = Depends(get_db)):
    """Get all order statuses"""
    return crud.get_all_order_statuses(db)


@router.get("/delivery-methods", response_model=List[schemas.DeliveryMethodResponse])
def get_delivery_methods(db: Session = Depends(get_db)):
    """Get all delivery methods"""
    return crud.get_all_delivery_methods(db)


@router.get("/payment-methods", response_model=List[schemas.PaymentMethodResponse])
def get_payment_methods(db: Session = Depends(get_db)):
    """Get all payment methods"""
    return crud.get_all_payment_methods(db)

@router.post("/", response_model=schemas.OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_request: schemas.OrderCreate,
    db: Session = Depends(get_db)
):
    """Create a new order using backend schema"""
    try:
        db_order = crud.create_order(db=db, order_data=order_request)
        return schemas.OrderResponse.from_orm(db_order)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating order: {str(e)}"
        ) from e


@router.get("/", response_model=List[schemas.OrderSummaryResponse])
def get_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None),
    status_id: Optional[UUID] = Query(None),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    db: Session = Depends(get_db)
):
    """Get list of orders with filters and pagination"""
    orders = crud.get_orders(
        db=db,
        skip=skip,
        limit=limit,
        search=search,
        status_id=status_id,
        date_from=date_from,
        date_to=date_to
    )
      # Convert to summary format
    return [schemas.OrderSummaryResponse.from_orm(order) for order in orders]


@router.get("/stats")
def get_order_statistics(db: Session = Depends(get_db)):
    """Get order statistics for dashboard"""
    try:
        stats = crud.get_order_statistics(db)
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving order statistics: {str(e)}"
        ) from e


@router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order(order_id: UUID, db: Session = Depends(get_db)):
    """Get order by ID with full details"""
    db_order = crud.get_order(db, order_id=order_id)
    if db_order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    return schemas.OrderResponse.from_orm(db_order)


@router.get("/number/{order_number}", response_model=schemas.OrderResponse)
def get_order_by_number(order_number: str, db: Session = Depends(get_db)):
    """Get order by order number with full details"""
    db_order = crud.get_order_by_number(db, order_number=order_number)
    if db_order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    return schemas.OrderResponse.from_orm(db_order)


@router.patch("/{order_id}/status", response_model=schemas.OrderResponse)
def update_order_status(
    order_id: UUID,
    status_update: schemas.OrderStatusUpdate,
    db: Session = Depends(get_db)
):
    """Update order status"""
    db_order = crud.update_order_status(db, order_id=order_id, status_update=status_update)
    if db_order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    return schemas.OrderResponse.from_orm(db_order)


@router.get("/{order_id}/history", response_model=List[schemas.OrderStatusHistoryResponse])
def get_order_status_history(order_id: UUID, db: Session = Depends(get_db)):
    """Get order status history"""
    db_order = crud.get_order(db, order_id=order_id)
    if db_order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    history = crud.get_order_status_history(db, order_id)
    return [schemas.OrderStatusHistoryResponse.from_orm(h) for h in history]
