"""
Main FastAPI application for HotRide Driver API.
Entry point for the backend server.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.database import (
    connect_to_mongo,
    close_mongo_connection,
    create_indexes
)
from app.routes import registration, auth, dashboard


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    """
    # Startup
    print("=" * 50)
    print("🚀 Starting HotRide Driver API...")
    print("=" * 50)

    try:
        await connect_to_mongo()
        await create_indexes()
        print("✓ Application started successfully")
        print("=" * 50)
    except Exception as e:
        print(f"✗ Failed to start application: {e}")
        raise

    yield

    # Shutdown
    print("\n" + "=" * 50)
    print("🛑 Shutting down HotRide Driver API...")
    await close_mongo_connection()
    print("✓ Application shut down successfully")
    print("=" * 50)


# Create FastAPI application
app = FastAPI(
    title="HotRide Driver API",
    description="API for HotRide driver registration and management",
    version="1.0.0",
    lifespan=lifespan
)


# CORS configuration for React Native app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(
    registration.router,
    prefix=settings.api_v1_prefix,
    tags=["registration"]
)

app.include_router(
    auth.router,
    prefix=f"{settings.api_v1_prefix}/auth",
    tags=["authentication"]
)

app.include_router(
    dashboard.router,
    prefix=f"{settings.api_v1_prefix}/dashboard",
    tags=["dashboard"]
)


# Root health check endpoint
@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "HotRide Driver API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Global health check endpoint."""
    return {
        "status": "healthy",
        "service": "HotRide Driver API",
        "version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    )
