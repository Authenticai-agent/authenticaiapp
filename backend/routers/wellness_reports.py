"""
Wellness Reports API
Generates weekly and monthly wellness reports with LLM analysis
Uses Gemini 2.5 Flash (same as daily briefing)
NO OpenAI - Gemini only
Stores reports in Supabase: FREE (4 weekly + 2 monthly), PAID (12 weekly + 6 monthly)
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
import os
import logging
import google.generativeai as genai
from services.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)
router = APIRouter()
supabase = get_supabase_client()

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
        prompt = f"""You are a friendly wellness coach talking to a friend about their {period} wellness journey.

DATA SUMMARY:
{summary}

Write a warm, easy-to-understand wellness report. Use simple everyday language - like you're talking to a friend over coffee. Avoid fancy words like "noteworthy", "optimal", "facilitate", "utilize", "endeavor", etc.

Instead use simple words like: "good", "great", "helps", "use", "try", etc.

Include:

1. **Overall Wellness Score** (0-100): How they're doing overall
2. **What We Noticed**: 3-5 simple observations about their week/month (SKIP generic observations like "you checked in" or "you showed up")
3. **Your Mood**: How they've been feeling emotionally (use everyday language)
4. **Stress Levels**: When they felt stressed and when they felt calm
5. **Sleep**: How well they slept and tips to sleep better
6. **Energy**: When they felt energized vs tired
7. **Pollution Defense**: If they completed pollution defense protocols, comment on their air quality exposure, symptoms, and recovery practices
8. **Great Job On**: What they did really well (celebrate SPECIFIC wins - exercises completed, affirmations done, challenges finished, good sleep days, etc. DO NOT praise generic things like "showing up" or "first check-in")
9. **Areas to Focus On**: Based on their ACTUAL data, give 2-3 SPECIFIC recommendations with concrete actions. Examples:
   - If energy is low: "Try a 10-minute morning walk before breakfast"
   - If sleep is poor: "Set a bedtime alarm for 10 PM and avoid screens after 9 PM"
   - If stress is high: "Do the 5-minute breathing exercise when you feel overwhelmed"
   - If no exercises done: "Start with just ONE 5-minute guided exercise this week - pick the 'Morning Stretch' or 'Quick Calm'"
   - If mood is low: "Try writing down 3 good things each evening before bed"
10. **Next Steps**: 3-5 SPECIFIC, actionable items for next {period} based on their data (not generic advice)

CRITICAL RULES:
- Write like you're talking to a friend
- Use simple, everyday words
- Be warm and encouraging but SPECIFIC
- No medical jargon or fancy vocabulary
- Use emojis to keep it friendly
- Keep sentences short and clear
- DO NOT praise generic things like "showing up" or "taking the first step" - focus on ACTUAL actions they took
- "Areas to Focus On" must have SPECIFIC recommendations based on their data, not vague suggestions
- If they had pollution exposure, acknowledge it and praise their protective actions
- Format in markdown"""

        # Call Gemini API
        if not model:
            raise HTTPException(status_code=503, detail="Gemini AI service not available")
        
        response = model.generate_content(prompt)
        analysis = response.text
        
        # Extract wellness score from analysis (if present)
        wellness_score = None
        try:
            # Try to find score in format "Score: 75/100" or "75/100"
            import re
            score_match = re.search(r'(\d+)/100', analysis)
            if score_match:
                wellness_score = int(score_match.group(1))
        except:
            pass
        
        # Save report to database
        report_data = {
            "user_id": data.get("user_id"),
            "report_type": period,
            "period_start": data.get("start_date"),
            "period_end": data.get("end_date"),
            "wellness_score": wellness_score,
            "analysis_text": analysis,
            "data_summary": data,
            "generated_at": datetime.now().isoformat()
        }
        
        try:
            # Save to Supabase
            result = supabase.table("wellness_reports").insert(report_data).execute()
            logger.info(f"✅ Saved {period} report for user {data.get('user_id')}")
            
            # Cleanup old reports based on subscription tier
            cleanup_old_reports(data.get("user_id"))
        except Exception as e:
            logger.error(f"❌ Failed to save report: {e}")
            # Continue anyway - don't fail the request
        
        return {
            "status": "success",
            "period": period,
            "analysis": analysis,
            "wellness_score": wellness_score,
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
    
    # Pollution Defense Protocol data
    pollution_protocols = data.get("pollution_defense_protocols", [])
    pollution_summary = format_pollution_defense_data(pollution_protocols) if pollution_protocols else None
    
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

{pollution_summary if pollution_summary else ""}

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


def format_pollution_defense_data(protocols: List[Dict]) -> str:
    """Format pollution defense protocol data for wellness report"""
    if not protocols:
        return ""
    
    total_protocols = len(protocols)
    
    # Calculate averages
    avg_aqi = sum(p.get("aqi", 0) for p in protocols if p.get("aqi")) / max(total_protocols, 1)
    
    # Count symptoms
    symptom_counts = {
        "wheeze": 0,
        "cough": 0,
        "fatigue": 0,
        "eye_irritation": 0,
        "throat_irritation": 0
    }
    
    severe_symptoms_count = 0
    
    for protocol in protocols:
        symptoms = protocol.get("symptoms", {})
        if symptoms.get("wheeze"): symptom_counts["wheeze"] += 1
        if symptoms.get("cough"): symptom_counts["cough"] += 1
        if symptoms.get("fatigue"): symptom_counts["fatigue"] += 1
        if symptoms.get("eye_irritation"): symptom_counts["eye_irritation"] += 1
        if symptoms.get("throat_irritation"): symptom_counts["throat_irritation"] += 1
        
        if protocol.get("severe_symptoms"):
            severe_symptoms_count += 1
    
    # Most common symptoms
    common_symptoms = [k for k, v in sorted(symptom_counts.items(), key=lambda x: x[1], reverse=True) if v > 0][:3]
    
    # Calculate protocol completion rate
    completed_recovery = sum(1 for p in protocols if p.get("recovery", {}).get("breathing_exercise")) / max(total_protocols, 1) * 100
    
    summary = f"""
