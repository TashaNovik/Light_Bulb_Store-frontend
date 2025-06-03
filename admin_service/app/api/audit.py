from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session
from .. import crud, models, schemas
from ..database import get_db
from ..dependencies import get_current_active_user

router = APIRouter()


@router.get("/logs", response_model=schemas.PaginatedResponse)
async def get_audit_logs(
    request: Request,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    action: Optional[str] = Query(None, description="Filter by action (partial match)"),
    target_resource_type: Optional[str] = Query(None, description="Filter by resource type"),
    db: Session = Depends(get_db),
    current_user: models.AdminUser = Depends(get_current_active_user)
):
    """Get audit logs with filtering."""
    logs = crud.audit_log.get_multi(
        db=db,
        skip=skip,
        limit=limit,
        user_id=user_id,
        action=action,
        target_resource_type=target_resource_type
    )
    
    total = crud.audit_log.count(
        db=db,
        user_id=user_id,
        action=action,
        target_resource_type=target_resource_type
    )
    
    return schemas.PaginatedResponse(
        items=[schemas.AuditLogResponse.model_validate(log) for log in logs],
        total=total,
        skip=skip,
        limit=limit
    )


@router.get("/logs/actions", response_model=List[str])
async def get_available_actions(
    db: Session = Depends(get_db),
    current_user: models.AdminUser = Depends(get_current_active_user)
):
    """Get list of available actions for filtering."""
    # This would typically be a more sophisticated query
    # For now, return common actions
    return [
        "login_success",
        "login_failed",
        "login_failed_inactive",
        "user_created",
        "user_updated",
        "user_deleted",
        "user_viewed",
        "users_list_viewed",
        "product_updated",
        "product_created",
        "product_deleted",
        "order_status_changed",
        "order_viewed"
    ]


@router.get("/logs/resource-types", response_model=List[str])
async def get_available_resource_types(
    db: Session = Depends(get_db),
    current_user: models.AdminUser = Depends(get_current_active_user)
):
    """Get list of available resource types for filtering."""
    return [
        "AdminUser",
        "Product",
        "Order",
        "Customer"
    ]
