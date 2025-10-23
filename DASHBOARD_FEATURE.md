# Driver Dashboard Feature Documentation

## Overview

The driver dashboard is the main operational screen for HotRide drivers, where they manage their online status, view real-time booking requests, and accept rides. The dashboard features two viewing modes (list and slider/swipe) for booking requests with countdown timers.

## Features

### 1. Online/Offline Toggle
- **Green pill button** at top-right with scooter icon
- Displays "Online" (green) or "Offline" (gray)
- When **Online**: Driver is visible to riders and receives booking requests
- When **Offline**: Driver is hidden and booking requests stop
- Toast notifications confirm status changes

### 2. View Mode Toggle
- **Two viewing modes** for booking requests:
  - **📋 List View**: Traditional vertical list with all bookings visible
  - **🎴 Swipe View**: Tinder-style card interface with swipe gestures
- Toggle buttons styled in orange when active
- Seamless switching between modes

### 3. Dashboard Statistics
- **Today's Earnings**: Real-time total from completed trips
- **Trips Completed**: Count of finished rides today
- Displayed in dark cards with large, bold numbers

### 4. Booking Request List View
- Shows up to 10 pending booking requests
- Each card displays:
  - **Fare amount** (large, prominent)
  - **Distance** in kilometers
  - **Countdown timer** (orange text, updating every second)
  - **Progress bar** showing time remaining
  - **Pickup location** with green pin 📍
  - **Dropoff location** with red target 🎯
- Tap any booking to see detailed modal

### 5. Booking Request Slider/Swipe View
- **Tinder-style card stack** with swipe gestures
- Shows top 2 bookings at once (stacked)
- **Swipe Right** → Accept booking (shows green "ACCEPT" label)
- **Swipe Left** → Ignore booking (shows red "IGNORE" label)
- Larger, more detailed cards with:
  - Fare, distance, and timer
  - Passenger information with avatar
  - Pickup and dropoff in separate sections
  - Visual swipe indicators
- Bottom text: "👈 Swipe to ignore" and "Swipe to accept 👉"

### 6. Booking Detail Modal
- **Bottom sheet modal** with orange header
- Shows when tapping a booking in list view
- Complete booking information:
  - **Header**: Fare, distance, duration, countdown timer
  - **Passenger section**: Name, avatar, rating ⭐
  - **Locations section**: Pickup and dropoff with icons
  - **Earnings breakdown**: Base fare + distance charge
- **Two buttons**:
  - "Close" (gray outline)
  - "Accept Ride" (green, prominent)

### 7. Real-Time Updates
- **Polls for new bookings every 5 seconds** when online
- Automatically clears bookings when going offline
- Countdown timers update every second
- Smooth animations for status changes

## User Flow

### Going Online
```
Driver opens app → Login → Dashboard (offline by default)
    ↓
Taps "Offline" toggle
    ↓
Status changes to "Online" (green)
    ↓
Toast: "You are now Online - You can receive booking requests"
    ↓
System immediately fetches nearby booking requests
    ↓
Bookings appear in selected view mode (list or slider)
    ↓
Real-time polling begins (every 5 seconds)
```

### Viewing Bookings - List Mode
```
Driver sees list of bookings
    ↓
Each booking shows timer counting down (30s, 29s, 28s...)
    ↓
Taps on a booking
    ↓
Detail modal slides up from bottom
    ↓
Reviews passenger info, locations, earnings
    ↓
Options:
  - Tap "Close" → Returns to list
  - Tap "Accept Ride" → Booking assigned, modal closes
```

### Viewing Bookings - Swipe Mode
```
Driver sees top booking card
    ↓
Option 1: Swipe left to ignore
  → Card animates off screen
  → Next booking appears
    ↓
Option 2: Swipe right to accept
  → Card animates off screen with "ACCEPT" label
  → Booking assigned to driver
  → Next booking appears
    ↓
Option 3: Tap card to see details
  → Detail modal opens (same as list mode)
```

### Going Offline
```
Driver taps "Online" toggle
    ↓
Status changes to "Offline" (gray)
    ↓
Toast: "You are now Offline - You will not receive new bookings"
    ↓
All booking requests cleared from view
    ↓
Polling stops
    ↓
Message: "You are offline - Toggle the switch to go online..."
```

