"""
Rate Limiting Middleware
Prevents API abuse and controls costs
"""

from fastapi import HTTPException, Request
from datetime import datetime, timedelta
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

class RateLimiter:
    """
    Simple in-memory rate limiter
    For production, use Redis for distributed rate limiting
    """
    
    def __init__(self):
        # Store: {user_id: {endpoint: [(timestamp, count)]}}
        self.request_history: Dict[str, Dict[str, list]] = {}
        
    def _clean_old_requests(self, user_id: str, endpoint: str, window_hours: int = 24):
        """Remove requests older than the time window"""
        if user_id not in self.request_history:
            return
        
        if endpoint not in self.request_history[user_id]:
            return
        
        cutoff_time = datetime.now() - timedelta(hours=window_hours)
        self.request_history[user_id][endpoint] = [
            req_time for req_time in self.request_history[user_id][endpoint]
            if req_time > cutoff_time
        ]
    
    def check_rate_limit(
        self,
        user_id: str,
        endpoint: str,
        max_requests: int = 5,
        window_hours: int = 24
    ) -> tuple[bool, int, Optional[datetime]]:
        """
        Check if user has exceeded rate limit
        
        Returns:
            (is_allowed, remaining_requests, reset_time)
        """
        # Clean old requests
        self._clean_old_requests(user_id, endpoint, window_hours)
        
        # Initialize if needed
        if user_id not in self.request_history:
            self.request_history[user_id] = {}
        
        if endpoint not in self.request_history[user_id]:
            self.request_history[user_id][endpoint] = []
        
        # Get current request count
        current_count = len(self.request_history[user_id][endpoint])
        
        # Check if limit exceeded
        if current_count >= max_requests:
            # Find oldest request to determine reset time
            oldest_request = min(self.request_history[user_id][endpoint])
            reset_time = oldest_request + timedelta(hours=window_hours)
            return False, 0, reset_time
        
        # Record this request
        self.request_history[user_id][endpoint].append(datetime.now())
        
        remaining = max_requests - (current_count + 1)
        return True, remaining, None
    
    def get_usage_stats(self, user_id: str) -> Dict[str, int]:
        """Get current usage for a user"""
        if user_id not in self.request_history:
            return {}
        
        stats = {}
        for endpoint, requests in self.request_history[user_id].items():
            self._clean_old_requests(user_id, endpoint)
            stats[endpoint] = len(self.request_history[user_id][endpoint])
        
        return stats


# Global rate limiter instance
rate_limiter = RateLimiter()


# Rate limit configurations
RATE_LIMITS = {
    "daily_briefing": {"max_requests": 5, "window_hours": 24},
    "wellness_insights": {"max_requests": 5, "window_hours": 24},
    "self_care_recommendations": {"max_requests": 10, "window_hours": 24},  # Higher since it's free
}


async def check_rate_limit(request: Request, user_id: str, endpoint_name: str):
    """
    Middleware to check rate limits
    
    Usage:
        await check_rate_limit(request, user.id, "daily_briefing")
    """
    
    # Get rate limit config for this endpoint
    config = RATE_LIMITS.get(endpoint_name, {"max_requests": 10, "window_hours": 24})
    
    # Check rate limit
    is_allowed, remaining, reset_time = rate_limiter.check_rate_limit(
        user_id=user_id,
        endpoint=endpoint_name,
        max_requests=config["max_requests"],
        window_hours=config["window_hours"]
    )
    
    # Add rate limit headers to response
    request.state.rate_limit_remaining = remaining
    request.state.rate_limit_reset = reset_time
    
    if not is_allowed:
        reset_str = reset_time.strftime("%Y-%m-%d %H:%M:%S") if reset_time else "soon"
        logger.warning(f"Rate limit exceeded for user {user_id} on {endpoint_name}")
        
        raise HTTPException(
            status_code=429,
            detail={
                "error": "Rate limit exceeded",
                "message": f"You've reached your daily limit of {config['max_requests']} requests for this feature.",
                "reset_time": reset_str,
                "endpoint": endpoint_name
            }
        )
    
    logger.info(f"Rate limit check passed for {user_id} on {endpoint_name}. Remaining: {remaining}")
    return True
