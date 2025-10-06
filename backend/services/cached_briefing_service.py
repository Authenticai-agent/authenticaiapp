"""
Cached Briefing Service
Batch generates briefings for same location/profile combinations
Reduces compute costs by sharing briefings across similar users
"""
from typing import Dict, Any
from datetime import datetime
import hashlib
import json
import logging
from utils.cache_manager import cache_manager
from services.dynamic_daily_briefing_engine import dynamic_briefing_engine

logger = logging.getLogger(__name__)

class CachedBriefingService:
    """
    Briefing service with intelligent caching
    
    Strategy:
    - Cache briefings by location (city-level) + user profile type
    - Users with same condition + triggers get same briefing
    - TTL: 60 minutes (briefings change with environmental data)
    - Reduces compute by ~70%
    """
    
    def __init__(self):
        self.engine = dynamic_briefing_engine
    
    def _create_profile_hash(self, user_profile: Dict[str, Any]) -> str:
        """
        Create hash of user profile for caching
        
        Same profile = same briefing:
        - condition (severe, moderate, mild)
        - triggers (pollen, smoke, pollution)
        - fitness_goal (optional)
        """
        profile_key = {
            'condition': user_profile.get('condition', ''),
            'triggers': sorted(user_profile.get('triggers', [])),  # Sort for consistency
            'fitness_goal': user_profile.get('fitness_goal', '')
        }
        
        profile_str = json.dumps(profile_key, sort_keys=True)
        return hashlib.md5(profile_str.encode()).hexdigest()[:8]
    
    def generate_daily_briefing(
        self,
        environmental_data: Dict[str, Any],
        user_profile: Dict[str, Any],
        lat: float,
        lon: float
    ) -> str:
        """
        Generate daily briefing with caching
        
        Cache Key: location (city-level) + profile hash
        TTL: 60 minutes
        """
        # Round coordinates to city-level
        lat_rounded = round(lat, 2)
        lon_rounded = round(lon, 2)
        
        # Create profile hash
        profile_hash = self._create_profile_hash(user_profile)
        
        # Try cache
        cached = cache_manager.get(
            'briefing',
            lat=lat_rounded,
            lon=lon_rounded,
            profile=profile_hash
        )
        
        if cached:
            logger.info(f"✅ Cache HIT: Briefing for ({lat_rounded}, {lon_rounded}) profile {profile_hash}")
            # Personalize name
            return self._personalize_briefing(cached, user_profile.get('name', 'there'))
        
        # Cache miss - generate new briefing
        logger.info(f"❌ Cache MISS: Generating briefing for ({lat_rounded}, {lon_rounded}) profile {profile_hash}")
        
        briefing = self.engine.generate_daily_briefing(
            environmental_data,
            user_profile
        )
        
        # Cache for 60 minutes
        cache_manager.set(
            'briefing',
            briefing,
            ttl_minutes=60,
            lat=lat_rounded,
            lon=lon_rounded,
            profile=profile_hash
        )
        
        return briefing
    
    def _personalize_briefing(self, briefing: str, name: str) -> str:
        """
        Personalize cached briefing with user's name
        
        Replace generic greeting with personalized one
        """
        # Common greetings to replace
        greetings = [
            "Good morning, there!",
            "Good afternoon, there!",
            "Good evening, there!",
            "Hello, there!"
        ]
        
        # Determine current greeting
        hour = datetime.utcnow().hour
        if 5 <= hour < 12:
            new_greeting = f"Good morning, {name}!"
        elif 12 <= hour < 17:
            new_greeting = f"Good afternoon, {name}!"
        elif 17 <= hour < 21:
            new_greeting = f"Good evening, {name}!"
        else:
            new_greeting = f"Hello, {name}!"
        
        # Replace any generic greeting
        personalized = briefing
        for greeting in greetings:
            if greeting in personalized:
                personalized = personalized.replace(greeting, new_greeting)
                break
        
        return personalized
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get briefing cache statistics"""
        stats = cache_manager.get_stats()
        
        # Calculate additional metrics
        total_requests = stats['hits'] + stats['misses']
        if total_requests > 0:
            # Each briefing generation costs ~$0.0001 compute
            compute_cost_per_briefing = 0.0001
            savings = stats['hits'] * compute_cost_per_briefing
            stats['compute_savings'] = round(savings, 6)
        
        return stats
    
    def invalidate_location(self, lat: float, lon: float):
        """
        Invalidate all briefings for a location
        Useful when environmental data changes significantly
        """
        lat_rounded = round(lat, 2)
        lon_rounded = round(lon, 2)
        
        # Note: This is a simplified version
        # In production, you'd want to track all profile hashes for a location
        logger.info(f"Invalidating briefings for ({lat_rounded}, {lon_rounded})")
        cache_manager.clear()  # For now, clear all


# Global instance
cached_briefing_service = CachedBriefingService()
