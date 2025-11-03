"""Payment management services."""
from typing import List, Optional
from datetime import datetime

from ..database import database
from ..models import PaymentCreateSchema, PaymentResponseSchema
from .student_service import student_management_service

class PaymentManagementService:
    """Service for managing payment CRUD operations."""
    
    async def create_payment(
        self,
        payment_data: PaymentCreateSchema,
        institute_id: str
    ) -> PaymentResponseSchema:
        """Create a new payment record.
        
        Args:
            payment_data: Payment creation data
            institute_id: Institute identifier
            
        Returns:
            Created payment response schema
        """
        # Get student name
        student = await database.students.find_one({"id": payment_data.student_id})
        student_name = student["name"] if student else None
        
        payment_response = PaymentResponseSchema(
            **payment_data.model_dump(),
            institute_id=institute_id,
            student_name=student_name
        )
        
        document = payment_response.model_dump()
        document["payment_date"] = document["payment_date"].isoformat()
        document["created_at"] = document["created_at"].isoformat()
        
        await database.payments.insert_one(document)
        
        # Update student payment status
        await self._update_student_payment_total(payment_data.student_id)
        
        return payment_response
    
    async def _update_student_payment_total(self, student_id: str) -> None:
        """Recalculate and update student's total paid amount.
        
        Args:
            student_id: Student identifier
        """
        # Calculate total paid by student
        pipeline = [
            {"$match": {"student_id": student_id}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]
        
        result = await database.payments.aggregate(pipeline).to_list(length=1)
        total_paid = result[0]["total"] if result else 0.0
        
        # Update student payment status
        await student_management_service.update_student_payment_status(
            student_id,
            total_paid
        )
    
    async def get_payment_by_id(self, payment_id: str) -> Optional[dict]:
        """Retrieve payment by ID.
        
        Args:
            payment_id: Payment identifier
            
        Returns:
            Payment document if found
        """
        return await database.payments.find_one({"id": payment_id}, {"_id": 0})
    
    async def get_all_payments(self, institute_id: str) -> List[dict]:
        """Retrieve all payments for an institute.
        
        Args:
            institute_id: Institute identifier
            
        Returns:
            List of payment documents
        """
        cursor = database.payments.find(
            {"institute_id": institute_id},
            {"_id": 0}
        )
        return await cursor.to_list(length=None)
    
    async def get_payments_by_student(self, student_id: str) -> List[dict]:
        """Retrieve all payments for a student.
        
        Args:
            student_id: Student identifier
            
        Returns:
            List of payment documents
        """
        cursor = database.payments.find(
            {"student_id": student_id},
            {"_id": 0}
        )
        return await cursor.to_list(length=None)
    
    async def get_payments_by_batch(self, batch_id: str) -> List[dict]:
        """Retrieve all payments for a batch.
        
        Args:
            batch_id: Batch identifier
            
        Returns:
            List of payment documents
        """
        cursor = database.payments.find(
            {"batch_id": batch_id},
            {"_id": 0}
        )
        return await cursor.to_list(length=None)
    
    async def delete_payment(self, payment_id: str) -> bool:
        """Delete a payment record.
        
        Args:
            payment_id: Payment identifier
            
        Returns:
            True if deletion successful
        """
        payment = await self.get_payment_by_id(payment_id)
        
        if not payment:
            return False
        
        result = await database.payments.delete_one({"id": payment_id})
        
        # Update student payment status
        if result.deleted_count > 0:
            await self._update_student_payment_total(payment["student_id"])
        
        return result.deleted_count > 0

# Export service instance
payment_management_service = PaymentManagementService()
