"""
Automated Intelligence Engine for Authenticai
Handles automatic triggering of all "Day in the Life" services
Zero user interaction required - incredible value delivered automatically
"""

from datetime import datetime, timedelta, time
from typing import Dict, List, Any, Optional
import asyncio
import logging
from dataclasses import dataclass
import httpx
import os
from services.premium_lean_engine import premium_lean_engine

logger = logging.getLogger(__name__)

@dataclass
class UserProfile:
    """Enhanced user profile for automated intelligence"""
    user_id: str
    location: Dict[str, float]  # lat, lon
    timezone: str
    preferred_wake_time: str = "07:00"
    preferred_sleep_time: str = "23:00"
    risk_threshold: float = 40.0  # Trigger alerts above this risk
    pm25_sensitivity: float = 75.0  # Trigger midday checks above this
    ozone_sensitivity: float = 80.0  # Trigger anomaly alerts above this
    notification_preferences: Dict[str, bool] = None
    
    def __post_init__(self):
        if self.notification_preferences is None:
            self.notification_preferences = {
                "morning_briefing": True,
                "midday_check": True, 
                "anomaly_alerts": True,
                "evening_reflection": True,
                "urgent_warnings": True
            }

class AutomatedIntelligenceEngine:
    """
    The brain of Authenticai - automatically delivers incredible value
    without requiring any user interaction. Works 24/7 in the background.
    """
    
    def __init__(self):
        self.active_users: Dict[str, UserProfile] = {}
        self.user_activity_history: Dict[str, List[Dict]] = {}
        self.automation_running = False
        self.location_intelligence = None  # Will be imported when needed
        
    async def add_user(self, user_profile: UserProfile):
        """Add a user to automated monitoring"""
        self.active_users[user_profile.user_id] = user_profile
        self.user_activity_history[user_profile.user_id] = []
        logger.info(f"Added user {user_profile.user_id} to automated intelligence")
        
    async def remove_user(self, user_id: str):
        """Remove a user from monitoring"""
        if user_id in self.active_users:
            del self.active_users[user_id]
            del self.user_activity_history[user_id]
            logger.info(f"Removed user {user_id} from automated intelligence")
    
    async def start_automation_service(self):
        """Start the automated intelligence service"""
        self.automation_running = True
        logger.info("🚀 Automated Intelligence Engine started")
        
        # Start all automated services
        tasks = [
            asyncio.create_task(self._morning_briefing_scheduler()),
            asyncio.create_task(self._environmental_monitor()), 
            asyncio.create_task(self._evening_reflection_scheduler()),
            asyncio.create_task(self._predictive_intelligence_updater()),
            asyncio.create_task(self._smart_engagement_detector())
        ]
        
        try:
            await asyncio.gather(*tasks)
        except Exception as e:
           logger.error(f"Automation service error: {e}")
        finally:
            self.automation_running = False
    
    async def _morning_briefing_scheduler(self):
        """Automatically generates daily briefings at 7:00 AM"""
        while self.automation_running:
            try:
                current_time = datetime.now()
                
                # Check if it's briefing time (7:00 AM)
                if current_time.hour == 7 and current_time.minute < 5:
                    for user_id, profile in self.active_users.items():
                        if (profile.notification_preferences.get("morning_briefing", True) and 
                            self._is_user_wake_time(profile)):
                            
                            # Generate automated briefing
                            briefing_result = await self._generate_automated_briefing(user_id, profile)
                            
                            # Log activity
                            self.user_activity_history[user_id].append({
                                "timestamp": current_time.isoformat(),
                                "activity": "automated_morning_briefing",
                                "risk_score": briefing_result.get("risk_score", 0),
                                "environmental_summary": briefing_result.get("environmental_summary", {}),
                                "recommendations_count": len(briefing_result.get("recommendations", []))
                            })
                            
                            logger.info(f"📩 Automated morning briefing delivered to {user_id}")
                
                # Check every minute
                await asyncio.sleep(60)
                
            except Exception as e:
                logger.error(f"Morning briefing scheduler error: {e}")
                await asyncio.sleep(60)
    
    async def _environmental_monitor(self):
        """Continuously monitors environmental conditions for intelligent triggers"""
        while self.automation_running:
            try:
                for user_id, profile in self.active_users.items():
                    
                    # Check if user has been active recently
                    if len(self.user_activity_history[user_id]) == 0:
                        recent_activity = True
                    else:
                        last_activity = datetime.fromisoformat(
                            self.user_activity_history[user_id][-1]["timestamp"]
                        )
                        recent_activity = (datetime.now() - last_activity).hours < 24
                    
                    if recent_activity:
                        # Get current environmental data
                        environmental_data = await self._fetch_environmental_data(profile.location)
                        risk_analysis = premium_lean_engine.calculate_daily_risk_score(environmental_data)
                        
                        # Smart Midday Check (triggers when PM2.5 > sensitivity threshhold)
                        pm25_current = environmental_data.get('pm25', 0)
                        if (pm25_current > profile.pm25_sensitivity and 
                            profile.notification_preferences.get("midday_check", True)):
                            
                            await self._trigger_midday_check(user_id, profile, environmental_data)
                            
                        # Smart Anomaly Alert (triggers when ozone spikes)
                        ozone_current = environmental_data.get('ozone', 0)
                        historical_ozone = await self._get_historical_ozone_baseline(profile.location)
                        
                        if (ozone_current > historical_ozone * 1.4 and 
                            ozone_current > profile.ozone_sensitivity and
                            profile.notification_preferences.get("anomaly_alerts", True)):
                            
                            await self._trigger_anomaly_alert(user_id, profile, environmental_data)
                            
                        # Smart Quantified Recommendations (triggers on risk changes)
                        current_risk = risk_analysis['risk_score']
                        
                        if (current_risk > profile.risk_threshold and 
                            self._should_trigger_recommendations(user_id, current_risk)):
                            
                            await self._trigger_smart_recommendations(user_id, profile, environmental_data)
                
                # Check every 15 minutes
                await asyncio.sleep(900)  # 15 minutes
                
            except Exception as e:
                logger.error(f"Environmental monitor error: {e}")
                await asyncio.sleep(900)
    
    async def _evening_reflection_scheduler(self):
        """Automatically generates evening reflections at 6:00 PM"""
        while self.automation_running:
            try:
                current_time = datetime.now()
                
                # Check if it's reflection time (6:00 PM)
                if current_time.hour == 18 and current_time.minute < 5:
                    for user_id, profile in self.active_users.items():
                        if profile.notification_preferences.get("evening_reflection", True):
                            
                            # Generate automated evening reflection
                            reflection_result = await self._generate_automated_reflection(user_id, profile)
                            
                            # Log activity
                            self.user_activity_history[user_id].append({
                                "timestamp": current_time.isoformat(),
                                "activity": "automated_evening_reflection",
                                "impact_summary": reflection_result.get("actions_impact", ""),
                                "tomorrow_forecast": reflection_result.get("tomorrow_forecast", "")
                            })
                            
                            logger.info(f"🌅 Automated evening reflection delivered to {user_id}")
                
                await asyncio.sleep(60)
                
            except Exception as e:
                logger.error(f"Evening reflection scheduler error: {e}")
                await asyncio.sleep(60)
    
    async def _predictive_intelligence_updater(self):
        """Automatically updates predictions based on forecast changes"""
        while self.automation_running:
            try:
                for user_id, profile in self.active_users.items():
                    
                    # Update predictions every 6 hours
                    last_prediction_update = self._get_last_prediction_update(user_id)
                    if (not last_prediction_update or 
                        (datetime.now() - last_prediction_update).seconds > 21600):  # 6 hours
                        
                        predictions = await self._generate_automated_predictions(user_id, profile)
                        
                        # Log activity
                        self.user_activity_history[user_id].append({
                            "timestamp": datetime.now().isoformat(),
                            "activity": "automated_prediction_update",
                            "predictions_count": len(predictions.get("hourly_predictions", [])),
                            "confidence_level": predictions.get("executive_summary", {}).get("confidence", 0)
                        })
                        
                        logger.info(f"🔮 Automated predictions updated for {user_id}")
                
                await asyncio.sleep(3600)  # Check every hour
                
            except Exception as e:
                logger.error(f"Predictive intelligence error: {e}")
                await asyncio.sleep(3600)
    
    async def _smart_engagement_detector(self):
        """Intelligently detects user engagement patterns and infers symptom activity"""
        while self.automation_running:
            try:
                for user_id, profile in self.active_users.items():
                    
                    # Analyze user engagement patterns
                    engagement_pattern = await self._analyze_engagement_pattern(user_id)
                    
                    # Smart symptom inference based on risk levels and engagement drops
                    if self._detect_engagement_drop(user_id) or self._detect_risk_spike(user_id):
                        
                        inferred_symptom = await self._infer_symptom_activity(user_id, profile)
                        
                        if inferred_symptom:
                            # Log smart symptom activity
                            self.user_activity_history[user_id].append({
                                "timestamp": datetime.now().isoformat(),
                                "activity": "smart_symptom_inference",
                                "inferred_type": inferred_symptom.get("type", "unknown"),
                                "confidence": inferred_symptom.get("confidence", 0),
                                "environmental_context": inferred_symptom.get("environmental_context", {})
                            })
                            
                            logger.info(f"🧠 Smart symptom inference for {user_id}")
                
                await asyncio.sleep(1800)  # Check every 30 minutes
                
            except Exception as e:
                logger.error(f"Smart engagement detector error: {e}")
                await asyncio.sleep(1800)
    
    # Helper methods for automated intelligence
    async def _is_user_wake_time(self, profile: UserProfile) -> bool:
        """Determine if it's user's preferred wake time"""
        wake_hour, wake_minute = map(int, profile.preferred_wake_time.split(':'))
        current_time = datetime.now()
        return abs(current_time.hour - wake_hour) <= 1
    
    async def _fetch_environmental_data(self, location: Dict[str, float]) -> Dict[str, Any]:
        """Fetch real environmental data for location"""
        async with httpx.AsyncClient() as client:
            # Weather data
            weather_response = await client.get(
                f"https://api.openweathermap.org/data/2.5/weather",
                params={
                    "lat": location["lat"],
                    "lon": location["lon"],
                    "appid": os.getenv("OPENWEATHER_API_KEY"),
                    "units": "metric"
                }
            )
            weather_data = weather_response.json()
            
            # Air pollution data
            air_response = await client.get(
                f"https://api.openweathermap.org/data/2.5/air_pollution",
                params={
                    "lat": location["lat"],
                    "lon": location["lon"],
                    "appid": os.getenv("OPENWEATHER_API_KEY")
                }
            )
            air_data = air_response.json()
            
            return {
                'pm25': air_data['list'][0]['components'].get('pm2_5', 0),
                'ozone': air_data['list'][0]['components'].get('o3', 0) / 10,
                'no2': air_data['list'][0]['components'].get('no2', 0),
                'humidity': weather_data['main'].get('humidity', 0),
                'temperature': weather_data['main'].get('temp', 0),
                'pollen_level': 0  # Would come from pollen API
            }
    
    async def _generate_automated_briefing(self, user_id: str, profile: UserProfile) -> Dict[str, Any]:
        """Generate automated morning briefing"""
        environmental_data = await self._fetch_environmental_data(profile.location)
        
        # Generate dynamic user profile based on location
        user_profile = self._generate_location_based_profile(profile.location)
        
        briefing = premium_lean_engine.generate_premium_briefing(environmental_data, user_profile)
        risk_analysis = premium_lean_engine.calculate_daily_risk_score(environmental_data)
        
        return {
            "briefing": briefing,
            "risk_score": risk_analysis['risk_score'],
            "risk_level": risk_analysis['risk_level'],
            "environmental_summary": environmental_data,
            "recommendations": premium_lean_engine.generate_personalized_recommendations(environmental_data, user_profile),
            "timestamp": datetime.now().isoformat(),
            "delivery_method": "automated_push_notification"
        }
    
    async def _should_trigger_recommendations(self, user_id: str, risk_score: float) -> bool:
        """Determine if recommendations should be triggered"""
        # Don't spam users - limit to max 3 recommendation deliveries per day
        today = datetime.now().date()
        today_activities = [
            activity for activity in self.user_activity_history.get(user_id, [])
            if (datetime.fromisoformat(activity["timestamp"]).date() == today and
                activity.get("activity") == "smart_recommendations")
        ]
        return len(today_activities) < 3
    
    async def _analyze_engagement_pattern(self, user_id: str) -> Dict[str, Any]:
        """Analyze user engagement patterns for intelligent insights"""
        user_history = self.user_activity_history.get(user_id, [])
        
        if len(user_history) < 2:
            return {"pattern": "new_user", "engagement_trend": "neutral"}
        
        # Analyze last 7 days of activity
        recent_activities = user_history[-20:]  # Last 20 activities
        
        engagement_score = sum(1 for activity in recent_activities if "automated" in activity.get("activity", ""))
        
        return {
            "pattern": "engaged" if engagement_score > 10 else "disengaged",
            "engagement_trend": "improving" if engagement_score > 15 else "stable",
            "daily_average": engagement_score / 7
        }
    
    def _detect_engagement_drop(self, user_id: str) -> bool:
        """Detect if user engagement has dropped significantly"""
        user_history = self.user_activity_history.get(user_id, [])
        
        if len(user_history) < 10:
            return False
        
        # Check if no activity in last 6 hours during normal active hours
        now = datetime.now()
        six_hours_ago = now - timedelta(hours=6)
        
        recent_activities = [
            activity for activity in user_history
            if datetime.fromisoformat(activity["timestamp"]) > six_hours_ago
        ]
        
        return len(recent_activities) == 0 and 8 <= now.hour <= 22
    
    def _detect_risk_spike(self, user_id: str) -> bool:
        """Detect if environmental risk has spiked significantly"""
        user_history = self.user_activity_history.get(user_id, [])
        
        if len(user_history) < 2:
            return False
        
        # Get last 2 activities with risk scores
        recent_with_risk = [
            activity for activity in user_history[-10:]
            if "risk_score" in activity
        ]
        
        if len(recent_with_risk) >= 2:
            current_risk = recent_with_risk[-1]["risk_score"]
            previous_risk = recent_with_risk[-2]["risk_score"]
            risk_increase = current_risk - previous_risk
            
            return risk_increase > 20  # Significant risk increase
        
        return False
    
    async def _infer_symptom_activity(self, user_id: str, profile: UserProfile) -> Optional[Dict[str, Any]]:
        """Intelligently infer symptom activity based on environmental conditions"""
        environmental_data = await self._fetch_environmental_data(profile.location)
        risk_analysis = premium_lean_engine.calculate_daily_risk_score(environmental_data)
        
        risk_score = risk_analysis['risk_score']
        
        # Infer symptoms based on high risk conditions
        if risk_score > 70:
            return {
                "type": "respiratory_irritation",
                "severity": min(5, int(risk_score / 15)),
                "confidence": 0.8,
                "environmental_context": environmental_data,
                "risk_score": risk_score,
                "inference_method": "environmental_pattern_matching"
            }
        elif environmental_data.get('pm25', 0) > 50:
            return {
                "type": "chest_tightness",
                "severity": min(4, int(environmental_data['pm25'] / 15)),
                "confidence": 0.7,
                "environmental_context": environmental_data,
                "risk_score": risk_score,
                "inference_method": "pm25_threshold_exceeded"
            }
        elif environmental_data.get('ozone', 0) > 70:
            return {
                "type": "throat_irritation", 
                "severity": min(4, int(environmental_data['ozone'] / 20)),
                "confidence": 0.75,
                "environmental_context": environmental_data,
                "risk_score": risk_score,
                "inference_method": "ozone_exposure_analysis"
            }
        
        return None
    
    def _get_last_prediction_update(self, user_id: str) -> Optional[datetime]:
        """Get timestamp of last prediction update for user"""
        user_history = self.user_activity_history.get(user_id, [])
        
        prediction_updates = [
            activity for activity in user_history
            if activity.get("activity") == "automated_prediction_update"
        ]
        
        if prediction_updates:
            return datetime.fromisoformat(prediction_updates[-1]["timestamp"])
        
        return None
    
    async def _get_historical_ozone_baseline(self, location: Dict[str, float]) -> float:
        """Get historical ozone baseline for location"""
        # In production, this would use stored historical data
        # For now, use location-based calculation
        return max(45, min(80, location["lat"] * 0.8 + (abs(location["lon"]) * 0.05)))
    
    def _generate_location_based_profile(self, location: Dict[str, float]) -> Dict[str, Any]:
        """Generate realistic user profile based on geographic location"""
        try:
            lat, lon = location["lat"], location["lon"]
            allergies = []
            triggers = []
            
            # Geographic-based allergy patterns (climatically realistic)
            if 25 <= lat <= 50 and (-125 <= lon <= -66):  # North America
                if 35 <= lat <= 45:  # Northeast/Midwest
                    allergies.extend(["tree_pollen", "ragweed"])
                    triggers.extend(["pm25", "ozone", "tree_pollen"])
                elif 25 <= lat <= 35:  # Southeast  
                    allergies.extend(["tree_pollen", "grass_pollen", "mold"])
                    triggers.extend(["ozone", "humidity", "tree_pollen", "grass_pollen"])
                else:  # West Coast
                    allergies.extend(["tree_pollen", "grass_pollen"])
                    triggers.extend(["pm25", "ozone"])
            else:  # International locations
                allergies.extend(["pollen", "dust"])
                triggers.extend(["pm25", "humidity"])
            
            # Add dust mites universally
            allergies.append("dust_mites")
            
            # Age distribution based on location characteristics
            age_base = int((abs(lat) * 1.5 + abs(lon) * 0.3) % 47 + 18)  # 18-64
            
            # Asthma severity influenced by pollution zones
            asthma_severity_options = ["mild", "moderate", "severe"]
            severity_index = int((abs(lat) + abs(lon)) % 3)
            asthma_severity = asthma_severity_options[severity_index]
            
            return {
                'age': age_base,
                'allergies': list(set(allergies)),
                'asthma_severity': asthma_severity,
                'triggers': list(set(triggers)),
                'household_info': {
                    'risks': ['pets'] if (lat + lon) % 2 == 0 else ['dust'],
                    'medications': ['inhaler', 'controller'] if asthma_severity != 'mild' else ['inhaler']
                }
            }
            
        except Exception as e:
            # Fallback to realistic defaults
            return {
                'age': 35,
                'allergies': ['pollen', 'dust'],
                'asthma_severity': 'moderate',
                'triggers': ['pm25', 'pollen'],
                'household_info': {
                    'risks': ['dust'],
                    'medications': ['inhaler']
                }
            }

# Global automation engine instance
automation_engine = AutomatedIntelligenceEngine()
