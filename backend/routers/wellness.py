"""
Wellness & Mental Health Router
Handles emotional check-ins, AI-powered self-care, and environmental mood tracking
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
import os
import google.generativeai as genai

router = APIRouter()

# Configure Gemini AI
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# ============================================================================
# MODELS
# ============================================================================

class EmotionalCheckIn(BaseModel):
    user_id: str
    mood: str  # happy, sad, anxious, stressed, calm, energetic, tired, angry
    mood_intensity: int  # 1-10 scale
    energy_level: int  # 1-10 scale
    stress_level: int  # 1-10 scale
    sleep_quality: Optional[int] = None  # 1-10 scale
    physical_symptoms: Optional[List[str]] = []  # headache, fatigue, tension, etc.
    notes: Optional[str] = None
    location: Optional[Dict[str, float]] = None  # {lat, lon}

class SelfCareRequest(BaseModel):
    user_id: str
    current_mood: str
    mood_intensity: int
    stress_level: int
    energy_level: int
    available_time_minutes: int  # How much time user has for self-care
    location_type: Optional[str] = "home"  # home, work, outdoor, etc.
    environmental_data: Optional[Dict[str, Any]] = None  # Air quality, weather, etc.

# ============================================================================
# EMOTIONAL CHECK-IN ENDPOINTS
# ============================================================================

@router.post("/check-in")
async def create_emotional_checkin(checkin: EmotionalCheckIn):
    """
    Record daily emotional check-in with mood, energy, stress levels
    """
    try:
        from database import get_db_connection
        
        conn = get_db_connection()
        if not conn:
            # Demo mode - return success without saving
            return {
                "status": "success",
                "message": "Check-in recorded (demo mode)",
                "checkin_id": f"demo_{datetime.now().timestamp()}",
                "timestamp": datetime.now().isoformat()
            }
        
        cursor = conn.cursor()
        
        # Create wellness_checkins table if not exists
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS wellness_checkins (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                mood VARCHAR(50) NOT NULL,
                mood_intensity INTEGER NOT NULL,
                energy_level INTEGER NOT NULL,
                stress_level INTEGER NOT NULL,
                sleep_quality INTEGER,
                physical_symptoms TEXT[],
                notes TEXT,
                location_lat FLOAT,
                location_lon FLOAT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Insert check-in
        cursor.execute("""
            INSERT INTO wellness_checkins 
            (user_id, mood, mood_intensity, energy_level, stress_level, 
             sleep_quality, physical_symptoms, notes, location_lat, location_lon)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, created_at
        """, (
            checkin.user_id,
            checkin.mood,
            checkin.mood_intensity,
            checkin.energy_level,
            checkin.stress_level,
            checkin.sleep_quality,
            checkin.physical_symptoms,
            checkin.notes,
            checkin.location.get('lat') if checkin.location else None,
            checkin.location.get('lon') if checkin.location else None
        ))
        
        result = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            "status": "success",
            "message": "Check-in recorded successfully",
            "checkin_id": result[0],
            "timestamp": result[1].isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record check-in: {str(e)}")


@router.get("/check-in/history/{user_id}")
async def get_checkin_history(
    user_id: str,
    days: int = Query(30, description="Number of days to retrieve")
):
    """
    Get user's emotional check-in history
    """
    try:
        from database import get_db_connection
        
        conn = get_db_connection()
        if not conn:
            # Demo mode - return sample data
            return {
                "user_id": user_id,
                "period_days": days,
                "total_checkins": 15,
                "checkins": [
                    {
                        "date": (datetime.now() - timedelta(days=i)).isoformat(),
                        "mood": ["happy", "calm", "anxious", "stressed"][i % 4],
                        "mood_intensity": 7 - (i % 3),
                        "energy_level": 6 + (i % 3),
                        "stress_level": 5 - (i % 4)
                    }
                    for i in range(min(days, 15))
                ]
            }
        
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, mood, mood_intensity, energy_level, stress_level,
                   sleep_quality, physical_symptoms, notes, created_at
            FROM wellness_checkins
            WHERE user_id = %s 
            AND created_at >= NOW() - INTERVAL '%s days'
            ORDER BY created_at DESC
        """, (user_id, days))
        
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        
        checkins = []
        for row in rows:
            checkins.append({
                "id": row[0],
                "mood": row[1],
                "mood_intensity": row[2],
                "energy_level": row[3],
                "stress_level": row[4],
                "sleep_quality": row[5],
                "physical_symptoms": row[6],
                "notes": row[7],
                "timestamp": row[8].isoformat()
            })
        
        return {
            "user_id": user_id,
            "period_days": days,
            "total_checkins": len(checkins),
            "checkins": checkins
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get check-in history: {str(e)}")


@router.get("/check-in/trends/{user_id}")
async def get_mood_trends(user_id: str, days: int = Query(30, description="Analysis period")):
    """
    Analyze mood trends over time
    """
    try:
        from database import get_db_connection
        
        conn = get_db_connection()
        if not conn:
            # Demo mode
            return {
                "user_id": user_id,
                "period_days": days,
                "trends": {
                    "average_mood_intensity": 6.5,
                    "average_energy": 7.2,
                    "average_stress": 4.8,
                    "most_common_mood": "calm",
                    "mood_volatility": "moderate",
                    "improvement_trend": "positive"
                }
            }
        
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                AVG(mood_intensity) as avg_mood,
                AVG(energy_level) as avg_energy,
                AVG(stress_level) as avg_stress,
                MODE() WITHIN GROUP (ORDER BY mood) as common_mood,
                STDDEV(mood_intensity) as mood_volatility
            FROM wellness_checkins
            WHERE user_id = %s 
            AND created_at >= NOW() - INTERVAL '%s days'
        """, (user_id, days))
        
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        
        return {
            "user_id": user_id,
            "period_days": days,
            "trends": {
                "average_mood_intensity": round(result[0], 1) if result[0] else None,
                "average_energy": round(result[1], 1) if result[1] else None,
                "average_stress": round(result[2], 1) if result[2] else None,
                "most_common_mood": result[3],
                "mood_volatility": "high" if result[4] and result[4] > 2 else "moderate" if result[4] and result[4] > 1 else "low"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze trends: {str(e)}")


# ============================================================================
# AI-POWERED SELF-CARE RECOMMENDATIONS
# ============================================================================

@router.post("/self-care/recommendations")
async def get_selfcare_recommendations(request: SelfCareRequest):
    """
    Get AI-powered personalized self-care recommendations
    Based on current mood, stress, energy, and environmental factors
    """
    try:
        # Build context for AI
        context = f"""
You are a compassionate wellness coach. Provide personalized self-care recommendations.

Current User State:
- Mood: {request.current_mood} (intensity: {request.mood_intensity}/10)
- Stress Level: {request.stress_level}/10
- Energy Level: {request.energy_level}/10
- Available Time: {request.available_time_minutes} minutes
- Location: {request.location_type}
"""
        
        # Add environmental context if available
        if request.environmental_data:
            aqi = request.environmental_data.get('aqi', 'unknown')
            weather = request.environmental_data.get('weather', {})
            temp = weather.get('temperature', 'unknown')
            
            context += f"""
Environmental Conditions:
- Air Quality Index: {aqi}
- Temperature: {temp}°C
- Weather: {weather.get('description', 'unknown')}
"""
        
        context += """
Provide 3-5 specific, actionable self-care recommendations that:
1. Match the user's current emotional state
2. Fit within their available time
3. Consider their location and environment
4. Are evidence-based and practical

Format as JSON:
{
  "recommendations": [
    {
      "title": "Activity name",
      "duration_minutes": number,
      "category": "breathing|movement|mindfulness|social|creative|rest",
      "description": "Clear instructions",
      "why_helpful": "Brief explanation",
      "difficulty": "easy|moderate|challenging"
    }
  ],
  "priority_focus": "What to prioritize based on their state",
  "encouragement": "Supportive message"
}
"""
        
        # Call Gemini AI
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(context)
        
        # Parse AI response
        import json
        ai_text = response.text.strip()
        
        # Extract JSON from markdown code blocks if present
        if "```json" in ai_text:
            ai_text = ai_text.split("```json")[1].split("```")[0].strip()
        elif "```" in ai_text:
            ai_text = ai_text.split("```")[1].split("```")[0].strip()
        
        recommendations = json.loads(ai_text)
        
        return {
            "status": "success",
            "user_state": {
                "mood": request.current_mood,
                "stress_level": request.stress_level,
                "energy_level": request.energy_level
            },
            "recommendations": recommendations.get("recommendations", []),
            "priority_focus": recommendations.get("priority_focus", ""),
            "encouragement": recommendations.get("encouragement", "Take care of yourself today! 💚")
        }
        
    except Exception as e:
        # Fallback recommendations if AI fails
        fallback = get_fallback_recommendations(request)
        return fallback


def get_fallback_recommendations(request: SelfCareRequest) -> Dict[str, Any]:
    """Fallback recommendations if AI is unavailable"""
    
    recommendations = []
    
    # High stress recommendations
    if request.stress_level >= 7:
        recommendations.append({
            "title": "4-7-8 Breathing Exercise",
            "duration_minutes": 5,
            "category": "breathing",
            "description": "Breathe in for 4 counts, hold for 7, exhale for 8. Repeat 4 times.",
            "why_helpful": "Activates your parasympathetic nervous system to reduce stress",
            "difficulty": "easy"
        })
    
    # Low energy recommendations
    if request.energy_level <= 4:
        recommendations.append({
            "title": "10-Minute Power Nap",
            "duration_minutes": 10,
            "category": "rest",
            "description": "Find a quiet spot, set a timer for 10 minutes, and rest your eyes.",
            "why_helpful": "Short naps boost alertness and cognitive performance",
            "difficulty": "easy"
        })
    
    # General wellness
    recommendations.append({
        "title": "Mindful Walk",
        "duration_minutes": min(15, request.available_time_minutes),
        "category": "movement",
        "description": "Walk slowly, notice your surroundings, focus on your breath.",
        "why_helpful": "Combines movement, mindfulness, and nature exposure",
        "difficulty": "easy"
    })
    
    return {
        "status": "success",
        "user_state": {
            "mood": request.current_mood,
            "stress_level": request.stress_level,
            "energy_level": request.energy_level
        },
        "recommendations": recommendations[:3],
        "priority_focus": "Focus on stress reduction and energy restoration",
        "encouragement": "Small steps lead to big changes. You've got this! 💚"
    }


# ============================================================================
# ENVIRONMENTAL MOOD TRACKING
# ============================================================================

@router.get("/mood/environmental-correlation/{user_id}")
async def analyze_environmental_mood_correlation(
    user_id: str,
    days: int = Query(30, description="Analysis period")
):
    """
    Analyze correlation between environmental factors and mood
    """
    try:
        from database import get_db_connection
        
        conn = get_db_connection()
        if not conn:
            # Demo mode
            return {
                "user_id": user_id,
                "period_days": days,
                "correlations": {
                    "air_quality_impact": {
                        "correlation": "moderate_negative",
                        "insight": "Your mood tends to be 15% lower on high AQI days"
                    },
                    "weather_impact": {
                        "best_weather": "sunny, 20-25°C",
                        "insight": "You feel most energetic on sunny days with moderate temperature"
                    },
                    "seasonal_pattern": {
                        "pattern": "consistent",
                        "insight": "Your mood is relatively stable across seasons"
                    }
                },
                "recommendations": [
                    "Check air quality before outdoor activities",
                    "Consider indoor exercise on high pollution days",
                    "Maximize outdoor time on good air quality days"
                ]
            }
        
        cursor = conn.cursor()
        
        # Get check-ins with location data
        cursor.execute("""
            SELECT 
                wc.mood_intensity,
                wc.energy_level,
                wc.stress_level,
                wc.location_lat,
                wc.location_lon,
                wc.created_at
            FROM wellness_checkins wc
            WHERE wc.user_id = %s 
            AND wc.created_at >= NOW() - INTERVAL '%s days'
            AND wc.location_lat IS NOT NULL
            ORDER BY wc.created_at DESC
        """, (user_id, days))
        
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Analyze patterns (simplified for now)
        if len(rows) < 5:
            return {
                "user_id": user_id,
                "message": "Not enough data yet. Keep logging check-ins!",
                "checkins_needed": 5 - len(rows)
            }
        
        avg_mood = sum(row[0] for row in rows) / len(rows)
        avg_energy = sum(row[1] for row in rows) / len(rows)
        avg_stress = sum(row[2] for row in rows) / len(rows)
        
        return {
            "user_id": user_id,
            "period_days": days,
            "total_datapoints": len(rows),
            "averages": {
                "mood_intensity": round(avg_mood, 1),
                "energy_level": round(avg_energy, 1),
                "stress_level": round(avg_stress, 1)
            },
            "insight": "Continue tracking to discover personalized patterns between your mood and environment"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze correlations: {str(e)}")


@router.get("/mood/insights/{user_id}")
async def get_personalized_insights(user_id: str):
    """
    Get AI-powered personalized wellness insights
    """
    try:
        # Get recent check-in history
        from database import get_db_connection
        
        conn = get_db_connection()
        if not conn:
            return {
                "insights": [
                    "Your stress levels tend to peak on weekdays - consider scheduling self-care breaks",
                    "You report better sleep quality after evening walks",
                    "Your energy is highest in the morning - schedule important tasks then"
                ],
                "action_items": [
                    "Try a 5-minute breathing exercise when stress reaches 7+",
                    "Aim for 7-8 hours of sleep for optimal mood",
                    "Check air quality before outdoor activities"
                ]
            }
        
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT mood, mood_intensity, energy_level, stress_level, 
                   sleep_quality, created_at
            FROM wellness_checkins
            WHERE user_id = %s 
            AND created_at >= NOW() - INTERVAL '30 days'
            ORDER BY created_at DESC
            LIMIT 30
        """, (user_id,))
        
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        
        if len(rows) < 5:
            return {
                "message": "Keep tracking! We'll provide insights after 5+ check-ins",
                "checkins_count": len(rows)
            }
        
        # Generate insights using AI
        context = f"""
Analyze this user's wellness data and provide 3-5 actionable insights.

Recent Check-ins ({len(rows)} entries):
"""
        
        for row in rows[:10]:  # Last 10 check-ins
            context += f"- {row[5].strftime('%Y-%m-%d')}: Mood={row[0]} ({row[1]}/10), Energy={row[2]}/10, Stress={row[3]}/10, Sleep={row[4]}/10\n"
        
        context += """
Provide insights as JSON:
{
  "insights": ["insight 1", "insight 2", "insight 3"],
  "action_items": ["action 1", "action 2", "action 3"]
}
"""
        
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(context)
        
        import json
        ai_text = response.text.strip()
        if "```json" in ai_text:
            ai_text = ai_text.split("```json")[1].split("```")[0].strip()
        
        insights = json.loads(ai_text)
        
        return insights
        
    except Exception as e:
        # Fallback insights
        return {
            "insights": [
                "Continue tracking your mood daily to discover patterns",
                "Notice how sleep quality affects your next-day energy",
                "Pay attention to environmental factors on high-stress days"
            ],
            "action_items": [
                "Set a daily reminder for emotional check-ins",
                "Try one self-care activity when stress is high",
                "Track sleep quality to identify patterns"
            ]
        }
