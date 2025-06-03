from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .. import crud, schemas
from ..database import get_db
from ..core.security import create_access_token
from ..dependencies import log_user_action
from logging    import getLogger
logger = getLogger("auth")

router = APIRouter()


@router.post("/login", response_model=schemas.LoginResponse)
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login endpoint."""
    user = crud.admin_user.authenticate(
        db, username=form_data.username, password=form_data.password
    )
    
    if not user:
        await log_user_action(
            action="login_failed",
            request=request,
            db=db,
            details={"username": form_data.username}
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        await log_user_action(
            action="login_failed_inactive",
            request=request,
            db=db,
            user=user
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=720)  # 12 hours
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    # Update last login
    crud.admin_user.update_last_login(db, user)
    
    # Log successful login
    await log_user_action(
        action="login_success",
        request=request,
        db=db,
        user=user
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/login-json", response_model=schemas.LoginResponse)
async def login_json(
    request: Request,
    login_data: schemas.LoginRequest,
    db: Session = Depends(get_db)
):
    logger.info(f"Login JSON endpoint called with data: {login_data}")
    logger.info(f"Login JSON endpoint called with request: {request}")
    """Login endpoint with JSON payload."""
    user = crud.admin_user.authenticate(
        db, username=login_data.username, password=login_data.password
    )
    
    if not user:
        await log_user_action(
            action="login_failed",
            request=request,
            db=db,
            details={"username": login_data.username}
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    if not user.is_active:
        await log_user_action(
            action="login_failed_inactive",
            request=request,
            db=db,
            user=user
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=720)  # 12 hours
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    # Update last login
    crud.admin_user.update_last_login(db, user)
    
    # Log successful login
    await log_user_action(
        action="login_success",
        request=request,
        db=db,
        user=user
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }
