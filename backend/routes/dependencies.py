"""FastAPI dependencies for authentication and authorization."""
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List
import jwt

from ..services import user_authentication_service, jwt_token_service

security_scheme = HTTPBearer()

async def get_current_authenticated_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme)
) -> dict:
    """Dependency to get the current authenticated user from JWT token.
    
    Args:
        credentials: HTTP bearer token credentials
        
    Returns:
        Current user dictionary
        
    Raises:
        HTTPException: If token is invalid, expired, or user not found
    """
    try:
        token = credentials.credentials
        
        # Decode JWT token
        payload = jwt_token_service.decode_access_token(token)
        user_id = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        
        # Retrieve user from database
        user = await user_authentication_service.get_user_by_id(user_id)
        
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def require_user_role(allowed_roles: List[str]):
    """Dependency factory to check if user has required role.
    
    Args:
        allowed_roles: List of roles that are allowed to access the endpoint
        
    Returns:
        Dependency function that checks user role
        
    Raises:
        HTTPException: If user doesn't have required role
    """
    async def role_checker(
        current_user: dict = Depends(get_current_authenticated_user)
    ) -> dict:
        """Check if current user has required role."""
        if current_user.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="Insufficient permissions for this operation"
            )
        return current_user
    
    return role_checker
