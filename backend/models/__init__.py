"""Model package initialization - exports all schemas."""
from .user import (
    UserRoleEnum,
    UserCreateSchema,
    UserResponseSchema,
    UserLoginSchema,
    PasswordChangeSchema,
    TokenResponseSchema,
    TutorUpdateSchema
)
from .batch import (
    BatchCreateSchema,
    BatchResponseSchema,
    BatchUpdateSchema,
    BatchActivitySchema
)
from .student import (
    StudentCreateSchema,
    StudentResponseSchema,
    StudentUpdateSchema
)
from .payment import (
    PaymentCreateSchema,
    PaymentResponseSchema
)
from .class_schedule import (
    ClassScheduleStatusEnum,
    ClassScheduleCreateSchema,
    ClassScheduleResponseSchema,
    ClassScheduleUploadSchema
)
from .study_material import (
    StudyMaterialCreateSchema,
    StudyMaterialResponseSchema
)
from .homework import (
    HomeworkCreateSchema,
    HomeworkResponseSchema,
    HomeworkSubmissionCreateSchema,
    HomeworkSubmissionResponseSchema
)
from .enquiry import (
    EnquiryStatusEnum,
    EnquiryCreateSchema,
    EnquiryResponseSchema
)
from .invite import (
    InviteStatusEnum,
    InviteCreateSchema,
    InviteResponseSchema
)

__all__ = [
    # User models
    "UserRoleEnum",
    "UserCreateSchema",
    "UserResponseSchema",
    "UserLoginSchema",
    "PasswordChangeSchema",
    "TokenResponseSchema",
    "TutorUpdateSchema",
    # Batch models
    "BatchCreateSchema",
    "BatchResponseSchema",
    "BatchUpdateSchema",
    "BatchActivitySchema",
    # Student models
    "StudentCreateSchema",
    "StudentResponseSchema",
    "StudentUpdateSchema",
    # Payment models
    "PaymentCreateSchema",
    "PaymentResponseSchema",
    # Class schedule models
    "ClassScheduleStatusEnum",
    "ClassScheduleCreateSchema",
    "ClassScheduleResponseSchema",
    "ClassScheduleUploadSchema",
    # Study material models
    "StudyMaterialCreateSchema",
    "StudyMaterialResponseSchema",
    # Homework models
    "HomeworkCreateSchema",
    "HomeworkResponseSchema",
    "HomeworkSubmissionCreateSchema",
    "HomeworkSubmissionResponseSchema",
    # Enquiry models
    "EnquiryStatusEnum",
    "EnquiryCreateSchema",
    "EnquiryResponseSchema",
    # Invite models
    "InviteStatusEnum",
    "InviteCreateSchema",
    "InviteResponseSchema",
]
