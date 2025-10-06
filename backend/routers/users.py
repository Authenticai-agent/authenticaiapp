from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional, List, Dict, Any

# Import schemas from models
from models.schemas import User, UserUpdate

from utils.auth_utils import get_current_user
from database import get_db, get_admin_db
from utils.logger import setup_logger

router = APIRouter()
logger = setup_logger()

def map_db_to_user_format(db_user_data: dict) -> dict:
    """Map database user format to frontend expected format"""
    mapped_user = db_user_data.copy()
    
    # Map full_name to first_name and last_name
    if "full_name" in db_user_data and db_user_data["full_name"]:
        name_parts = db_user_data["full_name"].split(" ", 1)
        mapped_user["first_name"] = name_parts[0] if len(name_parts) > 0 else ""
        mapped_user["last_name"] = name_parts[1] if len(name_parts) > 1 else ""
    else:
        mapped_user["first_name"] = None
        mapped_user["last_name"] = None
    
    # Map location_lat and location_lon to location object
    if "location_lat" in db_user_data or "location_lon" in db_user_data:
        mapped_user["location"] = {
            "lat": db_user_data.get("location_lat"),
            "lon": db_user_data.get("location_lon"),
            "address": None  # Address not stored in current schema
        }
    else:
        mapped_user["location"] = None
    
    # Use separate fields for allergies, asthma_severity, etc. if they exist
    # Otherwise fall back to health_conditions parsing
    if "allergies" not in db_user_data and "asthma_severity" not in db_user_data:
        # Fallback: Map health_conditions to allergies and asthma_severity
        health_conditions = db_user_data.get("health_conditions", [])
        if isinstance(health_conditions, list):
            # Extract allergies (non-asthma conditions)
            allergies = [c for c in health_conditions if not c.startswith("asthma_severity:")]
            mapped_user["allergies"] = allergies
            
            # Extract asthma severity
            asthma_conditions = [c for c in health_conditions if c.startswith("asthma_severity:")]
            if asthma_conditions:
                mapped_user["asthma_severity"] = asthma_conditions[0].split(":", 1)[1]
            else:
                mapped_user["asthma_severity"] = None
        else:
            mapped_user["allergies"] = []
            mapped_user["asthma_severity"] = None
    
    # Keep age and household_info if they exist in the database
    # Don't override them with None
    
    # Remove database-specific fields that frontend doesn't expect
    fields_to_remove = ["full_name", "location_lat", "location_lon", "health_conditions", "hashed_password"]
    for field in fields_to_remove:
        mapped_user.pop(field, None)
    
    return mapped_user

@router.get("/profile", response_model=User)
async def get_user_profile(current_user: User = Depends(get_current_user)):
    """Get user profile"""
    return current_user


@router.put("/profile")
async def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update user profile"""
    logger.info("Profile update request for user %s", current_user.id)
    logger.info("Update data received: %s", user_update)
    
    db = get_admin_db()  # Use admin client to bypass RLS
    
    try:
        # Filter out None values and empty strings
        update_data = {k: v for k, v in user_update.dict().items() if v is not None and v != ""}
        
        if not update_data:
            # No updates, but still return current user data in expected format
            current_user_dict = current_user.dict()
            return {
                "status": "success",
                "message": "Profile retrieved successfully",
                "user_id": current_user.id,
                "email": current_user.email,
                "profile_data": current_user_dict
            }
        
        # Map frontend field names to database column names
        mapped_data = {}
        
        for key, value in update_data.items():
            if key == "first_name" or key == "last_name":
                # Combine first_name and last_name into full_name
                current_full_name = mapped_data.get("full_name", "")
                if key == "first_name":
                    # If we have last_name in the update, we'll handle it separately
                    last_name = update_data.get("last_name", "")
                    mapped_data["full_name"] = f"{value} {last_name}".strip()
                elif key == "last_name" and "first_name" not in update_data:
                    # Only last_name provided, keep existing first_name if any
                    first_name = update_data.get("first_name", "")
                    mapped_data["full_name"] = f"{first_name} {value}".strip()
            elif key == "location":
                # Map location object to separate lat/lon columns
                if isinstance(value, dict):
                    if value.get("lat") is not None:
                        mapped_data["location_lat"] = value["lat"]
                    if value.get("lon") is not None:
                        mapped_data["location_lon"] = value["lon"]
            elif key == "allergies":
                # Store allergies in separate allergies field
                mapped_data["allergies"] = value
            elif key == "asthma_severity":
                # Store asthma_severity in separate field
                mapped_data["asthma_severity"] = value
            elif key == "triggers":
                # Store triggers in separate field
                mapped_data["triggers"] = value
            elif key == "age":
                # Age field exists in database
                mapped_data["age"] = value
            elif key == "household_info":
                # Household_info field exists in database as JSON
                mapped_data["household_info"] = value
            else:
                # Direct mapping for other fields
                mapped_data[key] = value
        
        # Add timestamp - use current timestamp instead of NOW() function
        from datetime import datetime
        mapped_data["updated_at"] = datetime.utcnow().isoformat()
        
        logger.info("Updating user %s with data: %s", current_user.id, mapped_data)
        
        result = db.table("users").update(mapped_data).eq("id", current_user.id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        updated_user_data = result.data[0]
        
        # Map database fields back to frontend expected format
        mapped_user = map_db_to_user_format(updated_user_data)
        
        # Return format expected by frontend (with profile_data field)
        return {
            "status": "success",
            "message": "Profile updated successfully",
            "user_id": current_user.id,
            "email": current_user.email,
            "profile_data": mapped_user
        }
        
    except Exception as e:
        logger.error("Error updating user profile: %s", e)
        # Return more specific error information
        error_detail = str(e)
        if "column" in error_detail.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid field in update: {error_detail}"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )

@router.delete("/profile")
async def delete_user_account(current_user: User = Depends(get_current_user)):
    """Delete user account"""
    db = get_db()
    
    try:
        # Delete user data (cascade should handle related records)
        result = db.table("users").delete().eq("id", current_user.id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {"message": "Account deleted successfully"}
        
    except Exception as e:
        logger.error("Error deleting user account: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete account"
        )

@router.get("/onboarding-status")
async def get_onboarding_status(current_user: User = Depends(get_current_user)):
    """Check user onboarding completion status"""
    required_fields = ["location", "allergies", "triggers"]
    completed_fields = []
    
    for field in required_fields:
        value = getattr(current_user, field, None)
        if value and (
            (isinstance(value, list) and len(value) > 0) or 
            (isinstance(value, dict) and len(value) > 0)
        ):
            completed_fields.append(field)
    
    is_complete = len(completed_fields) == len(required_fields)
    
    return {
        "is_complete": is_complete,
        "completed_fields": completed_fields,
        "required_fields": required_fields,
        "completion_percentage": (len(completed_fields) / len(required_fields)) * 100
    }
