from datetime import timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from . import crud, models, schemas
from .database import get_db
from .core.security import verify_token, create_access_token

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> models.AdminUser:
    """Get current authenticated user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = credentials.credentials
    payload = verify_token(token)
    
    if payload is None:
        raise credentials_exception
    
    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception
    
    user = crud.admin_user.get_by_username(db, username=username)
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    return user


def get_current_active_user(
    current_user: models.AdminUser = Depends(get_current_user)
) -> models.AdminUser:
    """Get current active user."""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


async def log_user_action(
    action: str,
    request: Request,
    db: Session,
    user: Optional[models.AdminUser] = None,
    target_resource_type: Optional[str] = None,
    target_resource_id: Optional[str] = None,
    details: Optional[dict] = None
):
    """Log user action to audit log."""
    audit_data = schemas.AuditLogCreate(
        user_id=user.id if user else None,
        action=action,
        target_resource_type=target_resource_type,
        target_resource_id=target_resource_id,
        details=details,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    
    crud.audit_log.create(db=db, obj_in=audit_data)