POLLUTION DEFENSE PROTOCOLS:
- Total Protocols Completed: {total_protocols}
- Average AQI Exposure: {avg_aqi:.1f}
- Severe Symptom Days: {severe_symptoms_count}
- Most Common Symptoms: {', '.join(common_symptoms) if common_symptoms else 'None reported'}
- Recovery Completion Rate: {completed_recovery:.0f}%
- Assessment: {"High pollution exposure - extra care needed" if avg_aqi > 100 else "Moderate pollution exposure" if avg_aqi > 50 else "Good air quality days"}
"""
    
    return summary


@router.get("/report-history/{user_id}")
async def get_report_history(user_id: str) -> Dict[str, Any]:
    """
    Get history of generated reports for a user
    FREE: Last 4 weekly + 2 monthly
    PAID: Last 12 weekly + 6 monthly
    """
    try:
        # Fetch all reports for user, ordered by date
        result = supabase.table("wellness_reports")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("period_end", desc=True)\
            .execute()
        
        reports = result.data if result.data else []
        
        # Separate by type
        weekly_reports = [r for r in reports if r["report_type"] == "weekly"]
        monthly_reports = [r for r in reports if r["report_type"] == "monthly"]
        
        return {
            "status": "success",
            "user_id": user_id,
            "weekly_reports": weekly_reports,
            "monthly_reports": monthly_reports,
            "total_reports": len(reports)
        }
    except Exception as e:
        logger.error(f"Error fetching report history: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def cleanup_old_reports(user_id: str):
    """
    Cleanup old reports based on subscription tier
    FREE: Keep last 4 weekly + 2 monthly
    PAID: Keep last 12 weekly + 6 monthly
    """
    try:
        # Get user's subscription tier
        user_result = supabase.table("users")\
            .select("subscription_tier")\
            .eq("id", user_id)\
            .single()\
            .execute()
        
        if not user_result.data:
            return
        
        subscription_tier = user_result.data.get("subscription_tier", "free")
        
        # Set limits based on tier
        if subscription_tier == "premium":
            weekly_limit = 12
            monthly_limit = 6
        else:
            weekly_limit = 4
            monthly_limit = 2
        
        # Get all reports for user
        all_reports = supabase.table("wellness_reports")\
            .select("id, report_type, period_end")\
            .eq("user_id", user_id)\
            .order("period_end", desc=True)\
            .execute()
        
        if not all_reports.data:
            return
        
        # Separate by type
        weekly = [r for r in all_reports.data if r["report_type"] == "weekly"]
        monthly = [r for r in all_reports.data if r["report_type"] == "monthly"]
        
        # Delete old weekly reports
        if len(weekly) > weekly_limit:
            old_weekly_ids = [r["id"] for r in weekly[weekly_limit:]]
            supabase.table("wellness_reports")\
                .delete()\
                .in_("id", old_weekly_ids)\
                .execute()
            logger.info(f"🗑️ Deleted {len(old_weekly_ids)} old weekly reports for user {user_id}")
        
        # Delete old monthly reports
        if len(monthly) > monthly_limit:
            old_monthly_ids = [r["id"] for r in monthly[monthly_limit:]]
            supabase.table("wellness_reports")\
                .delete()\
                .in_("id", old_monthly_ids)\
                .execute()
            logger.info(f"🗑️ Deleted {len(old_monthly_ids)} old monthly reports for user {user_id}")
            
    except Exception as e:
        logger.error(f"Error cleaning up old reports: {e}")
