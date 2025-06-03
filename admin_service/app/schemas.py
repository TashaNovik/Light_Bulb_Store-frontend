from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr, UUID4
from typing import List


# Admin User Schemas
class AdminUserBase(BaseModel):
    username: str
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: bool = True


class AdminUserCreate(AdminUserBase):
    password: str


class AdminUserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None


class AdminUserResponse(AdminUserBase):
    id: UUID4
    last_login_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Authentication Schemas
class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: AdminUserResponse


class TokenData(BaseModel):
    username: Optional[str] = None


# Audit Log Schemas
class AuditLogBase(BaseModel):
    action: str
    target_resource_type: Optional[str] = None
    target_resource_id: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class AuditLogCreate(AuditLogBase):
    user_id: Optional[UUID4] = None


class AuditLogResponse(AuditLogBase):
    id: UUID4
    user_id: Optional[UUID4] = None
    timestamp: datetime
    user: Optional[AdminUserResponse] = None
    
    class Config:
        from_attributes = True


# Pagination Schema
class PaginationParams(BaseModel):
    skip: int = 0
    limit: int = 100


class PaginatedResponse(BaseModel):
    items: list
    total: int
    skip: int
    limit: int
    
class PaginationInfo(BaseModel):
    currentPage: int
    totalPages: int
    totalItems: int
    itemsPerPage: int

class PaginatedAdminUserResponse(BaseModel):
    data: List[AdminUserResponse]
    pagination: PaginationInfo