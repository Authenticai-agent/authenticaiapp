"""
Daily Briefing API endpoints
Provides endpoints for daily briefings, educational content, and coaching
Now includes Dynamic Daily Briefings for personalized, adaptive coaching
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from datetime import datetime
from utils.logger import setup_logger
from routers.auth import get_current_user
from models.schemas import User
from services.daily_briefing_engine import daily_briefing_engine
from services.education_engine import education_engine
from services.personalized_action_engine import personalized_action_engine
from services.dynamic_daily_briefing_engine import dynamic_briefing_engine
from services.premium_lean_engine import premium_lean_engine
from services.briefing_history_service import briefing_history_service
from routers.air_quality import AirQualityService, get_air_quality_service
# from services.unified_environmental_engine import unified_environmental_engine  # Temporary disable

logger = setup_logger()
router = APIRouter()

class BriefingRequest(BaseModel):
    include_education: bool = True
    include_coaching: bool = True
    include_actions: bool = True

class SymptomCheckinRequest(BaseModel):
    symptoms: List[str]
    severity: int  # 0-10 scale
    flare_up: bool
    medication_used: bool
    notes: Optional[str] = None

class FeedbackRequest(BaseModel):
    recommendation_id: str
    rating: int  # 1-5 scale
    helpful: bool
    followed: bool
    symptoms_improved: bool
    feedback_text: Optional[str] = None

@router.get("/daily-briefing", response_model=Dict[str, Any])
async def get_daily_briefing(
    current_user: User = Depends(get_current_user),
    air_quality_service: AirQualityService = Depends(get_air_quality_service)
):
    """
    Get daily briefing with education and coaching
    """
    try:
        location = current_user.location
        if not location:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User location not set.")

        # Get environmental data using the same source as dashboard
        environmental_data = await air_quality_service.get_comprehensive_environmental_data(
            location["lat"], location["lon"]
        )
        
        if not environmental_data:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Environmental data unavailable")

        # Create user profile
        user_profile = {
            'age': current_user.age or 30,
            'asthma_severity': current_user.asthma_severity or 'moderate',
            'allergies': current_user.allergies or [],
            'triggers': current_user.triggers or [],
            'household_info': {
                'risks': current_user.household_risks or [],
                'medications': current_user.medications or []
            }
        }

        # Generate daily briefing
        briefing = daily_briefing_engine.generate_daily_briefing(
            environmental_data, user_profile, 50.0, {}  # Default risk score
        )

        # Generate educational insights
        educational_insights = education_engine.generate_educational_insights(
            environmental_data, user_profile
        )

        # Generate personalized actions
        personalized_actions = personalized_action_engine.generate_personalized_actions(
            environmental_data, user_profile, str(current_user.id)
        )

        return {
            "briefing": briefing,
            "educational_insights": educational_insights,
            "personalized_actions": personalized_actions,
            "generated_at": datetime.utcnow().isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating daily briefing: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate daily briefing"
        )

@router.get("/daily-briefing-test", response_model=Dict[str, Any])
async def get_daily_briefing_test(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    air_quality_service: AirQualityService = Depends(get_air_quality_service)
):
    """
    Test endpoint for daily briefing without authentication
    """
    try:
        # Use provided coordinates - no hardcoded location
        location = {"lat": lat, "lon": lon}
        
        # Get environmental data using air quality service
        air_service = get_air_quality_service()
        comprehensive_data = await air_service.get_comprehensive_environmental_data(
            location["lat"], location["lon"]
        )
        
        if not comprehensive_data:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Environmental data unavailable")

        # Create test user profile
        user_profile = {
            'age': 30,
            'asthma_severity': 'moderate',
            'allergies': ['pollen', 'dust'],
            'triggers': ['pm25', 'ozone', 'pollen'],
            'household_info': {
                'risks': ['pets', 'dust'],
                'medications': ['inhaler']
            }
        }

        # Calculate basic risk score (simplified)
        risk_score = 50  # Default moderate risk
        if comprehensive_data.get("air_quality", {}).get("aqi", 0) > 100:
            risk_score = 75
        elif comprehensive_data.get("air_quality", {}).get("pm25", 0) > 35:
            risk_score = 65
        
        # Extract air quality data for compatibility
        environmental_data = {
            'air_quality': comprehensive_data['air_quality'],
            'weather': comprehensive_data['weather'],
            'pollen': comprehensive_data['pollen']
        }
        
        # Generate daily briefing with real risk score
        briefing = daily_briefing_engine.generate_daily_briefing(
            environmental_data, user_profile, risk_analysis['total_risk'], {} 
        )

        # Generate educational insights
        educational_insights = education_engine.generate_educational_insights(
            environmental_data, user_profile
        )

        # Generate personalized actions
        personalized_actions = personalized_action_engine.generate_personalized_actions(
            environmental_data, user_profile, "test_user_123"
        )

        return {
            "briefing": briefing,
            "educational_insights": educational_insights,
            "personalized_actions": personalized_actions,
            "generated_at": datetime.utcnow().isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating test daily briefing: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate test daily briefing"
        )

@router.get("/educational-content", response_model=Dict[str, Any])
async def get_educational_content(
    topic: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """
    Get educational content and micro-lessons
    """
    try:
        # Get user profile
        user_profile = {
            'age': current_user.age or 30,
            'asthma_severity': current_user.asthma_severity or 'moderate',
            'allergies': current_user.allergies or [],
            'triggers': current_user.triggers or []
        }

        # Get educational content
        if topic:
            # Get specific topic information
            topic_info = education_engine.get_knowledge_graph_info('pollutants', topic)
            return {
                "topic_info": topic_info,
                "generated_at": datetime.utcnow().isoformat()
            }
        else:
            # Get general educational content
            educational_content = education_engine.educational_content
            return {
                "micro_lessons": educational_content['micro_lessons'],
                "fact_sheets": educational_content['fact_sheets'],
                "seasonal_guides": educational_content['seasonal_guides'],
                "generated_at": datetime.utcnow().isoformat()
            }

    except Exception as e:
        logger.error(f"Error getting educational content: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get educational content: {str(e)}"
        )

@router.post("/symptom-checkin", response_model=Dict[str, Any])
async def log_symptom_checkin(
    checkin_data: SymptomCheckinRequest,
    current_user: User = Depends(get_current_user),
    air_quality_service: AirQualityService = Depends(get_air_quality_service)
):
    """
    Log user symptom check-in for personalization
    """
    try:
        location = current_user.location
        if not location:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User location not set.")

        # Get environmental data using the same source as dashboard
        environmental_data = await air_quality_service.get_comprehensive_environmental_data(
            location["lat"], location["lon"]
        )

        # Create user profile
        user_profile = {
            'age': current_user.age or 30,
            'asthma_severity': current_user.asthma_severity or 'moderate',
            'allergies': current_user.allergies or [],
            'triggers': current_user.triggers or []
        }

        # Log symptom check-in
        from services.symptom_logging_engine import symptom_logging_engine
        result = symptom_logging_engine.log_symptom_checkin(
            str(current_user.id),
            checkin_data.dict(),
            environmental_data,
            user_profile
        )

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error logging symptom check-in: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to log symptom check-in: {str(e)}"
        )

@router.post("/feedback", response_model=Dict[str, Any])
async def submit_feedback(
    feedback_data: FeedbackRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Submit feedback on recommendations for personalization
    """
    try:
        # Record feedback
        from services.personalized_action_engine import personalized_action_engine
        result = personalized_action_engine.record_user_feedback(
            str(current_user.id),
            feedback_data.recommendation_id,
            feedback_data.dict()
        )

        return result

    except Exception as e:
        logger.error(f"Error submitting feedback: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit feedback: {str(e)}"
        )

