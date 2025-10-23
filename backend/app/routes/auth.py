"""
Authentication routes for driver login and password management.
"""

from fastapi import APIRouter, HTTPException, status
from app.schemas.auth_schema import (
    LoginRequest,
    LoginResponse,
    LoginData,
    PasswordSetupRequest,
    ErrorResponse
)
from app.services.auth_service import AuthService


router = APIRouter()


@router.post(
    "/login",
    response_model=LoginResponse,
    status_code=status.HTTP_200_OK,
    responses={
        401: {"model": ErrorResponse, "description": "Invalid credentials"},
        403: {"model": ErrorResponse, "description": "Account not approved"}
    }
)
async def login(credentials: LoginRequest):
    """
    Authenticate driver with email/username and password.

    Returns JWT access token on successful authentication.
    Only approved drivers can log in.

    Args:
        credentials: Login credentials (email/username and password)

    Returns:
        LoginResponse: Success response with access token

    Raises:
        HTTPException: Various authentication errors
    """
    try:
        # Authenticate driver
        driver = await AuthService.authenticate_driver(
            credentials.email_or_username,
            credentials.password
        )

        # Create access token
        access_token = await AuthService.create_access_token_for_driver(driver)

        # Return success response
        return LoginResponse(
            success=True,
            message="Login successful",
            data=LoginData(
                driver_id=str(driver["_id"]),
                email=driver["email"],
                username=driver.get("username"),
                first_name=driver["first_name"],
                surname=driver["surname"],
                status=driver.get("status", "pending"),
                access_token=access_token,
                token_type="bearer"
            )
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred during login. Please try again."
        )


@router.post(
    "/setup-password",
    status_code=status.HTTP_200_OK,
    responses={
        400: {"model": ErrorResponse, "description": "Validation error"},
        403: {"model": ErrorResponse, "description": "Not approved"},
        404: {"model": ErrorResponse, "description": "Driver not found"}
    }
)
async def setup_password(request: PasswordSetupRequest):
    """
    Set up password for approved driver.

    This endpoint is used after registration approval to allow
    drivers to create login credentials.

    Args:
        request: Password setup request with driver_id and passwords

    Returns:
        dict: Success response

    Raises:
        HTTPException: Various validation and authorization errors
    """
    # Validate passwords match
    if request.password != request.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="Passwords do not match"
        )

    # Validate password strength (minimum 8 characters)
    if len(request.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters long"
        )

    try:
        # Set password
        await AuthService.set_driver_password(request.driver_id, request.password)

        return {
            "success": True,
            "message": "Password set successfully. You can now log in."
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Password setup error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while setting up password. Please try again."
        )


@router.get("/health")
async def health_check():
    """Health check endpoint for authentication service."""
    return {"status": "healthy", "service": "Authentication API"}
