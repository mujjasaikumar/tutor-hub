"""Student management services."""
from typing import List, Optional
from datetime import datetime

from database import database
from models import (
    StudentCreateSchema,
    StudentResponseSchema,
    StudentUpdateSchema,
    UserCreateSchema,
    UserRoleEnum
)
from .user_service import user_management_service

class StudentManagementService:
    """Service for managing student CRUD operations."""
    
    async def create_student(
        self,
        student_data: StudentCreateSchema,
        institute_id: str
    ) -> StudentResponseSchema:
        """Create a new student with associated user account.
        
        Args:
            student_data: Student creation data
            institute_id: Institute identifier
            
        Returns:
            Created student response schema
        """
        # Create user account for student with temporary password
        user_data = UserCreateSchema(
            email=student_data.email,
            password="Student@123",
            name=student_data.name,
            role=UserRoleEnum.STUDENT,
            phone=student_data.phone,
            whatsapp=student_data.whatsapp,
            institute_id=institute_id,
            must_change_password=True
        )
        
        created_user = await user_management_service.create_user(user_data, institute_id)
        
        # Get batch name
        batch = await database.batches.find_one({"id": student_data.batch_id})
        batch_name = batch["name"] if batch else None
        
        # Create student record
        student_response = StudentResponseSchema(
            **student_data.model_dump(),
            id=created_user.id,
            institute_id=institute_id,
            batch_name=batch_name
        )
        
        document = student_response.model_dump()
        document["created_at"] = document["created_at"].isoformat()
        
        await database.students.insert_one(document)
        
        return student_response
    
    async def get_student_by_id(self, student_id: str) -> Optional[dict]:
        """Retrieve student by ID.
        
        Args:
            student_id: Student identifier
            
        Returns:
            Student document if found
        """
        return await database.students.find_one({"id": student_id}, {"_id": 0})
    
    async def get_all_students(self, institute_id: str) -> List[dict]:
        """Retrieve all students for an institute.
        
        Args:
            institute_id: Institute identifier
            
        Returns:
            List of student documents
        """
        cursor = database.students.find(
            {"institute_id": institute_id},
            {"_id": 0}
        )
        return await cursor.to_list(length=None)
    
    async def get_students_by_batch(self, batch_id: str, institute_id: str) -> List[dict]:
        """Retrieve all students in a specific batch.
        
        Args:
            batch_id: Batch identifier
            institute_id: Institute identifier
            
        Returns:
            List of student documents
        """
        cursor = database.students.find(
            {"batch_id": batch_id, "institute_id": institute_id},
            {"_id": 0}
        )
        return await cursor.to_list(length=None)
    
    async def update_student(self, student_id: str, update_data: StudentUpdateSchema) -> bool:
        """Update student information.
        
        Args:
            student_id: Student identifier
            update_data: Data to update
            
        Returns:
            True if update successful
        """
        update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
        
        if not update_dict:
            return False
        
        # Update student record
        result = await database.students.update_one(
            {"id": student_id},
            {"$set": update_dict}
        )
        
        # Update user record if email/name/phone changed
        user_updates = {}
        if "email" in update_dict:
            user_updates["email"] = update_dict["email"]
        if "name" in update_dict:
            user_updates["name"] = update_dict["name"]
        if "phone" in update_dict:
            user_updates["phone"] = update_dict["phone"]
        
        if user_updates:
            await database.users.update_one(
                {"id": student_id},
                {"$set": user_updates}
            )
        
        return result.modified_count > 0
    
    async def delete_student(self, student_id: str) -> bool:
        """Delete a student and their user account.
        
        Args:
            student_id: Student identifier
            
        Returns:
            True if deletion successful
        """
        # Delete student record
        student_result = await database.students.delete_one({"id": student_id})
        
        # Delete user account
        await database.users.delete_one({"id": student_id})
        
        return student_result.deleted_count > 0
    
    async def update_student_payment_status(self, student_id: str, paid_amount: float) -> None:
        """Update student payment status based on paid amount.
        
        Args:
            student_id: Student identifier
            paid_amount: Total amount paid
        """
        student = await self.get_student_by_id(student_id)
        
        if not student:
            return
        
        total_fees = student.get("total_fees", 0.0)
        
        if paid_amount >= total_fees:
            payment_status = "paid"
        elif paid_amount > 0:
            payment_status = "partial"
        else:
            payment_status = "unpaid"
        
        await database.students.update_one(
            {"id": student_id},
            {"$set": {
                "paid_amount": paid_amount,
                "payment_status": payment_status
            }}
        )

# Export service instance
student_management_service = StudentManagementService()
