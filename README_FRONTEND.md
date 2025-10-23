# HotRide Driver App - Frontend

React Native mobile app for HotRide driver registration.

## Features

- Driver registration form with validation
- Profile photo upload
- Email-based registration
- OAuth support (Google, Apple) - placeholders included
- Success screen with registration timeline
- Form validation with react-hook-form
- Responsive UI with NativeWind (Tailwind CSS)

## Tech Stack

- **React Native** - Cross-platform mobile framework
- **Expo** - Development and build platform
- **Expo Router** - File-based routing
- **NativeWind** - Tailwind CSS for React Native
- **React Hook Form** - Form validation
- **Axios** - HTTP client
- **TypeScript** - Type safety

## Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Emulator
- Backend API running (see backend/README.md)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update:

```bash
cp .env.example .env
```

Edit `.env`:
```env
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_API_KEY=dev_api_key_32_chars_minimum_required_for_security
```

**Important:** Use the same `API_KEY` as your backend.

### 3. Start the Development Server

```bash
npm start
```

This will start Expo Metro Bundler.

### 4. Run on Device/Simulator

**iOS Simulator (Mac only):**
```bash
npm run ios
```

**Android Emulator:**
```bash
npm run android
```

**Physical Device:**
- Install "Expo Go" app from App Store/Play Store
- Scan the QR code from the terminal

## Project Structure

```
DriverNotif/
├── app/                          # Expo Router screens
│   ├── _layout.tsx              # Root layout
│   ├── index.tsx                # Entry point
│   └── (auth)/
│       ├── registration.tsx     # Registration screen
│       └── success.tsx          # Success screen
├── components/                   # Reusable components
│   ├── forms/                   # Form components
│   └── buttons/                 # Button components
├── hooks/                       # Custom React hooks
├── services/                    # API services
│   └── api.ts                  # Backend API client
├── types/                       # TypeScript types
│   └── registration.ts         # Registration types
├── utils/                       # Utility functions
│   └── validation.ts           # Validation helpers
├── assets/                      # Images and static files
├── global.css                   # Global Tailwind styles
├── tailwind.config.js          # Tailwind configuration
├── app.json                    # Expo configuration
├── package.json                # Dependencies
└── README_FRONTEND.md          # This file
```

## Key Features Implementation

### Registration Form

The main registration screen (`app/(auth)/registration.tsx`) includes:

- Email input with validation
- Personal details (name, birthdate, birthplace)
- License information
- Contact information (address, phone numbers)
- Profile photo upload
- Form validation with react-hook-form
- Error handling and display

### Form Validation

Validation rules (in `utils/validation.ts`):
- Email format validation
- Required field validation
- Minimum length validation
- Phone number formatting
- Date validation

### API Integration

API client (`services/api.ts`):
- Axios-based HTTP client
- API key authentication
- Form data submission (multipart/form-data)
- Error handling

### Success Screen

Success screen (`app/(auth)/success.tsx`):
- Confirmation message
- Timeline showing registration process
- Done button to exit

## Environment Variables

Required in `.env`:

```env
# Backend API Configuration
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_API_KEY=your_api_key

# OAuth Configuration (optional for now)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

## Testing

### Test on iOS Simulator

```bash
npm run ios
```

### Test on Android Emulator

```bash
npm run android
```

### Test Registration Flow

1. Launch app
2. Fill in email and all required fields
3. Optionally upload a profile photo
4. Tap "Submit for Review"
5. Verify success screen appears
6. Check backend database for new driver entry

## Common Issues

### Metro Bundler Issues

```bash
# Clear cache and restart
npx expo start -c
```

### Build Errors

```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### API Connection Failed

- Ensure backend is running on http://localhost:8000
- Check `EXPO_PUBLIC_API_URL` in `.env`
- Verify `EXPO_PUBLIC_API_KEY` matches backend
- For physical devices, use your computer's IP instead of localhost

### NativeWind Styles Not Applying

```bash
# Rebuild with cache clear
npx expo start -c
```

## OAuth Setup (Optional)

### Google OAuth

1. Create project in Google Cloud Console
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add client IDs to `.env`
5. Configure in `app.json`

### Apple Sign In

1. Enable in Apple Developer Console
2. Configure in `app.json`
3. Only works on iOS devices

## Building for Production

### iOS

```bash
# Requires Apple Developer account
eas build --platform ios
```

### Android

```bash
eas build --platform android
```

## Development Tips

- Use Expo Go for quick testing
- Hot reload is enabled by default
- Check console for errors
- Use React DevTools for debugging

## Dependencies

Key dependencies:
- `expo` - Expo framework
- `expo-router` - File-based routing
- `react-native` - React Native core
- `nativewind` - Tailwind CSS for RN
- `react-hook-form` - Form management
- `axios` - HTTP client
- `expo-image-picker` - Image selection

See `package.json` for complete list.

## License

MIT
