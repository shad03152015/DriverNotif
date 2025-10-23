# Login & Authentication Feature

## Overview

Complete authentication system for the HotRide driver app, allowing approved drivers to log in with their email/username and password. The system includes secure password hashing, JWT token generation, and session management.

## User Flow

### Authentication Flow

```
App Launch → Check Auth Token → Login Screen → Authenticate → Store Token → Dashboard
```

**Step 1: App Launch**
- Check for existing auth token in AsyncStorage
- If valid token exists, navigate to dashboard (future)
- If no token, show login screen

**Step 2: Login Screen**
- Driver enters email or username
- Driver enters password
- Optional: Toggle password visibility
- Tap "Log In" button

**Step 3: Authentication**
- Credentials sent to backend API
- Backend validates credentials
- Checks driver approval status
- Generates JWT token (valid 7 days)

**Step 4: Success**
- Token stored in AsyncStorage
- Driver data stored locally
- Navigate to main app dashboard

### Driver Approval Requirement

**Important:** Only **approved drivers** can log in. The authentication system enforces this:

- **Pending drivers** → Error: "Your registration is pending approval"
- **Rejected drivers** → Error: "Your registration has been rejected"
- **Approved drivers** → Login successful

## Technical Implementation

### Backend Components

#### 1. Security Utilities (`backend/app/utils/security.py`)

**Password Hashing:**
- Uses bcrypt via passlib
- One-way hashing (cannot be reversed)
- Automatic salt generation

**JWT Token Generation:**
- Uses python-jose library
- Algorithm: HS256
- Token includes: driver_id, email, status
- Expiration: 7 days (configurable)

**Functions:**
```python
hash_password(password) → hashed_password
verify_password(plain_password, hashed_password) → bool
create_access_token(data, expires_delta) → jwt_token
verify_token(token) → payload_dict
```

#### 2. Authentication Service (`backend/app/services/auth_service.py`)

**Methods:**

**authenticate_driver(email_or_username, password)**
- Finds driver by email OR username
- Verifies password hash
- Checks approval status
- Returns driver document or raises HTTPException

**create_access_token_for_driver(driver)**
- Creates JWT with driver data
- 7-day expiration
- Returns signed token

**set_driver_password(driver_id, password)**
- For approved drivers setting up credentials
- Hashes and stores password
- Sets default username (email if not provided)

#### 3. Authentication Routes (`backend/app/routes/auth.py`)

**POST /api/v1/auth/login**
- Authenticates driver credentials
- Returns JWT token on success
- Response includes driver info

**POST /api/v1/auth/setup-password**
- Allows approved drivers to set password
- Requires driver_id and passwords
- Validates password strength (min 8 chars)

#### 4. Updated Driver Model

**New Fields:**
```python
username: Optional[str]  # Username for login (defaults to email)
password_hash: Optional[str]  # Bcrypt hashed password
```

### Frontend Components

#### 1. Login Screen (`app/(auth)/login.tsx`)

**Features:**
- Email or username input
- Password input with visibility toggle
- "Forgot Password" link (placeholder)
- "Log In" button with loading state
- "Quick Login" button (biometric - future)
- "Register" link to registration

