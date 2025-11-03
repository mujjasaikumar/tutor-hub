"""Model package initialization - exports all schemas."""
from models.user import (
    UserRoleEnum,
    UserCreateSchema,
    UserResponseSchema,
    UserLoginSchema,
    PasswordChangeSchema,
    TokenResponseSchema,
    TutorUpdateSchema
)
from models.batch import (
    BatchCreateSchema,
    BatchResponseSchema,
    BatchUpdateSchema,
    BatchActivitySchema
)
from models.student import (
    StudentCreateSchema,
    StudentResponseSchema,
    StudentUpdateSchema
)
from models.payment import (
    PaymentCreateSchema,
    PaymentResponseSchema
)
from models.class_schedule import (
    ClassScheduleStatusEnum,
    ClassScheduleCreateSchema,
    ClassScheduleResponseSchema,
    ClassScheduleUploadSchema
)
from models.study_material import (
    StudyMaterialCreateSchema,
    StudyMaterialResponseSchema
)
from models.homework import (
    HomeworkCreateSchema,
    HomeworkResponseSchema,
    HomeworkSubmissionCreateSchema,
    HomeworkSubmissionResponseSchema
)
from models.enquiry import (
    EnquiryStatusEnum,
    EnquiryCreateSchema,
    EnquiryResponseSchema
)
from models.invite import (
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
