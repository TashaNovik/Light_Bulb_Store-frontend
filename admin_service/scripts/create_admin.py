#!/usr/bin/env python3
"""
Create initial admin user.
Run this script after the database is set up.
"""

import asyncio
import sys
import os

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.database import SessionLocal
from app import crud, schemas
from app.core.security import get_password_hash


def create_admin_user():
    """Create the first admin user."""
    db = SessionLocal()
    
    try:
        # Check if any admin users exist
        existing_users = crud.admin_user.get_multi(db, limit=1)
        if existing_users:
            print("Admin users already exist. Skipping creation.")
            return
        
        # Create default admin user
        admin_data = schemas.AdminUserCreate(
            username="admin",
            email="admin@lightbulbstore.com",
            password="admin123",  # Change this in production!
            first_name="Admin",
            last_name="User",
            is_active=True
        )
        
        admin_user = crud.admin_user.create(db, obj_in=admin_data)
        print(f"Created admin user: {admin_user.username} ({admin_user.email})")
        print("Default password: admin123")
        print("Please change the password after first login!")
        
    except Exception as e:
        print(f"Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    create_admin_user()
