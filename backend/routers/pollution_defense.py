"""
Pollution Defense Protocol Router
Provides personalized pollution defense routines based on real-time AQI data
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import logging
from services.supabase_client import get_supabase_client
import os
import httpx

logger = logging.getLogger(__name__)
router = APIRouter()
supabase = get_supabase_client()

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
PURPLEAIR_API_KEY = os.getenv("PURPLEAIR_API_KEY")


class PollutionDefenseSession(BaseModel):
    user_id: str
    phase: str  # pre_exposure, during_exposure, post_exposure
    aqi: float
    pm25: Optional[float] = None
    o3: Optional[float] = None
    location: Optional[Dict[str, Any]] = None
    checklist_completed: Optional[Dict[str, bool]] = None
    symptoms: Optional[Dict[str, bool]] = None
    notes: Optional[str] = None


class SymptomCheckIn(BaseModel):
    user_id: str
    session_id: str
    cough: bool = False
    wheeze: bool = False
    fatigue: bool = False
    eye_irritation: bool = False
    throat_irritation: bool = False
    overall_feeling: int  # 1-5 scale
    notes: Optional[str] = None


@router.get("/should-activate")
async def should_activate_protocol(user_id: str, lat: float, lon: float):
    """
    Check if pollution defense protocol should be activated based on current AQI
    Returns activation status and current air quality data
    """
    try:
        # Get real-time air quality data
        air_quality = await get_air_quality_data(lat, lon)
        
        if not air_quality:
            return {
                "should_activate": False,
                "reason": "Unable to fetch air quality data",
                "air_quality": None
            }
        
        aqi = air_quality.get("aqi", 0)
        pm25 = air_quality.get("pm25", 0)
        o3 = air_quality.get("o3", 0)
        
        # Activation thresholds
        should_activate = (
            aqi > 100 or 
            pm25 > 35 or 
            o3 > 70
        )
        
        # Get user profile to check if they're in sensitive group
        user_profile = await get_user_sensitivity(user_id)
        
        # Lower threshold for sensitive users
        if user_profile.get("is_sensitive", False):
            should_activate = should_activate or (aqi > 80 or pm25 > 25)
        
        # Get severity level
        severity = get_aqi_severity(aqi)
        
        return {
            "should_activate": should_activate,
            "air_quality": {
                "aqi": aqi,
                "pm25": pm25,
                "o3": o3,
                "no2": air_quality.get("no2", 0),
                "so2": air_quality.get("so2", 0),
                "co": air_quality.get("co", 0),
                "severity": severity,
                "label": get_aqi_label(aqi),
                "location": {
                    "lat": lat,
                    "lon": lon
                }
            },
            "user_sensitivity": user_profile,
            "message": generate_activation_message(aqi, severity, user_profile.get("is_sensitive", False)),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error checking protocol activation: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/session/start")
async def start_session(session: PollutionDefenseSession):
    """
    Start a new pollution defense session
    """
    try:
        session_data = {
            "user_id": session.user_id,
            "phase": session.phase,
            "aqi": session.aqi,
            "pm25": session.pm25,
            "o3": session.o3,
            "location": session.location,
            "checklist_completed": session.checklist_completed or {},
            "started_at": datetime.now().isoformat(),
            "status": "active"
        }
        
        result = supabase.table("pollution_defense_sessions").insert(session_data).execute()
        
        return {
            "status": "success",
            "session_id": result.data[0]["id"],
            "message": "Pollution defense session started",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error starting session: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/session/{session_id}/update")
async def update_session(session_id: str, phase: str, data: Dict[str, Any]):
    """
    Update session with phase completion data
    """
    try:
        update_data = {
            "phase": phase,
            "updated_at": datetime.now().isoformat()
        }
        
        if phase == "during_exposure":
            update_data["walk_started_at"] = data.get("walk_started_at")
            update_data["reminders_shown"] = data.get("reminders_shown", [])
        elif phase == "post_exposure":
            update_data["completed_at"] = datetime.now().isoformat()
            update_data["status"] = "completed"
            update_data["recovery_completed"] = data.get("recovery_completed", {})
        
        result = supabase.table("pollution_defense_sessions")\
            .update(update_data)\
            .eq("id", session_id)\
            .execute()
        
        return {
            "status": "success",
            "message": f"Session updated to {phase}",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error updating session: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/symptom-check")
async def submit_symptom_check(checkin: SymptomCheckIn):
    """
    Submit post-exposure symptom check-in
    """
    try:
        symptom_data = {
            "user_id": checkin.user_id,
            "session_id": checkin.session_id,
            "cough": checkin.cough,
            "wheeze": checkin.wheeze,
            "fatigue": checkin.fatigue,
            "eye_irritation": checkin.eye_irritation,
            "throat_irritation": checkin.throat_irritation,
            "overall_feeling": checkin.overall_feeling,
            "notes": checkin.notes,
            "created_at": datetime.now().isoformat()
        }
        
        result = supabase.table("pollution_defense_symptoms").insert(symptom_data).execute()
        
        # Check if symptoms are severe and user needs alert
        severe_symptoms = checkin.wheeze or (checkin.overall_feeling <= 2)
        
        return {
            "status": "success",
            "symptom_id": result.data[0]["id"],
            "severe_symptoms": severe_symptoms,
            "recommendation": get_symptom_recommendation(checkin),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error submitting symptom check: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/{user_id}")
async def get_user_history(user_id: str, days: int = 30):
    """
    Get user's pollution defense protocol history
    """
    try:
        cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        sessions = supabase.table("pollution_defense_sessions")\
            .select("*")\
            .eq("user_id", user_id)\
            .gte("started_at", cutoff_date)\
            .order("started_at", desc=True)\
            .execute()
        
        symptoms = supabase.table("pollution_defense_symptoms")\
            .select("*")\
            .eq("user_id", user_id)\
            .gte("created_at", cutoff_date)\
            .order("created_at", desc=True)\
            .execute()
        
        return {
            "status": "success",
            "sessions": sessions.data or [],
            "symptoms": symptoms.data or [],
            "total_sessions": len(sessions.data) if sessions.data else 0,
            "period_days": days
        }
        
    except Exception as e:
        logger.error(f"Error fetching history: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recommendations")
async def get_personalized_recommendations(user_id: str, aqi: float):
    """
    Get personalized recommendations based on user profile and current AQI
    """
    try:
        user_profile = await get_user_sensitivity(user_id)
        severity = get_aqi_severity(aqi)
        
        recommendations = {
            "mask_type": get_mask_recommendation(aqi, user_profile),
            "route_advice": get_route_advice(aqi, severity),
            "breathing_strategy": get_breathing_strategy(user_profile),
            "hydration": get_hydration_recommendations(),
            "nutrition": get_nutrition_recommendations(aqi),
            "recovery": get_recovery_recommendations(user_profile),
            "timing": get_timing_recommendations(aqi)
        }
        
        return {
            "status": "success",
            "recommendations": recommendations,
            "severity": severity,
            "aqi": aqi
        }
        
    except Exception as e:
        logger.error(f"Error getting recommendations: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# Helper functions

async def get_air_quality_data(lat: float, lon: float) -> Dict[str, Any]:
    """Fetch real-time air quality data from OpenWeather API"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"http://api.openweathermap.org/data/2.5/air_pollution",
                params={
                    "lat": lat,
                    "lon": lon,
                    "appid": OPENWEATHER_API_KEY
                },
                timeout=10.0
            )
            
            if response.status_code == 200:
                data = response.json()
                components = data["list"][0]["components"]
                aqi = data["list"][0]["main"]["aqi"]
                
                # Convert OpenWeather AQI (1-5) to US AQI (0-500)
                aqi_conversion = {1: 25, 2: 75, 3: 125, 4: 175, 5: 250}
                us_aqi = aqi_conversion.get(aqi, 100)
                
                return {
                    "aqi": us_aqi,
                    "pm25": components.get("pm2_5", 0),
                    "pm10": components.get("pm10", 0),
                    "o3": components.get("o3", 0),
                    "no2": components.get("no2", 0),
                    "so2": components.get("so2", 0),
                    "co": components.get("co", 0)
                }
            
            return None
            
    except Exception as e:
        logger.error(f"Error fetching air quality: {e}")
        return None


