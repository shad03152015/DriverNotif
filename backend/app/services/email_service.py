"""
Email service for sending password reset and notification emails.
"""

import secrets
from datetime import datetime, timedelta
from typing import Optional
from app.database import get_database


class EmailService:
    """Service for sending emails and managing email-related operations."""

    @staticmethod
    async def generate_reset_token(driver_id: str, email: str) -> str:
        """
        Generate and store a password reset token.

        Args:
            driver_id: Driver's MongoDB ObjectId as string
            email: Driver's email address

        Returns:
            str: Reset token
        """
        # Generate secure random token
        token = secrets.token_urlsafe(32)

        # Store token in database with expiration (1 hour)
        db = get_database()
        reset_tokens_collection = db.password_reset_tokens

        await reset_tokens_collection.insert_one({
            "driver_id": driver_id,
            "email": email,
            "token": token,
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(hours=1),
            "used": False
        })

        # Create index for automatic deletion of expired tokens
        await reset_tokens_collection.create_index("expires_at", expireAfterSeconds=3600)

        return token

    @staticmethod
    async def verify_reset_token(token: str) -> Optional[dict]:
        """
        Verify a password reset token.

        Args:
            token: Reset token to verify

        Returns:
            dict or None: Token document if valid, None otherwise
        """
        db = get_database()
        reset_tokens_collection = db.password_reset_tokens

        token_doc = await reset_tokens_collection.find_one({
            "token": token,
            "used": False,
            "expires_at": {"$gt": datetime.utcnow()}
        })

        return token_doc

    @staticmethod
    async def mark_token_as_used(token: str) -> bool:
        """
        Mark a reset token as used.

        Args:
            token: Reset token

        Returns:
            bool: True if successful
        """
        db = get_database()
        reset_tokens_collection = db.password_reset_tokens

        result = await reset_tokens_collection.update_one(
            {"token": token},
            {"$set": {"used": True, "used_at": datetime.utcnow()}}
        )

        return result.modified_count > 0

    @staticmethod
    def send_password_reset_email(email: str, reset_token: str) -> bool:
        """
        Send password reset email to driver.

        NOTE: This is a placeholder implementation.
        In production, integrate with an email service provider like:
        - SendGrid
        - AWS SES
        - Mailgun
        - Postmark

        Args:
            email: Driver's email address
            reset_token: Password reset token

        Returns:
            bool: True if email sent successfully
        """
        # Construct reset link
        # In production, use actual domain
        reset_link = f"https://hotride.app/reset-password?token={reset_token}"

        # Email content
        subject = "Reset Your HotRider Password"
        body = f"""
        Hello,

        You requested to reset your password for your HotRider driver account.

        Click the link below to reset your password:
        {reset_link}

        This link will expire in 1 hour.

        If you didn't request this, please ignore this email.

        Best regards,
        The HotRider Team
        """

        # TODO: Implement actual email sending
        # For now, just log to console (development mode)
        print(f"\n{'='*60}")
        print(f"PASSWORD RESET EMAIL")
        print(f"{'='*60}")
        print(f"To: {email}")
        print(f"Subject: {subject}")
        print(f"Reset Link: {reset_link}")
        print(f"Token: {reset_token}")
        print(f"{'='*60}\n")

        # In production, replace with actual email sending:
        # try:
        #     # Example with SendGrid
        #     message = Mail(
        #         from_email='noreply@hotride.app',
        #         to_emails=email,
        #         subject=subject,
        #         html_content=body
        #     )
        #     sg = SendGridAPIClient(settings.sendgrid_api_key)
        #     response = sg.send(message)
        #     return response.status_code == 202
        # except Exception as e:
        #     print(f"Email sending failed: {str(e)}")
        #     return False

        # For development, always return True
        return True

    @staticmethod
    def send_password_changed_notification(email: str, driver_name: str) -> bool:
        """
        Send notification email when password is successfully changed.

        Args:
            email: Driver's email address
            driver_name: Driver's full name

        Returns:
            bool: True if email sent successfully
        """
        subject = "Your HotRider Password Was Changed"
        body = f"""
        Hello {driver_name},

        Your password for your HotRider driver account was successfully changed.

        If you didn't make this change, please contact support immediately at support@hotride.app

        Best regards,
        The HotRider Team
        """

        # TODO: Implement actual email sending
        print(f"\n{'='*60}")
        print(f"PASSWORD CHANGED NOTIFICATION")
        print(f"{'='*60}")
        print(f"To: {email}")
        print(f"Subject: {subject}")
        print(f"{'='*60}\n")

        return True