@router.get("/user-insights", response_model=Dict[str, Any])
async def get_user_insights(
    current_user: User = Depends(get_current_user)
):
    """
    Get personalized insights and recommendations based on user data
    """
    try:
        # Get user insights from personalized action engine
        from services.personalized_action_engine import personalized_action_engine
        action_insights = personalized_action_engine.get_user_insights(str(current_user.id))

        # Get health summary from symptom logging engine
        from services.symptom_logging_engine import symptom_logging_engine
        health_summary = symptom_logging_engine.get_user_health_summary(str(current_user.id))

        return {
            "action_insights": action_insights,
            "health_summary": health_summary,
            "generated_at": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Error getting user insights: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user insights: {str(e)}"
        )

@router.get("/challenges", response_model=Dict[str, Any])
async def get_personalized_challenges(
    current_user: User = Depends(get_current_user)
):
    """
    Get personalized challenges for user engagement
    """
    try:
        # Create user profile
        user_profile = {
            'age': current_user.age or 30,
            'asthma_severity': current_user.asthma_severity or 'moderate',
            'allergies': current_user.allergies or [],
            'triggers': current_user.triggers or []
        }

        # Get personalized challenges
        from services.engagement_engine import engagement_engine
        challenges = engagement_engine.generate_personalized_challenges(
            str(current_user.id), user_profile
        )

        return challenges

    except Exception as e:
        logger.error(f"Error getting personalized challenges: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get personalized challenges: {str(e)}"
        )

