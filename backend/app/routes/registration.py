"""
Registration routes for driver registration API endpoints.
Handles driver registration requests.
"""

from typing import Optional
from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException, status
from datetime import date
from app.middleware.api_key_auth import verify_api_key
from app.schemas.driver_schema import (
    DriverRegistrationRequest,
    DriverRegistrationResponse,
    RegistrationData,
    ErrorResponse
)
from app.services.driver_service import DriverService


router = APIRouter()


@router.post(
    "/driver",
    response_model=DriverRegistrationResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"model": ErrorResponse, "description": "Validation error"},
        409: {"model": ErrorResponse, "description": "Email already exists"},
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    },
    dependencies=[Depends(verify_api_key)]
)
async def register_driver(
    # Required fields
    email: str = Form(...),
    auth_provider: str = Form(...),
    first_name: str = Form(...),
    surname: str = Form(...),
    birthdate: str = Form(...),
    birthplace: str = Form(...),
    license_number: str = Form(...),
    license_expiry_date: str = Form(...),
    address_line_1: str = Form(...),
    primary_phone: str = Form(...),
    # Optional fields
    oauth_id: Optional[str] = Form(None),
    middle_name: Optional[str] = Form(None),
    address_line_2: Optional[str] = Form(None),
    secondary_phone: Optional[str] = Form(None),
    profile_photo: Optional[UploadFile] = File(None),
):
    """
    Register a new driver.

    Creates a new driver registration with status 'pending'.
    Requires API key authentication via X-API-Key header.

    Args:
        All driver registration fields as form data
        profile_photo: Optional profile photo file (JPG/PNG, max 5MB)

    Returns:
        DriverRegistrationResponse: Success response with driver info

    Raises:
        HTTPException: Various error codes based on validation or conflicts
    """
    try:
        # Parse dates
        try:
            birthdate_obj = date.fromisoformat(birthdate)
            license_expiry_obj = date.fromisoformat(license_expiry_date)
        except ValueError as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid date format. Use YYYY-MM-DD: {str(e)}"
            )

        # Create validated request object
        driver_request = DriverRegistrationRequest(
            email=email,
            auth_provider=auth_provider,
            first_name=first_name,
            middle_name=middle_name,
            surname=surname,
            birthdate=birthdate_obj,
            birthplace=birthplace,
            license_number=license_number,
            license_expiry_date=license_expiry_obj,
            address_line_1=address_line_1,
            address_line_2=address_line_2,
            primary_phone=primary_phone,
            secondary_phone=secondary_phone,
            oauth_id=oauth_id
        )

        # Create driver registration
        result = await DriverService.create_driver_registration(
            driver_data=driver_request,
            profile_photo=profile_photo
        )

        # Return success response
        return DriverRegistrationResponse(
            success=True,
            message="Registration submitted successfully",
            data=RegistrationData(**result)
        )

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except ValueError as e:
        # Validation errors from Pydantic
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        # Unexpected errors
        print(f"Error in register_driver: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing your registration. Please try again."
        )


@router.get("/health")
async def health_check():
    """Health check endpoint for registration service."""
    return {"status": "healthy", "service": "Registration API"}
