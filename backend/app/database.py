"""
Database module for MongoDB connection management.
Uses Motor (async MongoDB driver) for async operations.
"""

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings


class MongoDB:
    """MongoDB connection manager."""
    client: AsyncIOMotorClient = None


# Global database instance
db = MongoDB()


async def connect_to_mongo():
    """
    Connect to MongoDB on application startup.
    Tests the connection to ensure it's working.
    """
    db.client = AsyncIOMotorClient(settings.mongodb_url)

    # Test connection
    try:
        await db.client.server_info()
        print(f"✓ Connected to MongoDB: {settings.mongodb_db_name}")
    except Exception as e:
        print(f"✗ Failed to connect to MongoDB: {e}")
        raise


async def close_mongo_connection():
    """Close MongoDB connection on application shutdown."""
    if db.client:
        db.client.close()
        print("MongoDB connection closed")


def get_database():
    """
    Get database instance.

    Returns:
        AsyncIOMotorDatabase: The MongoDB database instance
    """
    return db.client[settings.mongodb_db_name]


def get_drivers_collection():
    """
    Get drivers collection from the database.

    Returns:
        AsyncIOMotorCollection: The drivers collection
    """
    database = get_database()
    return database.drivers


async def create_indexes():
    """
    Create database indexes for the drivers collection.
    Indexes improve query performance and enforce constraints.
    """
    collection = get_drivers_collection()

    # Unique email index (prevents duplicate registrations)
    await collection.create_index("email", unique=True)

    # Status index for filtering by approval status
    await collection.create_index("status")

    # Created date index for sorting by registration date
    await collection.create_index("created_at")

    # License number index for lookups
    await collection.create_index("license_number")

    print("✓ Database indexes created")