@router.get("/notifications", response_model=Dict[str, Any])
async def get_notifications(
    current_user: User = Depends(get_current_user),
    air_quality_service: AirQualityService = Depends(get_air_quality_service)
):
    """
    Get personalized notifications and alerts
    """
    try:
        location = current_user.location
        if not location:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User location not set.")

        # Get environmental data using the same source as dashboard
        environmental_data = await air_quality_service.get_comprehensive_environmental_data(
            location["lat"], location["lon"]
        )

        # Create user profile
        user_profile = {
            'age': current_user.age or 30,
            'asthma_severity': current_user.asthma_severity or 'moderate',
            'allergies': current_user.allergies or [],
            'triggers': current_user.triggers or []
        }

        # Generate notifications
        from services.engagement_engine import engagement_engine
        notifications = engagement_engine.generate_notifications(
            str(current_user.id), environmental_data, user_profile
        )

        return {
            "notifications": notifications,
            "generated_at": datetime.utcnow().isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting notifications: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get notifications: {str(e)}"
        )

@router.get("/dynamic-briefing", response_model=Dict[str, Any])
async def get_dynamic_briefing(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    air_quality_service: AirQualityService = Depends(get_air_quality_service)
):
    """
    Get Dynamic Daily Briefing - Personalized, adaptive, science-backed
    Every briefing is unique based on live conditions and user profile
    """
    try:
        # Get comprehensive environmental data
        comprehensive_data = await air_quality_service.get_comprehensive_environmental_data(lat, lon)
        
        if not comprehensive_data:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE, 
                detail="Environmental data unavailable"
            )
        
        # Extract environmental data for briefing engine
        environmental_data = {
            'pm25': comprehensive_data.get('air_quality', {}).get('pm25', 0),
            'pm10': comprehensive_data.get('air_quality', {}).get('pm10', 0),
            'ozone': comprehensive_data.get('air_quality', {}).get('ozone', 0),
            'no2': comprehensive_data.get('air_quality', {}).get('no2', 0),
            'so2': comprehensive_data.get('air_quality', {}).get('so2', 0),
            'co': comprehensive_data.get('air_quality', {}).get('co', 0),
            'humidity': comprehensive_data.get('weather', {}).get('humidity', 50),
            'temperature': comprehensive_data.get('weather', {}).get('temperature', 20),
            'wind_speed': comprehensive_data.get('weather', {}).get('wind_speed', 0),
            'pressure': comprehensive_data.get('weather', {}).get('pressure', 1013),
            'pollen_level': (
                comprehensive_data.get('pollen', {}).get('tree', 0) +
                comprehensive_data.get('pollen', {}).get('grass', 0) +
                comprehensive_data.get('pollen', {}).get('weed', 0)
            ) / 3 if comprehensive_data.get('pollen') else 0,
            'uv_index': comprehensive_data.get('uv_index', 0)
        }
        
        # Create dynamic user profile (in production, this comes from database)
        user_profile = {
            'name': 'Alex',  # Would come from authenticated user
            'age': 34,
            'condition': 'moderate asthma',
            'triggers': ['pollen', 'ozone', 'pm25'],
            'fitness_goal': 'daily outdoor run',
            'medication': {'rescue': True, 'controller': True},
            'preferences': {'nutrition': True, 'sleep': True}
        }
        
        # Generate dynamic briefing
        briefing = dynamic_briefing_engine.generate_daily_briefing(
            environmental_data, 
            user_profile
        )
        
        # Get metadata
        metadata = dynamic_briefing_engine.get_briefing_metadata(
            environmental_data,
            user_profile
        )
        
        return {
            "briefing": briefing,
            "metadata": metadata,
            "location": {"lat": lat, "lon": lon},
            "generated_at": datetime.utcnow().isoformat() + 'Z',
            "engine": "dynamic_daily_briefing_v1"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating dynamic briefing: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate dynamic briefing: {str(e)}"
        )

