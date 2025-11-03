"""Authentication and security services."""
from passlib.context import CryptContext
from datetime import datetime, timezone, timedelta
from typing import Optional
import jwt
import secrets

from config import SecurityConfig
from database import database
from models import UserResponseSchema

class PasswordHashingService:
    """Service for password hashing and verification."""
    
    def __init__(self):
        self.pwd_context = CryptContext(
            schemes=SecurityConfig.PASSWORD_HASH_SCHEMES,
            deprecated="auto"
        )
    
    def hash_password(self, plain_password: str) -> str:
        """Hash a plain text password."""
        return self.pwd_context.hash(plain_password)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return self.pwd_context.verify(plain_password, hashed_password)

class JWTTokenService:
    """Service for creating and validating JWT tokens."""
    
    @staticmethod
    def create_access_token(user_data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create a new JWT access token.
        
        Args:
            user_data: Dictionary containing user information
            expires_delta: Optional expiration time delta
            
        Returns:
            Encoded JWT token string
        """
        to_encode = user_data.copy()
        
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(
                minutes=SecurityConfig.ACCESS_TOKEN_EXPIRE_MINUTES
            )
        
        to_encode.update({"exp": expire})
        
        return jwt.encode(
            to_encode,
            SecurityConfig.JWT_SECRET_KEY,
            algorithm=SecurityConfig.JWT_ALGORITHM
        )
    
    @staticmethod
    def decode_access_token(token: str) -> dict:
        """Decode and validate a JWT token.
        
        Args:
            token: JWT token string
            
        Returns:
            Decoded token payload
            
        Raises:
            jwt.ExpiredSignatureError: If token is expired
            jwt.InvalidTokenError: If token is invalid
        """
        return jwt.decode(
            token,
            SecurityConfig.JWT_SECRET_KEY,
            algorithms=[SecurityConfig.JWT_ALGORITHM]
        )

class InviteCodeService:
    """Service for generating secure invite codes."""
    
    @staticmethod
    def generate_invite_code(length: int = 16) -> str:
        """Generate a secure random invite code.
        
        Args:
            length: Length of the invite code
            
        Returns:
            URL-safe random string
        """
        return secrets.token_urlsafe(length)

class UserAuthenticationService:
    """Service for user authentication operations."""
    
    def __init__(self):
        self.password_service = PasswordHashingService()
        self.token_service = JWTTokenService()
    
    async def authenticate_user(self, email: str, password: str) -> Optional[dict]:
        """Authenticate a user with email and password.
        
        Args:
            email: User's email address
            password: User's plain text password
            
        Returns:
            User document if authentication successful, None otherwise
        """
        user = await database.users.find_one({"email": email}, {"_id": 0})
        
        if not user:
            return None
        
        if not self.password_service.verify_password(password, user["password"]):
            return None
        
        return user
    
    async def get_user_by_id(self, user_id: str) -> Optional[dict]:
        """Retrieve user by their ID.
        
        Args:
            user_id: Unique user identifier
            
        Returns:
            User document if found, None otherwise
        """
        return await database.users.find_one({"id": user_id}, {"_id": 0})
    
    async def change_user_password(
        self,
        user_id: str,
        old_password: str,
        new_password: str
    ) -> bool:
        """Change a user's password.
        
        Args:
            user_id: Unique user identifier
            old_password: Current password for verification
            new_password: New password to set
            
        Returns:
            True if password changed successfully, False otherwise
        """
        user = await database.users.find_one({"id": user_id})
        
        if not user:
            return False
        
        if not self.password_service.verify_password(old_password, user["password"]):
            return False
        
        new_hashed_password = self.password_service.hash_password(new_password)
        
        await database.users.update_one(
            {"id": user_id},
            {"$set": {
                "password": new_hashed_password,
                "must_change_password": False
            }}
        )
        
        return True

# Export service instances
password_hashing_service = PasswordHashingService()
jwt_token_service = JWTTokenService()
invite_code_service = InviteCodeService()
user_authentication_service = UserAuthenticationService()
