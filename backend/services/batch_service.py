"""Batch management services."""
from typing import List, Optional
from datetime import datetime, timezone

from database import database
from models import (
    BatchCreateSchema,
    BatchResponseSchema,
    BatchUpdateSchema
)

class BatchManagementService:
    """Service for managing batch CRUD operations."""
    
    async def create_batch(
        self,
        batch_data: BatchCreateSchema,
        institute_id: str
    ) -> BatchResponseSchema:
        """Create a new batch.
        
        Args:
            batch_data: Batch creation data
            institute_id: Institute identifier
            
        Returns:
            Created batch response schema
        """
        # Get tutor name
        tutor = await database.users.find_one({"id": batch_data.tutor_id})
        tutor_name = tutor["name"] if tutor else None
        
        batch_response = BatchResponseSchema(
            **batch_data.model_dump(),
            institute_id=institute_id,
            tutor_name=tutor_name
        )
        
        document = batch_response.model_dump()
        document["start_date"] = document["start_date"].isoformat()
        document["created_at"] = document["created_at"].isoformat()
        if document.get("end_date"):
            document["end_date"] = document["end_date"].isoformat()
        
        await database.batches.insert_one(document)
        
        return batch_response
    
    async def get_batch_by_id(self, batch_id: str) -> Optional[dict]:
        """Retrieve batch by ID.
        
        Args:
            batch_id: Batch identifier
            
        Returns:
            Batch document if found
        """
        return await database.batches.find_one({"id": batch_id}, {"_id": 0})
    
    async def get_all_batches(self, institute_id: str) -> List[dict]:
        """Retrieve all batches for an institute.
        
        Args:
            institute_id: Institute identifier
            
        Returns:
            List of batch documents
        """
        cursor = database.batches.find(
            {"institute_id": institute_id},
            {"_id": 0}
        )
        return await cursor.to_list(length=None)
    
    async def get_batches_by_tutor(self, tutor_id: str, institute_id: str) -> List[dict]:
        """Retrieve all batches assigned to a tutor.
        
        Args:
            tutor_id: Tutor identifier
            institute_id: Institute identifier
            
        Returns:
            List of batch documents
        """
        cursor = database.batches.find(
            {"tutor_id": tutor_id, "institute_id": institute_id},
            {"_id": 0}
        )
        return await cursor.to_list(length=None)
    
    async def update_batch(self, batch_id: str, update_data: BatchUpdateSchema) -> bool:
        """Update batch information.
        
        Args:
            batch_id: Batch identifier
            update_data: Data to update
            
        Returns:
            True if update successful
        """
        update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
        
        if not update_dict:
            return False
        
        result = await database.batches.update_one(
            {"id": batch_id},
            {"$set": update_dict}
        )
        
        return result.modified_count > 0
    
    async def delete_batch(self, batch_id: str) -> bool:
        """Delete a batch.
        
        Args:
            batch_id: Batch identifier
            
        Returns:
            True if deletion successful
        """
        result = await database.batches.delete_one({"id": batch_id})
        return result.deleted_count > 0

# Export service instance
batch_management_service = BatchManagementService()
