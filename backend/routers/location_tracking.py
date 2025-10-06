"""
Location Tracking Router
Handles automatic location detection and travel-based updates
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging

from routers.auth import get_current_user
from services.location_tracking_service import location_tracking_service
from routers.air_quality import get_air_quality_service
from services.premium_lean_engine import premium_lean_engine

logger = logging.getLogger(__name__)
router = APIRouter(tags=["location_tracking"])

class LocationUpdate(BaseModel):
    lat: float
    lon: float
    accuracy: Optional[float] = None
    timestamp: Optional[datetime] = None

class TravelNotification(BaseModel):
    message: str
    location_change: Dict[str, Any]
    environmental_update: Dict[str, Any]
    risk_change: Dict[str, Any]

@router.post("/update", response_model=Dict[str, Any])
async def update_location(
    location: LocationUpdate,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """
    Update user location and automatically trigger environmental updates if location changed significantly
    This is the main endpoint that frontend calls periodically or when location changes
    """
    try:
        user_id = current_user.get("id")
        
        # Update location and check for significant changes
        location_result = await location_tracking_service.update_user_location(
            user_id=user_id,
            lat=location.lat,
            lon=location.lon,
            timestamp=location.timestamp
        )
        
        response = {
            "status": "success",
            "location_updated": True,
            "location_change_detected": location_result['location_changed'],
            "distance_moved_km": location_result.get('distance_moved_km', 0),
            "travel_mode": location_result.get('travel_mode', 'stationary'),
            "current_location": location_result.get('current_location', {}),
            "requires_environmental_update": location_result['requires_update']
        }
        
        # If significant location change, add environmental update info
        if location_result['location_changed']:
            # Add background task to send notifications
            background_tasks.add_task(
                send_travel_notification,
                user_id,
                location_result
            )
            
            response["travel_detected"] = True
            response["new_city"] = location_result['current_location']['city']
            response["previous_city"] = location_result.get('previous_location', {}).get('city', 'Unknown')
            response["message"] = f"Welcome to {location_result['current_location']['city']}! Getting updated environmental data..."
        
        return response
        
    except Exception as e:
        logger.error(f"Error updating location: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update location"
        )

@router.get("/current", response_model=Dict[str, Any])
async def get_current_location(
    current_user: dict = Depends(get_current_user)
):
    """Get user's current location and travel status"""
    try:
        user_id = current_user.get("id")
        
        current_location = location_tracking_service.get_last_location(user_id)
        is_traveling = location_tracking_service.is_user_traveling(user_id)
        travel_summary = await location_tracking_service.get_travel_summary(user_id)
        
        return {
            "current_location": current_location,
            "is_traveling": is_traveling,
            "travel_summary": travel_summary,
            "last_updated": current_location['timestamp'] if current_location else None
        }
        
    except Exception as e:
        logger.error(f"Error getting current location: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get current location"
        )

@router.get("/history", response_model=List[Dict[str, Any]])
async def get_location_history(
    limit: int = Query(20, description="Number of locations to return"),
    current_user: dict = Depends(get_current_user)
):
    """Get user's location history"""
    try:
        user_id = current_user.get("id")
        history = location_tracking_service.get_location_history(user_id, limit)
        
        return history
        
    except Exception as e:
        logger.error(f"Error getting location history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get location history"
        )

