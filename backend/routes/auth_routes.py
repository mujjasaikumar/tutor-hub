"""Authentication routes."""
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime

from models import (
    UserCreateSchema,
    UserLoginSchema,
    PasswordChangeSchema,
    TokenResponseSchema,
    UserResponseSchema
)
from services import (
    user_authentication_service,
    user_management_service,
    jwt_token_service
)
from routes.dependencies import get_current_authenticated_user

auth_router = APIRouter(prefix="/auth", tags=["Authentication"])

@auth_router.post("/signup", response_model=TokenResponseSchema)
async def signup_new_user(user_data: UserCreateSchema):
    """Register a new user account.
    
    Args:
        user_data: User registration data including email, password, name, and role
        
    Returns:
        Token response with access token and user information
        
    Raises:
        HTTPException: If email is already registered
    """
    # Check if user email already exists
    email_exists = await user_management_service.check_email_exists(user_data.email)
    if email_exists:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    created_user = await user_management_service.create_user(
        user_data,
        user_data.institute_id or "default-institute"
    )
    
    # Generate access token
    access_token = jwt_token_service.create_access_token({
        "sub": created_user.id,
        "role": created_user.role
    })
    
    return TokenResponseSchema(
        access_token=access_token,
        token_type="bearer",
        user=created_user,
        must_change_password=user_data.must_change_password
    )

@auth_router.post("/login", response_model=TokenResponseSchema)
async def login_user(credentials: UserLoginSchema):
    """Authenticate user and generate access token.
    
    Args:
        credentials: User login credentials (email and password)
        
    Returns:
        Token response with access token and user information
        
    Raises:
        HTTPException: If credentials are invalid
    """
    # Authenticate user
    user = await user_authentication_service.authenticate_user(
        credentials.email,
        credentials.password
    )
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Convert datetime string to datetime object if needed
    if isinstance(user.get("created_at"), str):
        user["created_at"] = datetime.fromisoformat(user["created_at"])
    
    # Create user response object
    user_response = UserResponseSchema(**user)
    
    # Generate access token
    access_token = jwt_token_service.create_access_token({
        "sub": user_response.id,
        "role": user_response.role
    })
    
    return TokenResponseSchema(
        access_token=access_token,
        token_type="bearer",
        user=user_response,
        must_change_password=user.get("must_change_password", False)
    )

@auth_router.get("/me", response_model=UserResponseSchema)
async def get_current_user_info(
    current_user: dict = Depends(get_current_authenticated_user)
):
    """Get current authenticated user's information.
    
    Args:
        current_user: Current authenticated user from dependency
        
    Returns:
        User information
    """
    if isinstance(current_user.get("created_at"), str):
        current_user["created_at"] = datetime.fromisoformat(current_user["created_at"])
    
    return UserResponseSchema(**current_user)

@auth_router.post("/change-password")
async def change_user_password(
    password_data: PasswordChangeSchema,
    current_user: dict = Depends(get_current_authenticated_user)
):
    """Change the current user's password.
    
    Args:
        password_data: Old and new password
        current_user: Current authenticated user from dependency
        
    Returns:
        Success message
        
    Raises:
        HTTPException: If old password is invalid
    """
    password_changed = await user_authentication_service.change_user_password(
        current_user["id"],
        password_data.old_password,
        password_data.new_password
    )
    
    if not password_changed:
        raise HTTPException(status_code=400, detail="Invalid old password")
    
    return {"message": "Password changed successfully"}
