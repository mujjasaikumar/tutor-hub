# TutorHub Backend Architecture

## Refactored Structure

The backend has been refactored into a clean, maintainable architecture with proper separation of concerns:

```
/app/backend/
├── config.py                 # Configuration and environment settings
├── database.py               # Database connection management
├── server.py                 # Main FastAPI application (legacy monolithic)
│
├── models/                   # Pydantic schemas and data models
│   ├── __init__.py          # Exports all models
│   ├── user.py              # User, auth, and token models
│   ├── batch.py             # Batch-related models
│   ├── student.py           # Student-related models
│   ├── payment.py           # Payment-related models
│   ├── class_schedule.py    # Class scheduling models
│   ├── study_material.py    # Study materials models
│   ├── homework.py          # Homework and submissions models
│   ├── enquiry.py           # Enquiry models
│   └── invite.py            # Invite models
│
├── services/                # Business logic layer
│   ├── __init__.py          # Exports all services
│   ├── auth_service.py      # Authentication, JWT, password hashing
│   ├── user_service.py      # User CRUD operations
│   ├── batch_service.py     # Batch management
│   ├── student_service.py   # Student management
│   ├── payment_service.py   # Payment operations
│   └── csv_service.py       # CSV import/export
│
└── routes/                  # API endpoint definitions
    ├── auth_routes.py       # Authentication endpoints
    └── dependencies.py      # Shared dependencies (auth, role checks)
```

## Architecture Principles

### 1. Models (Data Layer)
- **Location**: `/backend/models/`
- **Purpose**: Define Pydantic schemas for request/response validation
- **Naming Convention**: 
  - `*Schema` for all Pydantic models
  - `*CreateSchema` for POST request bodies
  - `*ResponseSchema` for API responses
  - `*UpdateSchema` for PUT/PATCH requests
- **Example**:
  ```python
  from models import UserCreateSchema, UserResponseSchema
  ```

### 2. Services (Business Logic Layer)
- **Location**: `/backend/services/`
- **Purpose**: Encapsulate business logic and database operations
- **Naming Convention**:
  - `*Service` class for each domain
  - `*_service` instance exported for use
  - Method names: `create_*`, `get_*`, `update_*`, `delete_*`
- **Example**:
  ```python
  from services import user_management_service
  
  user = await user_management_service.create_user(user_data, institute_id)
  ```

### 3. Routes (API Layer)
- **Location**: `/backend/routes/`
- **Purpose**: Define API endpoints and handle HTTP requests/responses
- **Naming Convention**:
  - `*_routes.py` for route files
  - `*_router` for APIRouter instances
  - Descriptive function names: `create_new_batch`, `get_user_by_id`
- **Example**:
  ```python
  from routes.auth_routes import auth_router
  app.include_router(auth_router)
  ```

### 4. Configuration
- **Location**: `/backend/config.py`
- **Purpose**: Centralize all configuration and environment variables
- **Classes**:
  - `DatabaseConfig`: MongoDB settings
  - `SecurityConfig`: JWT and authentication settings
  - `ApplicationConfig`: General app settings

### 5. Database
- **Location**: `/backend/database.py`
- **Purpose**: Manage database connection lifecycle
- **Usage**:
  ```python
  from database import database
  
  await database.users.find_one({"id": user_id})
  ```

## Naming Conventions

### Clear, Self-Documenting Names

#### Services
```python
# ✅ GOOD: Describes what the service does
user_authentication_service.authenticate_user(email, password)
password_hashing_service.hash_password(plain_password)
csv_processing_service.parse_student_csv(file_content)

# ❌ BAD: Ambiguous
auth.check(email, password)
hasher.hash(pwd)
csv.parse(file)
```

#### Functions
```python
# ✅ GOOD: Action-oriented, clear purpose
async def create_user_with_credentials(user_data, institute_id)
async def update_student_payment_status(student_id, paid_amount)
async def generate_sample_student_csv()

# ❌ BAD: Vague
async def make_user(data, id)
async def update(id, amount)
async def generate()
```

