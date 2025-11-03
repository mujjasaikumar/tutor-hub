"""User-related data models and schemas."""
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import Optional
from datetime import datetime, timezone
import uuid

class UserRoleEnum:
    """User role constants for type safety."""
    ADMIN = "admin"
    TUTOR = "tutor"
    STUDENT = "student"

class UserBaseSchema(BaseModel):
    """Base user schema with common fields."""
    email: EmailStr
    name: str
    role: str
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    institute_id: Optional[str] = None

class UserCreateSchema(UserBaseSchema):
    """Schema for creating a new user."""
    password: str
    must_change_password: bool = False

class UserResponseSchema(UserBaseSchema):
    """Schema for user data in API responses."""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserLoginSchema(BaseModel):
    """Schema for user login credentials."""
    email: EmailStr
    password: str

class PasswordChangeSchema(BaseModel):
    """Schema for changing user password."""
    old_password: str
    new_password: str

class TokenResponseSchema(BaseModel):
    """Schema for authentication token response."""
    access_token: str
    token_type: str
    user: UserResponseSchema
    must_change_password: Optional[bool] = False

class TutorUpdateSchema(BaseModel):
    """Schema for updating tutor information."""
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
