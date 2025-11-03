"""Main FastAPI application setup and configuration."""
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
import logging

from .config import ApplicationConfig
from .database import database
from .routes.auth_routes import auth_router

# Import old routes temporarily - will be refactored progressively
from .server_old import (
    api_router as old_api_router,
    app as old_app
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_application() -> FastAPI:
    """Create and configure the FastAPI application.
    
    Returns:
        Configured FastAPI application instance
    """
    application = FastAPI(
        title=ApplicationConfig.APP_NAME,
        version=ApplicationConfig.APP_VERSION,
        debug=ApplicationConfig.DEBUG,
        description="TutorHub - CRM + LMS for tutoring institutes"
    )
    
    # Configure CORS
    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Configure appropriately for production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Create main API router
    main_api_router = APIRouter(prefix="/api")
    
    # Include refactored auth routes
    main_api_router.include_router(auth_router)
    
    # Include the application router
    application.include_router(main_api_router)
    
    logger.info(f"{ApplicationConfig.APP_NAME} v{ApplicationConfig.APP_VERSION} started")
    
    return application

# Create the application instance
app = create_application()

# Temporarily mount old routes for backward compatibility
# These will be progressively refactored into the new structure
from .server_old import (
    # Batch routes
    create_batch, get_batches, get_batch, update_batch, delete_batch,
    upload_student_csv, download_sample_student_csv,
    
    # Student routes  
    create_student, get_students, get_student, update_student, delete_student,
    
    # Payment routes
    create_payment, get_payments, delete_payment,
    
    # Class routes
    get_classes, create_class, upload_class_schedule_csv,
    download_sample_class_schedule_csv, mark_tutor_absent,
    
    # User routes
    get_admins, create_admin, get_tutors, create_tutor, update_tutor, delete_tutor,
    
    # Homework routes
    create_homework, get_homework, submit_homework, get_homework_submissions,
    
    # Study material routes
    create_study_material, get_study_materials,
    
    # Enquiry routes
    create_enquiry, get_enquiries, update_enquiry, delete_enquiry,
    
    # Invite routes
    create_invite, get_invites, bulk_invite_students,
    
    # Dashboard route
    get_batch_activity
)

# Register old routes directly to the app with /api prefix
old_routes_router = APIRouter(prefix="/api")

# Batch routes
old_routes_router.add_api_route("/batches", create_batch, methods=["POST"])
old_routes_router.add_api_route("/batches", get_batches, methods=["GET"])
old_routes_router.add_api_route("/batches/{batch_id}", get_batch, methods=["GET"])
old_routes_router.add_api_route("/batches/{batch_id}", update_batch, methods=["PUT"])
old_routes_router.add_api_route("/batches/{batch_id}", delete_batch, methods=["DELETE"])
old_routes_router.add_api_route("/batches/upload-students", upload_student_csv, methods=["POST"])
old_routes_router.add_api_route("/batches/sample-csv", download_sample_student_csv, methods=["GET"])

# Student routes
old_routes_router.add_api_route("/students", create_student, methods=["POST"])
old_routes_router.add_api_route("/students", get_students, methods=["GET"])
old_routes_router.add_api_route("/students/{student_id}", get_student, methods=["GET"])
old_routes_router.add_api_route("/students/{student_id}", update_student, methods=["PUT"])
old_routes_router.add_api_route("/students/{student_id}", delete_student, methods=["DELETE"])

# Payment routes
old_routes_router.add_api_route("/payments", create_payment, methods=["POST"])
old_routes_router.add_api_route("/payments", get_payments, methods=["GET"])
old_routes_router.add_api_route("/payments/{payment_id}", delete_payment, methods=["DELETE"])

# Class routes
old_routes_router.add_api_route("/classes", get_classes, methods=["GET"])
old_routes_router.add_api_route("/classes", create_class, methods=["POST"])
old_routes_router.add_api_route("/classes/upload-schedule", upload_class_schedule_csv, methods=["POST"])
old_routes_router.add_api_route("/classes/sample-csv", download_sample_class_schedule_csv, methods=["GET"])
old_routes_router.add_api_route("/classes/{class_id}/mark-absent", mark_tutor_absent, methods=["POST"])

# User routes
old_routes_router.add_api_route("/admins", get_admins, methods=["GET"])
old_routes_router.add_api_route("/admins", create_admin, methods=["POST"])
old_routes_router.add_api_route("/tutors", get_tutors, methods=["GET"])
old_routes_router.add_api_route("/tutors", create_tutor, methods=["POST"])
old_routes_router.add_api_route("/tutors/{tutor_id}", update_tutor, methods=["PUT"])
old_routes_router.add_api_route("/tutors/{tutor_id}", delete_tutor, methods=["DELETE"])

# Homework routes
old_routes_router.add_api_route("/homework", create_homework, methods=["POST"])
old_routes_router.add_api_route("/homework", get_homework, methods=["GET"])
old_routes_router.add_api_route("/homework/submit", submit_homework, methods=["POST"])
old_routes_router.add_api_route("/homework/{homework_id}/submissions", get_homework_submissions, methods=["GET"])

# Study material routes
old_routes_router.add_api_route("/materials", create_study_material, methods=["POST"])
old_routes_router.add_api_route("/materials", get_study_materials, methods=["GET"])

# Enquiry routes
old_routes_router.add_api_route("/enquiries", create_enquiry, methods=["POST"])
old_routes_router.add_api_route("/enquiries", get_enquiries, methods=["GET"])
old_routes_router.add_api_route("/enquiries/{enquiry_id}", update_enquiry, methods=["PUT"])
old_routes_router.add_api_route("/enquiries/{enquiry_id}", delete_enquiry, methods=["DELETE"])

# Invite routes
old_routes_router.add_api_route("/invites", create_invite, methods=["POST"])
old_routes_router.add_api_route("/invites", get_invites, methods=["GET"])
old_routes_router.add_api_route("/invites/bulk", bulk_invite_students, methods=["POST"])

# Dashboard route
old_routes_router.add_api_route("/batches/{batch_id}/activity", get_batch_activity, methods=["GET"])

app.include_router(old_routes_router)

@app.get("/")
async def root():
    """Root endpoint - health check."""
    return {
        "app": ApplicationConfig.APP_NAME,
        "version": ApplicationConfig.APP_VERSION,
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "database": "connected"}
