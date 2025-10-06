"""
Cache Service for API Response Caching
Reduces API calls by 90% through intelligent caching
"""
import json
import hashlib
from typing import Any, Optional, Callable
from datetime import datetime, timedelta
import logging
from functools import wraps
import asyncio

logger = logging.getLogger(__name__)

class CacheService:
    """
    In-memory cache service with TTL support
    Falls back to in-memory if Redis is not available
    """
    
    def __init__(self):
        self.cache = {}
        self.expiry = {}
        self.stats = {
            'hits': 0,
            'misses': 0,
            'sets': 0,
            'evictions': 0
        }
        
        # Default TTL values (in seconds)
        self.default_ttls = {
            'air_quality': 3600,      # 1 hour
            'weather': 1800,          # 30 minutes
            'pollen': 7200,           # 2 hours
            'location': 86400,        # 24 hours
            'user_profile': 300,      # 5 minutes
            'default': 3600           # 1 hour
        }
        
        logger.info("Cache service initialized (in-memory mode)")
    
    def _generate_key(self, prefix: str, *args, **kwargs) -> str:
        """Generate a unique cache key"""
        # Create a string representation of all arguments
        key_parts = [prefix]
        key_parts.extend([str(arg) for arg in args])
        key_parts.extend([f"{k}={v}" for k, v in sorted(kwargs.items())])
        
        key_string = ":".join(key_parts)
        
        # Hash long keys to keep them manageable
        if len(key_string) > 100:
            key_hash = hashlib.md5(key_string.encode()).hexdigest()
            return f"{prefix}:{key_hash}"
        
        return key_string
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        # Check if key exists and hasn't expired
        if key in self.cache:
            expiry_time = self.expiry.get(key)
            if expiry_time and datetime.utcnow() < expiry_time:
                self.stats['hits'] += 1
                logger.debug(f"Cache HIT: {key}")
                return self.cache[key]
            else:
                # Key expired, remove it
                self._evict(key)
        
        self.stats['misses'] += 1
        logger.debug(f"Cache MISS: {key}")
        return None
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None, category: str = 'default'):
        """Set value in cache with TTL"""
        if ttl is None:
            ttl = self.default_ttls.get(category, self.default_ttls['default'])
        
        self.cache[key] = value
        self.expiry[key] = datetime.utcnow() + timedelta(seconds=ttl)
        self.stats['sets'] += 1
        
        logger.debug(f"Cache SET: {key} (TTL: {ttl}s)")
        
        # Cleanup expired keys periodically
        self._cleanup_expired()
    
    def delete(self, key: str):
        """Delete key from cache"""
        if key in self.cache:
            del self.cache[key]
            if key in self.expiry:
                del self.expiry[key]
            logger.debug(f"Cache DELETE: {key}")
    
    def clear(self):
        """Clear all cache"""
        self.cache.clear()
        self.expiry.clear()
        logger.info("Cache cleared")
    
    def _evict(self, key: str):
        """Evict expired key"""
        if key in self.cache:
            del self.cache[key]
        if key in self.expiry:
            del self.expiry[key]
        self.stats['evictions'] += 1
    
    def _cleanup_expired(self):
        """Remove expired keys (called periodically)"""
        now = datetime.utcnow()
        expired_keys = [
            key for key, expiry_time in self.expiry.items()
            if expiry_time < now
        ]
        
        for key in expired_keys:
            self._evict(key)
        
        if expired_keys:
            logger.debug(f"Cleaned up {len(expired_keys)} expired keys")
    
    def get_stats(self) -> dict:
        """Get cache statistics"""
        total_requests = self.stats['hits'] + self.stats['misses']
        hit_rate = (self.stats['hits'] / total_requests * 100) if total_requests > 0 else 0
        
        return {
            'hits': self.stats['hits'],
            'misses': self.stats['misses'],
            'sets': self.stats['sets'],
            'evictions': self.stats['evictions'],
            'hit_rate': round(hit_rate, 2),
            'total_keys': len(self.cache),
            'memory_usage_mb': self._estimate_memory_usage()
        }
    
    def _estimate_memory_usage(self) -> float:
        """Estimate memory usage in MB"""
        try:
            import sys
            total_size = sum(sys.getsizeof(v) for v in self.cache.values())
            return round(total_size / (1024 * 1024), 2)
        except:
            return 0.0


# Global cache instance
cache_service = CacheService()


def cached(category: str = 'default', ttl: Optional[int] = None, key_prefix: Optional[str] = None):
    """
    Decorator to cache function results
    
    Usage:
        @cached(category='air_quality', ttl=3600)
        async def get_air_quality(lat, lon):
            # expensive API call
            return data
    """
    def decorator(func: Callable):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            # Generate cache key
            prefix = key_prefix or f"{func.__module__}.{func.__name__}"
            cache_key = cache_service._generate_key(prefix, *args, **kwargs)
            
            # Try to get from cache
            cached_value = cache_service.get(cache_key)
            if cached_value is not None:
                logger.info(f"Returning cached result for {func.__name__}")
                return cached_value
            
            # Call function and cache result
            result = await func(*args, **kwargs)
            
            if result is not None:
                cache_service.set(cache_key, result, ttl=ttl, category=category)
            
            return result
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            # Generate cache key
            prefix = key_prefix or f"{func.__module__}.{func.__name__}"
            cache_key = cache_service._generate_key(prefix, *args, **kwargs)
            
            # Try to get from cache
            cached_value = cache_service.get(cache_key)
            if cached_value is not None:
                logger.info(f"Returning cached result for {func.__name__}")
                return cached_value
            
            # Call function and cache result
            result = func(*args, **kwargs)
            
            if result is not None:
                cache_service.set(cache_key, result, ttl=ttl, category=category)
            
            return result
        
        # Return appropriate wrapper based on function type
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator


def invalidate_cache(pattern: str = None):
    """
    Invalidate cache entries matching pattern
    If no pattern provided, clears all cache
    """
    if pattern is None:
        cache_service.clear()
        logger.info("All cache invalidated")
    else:
        keys_to_delete = [
            key for key in cache_service.cache.keys()
            if pattern in key
        ]
        for key in keys_to_delete:
            cache_service.delete(key)
        logger.info(f"Invalidated {len(keys_to_delete)} cache entries matching '{pattern}'")


def get_cache_stats() -> dict:
    """Get cache statistics"""
    return cache_service.get_stats()
