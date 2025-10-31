"""
Briefing Usage Service
Enforces STRICT 5 briefings per day limit for free users using database storage
This ensures the limit persists across:
- Logout/login
- localStorage clear
- Hard refresh
- Different devices
- Server restarts
"""

from datetime import datetime, date, timedelta
from typing import Optional, Dict
from services.supabase_client import get_supabase_client
import logging

logger = logging.getLogger(__name__)

class BriefingUsageService:
    """Service to track and enforce daily briefing limits"""
    
    FREE_TIER_DAILY_LIMIT = 5
    PREMIUM_TIER_DAILY_LIMIT = 999  # Effectively unlimited
    
    def __init__(self):
        self.supabase = get_supabase_client()
    
    def get_daily_usage(self, user_id: str, subscription_tier: str = 'free') -> Dict:
        """
        Get today's briefing usage for a user
        
        Returns:
            {
                'count': int,
                'limit': int,
                'remaining': int,
                'can_generate': bool,
                'date': str
            }
        """
        try:
            today = date.today().isoformat()
            
            # Determine limit based on subscription tier
            limit = (self.PREMIUM_TIER_DAILY_LIMIT if subscription_tier == 'premium' 
                    else self.FREE_TIER_DAILY_LIMIT)
            
            # Get or create today's usage record
            response = self.supabase.table('briefing_usage').select('*').eq(
                'user_id', user_id
            ).eq(
                'usage_date', today
            ).execute()
            
            if response.data and len(response.data) > 0:
                usage = response.data[0]
                count = usage['briefing_count']
            else:
                # Create new record for today
                insert_response = self.supabase.table('briefing_usage').insert({
                    'user_id': user_id,
                    'usage_date': today,
                    'briefing_count': 0
                }).execute()
                
                if insert_response.data and len(insert_response.data) > 0:
                    count = 0
                else:
                    logger.error(f"Failed to create briefing usage record for user {user_id}")
                    count = 0
            
            remaining = max(0, limit - count)
            can_generate = count < limit
            
            return {
                'count': count,
                'limit': limit,
                'remaining': remaining,
                'can_generate': can_generate,
                'date': today,
                'subscription_tier': subscription_tier
            }
            
        except Exception as e:
            logger.error(f"Error getting briefing usage for user {user_id}: {e}")
            # Fail closed - don't allow generation if we can't check
            return {
                'count': 999,
                'limit': self.FREE_TIER_DAILY_LIMIT,
                'remaining': 0,
                'can_generate': False,
                'date': date.today().isoformat(),
                'error': str(e)
            }
    
    def increment_usage(self, user_id: str, subscription_tier: str = 'free') -> Dict:
        """
        Increment briefing count for today
        
        Returns updated usage info or raises exception if limit exceeded
        """
        try:
            today = date.today().isoformat()
            
            # Get current usage
            usage_info = self.get_daily_usage(user_id, subscription_tier)
            
            # STRICT CHECK: Don't allow if limit reached
            if not usage_info['can_generate']:
                logger.warning(f"User {user_id} attempted to exceed daily briefing limit")
                raise Exception(
                    f"Daily briefing limit reached ({usage_info['count']}/{usage_info['limit']}). "
                    f"Resets tomorrow."
                )
            
            # Increment the count
            response = self.supabase.table('briefing_usage').update({
                'briefing_count': usage_info['count'] + 1,
                'last_briefing_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }).eq(
                'user_id', user_id
            ).eq(
                'usage_date', today
            ).execute()
            
            if not response.data:
                logger.error(f"Failed to increment briefing count for user {user_id}")
                raise Exception("Failed to update briefing usage")
            
            # Return updated usage
            new_count = usage_info['count'] + 1
            remaining = max(0, usage_info['limit'] - new_count)
            
            logger.info(
                f"✅ Briefing usage incremented for user {user_id}: "
                f"{new_count}/{usage_info['limit']} (remaining: {remaining})"
            )
            
            return {
                'count': new_count,
                'limit': usage_info['limit'],
                'remaining': remaining,
                'can_generate': new_count < usage_info['limit'],
                'date': today,
                'subscription_tier': subscription_tier
            }
            
        except Exception as e:
            logger.error(f"Error incrementing briefing usage for user {user_id}: {e}")
            raise
    
    def can_generate_briefing(self, user_id: str, subscription_tier: str = 'free') -> bool:
        """
        Check if user can generate a briefing today
        
        This is the STRICT enforcement point
        """
        usage_info = self.get_daily_usage(user_id, subscription_tier)
        return usage_info['can_generate']
    
    def get_usage_stats(self, user_id: str, days: int = 7) -> Dict:
        """Get usage statistics for the past N days"""
        try:
            from_date = (date.today() - timedelta(days=days)).isoformat()
            
            response = self.supabase.table('briefing_usage').select('*').eq(
                'user_id', user_id
            ).gte(
                'usage_date', from_date
            ).order(
                'usage_date', desc=True
            ).execute()
            
            if response.data:
                total_briefings = sum(record['briefing_count'] for record in response.data)
                avg_per_day = total_briefings / days if days > 0 else 0
                
                return {
                    'total_briefings': total_briefings,
                    'average_per_day': round(avg_per_day, 2),
                    'days_tracked': days,
                    'daily_records': response.data
                }
            
            return {
                'total_briefings': 0,
                'average_per_day': 0,
                'days_tracked': days,
                'daily_records': []
            }
            
        except Exception as e:
            logger.error(f"Error getting usage stats for user {user_id}: {e}")
            return {
                'total_briefings': 0,
                'average_per_day': 0,
                'days_tracked': days,
                'daily_records': [],
                'error': str(e)
            }


# Global instance
briefing_usage_service = BriefingUsageService()