## Technical Implementation

### Frontend Components

**Main Dashboard Screen**
- **File**: `app/(dashboard)/index.tsx`
- **State Management**:
  - `isOnline` - Online/offline status
  - `viewMode` - 'list' or 'slider'
  - `dashboardData` - Earnings and trip stats
  - `bookingRequests` - Array of bookings
  - `selectedBooking` - Currently viewed booking detail
  - `isModalVisible` - Modal open/closed state

**Booking List View**
- **File**: `components/dashboard/BookingListView.tsx`
- **Features**:
  - FlatList of booking cards
  - Individual countdown timers per booking
  - Progress bars calculating percentage remaining
  - Tap handlers for detail modal
  - Auto-updating timers with useEffect

**Booking Slider View**
- **File**: `components/dashboard/BookingSliderView.tsx`
- **Features**:
  - Animated.View for card positioning
  - PanResponder for swipe gestures
  - Rotation transform based on swipe direction
  - Swipe threshold detection (35% of screen width)
  - Overlay indicators for accept/ignore
  - Card stack (shows top 2 bookings)

**Booking Detail Modal**
- **File**: `components/dashboard/BookingDetailModal.tsx`
- **Features**:
  - Bottom sheet modal animation
  - Scrollable content for all details
  - Real-time countdown in header
  - Earnings breakdown calculation
  - Accept and close actions

### Backend Implementation

**Dashboard Router**
- **File**: `backend/app/routes/dashboard.py`
- **Authentication**: JWT Bearer token via `get_current_driver` dependency
- **Endpoints**: See API Endpoints section below

**JWT Authentication Middleware**
```python
async def get_current_driver(authorization: str = Header(None)):
    # Extracts Bearer token from header
    # Verifies token with verify_token()
    # Queries driver from database
    # Returns driver document or raises 401
```

### API Endpoints

#### GET `/api/v1/dashboard/stats`
**Purpose**: Get driver statistics for dashboard

**Authentication**: Bearer token required

**Response**:
```json
{
  "success": true,
  "today_earnings": 120.50,
  "trips_completed": 8,
  "driver_id": "507f1f77bcf86cd799439011",
  "driver_name": "John Doe",
  "is_online": false
}
```

#### POST `/api/v1/dashboard/online-status`
**Purpose**: Update driver online/offline status

**Request**:
```json
{
  "is_online": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "Status updated to online",
  "is_online": true
}
```

**Side Effects**:
- Updates `driver.is_online` field
- Sets `driver.last_online_update` timestamp

#### GET `/api/v1/dashboard/booking-requests`
**Purpose**: Get pending booking requests for driver

**Conditions**:
- Only returns bookings if driver is online
- Only shows bookings not yet assigned
- Only shows bookings not expired
- Limited to 10 bookings (most recent first)

**Response**:
```json
{
  "success": true,
  "bookings": [
    {
      "id": "507f1f77bcf86cd799439011",
      "fare": 8.50,
      "distance": 3.2,
      "pickup_location": "123 Main St, Downtown",
      "dropoff_location": "456 Park Ave, Uptown",
      "passenger_name": "Jane Smith",
      "passenger_phone": "+1234567890",
      "passenger_rating": 4.8,
      "expires_at": "2025-01-20T10:31:00Z",
      "created_at": "2025-01-20T10:30:00Z",
      "estimated_duration": 15
    }
  ],
  "count": 1
}
```

#### POST `/api/v1/dashboard/bookings/{booking_id}/accept`
**Purpose**: Accept a booking request

**Path Parameter**: `booking_id` - MongoDB ObjectId as string

**Validations**:
- Booking must exist
- Booking must be in "pending" status
- Booking must not be assigned to another driver
- Booking must not be expired

**Response**:
```json
{
  "success": true,
  "message": "Booking accepted successfully",
  "booking_id": "507f1f77bcf86cd799439011",
  "pickup_location": "123 Main St, Downtown",
  "passenger_name": "Jane Smith",
  "passenger_phone": "+1234567890",
  "fare": 8.50
}
```

