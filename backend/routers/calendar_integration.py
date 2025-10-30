"""
Google Calendar Integration API
Fetches upcoming appointments and provides personalized health recommendations
Based on: appointment type, weather forecast, air quality, user health profile
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import RedirectResponse
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
import os
import logging
import google.generativeai as genai
from services.supabase_client import get_supabase_client
import httpx
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

logger = logging.getLogger(__name__)
router = APIRouter()
supabase = get_supabase_client()

# Google OAuth Configuration
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
GOOGLE_REDIRECT_URI = os.getenv('GOOGLE_REDIRECT_URI', 'http://localhost:3000/calendar/callback')

SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']

# Initialize Gemini for recommendations
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        logger.info("✅ Gemini initialized for calendar recommendations")
    except Exception as e:
        logger.error(f"❌ Failed to initialize Gemini: {e}")
        model = None
else:
    logger.warning("⚠️ GEMINI_API_KEY not found")
    model = None


class CalendarAuth(BaseModel):
    access_token: str
    user_id: str


class AppointmentReminder(BaseModel):
    appointment_id: str
    title: str
    start_time: str
    location: Optional[str]
    description: Optional[str]


@router.get("/calendar/auth/url")
async def get_auth_url() -> Dict[str, str]:
    """
    Generate Google OAuth URL for calendar access
    """
    try:
        if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
            raise HTTPException(
                status_code=500,
                detail="Google OAuth credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables."
            )
        
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [GOOGLE_REDIRECT_URI]
                }
            },
            scopes=SCOPES,
            redirect_uri=GOOGLE_REDIRECT_URI
        )
        
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'
        )
        
        logger.info(f"✅ Generated OAuth URL: {authorization_url}")
        
        return {
            "auth_url": authorization_url,
            "state": state
        }
    except Exception as e:
        logger.error(f"Error generating auth URL: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/calendar/auth/callback")
async def oauth_callback(code: str, state: str, request: Request):
    """
    Handle OAuth callback from Google
    """
    try:
        if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
            raise HTTPException(
                status_code=500,
                detail="Google OAuth credentials not configured"
            )
        
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [GOOGLE_REDIRECT_URI]
                }
            },
            scopes=SCOPES,
            redirect_uri=GOOGLE_REDIRECT_URI
        )
        
        flow.fetch_token(code=code)
        credentials = flow.credentials
        
        # Store credentials (you'll need to associate with user)
        # For now, return the access token to frontend
        
        logger.info("✅ OAuth callback successful")
        
        return {
            "status": "success",
            "access_token": credentials.token,
            "refresh_token": credentials.refresh_token,
            "expiry": credentials.expiry.isoformat() if credentials.expiry else None
        }
    except Exception as e:
        logger.error(f"Error in OAuth callback: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/connect-calendar")
async def connect_calendar(auth: CalendarAuth) -> Dict[str, Any]:
    """
    Store user's Google Calendar access token
    Frontend handles OAuth flow, sends access token here
    """
    try:
        # Store token in database
        result = supabase.table("users")\
            .update({
                "google_calendar_token": auth.access_token,
                "calendar_connected": True,
                "calendar_connected_at": datetime.now().isoformat()
            })\
            .eq("id", auth.user_id)\
            .execute()
        
        logger.info(f"✅ Calendar connected for user {auth.user_id}")
        
        return {
            "status": "success",
            "message": "Calendar connected successfully",
            "connected_at": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error connecting calendar: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/upcoming-appointments/{user_id}")
async def get_upcoming_appointments(
    user_id: str,
    days_ahead: int = 2
) -> Dict[str, Any]:
    """
    Fetch upcoming appointments from Google Calendar
    Returns appointments for next 2 days by default
    """
    try:
        # Get user's calendar token
        user_result = supabase.table("users")\
            .select("google_calendar_token, calendar_connected, location, asthma_severity, health_conditions")\
            .eq("id", user_id)\
            .single()\
            .execute()
        
        if not user_result.data or not user_result.data.get("calendar_connected"):
            return {
                "status": "not_connected",
                "message": "Calendar not connected",
                "appointments": []
            }
        
        access_token = user_result.data.get("google_calendar_token")
        if not access_token:
            return {
                "status": "no_token",
                "message": "No access token found",
                "appointments": []
            }
        
        # Fetch events from Google Calendar API
        now = datetime.utcnow()
        time_min = now.isoformat() + 'Z'
        time_max = (now + timedelta(days=days_ahead)).isoformat() + 'Z'
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                'https://www.googleapis.com/calendar/v3/calendars/primary/events',
                params={
                    'timeMin': time_min,
                    'timeMax': time_max,
                    'singleEvents': True,
                    'orderBy': 'startTime',
                    'maxResults': 10
                },
                headers={
                    'Authorization': f'Bearer {access_token}'
                }
            )
        
        if response.status_code != 200:
            logger.error(f"Google Calendar API error: {response.status_code}")
            return {
                "status": "error",
                "message": "Failed to fetch calendar events",
                "appointments": []
            }
        
        events = response.json().get('items', [])
        
        # Filter appointments that require going somewhere
        appointments = []
        for event in events:
            # Check if event has location or is not an all-day event
            location = event.get('location', '')
            description = event.get('description', '')
            summary = event.get('summary', '')
            
            # Skip all-day events without location
            start = event.get('start', {})
            if 'date' in start and not location:
                continue
            
            appointments.append({
                "id": event.get('id'),
                "title": summary,
                "start_time": start.get('dateTime', start.get('date')),
                "end_time": event.get('end', {}).get('dateTime', event.get('end', {}).get('date')),
                "location": location,
                "description": description,
                "requires_travel": bool(location)
            })
        
        logger.info(f"✅ Found {len(appointments)} appointments for user {user_id}")
        
        return {
            "status": "success",
            "appointments": appointments,
            "total": len(appointments)
        }
        
    except Exception as e:
        logger.error(f"Error fetching appointments: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/appointment-recommendations")
async def get_appointment_recommendations(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate personalized health recommendations for upcoming appointment
    
    Expected data:
    {
        "user_id": "...",
        "appointment": {...},
        "weather_forecast": {...},
        "air_quality": {...}
    }
    """
    try:
        user_id = data.get("user_id")
        appointment = data.get("appointment", {})
        weather = data.get("weather_forecast", {})
        air_quality = data.get("air_quality", {})
        
        # Get user profile
        user_result = supabase.table("users")\
            .select("*")\
            .eq("id", user_id)\
            .single()\
            .execute()
        
        if not user_result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_profile = user_result.data
        
        # Prepare context for AI
        context = prepare_appointment_context(appointment, weather, air_quality, user_profile)
        
        # Generate recommendations using Gemini
        if not model:
            raise HTTPException(status_code=503, detail="AI service not available")
        
        prompt = f"""You are a friendly health assistant helping someone prepare for their appointment.

APPOINTMENT DETAILS:
{context}

Write a warm, helpful reminder about their upcoming appointment. Use simple, everyday language - like you're a caring friend.

Include:

1. **Quick Reminder**: What the appointment is and when
2. **Weather & Air Quality**: What to expect and how to prepare
3. **Health Tips**: Based on their health profile, give 2-3 specific tips for this appointment
4. **What to Bring/Do**: Practical checklist (mask if needed, medications, arrive early if bad traffic, etc.)
5. **Travel Tips**: Best time to leave, route suggestions if air quality is bad

IMPORTANT:
- Be warm and friendly
- Use simple words
- Be specific and practical
- Consider their health conditions
- Keep it short and actionable
- Use emojis to keep it friendly
- Format in markdown

Example structure:
"Hey! Just a heads up about tomorrow 👋

You have [appointment] at [time] at [location].

🌤️ Weather will be [condition]...
🌫️ Air quality is [level]...

Quick tips for you:
- [specific tip based on their health]
- [specific tip based on weather]
- [specific tip based on appointment type]

Don't forget to bring:
- [item 1]
- [item 2]

Safe travels! 💙"
"""
        
        response = model.generate_content(prompt)
        recommendation = response.text
        
        # Save recommendation to database
        try:
            supabase.table("appointment_reminders").insert({
                "user_id": user_id,
                "appointment_id": appointment.get("id"),
                "appointment_title": appointment.get("title"),
                "appointment_time": appointment.get("start_time"),
                "recommendation": recommendation,
                "weather_data": weather,
                "air_quality_data": air_quality,
                "created_at": datetime.now().isoformat()
            }).execute()
        except Exception as e:
            logger.error(f"Failed to save reminder: {e}")
            # Continue anyway
        
        return {
            "status": "success",
            "appointment": appointment,
            "recommendation": recommendation,
            "weather": weather,
            "air_quality": air_quality
        }
        
    except Exception as e:
        logger.error(f"Error generating recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def prepare_appointment_context(
    appointment: Dict,
    weather: Dict,
    air_quality: Dict,
    user_profile: Dict
) -> str:
    """Prepare context string for AI recommendation"""
    
    title = appointment.get("title", "Appointment")
    start_time = appointment.get("start_time", "")
    location = appointment.get("location", "Unknown location")
    description = appointment.get("description", "")
    
    # Parse appointment time
    try:
        appt_time = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
        time_str = appt_time.strftime("%I:%M %p on %A, %B %d")
    except:
        time_str = start_time
    
    # Weather info
    temp = weather.get("temperature", "N/A")
    condition = weather.get("condition", "N/A")
    precipitation = weather.get("precipitation_chance", 0)
    
    # Air quality info
    aqi = air_quality.get("aqi", "N/A")
    pm25 = air_quality.get("pm25", "N/A")
    
    # User health info
    asthma = user_profile.get("asthma_severity", "none")
    conditions = user_profile.get("health_conditions", [])
    age = user_profile.get("age", "N/A")
    
    context = f"""
APPOINTMENT:
- Title: {title}
- Time: {time_str}
- Location: {location}
- Description: {description}

WEATHER FORECAST:
- Temperature: {temp}°F
- Condition: {condition}
- Chance of Rain: {precipitation}%

AIR QUALITY:
- AQI: {aqi}
- PM2.5: {pm25}
- Assessment: {"Good" if aqi < 50 else "Moderate" if aqi < 100 else "Unhealthy for Sensitive Groups" if aqi < 150 else "Unhealthy"}

USER HEALTH PROFILE:
- Age: {age}
- Asthma Severity: {asthma}
- Health Conditions: {', '.join(conditions) if conditions else 'None reported'}
- Sensitive to Air Pollution: {asthma in ['moderate', 'severe'] or 'asthma' in conditions or 'copd' in conditions}
"""
    
    return context


@router.delete("/disconnect-calendar/{user_id}")
async def disconnect_calendar(user_id: str) -> Dict[str, Any]:
    """Disconnect Google Calendar"""
    try:
        supabase.table("users")\
            .update({
                "google_calendar_token": None,
                "calendar_connected": False
            })\
            .eq("id", user_id)\
            .execute()
        
        logger.info(f"✅ Calendar disconnected for user {user_id}")
        
        return {
            "status": "success",
            "message": "Calendar disconnected"
        }
    except Exception as e:
        logger.error(f"Error disconnecting calendar: {e}")
        raise HTTPException(status_code=500, detail=str(e))
