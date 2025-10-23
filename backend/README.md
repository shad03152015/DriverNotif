# HotRide Driver API - Backend

FastAPI backend for HotRide driver registration system.

## Features

- Driver registration API with email and OAuth support
- Profile photo upload (JPG/PNG, max 5MB)
- MongoDB data persistence
- API key authentication
- Async operations with Motor (async MongoDB driver)
- Automatic API documentation (Swagger/OpenAPI)

## Tech Stack

- **Python 3.11+**
- **FastAPI** - Modern async web framework
- **MongoDB** - NoSQL database
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

## Project Structure

```
backend/
├── app/
│   ├── main.py                    # FastAPI application entry point
│   ├── config.py                  # Configuration and environment variables
│   ├── database.py                # MongoDB connection management
│   ├── models/
│   │   └── driver.py              # Driver MongoDB models
│   ├── schemas/
│   │   └── driver_schema.py       # Request/response schemas
│   ├── routes/
│   │   └── registration.py        # Registration API endpoints
│   ├── services/
│   │   ├── file_service.py        # File upload handling
│   │   └── driver_service.py      # Driver registration business logic
│   └── middleware/
│       └── api_key_auth.py        # API key authentication
├── uploads/                        # Profile photos storage
├── requirements.txt                # Python dependencies
├── .env                           # Environment variables
└── README.md                      # This file
```

## Prerequisites

- Python 3.11 or higher
- MongoDB (local or MongoDB Atlas)
- pip (Python package manager)

## Setup Instructions

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

Or use a virtual environment (recommended):

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=hotride_db

# API Security
API_KEY=your_secure_api_key_here_min_32_chars
JWT_SECRET=your_jwt_secret_here_for_future_use

# File Upload
UPLOAD_DIR=./uploads/profile_photos
MAX_FILE_SIZE=5242880
ALLOWED_EXTENSIONS=jpg,jpeg,png

# Application
API_V1_PREFIX=/api/v1
DEBUG=true
```

**Important:** Generate secure keys for `API_KEY` and `JWT_SECRET` (minimum 32 characters).

### 3. Start MongoDB

**Option A: Local MongoDB**

```bash
mongod
```

**Option B: MongoDB Atlas (Cloud)**

1. Create a free cluster at [mongodb.com](https://www.mongodb.com/cloud/atlas)
2. Get your connection string
3. Update `MONGODB_URL` in `.env` with your connection string

### 4. Run the Server

**Development mode (with auto-reload):**

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Production mode:**

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access:

- **Interactive API Docs (Swagger UI):** http://localhost:8000/docs
- **Alternative API Docs (ReDoc):** http://localhost:8000/redoc
- **Health Check:** http://localhost:8000/health

## API Endpoints

### POST /api/v1/registration/driver

Register a new driver.

**Headers:**
```
X-API-Key: your_api_key
Content-Type: multipart/form-data
```

**Request Body (Form Data):**

Required fields:
- `email` - Driver's email address
- `auth_provider` - "email", "google", or "apple"
- `first_name` - Driver's first name
- `surname` - Driver's surname
- `birthdate` - Date in YYYY-MM-DD format
- `birthplace` - City, Country
- `license_number` - Driver's license number
- `license_expiry_date` - Date in YYYY-MM-DD format
- `address_line_1` - Street address
- `primary_phone` - Phone number

Optional fields:
- `oauth_id` - OAuth provider user ID (required for google/apple)
- `middle_name` - Driver's middle name
- `address_line_2` - Apartment, suite, etc.
- `secondary_phone` - Secondary phone number
- `profile_photo` - Profile photo file (JPG/PNG, max 5MB)

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration submitted successfully",
  "data": {
    "driver_id": "507f1f77bcf86cd799439011",
    "email": "john.doe@example.com",
    "status": "pending",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

**Error Responses:**

- `400` - Validation error (invalid data)
- `401` - Unauthorized (missing or invalid API key)
- `409` - Conflict (email already exists)
- `500` - Internal server error

## Testing with cURL

```bash
curl -X POST "http://localhost:8000/api/v1/registration/driver" \
  -H "X-API-Key: your_api_key" \
  -F "email=john.doe@example.com" \
  -F "auth_provider=email" \
  -F "first_name=John" \
  -F "surname=Doe" \
  -F "birthdate=1990-01-15" \
  -F "birthplace=New York, USA" \
  -F "license_number=D1234567" \
  -F "license_expiry_date=2026-12-31" \
  -F "address_line_1=123 Main Street" \
  -F "primary_phone=(123) 456-7890" \
  -F "profile_photo=@/path/to/photo.jpg"
```

## Database Schema

### drivers Collection

```json
{
  "_id": "ObjectId",
  "email": "string (unique)",
  "auth_provider": "email|google|apple",
  "oauth_id": "string|null",
  "first_name": "string",
  "middle_name": "string|null",
  "surname": "string",
  "birthdate": "ISODate",
  "birthplace": "string",
  "license_number": "string",
  "license_expiry_date": "ISODate",
  "address_line_1": "string",
  "address_line_2": "string|null",
  "primary_phone": "string",
  "secondary_phone": "string|null",
  "profile_photo_url": "string|null",
  "profile_photo_filename": "string|null",
  "status": "pending|approved|rejected",
  "created_at": "ISODate",
  "updated_at": "ISODate",
  "reviewed_at": "ISODate|null",
  "reviewed_by": "ObjectId|null",
  "rejection_reason": "string|null"
}
```

**Indexes:**
- `email` (unique)
- `status`
- `created_at`
- `license_number`

## Troubleshooting

### MongoDB Connection Failed

- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URL` in `.env` is correct
- For Atlas, check your IP is whitelisted

### Import Errors

```bash
# Reinstall dependencies
pip install -r requirements.txt
```

### Port Already in Use

```bash
# Use a different port
uvicorn app.main:app --reload --port 8001
```

### API Key Authentication Failed

- Check `API_KEY` in `.env` matches the key in your requests
- Ensure `X-API-Key` header is set correctly

## Development

### Adding New Dependencies

```bash
pip install package_name
pip freeze > requirements.txt
```

### Code Structure

- **Routes** - Define API endpoints
- **Services** - Business logic
- **Models** - Database document structure
- **Schemas** - Request/response validation
- **Middleware** - Authentication, CORS, etc.

## Production Deployment

1. Set `DEBUG=false` in `.env`
2. Use production MongoDB (MongoDB Atlas)
3. Generate secure API keys
4. Configure CORS with specific origins in `main.py`
5. Use multiple workers: `--workers 4`
6. Set up HTTPS with nginx reverse proxy
7. Configure file storage (S3, etc.)

## License

MIT
