"""
Rate Limiting Middleware
Protects against brute force attacks and API abuse
"""
from fastapi import Request, HTTPException, status
from datetime import datetime, timedelta
from collections import defaultdict
from typing import Dict, Tuple
import logging

logger = logging.getLogger(__name__)

class RateLimiter:
    """
    Simple in-memory rate limiter
    For production, use Redis for distributed rate limiting
    """
    
    def __init__(self):
        # Store: {ip_address: {endpoint: [(timestamp, count)]}}
        self.requests: Dict[str, Dict[str, list]] = defaultdict(lambda: defaultdict(list))
        
        # Rate limits per endpoint (requests per minute)
        self.limits = {
            '/auth/login': 5,           # 5 login attempts per minute
            '/auth/register': 3,        # 3 registrations per minute
            '/stripe/create-checkout-session': 10,  # 10 checkout attempts per minute
            '/stripe/webhook': 100,     # 100 webhooks per minute
            'default': 60               # 60 requests per minute for other endpoints
        }
        
        # Cleanup old entries every 100 requests
        self.cleanup_counter = 0
    
    def get_client_ip(self, request: Request) -> str:
        """Get client IP address"""
        # Check for forwarded IP (behind proxy)
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        
        # Check for real IP
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        # Fallback to direct connection IP
        return request.client.host if request.client else "unknown"
    
    def get_limit(self, endpoint: str) -> int:
        """Get rate limit for endpoint"""
        # Check for exact match
        if endpoint in self.limits:
            return self.limits[endpoint]
        
        # Check for prefix match
        for key, limit in self.limits.items():
            if endpoint.startswith(key):
                return limit
        
        return self.limits['default']
    
    def is_rate_limited(self, request: Request) -> Tuple[bool, int, int]:
        """
        Check if request should be rate limited
        Returns: (is_limited, current_count, limit)
        """
        client_ip = self.get_client_ip(request)
        endpoint = request.url.path
        limit = self.get_limit(endpoint)
        
        # Get current time
        now = datetime.utcnow()
        cutoff = now - timedelta(minutes=1)
        
        # Get requests for this IP and endpoint
        requests = self.requests[client_ip][endpoint]
        
        # Remove old requests
        requests[:] = [req_time for req_time in requests if req_time > cutoff]
        
        # Check if limit exceeded
        current_count = len(requests)
        is_limited = current_count >= limit
        
        if not is_limited:
            # Add current request
            requests.append(now)
        
        # Periodic cleanup
        self.cleanup_counter += 1
        if self.cleanup_counter >= 100:
            self._cleanup_old_entries()
            self.cleanup_counter = 0
        
        return is_limited, current_count, limit
    
    def _cleanup_old_entries(self):
        """Remove old entries to prevent memory growth"""
        cutoff = datetime.utcnow() - timedelta(minutes=5)
        
        # Clean up old IPs
        ips_to_remove = []
        for ip, endpoints in self.requests.items():
            # Clean up old requests for each endpoint
            for endpoint, requests in list(endpoints.items()):
                requests[:] = [req_time for req_time in requests if req_time > cutoff]
                
                # Remove empty endpoints
                if not requests:
                    del endpoints[endpoint]
            
            # Remove empty IPs
            if not endpoints:
                ips_to_remove.append(ip)
        
        for ip in ips_to_remove:
            del self.requests[ip]
        
        if ips_to_remove:
            logger.info(f"Cleaned up {len(ips_to_remove)} old IP entries")


# Global rate limiter instance
rate_limiter = RateLimiter()


async def rate_limit_middleware(request: Request, call_next):
    """
    Rate limiting middleware
    """
    # Skip rate limiting for health checks, static files, and OPTIONS requests
    if request.url.path in ['/health', '/docs', '/openapi.json', '/redoc']:
        return await call_next(request)
    
    # Skip rate limiting for OPTIONS (CORS preflight) requests
    if request.method == "OPTIONS":
        return await call_next(request)
    
    # Check rate limit
    is_limited, current_count, limit = rate_limiter.is_rate_limited(request)
    
    if is_limited:
        client_ip = rate_limiter.get_client_ip(request)
        logger.warning(
            f"Rate limit exceeded for {client_ip} on {request.url.path}: "
            f"{current_count}/{limit} requests per minute"
        )
        
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": "Rate limit exceeded",
                "message": f"Too many requests. Limit: {limit} requests per minute.",
                "retry_after": 60
            },
            headers={"Retry-After": "60"}
        )
    
    # Add rate limit headers to response
    response = await call_next(request)
    response.headers["X-RateLimit-Limit"] = str(limit)
    response.headers["X-RateLimit-Remaining"] = str(limit - current_count - 1)
    response.headers["X-RateLimit-Reset"] = str(60)  # seconds
    
    return response
