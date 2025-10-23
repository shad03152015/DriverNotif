"""
Authentication schemas for login and token management.
"""

from typing import Optional
from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    """Schema for login request."""

    email_or_username: str
    password: str

    class Config:
        json_schema_extra = {
            "example": {
                "email_or_username": "john.doe@example.com",
                "password": "securePassword123"
            }
        }


class LoginResponse(BaseModel):
    """Schema for successful login response."""

    success: bool = True
    message: str = "Login successful"
    data: "LoginData"


class LoginData(BaseModel):
    """Data included in successful login response."""

    driver_id: str
    email: str
    username: Optional[str]
    first_name: str
    surname: str
    status: str
    access_token: str
    token_type: str = "bearer"


class PasswordSetupRequest(BaseModel):
    """Schema for setting up password after registration."""

    driver_id: str
    password: str
    confirm_password: str

    class Config:
        json_schema_extra = {
            "example": {
                "driver_id": "507f1f77bcf86cd799439011",
                "password": "securePassword123",
                "confirm_password": "securePassword123"
            }
        }


class TokenData(BaseModel):
    """Schema for token payload data."""

    driver_id: str
    email: str
    status: str


class ErrorResponse(BaseModel):
    """Schema for error response."""

    success: bool = False
    error: str
    message: str


# Update forward references
LoginResponse.model_rebuild()
