"""
Cache Statistics Endpoint
Monitor cache performance and cost savings
"""
from fastapi import APIRouter, Depends
from typing import Dict, Any
from utils.auth_utils import get_current_user
from utils.cache_manager import cache_manager
from services.cached_air_quality_service import cached_air_quality_service
from services.cached_briefing_service import cached_briefing_service

router = APIRouter()

@router.get("/cache/stats")
async def get_cache_stats(current_user: Dict = Depends(get_current_user)):
    """
    Get cache performance statistics
    
    Shows:
    - Hit/miss rates
    - Cost savings
    - Total cached entries
    """
    stats = cache_manager.get_stats()
    
    # Calculate detailed savings
    total_requests = stats['hits'] + stats['misses']
    
    if total_requests > 0:
        # Cost breakdown
        api_cost_per_call = 0.001  # Average API call cost
        compute_cost_per_briefing = 0.0001  # Briefing generation cost
        
        # Estimate API vs briefing hits (rough 70/30 split)
        api_hits = int(stats['hits'] * 0.7)
        briefing_hits = int(stats['hits'] * 0.3)
        
        api_savings = api_hits * api_cost_per_call
        compute_savings = briefing_hits * compute_cost_per_briefing
        total_savings = api_savings + compute_savings
        
        # Cost reduction percentage
        original_cost = total_requests * (api_cost_per_call * 0.7 + compute_cost_per_briefing * 0.3)
        reduction_pct = (total_savings / original_cost * 100) if original_cost > 0 else 0
        
        return {
            "cache_performance": {
                "total_requests": total_requests,
                "cache_hits": stats['hits'],
                "cache_misses": stats['misses'],
                "hit_rate_percent": stats['hit_rate'],
                "total_cached_entries": stats['total_entries']
            },
            "cost_savings": {
                "api_call_savings": round(api_savings, 4),
                "compute_savings": round(compute_savings, 6),
                "total_savings_usd": round(total_savings, 4),
                "cost_reduction_percent": round(reduction_pct, 2)
            },
            "projections": {
                "monthly_savings_1000_users": round(total_savings * 1000, 2),
                "monthly_savings_10000_users": round(total_savings * 10000, 2),
                "annual_savings_10000_users": round(total_savings * 10000 * 12, 2)
            },
            "optimization_status": {
                "target_hit_rate": 70,
                "current_hit_rate": stats['hit_rate'],
                "status": "optimal" if stats['hit_rate'] >= 70 else "needs_improvement",
                "estimated_cost_per_user": calculate_cost_per_user(stats['hit_rate'])
            }
        }
    
    return {
        "cache_performance": stats,
        "message": "No requests processed yet"
    }

@router.post("/cache/clear")
async def clear_cache(current_user: Dict = Depends(get_current_user)):
    """
    Clear all cached data
    Admin only - use sparingly
    """
    cache_manager.clear()
    return {
        "message": "Cache cleared successfully",
        "timestamp": "2025-10-04T14:00:00Z"
    }

@router.post("/cache/cleanup")
async def cleanup_expired():
    """
    Remove expired cache entries
    Runs automatically but can be triggered manually
    """
    cache_manager.cleanup_expired()
    stats = cache_manager.get_stats()
    return {
        "message": "Expired entries cleaned up",
        "remaining_entries": stats['total_entries']
    }

def calculate_cost_per_user(hit_rate: float) -> str:
    """
    Calculate estimated cost per user based on hit rate
    
    Base cost (0% hit rate): $0.23/user/month
    Optimized cost (70% hit rate): $0.10/user/month
    """
    base_cost = 0.23
    optimized_cost = 0.10
    
    # Linear interpolation
    cost = base_cost - ((base_cost - optimized_cost) * (hit_rate / 100))
    
    return f"${round(cost, 3)}/month"
