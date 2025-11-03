"""Student-related data models and schemas."""
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import Optional
from datetime import datetime, timezone
import uuid

class StudentBaseSchema(BaseModel):
    """Base student schema with common fields."""
    name: str
    email: EmailStr
    phone: str
    whatsapp: Optional[str] = None
    batch_id: str

class StudentCreateSchema(StudentBaseSchema):
    """Schema for creating a new student."""
    total_fees: float

class StudentResponseSchema(StudentBaseSchema):
    """Schema for student data in API responses."""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    batch_name: Optional[str] = None
    institute_id: str
    payment_status: str = "unpaid"  # paid, unpaid, partial
    total_fees: float = 0.0
    paid_amount: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StudentUpdateSchema(BaseModel):
    """Schema for updating student information."""
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    batch_id: Optional[str] = None
    total_fees: Optional[float] = None
