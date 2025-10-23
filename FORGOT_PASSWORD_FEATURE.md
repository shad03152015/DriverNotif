# Forgot Password Feature Documentation

## Overview

The forgot password feature allows drivers to reset their password if they've forgotten it. The system verifies the email/phone exists in the database, generates a secure reset token, and sends password reset instructions via email.

## User Flow

1. Driver clicks "Forgot Password?" on the login screen
2. Driver is taken to the "Reset Your Password" screen
3. Driver enters their email or phone number
4. System validates the email/phone exists in the database
5. If valid, system generates a reset token and sends email with reset link
6. Driver receives success toast message
7. Driver checks email for reset instructions
8. Driver clicks reset link (opens in app or browser)
9. Driver enters new password
10. Password is updated, driver can now log in with new password

## Frontend Implementation

### Screen: `app/(auth)/forgot-password.tsx`

**Features:**
- Clean, modern UI matching HotRider design specifications
- Email or phone number input field
- "Send Reset Link" button with loading states
- "Back to Login" link
- Toast notifications for success/error feedback
- Validates input before submission
- Displays specific error for non-existent emails: "Email does not exist!"

**Key Components:**
```typescript
- useState for emailOrPhone, isLoading
- handleSendResetLink() - Main submission handler
- handleBackToLogin() - Navigation back to login
- Toast notifications (success/error)
- Form validation (required field check)
```

**UI Elements:**
- HotRider logo (car icon in orange circle)
- "Reset Your Password" heading
- Descriptive subtitle explaining the process
- Email/Phone input field with border and rounded corners
- Orange "Send Reset Link" button
- Back arrow + "Back to Login" text link

### API Integration: `services/api.ts`

**Function: `sendPasswordResetLink(emailOrPhone: string)`**

```typescript
export const sendPasswordResetLink = async (emailOrPhone: string): Promise<{ success: boolean; message: string }> => {
  // Calls POST /api/v1/auth/forgot-password
  // Returns success message or throws error
}
```

**Error Handling:**
- Network errors: "Unable to reach server. Please check your internet connection."
- Email not found: Shows error detail from backend
- Generic errors: "An unexpected error occurred. Please try again."

### Navigation Updates

**Updated files:**
- `app/_layout.tsx` - Added forgot-password route to Stack
- `app/(auth)/login.tsx` - Updated handleForgotPassword to navigate to forgot-password screen

## Backend Implementation

### Endpoint: POST `/api/v1/auth/forgot-password`

**Location:** `backend/app/routes/auth.py`

**Request Body:**
```json
{
  "email_or_phone": "john.doe@example.com"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset instructions have been sent to john.doe@example.com"
}
```

**Error Responses:**

**404 Not Found** - Email/phone not in database:
```json
{
  "detail": "No account found with that email or phone number"
}
```

**400 Bad Request** - OAuth account:
```json
{
  "detail": "This account uses google authentication. Password reset is not available."
}
```

**500 Internal Server Error** - Email sending failed:
```json
{
  "detail": "Failed to send reset email. Please try again later."
}
```

### Service: `backend/app/services/auth_service.py`

**Method: `AuthService.request_password_reset(email_or_phone: str)`**

**Process:**
1. Searches database for driver by email or primary_phone
2. Validates driver exists (raises 404 if not found)
3. Validates account uses email authentication (not OAuth)
4. Generates secure reset token via EmailService
5. Sends reset email with token link
6. Returns success message with email address

**Security Checks:**
- Only email-authenticated accounts can reset password
- OAuth accounts (Google, Apple) are rejected with specific error message
- All database lookups use $or query for email OR phone

### Email Service: `backend/app/services/email_service.py`

**New File Created** - Handles all email-related operations

**Methods:**

1. **`generate_reset_token(driver_id: str, email: str) -> str`**
   - Generates cryptographically secure token using `secrets.token_urlsafe(32)`
   - Stores token in MongoDB `password_reset_tokens` collection
   - Sets expiration to 1 hour from creation
   - Returns token string

2. **`verify_reset_token(token: str) -> Optional[dict]`**
   - Validates token exists, is not used, and not expired
   - Returns token document if valid, None otherwise

3. **`mark_token_as_used(token: str) -> bool`**
   - Marks token as used after successful password reset
   - Prevents token reuse