**Side Effects**:
- Updates booking status to "accepted"
- Assigns `assigned_driver_id` to current driver
- Sets `accepted_at` timestamp
- Marks driver as busy (`driver.is_busy = true`)
- Sets `driver.current_booking_id`

**Error Responses**:
- **400**: Invalid booking ID format
- **404**: Booking not found
- **409**: Booking already assigned or no longer available
- **410**: Booking expired

### Database Collections

**`drivers` Collection Updates**:
```json
{
  "_id": "ObjectId",
  "is_online": false,
  "last_online_update": "2025-01-20T10:30:00Z",
  "is_busy": false,
  "current_booking_id": null,
  // ... existing driver fields
}
```

**`bookings` Collection** (New):
```json
{
  "_id": "ObjectId",
  "passenger_id": "ObjectId",
  "passenger_name": "Jane Smith",
  "passenger_phone": "+1234567890",
  "passenger_rating": 4.8,
  "pickup_location": "123 Main St, Downtown",
  "dropoff_location": "456 Park Ave, Uptown",
  "pickup_coordinates": [40.7128, -74.0060],
  "dropoff_coordinates": [40.7580, -73.9855],
  "distance": 3.2,
  "estimated_duration": 15,
  "fare": 8.50,
  "status": "pending",
  "assigned_driver_id": null,
  "driver_name": null,
  "created_at": "2025-01-20T10:30:00Z",
  "expires_at": "2025-01-20T10:30:30Z",
  "accepted_at": null,
  "completed_at": null
}
```

**`trips` Collection** (New):
```json
{
  "_id": "ObjectId",
  "booking_id": "ObjectId",
  "driver_id": "507f1f77bcf86cd799439011",
  "passenger_id": "ObjectId",
  "fare": 8.50,
  "distance": 3.2,
  "duration": 18,
  "status": "completed",
  "started_at": "2025-01-20T10:35:00Z",
  "completed_at": "2025-01-20T10:53:00Z"
}
```

## UI Design Specifications

### Color Scheme
- **Background**: `#111827` (gray-900)
- **Cards**: `#1F2937` (gray-800)
- **Online**: `#10B981` (green-500)
- **Offline**: `#4B5563` (gray-600)
- **Primary Action**: `#FF4500` (orange-600)
- **Timer/Alert**: `#FF4500` (orange-500)
- **Text Primary**: `#FFFFFF` (white)
- **Text Secondary**: `#9CA3AF` (gray-400)

### Typography
- **Large Numbers** (earnings, fare): 36-40px, font-bold
- **Timer**: 28-32px, font-bold, orange
- **Section Titles**: 12px, uppercase, gray-400
- **Body Text**: 16px, white/gray-300
- **Button Text**: 18px, font-semibold

### Spacing & Layout
- **Screen Padding**: 24px horizontal, 64px top
- **Card Padding**: 20-24px
- **Card Gap**: 16px
- **Border Radius**: 24px (cards), 16px (buttons)
- **Icon Size**: 24x24px (standard), 48x48px (large avatars)

### Animations
- **Swipe Cards**: Spring animation with rotation transform
- **Status Toggle**: Smooth color transition
- **Timer Progress**: Width transition every second
- **Modal**: Slide up from bottom with fade overlay

## Testing Scenarios

### Manual Testing Checklist

**✅ Online/Offline Toggle**
- [ ] Toggle starts in offline state
- [ ] Tapping toggle changes to online (green)
- [ ] Success toast appears with correct message
- [ ] Tapping again returns to offline (gray)
- [ ] Bookings clear when going offline
- [ ] Bookings load when going online

**✅ View Mode Toggle**
- [ ] List view is default
- [ ] Tapping "Swipe View" switches to slider mode
- [ ] Tapping "List View" returns to list mode
- [ ] Bookings persist between view changes
- [ ] Active button shows orange background

**✅ List View**
- [ ] Shows all bookings in vertical list
- [ ] Timers count down every second
- [ ] Progress bars update with timer
- [ ] Tapping booking opens detail modal
- [ ] Modal shows correct booking data

**✅ Slider View**
- [ ] Shows top booking as large card
- [ ] Next booking visible behind (stacked)
- [ ] Swiping left removes card (ignore)
- [ ] Swiping right accepts and removes card
- [ ] "IGNORE" label appears on left swipe
- [ ] "ACCEPT" label appears on right swipe
- [ ] Tapping card opens detail modal
- [ ] Shows "All caught up" when no bookings