@router.get("/environmental-update", response_model=Dict[str, Any])
async def get_environmental_update_for_current_location(
    current_user: dict = Depends(get_current_user)
):
    """
    Get comprehensive environmental update for user's current location
    This provides fresh air quality, weather, and risk data
    """
    try:
        user_id = current_user.get("id")
        
        # Get current location
        current_location = location_tracking_service.get_last_location(user_id)
        if not current_location:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No location data available. Please update location first."
            )
        
        lat = current_location['lat']
        lon = current_location['lon']
        
        # Get comprehensive environmental data
        air_service = get_air_quality_service()
        comprehensive_data = await air_service.get_comprehensive_environmental_data(lat, lon)
        
        if not comprehensive_data:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Environmental data unavailable for current location"
            )
        
        # Extract and calculate risk
        pollen_risk = comprehensive_data.get('pollen', {}).get('overall_risk', 'low')
        pollen_level = {'low': 10, 'moderate': 30, 'high': 60}.get(pollen_risk, 10)
        
        environmental_data = {
            'pm25': comprehensive_data.get('air_quality', {}).get('pm25', 0),
            'ozone': comprehensive_data.get('air_quality', {}).get('ozone', 0),
            'no2': comprehensive_data.get('air_quality', {}).get('no2', 0),
            'humidity': comprehensive_data.get('weather', {}).get('humidity', 0),
            'temperature': comprehensive_data.get('weather', {}).get('temperature', 0),
            'pollen_level': pollen_level
        }
        
        # Calculate risk for current location
        risk_analysis = premium_lean_engine.calculate_daily_risk_score(environmental_data)
        
        # Generate location-specific briefing
        briefing = premium_lean_engine.generate_premium_briefing(environmental_data, {
            'age': 35,
            'allergies': ['pollen', 'dust'],
            'asthma_severity': 'moderate',
            'triggers': ['pm25', 'pollen']
        })
        
        return {
            "location": current_location,
            "environmental_data": environmental_data,
            "comprehensive_data": comprehensive_data,
            "risk_analysis": risk_analysis,
            "briefing": briefing,
            "updated_at": datetime.utcnow().isoformat(),
            "message": f"Environmental data updated for {current_location['city']}, {current_location['state']}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting environmental update: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get environmental update"
        )

@router.get("/travel-summary", response_model=Dict[str, Any])
async def get_travel_summary(
    current_user: dict = Depends(get_current_user)
):
    """Get comprehensive travel summary for user"""
    try:
        user_id = current_user.get("id")
        travel_summary = await location_tracking_service.get_travel_summary(user_id)
        
        return travel_summary
        
    except Exception as e:
        logger.error(f"Error getting travel summary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get travel summary"
        )

@router.post("/trigger-environmental-update", response_model=Dict[str, Any])
async def trigger_location_environmental_update(
    location_data: Dict[str, Any]
):
    """
    Trigger immediate environmental update when user changes location
    Used by development location tester and can be called manually
    """
    try:
        user_id = "dev_test_user"
        lat = location_data.get("lat")
        lon = location_data.get("lon")
        
        if not lat or not lon:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Latitude and longitude are required"
            )
        
        # Update location
        location_result = await location_tracking_service.update_user_location(
            user_id=user_id,
            lat=lat,
            lon=lon
        )
        
        # Get environmental update
        air_service = get_air_quality_service()
        comprehensive_data = await air_service.get_comprehensive_environmental_data(lat, lon)
        
        if comprehensive_data:
            pollen_risk = comprehensive_data.get('pollen', {}).get('overall_risk', 'low')
            pollen_level = {'low': 10, 'moderate': 30, 'high': 60}.get(pollen_risk, 10)
            
            environmental_data = {
                'pm25': comprehensive_data.get('air_quality', {}).get('pm25', 0),
                'ozone': comprehensive_data.get('air_quality', {}).get('ozone', 0),
                'no2': comprehensive_data.get('air_quality', {}).get('no2', 0),
                'humidity': comprehensive_data.get('weather', {}).get('humidity', 0),
                'temperature': comprehensive_data.get('weather', {}).get('temperature', 0),
                'pollen_level': pollen_level
            }
            
            risk_analysis = premium_lean_engine.calculate_daily_risk_score(environmental_data)
            
            return {
                "status": "success",
                "location_updated": True,
                "environmental_data_updated": True,
                "location": location_result.get('current_location', {}),
                "risk_score": risk_analysis['risk_score'],
                "risk_level": risk_analysis['risk_level'],
                "message": f"Location and environmental data updated successfully"
            }
        else:
            return {
                "status": "partial_success",
                "location_updated": True,
                "environmental_data_updated": False,
                "message": "Location updated but environmental data unavailable"
            }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error triggering environmental update: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to trigger environmental update"
        )

async def send_travel_notification(user_id: str, location_result: Dict[str, Any]):
    """Background task to send travel notifications"""
    try:
        current_location = location_result['current_location']
        previous_location = location_result.get('previous_location', {})
        
        # In production, this would send push notifications, emails, etc.
        logger.info(f"Travel notification for user {user_id}: "
                   f"Moved from {previous_location.get('city', 'Unknown')} "
                   f"to {current_location['city']} "
                   f"({location_result['distance_moved_km']:.1f}km)")
        
        # Here you would integrate with notification services like:
        # - Push notifications (Firebase, Apple Push, etc.)
        # - Email notifications
        # - In-app notifications
        # - SMS alerts for critical health risks
        
    except Exception as e:
        logger.error(f"Error sending travel notification: {e}")
