import httpx
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query, UploadFile, File
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
            
            # Check if response has content before trying to parse JSON
            if response.content:
                return response.json()
            else:
                # For responses with no content (like DELETE 204), return empty dict
                return {"status": "success", "message": "Operation completed successfully"}
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
        "/api/v1/products/",
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
        f"/api/v1/products/{product_id}"
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
        "/api/v1/products/",
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
        f"/api/v1/products/{product_id}",
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
        f"/api/v1/products/{product_id}"
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


@router.post("/products/upload-image")
async def upload_product_image(
    file: UploadFile = File(...),
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: models.AdminUser = Depends(get_current_active_user)
):
    """Upload product image through proxy to product service."""
    
    # Forward the file upload to the product service
    files = {"file": (file.filename, file.file, file.content_type)}
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.product_service_url}/api/v1/products/upload-image",
                files=files,
                timeout=30.0
            )
            
            if response.status_code != 201:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Upload failed: {response.text}"
                )
            
            result = response.json()
            
            await log_user_action(
                action="product_image_uploaded",
                request=request,
                db=db,
                user=current_user,
                target_resource_type="ProductImage",
                details={"filename": result.get("filename")}
            )
            
            return result
            
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")


@router.delete("/products/image/{filename}")
async def delete_product_image(
    filename: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.AdminUser = Depends(get_current_active_user)
):
    """Delete product image through proxy to product service."""
    
    result = await make_service_request(
        "DELETE",
        settings.product_service_url,
        f"/api/v1/products/image/{filename}"
    )
    
    await log_user_action(
        action="product_image_deleted",
        request=request,
        db=db,
        user=current_user,
        target_resource_type="ProductImage",
        details={"filename": filename}
    )
    
    return result


# Order management endpoints
@router.get("/orders")
async def get_orders(
    request: Request,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    status_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.AdminUser = Depends(get_current_active_user)
):
    """Get orders from order service."""
    params = {"skip": skip, "limit": limit}
    if search:
        params["search"] = search
    if status_id:
        params["status_id"] = status_id
    elif status:
        # If status code is provided instead of status_id, 
        # we need to resolve it to status_id in order service
        params["status"] = status
    
    orders = await make_service_request(
        "GET",
        settings.order_service_url,
        "/api/v1/orders/",
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
        f"/api/v1/orders/{order_id}"
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
        "PATCH",
        settings.order_service_url,
        f"/api/v1/orders/{order_id}/status",
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
        "/api/v1/orders/stats"
    )
    
    await log_user_action(
        action="order_stats_viewed",
        request=request,
        db=db,
        user=current_user,
        target_resource_type="Order"
    )
    
    return stats


@router.get("/order-statuses")
async def get_order_statuses(
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.AdminUser = Depends(get_current_active_user)
):
    """Get all order statuses from order service."""
    statuses = await make_service_request(
        "GET",
        settings.order_service_url,
        "/api/v1/orders/statuses"
    )
    
    await log_user_action(
        action="order_statuses_viewed",
        request=request,
        db=db,
        user=current_user,
        target_resource_type="OrderStatus"
    )
    
    return statuses


@router.get("/orders/{order_id}/status-history")
async def get_order_status_history(
    order_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.AdminUser = Depends(get_current_active_user)
):
    """Get order status history."""
    history = await make_service_request(
        "GET",
        settings.order_service_url,
        f"/api/v1/orders/{order_id}/history"
    )
    
    await log_user_action(
        action="order_status_history_viewed",
        request=request,
        db=db,
        user=current_user,
        target_resource_type="Order",
        target_resource_id=order_id
    )
    
    return history