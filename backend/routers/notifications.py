"""
Smart Push Notifications API
Manages notification settings and sends alerts based on AQI thresholds
"""
from fastapi import APIRouter, HTTPException, Depends, status
from typing import Dict, Any
from datetime import datetime, time, timedelta
import uuid

from models.schemas import (
    NotificationSettings,
    NotificationSettingsCreate,
    NotificationSettingsUpdate,
    User
)
from utils.auth_utils import get_current_user
from database import get_db
from utils.logger import setup_logger

router = APIRouter()
logger = setup_logger()

@router.post("/notifications/settings", response_model=NotificationSettings, status_code=status.HTTP_201_CREATED)
async def create_notification_settings(
    settings: NotificationSettingsCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Create notification settings for the user
    """
    db = get_db()
    
    try:
        # Check if settings already exist
        existing = db.table("notification_settings")\
            .select("id")\
            .eq("user_id", current_user.id)\
            .execute()
        
        if existing.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Notification settings already exist. Use PUT to update."
            )
        
        # Create settings
        settings_data = {
            "id": str(uuid.uuid4()),
            "user_id": current_user.id,
            **settings.dict(),
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        result = db.table("notification_settings").insert(settings_data).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create notification settings"
            )
        
        logger.info(f"Created notification settings for user {current_user.id}")
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating notification settings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create notification settings"
        )


@router.get("/notifications/settings", response_model=NotificationSettings)
async def get_notification_settings(current_user: User = Depends(get_current_user)):
    """
    Get notification settings for the user
    """
    db = get_db()
    
    try:
        result = db.table("notification_settings")\
            .select("*")\
            .eq("user_id", current_user.id)\
            .execute()
        
        if not result.data:
            # Return default settings if none exist
            return {
                "id": None,
                "user_id": current_user.id,
                "aqi_threshold": 100,
                "enabled": True,
                "quiet_hours_start": "22:00",
                "quiet_hours_end": "07:00",
                "max_daily_notifications": 2,
                "created_at": None,
                "updated_at": None
            }
        
        return result.data[0]
        
    except Exception as e:
        logger.error(f"Error fetching notification settings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch notification settings"
        )


@router.put("/notifications/settings", response_model=NotificationSettings)
async def update_notification_settings(
    settings_update: NotificationSettingsUpdate,
    current_user: User = Depends(get_current_user)
):
    """
    Update notification settings for the user
    """
    db = get_db()
    
    try:
        # Check if settings exist
        existing = db.table("notification_settings")\
            .select("*")\
            .eq("user_id", current_user.id)\
            .execute()
        
        if not existing.data:
            # Create default settings first
            default_settings = {
                "id": str(uuid.uuid4()),
                "user_id": current_user.id,
                "aqi_threshold": 100,
                "enabled": True,
                "quiet_hours_start": "22:00",
                "quiet_hours_end": "07:00",
                "max_daily_notifications": 2,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            db.table("notification_settings").insert(default_settings).execute()
            existing = db.table("notification_settings")\
                .select("*")\
                .eq("user_id", current_user.id)\
                .execute()
        
        # Update settings
        update_data = {
            k: v for k, v in settings_update.dict().items() 
            if v is not None
        }
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        result = db.table("notification_settings")\
            .update(update_data)\
            .eq("user_id", current_user.id)\
            .execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update notification settings"
            )
        
        logger.info(f"Updated notification settings for user {current_user.id}")
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating notification settings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update notification settings"
        )


@router.post("/notifications/check")
async def check_and_send_notification(
    lat: float,
    lon: float,
    current_aqi: int,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Check if notification should be sent based on current AQI and user settings
    This endpoint is called by a background job or when AQI is fetched
    """
    db = get_db()
    
    try:
        # Get user's notification settings
        settings_result = db.table("notification_settings")\
            .select("*")\
            .eq("user_id", current_user.id)\
            .execute()
        
        if not settings_result.data:
            return {
                "should_notify": False,
                "reason": "No notification settings configured"
            }
        
        settings = settings_result.data[0]
        
        # Check if notifications are enabled
        if not settings.get("enabled", True):
            return {
                "should_notify": False,
                "reason": "Notifications disabled by user"
            }
        
        # Check if AQI exceeds threshold
        threshold = settings.get("aqi_threshold", 100)
        if current_aqi < threshold:
            return {
                "should_notify": False,
                "reason": f"AQI ({current_aqi}) below threshold ({threshold})"
            }
        
        # Check quiet hours
        now = datetime.now().time()
        quiet_start = time.fromisoformat(settings.get("quiet_hours_start", "22:00"))
        quiet_end = time.fromisoformat(settings.get("quiet_hours_end", "07:00"))
        
        # Handle quiet hours that span midnight
        if quiet_start > quiet_end:
            in_quiet_hours = now >= quiet_start or now <= quiet_end
        else:
            in_quiet_hours = quiet_start <= now <= quiet_end
        
        if in_quiet_hours:
            return {
                "should_notify": False,
                "reason": "Currently in quiet hours"
            }
        
        # Check daily notification limit
        today = datetime.now().strftime('%Y-%m-%d')
        notifications_today = db.table("notification_log")\
            .select("id")\
            .eq("user_id", current_user.id)\
            .gte("sent_at", f"{today}T00:00:00")\
            .execute()
        
        max_daily = settings.get("max_daily_notifications", 2)
        if len(notifications_today.data) >= max_daily:
            return {
                "should_notify": False,
                "reason": f"Daily notification limit reached ({max_daily})"
            }
        
        # Check if we sent a notification recently (within last 12 hours)
        twelve_hours_ago = (datetime.now() - timedelta(hours=12)).isoformat()
        recent_notifications = db.table("notification_log")\
            .select("id")\
            .eq("user_id", current_user.id)\
            .gte("sent_at", twelve_hours_ago)\
            .execute()
        
        if recent_notifications.data:
            return {
                "should_notify": False,
                "reason": "Notification sent within last 12 hours"
            }
        
        # All checks passed - should send notification
        # Log the notification
        log_data = {
            "id": str(uuid.uuid4()),
            "user_id": current_user.id,
            "aqi": current_aqi,
            "lat": lat,
            "lon": lon,
            "sent_at": datetime.utcnow().isoformat()
        }
        
        db.table("notification_log").insert(log_data).execute()
        
        logger.info(f"Notification triggered for user {current_user.id}: AQI {current_aqi}")
        
        return {
            "should_notify": True,
            "reason": f"AQI ({current_aqi}) exceeds threshold ({threshold})",
            "notification": {
                "title": "⚠️ High Air Quality Alert",
                "body": f"Air quality is unhealthy (AQI: {current_aqi}). Consider staying indoors.",
                "aqi": current_aqi,
                "threshold": threshold
            }
        }
        
    except Exception as e:
        logger.error(f"Error checking notification: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check notification"
        )


@router.get("/notifications/history")
async def get_notification_history(
    days: int = 30,
    current_user: User = Depends(get_current_user)
):
    """
    Get notification history for the user
    """
    db = get_db()
    
    try:
        # Calculate start date
        start_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        result = db.table("notification_log")\
            .select("*")\
            .eq("user_id", current_user.id)\
            .gte("sent_at", start_date)\
            .order("sent_at", desc=True)\
            .execute()
        
        return {
            "total_notifications": len(result.data),
            "notifications": result.data
        }
        
    except Exception as e:
        logger.error(f"Error fetching notification history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch notification history"
        )


@router.delete("/notifications/settings", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification_settings(current_user: User = Depends(get_current_user)):
    """
    Delete notification settings (disables all notifications)
    """
    db = get_db()
    
    try:
        db.table("notification_settings")\
            .delete()\
            .eq("user_id", current_user.id)\
            .execute()
        
        logger.info(f"Deleted notification settings for user {current_user.id}")
        return None
        
    except Exception as e:
        logger.error(f"Error deleting notification settings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete notification settings"
        )
