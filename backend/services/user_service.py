"""User management services."""
from typing import List, Optional
from datetime import datetime

from database import database
from models import UserCreateSchema, UserResponseSchema, TutorUpdateSchema
from .auth_service import password_hashing_service

class UserManagementService:
    """Service for managing user CRUD operations."""
    
    async def create_user(self, user_data: UserCreateSchema, institute_id: str) -> UserResponseSchema:
        """Create a new user account.
        
        Args:
            user_data: User creation data
            institute_id: Institute identifier
            
        Returns:
            Created user response schema
        """
        user_dict = user_data.model_dump()
        plain_password = user_dict.pop("password")
        hashed_password = password_hashing_service.hash_password(plain_password)
        
        user_response = UserResponseSchema(**user_dict)
        user_response.institute_id = institute_id
        
        document = user_response.model_dump()
        document["password"] = hashed_password
        document["must_change_password"] = user_data.must_change_password
        document["created_at"] = document["created_at"].isoformat()
        
        await database.users.insert_one(document)
        
        return user_response
    
    async def check_email_exists(self, email: str) -> bool:
        """Check if an email is already registered.
        
        Args:
            email: Email address to check
            
        Returns:
            True if email exists, False otherwise
        """
        existing_user = await database.users.find_one({"email": email})
        return existing_user is not None
    
    async def get_user_by_id(self, user_id: str) -> Optional[dict]:
        """Retrieve user by ID.
        
        Args:
            user_id: Unique user identifier
            
        Returns:
            User document if found
        """
        return await database.users.find_one({"id": user_id}, {"_id": 0})
    
    async def get_users_by_role(self, role: str, institute_id: str) -> List[dict]:
        """Retrieve all users with a specific role.
        
        Args:
            role: User role (admin, tutor, student)
            institute_id: Institute identifier
            
        Returns:
            List of user documents
        """
        cursor = database.users.find(
            {"role": role, "institute_id": institute_id},
            {"_id": 0, "password": 0}
        )
        return await cursor.to_list(length=None)
    
    async def update_tutor(self, tutor_id: str, update_data: TutorUpdateSchema) -> bool:
        """Update tutor information.
        
        Args:
            tutor_id: Tutor identifier
            update_data: Data to update
            
        Returns:
            True if update successful
        """
        update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
        
        if not update_dict:
            return False
        
        result = await database.users.update_one(
            {"id": tutor_id},
            {"$set": update_dict}
        )
        
        return result.modified_count > 0
    
    async def delete_user(self, user_id: str) -> bool:
        """Delete a user account.
        
        Args:
            user_id: User identifier
            
        Returns:
            True if deletion successful
        """
        result = await database.users.delete_one({"id": user_id})
        return result.deleted_count > 0

# Export service instance
user_management_service = UserManagementService()
