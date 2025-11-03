"""Batch-related data models and schemas."""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
import uuid

class BatchBaseSchema(BaseModel):
    """Base batch schema with common fields."""
    name: str
    subject: str
    tutor_id: str
    timing: str  # e.g., "Mon-Wed-Fri 4PM-5PM"
    duration_months: int

class BatchCreateSchema(BatchBaseSchema):
    """Schema for creating a new batch."""
    start_date: datetime

class BatchResponseSchema(BatchBaseSchema):
    """Schema for batch data in API responses."""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tutor_name: Optional[str] = None
    start_date: datetime
    end_date: Optional[datetime] = None
    institute_id: str
    slack_channel_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BatchUpdateSchema(BaseModel):
    """Schema for updating batch information."""
    name: Optional[str] = None
    subject: Optional[str] = None
    tutor_id: Optional[str] = None
    timing: Optional[str] = None
    duration_months: Optional[int] = None
    days_per_week: Optional[int] = None
    class_time: Optional[str] = None

class BatchActivitySchema(BaseModel):
    """Schema for batch activity details."""
    batch_id: str
    classes: List[dict]
    students: List[dict]
    materials: List[dict]