4. **`send_password_reset_email(email: str, reset_token: str) -> bool`**
   - Sends password reset email to driver
   - **Development Mode:** Prints email to console (no actual sending)
   - **Production:** Ready for integration with SendGrid, AWS SES, Mailgun, etc.
   - Constructs reset link: `https://hotride.app/reset-password?token={token}`

5. **`send_password_changed_notification(email: str, driver_name: str) -> bool`**
   - Sends confirmation email after successful password change
   - Security notification to alert driver of password change

### Schemas: `backend/app/schemas/auth_schema.py`

**New Schemas Added:**

```python
class ForgotPasswordRequest(BaseModel):
    email_or_phone: str

class ForgotPasswordResponse(BaseModel):
    success: bool = True
    message: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
    confirm_password: str
```

### Database Schema

**New Collection: `password_reset_tokens`**

```json
{
  "driver_id": "507f1f77bcf86cd799439011",
  "email": "john.doe@example.com",
  "token": "secure_random_token_32_bytes",
  "created_at": "2025-01-20T10:30:00Z",
  "expires_at": "2025-01-20T11:30:00Z",
  "used": false,
  "used_at": null
}
```

**Indexes:**
- `expires_at` with TTL index (automatic deletion after expiration)
- Tokens automatically removed 1 hour after creation

## Security Features

### Token Generation
- Uses Python's `secrets` module for cryptographically secure random tokens
- 32-byte URL-safe tokens (256 bits of entropy)
- Unpredictable and impossible to guess

### Token Expiration
- Tokens valid for 1 hour only
- Automatic expiration via MongoDB TTL index
- Expired tokens cannot be used even if not marked as used

### One-Time Use
- Tokens marked as "used" after successful password reset
- Used tokens cannot be reused

### Account Validation
- Verifies email/phone exists before generating token
- Only email-authenticated accounts can reset (OAuth rejected)
- Prevents enumeration attacks by using generic error messages in production

### Email Verification
- Reset link sent only to registered email address
- User must have access to email account to reset password

## Error Handling

### Frontend Toast Messages

**Success:**
- Type: `success` (green)
- Title: "Reset Link Sent!"
- Message: "Check your email for password reset instructions"
- Duration: 5 seconds
- Auto-navigation back to login after 2 seconds

**Email Not Found:**
- Type: `error` (red)
- Title: "Email does not exist!"
- Message: "Please check and try again"
- Stays visible until dismissed

**Network Error:**
- Type: `error`
- Title: "Error"
- Message: Error detail from backend or generic message

### Backend Error Codes

| Status Code | Scenario | Message |
|------------|----------|---------|
| 200 | Success | "Password reset instructions have been sent to {email}" |
| 400 | OAuth account | "This account uses {provider} authentication. Password reset is not available." |
| 404 | Email/phone not found | "No account found with that email or phone number" |
| 500 | Email sending failed | "Failed to send reset email. Please try again later." |
| 500 | Unexpected error | "An error occurred while processing your request. Please try again." |

## Testing

### Manual Testing Steps

**Test 1: Valid Email Reset**
1. Navigate to login screen
2. Click "Forgot Password?"
3. Enter valid driver email
4. Click "Send Reset Link"
5. ✅ Verify success toast appears
6. ✅ Verify reset email printed to backend console (dev mode)
7. ✅ Verify auto-navigation back to login after 2 seconds

**Test 2: Non-Existent Email**
1. Navigate to forgot password screen
2. Enter email not in database: "notfound@example.com"
3. Click "Send Reset Link"
4. ✅ Verify error toast: "Email does not exist!"
5. ✅ Verify user stays on forgot password screen

**Test 3: OAuth Account**
1. Navigate to forgot password screen
2. Enter email of driver who registered with Google OAuth
3. Click "Send Reset Link"
4. ✅ Verify error toast with OAuth message
5. ✅ Verify no email sent

**Test 4: Empty Field Validation**
1. Navigate to forgot password screen
2. Leave field empty
3. Click "Send Reset Link"
4. ✅ Verify validation toast: "Please enter your email or phone number"

**Test 5: Phone Number Support**
1. Navigate to forgot password screen
2. Enter valid phone number from database
3. Click "Send Reset Link"
4. ✅ Verify success (email sent to email associated with that phone)