#### Models
```python
# ✅ GOOD: Descriptive schema names
UserCreateSchema  # For creating users
UserResponseSchema  # For API responses
PasswordChangeSchema  # For password changes

# ❌ BAD: Ambiguous
User  # What kind of user model?
UserData  # Input or output?
Password  # What about password?
```

## Usage Examples

### Creating a New Feature

#### 1. Define Model
```python
# models/new_feature.py
from pydantic import BaseModel
from typing import Optional

class NewFeatureCreateSchema(BaseModel):
    """Schema for creating a new feature."""
    name: str
    description: Optional[str] = None

class NewFeatureResponseSchema(BaseModel):
    """Schema for feature API response."""
    id: str
    name: str
    description: Optional[str]
    created_at: datetime
```

#### 2. Create Service
```python
# services/new_feature_service.py
from database import database
from models import NewFeatureCreateSchema, NewFeatureResponseSchema

class NewFeatureManagementService:
    """Service for managing new feature operations."""
    
    async def create_new_feature(
        self,
        feature_data: NewFeatureCreateSchema
    ) -> NewFeatureResponseSchema:
        """Create a new feature record."""
        # Business logic here
        pass

new_feature_service = NewFeatureManagementService()
```

#### 3. Define Routes
```python
# routes/new_feature_routes.py
from fastapi import APIRouter, Depends
from models import NewFeatureCreateSchema, NewFeatureResponseSchema
from services import new_feature_service
from routes.dependencies import get_current_authenticated_user

feature_router = APIRouter(prefix="/features", tags=["Features"])

@feature_router.post("/", response_model=NewFeatureResponseSchema)
async def create_feature_endpoint(
    feature_data: NewFeatureCreateSchema,
    current_user: dict = Depends(get_current_authenticated_user)
):
    """Create a new feature."""
    return await new_feature_service.create_new_feature(feature_data)
```

#### 4. Register Routes
```python
# server.py
from routes.new_feature_routes import feature_router

app.include_router(feature_router)
```

## Benefits of This Architecture

1. **Separation of Concerns**: Each layer has a single, well-defined responsibility
2. **Testability**: Services can be tested independently of routes
3. **Reusability**: Business logic in services can be reused across multiple endpoints
4. **Maintainability**: Clear structure makes it easy to find and modify code
5. **Scalability**: Easy to add new features without affecting existing code
6. **Type Safety**: Pydantic models provide automatic validation and serialization
7. **Documentation**: Self-documenting code with descriptive names and docstrings

## Migration Strategy

The current `server.py` contains all legacy code in a monolithic structure. New features should:

1. Be built using the new refactored structure
2. Import and use services from `/backend/services/`
3. Use models from `/backend/models/`
4. Follow the naming conventions defined above

Existing features can be gradually migrated to the new structure over time.

## Code Quality Standards

### 1. Docstrings
Every function and class should have a docstring:
```python
async def create_user_account(user_data: UserCreateSchema) -> UserResponseSchema:
    """Create a new user account with hashed password.
    
    Args:
        user_data: User registration data including email and password
        
    Returns:
        Created user response with generated ID
        
    Raises:
        HTTPException: If email already exists
    """
```

### 2. Type Hints
Use type hints for all function parameters and return values:
```python
async def get_students_by_batch(batch_id: str, institute_id: str) -> List[dict]:
    """Retrieve all students in a batch."""
```

### 3. Error Handling
Handle errors gracefully with descriptive messages:
```python
if not user:
    raise HTTPException(
        status_code=404,
        detail=f"User with ID {user_id} not found"
    )
```

### 4. Constants
Use enums and constants instead of magic strings:
```python
class UserRoleEnum:
    ADMIN = "admin"
    TUTOR = "tutor"
    STUDENT = "student"

# Usage
if user.role == UserRoleEnum.ADMIN:
    # Admin logic
```

## Future Enhancements

The refactored structure is ready for:

1. **Unit Testing**: Each service can be tested independently
2. **API Documentation**: Automatic OpenAPI docs with proper schema descriptions
3. **Caching**: Easy to add caching layers in services
4. **Logging**: Centralized logging in services
5. **Background Tasks**: Queue-based processing for notifications
6. **Rate Limiting**: Per-endpoint rate limiting
7. **Monitoring**: Service-level metrics and monitoring
