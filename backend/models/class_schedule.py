"""Class schedule-related data models and schemas."""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
import uuid

class ClassScheduleStatusEnum:
    """Class schedule status constants."""
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    RESCHEDULED = "rescheduled"

class ClassScheduleBaseSchema(BaseModel):
    """Base class schedule schema with common fields."""
    batch_id: str
    class_date: datetime
    class_time: str
    topic: Optional[str] = None

class ClassScheduleCreateSchema(ClassScheduleBaseSchema):
    """Schema for creating a new class schedule."""
    pass

class ClassScheduleResponseSchema(ClassScheduleBaseSchema):
    """Schema for class schedule data in API responses."""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    batch_name: Optional[str] = None
    status: str = ClassScheduleStatusEnum.SCHEDULED
    tutor_id: str
    institute_id: str
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ClassScheduleUploadSchema(BaseModel):
    """Schema for bulk class schedule upload."""
    batch_id: str
    schedule_data: List[dict]  # List of {date, time, topic}
