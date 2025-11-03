"""Database connection and initialization."""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from .config import DatabaseConfig

class DatabaseConnection:
    """Manages MongoDB connection lifecycle."""
    
    def __init__(self):
        self.client: AsyncIOMotorClient = None
        self.database: AsyncIOMotorDatabase = None
    
    def connect_to_database(self) -> None:
        """Establish connection to MongoDB."""
        self.client = AsyncIOMotorClient(DatabaseConfig.MONGO_URL)
        self.database = self.client[DatabaseConfig.DB_NAME]
    
    def close_database_connection(self) -> None:
        """Close MongoDB connection."""
        if self.client:
            self.client.close()
    
    def get_database(self) -> AsyncIOMotorDatabase:
        """Get database instance."""
        if not self.database:
            self.connect_to_database()
        return self.database

# Global database connection instance
db_connection = DatabaseConnection()
db_connection.connect_to_database()

# Export database instance for direct use
database = db_connection.get_database()