@router.get("/dynamic-briefing-authenticated", response_model=Dict[str, Any])
async def get_dynamic_briefing_authenticated(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    current_user: User = Depends(get_current_user),
    air_quality_service: AirQualityService = Depends(get_air_quality_service)
):
    """
    Get Dynamic Daily Briefing for authenticated user
    Uses user's actual profile and CURRENT selected location
    """
    try:
        # Use the provided lat/lon (current selected location), not user's stored location
        logger.info(f"🔴 Generating briefing for coordinates: lat={lat}, lon={lon}")
        
        # Get comprehensive environmental data
        comprehensive_data = await air_quality_service.get_comprehensive_environmental_data(
            lat, lon
        )
        
        if not comprehensive_data:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Environmental data unavailable"
            )
        
        # Log the actual data being used
        pm25 = comprehensive_data.get('air_quality', {}).get('pm25', 0)
        logger.info(f"🔴 Retrieved PM2.5: {pm25} for lat={lat}, lon={lon}")
        
        # Extract ALL environmental data for comprehensive analysis
        environmental_data = {
            # Location coordinates for timezone calculation
            'lat': lat,
            'lon': lon,
            
            # Air Quality Pollutants
            'pm25': comprehensive_data.get('air_quality', {}).get('pm25', 0),
            'pm10': comprehensive_data.get('air_quality', {}).get('pm10', 0),
            'ozone': comprehensive_data.get('air_quality', {}).get('ozone', 0),
            'no2': comprehensive_data.get('air_quality', {}).get('no2', 0),
            'so2': comprehensive_data.get('air_quality', {}).get('so2', 0),
            'co': comprehensive_data.get('air_quality', {}).get('co', 0),
            'nh3': comprehensive_data.get('air_quality', {}).get('nh3', 0),
            
            # Weather Conditions
            'temperature': comprehensive_data.get('weather', {}).get('temperature', 20),
            'humidity': comprehensive_data.get('weather', {}).get('humidity', 50),
            'pressure': comprehensive_data.get('weather', {}).get('pressure', 1013),
            'wind_speed': comprehensive_data.get('weather', {}).get('wind_speed', 0) * 3.6,  # Convert m/s to km/h
            'wind_direction': comprehensive_data.get('weather', {}).get('wind_direction', 0),
            'visibility': comprehensive_data.get('weather', {}).get('visibility', 10000),
            
            # Pollen - use same calculation as flareup-risk endpoint for consistency
            'pollen_level': {
                'low': 10, 
                'moderate': 30, 
                'high': 60
            }.get(comprehensive_data.get('pollen', {}).get('overall_risk', 'low'), 10),
            
            # UV Index
            'uv_index': comprehensive_data.get('uv_index', 0),
            
            # Precipitation
            'precipitation': comprehensive_data.get('precipitation', {}).get('total_rain_24h_mm', 0),
            
            # Solar/Magnetic Activity
            'solar_wind_speed': comprehensive_data.get('solar_magnetic', {}).get('solar_wind_speed', 0),
            'kp_index': comprehensive_data.get('solar_magnetic', {}).get('kp_index', 0),
            
            # Fire Risk
            'fires_nearby': comprehensive_data.get('forest_fires', {}).get('fires_within_100km', 0),
            'fire_risk_level': comprehensive_data.get('forest_fires', {}).get('fire_risk_level', 'none'),
            
            # PurpleAir VOCs
            'voc_level': comprehensive_data.get('purpleair', {}).get('avg_voc', 0)
        }
        
        # Create user profile from authenticated user
        # Combine first_name and last_name, fallback to email or 'there'
        user_name = 'there'
        if hasattr(current_user, 'first_name') and current_user.first_name:
            user_name = current_user.first_name
            if hasattr(current_user, 'last_name') and current_user.last_name:
                user_name = f"{current_user.first_name} {current_user.last_name}"
        elif hasattr(current_user, 'email') and current_user.email:
            user_name = current_user.email.split('@')[0]
        
        # Debug: Log user attributes to see what we have
        logger.info(f"User attributes: asthma_severity={getattr(current_user, 'asthma_severity', None)}, "
                   f"health_conditions={getattr(current_user, 'health_conditions', None)}, "
                   f"triggers={getattr(current_user, 'triggers', None)}")
        
        # Check both asthma_severity and health_conditions array
        condition = ''
        if hasattr(current_user, 'asthma_severity') and current_user.asthma_severity:
            condition = current_user.asthma_severity
            logger.info(f"✅ Set condition from asthma_severity: '{condition}'")
        elif hasattr(current_user, 'health_conditions') and current_user.health_conditions:
            # Check if asthma is in health_conditions array
            health_conditions = current_user.health_conditions
            if isinstance(health_conditions, list):
                for cond in health_conditions:
                    if 'asthma' in str(cond).lower():
                        condition = cond
                        logger.info(f"✅ Set condition from health_conditions: '{condition}'")
                        break
        
        logger.info(f"📋 Final condition value being passed to engine: '{condition}'")
        
        # Only set triggers if user has them
        triggers = current_user.triggers if hasattr(current_user, 'triggers') and current_user.triggers else []
        
        user_profile = {
            'name': user_name,
            'age': current_user.age or 30,
            'condition': condition,  # Empty string if no condition
            'triggers': triggers,  # Empty list if no triggers
            'fitness_goal': getattr(current_user, 'fitness_goal', 'daily exercise'),
            'medication': {
                'rescue': True,
                'controller': True
            },
            'preferences': {
                'nutrition': True,
                'sleep': True
            },
            'lat': lat,  # Add location for time-based greeting
            'lon': lon
        }
        
        # Generate dynamic briefing
        briefing = dynamic_briefing_engine.generate_daily_briefing(
            environmental_data,
            user_profile
        )
        
        # Get metadata
        metadata = dynamic_briefing_engine.get_briefing_metadata(
            environmental_data,
            user_profile
        )
        
        return {
            "briefing": briefing,
            "metadata": metadata,
            "location": {"lat": lat, "lon": lon},
            "user_id": str(current_user.id),
            "generated_at": datetime.utcnow().isoformat() + 'Z',
            "engine": "dynamic_daily_briefing_v1"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating authenticated dynamic briefing: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate dynamic briefing: {str(e)}"
        )

