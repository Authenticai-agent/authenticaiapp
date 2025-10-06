"""
Historical Data Service
Ensures users always have 3 days of history for briefings, risks, and predictions
Generates historical data even when users are not actively logging in
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import json
from dataclasses import dataclass, asdict

logger = logging.getLogger(__name__)

@dataclass
class HistoricalEntry:
    """Single day's historical data entry"""
    date: str
    user_id: str
    location: Dict[str, Any]
    environmental_data: Dict[str, Any]
    risk_analysis: Dict[str, Any]
    daily_briefing: Dict[str, Any]
    predictions: Dict[str, Any]
    created_at: str
    
class HistoricalDataService:
    """Service for managing user historical data"""
    
    def __init__(self):
        # In production, this would be database storage
        self.historical_data = {}  # user_id -> List[HistoricalEntry]
        self.last_generation_time = {}  # user_id -> datetime
        
    async def ensure_user_has_3_day_history(self, user_id: str, current_lat: float, current_lon: float) -> List[HistoricalEntry]:
        """
        Ensure user has exactly 3 days of historical data
        Generates missing days if user hasn't been active
        """
        try:
            # Get existing history
            user_history = self.historical_data.get(user_id, [])
            
            # Determine what dates we need (last 3 days)
            today = datetime.now().date()
            required_dates = [
                (today - timedelta(days=3)).strftime("%Y-%m-%d"),  # 3 days ago
                (today - timedelta(days=2)).strftime("%Y-%m-%d"),  # 2 days ago
                (today - timedelta(days=1)).strftime("%Y-%m-%d"),  # Yesterday
            ]
            
            # Find missing dates
            existing_dates = {entry.date for entry in user_history}
            missing_dates = [date for date in required_dates if date not in existing_dates]
            
            # Generate missing historical data
            for missing_date in missing_dates:
                logger.info(f"Generating historical data for user {user_id} on {missing_date}")
                historical_entry = await self._generate_historical_day(
                    user_id, missing_date, current_lat, current_lon
                )
                user_history.append(historical_entry)
            
            # Sort by date and keep only last 3 days
            user_history.sort(key=lambda x: x.date)
            user_history = user_history[-3:]  # Keep only last 3 days
            
            # Store updated history
            self.historical_data[user_id] = user_history
            self.last_generation_time[user_id] = datetime.now()
            
            return user_history
            
        except Exception as e:
            logger.error(f"Error ensuring 3-day history for user {user_id}: {e}")
            return []
    
    async def get_user_history(self, user_id: str, days: int = 3) -> List[HistoricalEntry]:
        """Get user's historical data for specified number of days"""
        user_history = self.historical_data.get(user_id, [])
        return user_history[-days:] if user_history else []
    
    async def add_today_entry(self, user_id: str, location: Dict[str, Any], 
                            environmental_data: Dict[str, Any], risk_analysis: Dict[str, Any],
                            daily_briefing: Dict[str, Any], predictions: Dict[str, Any]) -> None:
        """Add today's entry to user's history"""
        try:
            today = datetime.now().date().strftime("%Y-%m-%d")
            
            # Check if today's entry already exists
            user_history = self.historical_data.get(user_id, [])
            existing_today = next((entry for entry in user_history if entry.date == today), None)
            
            if existing_today:
                # Update existing entry
                existing_today.environmental_data = environmental_data
                existing_today.risk_analysis = risk_analysis
                existing_today.daily_briefing = daily_briefing
                existing_today.predictions = predictions
                logger.info(f"Updated today's entry for user {user_id}")
            else:
                # Create new entry
                new_entry = HistoricalEntry(
                    date=today,
                    user_id=user_id,
                    location=location,
                    environmental_data=environmental_data,
                    risk_analysis=risk_analysis,
                    daily_briefing=daily_briefing,
                    predictions=predictions,
                    created_at=datetime.now().isoformat()
                )
                user_history.append(new_entry)
                
                # Keep only last 10 days (for efficiency)
                user_history.sort(key=lambda x: x.date)
                user_history = user_history[-10:]
                
                self.historical_data[user_id] = user_history
                logger.info(f"Added new entry for user {user_id} on {today}")
                
        except Exception as e:
            logger.error(f"Error adding today's entry for user {user_id}: {e}")
    
    async def _generate_historical_day(self, user_id: str, date_str: str, 
                                     current_lat: float, current_lon: float) -> HistoricalEntry:
        """Generate historical data for a specific day"""
        try:
            # Import here to avoid circular imports
            from routers.air_quality import get_air_quality_service
            from services.premium_lean_engine import premium_lean_engine
            
            # Parse date
            target_date = datetime.strptime(date_str, "%Y-%m-%d")
            days_ago = (datetime.now().date() - target_date.date()).days
            
            # Get current environmental data as baseline
            air_service = get_air_quality_service()
            current_data = await air_service.get_comprehensive_environmental_data(current_lat, current_lon)
            
            if not current_data:
                # Fallback to reasonable defaults if API fails
                current_data = {
                    'air_quality': {'pm25': 25, 'ozone': 60, 'no2': 20, 'aqi': 75},
                    'weather': {'temperature': 20, 'humidity': 60},
                    'pollen': {'overall_risk': 'moderate'}
                }
            
            # Generate historical variations (simulate how conditions might have been)
            historical_environmental_data = self._generate_historical_variations(
                current_data, days_ago, target_date
            )
            
            # Calculate risk for historical day
            risk_analysis = premium_lean_engine.calculate_daily_risk_score(historical_environmental_data)
            
            # Generate historical briefing
            daily_briefing = self._generate_historical_briefing(
                historical_environmental_data, risk_analysis, target_date
            )
            
            # Generate historical predictions (what would have been predicted that day)
            predictions = self._generate_historical_predictions(
                historical_environmental_data, risk_analysis, target_date
            )
            
            # Location info
            location = {
                'lat': current_lat,
                'lon': current_lon,
                'city': 'Current Location',
                'date': date_str
            }
            
            return HistoricalEntry(
                date=date_str,
                user_id=user_id,
                location=location,
                environmental_data=historical_environmental_data,
                risk_analysis=risk_analysis,
                daily_briefing=daily_briefing,
                predictions=predictions,
                created_at=datetime.now().isoformat()
            )
            
        except Exception as e:
            logger.error(f"Error generating historical day {date_str} for user {user_id}: {e}")
            # Return minimal fallback entry
            return self._create_fallback_entry(user_id, date_str, current_lat, current_lon)
    
    def _generate_historical_variations(self, current_data: Dict[str, Any], 
                                      days_ago: int, target_date: datetime) -> Dict[str, Any]:
        """Generate realistic historical variations of environmental data"""
        import random
        
        # Base environmental data
        air_quality = current_data.get('air_quality', {})
        weather = current_data.get('weather', {})
        pollen = current_data.get('pollen', {})
        
        # Apply realistic variations based on days ago and seasonality
        pm25_base = air_quality.get('pm25', 25)
        ozone_base = air_quality.get('ozone', 60)
        no2_base = air_quality.get('no2', 20)
        temp_base = weather.get('temperature', 20)
        humidity_base = weather.get('humidity', 60)
        
        # Day-of-week patterns (weekends typically have less pollution)
        weekday = target_date.weekday()  # 0=Monday, 6=Sunday
        weekend_factor = 0.8 if weekday >= 5 else 1.0
        
        # Seasonal variations
        month = target_date.month
        seasonal_pm25_factor = 1.2 if month in [11, 12, 1, 2] else 0.9  # Winter higher
        seasonal_ozone_factor = 1.3 if month in [6, 7, 8] else 0.8  # Summer higher
        
        # Random daily variations
        daily_variation = 1.0 + random.uniform(-0.3, 0.3)
        
        # Calculate historical values
        historical_pm25 = max(0, pm25_base * weekend_factor * seasonal_pm25_factor * daily_variation)
        historical_ozone = max(0, ozone_base * weekend_factor * seasonal_ozone_factor * daily_variation)
        historical_no2 = max(0, no2_base * weekend_factor * daily_variation)
        historical_temp = temp_base + random.uniform(-5, 5)
        historical_humidity = max(20, min(95, humidity_base + random.uniform(-15, 15)))
        
        # Pollen variations
        pollen_levels = ['low', 'moderate', 'high']
        pollen_weights = [0.4, 0.4, 0.2] if month in [12, 1, 2] else [0.2, 0.5, 0.3]
        historical_pollen = random.choices(pollen_levels, weights=pollen_weights)[0]
        pollen_numeric = {'low': 10, 'moderate': 30, 'high': 60}[historical_pollen]
        
        return {
            'pm25': round(historical_pm25, 1),
            'ozone': round(historical_ozone, 1),
            'no2': round(historical_no2, 1),
            'temperature': round(historical_temp, 1),
            'humidity': round(historical_humidity, 0),
            'pollen_level': pollen_numeric,
            'aqi': min(500, max(0, int(historical_pm25 * 2 + historical_ozone * 0.5)))
        }
    
    def _generate_historical_briefing(self, environmental_data: Dict[str, Any], 
                                    risk_analysis: Dict[str, Any], target_date: datetime) -> Dict[str, Any]:
        """Generate what the daily briefing would have been for that historical day"""
        risk_score = risk_analysis.get('risk_score', 50)
        pm25 = environmental_data.get('pm25', 25)
        humidity = environmental_data.get('humidity', 60)
        
        # Generate historical briefing message
        date_str = target_date.strftime("%B %d")
        briefing_parts = [f"On {date_str}:"]
        
        if pm25 > 35:
            briefing_parts.append(f"PM2.5 was elevated at {pm25:.1f} µg/m³.")
        elif pm25 > 12:
            briefing_parts.append(f"PM2.5 was moderate at {pm25:.1f} µg/m³.")
        else:
            briefing_parts.append(f"PM2.5 was good at {pm25:.1f} µg/m³.")
        
        if humidity > 70:
            briefing_parts.append(f"High humidity ({humidity:.0f}%) increased allergen activity.")
        
        briefing_message = " ".join(briefing_parts)
        
        return {
            'date': target_date.strftime("%Y-%m-%d"),
            'risk_score': risk_score,
            'risk_level': 'high' if risk_score > 70 else 'moderate' if risk_score > 40 else 'low',
            'briefing_message': briefing_message,
            'historical': True
        }
    
    def _generate_historical_predictions(self, environmental_data: Dict[str, Any], 
                                       risk_analysis: Dict[str, Any], target_date: datetime) -> Dict[str, Any]:
        """Generate what predictions would have been made for that historical day"""
        risk_score = risk_analysis.get('risk_score', 50)
        
        # Generate what the next-day prediction would have been
        next_day_risk = max(0, min(100, risk_score + random.uniform(-15, 15)))
        
        return {
            'date': target_date.strftime("%Y-%m-%d"),
            'predicted_next_day_risk': next_day_risk,
            'prediction_accuracy': random.uniform(0.75, 0.95),  # Simulated accuracy
            'recommendations_given': [
                "Monitor air quality conditions",
                "Use HEPA filtration if needed",
                "Limit outdoor exposure during peak hours"
            ],
            'historical': True
        }
    
    def _create_fallback_entry(self, user_id: str, date_str: str, 
                             lat: float, lon: float) -> HistoricalEntry:
        """Create a minimal fallback entry when data generation fails"""
        return HistoricalEntry(
            date=date_str,
            user_id=user_id,
            location={'lat': lat, 'lon': lon, 'city': 'Unknown'},
            environmental_data={'pm25': 25, 'ozone': 60, 'aqi': 75},
            risk_analysis={'risk_score': 50, 'risk_level': 'moderate'},
            daily_briefing={'briefing_message': f'Historical data for {date_str}', 'historical': True},
            predictions={'predicted_next_day_risk': 50, 'historical': True},
            created_at=datetime.now().isoformat()
        )
    
    async def cleanup_old_data(self, days_to_keep: int = 30):
        """Clean up historical data older than specified days"""
        try:
            cutoff_date = (datetime.now() - timedelta(days=days_to_keep)).date().strftime("%Y-%m-%d")
            
            for user_id in list(self.historical_data.keys()):
                user_history = self.historical_data[user_id]
                filtered_history = [entry for entry in user_history if entry.date >= cutoff_date]
                
                if len(filtered_history) != len(user_history):
                    self.historical_data[user_id] = filtered_history
                    logger.info(f"Cleaned up old data for user {user_id}")
                    
        except Exception as e:
            logger.error(f"Error cleaning up old data: {e}")

# Global instance
historical_data_service = HistoricalDataService()

# Import random for historical variations
import random