**✅ Booking Detail Modal**
- [ ] Slides up from bottom
- [ ] Shows passenger name and rating
- [ ] Shows pickup and dropoff locations
- [ ] Shows earnings breakdown
- [ ] Timer continues counting in modal
- [ ] "Close" button dismisses modal
- [ ] "Accept Ride" button accepts booking
- [ ] Modal closes after accepting

**✅ Real-Time Updates**
- [ ] Bookings refresh every 5 seconds when online
- [ ] New bookings appear automatically
- [ ] Expired bookings disappear
- [ ] Timers remain accurate across refreshes

**✅ API Integration**
- [ ] Dashboard stats load on screen load
- [ ] Online status updates on server
- [ ] Booking requests fetch when online
- [ ] Accept booking creates trip assignment
- [ ] Auth token included in all requests
- [ ] Error handling for network failures

## Known Limitations

1. **No Geolocation**: Current implementation doesn't filter by driver location
2. **Fixed Timer**: Assumes 30-second booking expiration (configurable in backend)
3. **No Push Notifications**: Booking updates require manual refresh or polling
4. **No Rejection**: Drivers can only accept or ignore (no explicit reject action)
5. **No Booking History**: Dashboard only shows pending requests
6. **No Navigation**: No map integration for turn-by-turn directions
7. **Mock Data Ready**: Backend expects `bookings` and `trips` collections to be set up

## Future Enhancements

1. **Push Notifications**
   - Real-time booking alerts via FCM/APNs
   - Sound and vibration for new requests
   - Background updates

2. **Geolocation Integration**
   - Filter bookings by distance from driver
   - Show proximity in km
   - Map view of pickup location

3. **Navigation Integration**
   - In-app maps (Google Maps/Apple Maps)
   - Turn-by-turn directions
   - ETA updates

4. **Trip Management**
   - Active trip screen
   - "Start Trip" and "Complete Trip" buttons
   - Trip timeline and status updates

5. **Earnings Analytics**
   - Weekly/monthly earnings graphs
   - Trip history with filters
   - Payout management

6. **Chat System**
   - In-app messaging with passengers
   - Pre-written quick replies
   - Call passenger feature

7. **Smart Matching**
   - Algorithm-based booking assignment
   - Bonus for high-demand areas
   - Driver preferences (distance, fare minimum)

## File Structure

```
DriverNotif/
├── app/
│   ├── (dashboard)/
│   │   └── index.tsx                (NEW - Main dashboard screen)
│   ├── (auth)/
│   │   ├── login.tsx                (UPDATED - Redirects to dashboard)
│   │   └── ...
│   ├── index.tsx                    (UPDATED - Auth check redirects to dashboard)
│   └── _layout.tsx                  (UPDATED - Added dashboard route)
├── components/
│   └── dashboard/
│       ├── BookingListView.tsx      (NEW - List view component)
│       ├── BookingSliderView.tsx    (NEW - Swipe view component)
│       └── BookingDetailModal.tsx   (NEW - Detail modal)
├── services/
│   └── api.ts                       (UPDATED - Added dashboard functions)
└── backend/
    └── app/
        ├── routes/
        │   └── dashboard.py         (NEW - Dashboard endpoints)
        └── main.py                  (UPDATED - Added dashboard router)
```

## Dependencies

### Frontend
- **Existing**: `react-native`, `expo-router`, `@react-native-async-storage/async-storage`, `axios`
- **No new dependencies required**

### Backend
- **Existing**: `fastapi`, `motor`, `pymongo`
- **No new dependencies required**

## Security Considerations

- **JWT Authentication**: All endpoints require valid Bearer token
- **Driver Isolation**: Drivers only see their own stats and available bookings
- **Token Verification**: `verify_token()` validates signature and expiration
- **Race Conditions**: First driver to accept wins (409 for others)
- **Expired Bookings**: Automatic filtering prevents accepting expired requests

---

**Implementation Status**: ✅ Complete and ready for testing
**Next Steps**: Set up mock booking data and test end-to-end flow

Generated with Compyle
