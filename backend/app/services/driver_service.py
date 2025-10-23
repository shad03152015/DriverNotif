"""
Driver service for registration business logic.
Handles driver registration creation and data management.
"""

from datetime import datetime
from typing import Optional
from fastapi import UploadFile, HTTPException
from app.database import get_drivers_collection
from app.services.file_service import FileService
from app.schemas.driver_schema import DriverRegistrationRequest


class DriverService:
    """Service for driver registration operations."""

    @staticmethod
    async def create_driver_registration(
        driver_data: DriverRegistrationRequest,
        profile_photo: Optional[UploadFile] = None
    ) -> dict:
        """
        Create a new driver registration.

        Args:
            driver_data: Validated driver registration data
            profile_photo: Optional profile photo file

        Returns:
            dict: Created driver information

        Raises:
            HTTPException: If email already exists or database error occurs
        """
        collection = get_drivers_collection()

        # Check if email already exists
        existing = await collection.find_one({"email": driver_data.email})
        if existing:
            raise HTTPException(
                status_code=409,
                detail="A registration with this email address has already been submitted"
            )

        # Prepare document for MongoDB
        document = {
            "email": driver_data.email,
            "auth_provider": driver_data.auth_provider,
            "oauth_id": driver_data.oauth_id,
            "first_name": driver_data.first_name,
            "middle_name": driver_data.middle_name,
            "surname": driver_data.surname,
            "birthdate": datetime.combine(driver_data.birthdate, datetime.min.time()),
            "birthplace": driver_data.birthplace,
            "license_number": driver_data.license_number,
            "license_expiry_date": datetime.combine(driver_data.license_expiry_date, datetime.min.time()),
            "address_line_1": driver_data.address_line_1,
            "address_line_2": driver_data.address_line_2,
            "primary_phone": driver_data.primary_phone,
            "secondary_phone": driver_data.secondary_phone,
            "profile_photo_url": None,
            "profile_photo_filename": None,
            "status": "pending",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "reviewed_at": None,
            "reviewed_by": None,
            "rejection_reason": None
        }

        # Insert document to get driver_id
        try:
            result = await collection.insert_one(document)
            driver_id = str(result.inserted_id)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to create driver registration: {str(e)}"
            )

        # Handle photo upload if provided
        if profile_photo and profile_photo.filename:
            try:
                file_info = await FileService.save_profile_photo(
                    profile_photo,
                    driver_id
                )

                # Update document with photo info
                await collection.update_one(
                    {"_id": result.inserted_id},
                    {
                        "$set": {
                            "profile_photo_url": file_info["path"],
                            "profile_photo_filename": file_info["original_filename"],
                            "updated_at": datetime.utcnow()
                        }
                    }
                )
            except HTTPException:
                # Re-raise HTTP exceptions (validation errors)
                raise
            except Exception as e:
                # Photo upload failed, but registration was saved
                # Log error but don't fail the registration (photo is optional)
                print(f"Warning: Photo upload failed for driver {driver_id}: {str(e)}")

        # Retrieve and return created driver info
        created_driver = await collection.find_one({"_id": result.inserted_id})

        return {
            "driver_id": driver_id,
            "email": created_driver["email"],
            "status": created_driver["status"],
            "created_at": created_driver["created_at"]
        }

    @staticmethod
    async def get_driver_by_email(email: str) -> Optional[dict]:
        """
        Get driver by email address.

        Args:
            email: Driver's email address

        Returns:
            dict or None: Driver document if found
        """
        collection = get_drivers_collection()
        return await collection.find_one({"email": email})

    @staticmethod
    async def get_driver_by_id(driver_id: str) -> Optional[dict]:
        """
        Get driver by ID.

        Args:
            driver_id: Driver's MongoDB ObjectId as string

        Returns:
            dict or None: Driver document if found
        """
        from bson import ObjectId

        collection = get_drivers_collection()
        try:
            return await collection.find_one({"_id": ObjectId(driver_id)})
        except Exception:
            return None
