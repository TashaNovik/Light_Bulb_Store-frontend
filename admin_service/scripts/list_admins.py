#!/usr/bin/env python3
"""
List existing admin users.
"""

import sys
import os

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.database import SessionLocal
from app import crud


def list_admin_users():
    """List all admin users."""
    db = SessionLocal()
    
    try:
        admin_users = crud.admin_user.get_multi(db, limit=100)
        
        if not admin_users:
            print("No admin users found.")
            return
        
        print("Existing admin users:")
        print("-" * 50)
        for user in admin_users:
            status = "Active" if user.is_active else "Inactive"
            print(f"Username: {user.username}")
            print(f"Email: {user.email}")
            print(f"Name: {user.first_name} {user.last_name}")
            print(f"Status: {status}")
            print(f"Created: {user.created_at}")
            print("-" * 50)
        
    except Exception as e:
        print(f"Error listing admin users: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    list_admin_users()
