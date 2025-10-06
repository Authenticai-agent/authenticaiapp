"""
Briefing History Service
Stores and retrieves historical briefings for comparison and trend analysis
"""

from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import json
import logging

logger = logging.getLogger(__name__)

class BriefingHistoryService:
    """
    Manages historical briefing data for trend analysis and comparisons
    In production, this would use a database. For now, using in-memory storage.
    """
    
    def __init__(self):
        # In-memory storage: {user_id: {date: briefing_data}}
        self.history = {}
        self.max_history_days = 30  # Keep 30 days of history
    
    def store_briefing(self, user_id: str, briefing_data: Dict[str, Any]) -> str:
        """Store a briefing in history"""
        try:
            if user_id not in self.history:
                self.history[user_id] = {}
            
            date_key = datetime.now().strftime('%Y-%m-%d')
            
            # Store briefing with timestamp
            self.history[user_id][date_key] = {
                'briefing': briefing_data.get('briefing', ''),
                'metadata': briefing_data.get('metadata', {}),
                'environmental_data': briefing_data.get('environmental_data', {}),
                'timestamp': datetime.now().isoformat()
            }
            
            # Clean old history
            self._cleanup_old_history(user_id)
            
            return date_key
            
        except Exception as e:
            logger.error(f"Error storing briefing: {e}")
            return ""
    
    def get_briefing(self, user_id: str, date: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Get a specific briefing by date"""
        try:
            if user_id not in self.history:
                return None
            
            if date is None:
                date = datetime.now().strftime('%Y-%m-%d')
            
            return self.history[user_id].get(date)
            
        except Exception as e:
            logger.error(f"Error retrieving briefing: {e}")
            return None
    
    def get_yesterday_briefing(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get yesterday's briefing for comparison"""
        yesterday = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
        return self.get_briefing(user_id, yesterday)
    
    def get_briefing_history(self, user_id: str, days: int = 7) -> List[Dict[str, Any]]:
        """Get briefing history for the last N days"""
        try:
            if user_id not in self.history:
                return []
            
            history_list = []
            for i in range(days):
                date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
                briefing = self.get_briefing(user_id, date)
                if briefing:
                    briefing['date'] = date
                    history_list.append(briefing)
            
            return history_list
            
        except Exception as e:
            logger.error(f"Error retrieving briefing history: {e}")
            return []
    
    def compare_with_yesterday(self, user_id: str, today_metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Compare today's conditions with yesterday"""
        try:
            yesterday_briefing = self.get_yesterday_briefing(user_id)
            
            if not yesterday_briefing:
                return {
                    'comparison_available': False,
                    'message': 'No historical data available for comparison'
                }
            
            yesterday_metadata = yesterday_briefing.get('metadata', {})
            yesterday_env = yesterday_metadata.get('environmental_summary', {})
            today_env = today_metadata.get('environmental_summary', {})
            
            # Calculate changes
            pm25_change = today_env.get('pm25', 0) - yesterday_env.get('pm25', 0)
            ozone_change = today_env.get('ozone', 0) - yesterday_env.get('ozone', 0)
            risk_change = today_metadata.get('risk_score', 0) - yesterday_metadata.get('risk_score', 0)
            
            # Generate comparison insights
            insights = []
            
            if abs(risk_change) > 10:
                direction = "higher" if risk_change > 0 else "lower"
                insights.append(f"Risk is {abs(risk_change):.0f} points {direction} than yesterday")
            
            if abs(pm25_change) > 5:
                direction = "increased" if pm25_change > 0 else "decreased"
                insights.append(f"PM2.5 {direction} by {abs(pm25_change):.1f} μg/m³")
            
            if abs(ozone_change) > 20:
                direction = "up" if ozone_change > 0 else "down"
                insights.append(f"Ozone is {direction} {abs(ozone_change):.0f} ppb")
            
            return {
                'comparison_available': True,
                'yesterday_risk': yesterday_metadata.get('risk_score', 0),
                'today_risk': today_metadata.get('risk_score', 0),
                'risk_change': risk_change,
                'pm25_change': pm25_change,
                'ozone_change': ozone_change,
                'insights': insights if insights else ['Conditions are similar to yesterday'],
                'trend': 'improving' if risk_change < -5 else 'worsening' if risk_change > 5 else 'stable'
            }
            
        except Exception as e:
            logger.error(f"Error comparing with yesterday: {e}")
            return {'comparison_available': False, 'message': 'Error generating comparison'}
    
    def get_weekly_trend(self, user_id: str) -> Dict[str, Any]:
        """Get weekly trend analysis"""
        try:
            history = self.get_briefing_history(user_id, days=7)
            
            if len(history) < 3:
                return {
                    'trend_available': False,
                    'message': 'Insufficient data for trend analysis'
                }
            
            # Calculate averages
            risk_scores = [h['metadata'].get('risk_score', 0) for h in history]
            avg_risk = sum(risk_scores) / len(risk_scores)
            
            pm25_values = [h['metadata'].get('environmental_summary', {}).get('pm25', 0) for h in history]
            avg_pm25 = sum(pm25_values) / len(pm25_values)
            
            # Determine trend
            recent_avg = sum(risk_scores[:3]) / 3 if len(risk_scores) >= 3 else risk_scores[0]
            older_avg = sum(risk_scores[-3:]) / 3 if len(risk_scores) >= 3 else risk_scores[-1]
            
            trend = 'improving' if recent_avg < older_avg - 5 else 'worsening' if recent_avg > older_avg + 5 else 'stable'
            
            return {
                'trend_available': True,
                'days_analyzed': len(history),
                'average_risk': round(avg_risk, 1),
                'average_pm25': round(avg_pm25, 1),
                'trend': trend,
                'best_day': min(history, key=lambda x: x['metadata'].get('risk_score', 100)),
                'worst_day': max(history, key=lambda x: x['metadata'].get('risk_score', 0))
            }
            
        except Exception as e:
            logger.error(f"Error calculating weekly trend: {e}")
            return {'trend_available': False, 'message': 'Error calculating trend'}
    
    def _cleanup_old_history(self, user_id: str):
        """Remove history older than max_history_days"""
        try:
            if user_id not in self.history:
                return
            
            cutoff_date = datetime.now() - timedelta(days=self.max_history_days)
            cutoff_str = cutoff_date.strftime('%Y-%m-%d')
            
            # Remove old entries
            dates_to_remove = [
                date for date in self.history[user_id].keys()
                if date < cutoff_str
            ]
            
            for date in dates_to_remove:
                del self.history[user_id][date]
                
        except Exception as e:
            logger.error(f"Error cleaning up history: {e}")

# Initialize service
briefing_history_service = BriefingHistoryService()
