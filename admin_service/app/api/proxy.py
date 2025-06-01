import httpx
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from ..core.config import settings
from ..database import get_db
from .. import models
from ..dependencies import get_current_active_user, log_user_action

router = APIRouter()


async def make_service_request(
    method: str,
    service_url: str,
    endpoint: str,
    **kwargs
) -> Dict[Any, Any]:
    """Make HTTP request to another microservice."""
    url = f"{service_url}{endpoint}"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.request(method, url, **kwargs)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Service request failed: {e.response.text}"
            )
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Service unavailable: {str(e)}"
            )


# Product management endpoints
@router.get("/products")
async def get_products(
    request: Request,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: models.AdminUser = Depends(get_current_active_user)
):
    """Get products from product service."""
    params = {"skip": skip, "limit": limit}
    products = await make_service_request(
        "GET",
        settings.product_service_url,
        "/products",
        params=params
    )
    
    await log_user_action(
        action="products_list_viewed",
        request=request,
        db=db,
        user=current_user,
        target_resource_type="Product"
    )
    
    return products


@router.get("/products/{product_id}")
async def get_product(
    product_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.AdminUser = Depends(get_current_active_user)
):
    """Get specific product."""
    product = await make_service_request(
        "GET",
        settings.product_service_url,
        f"/products/{product_id}"
    )
    
    await log_user_action(
        action="product_viewed",
        request=request,
        db=db,
        user=current_user,
        target_resource_type="Product",
        target_resource_id=product_id
    )
    
    return product


@router.post("/products")
async def create_product(
    product_data: dict,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.AdminUser = Depends(get_current_active_user)
):
    """Create new product."""
    product = await make_service_request(
        "POST",
        settings.product_service_url,
        "/products",
        json=product_data
    )
    
    await log_user_action(
        action="product_created",
        request=request,
        db=db,
        user=current_user,
        target_resource_type="Product",
        target_resource_id=product.get("id"),
        details={"product_name": product_data.get("name")}
    )
    
    return product


@router.put("/products/{product_id}")
async def update_product(
    product_id: str,
    product_data: dict,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.AdminUser = Depends(get_current_active_user)
):
    """Update product."""
    product = await make_service_request(
        "PUT",
        settings.product_service_url,
        f"/products/{product_id}",
        json=product_data
    )
    
    await log_user_action(
        action="product_updated",
        request=request,
        db=db,
        user=current_user,
        target_resource_type="Product",
        target_resource_id=product_id,
        details={"updated_fields": list(product_data.keys())}
    )
    
    return product


@router.delete("/products/{product_id}")
async def delete_product(
    product_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.AdminUser = Depends(get_current_active_user)
):
    """Delete product."""
    result = await make_service_request(
        "DELETE",
        settings.product_service_url,
        f"/products/{product_id}"
    )
    
    await log_user_action(
        action="product_deleted",
        request=request,
        db=db,
        user=current_user,
        target_resource_type="Product",
        target_resource_id=product_id
    )
    
    return result


# Order management endpoints
@router.get("/orders")
async def get_orders(
    request: Request,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status_filter: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.AdminUser = Depends(get_current_active_user)
):
    """Get orders from order service."""
    params = {"skip": skip, "limit": limit}
    if status_filter:
        params["status"] = status_filter
        
    orders = await make_service_request(
        "GET",
        settings.order_service_url,
        "/orders",
        params=params
    )
    
    await log_user_action(
        action="orders_list_viewed",
        request=request,
        db=db,
        user=current_user,
        target_resource_type="Order"
    )
    
    return orders


@router.get("/orders/{order_id}")
async def get_order(
    order_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.AdminUser = Depends(get_current_active_user)
):
    """Get specific order."""
    order = await make_service_request(
        "GET",
        settings.order_service_url,
        f"/orders/{order_id}"
    )
    
    await log_user_action(
        action="order_viewed",
        request=request,
        db=db,
        user=current_user,
        target_resource_type="Order",
        target_resource_id=order_id
    )
    
    return order


@router.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    status_data: dict,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.AdminUser = Depends(get_current_active_user)
):
    """Update order status."""
    order = await make_service_request(
        "PUT",
        settings.order_service_url,
        f"/orders/{order_id}/status",
        json=status_data
    )
    
    await log_user_action(
        action="order_status_changed",
        request=request,
        db=db,
        user=current_user,
        target_resource_type="Order",
        target_resource_id=order_id,
        details={"new_status": status_data.get("status")}
    )
    
    return order


@router.get("/orders/stats")
async def get_order_stats(
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.AdminUser = Depends(get_current_active_user)
):
    """Get order statistics."""
    stats = await make_service_request(
        "GET",
        settings.order_service_url,
        "/orders/stats"
    )
    
    await log_user_action(
        action="order_stats_viewed",
        request=request,
        db=db,
        user=current_user,
        target_resource_type="Order"
    )
    
    return stats
