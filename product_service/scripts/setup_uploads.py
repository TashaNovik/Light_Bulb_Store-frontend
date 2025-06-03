#!/usr/bin/env python3
"""
Setup script to create upload directories and set proper permissions.
"""
import os
import stat
from pathlib import Path

def setup_upload_directory():
    """Create upload directory and set proper permissions."""
    upload_dir = Path("/usr/share/nginx/html/assets/images")
    
    # Create directory if it doesn't exist
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Set permissions (read/write for owner and group, read for others)
    upload_dir.chmod(stat.S_IRWXU | stat.S_IRWXG | stat.S_IROTH | stat.S_IXOTH)
    
    print(f"Upload directory created: {upload_dir}")
    print(f"Directory permissions: {oct(upload_dir.stat().st_mode)[-3:]}")
    
    # Create a test file to verify write permissions
    test_file = upload_dir / "test_write.txt"
    try:
        test_file.write_text("Test write permissions")
        test_file.unlink()  # Remove test file
        print("Write permissions verified successfully")
    except Exception as e:
        print(f"Warning: Cannot write to upload directory: {e}")

if __name__ == "__main__":
    setup_upload_directory()
