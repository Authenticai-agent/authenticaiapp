"""
Admin endpoints for monitoring costs and usage
"""

from fastapi import APIRouter, Depends, HTTPException
from routers.auth import get_current_user
from models.schemas import User
from middleware.rate_limiter import rate_limiter
from typing import Dict, Any

router = APIRouter()

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
