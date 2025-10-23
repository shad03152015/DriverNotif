"""
Driver schemas for API request and response validation.
Defines the structure of data sent to and received from the API.
"""

from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, field_validator


class DriverRegistrationRequest(BaseModel):
    """Schema for driver registration request."""

    # Required fields
    email: EmailStr
    auth_provider: str = Field(..., pattern="^(email|google|apple)$")
    first_name: str = Field(..., min_length=2, max_length=100)
    surname: str = Field(..., min_length=2, max_length=100)
    birthdate: date
    birthplace: str
    license_number: str
    license_expiry_date: date
    address_line_1: str
    primary_phone: str

    # Optional fields
    oauth_id: Optional[str] = None
    middle_name: Optional[str] = Field(None, max_length=100)
    address_line_2: Optional[str] = None
    secondary_phone: Optional[str] = None

    @field_validator("birthdate")
    @classmethod
    def validate_birthdate(cls, v):
        """Validate birthdate is not in the future."""
        if v > date.today():
            raise ValueError("Birthdate cannot be in the future")
        return v

    @field_validator("license_expiry_date")
    @classmethod
    def validate_license_expiry(cls, v):
        """Validate license expiry date is not in the past."""
        if v < date.today():
            raise ValueError("License expiry date cannot be in the past")
        return v

    @field_validator("first_name", "surname", "middle_name")
    @classmethod
    def trim_whitespace(cls, v):
        """Trim whitespace from name fields."""
        return v.strip() if v else v

    @field_validator("oauth_id")
    @classmethod
    def validate_oauth_id(cls, v, info):
        """Validate oauth_id is provided for OAuth providers."""
        auth_provider = info.data.get("auth_provider")
        if auth_provider in ["google", "apple"] and not v:
            raise ValueError(f"oauth_id is required for {auth_provider} authentication")
        if auth_provider == "email" and v:
            raise ValueError("oauth_id should not be provided for email authentication")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "email": "john.doe@example.com",
                "auth_provider": "email",
                "first_name": "John",
                "middle_name": "Robert",
                "surname": "Doe",
                "birthdate": "1990-01-15",
                "birthplace": "New York, USA",
                "license_number": "D1234567",
                "license_expiry_date": "2026-12-31",
                "address_line_1": "123 Main Street",
                "address_line_2": "Apt 4B",
                "primary_phone": "(123) 456-7890",
                "secondary_phone": "(123) 456-7891"
            }
        }


class DriverRegistrationResponse(BaseModel):
    """Schema for successful driver registration response."""

    success: bool = True
    message: str = "Registration submitted successfully"
    data: "RegistrationData"


class RegistrationData(BaseModel):
    """Data included in successful registration response."""

    driver_id: str
    email: str
    status: str
    created_at: datetime


class ErrorDetail(BaseModel):
    """Schema for validation error details."""

    field: str
    message: str


class ValidationErrorResponse(BaseModel):
    """Schema for validation error response."""

    success: bool = False
    error: str = "Validation error"
    details: List[ErrorDetail]


class ErrorResponse(BaseModel):
    """Schema for general error response."""

    success: bool = False
    error: str
    message: str


# Update forward references
DriverRegistrationResponse.model_rebuild()