async def get_user_sensitivity(user_id: str) -> Dict[str, Any]:
    """Get user sensitivity profile"""
    try:
        result = supabase.table("users").select("*").eq("id", user_id).execute()
        
        if not result.data:
            return {"is_sensitive": False}
        
        user = result.data[0]
        
        # Check if user is in sensitive group
        user_age = user.get("age")
        is_sensitive = (
            user.get("asthma_severity") in ["moderate", "severe"] or
            "asthma" in (user.get("health_conditions") or []) or
            "copd" in (user.get("health_conditions") or []) or
            (user_age is not None and user_age >= 65)
        )
        
        return {
            "is_sensitive": is_sensitive,
            "asthma_severity": user.get("asthma_severity"),
            "health_conditions": user.get("health_conditions", []),
            "age": user.get("age")
        }
        
    except Exception as e:
        logger.error(f"Error getting user sensitivity: {e}")
        return {"is_sensitive": False}


def get_aqi_severity(aqi: float) -> str:
    """Get AQI severity level"""
    if aqi <= 50:
        return "good"
    elif aqi <= 100:
        return "moderate"
    elif aqi <= 150:
        return "unhealthy_sensitive"
    elif aqi <= 200:
        return "unhealthy"
    elif aqi <= 300:
        return "very_unhealthy"
    else:
        return "hazardous"


