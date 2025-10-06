"""
API Monitoring Service
Monitors health, usage, and rate limits for all external APIs
"""
import os
import time
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from collections import defaultdict
import asyncio
import httpx

logger = logging.getLogger(__name__)

class APIMonitor:
    """Monitor API health, usage, and rate limits"""
    
    def __init__(self):
        self.api_calls = defaultdict(int)
        self.api_errors = defaultdict(int)
        self.api_response_times = defaultdict(list)
        self.last_reset = datetime.utcnow()
        self.rate_limit_warnings = defaultdict(int)
        
        # API Rate Limits (calls per day)
        self.rate_limits = {
            'openweather': 1000,  # Free tier: 1000 calls/day
            'airnow': 500,         # Free tier: 500 calls/hour
            'purpleair': 1000,     # Free tier: varies
            'stripe': 100,         # Per second: 100/sec (25,000/hour)
            'supabase': 10000,     # Varies by plan
        }
        
        # Warning thresholds (percentage of limit)
        self.warning_threshold = 0.8  # 80%
        self.critical_threshold = 0.95  # 95%
    
    def track_api_call(self, api_name: str, response_time: float, success: bool = True):
        """Track an API call"""
        self.api_calls[api_name] += 1
        self.api_response_times[api_name].append(response_time)
        
        if not success:
            self.api_errors[api_name] += 1
        
        # Check rate limits
        self._check_rate_limit(api_name)
        
        # Reset counters daily
        if (datetime.utcnow() - self.last_reset).days >= 1:
            self._reset_daily_counters()
    
    def _check_rate_limit(self, api_name: str):
        """Check if approaching rate limit"""
        if api_name not in self.rate_limits:
            return
        
        limit = self.rate_limits[api_name]
        current = self.api_calls[api_name]
        usage_percent = current / limit
        
        if usage_percent >= self.critical_threshold:
            logger.critical(f"🚨 CRITICAL: {api_name} API at {usage_percent*100:.1f}% of rate limit ({current}/{limit})")
            self.rate_limit_warnings[api_name] += 1
        elif usage_percent >= self.warning_threshold:
            logger.warning(f"⚠️ WARNING: {api_name} API at {usage_percent*100:.1f}% of rate limit ({current}/{limit})")
    
    def _reset_daily_counters(self):
        """Reset daily counters"""
        logger.info("📊 Resetting daily API counters")
        self.api_calls.clear()
        self.api_errors.clear()
        self.api_response_times.clear()
        self.rate_limit_warnings.clear()
        self.last_reset = datetime.utcnow()
    
    def get_api_stats(self, api_name: Optional[str] = None) -> Dict[str, Any]:
        """Get API statistics"""
        if api_name:
            return self._get_single_api_stats(api_name)
        
        # Get stats for all APIs
        stats = {}
        for api in ['openweather', 'airnow', 'purpleair', 'stripe', 'supabase']:
            stats[api] = self._get_single_api_stats(api)
        
        return stats
    
    def _get_single_api_stats(self, api_name: str) -> Dict[str, Any]:
        """Get statistics for a single API"""
        calls = self.api_calls.get(api_name, 0)
        errors = self.api_errors.get(api_name, 0)
        response_times = self.api_response_times.get(api_name, [])
        
        avg_response_time = sum(response_times) / len(response_times) if response_times else 0
        error_rate = (errors / calls * 100) if calls > 0 else 0
        
        limit = self.rate_limits.get(api_name, 0)
        usage_percent = (calls / limit * 100) if limit > 0 else 0
        
        return {
            'total_calls': calls,
            'total_errors': errors,
            'error_rate': round(error_rate, 2),
            'avg_response_time_ms': round(avg_response_time * 1000, 2),
            'rate_limit': limit,
            'usage_percent': round(usage_percent, 2),
            'status': self._get_api_status(api_name, calls, errors, usage_percent)
        }
    
    def _get_api_status(self, api_name: str, calls: int, errors: int, usage_percent: float) -> str:
        """Determine API health status"""
        error_rate = (errors / calls * 100) if calls > 0 else 0
        
        if usage_percent >= self.critical_threshold * 100:
            return 'critical_rate_limit'
        elif error_rate > 10:
            return 'unhealthy'
        elif usage_percent >= self.warning_threshold * 100:
            return 'warning_rate_limit'
        elif error_rate > 5:
            return 'degraded'
        else:
            return 'healthy'
    
    async def health_check_all_apis(self) -> Dict[str, Any]:
        """Perform health check on all APIs"""
        results = {}
        
        # Check OpenWeather
        results['openweather'] = await self._check_openweather()
        
        # Check Stripe
        results['stripe'] = await self._check_stripe()
        
        # Check Supabase
        results['supabase'] = await self._check_supabase()
        
        # AirNow and PurpleAir don't have health endpoints
        results['airnow'] = {'status': 'unknown', 'message': 'No health endpoint'}
        results['purpleair'] = {'status': 'unknown', 'message': 'No health endpoint'}
        
        return results
    
    async def _check_openweather(self) -> Dict[str, Any]:
        """Check OpenWeather API health"""
        api_key = os.getenv('OPENWEATHER_API_KEY')
        if not api_key:
            return {'status': 'error', 'message': 'API key not configured'}
        
        try:
            start_time = time.time()
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    'https://api.openweathermap.org/data/2.5/weather',
                    params={'lat': 40.7128, 'lon': -74.0060, 'appid': api_key},
                    timeout=5.0
                )
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                return {
                    'status': 'healthy',
                    'response_time_ms': round(response_time * 1000, 2),
                    'message': 'API responding normally'
                }
            elif response.status_code == 401:
                return {'status': 'error', 'message': 'Invalid API key'}
            else:
                return {'status': 'error', 'message': f'HTTP {response.status_code}'}
        except Exception as e:
            return {'status': 'error', 'message': str(e)}
    
    async def _check_stripe(self) -> Dict[str, Any]:
        """Check Stripe API health"""
        api_key = os.getenv('STRIPE_SECRET_KEY')
        if not api_key:
            return {'status': 'error', 'message': 'API key not configured'}
        
        try:
            import stripe
            stripe.api_key = api_key
            
            start_time = time.time()
            # Simple API call to check health
            stripe.Account.retrieve()
            response_time = time.time() - start_time
            
            return {
                'status': 'healthy',
                'response_time_ms': round(response_time * 1000, 2),
                'message': 'API responding normally'
            }
        except stripe.error.AuthenticationError:
            return {'status': 'error', 'message': 'Invalid API key'}
        except Exception as e:
            return {'status': 'error', 'message': str(e)}
    
    async def _check_supabase(self) -> Dict[str, Any]:
        """Check Supabase API health"""
        url = os.getenv('SUPABASE_URL')
        key = os.getenv('SUPABASE_KEY')
        
        if not url or not key:
            return {'status': 'error', 'message': 'Supabase not configured'}
        
        try:
            start_time = time.time()
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f'{url}/rest/v1/',
                    headers={'apikey': key},
                    timeout=5.0
                )
            response_time = time.time() - start_time
            
            if response.status_code in [200, 404]:  # 404 is ok for root endpoint
                return {
                    'status': 'healthy',
                    'response_time_ms': round(response_time * 1000, 2),
                    'message': 'API responding normally'
                }
            else:
                return {'status': 'error', 'message': f'HTTP {response.status_code}'}
        except Exception as e:
            return {'status': 'error', 'message': str(e)}
    
    def get_monitoring_summary(self) -> Dict[str, Any]:
        """Get comprehensive monitoring summary"""
        stats = self.get_api_stats()
        
        total_calls = sum(api['total_calls'] for api in stats.values())
        total_errors = sum(api['total_errors'] for api in stats.values())
        overall_error_rate = (total_errors / total_calls * 100) if total_calls > 0 else 0
        
        # Determine overall health
        statuses = [api['status'] for api in stats.values()]
        if 'critical_rate_limit' in statuses or 'unhealthy' in statuses:
            overall_status = 'unhealthy'
        elif 'warning_rate_limit' in statuses or 'degraded' in statuses:
            overall_status = 'degraded'
        else:
            overall_status = 'healthy'
        
        return {
            'overall_status': overall_status,
            'total_api_calls': total_calls,
            'total_errors': total_errors,
            'overall_error_rate': round(overall_error_rate, 2),
            'monitoring_period': {
                'start': self.last_reset.isoformat(),
                'duration_hours': (datetime.utcnow() - self.last_reset).total_seconds() / 3600
            },
            'apis': stats,
            'warnings': self._get_active_warnings()
        }
    
    def _get_active_warnings(self) -> List[str]:
        """Get list of active warnings"""
        warnings = []
        
        for api_name, stats in self.get_api_stats().items():
            if stats['status'] == 'critical_rate_limit':
                warnings.append(f"🚨 {api_name}: Critical rate limit ({stats['usage_percent']}%)")
            elif stats['status'] == 'warning_rate_limit':
                warnings.append(f"⚠️ {api_name}: Approaching rate limit ({stats['usage_percent']}%)")
            elif stats['status'] == 'unhealthy':
                warnings.append(f"❌ {api_name}: High error rate ({stats['error_rate']}%)")
            elif stats['status'] == 'degraded':
                warnings.append(f"⚠️ {api_name}: Elevated error rate ({stats['error_rate']}%)")
        
        return warnings


# Global monitor instance
api_monitor = APIMonitor()


# Decorator to track API calls
def track_api_call(api_name: str):
    """Decorator to automatically track API calls"""
    def decorator(func):
        async def async_wrapper(*args, **kwargs):
            start_time = time.time()
            success = True
            try:
                result = await func(*args, **kwargs)
                return result
            except Exception as e:
                success = False
                raise e
            finally:
                response_time = time.time() - start_time
                api_monitor.track_api_call(api_name, response_time, success)
        
        def sync_wrapper(*args, **kwargs):
            start_time = time.time()
            success = True
            try:
                result = func(*args, **kwargs)
                return result
            except Exception as e:
                success = False
                raise e
            finally:
                response_time = time.time() - start_time
                api_monitor.track_api_call(api_name, response_time, success)
        
        # Return appropriate wrapper based on function type
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator
