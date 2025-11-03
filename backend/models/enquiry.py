"""Enquiry-related data models and schemas."""
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import Optional
from datetime import datetime, timezone
import uuid

class EnquiryStatusEnum:
    """Enquiry status constants."""
    NEW = "new"
    CONTACTED = "contacted"
    ENROLLED = "enrolled"
    REJECTED = "rejected"

class EnquiryBaseSchema(BaseModel):
    """Base enquiry schema with common fields."""
    name: str
    email: EmailStr
    phone: str
    whatsapp: Optional[str] = None
    interested_subject: Optional[str] = None
    notes: Optional[str] = None

class EnquiryCreateSchema(EnquiryBaseSchema):
    """Schema for creating a new enquiry."""
    pass

class EnquiryResponseSchema(EnquiryBaseSchema):
    """Schema for enquiry data in API responses."""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = EnquiryStatusEnum.NEW
    institute_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
