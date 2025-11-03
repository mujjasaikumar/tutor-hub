"""Homework-related data models and schemas."""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime, timezone
import uuid

class HomeworkBaseSchema(BaseModel):
    """Base homework schema with common fields."""
    title: str
    description: str
    batch_id: str
    due_date: datetime

class HomeworkCreateSchema(HomeworkBaseSchema):
    """Schema for creating new homework."""
    pass

class HomeworkResponseSchema(HomeworkBaseSchema):
    """Schema for homework data in API responses."""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    batch_name: Optional[str] = None
    tutor_id: str
    institute_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class HomeworkSubmissionBaseSchema(BaseModel):
    """Base homework submission schema."""
    homework_id: str
    submission_link: str

class HomeworkSubmissionCreateSchema(HomeworkSubmissionBaseSchema):
    """Schema for creating homework submission."""
    pass

class HomeworkSubmissionResponseSchema(HomeworkSubmissionBaseSchema):
    """Schema for homework submission data in API responses."""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    student_name: Optional[str] = None
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "submitted"  # submitted, reviewed
    feedback: Optional[str] = None
    institute_id: str