**Design Elements:**
- Matches provided design specification
- Orange (#FF4500) primary color
- Rounded inputs and buttons
- Clean, modern UI

**State Management:**
- Form validation
- Loading states
- Error handling
- Token storage with AsyncStorage

#### 2. API Service (`services/api.ts`)

**loginDriver(credentials)**
- POST to /api/v1/auth/login
- Sends email_or_username and password
- Returns login response with token
- Handles error messages

#### 3. App Entry Point (`app/index.tsx`)

**Authentication Check:**
- Checks AsyncStorage for access_token
- Shows loading spinner during check
- Redirects to login if no token
- Future: Validate token and redirect to dashboard

### Data Flow

```
Login Screen
    ↓
  API Client (services/api.ts)
    ↓
  Backend Auth Route (/api/v1/auth/login)
    ↓
  Auth Service (authenticate_driver)
    ↓
  MongoDB (find driver, verify password)
    ↓
  JWT Token Generation
    ↓
  Response to Frontend
    ↓
  Store Token in AsyncStorage
    ↓
  Navigate to Dashboard
```

## API Endpoints

### POST /api/v1/auth/login

Authenticate driver with credentials.

**Request Body:**
```json
{
  "email_or_username": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "driver_id": "507f1f77bcf86cd799439011",
    "email": "john.doe@example.com",
    "username": "john.doe",
    "first_name": "John",
    "surname": "Doe",
    "status": "approved",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer"
  }
}
```

**Error Responses:**

**401 Unauthorized:**
```json
{
  "detail": "Invalid email/username or password"
}
```

**403 Forbidden (Pending):**
```json
{
  "detail": "Your registration is pending approval. Please wait for admin review."
}
```

**403 Forbidden (Rejected):**
```json
{
  "detail": "Your registration has been rejected. Please contact support."
}
```

**401 (OAuth Account):**
```json
{
  "detail": "This account uses OAuth authentication. Please log in with Google or Apple."
}
```

### POST /api/v1/auth/setup-password

Set up password for approved driver (admin use or post-approval).

**Request Body:**
```json
{
  "driver_id": "507f1f77bcf86cd799439011",
  "password": "securePassword123",
  "confirm_password": "securePassword123"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password set successfully. You can now log in."
}
```

## Security Features

### Password Security
- **Bcrypt hashing** - Industry standard, slow by design
- **Automatic salting** - Unique salt per password
- **One-way hashing** - Passwords cannot be decrypted
- **Minimum 8 characters** - Enforced on setup

### JWT Tokens
- **Signed tokens** - Prevents tampering
- **HS256 algorithm** - Secure signing
- **7-day expiration** - Automatic logout after 7 days
- **Payload data** - driver_id, email, status

### API Security
- **API key authentication** - All endpoints protected
- **Input validation** - Pydantic schemas
- **Error handling** - No sensitive data in errors
- **Rate limiting** - Should be added for production

## Storage

### AsyncStorage (Frontend)
```javascript
access_token: string       // JWT token
driver_id: string         // Driver's MongoDB ID
driver_email: string      // Driver's email
driver_name: string       // Full name
```

### MongoDB (Backend)
```javascript
{
  username: "john.doe",           // Username for login
  password_hash: "$2b$12$...",    // Bcrypt hash
  // ... other driver fields
}
```

## Testing

### Backend Testing

**1. Test Login with Valid Credentials:**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "email_or_username": "john.doe@example.com",
    "password": "testPassword123"
  }'
```

**2. Test with Invalid Credentials:**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "email_or_username": "wrong@example.com",
    "password": "wrongpassword"
  }'
```

**3. Test Password Setup:**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/setup-password" \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "driver_id": "507f1f77bcf86cd799439011",
    "password": "newPassword123",
    "confirm_password": "newPassword123"
  }'
```

### Frontend Testing

**1. Test Login Flow:**
- Launch app
- Enter email/username
- Enter password
- Tap "Log In"
- Verify token stored
- Verify navigation occurs

**2. Test Validation:**
- Try empty email → Should show error
- Try empty password → Should show error
- Try invalid credentials → Should show error alert

**3. Test Token Persistence:**
- Log in successfully
- Close app
- Reopen app
- Should check for token (future: auto-login)

### Manual Database Setup for Testing

**Create a test driver with password:**

```javascript
// MongoDB shell
use hotride_db

// First, create an approved driver (from registration)
// Then, use Python to hash a password:
```

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
hashed = pwd_context.hash("testPassword123")
print(hashed)
```