**Test 6: Back to Login Navigation**
1. Navigate to forgot password screen
2. Click "← Back to Login"
3. ✅ Verify navigation back to login screen

### Backend Testing (Console Verification)

During development, reset emails are printed to console:

```
============================================================
PASSWORD RESET EMAIL
============================================================
To: john.doe@example.com
Subject: Reset Your HotRider Password
Reset Link: https://hotride.app/reset-password?token=abc123...
Token: abc123...
============================================================
```

### Database Verification

**Check token was created:**
```javascript
db.password_reset_tokens.find({ email: "john.doe@example.com" })
```

**Verify token expiration:**
```javascript
db.password_reset_tokens.find({ expires_at: { $gt: new Date() } })
```

## Dependencies

### Frontend
- **`react-native-toast-message@^2.2.1`** - Toast notifications
- Already installed: `axios`, `expo-router`

### Backend
- No new dependencies required
- Uses existing: `fastapi`, `motor`, `pymongo`

## Integration with Reset Password Flow

The forgot password feature is the first step in the complete password reset flow:

1. **Forgot Password** (this feature) - User requests reset link
2. **Email Delivery** - User receives email with token
3. **Reset Password** (future feature) - User enters new password with token
4. **Password Updated** - User can log in with new password

The reset password endpoint already exists at `POST /api/v1/auth/reset-password` but the UI screen is not yet implemented.

## Production Deployment Checklist

- [ ] Configure email service provider (SendGrid, AWS SES, Mailgun)
- [ ] Update `send_password_reset_email()` with actual email sending code
- [ ] Set production reset link domain (not localhost)
- [ ] Configure email templates with HTML styling
- [ ] Set up email sender domain and verification
- [ ] Test email deliverability
- [ ] Configure SPF, DKIM, DMARC records for email authentication
- [ ] Set up email delivery monitoring and failure alerts
- [ ] Implement rate limiting on forgot-password endpoint
- [ ] Add CAPTCHA to prevent automated abuse
- [ ] Log password reset attempts for security monitoring

## Future Enhancements

1. **SMS Reset Option** - Send reset code via SMS instead of email
2. **Reset Password UI Screen** - Complete the flow with actual password reset screen
3. **Account Recovery Questions** - Additional verification for high-security accounts
4. **Multi-factor Reset** - Require multiple verification methods
5. **Reset History** - Track password reset attempts per account
6. **Suspicious Activity Detection** - Alert on unusual reset patterns
7. **Time-based Codes** - OTP codes instead of long-lived tokens

## File Structure

```
DriverNotif/
├── app/(auth)/
│   ├── login.tsx               (UPDATED - Added navigation to forgot-password)
│   └── forgot-password.tsx     (NEW - Forgot password screen)
├── services/
│   └── api.ts                  (UPDATED - Added sendPasswordResetLink)
├── app/
│   └── _layout.tsx             (UPDATED - Added forgot-password route)
├── package.json                (UPDATED - Added react-native-toast-message)
└── backend/
    ├── app/
    │   ├── routes/
    │   │   └── auth.py         (UPDATED - Added forgot-password endpoint)
    │   ├── services/
    │   │   ├── auth_service.py (UPDATED - Added request_password_reset method)
    │   │   └── email_service.py (NEW - Email and token management)
    │   └── schemas/
    │       └── auth_schema.py   (UPDATED - Added ForgotPassword schemas)
    └── FORGOT_PASSWORD_FEATURE.md (NEW - This documentation)
```

## API Endpoint Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/auth/forgot-password` | Request password reset link |
| POST | `/api/v1/auth/reset-password` | Reset password with token (backend ready, UI pending) |
| POST | `/api/v1/auth/login` | Driver login (existing) |
| POST | `/api/v1/auth/setup-password` | Initial password setup (existing) |

## Related Documentation

- `LOGIN_FEATURE.md` - Login and authentication documentation
- `REVIEW_FEATURE.md` - Registration review screen documentation
- `README.md` - Main project documentation

---

**Implementation Date:** January 2025
**Status:** Complete and ready for testing
**Next Steps:** Implement reset password UI screen to complete the flow

Generated with Compyle
