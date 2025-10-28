"""
Wellness Reports API
Generates weekly and monthly wellness reports with LLM analysis
Uses Gemini 2.5 Flash (same as daily briefing)
NO OpenAI - Gemini only
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List
from datetime import datetime, timedelta
from pydantic import BaseModel
import os
import logging
import google.generativeai as genai

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize Gemini client (same as daily briefing)
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        logger.info("✅ Gemini initialized for wellness reports")
    except Exception as e:
        logger.error(f"❌ Failed to initialize Gemini: {e}")
        model = None
else:
    logger.warning("⚠️ GEMINI_API_KEY not found")
    model = None


class WellnessReport(BaseModel):
    period: str  # "weekly" or "monthly"
    start_date: str
    end_date: str
    user_id: str


@router.post("/generate-report")
async def generate_wellness_report(report_request: WellnessReport) -> Dict[str, Any]:
    """
    Generate a comprehensive wellness report with LLM analysis
    Analyzes: mood, stress, sleep, energy, check-ins, exercises completed
    """
    try:
        # This would normally fetch from database
        # For now, we'll create a structure that works with frontend data
        
        return {
            "status": "success",
            "report_type": report_request.period,
            "period": f"{report_request.start_date} to {report_request.end_date}",
            "message": "Report generation endpoint ready. Frontend will aggregate data and send for analysis."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-wellness-data")
async def analyze_wellness_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyze aggregated wellness data and generate insights using LLM
    
    Expected data structure:
    {
        "period": "weekly" or "monthly",
        "check_ins": [...],
        "mood_data": {...},
        "stress_data": {...},
        "sleep_data": {...},
        "energy_data": {...},
        "exercises_completed": [...],
        "affirmations_completed": int,
        "challenges_completed": int,
        "streak_data": {...}
    }
    """
    try:
        period = data.get("period", "weekly")
        check_ins = data.get("check_ins", [])
        
        # Prepare data summary for LLM
        summary = prepare_data_summary(data)
        
        # Generate LLM analysis
        prompt = f"""You are an empathetic wellness coach analyzing a user's {period} wellness data. 

DATA SUMMARY:
{summary}

Please provide a comprehensive wellness report with:

1. **Overall Wellness Score** (0-100): Based on all metrics
2. **Key Insights**: 3-5 main observations about their wellness patterns
3. **Mood Analysis**: Trends, most common moods, emotional patterns
4. **Stress Patterns**: When stress is highest/lowest, triggers if identifiable
5. **Sleep Quality**: Average quality, consistency, recommendations
6. **Energy Levels**: Patterns throughout the period, correlation with other factors
7. **Positive Highlights**: What they did well, achievements to celebrate
8. **Areas for Improvement**: Specific, actionable suggestions
9. **Personalized Recommendations**: 3-5 tailored action items for next {period}

Be encouraging, specific, and data-driven. Use emojis appropriately. Format in markdown."""

        # Call Gemini API
        if not model:
            raise HTTPException(status_code=503, detail="Gemini AI service not available")
        
        response = model.generate_content(prompt)
        analysis = response.text
        
        return {
            "status": "success",
            "period": period,
            "analysis": analysis,
            "data_summary": summary,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"Error analyzing wellness data: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def prepare_data_summary(data: Dict[str, Any]) -> str:
    """Prepare a text summary of wellness data for LLM analysis"""
    
    check_ins = data.get("check_ins", [])
    period = data.get("period", "weekly")
    
    # Calculate averages and patterns
    total_check_ins = len(check_ins)
    
    if total_check_ins == 0:
        return f"No check-ins recorded during this {period} period."
    
    # Mood analysis
    moods = [c.get("mood", "unknown") for c in check_ins]
    mood_counts = {}
    for mood in moods:
        mood_counts[mood] = mood_counts.get(mood, 0) + 1
    most_common_mood = max(mood_counts, key=mood_counts.get) if mood_counts else "unknown"
    
    # Calculate averages
    avg_mood_intensity = sum(c.get("mood_intensity", 0) for c in check_ins) / total_check_ins
    avg_stress = sum(c.get("stress_level", 0) for c in check_ins) / total_check_ins
    avg_energy = sum(c.get("energy_level", 0) for c in check_ins) / total_check_ins
    avg_sleep = sum(c.get("sleep_quality", 0) for c in check_ins) / total_check_ins
    
    # Streak data
    streak_data = data.get("streak_data", {})
    current_streak = streak_data.get("currentStreak", 0)
    total_badges = len(streak_data.get("badges", []))
    
    # Exercises and activities
    exercises_completed = len(data.get("exercises_completed", []))
    affirmations_completed = data.get("affirmations_completed", 0)
    challenges_completed = data.get("challenges_completed", 0)
    
    summary = f"""
PERIOD: {period.upper()}
TOTAL CHECK-INS: {total_check_ins}

MOOD DATA:
- Most Common Mood: {most_common_mood}
- Average Mood Intensity: {avg_mood_intensity:.1f}/10
- Mood Distribution: {mood_counts}

STRESS LEVELS:
- Average Stress: {avg_stress:.1f}/10
- Pattern: {"High stress period" if avg_stress > 7 else "Moderate stress" if avg_stress > 4 else "Low stress period"}

SLEEP QUALITY:
- Average Sleep Quality: {avg_sleep:.1f}/10
- Assessment: {"Excellent" if avg_sleep > 8 else "Good" if avg_sleep > 6 else "Needs improvement"}

ENERGY LEVELS:
- Average Energy: {avg_energy:.1f}/10
- Pattern: {"High energy" if avg_energy > 7 else "Moderate energy" if avg_energy > 4 else "Low energy"}

ENGAGEMENT:
- Current Streak: {current_streak} days
- Badges Earned: {total_badges}
- Exercises Completed: {exercises_completed}
- Affirmations Completed: {affirmations_completed}
- Challenges Completed: {challenges_completed}

NOTES FROM CHECK-INS:
{format_check_in_notes(check_ins)}
"""
    
    return summary


def format_check_in_notes(check_ins: List[Dict]) -> str:
    """Format user notes from check-ins"""
    notes = []
    for i, check_in in enumerate(check_ins[-5:], 1):  # Last 5 check-ins
        note = check_in.get("notes", "").strip()
        if note:
            date = check_in.get("date", "Unknown date")
            notes.append(f"- {date}: \"{note}\"")
    
    return "\n".join(notes) if notes else "No notes provided"


@router.get("/report-history/{user_id}")
async def get_report_history(user_id: str) -> Dict[str, Any]:
    """
    Get history of generated reports for a user
    """
    # This would fetch from database
    # For now, return structure
    return {
        "status": "success",
        "user_id": user_id,
        "reports": [],
        "message": "Report history endpoint ready"
    }