```javascript
// Update driver with hashed password
db.drivers.updateOne(
  { email: "john.doe@example.com" },
  {
    $set: {
      username: "john.doe",
      password_hash: "your_hashed_password_here",
      status: "approved"
    }
  }
)
```

## Error Handling

### Frontend Error Messages

**Network Errors:**
- "Unable to reach server. Please check your internet connection."

**Invalid Credentials:**
- "Invalid email/username or password"

**Pending Approval:**
- "Your registration is pending approval. Please wait for admin review."

**Rejected Application:**
- "Your registration has been rejected. Please contact support."

**OAuth Account:**
- "This account uses OAuth authentication. Please log in with Google or Apple."

**Validation Errors:**
- "Please enter your email or username"
- "Please enter your password"

## Future Enhancements

### Planned Features

1. **Biometric Authentication** (Quick Login button)
   - Face ID / Touch ID
   - Secure token storage in Keychain/Keystore

2. **Forgot Password**
   - Email verification
   - Password reset flow
   - Secure reset tokens

3. **Remember Me**
   - Extended token validity
   - Secure device binding

4. **OAuth Login**
   - Google Sign In
   - Apple Sign In
   - Social account linking

5. **Multi-Factor Authentication**
   - SMS verification
   - Authenticator app support

6. **Session Management**
   - Multiple device support
   - Active session viewing
   - Remote logout

## Configuration

### Backend Environment Variables

```env
# JWT Configuration
JWT_SECRET=your_jwt_secret_here_for_future_use
JWT_ALGORITHM=HS256

# Token expiration (in seconds, default 7 days)
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

### Frontend Environment Variables

No additional configuration needed for login feature.

## Dependencies

### Backend (requirements.txt)
```
passlib[bcrypt]==1.7.4  # Password hashing
python-jose[cryptography]==3.3.0  # JWT tokens
```

### Frontend (package.json)
```json
{
  "@react-native-async-storage/async-storage": "1.23.1"
}
```

## Integration with Existing System

### Registration Flow Integration

**Current:**
1. Driver registers → Status: "pending"
2. Admin approves → Status: "approved"
3. Driver receives notification

**New with Login:**
1. Driver registers → Status: "pending"
2. Admin approves → Status: "approved"
3. **Admin sets initial password** (or driver sets via email link)
4. Driver can now log in

### Registration Screen Integration

Updated registration screen includes:
- "Already have an account? Log in" link
- Redirects to login screen

### Login Screen Integration

Login screen includes:
- "Don't have an account? Register" link
- Redirects to registration screen

## Maintenance

### Password Reset

When a driver forgets their password:
1. Use `/api/v1/auth/setup-password` endpoint
2. Requires driver_id (from admin panel)
3. Admin can manually reset password

### Token Refresh

Current implementation: 7-day tokens
Future: Add refresh token endpoint for automatic renewal

### Database Indexes

Existing indexes support login:
- `email` (unique) - Fast email lookups
- Username lookups use email index

Consider adding:
- `username` index if usernames become popular

## Troubleshooting

### Common Issues

**1. "Invalid email/username or password"**
- Check credentials are correct
- Verify driver exists in database
- Verify password_hash is set
- Check driver status is "approved"

**2. "Unable to reach server"**
- Check backend is running
- Verify API_URL in .env
- Check network connection
- Verify firewall settings

**3. Token not persisting**
- Check AsyncStorage permissions
- Verify token is being stored
- Check for AsyncStorage errors

**4. Login succeeds but no navigation**
- Check navigation setup
- Verify dashboard route exists
- Check console for errors

## Status

✅ **Backend Authentication** - Complete
✅ **Login Screen UI** - Complete
✅ **API Integration** - Complete
✅ **Token Storage** - Complete
⏳ **Biometric Auth** - Future
⏳ **Password Reset** - Future
⏳ **Dashboard** - Future

---

**Implementation Status:** Login feature is complete and ready for testing with approved drivers who have passwords set.
