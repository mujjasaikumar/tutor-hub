"""Invite-related data models and schemas."""
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import Optional
from datetime import datetime, timezone
import uuid

class InviteStatusEnum:
    """Invite status constants."""
    PENDING = "pending"
    ACCEPTED = "accepted"

class InviteBaseSchema(BaseModel):
    """Base invite schema with common fields."""
    email: EmailStr
    role: str  # tutor, student
    batch_id: Optional[str] = None

class InviteCreateSchema(InviteBaseSchema):
    """Schema for creating a new invite."""
    pass

class InviteResponseSchema(InviteBaseSchema):
    """Schema for invite data in API responses."""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    batch_name: Optional[str] = None
    invite_code: str
    status: str = InviteStatusEnum.PENDING
    institute_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
