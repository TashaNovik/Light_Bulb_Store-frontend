from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_
from . import models, schemas
from .core.security import get_password_hash, verify_password


class AdminUserCRUD:
    def get_by_id(self, db: Session, user_id: str) -> Optional[models.AdminUser]:
        return db.query(models.AdminUser).filter(models.AdminUser.id == user_id).first()
    
    def get_by_username(self, db: Session, username: str) -> Optional[models.AdminUser]:
        return db.query(models.AdminUser).filter(models.AdminUser.username == username).first()
    
    def get_by_email(self, db: Session, email: str) -> Optional[models.AdminUser]:
        return db.query(models.AdminUser).filter(models.AdminUser.email == email).first()
    
    def get_multi(self, db: Session, skip: int = 0, limit: int = 100) -> List[models.AdminUser]:
        return db.query(models.AdminUser).offset(skip).limit(limit).all()
    
    def create(self, db: Session, obj_in: schemas.AdminUserCreate) -> models.AdminUser:
        hashed_password = get_password_hash(obj_in.password)
        db_obj = models.AdminUser(
            username=obj_in.username,
            email=obj_in.email,
            password_hash=hashed_password,
            first_name=obj_in.first_name,
            last_name=obj_in.last_name,
            is_active=obj_in.is_active
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update(self, db: Session, db_obj: models.AdminUser, obj_in: schemas.AdminUserUpdate) -> models.AdminUser:
        update_data = obj_in.model_dump(exclude_unset=True)
        
        if "password" in update_data:
            update_data["password_hash"] = get_password_hash(update_data.pop("password"))
        
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        db_obj.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def authenticate(self, db: Session, username: str, password: str) -> Optional[models.AdminUser]:
        user = self.get_by_username(db, username=username)
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user
    
    def update_last_login(self, db: Session, user: models.AdminUser) -> None:
        user.last_login_at = datetime.utcnow()
        db.commit()
        db.refresh(user)
    
    def delete(self, db: Session, user_id: str) -> Optional[models.AdminUser]:
        obj = db.query(models.AdminUser).filter(models.AdminUser.id == user_id).first()
        if obj:
            db.delete(obj)
            db.commit()
        return obj


class AuditLogCRUD:
    def create(self, db: Session, obj_in: schemas.AuditLogCreate) -> models.AuditLog:
        db_obj = models.AuditLog(**obj_in.model_dump())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get_multi(
        self, 
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        user_id: Optional[str] = None,
        action: Optional[str] = None,
        target_resource_type: Optional[str] = None
    ) -> List[models.AuditLog]:
        query = db.query(models.AuditLog)
        
        if user_id:
            query = query.filter(models.AuditLog.user_id == user_id)
        if action:
            query = query.filter(models.AuditLog.action.ilike(f"%{action}%"))
        if target_resource_type:
            query = query.filter(models.AuditLog.target_resource_type == target_resource_type)
        
        return query.order_by(desc(models.AuditLog.timestamp)).offset(skip).limit(limit).all()
    
    def count(
        self,
        db: Session,
        user_id: Optional[str] = None,
        action: Optional[str] = None,
        target_resource_type: Optional[str] = None
    ) -> int:
        query = db.query(models.AuditLog)
        
        if user_id:
            query = query.filter(models.AuditLog.user_id == user_id)
        if action:
            query = query.filter(models.AuditLog.action.ilike(f"%{action}%"))
        if target_resource_type:
            query = query.filter(models.AuditLog.target_resource_type == target_resource_type)
        
        return query.count()


# Create instances
admin_user = AdminUserCRUD()
audit_log = AuditLogCRUD()
