# HotRide Driver Registration System

Full-stack mobile application for driver registration with React Native frontend and FastAPI backend.

## Overview

HotRide is a driver registration platform that allows drivers to submit their information for review. The system includes:

- **Mobile App** (React Native + Expo) - Driver registration interface
- **Backend API** (FastAPI + MongoDB) - Registration processing and data storage
- **Profile Photo Upload** - Image upload and storage
- **API Key Authentication** - Secure endpoint protection
- **Form Validation** - Client and server-side validation

## Architecture

```
HotRide Driver Registration System
│
├── Frontend (React Native + Expo)
│   ├── Registration Form UI
│   ├── Form Validation
│   ├── Review Details Screen (NEW)
│   ├── Photo Upload
│   └── Success Screen
│
└── Backend (FastAPI + MongoDB)
    ├── Registration API
    ├── File Upload Service
    ├── API Key Auth
    └── MongoDB Storage
```

## Tech Stack

### Frontend
- React Native with Expo
- NativeWind (Tailwind CSS)
- React Hook Form
- Expo Router
- TypeScript

### Backend
- Python 3.11+
- FastAPI
- MongoDB with Motor (async driver)
- Pydantic for validation
- Uvicorn ASGI server

## Project Structure

```
DriverNotif/
├── app/                      # Frontend - Expo Router screens
├── components/               # Frontend - Reusable components
├── services/                 # Frontend - API client
├── types/                    # Frontend - TypeScript types
├── utils/                    # Frontend - Utilities
├── backend/                  # Backend - FastAPI application
│   ├── app/
│   │   ├── main.py          # FastAPI entry point
│   │   ├── config.py        # Configuration
│   │   ├── database.py      # MongoDB connection
│   │   ├── models/          # Database models
│   │   ├── schemas/         # API schemas
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   └── middleware/      # Authentication
│   ├── uploads/             # Uploaded files
│   └── requirements.txt     # Python dependencies
├── package.json              # Frontend dependencies
├── app.json                  # Expo configuration
└── README.md                 # This file
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- MongoDB (local or Atlas)
- Expo CLI (optional, for easy testing)

### 1. Setup Backend

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URL and generate secure API keys

# Start MongoDB (if local)
mongod

# Run backend server
uvicorn app.main:app --reload
```

Backend will be available at `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

### 2. Setup Frontend

```bash
# Navigate to project root
cd DriverNotif

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with backend URL and API key (must match backend)

# Start Expo development server
npm start

# Run on iOS simulator (Mac only)
npm run ios

# Run on Android emulator
npm run android
```

## Configuration

### Backend Environment Variables

Edit `backend/.env`:

```env
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=hotride_db
API_KEY=your_secure_api_key_here_min_32_chars
UPLOAD_DIR=./uploads/profile_photos
```

### Frontend Environment Variables

Edit `.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_API_KEY=your_secure_api_key_here_min_32_chars
```

**Important:** Both frontend and backend must use the same `API_KEY`.

## API Endpoints

### POST /api/v1/registration/driver

Register a new driver.

**Headers:**
```
X-API-Key: your_api_key
Content-Type: multipart/form-data
```

**Request Body:** (Form Data)
- Required: email, auth_provider, first_name, surname, birthdate, birthplace, license_number, license_expiry_date, address_line_1, primary_phone
- Optional: middle_name, address_line_2, secondary_phone, oauth_id, profile_photo

**Response:** (201 Created)
```json
{
  "success": true,
  "message": "Registration submitted successfully",
  "data": {
    "driver_id": "...",
    "email": "...",
    "status": "pending",
    "created_at": "..."
  }
}
```

## Features

### Implemented
✅ Driver registration form with all required fields
✅ Email validation
✅ Profile photo upload (optional, max 5MB, JPG/PNG)
✅ Form validation (client and server-side)
✅ Review details screen with confirmation step
✅ Go back to edit functionality
✅ API key authentication
✅ MongoDB data persistence
✅ Success screen with registration timeline
✅ Error handling and user feedback
✅ Responsive mobile UI

### OAuth Integration (Placeholder)
- Google OAuth (placeholders in place, requires configuration)
- Apple Sign In (placeholders in place, requires configuration)

## Database Schema

MongoDB collection: `drivers`

```javascript
{
  email: String (unique),
  auth_provider: "email" | "google" | "apple",
  first_name: String,
  middle_name: String?,
  surname: String,
  birthdate: Date,
  birthplace: String,
  license_number: String,
  license_expiry_date: Date,
  address_line_1: String,
  address_line_2: String?,
  primary_phone: String,
  secondary_phone: String?,
  profile_photo_url: String?,
  status: "pending" | "approved" | "rejected",
  created_at: Date,
  updated_at: Date
}
```

## Testing

### Test Registration Flow

1. Start backend: `cd backend && uvicorn app.main:app --reload`
2. Start frontend: `npm start`
3. Run on simulator/emulator
4. Fill in registration form
5. Upload photo (optional)
6. Tap "Review Details" button
7. **Review all entered information on the review screen**
8. **Either "Go Back & Edit" to make changes, or "Confirm & Submit"**
9. Verify success screen appears
10. Check MongoDB for new driver document

### Manual API Testing

```bash
curl -X POST "http://localhost:8000/api/v1/registration/driver" \
  -H "X-API-Key: your_api_key" \
  -F "email=test@example.com" \
  -F "auth_provider=email" \
  -F "first_name=John" \
  -F "surname=Doe" \
  -F "birthdate=1990-01-15" \
  -F "birthplace=New York, USA" \
  -F "license_number=D1234567" \
  -F "license_expiry_date=2026-12-31" \
  -F "address_line_1=123 Main St" \
  -F "primary_phone=(123) 456-7890"
```

## Troubleshooting

### Backend Issues

**MongoDB Connection Failed:**
- Ensure MongoDB is running
- Check `MONGODB_URL` in `backend/.env`

**API Key Authentication Failed:**
- Verify API key matches in both `.env` files
- Check `X-API-Key` header is set correctly

### Frontend Issues

**Cannot Connect to Backend:**
- Ensure backend is running on http://localhost:8000
- For physical devices, use your computer's IP address instead of localhost
- Check firewall settings

**NativeWind Styles Not Working:**
```bash
npx expo start -c  # Clear cache
```

**Build Errors:**
```bash
rm -rf node_modules
npm install
```

## Documentation

- **Frontend README:** `README_FRONTEND.md`
- **Backend README:** `backend/README.md`
- **API Documentation:** http://localhost:8000/docs (when running)

## Development

### Backend Development

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### Frontend Development

```bash
npm start
# Press 'i' for iOS, 'a' for Android
```

### Hot Reload

Both backend and frontend support hot reload during development.

## Production Deployment

### Backend
- Use MongoDB Atlas for database
- Deploy to Railway, Render, or similar platform
- Set `DEBUG=false`
- Use production API keys
- Configure CORS with specific origins
- Set up HTTPS

### Frontend
- Build with EAS Build (`eas build`)
- Submit to App Store/Play Store
- Configure production API URL
- Set up OAuth credentials

## Security Notes

- API keys must be at least 32 characters
- Store secrets in environment variables
- Never commit `.env` files
- Use HTTPS in production
- Validate all inputs server-side
- Implement rate limiting for production

## License

MIT

## Support

For issues or questions:
- Check documentation in `README_FRONTEND.md` and `backend/README.md`
- Review API documentation at http://localhost:8000/docs
- Check troubleshooting sections above

---

**Built with:**
- React Native & Expo
- FastAPI & MongoDB
- NativeWind (Tailwind CSS)
- TypeScript & Python
