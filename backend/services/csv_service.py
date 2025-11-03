"""CSV import/export services."""
import pandas as pd
import io
from typing import List, Dict
from datetime import datetime

class CSVProcessingService:
    """Service for CSV file import and export operations."""
    
    @staticmethod
    def generate_sample_student_csv() -> bytes:
        """Generate sample CSV for student bulk upload.
        
        Returns:
            CSV file content as bytes
        """
        sample_data = {
            "name": ["John Doe", "Jane Smith"],
            "email": ["john@example.com", "jane@example.com"],
            "phone": ["+1234567890", "+0987654321"],
            "whatsapp": ["+1234567890", "+0987654321"],
            "batch_id": ["batch-id-here", "batch-id-here"],
            "total_fees": [5000, 6000]
        }
        
        df = pd.DataFrame(sample_data)
        buffer = io.BytesIO()
        df.to_csv(buffer, index=False)
        buffer.seek(0)
        return buffer.getvalue()
    
    @staticmethod
    def generate_sample_class_schedule_csv() -> bytes:
        """Generate sample CSV for class schedule bulk upload.
        
        Returns:
            CSV file content as bytes
        """
        sample_data = {
            "class_date": ["2024-01-15", "2024-01-17"],
            "class_time": ["10:00 AM", "02:00 PM"],
            "topic": ["Introduction to Python", "Advanced Functions"]
        }
        
        df = pd.DataFrame(sample_data)
        buffer = io.BytesIO()
        df.to_csv(buffer, index=False)
        buffer.seek(0)
        return buffer.getvalue()
    
    @staticmethod
    def parse_student_csv(file_content: bytes) -> List[Dict]:
        """Parse student CSV file and extract data.
        
        Args:
            file_content: CSV file content as bytes
            
        Returns:
            List of student dictionaries
        """
        df = pd.read_csv(io.BytesIO(file_content))
        return df.to_dict('records')
    
    @staticmethod
    def parse_class_schedule_csv(file_content: bytes) -> List[Dict]:
        """Parse class schedule CSV file and extract data.
        
        Args:
            file_content: CSV file content as bytes
            
        Returns:
            List of class schedule dictionaries
        """
        df = pd.read_csv(io.BytesIO(file_content))
        
        # Convert date strings to datetime
        df['class_date'] = pd.to_datetime(df['class_date'])
        
        return df.to_dict('records')
    
    @staticmethod
    def export_students_to_csv(students: List[Dict]) -> bytes:
        """Export student data to CSV.
        
        Args:
            students: List of student dictionaries
            
        Returns:
            CSV file content as bytes
        """
        df = pd.DataFrame(students)
        buffer = io.BytesIO()
        df.to_csv(buffer, index=False)
        buffer.seek(0)
        return buffer.getvalue()

# Export service instance
csv_processing_service = CSVProcessingService()
