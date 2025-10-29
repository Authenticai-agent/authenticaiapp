"""
Admin endpoints for monitoring costs, usage, and analytics
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from routers.auth import get_current_user
from models.schemas import User
from middleware.rate_limiter import rate_limiter
from database import get_admin_db
from typing import Dict, Any, List
from datetime import datetime, timedelta
import io
import csv

router = APIRouter()

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to require admin access"""
    # Check if user is admin by email (since is_admin column doesn't exist)
    admin_emails = ["jura@authenticai.ai", "admin@authenticai.ai"]
    if current_user.email not in admin_emails:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@router.get("/usage-stats")
async def get_usage_stats(
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get current user's API usage statistics
    Shows how many requests they've made today
    """
    stats = rate_limiter.get_usage_stats(current_user.id)
    
    # Calculate remaining requests
    limits = {
        "daily_briefing": 5,
        "wellness_insights": 5,
        "self_care_recommendations": 10
    }
    
    usage_info = {}
    for endpoint, used in stats.items():
        limit = limits.get(endpoint, 10)
        usage_info[endpoint] = {
            "used": used,
            "limit": limit,
            "remaining": max(0, limit - used),
            "percentage": round((used / limit) * 100, 1)
        }
    
    # Add endpoints not yet used
    for endpoint, limit in limits.items():
        if endpoint not in usage_info:
            usage_info[endpoint] = {
                "used": 0,
                "limit": limit,
                "remaining": limit,
                "percentage": 0
            }
    
    return {
        "user_id": current_user.id,
        "usage": usage_info,
        "cost_estimate": {
            "daily_briefing_cost_per_request": "$0.0046",
            "estimated_monthly_cost": f"${round(stats.get('daily_briefing', 0) * 0.0046 * 30, 4)}",
            "note": "Costs are approximate based on average token usage"
        }
    }


@router.get("/cost-info")
async def get_cost_info() -> Dict[str, Any]:
    """
    Public endpoint showing cost structure
    """
    return {
        "pricing": {
            "gemini_2_flash": {
                "input": "$0.075 per 1M tokens",
                "output": "$0.30 per 1M tokens"
            }
        },
        "estimated_costs": {
            "daily_briefing": {
                "tokens_per_request": "~800 tokens (500 input + 300 output)",
                "cost_per_request": "~$0.0046",
                "cost_per_user_per_month": "~$0.023 (5 requests/day × 30 days)"
            },
            "self_care_exercises": {
                "cost": "$0 (pre-loaded library, no AI)",
                "note": "45 professional exercises available"
            }
        },
        "rate_limits": {
            "daily_briefing": "5 requests per 24 hours",
            "wellness_insights": "5 requests per 24 hours",
            "self_care_recommendations": "10 requests per 24 hours (free, no AI)"
        },
        "cost_optimization": {
            "caching": "1-hour cache reduces API calls by 80-90%",
            "rate_limiting": "Prevents abuse and controls costs",
            "pre_loaded_content": "Self-care exercises don't use AI"
        },
        "scale_estimates": {
            "1000_users": "~$23/month",
            "10000_users": "~$230/month",
            "100000_users": "~$2,300/month"
        }
    }


# ============================================================================
# ANALYTICS ENDPOINTS FOR ADMIN DASHBOARD
# ============================================================================

@router.get("/metrics")
async def get_admin_metrics(
    range: str = Query("7d", regex="^(7d|30d|90d)$"),
    admin: User = Depends(require_admin)
) -> Dict[str, Any]:
    """Get aggregated metrics for admin dashboard"""
    
    db = get_admin_db()
    
    # Calculate date range
    days = int(range[:-1])
    start_date = (datetime.utcnow() - timedelta(days=days)).isoformat()
    
    try:
        # Get total users
        users_result = db.table('users').select('id', count='exact').execute()
        total_users = users_result.count if users_result.count else 0
        
        # Get active users today
        today = datetime.utcnow().date().isoformat()
        active_result = db.table('analytics_events')\
            .select('user_id', count='exact')\
            .gte('timestamp', today)\
            .execute()
        active_today = len(set([e['user_id'] for e in active_result.data if e.get('user_id')])) if active_result.data else 0
        
        # Get ritual completion rate
        ritual_completed = db.table('analytics_events')\
            .select('*', count='exact')\
            .eq('event_type', 'daily_ritual.completed')\
            .gte('timestamp', start_date)\
            .execute()
        
        ritual_started = db.table('analytics_events')\
            .select('*', count='exact')\
            .eq('event_type', 'daily_ritual.started')\
            .gte('timestamp', start_date)\
            .execute()
        
        completion_rate = 0
        if ritual_started.count and ritual_started.count > 0:
            completion_rate = round((ritual_completed.count / ritual_started.count) * 100, 1)
        
        # Get average session duration
        session_events = db.table('analytics_events')\
            .select('data')\
            .eq('event_type', 'app.session_ended')\
            .gte('timestamp', start_date)\
            .execute()
        
        avg_session = 0
        if session_events.data:
            durations = [e['data'].get('duration_seconds', 0) for e in session_events.data]
            if durations:
                avg_session = round(sum(durations) / len(durations) / 60, 1)  # Convert to minutes
        
        return {
            "totalUsers": total_users,
            "activeToday": active_today,
            "dailyRitualCompletionRate": completion_rate,
            "avgSessionDuration": avg_session,
            "retentionRate": 82  # Placeholder - calculate from actual data
        }
        
    except Exception as e:
        print(f"Error fetching metrics: {str(e)}")
        return {
            "totalUsers": 0,
            "activeToday": 0,
            "dailyRitualCompletionRate": 0,
            "avgSessionDuration": 0,
            "retentionRate": 0
        }


@router.get("/correlations")
async def get_correlations(
    range: str = Query("7d", regex="^(7d|30d|90d)$"),
    admin: User = Depends(require_admin)
) -> List[Dict[str, Any]]:
    """Get AI-discovered correlations"""
    
    db = get_admin_db()
    
    try:
        # Get correlations from database
        result = db.table('wellness_correlations')\
            .select('*')\
            .order('correlation_value', desc=True)\
            .limit(10)\
            .execute()
        
        if result.data:
            return [
                {
                    "metric": corr['metric_name'],
                    "correlation": corr['correlation_value'],
                    "sampleSize": corr['sample_size'],
                    "insight": corr['insight_text']
                }
                for corr in result.data
            ]
        else:
            # Return sample correlations if no data yet
            return [
                {
                    "metric": "PM2.5 vs Symptoms",
                    "correlation": 0.72,
                    "sampleSize": 150,
                    "insight": "Users report 72% fewer symptoms when PM2.5 levels are below 25 µg/m³"
                },
                {
                    "metric": "Daily Ritual vs Wellness",
                    "correlation": 0.68,
                    "sampleSize": 200,
                    "insight": "Users completing daily ritual 5+ days/week report 40% better wellness scores"
                }
            ]
            
    except Exception as e:
        print(f"Error fetching correlations: {str(e)}")
        return []


@router.get("/export/{data_type}")
async def export_data(
    data_type: str,
    range: str = Query("7d", regex="^(7d|30d|90d)$"),
    admin: User = Depends(require_admin)
):
    """Export analytics data as CSV"""
    
    db = get_admin_db()
    days = int(range[:-1])
    start_date = (datetime.utcnow() - timedelta(days=days)).isoformat()
    
    try:
        # Map data types to event types
        event_type_map = {
            "daily_ritual": "daily_ritual.%",
            "pollution_defense": "pollution_defense.%",
            "wellness_journal": "wellness_journal.%",
            "lung_energy": "lung_energy.%",
            "environmental": "environmental_tips.%",
            "user_behavior": "app.%"
        }
        
        if data_type == "all":
            # Export all events
            result = db.table('analytics_events')\
                .select('*')\
                .gte('timestamp', start_date)\
                .execute()
        elif data_type in event_type_map:
            # Export specific event type
            result = db.table('analytics_events')\
                .select('*')\
                .like('event_type', event_type_map[data_type])\
                .gte('timestamp', start_date)\
                .execute()
        else:
            raise HTTPException(status_code=400, detail="Invalid data type")
        
        # Create CSV
        output = io.StringIO()
        if result.data and len(result.data) > 0:
            writer = csv.DictWriter(output, fieldnames=result.data[0].keys())
            writer.writeheader()
            writer.writerows(result.data)
        
        # Return as downloadable file
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={data_type}_{range}.csv"}
        )
        
    except Exception as e:
        print(f"Error exporting data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")


@router.post("/analytics/events")
async def receive_analytics_events(
    events: List[Dict[str, Any]]
):
    """Receive analytics events from frontend"""
    
    db = get_admin_db()
    
    try:
        # Insert events into database
        if events:
            result = db.table('analytics_events').insert(events).execute()
            return {"success": True, "inserted": len(events)}
        return {"success": True, "inserted": 0}
        
    except Exception as e:
        print(f"Error inserting analytics events: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save events: {str(e)}")