def get_aqi_label(aqi: float) -> str:
    """Get human-readable AQI label"""
    severity = get_aqi_severity(aqi)
    labels = {
        "good": "Good",
        "moderate": "Moderate",
        "unhealthy_sensitive": "Unhealthy for Sensitive Groups",
        "unhealthy": "Unhealthy",
        "very_unhealthy": "Very Unhealthy",
        "hazardous": "Hazardous"
    }
    return labels.get(severity, "Unknown")


def generate_activation_message(aqi: float, severity: str, is_sensitive: bool) -> str:
    """Generate personalized activation message"""
    if severity == "hazardous" or (is_sensitive and severity == "very_unhealthy"):
        return f"🚨 Air quality is {get_aqi_label(aqi)} (AQI {int(aqi)}). Consider postponing outdoor activity if possible."
    elif severity == "very_unhealthy" or (is_sensitive and severity == "unhealthy"):
        return f"⚠️ Air is {get_aqi_label(aqi)} (AQI {int(aqi)}). Activate Pollution Defense Mode before going out."
    else:
        return f"🌫️ Air is {get_aqi_label(aqi)} (AQI {int(aqi)}). Use Pollution Defense Mode for protection."


def get_mask_recommendation(aqi: float, user_profile: Dict) -> Dict[str, Any]:
    """Get mask recommendations based on AQI and user profile"""
    if aqi > 150 or user_profile.get("is_sensitive"):
        return {
            "type": "N95/N99/FFP2",
            "required": True,
            "fit_check": True,
            "message": "Use a properly fitted N95, N99, or FFP2 mask. Ensure full seal around nose and mouth."
        }
    elif aqi > 100:
        return {
            "type": "N95/KN95",
            "required": True,
            "fit_check": True,
            "message": "Wear an N95 or KN95 mask for protection."
        }
    else:
        return {
            "type": "Optional",
            "required": False,
            "fit_check": False,
            "message": "Mask optional, but recommended for sensitive individuals."
        }


def get_route_advice(aqi: float, severity: str) -> List[str]:
    """Get route planning advice"""
    advice = [
        "Stay 1-2 meters from the curb to reduce exposure by 20-40%",
        "Choose side streets or park edges when possible",
        "Walk on the upwind side of traffic"
    ]
    
    if severity in ["unhealthy", "very_unhealthy", "hazardous"]:
        advice.extend([
            "Avoid rush hour (7-9 AM, 4-6 PM)",
            "Skip areas with idling vehicles or construction",
            "Take frequent indoor breaks if possible"
        ])
    
    return advice


