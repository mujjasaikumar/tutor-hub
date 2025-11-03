"""Study materials-related data models and schemas."""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime, timezone
import uuid

class StudyMaterialBaseSchema(BaseModel):
    """Base study material schema with common fields."""
    title: str
    description: Optional[str] = None
    drive_link: str
    batch_id: str

class StudyMaterialCreateSchema(StudyMaterialBaseSchema):
    """Schema for creating a new study material."""
    expiry_date: Optional[datetime] = None

class StudyMaterialResponseSchema(StudyMaterialBaseSchema):
    """Schema for study material data in API responses."""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    batch_name: Optional[str] = None
    uploaded_by: str  # tutor_id
    uploader_name: Optional[str] = None
    expiry_date: Optional[datetime] = None
    institute_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
