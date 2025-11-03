"""Payment-related data models and schemas."""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime, timezone
import uuid

class PaymentBaseSchema(BaseModel):
    """Base payment schema with common fields."""
    student_id: str
    batch_id: str
    amount: float
    payment_date: datetime
    payment_mode: str  # cash, online, upi, etc.
    receipt_number: Optional[str] = None
    notes: Optional[str] = None

class PaymentCreateSchema(PaymentBaseSchema):
    """Schema for creating a new payment."""
    pass

class PaymentResponseSchema(PaymentBaseSchema):
    """Schema for payment data in API responses."""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_name: Optional[str] = None
    institute_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