def get_breathing_strategy(user_profile: Dict) -> Dict[str, Any]:
    """Get breathing strategy recommendations"""
    return {
        "primary": "Breathe through your nose, not mouth - nasal passages filter ~30% of particulates",
        "pace": "Keep an easy to moderate pace - avoid deep or rapid breathing",
        "technique": "Use 4-4-4-4 box breathing during rest breaks",
        "warning": "If you feel wheezing or shortness of breath, stop and rest indoors" if user_profile.get("is_sensitive") else None
    }


def get_hydration_recommendations() -> List[Dict[str, str]]:
    """Get hydration recommendations"""
    return [
        {"item": "Water with lemon", "benefit": "Mild antioxidants and hydration prep"},
        {"item": "Green tea (unsweetened)", "benefit": "Polyphenols support antioxidant defense"},
        {"item": "Coconut water", "benefit": "Electrolytes and hydration"}
    ]


def get_nutrition_recommendations(aqi: float) -> Dict[str, Any]:
    """Get nutrition recommendations"""
    return {
        "pre_exposure": [
            {"item": "Orange, kiwi, or berries", "benefit": "Vitamin C + antioxidants"},
            {"item": "Small handful of almonds", "benefit": "Vitamin E for lung protection"}
        ],
        "post_exposure": [
            {"item": "Leafy greens (spinach, kale)", "benefit": "Antioxidants and detox support"},
            {"item": "Fatty fish or chia seeds", "benefit": "Omega-3s reduce inflammation"},
            {"item": "Broccoli or cauliflower", "benefit": "Cruciferous vegetables support liver detox"},
            {"item": "Berries and citrus", "benefit": "High antioxidant content"}
        ],
        "herbal_teas": [
            {"item": "Turmeric-ginger tea", "benefit": "Anti-inflammatory"},
            {"item": "Peppermint tea", "benefit": "Soothes airways"},
            {"item": "Licorice or tulsi tea", "benefit": "Lung support"}
        ]
    }


def get_recovery_recommendations(user_profile: Dict) -> Dict[str, Any]:
    """Get post-exposure recovery recommendations"""
    return {
        "immediate": [
            "Wash face, hands, and hair immediately",
            "Change outer clothes to avoid bringing particles indoors",
            "Rinse eyes with clean water if irritated"
        ],
        "breathing_exercise": {
            "name": "Lung Recovery Routine",
            "duration_min": 3,
            "steps": [
                {"pattern": "Box breathing", "inhale": 4, "hold": 4, "exhale": 4, "hold2": 4, "cycles": 4},
                {"pattern": "Humming breath", "inhale": 3, "exhale": 6, "cycles": 5, "note": "Creates nitric oxide to help airways open"}
            ]
        },
        "environment": [
            "Run HEPA air purifier for 60-120 minutes",
            "Ventilate only if outdoor AQI < 80",
            "Avoid cooking with high heat immediately after exposure"
        ]
    }


def get_timing_recommendations(aqi: float) -> Dict[str, Any]:
    """Get timing recommendations"""
    return {
        "best_times": [
            "Early morning before sunrise (less traffic)",
            "After rain (air is cleaner)",
            "Mid-morning (9-11 AM) if AQI permits"
        ],
        "avoid_times": [
            "Rush hour (7-9 AM, 4-6 PM)",
            "Midday in summer (ozone peaks)",
            "Immediately after construction or road work nearby"
        ],
        "current_advice": "Limit outdoor time to essential activities only" if aqi > 150 else "Keep outdoor activities moderate in duration"
    }


def get_symptom_recommendation(checkin: SymptomCheckIn) -> str:
    """Get recommendation based on symptom check-in"""
    if checkin.wheeze:
        return "⚠️ Wheezing detected. Use your rescue inhaler if prescribed. Consider consulting your doctor if symptoms persist."
    elif checkin.overall_feeling <= 2:
        return "You're not feeling well. Rest indoors, stay hydrated, and monitor symptoms. Seek medical attention if symptoms worsen."
    elif checkin.cough or checkin.throat_irritation:
        return "Mild irritation detected. Drink warm herbal tea, use a humidifier, and avoid further exposure today."
    else:
        return "✅ Good recovery! Continue with hydration and antioxidant-rich meals."
