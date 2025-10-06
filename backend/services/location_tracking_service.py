"""
Location Tracking Service
Handles automatic location detection, travel mode detection, and location-based updates
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from geopy.distance import geodesic
from geopy.geocoders import Nominatim
import json

logger = logging.getLogger(__name__)

class LocationTrackingService:
    """Service for tracking user location changes and triggering updates"""
    
    def __init__(self):
        self.geocoder = Nominatim(user_agent="authenticai_health_coach")
        self.location_threshold_km = 5.0  # Minimum distance to trigger location change
        self.travel_speed_threshold_kmh = 30.0  # Speed indicating travel mode
        self.location_history = {}  # In production, this would be database storage
        
    async def update_user_location(self, user_id: str, lat: float, lon: float, 
                                 timestamp: Optional[datetime] = None) -> Dict[str, Any]:
        """
        Update user location and detect if significant change occurred
        Returns location change analysis and triggers updates if needed
        """
        try:
            if timestamp is None:
                timestamp = datetime.utcnow()
            
            # Get previous location
            previous_location = self.get_last_location(user_id)
            
            # Calculate distance from previous location
            distance_km = 0.0
            travel_speed_kmh = 0.0
            location_changed = False
            
            if previous_location:
                distance_km = self._calculate_distance(
                    (previous_location['lat'], previous_location['lon']),
                    (lat, lon)
                )
                
                # Calculate travel speed
                time_diff = timestamp - datetime.fromisoformat(previous_location['timestamp'])
                time_hours = time_diff.total_seconds() / 3600
                if time_hours > 0:
                    travel_speed_kmh = distance_km / time_hours
                
                # Check if location change is significant
                location_changed = distance_km >= self.location_threshold_km
            
            # Get location details
            location_details = await self._get_location_details(lat, lon)
            
            # Store new location
            new_location = {
                'lat': lat,
                'lon': lon,
                'timestamp': timestamp.isoformat(),
                'city': location_details.get('city', 'Unknown'),
                'state': location_details.get('state', 'Unknown'),
                'country': location_details.get('country', 'Unknown'),
                'address': location_details.get('address', 'Unknown'),
                'distance_from_previous': distance_km,
                'travel_speed_kmh': travel_speed_kmh
            }
            
            self._store_location(user_id, new_location)
            
            # Determine travel mode
            travel_mode = self._detect_travel_mode(travel_speed_kmh, distance_km)
            
            result = {
                'location_changed': location_changed,
                'distance_moved_km': distance_km,
                'travel_speed_kmh': travel_speed_kmh,
                'travel_mode': travel_mode,
                'current_location': new_location,
                'previous_location': previous_location,
                'requires_update': location_changed
            }
            
            # Trigger automatic updates if location changed significantly
            if location_changed:
                logger.info(f"Significant location change detected for user {user_id}: "
                          f"{distance_km:.1f}km from {previous_location.get('city', 'Unknown')} "
                          f"to {new_location['city']}")
                
                # Trigger background updates
                asyncio.create_task(self._trigger_location_updates(user_id, new_location))
            
            return result
            
        except Exception as e:
            logger.error(f"Error updating user location: {e}")
            return {
                'location_changed': False,
                'error': str(e),
                'requires_update': False
            }
    
    def get_last_location(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user's last known location"""
        user_history = self.location_history.get(user_id, [])
        return user_history[-1] if user_history else None
    
    def get_location_history(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get user's location history"""
        user_history = self.location_history.get(user_id, [])
        return user_history[-limit:] if user_history else []
    
    def is_user_traveling(self, user_id: str) -> bool:
        """Check if user is currently in travel mode"""
        recent_locations = self.get_location_history(user_id, limit=3)
        if len(recent_locations) < 2:
            return False
        
        # Check if user has moved significantly in recent locations
        total_distance = 0
        for i in range(1, len(recent_locations)):
            distance = self._calculate_distance(
                (recent_locations[i-1]['lat'], recent_locations[i-1]['lon']),
                (recent_locations[i]['lat'], recent_locations[i]['lon'])
            )
            total_distance += distance
        
        return total_distance > self.location_threshold_km
    
    async def get_travel_summary(self, user_id: str) -> Dict[str, Any]:
        """Get travel summary for user"""
        history = self.get_location_history(user_id, limit=50)
        if len(history) < 2:
            return {
                'total_distance_km': 0,
                'locations_visited': 0,
                'travel_time_hours': 0,
                'cities_visited': [],
                'is_traveling': False
            }
        
        total_distance = 0
        cities_visited = set()
        start_time = datetime.fromisoformat(history[0]['timestamp'])
        end_time = datetime.fromisoformat(history[-1]['timestamp'])
        
        for i in range(1, len(history)):
            distance = self._calculate_distance(
                (history[i-1]['lat'], history[i-1]['lon']),
                (history[i]['lat'], history[i]['lon'])
            )
            total_distance += distance
            cities_visited.add(f"{history[i]['city']}, {history[i]['state']}")
        
        travel_time_hours = (end_time - start_time).total_seconds() / 3600
        
        return {
            'total_distance_km': round(total_distance, 1),
            'locations_visited': len(history),
            'travel_time_hours': round(travel_time_hours, 1),
            'cities_visited': list(cities_visited),
            'is_traveling': self.is_user_traveling(user_id),
            'current_city': history[-1]['city'] if history else 'Unknown',
            'start_city': history[0]['city'] if history else 'Unknown'
        }
    
    def _calculate_distance(self, coord1: Tuple[float, float], coord2: Tuple[float, float]) -> float:
        """Calculate distance between two coordinates in kilometers"""
        try:
            return geodesic(coord1, coord2).kilometers
        except Exception as e:
            logger.error(f"Error calculating distance: {e}")
            return 0.0
    
    def _detect_travel_mode(self, speed_kmh: float, distance_km: float) -> str:
        """Detect travel mode based on speed and distance"""
        if speed_kmh == 0 or distance_km < 0.1:
            return 'stationary'
        elif speed_kmh < 5:
            return 'walking'
        elif speed_kmh < 25:
            return 'cycling_or_local'
        elif speed_kmh < 80:
            return 'driving_local'
        elif speed_kmh < 200:
            return 'driving_highway'
        else:
            return 'flying'
    
    def _store_location(self, user_id: str, location: Dict[str, Any]):
        """Store location in history (in production, this would be database)"""
        if user_id not in self.location_history:
            self.location_history[user_id] = []
        
        self.location_history[user_id].append(location)
        
        # Keep only last 100 locations per user
        if len(self.location_history[user_id]) > 100:
            self.location_history[user_id] = self.location_history[user_id][-100:]
    
    async def _get_location_details(self, lat: float, lon: float) -> Dict[str, Any]:
        """Get location details using reverse geocoding"""
        try:
            location = self.geocoder.reverse(f"{lat}, {lon}", timeout=5)
            if location and location.raw:
                address = location.raw.get('address', {})
                return {
                    'address': location.address,
                    'city': address.get('city') or address.get('town') or address.get('village', 'Unknown'),
                    'state': address.get('state', 'Unknown'),
                    'country': address.get('country', 'Unknown'),
                    'postcode': address.get('postcode', ''),
                    'county': address.get('county', '')
                }
        except Exception as e:
            logger.error(f"Error getting location details: {e}")
        
        return {
            'address': f"{lat}, {lon}",
            'city': 'Unknown',
            'state': 'Unknown', 
            'country': 'Unknown'
        }
    
    async def _trigger_location_updates(self, user_id: str, new_location: Dict[str, Any]):
        """Trigger automatic updates when location changes"""
        try:
            # Import here to avoid circular imports
            from routers.air_quality import get_air_quality_service
            from services.premium_lean_engine import premium_lean_engine
            
            lat = new_location['lat']
            lon = new_location['lon']
            
            logger.info(f"Triggering automatic updates for user {user_id} at {new_location['city']}")
            
            # Get fresh environmental data for new location
            air_service = get_air_quality_service()
            comprehensive_data = await air_service.get_comprehensive_environmental_data(lat, lon)
            
            if comprehensive_data:
                # Extract environmental data
                pollen_risk = comprehensive_data.get('pollen', {}).get('overall_risk', 'low')
                pollen_level = {'low': 10, 'moderate': 30, 'high': 60}.get(pollen_risk, 10)
                
                environmental_data = {
                    'pm25': comprehensive_data.get('air_quality', {}).get('pm25', 0),
                    'ozone': comprehensive_data.get('air_quality', {}).get('ozone', 0),
                    'no2': comprehensive_data.get('air_quality', {}).get('no2', 0),
                    'humidity': comprehensive_data.get('weather', {}).get('humidity', 0),
                    'temperature': comprehensive_data.get('weather', {}).get('temperature', 0),
                    'pollen_level': pollen_level
                }
                
                # Calculate new risk score
                risk_analysis = premium_lean_engine.calculate_daily_risk_score(environmental_data)
                
                # Store the updated data for this user/location
                update_summary = {
                    'user_id': user_id,
                    'location': new_location,
                    'environmental_data': environmental_data,
                    'risk_analysis': risk_analysis,
                    'comprehensive_data': comprehensive_data,
                    'updated_at': datetime.utcnow().isoformat()
                }
                
                # In production, this would trigger push notifications, update user dashboard, etc.
                logger.info(f"Location update complete for user {user_id}: "
                          f"Risk score {risk_analysis['risk_score']} in {new_location['city']}")
                
                return update_summary
            
        except Exception as e:
            logger.error(f"Error triggering location updates: {e}")
            return None

# Global instance
location_tracking_service = LocationTrackingService()
