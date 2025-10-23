"""
Driver model for MongoDB documents.
Defines the structure of driver documents stored in the database.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from bson import ObjectId


class PyObjectId(ObjectId):
    """Custom type for handling MongoDB ObjectId in Pydantic models."""

    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")


class DriverModel(BaseModel):
    """
    Driver document model for MongoDB.
    Represents a driver registration with all required and optional fields.
    """

    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    # Authentication
    email: EmailStr
    username: Optional[str] = None  # Username for login (defaults to email if not set)
    password_hash: Optional[str] = None  # Hashed password for email auth
    auth_provider: str  # "email", "google", or "apple"
    oauth_id: Optional[str] = None

    # Personal Information
    first_name: str
    middle_name: Optional[str] = None
    surname: str
    birthdate: datetime
    birthplace: str

    # License Information
    license_number: str
    license_expiry_date: datetime

    # Contact Information
    address_line_1: str
    address_line_2: Optional[str] = None
    primary_phone: str
    secondary_phone: Optional[str] = None

    # Profile Photo
    profile_photo_url: Optional[str] = None
    profile_photo_filename: Optional[str] = None

    # Status & Metadata
    status: str = "pending"  # "pending", "approved", or "rejected"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[PyObjectId] = None
    rejection_reason: Optional[str] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str, datetime: lambda v: v.isoformat()}
        json_schema_extra = {
            "example": {
                "email": "john.doe@example.com",
                "auth_provider": "email",
                "first_name": "John",
                "surname": "Doe",
                "birthdate": "1990-01-15T00:00:00Z",
                "birthplace": "New York, USA",
                "license_number": "D1234567",
                "license_expiry_date": "2026-12-31T00:00:00Z",
                "address_line_1": "123 Main Street",
                "primary_phone": "(123) 456-7890",
                "status": "pending"
            }
        }
