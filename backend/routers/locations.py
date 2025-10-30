"""
Multiple Locations Management API
Allows users to save and manage multiple locations for air quality monitoring
"""
from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from datetime import datetime
import uuid

from models.schemas import (
    SavedLocation,
    SavedLocationCreate,
    SavedLocationUpdate,
    User
)
from utils.auth_utils import get_current_user
from database import get_db
from utils.logger import setup_logger

router = APIRouter()
logger = setup_logger()

@router.post("/locations", response_model=SavedLocation, status_code=status.HTTP_201_CREATED)
async def create_saved_location(
    location: SavedLocationCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Save a new location for the user
    Maximum 5 locations per user
    """
    db = get_db()
    
    try:
        # Check if user already has 5 locations
        existing = db.table("saved_locations")\
            .select("id")\
            .eq("user_id", current_user.id)\
            .execute()
        
        if len(existing.data) >= 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum 5 locations allowed per user"
            )
        
        # If this is set as primary, unset other primary locations
        if location.is_primary:
            db.table("saved_locations")\
                .update({"is_primary": False})\
                .eq("user_id", current_user.id)\
                .execute()
        
        # Create new location
        location_data = {
            "id": str(uuid.uuid4()),
            "user_id": current_user.id,
            **location.dict(),
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        result = db.table("saved_locations").insert(location_data).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create location"
            )
        
        logger.info(f"Created saved location for user {current_user.id}: {location.name}")
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating saved location: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create location"
        )


@router.get("/locations", response_model=List[SavedLocation])
async def get_saved_locations(current_user: User = Depends(get_current_user)):
    """Get all saved locations for the current user"""
    db = get_db()
    
    try:
        result = db.table("saved_locations")\
            .select("*")\
            .eq("user_id", current_user.id)\
            .order("is_primary", desc=True)\
            .order("created_at")\
            .execute()
        
        return result.data
        
    except Exception as e:
        logger.error(f"Error fetching saved locations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch locations"
        )


@router.get("/locations/{location_id}", response_model=SavedLocation)
async def get_saved_location(
    location_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific saved location"""
    db = get_db()
    
    try:
        result = db.table("saved_locations")\
            .select("*")\
            .eq("id", location_id)\
            .eq("user_id", current_user.id)\
            .execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Location not found"
            )
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching saved location: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch location"
        )


@router.put("/locations/{location_id}", response_model=SavedLocation)
async def update_saved_location(
    location_id: str,
    location_update: SavedLocationUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update a saved location"""
    db = get_db()
    
    try:
        # Verify location belongs to user
        existing = db.table("saved_locations")\
            .select("*")\
            .eq("id", location_id)\
            .eq("user_id", current_user.id)\
            .execute()
        
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Location not found"
            )
        
        # If setting as primary, unset other primary locations
        if location_update.is_primary:
            db.table("saved_locations")\
                .update({"is_primary": False})\
                .eq("user_id", current_user.id)\
                .neq("id", location_id)\
                .execute()
        
        # Update location
        update_data = {
            k: v for k, v in location_update.dict().items() 
            if v is not None
        }
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        result = db.table("saved_locations")\
            .update(update_data)\
            .eq("id", location_id)\
            .eq("user_id", current_user.id)\
            .execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update location"
            )
        
        logger.info(f"Updated saved location {location_id} for user {current_user.id}")
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating saved location: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update location"
        )


@router.delete("/locations/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_saved_location(
    location_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a saved location"""
    db = get_db()
    
    try:
        result = db.table("saved_locations")\
            .delete()\
            .eq("id", location_id)\
            .eq("user_id", current_user.id)\
            .execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Location not found"
            )
        
        logger.info(f"Deleted saved location {location_id} for user {current_user.id}")
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting saved location: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete location"
        )


@router.get("/locations/compare/all")
async def compare_all_locations(current_user: User = Depends(get_current_user)):
    """
    Get air quality data for all saved locations side-by-side
    """
    from routers.air_quality import get_air_quality
    db = get_db()
    
    try:
        # Get all saved locations
        locations_result = db.table("saved_locations")\
            .select("*")\
            .eq("user_id", current_user.id)\
            .execute()
        
        if not locations_result.data:
            return {
                "message": "No saved locations found",
                "locations": []
            }
        
        # Fetch air quality for each location
        comparison_data = []
        for location in locations_result.data:
            try:
                # Get air quality data
                aq_data = await get_air_quality(
                    lat=location["lat"],
                    lon=location["lon"],
                    current_user=current_user
                )
                
                comparison_data.append({
                    "location_id": location["id"],
                    "name": location["name"],
                    "lat": location["lat"],
                    "lon": location["lon"],
                    "is_primary": location["is_primary"],
                    "air_quality": aq_data
                })
            except Exception as e:
                logger.error(f"Error fetching AQ for location {location['name']}: {e}")
                comparison_data.append({
                    "location_id": location["id"],
                    "name": location["name"],
                    "lat": location["lat"],
                    "lon": location["lon"],
                    "is_primary": location["is_primary"],
                    "air_quality": None,
                    "error": str(e)
                })
        
        return {
            "total_locations": len(comparison_data),
            "locations": comparison_data
        }
        
    except Exception as e:
        logger.error(f"Error comparing locations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to compare locations"
        )
