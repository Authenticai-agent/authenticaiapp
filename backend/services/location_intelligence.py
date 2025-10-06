"""
Location Intelligence Engine for Authenticai
Automatic location detection, travel monitoring, and environmental adaptation
Handles travel scenarios where users need real-time environmental intelligence for new locations
"""

from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
import asyncio
import logging
import httpx
import os
import json
from dataclasses import dataclass
from geoip2 import database, errors as geoip_errors
import ipaddress

logger = logging.getLogger(__name__)

@dataclass
class LocationData:
    """Comprehensive location data for environmental intelligence"""
    lat: float
    lon: float
    city: str
    region: str
    country: str
    timezone: str
    elevation_m: float
    climate_type: str
    population_density: str  # urban/suburban/rural
    
@dataclass
class LocationHistory:
    """User location history for travel tracking"""
    timestamp: datetime
    location: LocationData
    travel_distance_km: Optional[float] = None
    is_primary_location: bool = True
    duration_at_location: timedelta = timedelta(0)

class LocationIntelligenceEngine:
    """
    The brain for location-aware environmental intelligence
    Automatically detects user location, tracks travel, and adapts environmental monitoring
    """
    
    def __init__(self):
        self.user_locations: Dict[str, List[LocationHistory]] = {}
        self.location_monitoring_active = True
        self.location_change_threshold_km = 5.0  # Alert when user moves >5km
        self.location_detection_methods = [
            "gps_coordinates",
            "ip_geolocation", 
            "cell_tower_triangulation",
            "wifi_positioning",
            "manual_location_update"
        ]
        
    async def detect_user_location(self, user_id: str, ip_address: Optional[str] = None,
                                 gps_coords: Optional[Dict[str, float]] = None,
                                 cell_data: Optional[Dict] = None) -> LocationData:
        """
        Detect user's current location using multiple methods
        Prioritizes GPS, falls back to IP geolocation
        """
        try:
            detected_location = None
            
            # Method 1: GPS Coordinates (most accurate)
            if gps_coords and gps_coords.get('lat') and gps_coords.get('lon'):
                detected_location = await self._location_from_gps(gps_coords)
                
            # Method 2: IP Geolocation (fallback)
            elif ip_address:
                detected_location = await self._location_from_ip(ip_address)
                
            # Method 3: Cell Tower Data (mobile networks)
            elif cell_data:
                detected_location = await self._location_from_cell_data(cell_data)
                
            if not detected_location:
                logger.warning(f"Could not detect location for user {user_id}")
                return self._get_default_location()
            
            # Update user's location history
            await self._update_location_history(user_id, detected_location)
            
            logger.info(f"Location detected for user {user_id}: {detected_location.city}, {detected_location.country}")
            return detected_location
            
        except Exception as e:
            logger.error(f"Location detection failed for user {user_id}: {e}")
            return self._get_default_location()
    
    async def _location_from_gps(self, gps_coords: Dict[str, float]) -> LocationData:
        """Convert GPS coordinates to comprehensive location data"""
        try:
            lat, lon = gps_coords['lat'], gps_coords['lon']
            
            # Get detailed location info from reverse geocoding
            async with httpx.AsyncClient() as client:
                # Use OpenWeather reverse geocoding
                reverse_geo_response = await client.get(
                    "http://api.openweathermap.org/geo/1.0/reverse",
                    params={
                        "lat": lat,
                        "lon": lon,
                        "limit": 1,
                        "appid": os.getenv("OPENWEATHER_API_KEY")
                    }
                )
                geo_data = reverse_geo_response.json()
                
                if geo_data:
                    location_info = geo_data[0]
                    return LocationData(
                        lat=lat,
                        lon=lon,
                        city=location_info.get('name', 'Unknown'),
                        region=location_info.get('state', 'Unknown'),
                        country=location_info.get('country', 'Unknown'),
                        timezone=self._get_timezone_from_coords(lat, lon),
                        elevation_m=await self._get_elevation(lat, lon),
                        climate_type=self._get_climate_type(lat, lon),
                        population_density=self._get_population_density(location_info.get('name', ''))
                    )
        
        except Exception as e:
            logger.error(f"GPS location processing failed: {e}")
            
        # Fallback to basic GPS location
        return LocationData(
            lat=gps_coords['lat'],
            lon=gps_coords['lon'],
            city="Current Location",
            region="Unknown",
            country="Unknown",
            timezone="UTC",
            elevation_m=0,
            climate_type="temperate",
            population_density="unknown"
        )
    
    async def _location_from_ip(self, ip_address: str) -> Optional[LocationData]:
        """Get location from IP address using IP geolocation services"""
        try:
            # Clean IP address (handle IPv6)
            clean_ip = ip_address.strip()
            if clean_ip.startswith('::ffff:'):
                clean_ip = clean_ip[7:]  # Remove IPv6 prefix
            
            # Use IPGeolocation.io (free tier: 1000 requests/month)
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://api.ipgeolocation.io/ipgeo",
                    params={
                        "apiKey": os.getenv("IP_GEOLOCATION_API_KEY", ""),
                        "ip": clean_ip
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return LocationData(
                        lat=float(data.get('latitude', 0)),
                        lon=float(data.get('longitude', 0)),
                        city=data.get('city', 'Unknown'),
                        region=data.get('state_prov', 'Unknown'),
                        country=data.get('country_name', 'Unknown'),
                        timezone=data.get('time_zone', {}).get('name', 'UTC'),
                        elevation_m=data.get('elevation', {}).get('digit', 0),
                        climate_type=self._get_climate_type(float(data.get('latitude', 0)), float(data.get('longitude', 0))),
                        population_density=self._get_population_density(data.get('city', ''))
                    )
                    
        except Exception as e:
            logger.error(f"IP Geolocation failed: {e}")
            
        return None
    
    async def _location_from_cell_data(self, cell_data: Dict) -> Optional[LocationData]:
        """Estimate location from cell tower/WiFi data"""
        try:
            # Mobile Country Code (MCC) + Mobile Network Code (MNC)
            mcc = cell_data.get('mcc', '')
            mnc = cell_data.get('mnc', '')
            
            if mcc and mnc:
                # Use cell tower geolocation services
                async with httpx.AsyncClient() as client:
                    response = await client.get(
                        "https://api.mylnikov.org/geolocation/cell",
                        params={
                            "mcc": mcc,
                            "mnc": mnc,
                            "lac": cell_data.get('lac', ''),
                            "cid": cell_data.get('cid', '')
                        }
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        if data.get('ok') and data.get('data'):
                            coords = data['data']
                            return await self._location_from_gps({'lat': coords['lat'], 'lon': coords['lon']})
                            
        except Exception as e:
            logger.error(f"Cell tower geolocation failed: {e}")
            
        return None
    
    def _get_timezone_from_coords(self, lat: float, lon: float) -> str:
        """Estimate timezone from coordinates (simplified approach)"""
        # Timezone estimation based on longitude
        timezone_offset = int(lon / 15)
        
        # Common timezone mappings
        timezones = {
            0: "UTC",
            1: "Europe/Berlin",
            -1: "Atlantic/Reykjavik",
            2: "Europe/Moscow", 
            -2: "Atlantic/South_Georgia",
            3: "Europe/Moscow",
            -3: "America/Sao_Paulo",
            4: "Asia/Dubai",
            -4: "America/Santiago",
            5: "Asia/Karachi",
            -5: "America/New_York",
            6: "Asia/Dhaka",
            -6: "America/Chicago",
            7: "Asia/Bangkok",
            -7: "America/Denver",
            8: "Asia/Shanghai",
            -8: "America/Los_Angeles",
            9: "Asia/Tokyo",
            -9: "America/Anchorage",
            10: "Australia/Sydney",
            -10: "Pacific/Honolulu"
        }
        
        return timezones.get(timezone_offset, "UTC")
    
    async def _get_elevation(self, lat: float, lon: float) -> float:
        """Get elevation for location"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://api.open-elevation.com/api/v1/lookup",
                    params={"locations": f"{lat},{lon}"}
                )
                
                data = response.json()
                if data.get('results'):
                    return data['results'][0]['elevation']
                    
        except Exception as e:
            logger.error(f"Elevation lookup failed: {e}")
            
        return 0.0
    
    def _get_climate_type(self, lat: float, lon: float) -> str:
        """Determine climate type from coordinates"""
        if lat >= 66.5:  # Arctic
            return "arctic"
        elif lat >= 23.5:  # Northern temperate
            return "temperate_north"
        elif lat >= -23.5:  # Tropical
            return "tropical"
        elif lat >= -66.5:  # Southern temperate
            return "temperate_south"
        else:  # Antarctic
            return "antarctic"
    
    def _get_population_density(self, city_name: str) -> str:
        """Estimate population density from city name"""
        # Simplified population density estimation
        major_cities = ['new york', 'london', 'tokyo', 'paris', 'los angeles', 'chicago', 'dallas', 'houston']
        
        if any(city.lower() in city_name.lower() for city in major_cities):
            return "urban"
        elif city_name.lower() in ['unknown', 'current location']:
            return "unknown"
        else:
            return "suburban"
    
    def _get_default_location(self) -> LocationData:
        """Fallback location when detection fails"""
        return LocationData(
            lat=40.7128,
            lon=-74.0060,
            city="New York",
            region="NY", 
            country="US",
            timezone="America/New_York",
            elevation_m=10,
            climate_type="temperate_north",
            population_density="urban"
        )
    
    async def _update_location_history(self, user_id: str, location: LocationData) -> None:
        """Update user's location history for travel tracking"""
        if user_id not in self.user_locations:
            self.user_locations[user_id] = []
        else:
            await self._calculate_travel_metrics(user_id, location)
            
        self.user_locations[user_id].append(LocationHistory(
            timestamp=datetime.now(),
            location=location,
            duration_at_location=self._calculate_duration_at_current_location(user_id)
        ))
        
        # Keep only last 50 location records per user
        if len(self.user_locations[user_id]) > 50:
            self.user_locations[user_id] = self.user_locations[user_id][-50:]
    
    async def _calculate_travel_metrics(self, user_id: str, new_location: LocationData) -> None:
        """Calculate travel distance and update metrics"""
        location_history = self.user_locations.get(user_id, [])
        if not location_history:
            return
            
        last_location = location_history[-1].location
        distance = self._haversine_distance(
            last_location.lat, last_location.lon,
            new_location.lat, new_location.lon
        )
        
        # Update the last location record with travel distance
        location_history[-1].travel_distance_km = distance
        
        # Detect significant location changes (>5km movement)
        if distance > self.location_change_threshold_km:
            await self._notify_location_change(user_id, last_location, new_location, distance)
    
    def _haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two points in kilometers"""
        import math
        
        R = 6371  # Earth's radius in kilometers
        
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        
        a = (math.sin(dlat/2) * math.sin(dlat/2) + 
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(dlon/2) * math.sin(dlon/2))
        
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        distance = R * c
        
        return distance
    
    def _calculate_duration_at_current_location(self, user_id: str) -> timedelta:
        """Calculate how long user has been at current location"""
        location_history = self.user_locations.get(user_id, [])
        if len(location_history) < 2:
            return timedelta(minutes=0)
            
        # Sum up time spent at current coordinates
        current_location = location_history[-1].location
        
        duration = timedelta(0)
        for i in range(len(location_history) - 1, -1, -1):
            if (abs(location_history[i].location.lat - current_location.lat) < 0.01 and
                abs(location_history[i].location.lon - current_location.lon) < 0.01):
                
                if i == 0:
                    duration += datetime.now() - location_history[i].timestamp
                    break
                else:
                    duration += location_history[i].timestamp - location_history[i-1].timestamp
            else:
                break
                
        return duration
    
    async def _notify_location_change(self, user_id: str, old_location: LocationData, 
                                   new_location: LocationData, distance: float) -> None:
        """Handle significant location changes for travelers"""
        logger.info(f"Significant location change detected for user {user_id}: "
                   f"{old_location.city} → {new_location.city} ({distance:.1f} km)")
        
        # This would trigger immediate environmental analysis for new location
        await self._trigger_location_environmental_update(user_id, new_location, distance)
    
    async def _trigger_location_environmental_update(self, user_id: str, 
                                                   location: LocationData, distance: float) -> None:
        """Trigger immediate environmental analysis for new location"""
        try:
            # This would integrate with the main environmental services
            logger.info(f"Trigging immediate environmental update for {user_id} at "
                       f"{location.city}, {location.country}")
            
            # Could trigger:
            # - New air quality analysis
            # - Updated pollen forecasts  
            # - New environmental recommendations
            # - Risk recalculation for new climate zone
            
        except Exception as e:
            logger.error(f"Environmental update trigger failed: {e}")
    
    async def get_user_travel_summary(self, user_id: str, days: int = 7) -> Dict[str, Any]:
        """Get comprehensive travel summary for user"""
        location_history = self.user_locations.get(user_id, [])
        
        if not location_history:
            return {
                "user_id": user_id,
                "travel_detected": False,
                "message": "No location data available"
            }
        
        # Filter to requested time period
        cutoff_date = datetime.now() - timedelta(days=days)
        recent_locations = [
            loc for loc in location_history
            if loc.timestamp > cutoff_date
        ]
        
        if not recent_locations:
            return {
                "user_id": user_id,
                "travel_detected": False,
                "message": f"No location data in last {days} days"
            }
        
        # Analyze travel patterns
        unique_locations = {}
        total_distance = 0
        location_changes = 0
        
        for location_record in recent_locations:
            loc_key = f"{location_record.location.city},{location_record.location.country}"
            
            if loc_key not in unique_locations:
                unique_locations[loc_key] = {
                    "city": location_record.location.city,
                    "country": location_record.location.country,
                    "region": location_record.location.country,
                    "first_seen": location_record.timestamp,
                    "last_seen": location_record.timestamp,
                    "duration_hours": 0
                }
            else:
                unique_locations[loc_key]["last_seen"] = location_record.timestamp
            
            if location_record.travel_distance_km:
                total_distance += location_record.travel_distance_km
                if location_record.travel_distance_km > self.location_change_threshold_km:
                    location_changes += 1
        
        # Calculate durations
        for loc_data in unique_locations.values():
            duration = loc_data["last_seen"] - loc_data["first_seen"]
            loc_data["duration_hours"] = round(duration.total_seconds() / 3600, 1)
        
        current_location = recent_locations[-1].location
        
        return {
            "user_id": user_id,
            "travel_summary": {
                "travel_detected": len(unique_locations) > 1,
                "locations_visited": len(unique_locations),
                "total_distance_km": round(total_distance, 1),
                "location_changes": location_changes,
                "analysis_period_days": days
            },
            "current_location": {
                "city": current_location.city,
                "region": current_location.country,
                "timezone": current_location.timezone,
                "climate_type": current_location.climate_type,
                "population_density": current_location.population_density
            },
            "recent_locations": list(unique_locations.values()),
            "travel_analytics": {
                "most_frequent_location": max(unique_locations.values(), key=lambda x: x["duration_hours"]) if unique_locations else None,
                "longest_stay_hours": max((loc["duration_hours"] for loc in unique_locations.values()), default=0),
                "average_location_duration_hours": sum(loc["duration_hours"] for loc in unique_locations.values()) / len(unique_locations) if unique_locations else 0
            }
        }

# Global location intelligence instance
location_intelligence = LocationIntelligenceEngine()