@router.get("/dynamic-briefing-with-history", response_model=Dict[str, Any])
async def get_dynamic_briefing_with_history(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    time_of_day: str = Query('morning', description="Time of day: morning, midday, or evening"),
    air_quality_service: AirQualityService = Depends(get_air_quality_service)
):
    """
    Get Dynamic Daily Briefing with historical comparison
    Includes yesterday comparison and time-specific insights
    """
    try:
        # Get comprehensive environmental data
        comprehensive_data = await air_quality_service.get_comprehensive_environmental_data(lat, lon)
        
        if not comprehensive_data:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Environmental data unavailable"
            )
        
        # Extract environmental data
        environmental_data = {
            'pm25': comprehensive_data.get('air_quality', {}).get('pm25', 0),
            'pm10': comprehensive_data.get('air_quality', {}).get('pm10', 0),
            'ozone': comprehensive_data.get('air_quality', {}).get('ozone', 0),
            'no2': comprehensive_data.get('air_quality', {}).get('no2', 0),
            'so2': comprehensive_data.get('air_quality', {}).get('so2', 0),
            'co': comprehensive_data.get('air_quality', {}).get('co', 0),
            'humidity': comprehensive_data.get('weather', {}).get('humidity', 50),
            'temperature': comprehensive_data.get('weather', {}).get('temperature', 20),
            'wind_speed': comprehensive_data.get('weather', {}).get('wind_speed', 0),
            'pressure': comprehensive_data.get('weather', {}).get('pressure', 1013),
            'pollen_level': (
                comprehensive_data.get('pollen', {}).get('tree', 0) +
                comprehensive_data.get('pollen', {}).get('grass', 0) +
                comprehensive_data.get('pollen', {}).get('weed', 0)
            ) / 3 if comprehensive_data.get('pollen') else 0,
            'uv_index': comprehensive_data.get('uv_index', 0)
        }
        
        # Create user profile
        user_profile = {
            'name': 'Alex',
            'age': 34,
            'condition': 'moderate asthma',
            'triggers': ['pollen', 'ozone', 'pm25'],
            'fitness_goal': 'daily outdoor run',
            'medication': {'rescue': True, 'controller': True},
            'preferences': {'nutrition': True, 'sleep': True}
        }
        
        # Generate time-specific briefing
        briefing = dynamic_briefing_engine.generate_time_specific_briefing(
            environmental_data,
            user_profile,
            time_of_day
        )
        
        # Get metadata
        metadata = dynamic_briefing_engine.get_briefing_metadata(
            environmental_data,
            user_profile
        )
        
        # Store in history
        user_id = f"user_{lat}_{lon}"
        briefing_history_service.store_briefing(user_id, {
            'briefing': briefing,
            'metadata': metadata,
            'environmental_data': environmental_data
        })
        
        # Get historical comparison
        comparison = briefing_history_service.compare_with_yesterday(user_id, metadata)
        
        # Get weekly trend
        weekly_trend = briefing_history_service.get_weekly_trend(user_id)
        
        return {
            "briefing": briefing,
            "metadata": metadata,
            "time_of_day": time_of_day,
            "historical_comparison": comparison,
            "weekly_trend": weekly_trend,
            "location": {"lat": lat, "lon": lon},
            "generated_at": datetime.utcnow().isoformat(),
            "engine": "dynamic_daily_briefing_v1_enhanced"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating enhanced briefing: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate enhanced briefing: {str(e)}"
        )

@router.get("/briefing-history", response_model=Dict[str, Any])
async def get_briefing_history(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    days: int = Query(7, description="Number of days of history to retrieve")
):
    """
    Get briefing history for trend analysis
    """
    try:
        user_id = f"user_{lat}_{lon}"
        history = briefing_history_service.get_briefing_history(user_id, days)
        
        return {
            "history": history,
            "days_requested": days,
            "days_available": len(history),
            "location": {"lat": lat, "lon": lon}
        }
        
    except Exception as e:
        logger.error(f"Error retrieving briefing history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve briefing history: {str(e)}"
        )
