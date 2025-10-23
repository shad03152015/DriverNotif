"""
Dashboard routes for driver statistics and booking requests.
"""

from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends, Header
from app.utils.security import verify_token
from app.database import get_drivers_collection, get_database
from bson import ObjectId

router = APIRouter()


async def get_current_driver(authorization: str = Header(None)):
    """
    Get current authenticated driver from JWT token.

    Args:
        authorization: Authorization header with Bearer token

    Returns:
        dict: Driver document

    Raises:
        HTTPException: If token invalid or driver not found
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header"
        )

    token = authorization.replace("Bearer ", "")
    payload = verify_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    driver_id = payload.get("driver_id")
    if not driver_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )

    collection = get_drivers_collection()
    try:
        driver = await collection.find_one({"_id": ObjectId(driver_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid driver ID"
        )

    if not driver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Driver not found"
        )

    return driver


@router.get("/stats")
async def get_dashboard_stats(driver: dict = Depends(get_current_driver)):
    """
    Get driver dashboard statistics.

    Returns today's earnings and trips completed.

    Args:
        driver: Current authenticated driver

    Returns:
        dict: Dashboard statistics
    """
    try:
        db = get_database()
        trips_collection = db.trips

        # Get today's date range
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timedelta(days=1)

        # Query trips for today
        today_trips = await trips_collection.find({
            "driver_id": str(driver["_id"]),
            "status": "completed",
            "completed_at": {
                "$gte": today_start,
                "$lt": today_end
            }
        }).to_list(length=None)

        # Calculate total earnings
        today_earnings = sum(trip.get("fare", 0) for trip in today_trips)
        trips_completed = len(today_trips)

        return {
            "success": True,
            "today_earnings": today_earnings,
            "trips_completed": trips_completed,
            "driver_id": str(driver["_id"]),
            "driver_name": f"{driver['first_name']} {driver['surname']}",
            "is_online": driver.get("is_online", False)
        }

    except Exception as e:
        print(f"Dashboard stats error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve dashboard statistics"
        )


@router.post("/online-status")
async def update_online_status(
    request: dict,
    driver: dict = Depends(get_current_driver)
):
    """
    Update driver's online/offline status.

    Args:
        request: Request body with is_online boolean
        driver: Current authenticated driver

    Returns:
        dict: Success response
    """
    try:
        is_online = request.get("is_online", False)

        collection = get_drivers_collection()
        await collection.update_one(
            {"_id": driver["_id"]},
            {
                "$set": {
                    "is_online": is_online,
                    "last_online_update": datetime.utcnow()
                }
            }
        )

        return {
            "success": True,
            "message": f"Status updated to {'online' if is_online else 'offline'}",
            "is_online": is_online
        }

    except Exception as e:
        print(f"Update online status error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update online status"
        )


@router.get("/booking-requests")
async def get_booking_requests(driver: dict = Depends(get_current_driver)):
    """
    Get pending booking requests for the driver.

    Only returns bookings if driver is online and within reasonable distance.

    Args:
        driver: Current authenticated driver

    Returns:
        dict: List of booking requests
    """
    try:
        # Check if driver is online
        if not driver.get("is_online", False):
            return {
                "success": True,
                "bookings": [],
                "message": "Driver is offline"
            }

        db = get_database()
        bookings_collection = db.bookings

        # Get pending bookings (not yet assigned, not expired)
        now = datetime.utcnow()
        bookings = await bookings_collection.find({
            "status": "pending",
            "assigned_driver_id": None,
            "expires_at": {"$gt": now}
        }).sort("created_at", 1).limit(10).to_list(length=10)

        # Format bookings for response
        formatted_bookings = []
        for booking in bookings:
            formatted_bookings.append({
                "id": str(booking["_id"]),
                "fare": booking.get("fare", 0),
                "distance": booking.get("distance", 0),
                "pickup_location": booking.get("pickup_location", ""),
                "dropoff_location": booking.get("dropoff_location", ""),
                "passenger_name": booking.get("passenger_name", "Unknown"),
                "passenger_phone": booking.get("passenger_phone"),
                "passenger_rating": booking.get("passenger_rating", 5.0),
                "expires_at": booking.get("expires_at").isoformat() if booking.get("expires_at") else None,
                "created_at": booking.get("created_at").isoformat() if booking.get("created_at") else None,
                "estimated_duration": booking.get("estimated_duration", 15)
            })

        return {
            "success": True,
            "bookings": formatted_bookings,
            "count": len(formatted_bookings)
        }

    except Exception as e:
        print(f"Get booking requests error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve booking requests"
        )


@router.post("/bookings/{booking_id}/accept")
async def accept_booking(
    booking_id: str,
    driver: dict = Depends(get_current_driver)
):
    """
    Accept a booking request.

    Args:
        booking_id: Booking ID to accept
        driver: Current authenticated driver

    Returns:
        dict: Success response with booking details
    """
    try:
        db = get_database()
        bookings_collection = db.bookings

        # Find the booking
        try:
            booking = await bookings_collection.find_one({"_id": ObjectId(booking_id)})
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid booking ID"
            )

        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )

        # Check if booking is still available
        if booking.get("status") != "pending":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Booking is no longer available"
            )

        if booking.get("assigned_driver_id"):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Booking already assigned to another driver"
            )

        # Check if booking expired
        if booking.get("expires_at") and booking["expires_at"] < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail="Booking request has expired"
            )

        # Assign booking to driver
        await bookings_collection.update_one(
            {"_id": ObjectId(booking_id)},
            {
                "$set": {
                    "assigned_driver_id": str(driver["_id"]),
                    "driver_name": f"{driver['first_name']} {driver['surname']}",
                    "status": "accepted",
                    "accepted_at": datetime.utcnow()
                }
            }
        )

        # Update driver status (mark as busy)
        collection = get_drivers_collection()
        await collection.update_one(
            {"_id": driver["_id"]},
            {
                "$set": {
                    "current_booking_id": booking_id,
                    "is_busy": True
                }
            }
        )

        return {
            "success": True,
            "message": "Booking accepted successfully",
            "booking_id": booking_id,
            "pickup_location": booking.get("pickup_location"),
            "passenger_name": booking.get("passenger_name"),
            "passenger_phone": booking.get("passenger_phone"),
            "fare": booking.get("fare")
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Accept booking error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to accept booking"
        )


@router.get("/health")
async def health_check():
    """Health check endpoint for dashboard service."""
    return {"status": "healthy", "service": "Dashboard API"}
