from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, BackgroundTasks, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
import pandas as pd
import io

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

security = HTTPBearer()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class UserRole:
    ADMIN = "admin"
    TUTOR = "tutor"
    STUDENT = "student"

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: str  # admin, tutor, student
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    institute_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    institute_id: Optional[str] = None
    must_change_password: bool = False

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

class BatchActivity(BaseModel):
    batch_id: str
    classes: List[dict]
    students: List[dict]
    materials: List[dict]

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class Batch(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    subject: str
    tutor_id: str
    tutor_name: Optional[str] = None
    timing: str  # e.g., "Mon-Wed-Fri 4PM-5PM"
    duration_months: int
    start_date: datetime
    end_date: Optional[datetime] = None
    institute_id: str
    slack_channel_id: Optional[str] = None  # Placeholder for future
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BatchCreate(BaseModel):
    name: str
    subject: str
    tutor_id: str
    timing: str
    duration_months: int
    start_date: datetime

class Student(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: str
    whatsapp: Optional[str] = None
    batch_id: str
    batch_name: Optional[str] = None
    institute_id: str
    payment_status: str = "unpaid"  # paid, unpaid, partial
    total_fees: float = 0.0
    paid_amount: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StudentCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    whatsapp: Optional[str] = None
    batch_id: str
    total_fees: float

class Payment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    student_name: Optional[str] = None
    batch_id: str
    amount: float
    payment_date: datetime
    payment_mode: str  # cash, online, upi, etc.
    receipt_number: Optional[str] = None
    notes: Optional[str] = None
    institute_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PaymentCreate(BaseModel):
    student_id: str
    batch_id: str
    amount: float
    payment_date: datetime
    payment_mode: str
    receipt_number: Optional[str] = None
    notes: Optional[str] = None

class ClassSchedule(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    batch_id: str
    batch_name: Optional[str] = None
    class_date: datetime
    class_time: str
    topic: Optional[str] = None
    status: str = "scheduled"  # scheduled, completed, cancelled, rescheduled
    tutor_id: str
    institute_id: str
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ClassScheduleCreate(BaseModel):
    batch_id: str
    class_date: datetime
    class_time: str
    topic: Optional[str] = None

class StudyMaterial(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = None
    drive_link: str
    batch_id: str
    batch_name: Optional[str] = None
    uploaded_by: str  # tutor_id
    uploader_name: Optional[str] = None
    expiry_date: Optional[datetime] = None
    institute_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StudyMaterialCreate(BaseModel):
    title: str
    description: Optional[str] = None
    drive_link: str
    batch_id: str
    expiry_date: Optional[datetime] = None

class Homework(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    batch_id: str
    batch_name: Optional[str] = None
    tutor_id: str
    due_date: datetime
    institute_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class HomeworkCreate(BaseModel):
    title: str
    description: str
    batch_id: str
    due_date: datetime

class HomeworkSubmission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    homework_id: str
    student_id: str
    student_name: Optional[str] = None
    submission_link: str
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "submitted"  # submitted, reviewed
    feedback: Optional[str] = None
    institute_id: str

class HomeworkSubmissionCreate(BaseModel):
    homework_id: str
    submission_link: str

class Enquiry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: str
    whatsapp: Optional[str] = None
    interested_subject: Optional[str] = None
    status: str = "new"  # new, contacted, enrolled, rejected
    notes: Optional[str] = None
    institute_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EnquiryCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    whatsapp: Optional[str] = None
    interested_subject: Optional[str] = None
    notes: Optional[str] = None

class Invite(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    role: str  # tutor, student
    batch_id: Optional[str] = None
    batch_name: Optional[str] = None
    invite_code: str
    status: str = "pending"  # pending, accepted
    institute_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InviteCreate(BaseModel):
    email: EmailStr
    role: str
    batch_id: Optional[str] = None

class BatchUpdate(BaseModel):
    name: Optional[str] = None
    subject: Optional[str] = None
    tutor_id: Optional[str] = None
    timing: Optional[str] = None
    duration_months: Optional[int] = None
    days_per_week: Optional[int] = None
    class_time: Optional[str] = None

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    batch_id: Optional[str] = None
    total_fees: Optional[float] = None

class TutorUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

class ClassScheduleUpload(BaseModel):
    batch_id: str
    schedule_data: List[dict]  # List of {date, time, topic}

# ============ UTILITY FUNCTIONS ============

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def generate_invite_code() -> str:
    import secrets
    return secrets.token_urlsafe(16)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def require_role(allowed_roles: List[str]):
    async def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker

# ============ NOTIFICATION BLUEPRINTS (Future Implementation) ============

class NotificationService:
    """Blueprint for future WhatsApp/Slack/Email integrations"""
    
    @staticmethod
    async def send_whatsapp(phone: str, message: str):
        # TODO: Integrate Twilio/Gupshup WhatsApp API
        logging.info(f"[WhatsApp Blueprint] Would send to {phone}: {message}")
    
    @staticmethod
    async def send_slack(channel: str, message: str):
        # TODO: Integrate Slack API
        logging.info(f"[Slack Blueprint] Would send to {channel}: {message}")
    
    @staticmethod
    async def send_email(to_email: str, subject: str, body: str):
        # TODO: Integrate Gmail SMTP
        logging.info(f"[Email Blueprint] Would send to {to_email}: {subject}")

notification_service = NotificationService()

# ============ AUTH ROUTES ============

@api_router.post("/auth/signup", response_model=Token)
async def signup(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_dict = user_data.model_dump()
    hashed_pw = hash_password(user_dict.pop("password"))
    
    user = User(**user_dict)
    doc = user.model_dump()
    doc["password"] = hashed_pw
    doc["created_at"] = doc["created_at"].isoformat()
    
    await db.users.insert_one(doc)
    
    # Create token
    token = create_access_token({"sub": user.id, "role": user.role})
    
    return Token(access_token=token, token_type="bearer", user=user)

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Convert datetime strings
    if isinstance(user["created_at"], str):
        user["created_at"] = datetime.fromisoformat(user["created_at"])
    
    user_obj = User(**user)
    token = create_access_token({"sub": user_obj.id, "role": user_obj.role})
    
    return Token(access_token=token, token_type="bearer", user=user_obj)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: dict = Depends(get_current_user)):
    if isinstance(current_user["created_at"], str):
        current_user["created_at"] = datetime.fromisoformat(current_user["created_at"])
    return User(**current_user)

@api_router.post("/auth/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: dict = Depends(get_current_user)
):
    user = await db.users.find_one({"id": current_user["id"]})
    
    if not verify_password(password_data.old_password, user["password"]):
        raise HTTPException(status_code=400, detail="Invalid old password")
    
    new_hashed = hash_password(password_data.new_password)
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": {"password": new_hashed, "must_change_password": False}}
    )
    
    return {"message": "Password changed successfully"}

# ============ BATCH ROUTES ============

@api_router.post("/batches", response_model=Batch)
async def create_batch(
    batch_data: BatchCreate,
    current_user: dict = Depends(require_role([UserRole.ADMIN]))
):
    # Get tutor name
    tutor = await db.users.find_one({"id": batch_data.tutor_id}, {"_id": 0})
    if not tutor:
        raise HTTPException(status_code=404, detail="Tutor not found")
    
    batch = Batch(
        **batch_data.model_dump(),
        institute_id=current_user["institute_id"] or current_user["id"],
        tutor_name=tutor["name"]
    )
    
    doc = batch.model_dump()
    doc["start_date"] = doc["start_date"].isoformat()
    doc["created_at"] = doc["created_at"].isoformat()
    if doc["end_date"]:
        doc["end_date"] = doc["end_date"].isoformat()
    
    await db.batches.insert_one(doc)
    
    # Blueprint: Create Slack channel
    # await notification_service.send_slack(f"batch-{batch.id}", f"Batch {batch.name} created!")
    
    return batch

@api_router.get("/batches", response_model=List[Batch])
async def get_batches(current_user: dict = Depends(get_current_user)):
    query = {}
    
    if current_user["role"] == UserRole.TUTOR:
        query["tutor_id"] = current_user["id"]
    elif current_user["role"] == UserRole.STUDENT:
        # Get student's batch
        student = await db.students.find_one({"email": current_user["email"]}, {"_id": 0})
        if student:
            query["id"] = student["batch_id"]
    else:
        # Admin sees all
        institute_id = current_user["institute_id"] or current_user["id"]
        query["institute_id"] = institute_id
    
    batches = await db.batches.find(query, {"_id": 0}).to_list(1000)
    
    for batch in batches:
        if isinstance(batch["start_date"], str):
            batch["start_date"] = datetime.fromisoformat(batch["start_date"])
        if batch.get("end_date") and isinstance(batch["end_date"], str):
            batch["end_date"] = datetime.fromisoformat(batch["end_date"])
        if isinstance(batch["created_at"], str):
            batch["created_at"] = datetime.fromisoformat(batch["created_at"])
    
    return batches

@api_router.get("/batches/{batch_id}", response_model=Batch)
async def get_batch(batch_id: str, current_user: dict = Depends(get_current_user)):
    batch = await db.batches.find_one({"id": batch_id}, {"_id": 0})
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    if isinstance(batch["start_date"], str):
        batch["start_date"] = datetime.fromisoformat(batch["start_date"])
    if batch.get("end_date") and isinstance(batch["end_date"], str):
        batch["end_date"] = datetime.fromisoformat(batch["end_date"])
    if isinstance(batch["created_at"], str):
        batch["created_at"] = datetime.fromisoformat(batch["created_at"])
    
    return Batch(**batch)

@api_router.put("/batches/{batch_id}")
async def update_batch(
    batch_id: str,
    batch_update: BatchUpdate,
    current_user: dict = Depends(require_role([UserRole.ADMIN]))
):
    update_data = {k: v for k, v in batch_update.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    # If tutor_id changed, update tutor_name
    if "tutor_id" in update_data:
        tutor = await db.users.find_one({"id": update_data["tutor_id"]}, {"_id": 0})
        if tutor:
            update_data["tutor_name"] = tutor["name"]
    
    result = await db.batches.update_one({"id": batch_id}, {"$set": update_data})
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    return {"message": "Batch updated successfully"}

@api_router.delete("/batches/{batch_id}")
async def delete_batch(
    batch_id: str,
    current_user: dict = Depends(require_role([UserRole.ADMIN]))
):
    result = await db.batches.delete_one({"id": batch_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    return {"message": "Batch deleted successfully"}

@api_router.get("/batches/{batch_id}/activities")
async def get_batch_activities(
    batch_id: str,
    current_user: dict = Depends(require_role([UserRole.ADMIN, UserRole.TUTOR]))
):
    """Get all activities for a batch - classes, students, materials"""
    batch = await db.batches.find_one({"id": batch_id}, {"_id": 0})
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    # Get classes
    classes = await db.classes.find({"batch_id": batch_id}, {"_id": 0}).to_list(1000)
    for cls in classes:
        if isinstance(cls["class_date"], str):
            cls["class_date"] = datetime.fromisoformat(cls["class_date"])
        if isinstance(cls["created_at"], str):
            cls["created_at"] = datetime.fromisoformat(cls["created_at"])
    
    # Get students
    students = await db.students.find({"batch_id": batch_id}, {"_id": 0}).to_list(1000)
    for student in students:
        if isinstance(student["created_at"], str):
            student["created_at"] = datetime.fromisoformat(student["created_at"])
    
    # Get materials
    materials = await db.materials.find({"batch_id": batch_id}, {"_id": 0}).to_list(1000)
    for material in materials:
        if isinstance(material["created_at"], str):
            material["created_at"] = datetime.fromisoformat(material["created_at"])
        if material.get("expiry_date") and isinstance(material["expiry_date"], str):
            material["expiry_date"] = datetime.fromisoformat(material["expiry_date"])
    
    return {
        "batch": batch,
        "classes": classes,
        "students": students,
        "materials": materials
    }

# ============ TUTOR MANAGEMENT ROUTES ============

@api_router.get("/tutors", response_model=List[User])
async def get_tutors(current_user: dict = Depends(require_role([UserRole.ADMIN]))):
    institute_id = current_user["institute_id"] or current_user["id"]
    tutors = await db.users.find({"role": UserRole.TUTOR, "institute_id": institute_id}, {"_id": 0, "password": 0}).to_list(1000)
    
    for tutor in tutors:
        if isinstance(tutor["created_at"], str):
            tutor["created_at"] = datetime.fromisoformat(tutor["created_at"])
    
    return tutors

@api_router.post("/tutors", response_model=User)
async def create_tutor(
    tutor_data: UserCreate,
    current_user: dict = Depends(require_role([UserRole.ADMIN]))
):
    if tutor_data.role != UserRole.TUTOR:
        raise HTTPException(status_code=400, detail="Role must be tutor")
    
    existing = await db.users.find_one({"email": tutor_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    tutor_dict = tutor_data.model_dump()
    hashed_pw = hash_password(tutor_dict.pop("password"))
    tutor_dict["institute_id"] = current_user["institute_id"] or current_user["id"]
    
    tutor = User(**tutor_dict)
    doc = tutor.model_dump()
    doc["password"] = hashed_pw
    doc["created_at"] = doc["created_at"].isoformat()
    
    await db.users.insert_one(doc)
    return tutor

@api_router.put("/tutors/{tutor_id}")
async def update_tutor(
    tutor_id: str,
    tutor_update: TutorUpdate,
    current_user: dict = Depends(require_role([UserRole.ADMIN]))
):
    update_data = {k: v for k, v in tutor_update.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    result = await db.users.update_one({"id": tutor_id, "role": UserRole.TUTOR}, {"$set": update_data})
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Tutor not found")
    
    return {"message": "Tutor updated successfully"}

@api_router.delete("/tutors/{tutor_id}")
async def delete_tutor(
    tutor_id: str,
    current_user: dict = Depends(require_role([UserRole.ADMIN]))
):
    result = await db.users.delete_one({"id": tutor_id, "role": UserRole.TUTOR})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Tutor not found")
    
    return {"message": "Tutor deleted successfully"}

# ============ STUDENT ROUTES ============

@api_router.post("/students", response_model=Student)
async def create_student(
    student_data: StudentCreate,
    current_user: dict = Depends(require_role([UserRole.ADMIN, UserRole.TUTOR]))
):
    # Get batch name
    batch = await db.batches.find_one({"id": student_data.batch_id}, {"_id": 0})
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    student = Student(
        **student_data.model_dump(),
        institute_id=current_user["institute_id"] or current_user["id"],
        batch_name=batch["name"],
        paid_amount=0.0
    )
    
    doc = student.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    
    await db.students.insert_one(doc)
    
    # Create student user account
    user_data = UserCreate(
        email=student.email,
        password="Student@123",  # Static temporary password
        name=student.name,
        role=UserRole.STUDENT,
        phone=student.phone,
        whatsapp=student.whatsapp,
        institute_id=student.institute_id,
        must_change_password=True
    )
    
    # Check if user already exists
    existing = await db.users.find_one({"email": student.email})
    if not existing:
        user_dict = user_data.model_dump()
        hashed_pw = hash_password(user_dict.pop("password"))
        user = User(**user_dict)
        user_doc = user.model_dump()
        user_doc["password"] = hashed_pw
        user_doc["created_at"] = user_doc["created_at"].isoformat()
        await db.users.insert_one(user_doc)
    
    # Blueprint: Send WhatsApp welcome message
    # await notification_service.send_whatsapp(student.phone, f"Welcome to {batch['name']}!")
    
    return student

@api_router.post("/students/upload-excel")
async def upload_students_excel(
    file: UploadFile = File(...),
    batch_id: str = None,
    current_user: dict = Depends(require_role([UserRole.ADMIN]))
):
    """Upload students via Excel file"""
    try:
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        
        # Expected columns: name, email, phone, whatsapp, total_fees
        required_cols = ["name", "email", "phone"]
        if not all(col in df.columns for col in required_cols):
            raise HTTPException(status_code=400, detail=f"Excel must have columns: {required_cols}")
        
        if not batch_id:
            raise HTTPException(status_code=400, detail="batch_id is required")
        
        batch = await db.batches.find_one({"id": batch_id}, {"_id": 0})
        if not batch:
            raise HTTPException(status_code=404, detail="Batch not found")
        
        students_created = []
        
        for _, row in df.iterrows():
            student = Student(
                name=str(row["name"]),
                email=str(row["email"]),
                phone=str(row["phone"]),
                whatsapp=str(row.get("whatsapp", row["phone"])),
                batch_id=batch_id,
                batch_name=batch["name"],
                total_fees=float(row.get("total_fees", 0.0)),
                paid_amount=0.0,
                institute_id=current_user["institute_id"] or current_user["id"]
            )
            
            doc = student.model_dump()
            doc["created_at"] = doc["created_at"].isoformat()
            
            await db.students.insert_one(doc)
            students_created.append(student.name)
            
            # Create user account
            existing = await db.users.find_one({"email": student.email})
            if not existing:
                user_data = UserCreate(
                    email=student.email,
                    password="Student@123",
                    name=student.name,
                    role=UserRole.STUDENT,
                    phone=student.phone,
                    whatsapp=student.whatsapp,
                    institute_id=student.institute_id,
                    must_change_password=True
                )
                user_dict = user_data.model_dump()
                hashed_pw = hash_password(user_dict.pop("password"))
                user = User(**user_dict)
                user_doc = user.model_dump()
                user_doc["password"] = hashed_pw
                user_doc["created_at"] = user_doc["created_at"].isoformat()
                await db.users.insert_one(user_doc)
        
        return {"message": f"Successfully added {len(students_created)} students", "students": students_created}
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/students", response_model=List[Student])
async def get_students(batch_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {}
    
    if batch_id:
        query["batch_id"] = batch_id
    elif current_user["role"] == UserRole.TUTOR:
        # Get batches assigned to tutor
        batches = await db.batches.find({"tutor_id": current_user["id"]}, {"_id": 0}).to_list(1000)
        batch_ids = [b["id"] for b in batches]
        query["batch_id"] = {"$in": batch_ids}
    elif current_user["role"] == UserRole.STUDENT:
        query["email"] = current_user["email"]
    else:
        institute_id = current_user["institute_id"] or current_user["id"]
        query["institute_id"] = institute_id
    
    students = await db.students.find(query, {"_id": 0}).to_list(1000)
    
    for student in students:
        if isinstance(student["created_at"], str):
            student["created_at"] = datetime.fromisoformat(student["created_at"])
    
    return students

@api_router.get("/students/{student_id}", response_model=Student)
async def get_student(student_id: str, current_user: dict = Depends(get_current_user)):
    student = await db.students.find_one({"id": student_id}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    if isinstance(student["created_at"], str):
        student["created_at"] = datetime.fromisoformat(student["created_at"])
    
    return Student(**student)

@api_router.put("/students/{student_id}")
async def update_student(
    student_id: str,
    student_update: StudentUpdate,
    current_user: dict = Depends(require_role([UserRole.ADMIN, UserRole.TUTOR]))
):
    update_data = {k: v for k, v in student_update.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    # If batch_id changed, update batch_name
    if "batch_id" in update_data:
        batch = await db.batches.find_one({"id": update_data["batch_id"]}, {"_id": 0})
        if batch:
            update_data["batch_name"] = batch["name"]
    
    result = await db.students.update_one({"id": student_id}, {"$set": update_data})
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Also update user account if email changed
    if "email" in update_data:
        await db.users.update_one(
            {"email": (await db.students.find_one({"id": student_id}))["email"], "role": UserRole.STUDENT},
            {"$set": {"email": update_data["email"]}}
        )
    
    return {"message": "Student updated successfully"}

@api_router.delete("/students/{student_id}")
async def delete_student(
    student_id: str,
    current_user: dict = Depends(require_role([UserRole.ADMIN]))
):
    student = await db.students.find_one({"id": student_id}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Delete student record
    await db.students.delete_one({"id": student_id})
    
    # Delete user account
    await db.users.delete_one({"email": student["email"], "role": UserRole.STUDENT})
    
    return {"message": "Student deleted successfully"}

# ============ ENQUIRY/LEADS ROUTES ============

@api_router.post("/enquiries", response_model=Enquiry)
async def create_enquiry(enquiry_data: EnquiryCreate):
    """Public endpoint for website enquiries"""
    # For public enquiries, we need to determine institute_id
    # For now, use a default or first admin found
    admin = await db.users.find_one({"role": UserRole.ADMIN}, {"_id": 0})
    institute_id = admin["id"] if admin else "default"
    
    enquiry = Enquiry(
        **enquiry_data.model_dump(),
        institute_id=institute_id
    )
    
    doc = enquiry.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    
    await db.enquiries.insert_one(doc)
    
    return enquiry

@api_router.get("/enquiries", response_model=List[Enquiry])
async def get_enquiries(
    status: Optional[str] = None,
    current_user: dict = Depends(require_role([UserRole.ADMIN]))
):
    institute_id = current_user["institute_id"] or current_user["id"]
    query = {"institute_id": institute_id}
    
    if status:
        query["status"] = status
    
    enquiries = await db.enquiries.find(query, {"_id": 0}).to_list(1000)
    
    for enq in enquiries:
        if isinstance(enq["created_at"], str):
            enq["created_at"] = datetime.fromisoformat(enq["created_at"])
    
    return enquiries

@api_router.patch("/enquiries/{enquiry_id}")
async def update_enquiry_status(
    enquiry_id: str,
    status: str,
    notes: Optional[str] = None,
    current_user: dict = Depends(require_role([UserRole.ADMIN]))
):
    update_data = {"status": status}
    if notes:
        update_data["notes"] = notes
    
    result = await db.enquiries.update_one({"id": enquiry_id}, {"$set": update_data})
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    
    return {"message": "Enquiry updated successfully"}

@api_router.delete("/enquiries/{enquiry_id}")
async def delete_enquiry(
    enquiry_id: str,
    current_user: dict = Depends(require_role([UserRole.ADMIN]))
):
    result = await db.enquiries.delete_one({"id": enquiry_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    
    return {"message": "Enquiry deleted successfully"}

# ============ INVITE ROUTES ============

@api_router.post("/invites", response_model=Invite)
async def create_invite(
    invite_data: InviteCreate,
    current_user: dict = Depends(require_role([UserRole.ADMIN]))
):
    batch_name = None
    if invite_data.batch_id:
        batch = await db.batches.find_one({"id": invite_data.batch_id}, {"_id": 0})
        if not batch:
            raise HTTPException(status_code=404, detail="Batch not found")
        batch_name = batch["name"]
    
    invite = Invite(
        **invite_data.model_dump(),
        batch_name=batch_name,
        invite_code=generate_invite_code(),
        institute_id=current_user["institute_id"] or current_user["id"]
    )
    
    doc = invite.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    
    await db.invites.insert_one(doc)
    
    # Blueprint: Send invite email
    # await notification_service.send_email(
    #     invite.email,
    #     "TutorHub Invitation",
    #     f"You're invited! Use code: {invite.invite_code}"
    # )
    
    return invite

@api_router.get("/invites", response_model=List[Invite])
async def get_invites(current_user: dict = Depends(require_role([UserRole.ADMIN]))):
    institute_id = current_user["institute_id"] or current_user["id"]
    invites = await db.invites.find({"institute_id": institute_id}, {"_id": 0}).to_list(1000)
    
    for invite in invites:
        if isinstance(invite["created_at"], str):
            invite["created_at"] = datetime.fromisoformat(invite["created_at"])
    
    return invites

@api_router.post("/invites/accept/{invite_code}")
async def accept_invite(invite_code: str, password: str):
    """Accept invite and create account"""
    invite = await db.invites.find_one({"invite_code": invite_code, "status": "pending"}, {"_id": 0})
    
    if not invite:
        raise HTTPException(status_code=404, detail="Invalid or expired invite code")
    
    # Check if user already exists
    existing = await db.users.find_one({"email": invite["email"]})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user account
    user_data = UserCreate(
        email=invite["email"],
        password=password,
        name=invite["email"].split("@")[0],  # Default name
        role=invite["role"],
        institute_id=invite["institute_id"]
    )
    
    user_dict = user_data.model_dump()
    hashed_pw = hash_password(user_dict.pop("password"))
    
    user = User(**user_dict)
    doc = user.model_dump()
    doc["password"] = hashed_pw
    doc["created_at"] = doc["created_at"].isoformat()
    
    await db.users.insert_one(doc)
    
    # Update invite status
    await db.invites.update_one({"id": invite["id"]}, {"$set": {"status": "accepted"}})
    
    # Create token
    token = create_access_token({"sub": user.id, "role": user.role})
    
    if isinstance(doc["created_at"], str):
        doc["created_at"] = datetime.fromisoformat(doc["created_at"])
    
    return Token(access_token=token, token_type="bearer", user=User(**doc))

@api_router.post("/invites/bulk")
async def bulk_invite_students(
    batch_id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(require_role([UserRole.ADMIN]))
):
    """Bulk invite students for a batch via CSV"""
    batch = await db.batches.find_one({"id": batch_id}, {"_id": 0})
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        
        if "email" not in df.columns:
            raise HTTPException(status_code=400, detail="CSV must have 'email' column")
        
        invites_created = []
        
        for _, row in df.iterrows():
            email = str(row["email"]).strip()
            
            invite = Invite(
                email=email,
                role=UserRole.STUDENT,
                batch_id=batch_id,
                batch_name=batch["name"],
                invite_code=generate_invite_code(),
                institute_id=current_user["institute_id"] or current_user["id"]
            )
            
            doc = invite.model_dump()
            doc["created_at"] = doc["created_at"].isoformat()
            
            await db.invites.insert_one(doc)
            invites_created.append(email)
        
        return {"message": f"Successfully sent {len(invites_created)} invites", "emails": invites_created}
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ============ CLASS SCHEDULE CSV UPLOAD ============

@api_router.get("/schedule/sample-csv")
async def download_sample_csv():
    """Download sample CSV template for class schedule"""
    from fastapi.responses import StreamingResponse
    import io
    
    sample_data = "date,time,topic\n"
    
    return StreamingResponse(
        io.BytesIO(sample_data.encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=class_schedule_sample.csv"}
    )

@api_router.get("/students/sample-csv")
async def download_students_sample_csv():
    """Download sample CSV template for student upload"""
    from fastapi.responses import StreamingResponse
    import io
    
    sample_data = "name,email,phone,whatsapp,total_fees\n"
    
    return StreamingResponse(
        io.BytesIO(sample_data.encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=students_sample.csv"}
    )

@api_router.get("/invites/sample-csv")
async def download_invites_sample_csv():
    """Download sample CSV template for bulk invites"""
    from fastapi.responses import StreamingResponse
    import io
    
    sample_data = "email\n"
    
    return StreamingResponse(
        io.BytesIO(sample_data.encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=bulk_invites_sample.csv"}
    )

@api_router.post("/schedule/upload-csv")
async def upload_class_schedule(
    file: UploadFile = File(...),
    batch_id: str = None,
    current_user: dict = Depends(require_role([UserRole.ADMIN, UserRole.TUTOR]))
):
    """Upload class schedule via CSV - dates are optional"""
    if not batch_id:
        raise HTTPException(status_code=400, detail="batch_id is required")
    
    batch = await db.batches.find_one({"id": batch_id}, {"_id": 0})
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        
        required_cols = ["time"]
        if not all(col in df.columns for col in required_cols):
            raise HTTPException(status_code=400, detail="CSV must have 'time' column at minimum")
        
        classes_created = []
        current_date = datetime.now(timezone.utc)
        
        for idx, row in df.iterrows():
            # If date provided, use it; otherwise auto-schedule for next day
            if "date" in df.columns and pd.notna(row["date"]):
                class_date = datetime.strptime(str(row["date"]), "%Y-%m-%d")
            else:
                # Auto-schedule for the next day
                class_date = current_date + timedelta(days=idx + 1)
            
            class_schedule = ClassSchedule(
                batch_id=batch_id,
                batch_name=batch["name"],
                class_date=class_date,
                class_time=str(row["time"]),
                topic=str(row.get("topic", "")) if pd.notna(row.get("topic")) else None,
                tutor_id=batch["tutor_id"],
                institute_id=current_user["institute_id"] or current_user["id"]
            )
            
            doc = class_schedule.model_dump()
            doc["class_date"] = doc["class_date"].isoformat()
            doc["created_at"] = doc["created_at"].isoformat()
            
            await db.classes.insert_one(doc)
            classes_created.append(class_schedule.id)
        
        return {"message": f"Successfully created {len(classes_created)} classes", "class_ids": classes_created}
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/schedule/generate-recurring")
async def generate_recurring_schedule(
    batch_id: str,
    start_date: str,
    end_date: str,
    days_of_week: List[int],  # 0=Monday, 6=Sunday
    class_time: str,
    current_user: dict = Depends(require_role([UserRole.ADMIN, UserRole.TUTOR]))
):
    """Generate recurring class schedule based on batch frequency"""
    batch = await db.batches.find_one({"id": batch_id}, {"_id": 0})
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    start = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")
    
    classes_created = []
    current_date = start
    
    while current_date <= end:
        if current_date.weekday() in days_of_week:
            class_schedule = ClassSchedule(
                batch_id=batch_id,
                batch_name=batch["name"],
                class_date=current_date,
                class_time=class_time,
                tutor_id=batch["tutor_id"],
                institute_id=current_user["institute_id"] or current_user["id"]
            )
            
            doc = class_schedule.model_dump()
            doc["class_date"] = doc["class_date"].isoformat()
            doc["created_at"] = doc["created_at"].isoformat()
            
            await db.classes.insert_one(doc)
            classes_created.append(current_date.strftime("%Y-%m-%d"))
        
        current_date += timedelta(days=1)
    
    return {"message": f"Successfully created {len(classes_created)} recurring classes", "dates": classes_created}

@api_router.patch("/classes/{class_id}/mark-absent")
async def mark_class_absent(
    class_id: str,
    reschedule_date: Optional[str] = None,
    current_user: dict = Depends(require_role([UserRole.ADMIN, UserRole.TUTOR]))
):
    """Mark class as absent and optionally reschedule"""
    class_item = await db.classes.find_one({"id": class_id}, {"_id": 0})
    if not class_item:
        raise HTTPException(status_code=404, detail="Class not found")
    
    # Mark current class as cancelled
    await db.classes.update_one(
        {"id": class_id},
        {"$set": {"status": "cancelled", "notes": "Tutor absent"}}
    )
    
    # If reschedule date provided, create new class
    if reschedule_date:
        new_class = ClassSchedule(
            batch_id=class_item["batch_id"],
            batch_name=class_item["batch_name"],
            class_date=datetime.strptime(reschedule_date, "%Y-%m-%d"),
            class_time=class_item["class_time"],
            topic=class_item.get("topic"),
            tutor_id=class_item["tutor_id"],
            institute_id=class_item["institute_id"],
            notes="Rescheduled from cancelled class"
        )
        
        doc = new_class.model_dump()
        doc["class_date"] = doc["class_date"].isoformat()
        doc["created_at"] = doc["created_at"].isoformat()
        
        await db.classes.insert_one(doc)
        
        return {"message": "Class marked absent and rescheduled", "new_class_id": new_class.id}
    
    return {"message": "Class marked as absent"}

# ============ PAYMENT ROUTES ============

@api_router.post("/payments", response_model=Payment)
async def create_payment(
    payment_data: PaymentCreate,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(require_role([UserRole.ADMIN, UserRole.TUTOR]))
):
    # Get student
    student = await db.students.find_one({"id": payment_data.student_id}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    payment = Payment(
        **payment_data.model_dump(),
        institute_id=current_user["institute_id"] or current_user["id"],
        student_name=student["name"]
    )
    
    doc = payment.model_dump()
    doc["payment_date"] = doc["payment_date"].isoformat()
    doc["created_at"] = doc["created_at"].isoformat()
    
    await db.payments.insert_one(doc)
    
    # Update student payment status
    new_paid = student["paid_amount"] + payment.amount
    total = student["total_fees"]
    
    status = "unpaid"
    if new_paid >= total:
        status = "paid"
    elif new_paid > 0:
        status = "partial"
    
    await db.students.update_one(
        {"id": payment_data.student_id},
        {"$set": {"paid_amount": new_paid, "payment_status": status}}
    )
    
    # Blueprint: Send receipt via WhatsApp/Email
    # background_tasks.add_task(notification_service.send_whatsapp, student["phone"], f"Payment of ₹{payment.amount} received")
    
    return payment

@api_router.get("/payments", response_model=List[Payment])
async def get_payments(
    student_id: Optional[str] = None,
    batch_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    
    if student_id:
        query["student_id"] = student_id
    elif batch_id:
        query["batch_id"] = batch_id
    elif current_user["role"] == UserRole.STUDENT:
        student = await db.students.find_one({"email": current_user["email"]}, {"_id": 0})
        if student:
            query["student_id"] = student["id"]
    elif current_user["role"] == UserRole.TUTOR:
        batches = await db.batches.find({"tutor_id": current_user["id"]}, {"_id": 0}).to_list(1000)
        batch_ids = [b["id"] for b in batches]
        query["batch_id"] = {"$in": batch_ids}
    else:
        institute_id = current_user["institute_id"] or current_user["id"]
        query["institute_id"] = institute_id
    
    payments = await db.payments.find(query, {"_id": 0}).to_list(1000)
    
    for payment in payments:
        if isinstance(payment["payment_date"], str):
            payment["payment_date"] = datetime.fromisoformat(payment["payment_date"])
        if isinstance(payment["created_at"], str):
            payment["created_at"] = datetime.fromisoformat(payment["created_at"])
    
    return payments

# ============ CLASS SCHEDULE ROUTES ============

@api_router.post("/classes", response_model=ClassSchedule)
async def create_class(
    class_data: ClassScheduleCreate,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(require_role([UserRole.ADMIN, UserRole.TUTOR]))
):
    batch = await db.batches.find_one({"id": class_data.batch_id}, {"_id": 0})
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    class_schedule = ClassSchedule(
        **class_data.model_dump(),
        batch_name=batch["name"],
        tutor_id=batch["tutor_id"],
        institute_id=current_user["institute_id"] or current_user["id"]
    )
    
    doc = class_schedule.model_dump()
    doc["class_date"] = doc["class_date"].isoformat()
    doc["created_at"] = doc["created_at"].isoformat()
    
    await db.classes.insert_one(doc)
    
    # Blueprint: Send class reminders
    # students = await db.students.find({"batch_id": batch["id"]}, {"_id": 0}).to_list(1000)
    # for student in students:
    #     background_tasks.add_task(notification_service.send_whatsapp, student["phone"], f"Class reminder: {batch['name']} at {class_schedule.class_time}")
    
    return class_schedule

@api_router.get("/classes", response_model=List[ClassSchedule])
async def get_classes(
    batch_id: Optional[str] = None,
    date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    
    if batch_id:
        query["batch_id"] = batch_id
    elif current_user["role"] == UserRole.TUTOR:
        query["tutor_id"] = current_user["id"]
    elif current_user["role"] == UserRole.STUDENT:
        student = await db.students.find_one({"email": current_user["email"]}, {"_id": 0})
        if student:
            query["batch_id"] = student["batch_id"]
    else:
        institute_id = current_user["institute_id"] or current_user["id"]
        query["institute_id"] = institute_id
    
    if date:
        # Filter by date
        date_obj = datetime.fromisoformat(date)
        query["class_date"] = date_obj.isoformat()
    
    classes = await db.classes.find(query, {"_id": 0}).to_list(1000)
    
    for cls in classes:
        if isinstance(cls["class_date"], str):
            cls["class_date"] = datetime.fromisoformat(cls["class_date"])
        if isinstance(cls["created_at"], str):
            cls["created_at"] = datetime.fromisoformat(cls["created_at"])
    
    return classes

@api_router.patch("/classes/{class_id}")
async def update_class(
    class_id: str,
    status: Optional[str] = None,
    class_date: Optional[datetime] = None,
    current_user: dict = Depends(require_role([UserRole.ADMIN, UserRole.TUTOR]))
):
    update_data = {}
    if status:
        update_data["status"] = status
    if class_date:
        update_data["class_date"] = class_date.isoformat()
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    result = await db.classes.update_one({"id": class_id}, {"$set": update_data})
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Class not found")
    
    return {"message": "Class updated successfully"}

# ============ STUDY MATERIAL ROUTES ============

@api_router.post("/materials", response_model=StudyMaterial)
async def create_material(
    material_data: StudyMaterialCreate,
    current_user: dict = Depends(require_role([UserRole.ADMIN, UserRole.TUTOR]))
):
    batch = await db.batches.find_one({"id": material_data.batch_id}, {"_id": 0})
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    material = StudyMaterial(
        **material_data.model_dump(),
        batch_name=batch["name"],
        uploaded_by=current_user["id"],
        uploader_name=current_user["name"],
        institute_id=current_user["institute_id"] or current_user["id"]
    )
    
    doc = material.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    if doc["expiry_date"]:
        doc["expiry_date"] = doc["expiry_date"].isoformat()
    
    await db.materials.insert_one(doc)
    
    return material

@api_router.get("/materials", response_model=List[StudyMaterial])
async def get_materials(
    batch_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    
    if batch_id:
        query["batch_id"] = batch_id
    elif current_user["role"] == UserRole.STUDENT:
        student = await db.students.find_one({"email": current_user["email"]}, {"_id": 0})
        if student:
            query["batch_id"] = student["batch_id"]
    elif current_user["role"] == UserRole.TUTOR:
        batches = await db.batches.find({"tutor_id": current_user["id"]}, {"_id": 0}).to_list(1000)
        batch_ids = [b["id"] for b in batches]
        query["batch_id"] = {"$in": batch_ids}
    else:
        institute_id = current_user["institute_id"] or current_user["id"]
        query["institute_id"] = institute_id
    
    materials = await db.materials.find(query, {"_id": 0}).to_list(1000)
    
    # Filter out expired materials for students
    now = datetime.now(timezone.utc)
    filtered_materials = []
    
    for material in materials:
        if isinstance(material["created_at"], str):
            material["created_at"] = datetime.fromisoformat(material["created_at"])
        if material.get("expiry_date") and isinstance(material["expiry_date"], str):
            material["expiry_date"] = datetime.fromisoformat(material["expiry_date"])
        
        # Only filter for students
        if current_user["role"] == UserRole.STUDENT:
            if not material.get("expiry_date") or material["expiry_date"] > now:
                filtered_materials.append(material)
        else:
            filtered_materials.append(material)
    
    return filtered_materials

# ============ HOMEWORK ROUTES ============

@api_router.post("/homework", response_model=Homework)
async def create_homework(
    homework_data: HomeworkCreate,
    current_user: dict = Depends(require_role([UserRole.ADMIN, UserRole.TUTOR]))
):
    batch = await db.batches.find_one({"id": homework_data.batch_id}, {"_id": 0})
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    homework = Homework(
        **homework_data.model_dump(),
        batch_name=batch["name"],
        tutor_id=current_user["id"],
        institute_id=current_user["institute_id"] or current_user["id"]
    )
    
    doc = homework.model_dump()
    doc["due_date"] = doc["due_date"].isoformat()
    doc["created_at"] = doc["created_at"].isoformat()
    
    await db.homework.insert_one(doc)
    
    return homework

@api_router.get("/homework", response_model=List[Homework])
async def get_homework(
    batch_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    
    if batch_id:
        query["batch_id"] = batch_id
    elif current_user["role"] == UserRole.STUDENT:
        student = await db.students.find_one({"email": current_user["email"]}, {"_id": 0})
        if student:
            query["batch_id"] = student["batch_id"]
    elif current_user["role"] == UserRole.TUTOR:
        query["tutor_id"] = current_user["id"]
    else:
        institute_id = current_user["institute_id"] or current_user["id"]
        query["institute_id"] = institute_id
    
    homework_list = await db.homework.find(query, {"_id": 0}).to_list(1000)
    
    for hw in homework_list:
        if isinstance(hw["due_date"], str):
            hw["due_date"] = datetime.fromisoformat(hw["due_date"])
        if isinstance(hw["created_at"], str):
            hw["created_at"] = datetime.fromisoformat(hw["created_at"])
    
    return homework_list

@api_router.post("/homework/submit", response_model=HomeworkSubmission)
async def submit_homework(
    submission_data: HomeworkSubmissionCreate,
    current_user: dict = Depends(require_role([UserRole.STUDENT]))
):
    homework = await db.homework.find_one({"id": submission_data.homework_id}, {"_id": 0})
    if not homework:
        raise HTTPException(status_code=404, detail="Homework not found")
    
    student = await db.students.find_one({"email": current_user["email"]}, {"_id": 0})
    
    submission = HomeworkSubmission(
        **submission_data.model_dump(),
        student_id=student["id"],
        student_name=student["name"],
        institute_id=current_user["institute_id"] or current_user["id"]
    )
    
    doc = submission.model_dump()
    doc["submitted_at"] = doc["submitted_at"].isoformat()
    
    await db.homework_submissions.insert_one(doc)
    
    return submission

@api_router.get("/homework/{homework_id}/submissions", response_model=List[HomeworkSubmission])
async def get_homework_submissions(
    homework_id: str,
    current_user: dict = Depends(require_role([UserRole.ADMIN, UserRole.TUTOR]))
):
    submissions = await db.homework_submissions.find({"homework_id": homework_id}, {"_id": 0}).to_list(1000)
    
    for sub in submissions:
        if isinstance(sub["submitted_at"], str):
            sub["submitted_at"] = datetime.fromisoformat(sub["submitted_at"])
    
    return submissions

@api_router.patch("/homework/submissions/{submission_id}")
async def update_submission(
    submission_id: str,
    status: str,
    feedback: Optional[str] = None,
    current_user: dict = Depends(require_role([UserRole.ADMIN, UserRole.TUTOR]))
):
    update_data = {"status": status}
    if feedback:
        update_data["feedback"] = feedback
    
    result = await db.homework_submissions.update_one({"id": submission_id}, {"$set": update_data})
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    return {"message": "Submission updated successfully"}

# ============ DASHBOARD STATS ============

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    institute_id = current_user["institute_id"] or current_user["id"]
    
    if current_user["role"] == UserRole.ADMIN:
        total_batches = await db.batches.count_documents({"institute_id": institute_id})
        total_students = await db.students.count_documents({"institute_id": institute_id})
        total_tutors = await db.users.count_documents({"institute_id": institute_id, "role": UserRole.TUTOR})
        
        # Revenue calculation
        payments = await db.payments.find({"institute_id": institute_id}, {"_id": 0}).to_list(10000)
        total_revenue = sum(p["amount"] for p in payments)
        
        # Pending fees
        students = await db.students.find({"institute_id": institute_id}, {"_id": 0}).to_list(10000)
        pending_fees = sum(s["total_fees"] - s["paid_amount"] for s in students)
        
        return {
            "total_batches": total_batches,
            "total_students": total_students,
            "total_tutors": total_tutors,
            "total_revenue": total_revenue,
            "pending_fees": pending_fees
        }
    
    elif current_user["role"] == UserRole.TUTOR:
        batches = await db.batches.find({"tutor_id": current_user["id"]}, {"_id": 0}).to_list(1000)
        batch_ids = [b["id"] for b in batches]
        
        total_students = await db.students.count_documents({"batch_id": {"$in": batch_ids}})
        
        # Today's classes
        today = datetime.now(timezone.utc).date()
        today_classes = await db.classes.find({
            "tutor_id": current_user["id"],
            "class_date": {"$gte": datetime.combine(today, datetime.min.time()).isoformat()}
        }, {"_id": 0}).to_list(1000)
        
        return {
            "total_batches": len(batches),
            "total_students": total_students,
            "today_classes": len(today_classes)
        }
    
    elif current_user["role"] == UserRole.STUDENT:
        student = await db.students.find_one({"email": current_user["email"]}, {"_id": 0})
        if not student:
            return {"message": "Student profile not found"}
        
        # Today's classes
        today = datetime.now(timezone.utc).date()
        today_classes = await db.classes.find({
            "batch_id": student["batch_id"],
            "class_date": {"$gte": datetime.combine(today, datetime.min.time()).isoformat()}
        }, {"_id": 0}).to_list(1000)
        
        # Pending homework
        homework_list = await db.homework.find({"batch_id": student["batch_id"]}, {"_id": 0}).to_list(1000)
        submissions = await db.homework_submissions.find({"student_id": student["id"]}, {"_id": 0}).to_list(1000)
        submitted_hw_ids = {s["homework_id"] for s in submissions}
        pending_homework = [hw for hw in homework_list if hw["id"] not in submitted_hw_ids]
        
        return {
            "batch_name": student["batch_name"],
            "payment_status": student["payment_status"],
            "total_fees": student["total_fees"],
            "paid_amount": student["paid_amount"],
            "pending_amount": student["total_fees"] - student["paid_amount"],
            "today_classes": len(today_classes),
            "pending_homework": len(pending_homework)
        }
    
    return {}

# ============ ROOT ============

@api_router.get("/")
async def root():
    return {"message": "TutorHub API", "status": "running"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
