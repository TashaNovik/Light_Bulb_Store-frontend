from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from .. import crud, models, schemas
from ..database import get_db
from ..dependencies import get_current_active_user, log_user_action

router = APIRouter()


@router.get("/users", response_model=List[schemas.AdminUserResponse])
async def get_users(
    request: Request,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: models.AdminUser = Depends(get_current_active_user)
):
    """Get all admin users."""
    users = crud.admin_user.get_multi(db, skip=skip, limit=limit)
    
    await log_user_action(
        action="users_list_viewed",
        request=request,
        db=db,
        user=current_user,
        target_resource_type="AdminUser"
    )
    
    return users


@router.get("/users/me", response_model=schemas.AdminUserResponse)
async def get_current_user_info(
    current_user: models.AdminUser = Depends(get_current_active_user)
):
    """Get current user information."""
    return current_user


@router.get("/users/{user_id}", response_model=schemas.AdminUserResponse)
async def get_user(
    user_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.AdminUser = Depends(get_current_active_user)
):
    """Get user by ID."""
    user = crud.admin_user.get_by_id(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    await log_user_action(
        action="user_viewed",
        request=request,
        db=db,
        user=current_user,
        target_resource_type="AdminUser",
        target_resource_id=str(user_id)
    )
    
    return user


@router.post("/users", response_model=schemas.AdminUserResponse)
async def create_user(
    user_create: schemas.AdminUserCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.AdminUser = Depends(get_current_active_user)
):
    """Create new admin user."""
    # Check if username already exists
    if crud.admin_user.get_by_username(db, username=user_create.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email already exists
    if crud.admin_user.get_by_email(db, email=user_create.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user = crud.admin_user.create(db, obj_in=user_create)
    
    await log_user_action(
        action="user_created",
        request=request,
        db=db,
        user=current_user,
        target_resource_type="AdminUser",
        target_resource_id=str(user.id),
        details={"created_username": user.username, "created_email": user.email}
    )
    
    return user


@router.put("/users/{user_id}", response_model=schemas.AdminUserResponse)
async def update_user(
    user_id: str,
    user_update: schemas.AdminUserUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.AdminUser = Depends(get_current_active_user)
):
    """Update user."""
    user = crud.admin_user.get_by_id(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if username is being changed and already exists
    if (user_update.username and 
        user_update.username != user.username and
        crud.admin_user.get_by_username(db, username=user_update.username)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email is being changed and already exists
    if (user_update.email and 
        user_update.email != user.email and
        crud.admin_user.get_by_email(db, email=user_update.email)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Store old values for audit
    old_values = {
        "username": user.username,
        "email": user.email,
        "is_active": user.is_active
    }
    
    updated_user = crud.admin_user.update(db, db_obj=user, obj_in=user_update)
    
    # Create details for audit log
    changes = {}
    update_data = user_update.model_dump(exclude_unset=True)
    for field, new_value in update_data.items():
        if field in old_values and old_values[field] != new_value:
            changes[field] = {"old": old_values[field], "new": new_value}
    
    await log_user_action(
        action="user_updated",
        request=request,
        db=db,
        user=current_user,
        target_resource_type="AdminUser",
        target_resource_id=str(user_id),
        details={"changes": changes}
    )
    
    return updated_user


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.AdminUser = Depends(get_current_active_user)
):
    """Delete user."""
    # Prevent self-deletion
    if str(current_user.id) == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    user = crud.admin_user.get_by_id(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    deleted_user = crud.admin_user.delete(db, user_id=user_id)
    
    await log_user_action(
        action="user_deleted",
        request=request,
        db=db,
        user=current_user,
        target_resource_type="AdminUser",
        target_resource_id=str(user_id),
        details={"deleted_username": user.username, "deleted_email": user.email}
    )
    
    return {"message": "User deleted successfully"}
