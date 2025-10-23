"""
File service for handling profile photo uploads.
Validates, saves, and manages uploaded files.
"""

import os
from datetime import datetime
from fastapi import UploadFile, HTTPException
from app.config import settings


class FileService:
    """Service for handling file uploads."""

    @staticmethod
    def validate_file(file: UploadFile) -> None:
        """
        Validate uploaded file for size and type.

        Args:
            file: The uploaded file to validate

        Raises:
            HTTPException: If file is invalid (wrong type or too large)
        """
        if not file or not file.filename:
            raise HTTPException(
                status_code=400,
                detail="No file provided"
            )

        # Check file extension
        ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
        if ext not in settings.allowed_extensions_list:
            raise HTTPException(
                status_code=400,
                detail=f"Only {', '.join(settings.allowed_extensions_list).upper()} files are allowed"
            )

        # Check file size
        file.file.seek(0, 2)  # Seek to end to get size
        file_size = file.file.tell()
        file.file.seek(0)  # Reset to beginning

        if file_size > settings.max_file_size:
            size_mb = settings.max_file_size / 1024 / 1024
            raise HTTPException(
                status_code=400,
                detail=f"File size must be under {size_mb}MB"
            )

    @staticmethod
    async def save_profile_photo(file: UploadFile, driver_id: str) -> dict:
        """
        Save profile photo to disk.

        Args:
            file: The uploaded file
            driver_id: The driver's ID for unique filename

        Returns:
            dict: File information including path and filename

        Raises:
            HTTPException: If file validation fails
        """
        # Validate file first
        FileService.validate_file(file)

        # Generate unique filename
        ext = file.filename.split(".")[-1].lower()
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        new_filename = f"{driver_id}_{timestamp}.{ext}"

        # Ensure upload directory exists
        os.makedirs(settings.upload_dir, exist_ok=True)

        # Save file
        file_path = os.path.join(settings.upload_dir, new_filename)
        try:
            content = await file.read()
            with open(file_path, "wb") as f:
                f.write(content)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to save file: {str(e)}"
            )

        return {
            "filename": new_filename,
            "original_filename": file.filename,
            "path": file_path,
            "size": len(content)
        }

    @staticmethod
    def delete_file(file_path: str) -> None:
        """
        Delete a file from disk.

        Args:
            file_path: Path to the file to delete
        """
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"Warning: Failed to delete file {file_path}: {e}")
