# TutorHub - Refactored Architecture

## Project Overview

TutorHub is a full-stack SaaS CRM + LMS-lite platform for tutoring institutes with role-based access (Admin, Tutor, Student).

## Technology Stack

- **Backend**: FastAPI (Python)
- **Frontend**: React.js
- **Database**: MongoDB
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Authentication**: JWT

## Refactored Architecture

### Backend Structure

The backend has been refactored with clean separation of concerns:

- **`config.py`**: Centralized configuration
- **`database.py`**: MongoDB connection management
- **`models/`**: Pydantic schemas for validation
- **`services/`**: Business logic layer
- **`routes/`**: API endpoint definitions

📖 **See `/app/backend/ARCHITECTURE.md` for detailed backend documentation**

### Frontend Structure

The frontend now includes reusable components and custom hooks:

- **`components/reusable/`**: Reusable UI components (Card, Button, DataTable, etc.)
- **`hooks/`**: Custom React hooks (useApi, useForm)
- **`styles/utilities.css`**: Tailwind utility classes

📖 **See `/app/frontend/ARCHITECTURE.md` for detailed frontend documentation**

## Quick Start

### Backend
```bash
cd /app/backend
source venv/bin/activate
uvicorn server:app --reload
```

### Frontend
```bash
cd /app/frontend
yarn start
```

## Key Improvements

### Backend
✅ Separation of Concerns (Models → Services → Routes)
✅ Reusable business logic in services
✅ Type safety with Pydantic
✅ Self-documenting code with docstrings

### Frontend
✅ Reusable component library
✅ Consistent Tailwind styling
✅ Custom hooks for common patterns
✅ Better code organization

## Documentation

- **Backend**: `/app/backend/ARCHITECTURE.md`
- **Frontend**: `/app/frontend/ARCHITECTURE.md`

## Development Guidelines

See architecture docs for:
- Naming conventions
- Creating new features
- Using reusable components
- Best practices
