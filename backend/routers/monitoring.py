"""
API Monitoring Endpoints
Provides real-time monitoring and health check endpoints
"""
from fastapi import APIRouter, Depends
from typing import Dict, Any
from services.api_monitoring_service import api_monitor
from services.cache_service import get_cache_stats, invalidate_cache
from utils.auth_utils import get_current_user
from models.schemas import User

router = APIRouter()


@router.get("/health")
async def get_api_health():
    """
    Get health status of all external APIs
    Public endpoint - no authentication required
    """
    health_status = await api_monitor.health_check_all_apis()
    
    return {
        'status': 'success',
        'timestamp': api_monitor.last_reset.isoformat(),
        'apis': health_status
    }


@router.get("/stats")
async def get_api_stats(current_user: User = Depends(get_current_user)):
    """
    Get detailed API usage statistics
    Requires authentication
    """
    stats = api_monitor.get_api_stats()
    
    return {
        'status': 'success',
        'stats': stats
    }


@router.get("/summary")
async def get_monitoring_summary(current_user: User = Depends(get_current_user)):
    """
    Get comprehensive monitoring summary
    Requires authentication
    """
    summary = api_monitor.get_monitoring_summary()
    
    return {
        'status': 'success',
        'summary': summary
    }


@router.get("/stats/{api_name}")
async def get_single_api_stats(api_name: str, current_user: User = Depends(get_current_user)):
    """
    Get statistics for a specific API
    Requires authentication
    """
    valid_apis = ['openweather', 'airnow', 'purpleair', 'stripe', 'supabase']
    
    if api_name not in valid_apis:
        return {
            'status': 'error',
            'message': f'Invalid API name. Valid options: {", ".join(valid_apis)}'
        }
    
    stats = api_monitor.get_api_stats(api_name)
    
    return {
        'status': 'success',
        'api': api_name,
        'stats': stats
    }


@router.get("/warnings")
async def get_active_warnings(current_user: User = Depends(get_current_user)):
    """
    Get list of active warnings and alerts
    Requires authentication
    """
    summary = api_monitor.get_monitoring_summary()
    
    return {
        'status': 'success',
        'warnings': summary['warnings'],
        'overall_status': summary['overall_status']
    }


@router.post("/test/{api_name}")
async def test_api_connection(api_name: str, current_user: User = Depends(get_current_user)):
    """
    Test connection to a specific API
    Requires authentication
    """
    valid_apis = ['openweather', 'stripe', 'supabase']
    
    if api_name not in valid_apis:
        return {
            'status': 'error',
            'message': f'API testing not available for {api_name}'
        }
    
    health_status = await api_monitor.health_check_all_apis()
    
    return {
        'status': 'success',
        'api': api_name,
        'health': health_status.get(api_name, {'status': 'unknown'})
    }


@router.get("/cache/stats")
async def get_cache_statistics(current_user: User = Depends(get_current_user)):
    """
    Get cache statistics
    Shows hit rate, memory usage, and cost savings
    Requires authentication
    """
    stats = get_cache_stats()
    
    # Calculate cost savings
    total_requests = stats['hits'] + stats['misses']
    api_calls_saved = stats['hits']
    
    # Assuming $0.004 per API call (OpenWeather cost)
    cost_per_call = 0.004
    cost_savings = api_calls_saved * cost_per_call
    
    return {
        'status': 'success',
        'cache_stats': stats,
        'cost_savings': {
            'api_calls_saved': api_calls_saved,
            'estimated_cost_savings_usd': round(cost_savings, 4),
            'cost_per_call': cost_per_call
        }
    }


@router.post("/cache/clear")
async def clear_cache(current_user: User = Depends(get_current_user)):
    """
    Clear all cache
    Requires authentication
    """
    invalidate_cache()
    
    return {
        'status': 'success',
        'message': 'Cache cleared successfully'
    }


@router.post("/cache/invalidate/{pattern}")
async def invalidate_cache_pattern(pattern: str, current_user: User = Depends(get_current_user)):
    """
    Invalidate cache entries matching pattern
    Requires authentication
    """
    invalidate_cache(pattern)
    
    return {
        'status': 'success',
        'message': f'Cache entries matching "{pattern}" invalidated'
    }
