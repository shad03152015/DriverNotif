"""
Authentication service for driver login and password management.
"""

from datetime import timedelta
from typing import Optional
from fastapi import HTTPException
from app.database import get_drivers_collection
from app.utils.security import verify_password, hash_password, create_access_token


class AuthService:
    """Service for authentication operations."""

    @staticmethod
    async def authenticate_driver(email_or_username: str, password: str) -> Optional[dict]:
        """
        Authenticate a driver with email/username and password.

        Args:
            email_or_username: Driver's email or username
            password: Plain text password

        Returns:
            dict: Driver document if authenticated, None otherwise

        Raises:
            HTTPException: If authentication fails
        """
        collection = get_drivers_collection()

        # Try to find driver by email or username
        driver = await collection.find_one({
            "$or": [
                {"email": email_or_username},
                {"username": email_or_username}
            ]
        })

        if not driver:
            raise HTTPException(
                status_code=401,
                detail="Invalid email/username or password"
            )

        # Check if driver has a password set (email auth)
        if not driver.get("password_hash"):
            raise HTTPException(
                status_code=401,
                detail="This account uses OAuth authentication. Please log in with Google or Apple."
            )

        # Verify password
        if not verify_password(password, driver["password_hash"]):
            raise HTTPException(
                status_code=401,
                detail="Invalid email/username or password"
            )

        # Check if driver is approved
        if driver.get("status") != "approved":
            if driver.get("status") == "pending":
                raise HTTPException(
                    status_code=403,
                    detail="Your registration is pending approval. Please wait for admin review."
                )
            elif driver.get("status") == "rejected":
                raise HTTPException(
                    status_code=403,
                    detail="Your registration has been rejected. Please contact support."
                )

        return driver

    @staticmethod
    async def create_access_token_for_driver(driver: dict) -> str:
        """
        Create JWT access token for authenticated driver.

        Args:
            driver: Driver document from database

        Returns:
            str: JWT access token
        """
        token_data = {
            "driver_id": str(driver["_id"]),
            "email": driver["email"],
            "status": driver.get("status", "pending")
        }

        access_token = create_access_token(
            data=token_data,
            expires_delta=timedelta(days=7)  # Token valid for 7 days
        )

        return access_token

    @staticmethod
    async def set_driver_password(driver_id: str, password: str) -> bool:
        """
        Set or update password for a driver (for approved drivers setting up login).

        Args:
            driver_id: Driver's MongoDB ObjectId as string
            password: Plain text password to hash and store

        Returns:
            bool: True if successful

        Raises:
            HTTPException: If driver not found or not approved
        """
        from bson import ObjectId

        collection = get_drivers_collection()

        # Find driver
        try:
            driver = await collection.find_one({"_id": ObjectId(driver_id)})
        except Exception:
            raise HTTPException(status_code=404, detail="Driver not found")

        if not driver:
            raise HTTPException(status_code=404, detail="Driver not found")

        # Only approved drivers can set password
        if driver.get("status") != "approved":
            raise HTTPException(
                status_code=403,
                detail="Only approved drivers can set up login credentials"
            )

        # Hash password and update
        password_hash = hash_password(password)

        await collection.update_one(
            {"_id": ObjectId(driver_id)},
            {
                "$set": {
                    "password_hash": password_hash,
                    "username": driver.get("username") or driver["email"]  # Default username to email
                }
            }
        )

        return True

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
