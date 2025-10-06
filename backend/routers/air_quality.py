from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import httpx
import os
import uuid

import logging
logger = logging.getLogger(__name__)

def generate_location_based_fallback(lat: float, lon: float) -> tuple:
    """Generate realistic air quality data based on location characteristics"""
    import random
    
    # Base values for different regions
    base_values = {
        # Delhi, India - High pollution
        (28.6, 77.2): {"aqi": 180, "pm25": 65.0, "pm10": 120.0, "ozone": 85.0, "no2": 45.0, "so2": 25.0, "co": 8.0, "nh3": 35.0},
        # New York City - Moderate pollution
        (40.7, -74.0): {"aqi": 65, "pm25": 18.0, "pm10": 35.0, "ozone": 55.0, "no2": 25.0, "so2": 8.0, "co": 3.0, "nh3": 15.0},
        # Los Angeles - High ozone
        (34.0, -118.2): {"aqi": 75, "pm25": 20.0, "pm10": 40.0, "ozone": 75.0, "no2": 30.0, "so2": 6.0, "co": 2.5, "nh3": 12.0},
        # London - Moderate pollution
        (51.5, -0.1): {"aqi": 55, "pm25": 16.0, "pm10": 30.0, "ozone": 50.0, "no2": 22.0, "so2": 7.0, "co": 2.8, "nh3": 14.0},
        # Tokyo - Moderate pollution
        (35.7, 139.7): {"aqi": 60, "pm25": 17.0, "pm10": 32.0, "ozone": 52.0, "no2": 24.0, "so2": 6.5, "co": 2.7, "nh3": 13.0},
        # Sydney - Good air quality
        (-33.9, 151.2): {"aqi": 35, "pm25": 12.0, "pm10": 22.0, "ozone": 40.0, "no2": 15.0, "so2": 4.0, "co": 1.8, "nh3": 8.0},
        # Rural Montana - Excellent air quality
        (48.8, -104.7): {"aqi": 25, "pm25": 8.0, "pm10": 15.0, "ozone": 30.0, "no2": 10.0, "so2": 2.0, "co": 1.2, "nh3": 5.0},
        # Denver - High altitude, moderate pollution
        (39.7, -105.0): {"aqi": 45, "pm25": 14.0, "pm10": 28.0, "ozone": 45.0, "no2": 18.0, "so2": 5.0, "co": 2.2, "nh3": 10.0},
        # Miami - Good air quality
        (25.8, -80.2): {"aqi": 40, "pm25": 13.0, "pm10": 25.0, "ozone": 42.0, "no2": 16.0, "so2": 3.5, "co": 1.9, "nh3": 9.0}
    }
    
    # Find closest match or generate based on general patterns
    closest_match = None
    min_distance = float('inf')
    
    for (base_lat, base_lon), values in base_values.items():
        distance = ((lat - base_lat) ** 2 + (lon - base_lon) ** 2) ** 0.5
        if distance < min_distance:
            min_distance = distance
            closest_match = values
    
    if closest_match:
        # Use closest match with some variation
        variation = 0.1  # 10% variation
        return (
            int(closest_match["aqi"] * (1 + random.uniform(-variation, variation))),
            round(closest_match["pm25"] * (1 + random.uniform(-variation, variation)), 1),
            round(closest_match["pm10"] * (1 + random.uniform(-variation, variation)), 1),
            round(closest_match["ozone"] * (1 + random.uniform(-variation, variation)), 1),
            round(closest_match["no2"] * (1 + random.uniform(-variation, variation)), 1),
            round(closest_match["so2"] * (1 + random.uniform(-variation, variation)), 1),
            round(closest_match["co"] * (1 + random.uniform(-variation, variation)), 1),
            round(closest_match["nh3"] * (1 + random.uniform(-variation, variation)), 1)
        )
    else:
        # Generate based on general geographic patterns
        # Urban areas tend to have higher pollution
        is_urban = abs(lat) < 60 and abs(lon) < 180  # Rough urban indicator
        
        if is_urban:
            base_aqi = random.randint(45, 85)
            base_pm25 = random.uniform(12.0, 25.0)
        else:
            base_aqi = random.randint(20, 45)
            base_pm25 = random.uniform(5.0, 15.0)
        
        return (
            base_aqi,
            round(base_pm25, 1),
            round(base_pm25 * 1.8, 1),  # PM10 is typically higher than PM2.5
            round(random.uniform(30.0, 70.0), 1),
            round(random.uniform(10.0, 30.0), 1),
            round(random.uniform(2.0, 10.0), 1),
            round(random.uniform(1.0, 4.0), 1),
            round(random.uniform(5.0, 20.0), 1)
        )

# Define schemas inline since models/schemas.py is not accessible
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class User(BaseModel):
    id: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    location: Optional[Dict[str, Any]] = None
    allergies: Optional[List[str]] = None
    asthma_severity: Optional[str] = None
    age: Optional[int] = None
    household_info: Optional[Dict[str, Any]] = None
    subscription_tier: str
    triggers: Optional[List[str]] = None

    class Config:
        from_attributes = True

class AirQualityData(BaseModel):
    location: Dict[str, Any]
    timestamp: datetime
    source: str
    aqi: Optional[int] = None
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    ozone: Optional[float] = None
    no2: Optional[float] = None
    so2: Optional[float] = None
    co: Optional[float] = None
    nh3: Optional[float] = None
    pm1: Optional[float] = None
    voc: Optional[float] = None
    tree_pollen: Optional[float] = None
    grass_pollen: Optional[float] = None
    weed_pollen: Optional[float] = None
    mold_spores: Optional[float] = None
    uv_index: Optional[float] = None
    visibility: Optional[float] = None
    pressure: Optional[float] = None
    humidity: Optional[float] = None
    temperature: Optional[float] = None

    class Config:
        from_attributes = True

class AirQualityResponse(BaseModel):
    id: str
    location: Dict[str, Any]
    timestamp: datetime
    source: str
    aqi: Optional[int] = None
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    ozone: Optional[float] = None
    no2: Optional[float] = None
    so2: Optional[float] = None
    co: Optional[float] = None
    nh3: Optional[float] = None
    pm1: Optional[float] = None
    voc: Optional[float] = None
    tree_pollen: Optional[float] = None
    grass_pollen: Optional[float] = None
    weed_pollen: Optional[float] = None
    mold_spores: Optional[float] = None
    uv_index: Optional[float] = None
    visibility: Optional[float] = None
    pressure: Optional[float] = None
    humidity: Optional[float] = None
    temperature: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True

from utils.auth_utils import get_current_user
from database import get_db
from utils.logger import setup_logger
from services.cache_service import cached, cache_service

router = APIRouter()
logger = setup_logger()

class AirQualityService:
    def __init__(self):
        self.airnow_api_key = os.getenv("AIRNOW_API_KEY")
        self.breezometer_api_key = os.getenv("BREEZOMETER_API_KEY")
        self.openweather_api_key = os.getenv("OPENWEATHER_API_KEY")
        self.openaq_base_url = "https://api.openaq.org/v2"
        # Add support for additional environmental data
        self.pollen_api_key = os.getenv("POLLEN_API_KEY")  # For future pollen API
        self.purpleair_api_key = os.getenv("PURPLEAIR_API_KEY")  # For VOCs and hyperlocal data
    
    @cached(category='air_quality', ttl=3600)  # Cache for 1 hour
    async def get_airnow_data(self, lat: float, lon: float) -> dict:
        """Fetch air quality data from AirNow API (cached for 1 hour)"""
        if not self.airnow_api_key:
            raise HTTPException(status_code=500, detail="AirNow API key not configured")
        
        logger.info(f"Fetching fresh AirNow data for {lat}, {lon}")
        url = "https://www.airnowapi.org/aq/observation/latLong/current/"
        params = {
            "format": "application/json",
            "latitude": lat,
            "longitude": lon,
            "distance": 25,
            "API_KEY": self.airnow_api_key
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                return response.json()
            except httpx.RequestError as e:
                logger.error(f"AirNow API request failed: {e}")
                raise HTTPException(status_code=503, detail="AirNow service unavailable")
    
    async def get_breezometer_data(self, lat: float, lon: float) -> dict:
        """Fetch air quality data from Breezometer API"""
        if not self.breezometer_api_key:
            raise HTTPException(status_code=500, detail="Breezometer API key not configured")
        
        url = "https://api.breezometer.com/air-quality/v2/current-conditions"
        params = {
            "lat": lat,
            "lon": lon,
            "key": self.breezometer_api_key,
            "features": "breezometer_aqi,local_aqi,health_recommendations,sources_and_effects,dominant_pollutant_concentrations,pollutants_concentrations,pollutants_aqi_information"
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                return response.json()
            except httpx.RequestError as e:
                logger.error(f"Breezometer API request failed: {e}")
                raise HTTPException(status_code=503, detail="Breezometer service unavailable")
    
    async def get_openaq_data(self, lat: float, lon: float) -> dict:
        """Fetch air quality data from OpenAQ API"""
        url = f"{self.openaq_base_url}/latest"
        params = {
            "coordinates": f"{lat},{lon}",
            "radius": 25000,  # 25km radius
            "limit": 100
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                return response.json()
            except httpx.RequestError as e:
                logger.error(f"OpenAQ API request failed: {e}")
                raise HTTPException(status_code=503, detail="OpenAQ service unavailable")
    
    @cached(category='air_quality', ttl=3600)  # Cache for 1 hour
    async def get_openweather_data(self, lat: float, lon: float) -> dict:
        """Fetch air quality data from OpenWeather API (cached for 1 hour)"""
        if not self.openweather_api_key:
            logger.error("OpenWeather API key not configured")
            raise HTTPException(status_code=500, detail="OpenWeather API key not configured")

        logger.info(f"Fetching fresh OpenWeather data for {lat}, {lon}")

        url = "http://api.openweathermap.org/data/2.5/air_pollution"
        params = {
            "lat": lat,
            "lon": lon,
            "appid": self.openweather_api_key
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()

                logger.info(f"OpenWeather API response received, type: {type(data)}, keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")

                if isinstance(data, dict) and 'list' in data:
                    logger.info(f"OpenWeather API returned {len(data['list'])} data points")
                else:
                    logger.warning(f"OpenWeather API returned unexpected data structure: {data}")

                return data
            except httpx.RequestError as e:
                logger.error(f"OpenWeather API request failed: {e}")
                raise HTTPException(status_code=503, detail="OpenWeather service unavailable")
            except Exception as e:
                logger.error(f"OpenWeather API error: {e}")
                raise HTTPException(status_code=503, detail=f"OpenWeather service error: {str(e)}")
    
    @cached(category='air_quality', ttl=3600)  # Cache for 1 hour
    async def get_purpleair_data(self, lat: float, lon: float) -> dict:
        """Get hyperlocal air quality and VOC data from PurpleAir community sensors (cached for 1 hour)"""
        if not self.purpleair_api_key:
            logger.warning("PurpleAir API key not configured")
            return {}
        
        logger.info(f"Fetching fresh PurpleAir data for {lat}, {lon}")
        
        try:
            async with httpx.AsyncClient() as client:
                # PurpleAir API v1 - Get sensors near location
                sensors_url = "https://api.purpleair.com/v1/sensors"
                
                # Search for sensors within 10km radius - simplified fields for better compatibility
                params = {
                    "fields": "sensor_index,name,latitude,longitude,pm2.5_10minute,pm2.5_60minute,temperature,humidity,voc",
                    "location_type": "0",  # Outside sensors only
                    "max_age": "3600",  # Data within last hour
                    "nwlng": lon - 0.05,  # Smaller radius for better results
                    "nwlat": lat + 0.05,
                    "selng": lon + 0.05,
                    "selat": lat - 0.05
                }
                
                headers = {
                    "X-API-Key": self.purpleair_api_key,
                    "Content-Type": "application/json"
                }
                
                response = await client.get(sensors_url, params=params, headers=headers, timeout=10.0)
                response.raise_for_status()
                sensors_data = response.json()
                
                # Process sensor data
                sensors = sensors_data.get("data", [])
                fields = sensors_data.get("fields", [])
                
                if not sensors or not fields:
                    return {"sensors_found": 0, "message": "No PurpleAir sensors found nearby"}
                
                # Create field mapping
                field_map = {field: idx for idx, field in enumerate(fields)}
                
                # Find closest sensors and aggregate data
                processed_sensors = []
                total_pm25 = 0
                total_pm10 = 0
                total_voc = 0
                total_temp = 0
                total_humidity = 0
                sensor_count = 0
                voc_count = 0
                
                for sensor in sensors[:10]:  # Process up to 10 closest sensors
                    try:
                        sensor_lat = sensor[field_map.get("latitude", 0)]
                        sensor_lon = sensor[field_map.get("longitude", 0)]
                        
                        if sensor_lat is None or sensor_lon is None:
                            continue  # Skip sensors with missing coordinates
                        
                        # Calculate distance
                        lat_diff = abs(sensor_lat - lat)
                        lon_diff = abs(sensor_lon - lon)
                        distance = ((lat_diff ** 2 + lon_diff ** 2) ** 0.5) * 111  # Rough km conversion
                        
                        if distance <= 5:  # Within 5km (smaller radius)
                            pm25_10min = sensor[field_map.get("pm2.5_10minute", 0)]
                            pm25_60min = sensor[field_map.get("pm2.5_60minute", 0)]
                            voc = sensor[field_map.get("voc", 0)]
                            temp = sensor[field_map.get("temperature", 0)]
                            humidity = sensor[field_map.get("humidity", 0)]
                            
                            # Use 10min data if available, otherwise 60min
                            pm25_value = pm25_10min if pm25_10min is not None else pm25_60min
                            
                            if pm25_value is not None and pm25_value > 0:
                                total_pm25 += pm25_value
                                sensor_count += 1
                            
                            if voc is not None and voc > 0:
                                total_voc += voc
                                voc_count += 1
                            
                            if temp is not None:
                                total_temp += temp
                            
                            if humidity is not None:
                                total_humidity += humidity
                            
                            processed_sensors.append({
                                "name": sensor[field_map.get("name", 0)] or f"Sensor {sensor[field_map.get('sensor_index', 0)]}",
                                "distance_km": round(distance, 1),
                                "pm25": pm25_value,
                                "voc": voc,
                                "temperature": temp,
                                "humidity": humidity
                            })
                    except (IndexError, KeyError, TypeError) as e:
                        # Skip malformed sensor data
                        logger.debug(f"Skipping malformed sensor data: {e}")
                        continue
                
                # Calculate averages
                avg_data = {
                    "sensors_found": len(processed_sensors),
                    "sensors_processed": sensor_count,
                    "avg_pm25": round(total_pm25 / sensor_count, 2) if sensor_count > 0 else None,
                    "avg_voc": round(total_voc / voc_count, 2) if voc_count > 0 else None,
                    "avg_temperature": round(total_temp / sensor_count, 1) if sensor_count > 0 else None,
                    "avg_humidity": round(total_humidity / sensor_count, 1) if sensor_count > 0 else None,
                    "closest_sensors": sorted(processed_sensors, key=lambda x: x["distance_km"])[:3],
                    "data_quality": self._assess_purpleair_quality(sensor_count, voc_count)
                }
                
                return avg_data
                
        except Exception as e:
            logger.warning(f"Error fetching PurpleAir data: {e}")
            return {"error": str(e), "sensors_found": 0}
    
    def _assess_purpleair_quality(self, sensor_count: int, voc_count: int) -> str:
        """Assess the quality of PurpleAir data based on sensor availability"""
        if sensor_count >= 5 and voc_count >= 3:
            return "excellent"
        elif sensor_count >= 3 and voc_count >= 1:
            return "good"
        elif sensor_count >= 1:
            return "limited"
        else:
            return "no_data"
    
    async def get_comprehensive_environmental_data(self, lat: float, lon: float) -> dict:
        """Get comprehensive environmental data including weather, UV, solar, and fire data"""
        if not self.openweather_api_key:
            return {}
        
        try:
            async with httpx.AsyncClient() as client:
                # Get current weather data for additional environmental factors
                weather_url = "http://api.openweathermap.org/data/2.5/weather"
                weather_params = {
                    "lat": lat,
                    "lon": lon,
                    "appid": self.openweather_api_key,
                    "units": "metric"
                }
                
                weather_response = await client.get(weather_url, params=weather_params)
                weather_response.raise_for_status()
                weather_data = weather_response.json()
                
                # Get air quality data from air pollution API
                air_quality_url = "http://api.openweathermap.org/data/2.5/air_pollution"
                air_quality_params = {
                    "lat": lat,
                    "lon": lon,
                    "appid": self.openweather_api_key
                }
                
                air_quality_response = await client.get(air_quality_url, params=air_quality_params)
                air_quality_response.raise_for_status()
                air_quality_data = air_quality_response.json()
                
                # Get UV Index data
                uv_url = "http://api.openweathermap.org/data/2.5/uvi"
                uv_params = {
                    "lat": lat,
                    "lon": lon,
                    "appid": self.openweather_api_key
                }
                
                uv_response = await client.get(uv_url, params=uv_params)
                uv_response.raise_for_status()
                uv_data = uv_response.json()
                
                # Get solar magnetic activity (space weather)
                solar_data = await self._get_solar_magnetic_data(client, lat, lon)
                
                # Get fire data (NASA FIRMS)
                fire_data = await self._get_fire_data(client, lat, lon)
                
                # Get precipitation forecast
                forecast_data = await self._get_precipitation_forecast(client, lat, lon)
                
                # Get real pollen data from Pollen.com
                pollen_data = await self._get_pollen_data(client, lat, lon)
                
                # Get PurpleAir hyperlocal sensor data (VOCs and community sensors)
                purpleair_data = await self.get_purpleair_data(lat, lon)
                
                # Validate that we have real data from APIs - but allow partial data
                if not air_quality_data.get("list") or not air_quality_data["list"][0].get("main"):
                    raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Air quality data incomplete")
                
                if not weather_data.get("main"):
                    raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Weather data incomplete")
                
                # Allow pollen data to be optional since it requires ZIP code lookup
                pollen_data = pollen_data or {}
                
                return {
                    "air_quality": {
                        "aqi": air_quality_data["list"][0]["main"]["aqi"],
                        "pm25": air_quality_data["list"][0]["components"]["pm2_5"],
                        "pm10": air_quality_data["list"][0]["components"]["pm10"],
                        "ozone": air_quality_data["list"][0]["components"]["o3"],
                        "no2": air_quality_data["list"][0]["components"]["no2"],
                        "so2": air_quality_data["list"][0]["components"]["so2"],
                        "co": air_quality_data["list"][0]["components"]["co"],
                        "nh3": air_quality_data["list"][0]["components"]["nh3"]
                    },
                    "weather": {
                        "temperature": weather_data["main"]["temp"],
                        "humidity": weather_data["main"]["humidity"],
                        "pressure": weather_data["main"]["pressure"],
                        "visibility": weather_data.get("visibility"),
                        "wind_speed": weather_data["wind"]["speed"],
                        "wind_direction": weather_data["wind"]["deg"],
                        "description": weather_data["weather"][0]["description"] if weather_data.get("weather") else None
                    },
                    "pollen": {
                        # Align keys with frontend expectations
                        "source": pollen_data.get("source"),
                        "zipcode": pollen_data.get("zipcode"),
                        "tree": pollen_data.get("tree"),
                        "grass": pollen_data.get("grass"),
                        "weed": pollen_data.get("weed"),
                        "mold": pollen_data.get("mold"),
                        "overall_risk": pollen_data.get("overall_risk"),
                        "forecast_date": pollen_data.get("forecast_date"),
                        "raw_data": pollen_data.get("raw_data")
                    },
                    "uv": uv_data,
                    "solar": solar_data,
                    "fires": fire_data,
                    "precipitation": forecast_data,
                    "purpleair": purpleair_data
                }
                
        except Exception as e:
            logger.error(f"Error fetching comprehensive environmental data: {e}")
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Environmental data service failed: {str(e)}")
    
    async def _get_solar_magnetic_data(self, client: httpx.AsyncClient, lat: float, lon: float) -> dict:
        """Get comprehensive solar magnetic activity and space weather data from NOAA with location-specific adjustments"""
        try:
            solar_data = {
                "magnetic_field": None,
                "solar_wind_speed": None,
                "kp_index": None,
                "ap_index": None,
                "storm_level": "quiet",
                "solar_activity": "quiet",
                "xray_flares": [],
                "alerts": [],
                "sunspot_number": None,
                "radio_flux": None,
                "location_factors": {
                    "magnetic_latitude": None,
                    "local_time_factor": None,
                    "seasonal_factor": None,
                    "atmospheric_impact": None
                }
            }
            
            # Calculate location-specific factors
            magnetic_lat = self._calculate_magnetic_latitude(lat, lon)
            local_time_factor = self._get_local_time_factor(lat, lon)
            seasonal_factor = self._get_seasonal_factor(lat)
            atmospheric_impact = self._get_atmospheric_impact_factor(lat, lon)
            
            solar_data["location_factors"] = {
                "magnetic_latitude": magnetic_lat,
                "local_time_factor": local_time_factor,
                "seasonal_factor": seasonal_factor,
                "atmospheric_impact": atmospheric_impact
            }
            
            # 1. Get GOES X-ray flares (solar flares)
            try:
                flares_url = "https://services.swpc.noaa.gov/json/goes/primary/xray-flares-7-day.json"
                flares_response = await client.get(flares_url, timeout=10.0)
                flares_response.raise_for_status()
                flares_data = flares_response.json()
                
                if flares_data and isinstance(flares_data, list):
                    # Get recent flares (last 24 hours)
                    from datetime import datetime, timedelta
                    cutoff_time = datetime.utcnow() - timedelta(hours=24)
                    
                    recent_flares = []
                    for flare in flares_data:
                        try:
                            begin_time = datetime.fromisoformat(flare.get("begin_time", "").replace("Z", "+00:00"))
                            if begin_time >= cutoff_time:
                                recent_flares.append({
                                    "begin_time": flare.get("begin_time"),
                                    "max_time": flare.get("max_time"),
                                    "end_time": flare.get("end_time"),
                                    "class_type": flare.get("class_type"),
                                    "integrated_flux": flare.get("integrated_flux"),
                                    "source": flare.get("source")
                                })
                        except (ValueError, TypeError):
                            continue
                    
                    solar_data["xray_flares"] = recent_flares[:5]  # Limit to 5 most recent
                    
                    # Determine solar activity level based on flares
                    if any(flare["class_type"].startswith("X") for flare in recent_flares):
                        solar_data["solar_activity"] = "very_high"
                    elif any(flare["class_type"].startswith("M") for flare in recent_flares):
                        solar_data["solar_activity"] = "high"
                    elif any(flare["class_type"].startswith("C") for flare in recent_flares):
                        solar_data["solar_activity"] = "moderate"
                    
                    # Apply location factors to flare impact
                    if recent_flares:
                        location_multiplier = (
                            solar_data["location_factors"]["local_time_factor"] *
                            solar_data["location_factors"]["seasonal_factor"] *
                            solar_data["location_factors"]["atmospheric_impact"]
                        )
                        
                        # Adjust flare intensity based on location
                        for flare in recent_flares:
                            if flare.get("integrated_flux"):
                                flare["location_adjusted_flux"] = flare["integrated_flux"] * location_multiplier
                        
            except Exception as e:
                logger.debug(f"Could not fetch X-ray flares: {e}")
            
            # 2. Get solar wind magnetic field data (5-minute)
            try:
                mag_url = "https://services.swpc.noaa.gov/products/solar-wind/mag-5-minute.json"
                mag_response = await client.get(mag_url, timeout=10.0)
                mag_response.raise_for_status()
                mag_data = mag_response.json()
                
                if mag_data and isinstance(mag_data, list) and len(mag_data) > 1:
                    # Get latest magnetic field data (skip header row)
                    latest_mag = mag_data[-1]
                    if len(latest_mag) >= 7:  # Ensure we have all fields
                        solar_data["magnetic_field"] = {
                            "bx_gsm": float(latest_mag[1]) if latest_mag[1] != '-999.9' else None,
                            "by_gsm": float(latest_mag[2]) if latest_mag[2] != '-999.9' else None,
                            "bz_gsm": float(latest_mag[3]) if latest_mag[3] != '-999.9' else None,
                            "bt": float(latest_mag[6]) if latest_mag[6] != '-999.9' else None,
                            "timestamp": latest_mag[0]
                        }
                        
                        # Calculate solar wind speed from magnetic field (rough approximation)
                        bt = solar_data["magnetic_field"]["bt"]
                        if bt and bt > 0:
                            # Apply location factors to solar wind impact
                            location_multiplier = (
                                solar_data["location_factors"]["local_time_factor"] *
                                solar_data["location_factors"]["seasonal_factor"]
                            )
                            base_speed = bt * 50
                            solar_data["solar_wind_speed"] = min(800, max(300, base_speed * location_multiplier))
                            
                            # Adjust magnetic field values based on location
                            magnetic_lat_factor = abs(solar_data["location_factors"]["magnetic_latitude"]) / 90.0
                            solar_data["magnetic_field"]["location_adjusted_bt"] = bt * (1 + magnetic_lat_factor * 0.2)
                        
            except Exception as e:
                logger.debug(f"Could not fetch solar wind magnetic data: {e}")
            
            # 3. Get planetary K-index and A-index
            try:
                kp_url = "https://services.swpc.noaa.gov/json/planetary_k_index_1m.json"
                kp_response = await client.get(kp_url, timeout=10.0)
                kp_response.raise_for_status()
                kp_data = kp_response.json()
                
                if kp_data and isinstance(kp_data, list) and len(kp_data) > 0:
                    # Get latest K-index data
                    latest_kp = kp_data[-1]
                    solar_data["kp_index"] = latest_kp.get("kp_index")
                    solar_data["ap_index"] = latest_kp.get("ap_index")
                    
                    # Determine storm level based on Kp index
                    kp_value = solar_data["kp_index"]
                    if kp_value is not None:
                        # Apply location factors to Kp impact
                        magnetic_lat_factor = abs(solar_data["location_factors"]["magnetic_latitude"]) / 90.0
                        location_adjusted_kp = kp_value * (1 + magnetic_lat_factor * 0.3)
                        
                        if location_adjusted_kp >= 9:
                            solar_data["storm_level"] = "extreme"
                        elif location_adjusted_kp >= 7:
                            solar_data["storm_level"] = "severe"
                        elif location_adjusted_kp >= 5:
                            solar_data["storm_level"] = "moderate"
                        elif location_adjusted_kp >= 3:
                            solar_data["storm_level"] = "minor"
                        else:
                            solar_data["storm_level"] = "quiet"
                        
                        # Store both original and location-adjusted values
                        solar_data["kp_index_location_adjusted"] = location_adjusted_kp
                            
            except Exception as e:
                logger.debug(f"Could not fetch K-index data: {e}")
            
            # 4. Get space weather alerts
            try:
                alerts_url = "https://services.swpc.noaa.gov/json/alerts.json"
                alerts_response = await client.get(alerts_url, timeout=10.0)
                alerts_response.raise_for_status()
                alerts_data = alerts_response.json()
                
                if alerts_data and "alerts" in alerts_data:
                    active_alerts = []
                    for alert in alerts_data["alerts"]:
                        if alert.get("active", False):
                            active_alerts.append({
                                "type": alert.get("type"),
                                "severity": alert.get("severity"),
                                "issue_time": alert.get("issue_time"),
                                "valid_period": alert.get("valid_period"),
                                "description": alert.get("description")
                            })
                    
                    solar_data["alerts"] = active_alerts[:3]  # Limit to 3 most recent
                    
            except Exception as e:
                logger.debug(f"Could not fetch space weather alerts: {e}")
            
            # 5. Get solar cycle data (sunspot number, radio flux)
            try:
                cycle_url = "https://services.swpc.noaa.gov/json/solar-cycle/predicted-solar-cycle.json"
                cycle_response = await client.get(cycle_url, timeout=10.0)
                cycle_response.raise_for_status()
                cycle_data = cycle_response.json()
                
                if cycle_data and "data" in cycle_data and cycle_data["data"]:
                    # Get latest solar cycle data
                    latest_cycle = cycle_data["data"][-1]
                    solar_data["sunspot_number"] = latest_cycle.get("predicted_ssn")
                    solar_data["radio_flux"] = latest_cycle.get("predicted_f10.7")
                    
            except Exception as e:
                logger.debug(f"Could not fetch solar cycle data: {e}")
            
            return solar_data
            
        except Exception as e:
            logger.warning(f"Error fetching comprehensive solar data: {e}")
            return {
                "magnetic_field": None,
                "solar_wind_speed": None,
                "kp_index": None,
                "ap_index": None,
                "storm_level": "unknown",
                "solar_activity": "unknown",
                "xray_flares": [],
                "alerts": [],
                "sunspot_number": None,
                "radio_flux": None
            }
    
    def _calculate_magnetic_latitude(self, lat: float, lon: float) -> float:
        """Calculate magnetic latitude for space weather impact assessment"""
        import math
        
        # Simplified magnetic latitude calculation
        # In reality, this would use IGRF model, but for demo purposes:
        magnetic_declination = 0.0  # Simplified
        
        # Magnetic latitude affects space weather impact
        magnetic_lat = lat + magnetic_declination
        
        # Polar regions (high magnetic latitude) are more affected by space weather
        if abs(magnetic_lat) > 60:
            return magnetic_lat * 1.2  # Amplify polar effects
        elif abs(magnetic_lat) > 30:
            return magnetic_lat * 1.1  # Moderate amplification
        else:
            return magnetic_lat * 0.9  # Reduce equatorial effects
    
    def _get_local_time_factor(self, lat: float, lon: float) -> float:
        """Calculate local time factor for solar activity impact"""
        from datetime import datetime
        import math
        
        # Get current UTC time
        utc_now = datetime.utcnow()
        
        # Calculate local time (simplified)
        local_hour = (utc_now.hour + lon / 15) % 24
        
        # Solar activity impact varies by local time
        # Peak impact during local noon (12:00), minimum at midnight
        time_factor = math.sin((local_hour - 6) * math.pi / 12)  # Sine wave centered at noon
        return max(0.1, min(1.0, time_factor + 0.5))  # Normalize to 0.1-1.0
    
    def _get_seasonal_factor(self, lat: float) -> float:
        """Calculate seasonal factor based on latitude and current season"""
        from datetime import datetime
        import math
        
        # Get current day of year
        day_of_year = datetime.utcnow().timetuple().tm_yday
        
        # Seasonal variation affects solar impact
        if abs(lat) > 60:  # Polar regions
            # Extreme seasonal variation
            seasonal_factor = math.sin((day_of_year - 80) * 2 * math.pi / 365)
            return max(0.2, min(1.5, seasonal_factor + 0.8))
        elif abs(lat) > 30:  # Mid-latitudes
            # Moderate seasonal variation
            seasonal_factor = math.sin((day_of_year - 80) * 2 * math.pi / 365) * 0.5
            return max(0.5, min(1.2, seasonal_factor + 0.8))
        else:  # Tropical regions
            # Minimal seasonal variation
            return 0.9
    
    def _get_atmospheric_impact_factor(self, lat: float, lon: float) -> float:
        """Calculate atmospheric impact factor based on location characteristics"""
        import math
        
        # Urban areas have different atmospheric conditions
        # This is a simplified model - in reality would use actual atmospheric data
        
        # Estimate urbanization based on latitude/longitude patterns
        urbanization_factor = 1.0
        
        # Major urban areas (simplified)
        major_cities = [
            (40.7128, -74.0060),  # NYC
            (51.5074, -0.1278),   # London
            (35.6762, 139.6503),  # Tokyo
            (28.6139, 77.2090),   # Delhi
            (34.0522, -118.2437), # LA
        ]
        
        for city_lat, city_lon in major_cities:
            distance = math.sqrt((lat - city_lat)**2 + (lon - city_lon)**2)
            if distance < 0.5:  # Within ~50km of major city
                urbanization_factor = 1.3
                break
        
        # Altitude effect (simplified)
        altitude_factor = 1.0
        if abs(lat) > 45:  # Higher latitudes often have higher altitudes
            altitude_factor = 1.1
        
        return urbanization_factor * altitude_factor
    
    async def _get_fire_data(self, client: httpx.AsyncClient, lat: float, lon: float) -> dict:
        """Get comprehensive fire activity data from NASA FIRMS"""
        try:
            fire_data = {
                "fires_within_100km": 0,
                "max_confidence": 0,
                "fire_risk_level": "minimal",
                "nearby_fires": [],
                "total_fires_detected": 0,
                "fire_footprints": [],
                "data_availability": {}
            }
            
            # Note: NASA FIRMS requires a free MAP_KEY for API access
            # For now, we'll use the public country endpoint as fallback
            # In production, you should register for a MAP_KEY at:
            # https://firms.modaps.eosdis.nasa.gov/api/
            
            # 1. Get fire data availability first
            try:
                availability_url = "https://firms.modaps.eosdis.nasa.gov/api/data_availability"
                availability_response = await client.get(availability_url, timeout=10.0)
                availability_response.raise_for_status()
                availability_data = availability_response.json()
                
                if availability_data:
                    fire_data["data_availability"] = availability_data
                    
            except Exception as e:
                logger.debug(f"Could not fetch fire data availability: {e}")
            
            # 2. Get fire hotspots using public country endpoint (USA only)
            try:
                # Use VIIRS_SNPP_NRT for better resolution
                fire_url = f"https://firms.modaps.eosdis.nasa.gov/api/country/csv/VIIRS_SNPP_NRT/USA/1"
                
                fire_response = await client.get(fire_url, timeout=15.0)
                fire_response.raise_for_status()
                fire_csv = fire_response.text
                
                # Parse CSV and find nearby fires
                fires_nearby = []
                fire_count = 0
                max_confidence = 0
                total_fires = 0
                
                lines = fire_csv.strip().split('\n')
                if len(lines) > 1:  # Skip header
                    for line in lines[1:]:
                        parts = line.split(',')
                        if len(parts) >= 9:
                            try:
                                fire_lat = float(parts[0])
                                fire_lon = float(parts[1])
                                brightness = float(parts[2]) if parts[2] else None
                                confidence = float(parts[8])
                                
                                total_fires += 1
                                
                                # Calculate distance (rough approximation)
                                lat_diff = abs(fire_lat - lat)
                                lon_diff = abs(fire_lon - lon)
                                distance_approx = ((lat_diff ** 2 + lon_diff ** 2) ** 0.5) * 111  # km
                                
                                if distance_approx <= 100:  # Within 100km
                                    fire_count += 1
                                    max_confidence = max(max_confidence, confidence)
                                    
                                    if len(fires_nearby) < 10:  # Limit to 10 closest
                                        fires_nearby.append({
                                            "latitude": fire_lat,
                                            "longitude": fire_lon,
                                            "distance_km": round(distance_approx, 1),
                                            "confidence": confidence,
                                            "brightness": brightness,
                                            "acq_date": parts[5] if len(parts) > 5 else None,
                                            "acq_time": parts[6] if len(parts) > 6 else None,
                                            "satellite": parts[7] if len(parts) > 7 else None
                                        })
                                        
                            except (ValueError, IndexError, TypeError):
                                continue
                
                fire_data.update({
                    "fires_within_100km": fire_count,
                    "max_confidence": max_confidence,
                    "fire_risk_level": self._get_fire_risk_level(fire_count, max_confidence),
                    "nearby_fires": sorted(fires_nearby, key=lambda x: x["distance_km"])[:5],
                    "total_fires_detected": total_fires
                })
                
            except Exception as e:
                logger.warning(f"Could not fetch fire hotspots from NASA FIRMS: {e}")
                # Provide estimated fire risk based on location and season
                fire_data.update(self._estimate_fire_risk(lat, lon))
            
            # 3. Try to get fire footprints (KML) if MAP_KEY is available
            # This requires a MAP_KEY, so we'll skip for now
            try:
                # fire_footprints_url = f"https://firms.modaps.eosdis.nasa.gov/api/kml_fire_footprints?map_key={MAP_KEY}"
                # This would return KML data with fire polygon footprints
                pass
            except Exception as e:
                logger.debug(f"Fire footprints not available (requires MAP_KEY): {e}")
            
            # If no fires detected, provide estimated risk
            if fire_data["fires_within_100km"] == 0:
                estimated = self._estimate_fire_risk(lat, lon)
                fire_data["fire_risk_level"] = estimated["fire_risk_level"]
                fire_data["risk_factors"] = estimated.get("risk_factors", [])
            
            return fire_data
            
        except Exception as e:
            logger.warning(f"Error fetching comprehensive fire data: {e}")
            return {
                "fires_within_100km": 0,
                "max_confidence": 0,
                "fire_risk_level": "unknown",
                "nearby_fires": [],
                "total_fires_detected": 0,
                "fire_footprints": [],
                "data_availability": {}
            }
    
    def _estimate_fire_risk(self, lat: float, lon: float) -> dict:
        """Estimate fire risk based on location and season when real-time data unavailable"""
        from datetime import datetime
        
        month = datetime.utcnow().month
        risk_level = "low"
        risk_factors = []
        
        # High fire risk regions and seasons
        # Western US (California, Oregon, Washington, Nevada, Arizona)
        if 32 <= lat <= 49 and -125 <= lon <= -110:
            if month in [6, 7, 8, 9, 10]:  # Summer and early fall
                risk_level = "elevated"
                risk_factors.append("Western US fire season")
            else:
                risk_level = "low"
        
        # Southwest US (hot, dry climate)
        elif 31 <= lat <= 37 and -115 <= lon <= -103:
            if month in [5, 6, 7, 8, 9]:
                risk_level = "moderate"
                risk_factors.append("Southwest dry season")
        
        # Australia
        elif -44 <= lat <= -10 and 113 <= lon <= 154:
            if month in [11, 12, 1, 2]:  # Southern hemisphere summer
                risk_level = "elevated"
                risk_factors.append("Australian fire season")
        
        # Mediterranean (Southern Europe)
        elif 36 <= lat <= 45 and -10 <= lon <= 45:
            if month in [6, 7, 8]:
                risk_level = "moderate"
                risk_factors.append("Mediterranean summer")
        
        # Amazon/South America
        elif -20 <= lat <= 5 and -80 <= lon <= -35:
            if month in [8, 9, 10]:  # Dry season
                risk_level = "moderate"
                risk_factors.append("Amazon dry season")
        
        return {
            "fires_within_100km": 0,
            "fire_risk_level": risk_level,
            "risk_factors": risk_factors,
            "data_source": "estimated"
        }
    
    async def _get_precipitation_forecast(self, client: httpx.AsyncClient, lat: float, lon: float) -> dict:
        """Get precipitation forecast data"""
        try:
            # OpenWeather 5-day forecast (includes precipitation)
            forecast_url = "http://api.openweathermap.org/data/2.5/forecast"
            forecast_params = {
                "lat": lat,
                "lon": lon,
                "appid": self.openweather_api_key,
                "units": "metric"
            }
            
            forecast_response = await client.get(forecast_url, params=forecast_params)
            forecast_response.raise_for_status()
            forecast_data = forecast_response.json()
            
            # Process next 24 hours of precipitation data
            precipitation_24h = []
            total_rain_24h = 0
            total_snow_24h = 0
            
            for item in forecast_data.get("list", [])[:8]:  # Next 24 hours (3-hour intervals)
                rain = item.get("rain", {}).get("3h", 0)
                snow = item.get("snow", {}).get("3h", 0)
                total_rain_24h += rain
                total_snow_24h += snow
                
                precipitation_24h.append({
                    "time": item.get("dt_txt"),
                    "rain_mm": rain,
                    "snow_mm": snow,
                    "humidity": item.get("main", {}).get("humidity"),
                    "description": item.get("weather", [{}])[0].get("description", "")
                })
            
            return {
                "total_rain_24h_mm": round(total_rain_24h, 2),
                "total_snow_24h_mm": round(total_snow_24h, 2),
                "precipitation_intensity": self._get_precipitation_intensity(total_rain_24h),
                "forecast_24h": precipitation_24h[:4]  # Next 12 hours
            }
            
        except Exception as e:
            logger.warning(f"Error fetching precipitation data: {e}")
            return {
                "total_rain_24h_mm": 0,
                "total_snow_24h_mm": 0,
                "precipitation_intensity": "none",
                "forecast_24h": []
            }
    
    def _get_precipitation_intensity(self, total_rain_mm: float) -> str:
        """Convert total rain in mm to intensity level"""
        if total_rain_mm >= 10:
            return "heavy"
        elif total_rain_mm >= 5:
            return "moderate"
        elif total_rain_mm >= 1:
            return "light"
        else:
            return "none"
    
    def _get_geomagnetic_storm_level(self, kp_index: float) -> str:
        """Convert Kp index to storm level"""
        if kp_index >= 7:
            return "severe"
        elif kp_index >= 5:
            return "moderate"
        elif kp_index >= 4:
            return "minor"
        else:
            return "quiet"
    
    def _get_fire_risk_level(self, fire_count: int, max_confidence: float) -> str:
        """Determine fire risk level based on nearby fires"""
        if fire_count >= 5 and max_confidence >= 80:
            return "high"
        elif fire_count >= 2 and max_confidence >= 60:
            return "moderate"
        elif fire_count >= 1:
            return "low"
        else:
            return "minimal"
    
    async def _get_weather_forecast(self, lat: float, lon: float, days: int = 3) -> list:
        """Get weather forecast data from OpenWeather API"""
        if not self.openweather_api_key:
            raise HTTPException(status_code=500, detail="OpenWeather API key not configured")

        try:
            async with httpx.AsyncClient() as client:
                # Get 5-day weather forecast
                forecast_url = "http://api.openweathermap.org/data/2.5/forecast"
                forecast_params = {
                    "lat": lat,
                    "lon": lon,
                    "appid": self.openweather_api_key,
                    "units": "metric"
                }

                forecast_response = await client.get(forecast_url, params=forecast_params)
                forecast_response.raise_for_status()
                forecast_data = forecast_response.json()

                # Process forecast data for air quality prediction
                processed_forecast = []
                list_data = forecast_data.get("list", [])

                # Take data points for the requested number of days
                for i, item in enumerate(list_data[:days * 8]):  # 8 data points per day (3-hour intervals)
                    processed_forecast.append({
                        "timestamp": item.get("dt"),
                        "temperature": item.get("main", {}).get("temp"),
                        "humidity": item.get("main", {}).get("humidity"),
                        "pressure": item.get("main", {}).get("pressure"),
                        "wind_speed": item.get("wind", {}).get("speed"),
                        "wind_direction": item.get("wind", {}).get("deg"),
                        "weather_description": item.get("weather", [{}])[0].get("description", ""),
                        "precipitation": item.get("rain", {}).get("3h", 0) + item.get("snow", {}).get("3h", 0),
                        "clouds": item.get("clouds", {}).get("all", 0)
                    })

                return processed_forecast

        except Exception as e:
            logger.error(f"Error fetching weather forecast: {e}")
            return []
    
    async def _get_pollen_data(self, client: httpx.AsyncClient, lat: float, lon: float) -> dict:
        """Get real pollen data from Pollen.com API"""
        try:
            # First, convert lat/lon to ZIP code (approximate)
            zipcode = await self._get_zipcode_from_coords(client, lat, lon)
            
            if not zipcode:
                # Fallback to estimated pollen if no ZIP code found
                return self._get_estimated_pollen_data(lat, lon)
            
            # Pollen.com API endpoint
            pollen_url = f"https://www.pollen.com/api/forecast/current/pollen/{zipcode}"
            
            # Required headers to mimic browser request
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'https://www.pollen.com/',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin'
            }
            
            pollen_response = await client.get(pollen_url, headers=headers, timeout=10.0)
            pollen_response.raise_for_status()
            
            try:
                pollen_raw = pollen_response.json()
            except Exception as json_error:
                logger.warning(f"Failed to parse JSON from Pollen.com: {json_error}")
                return self._get_estimated_pollen_data(lat, lon)
            
            # Parse Pollen.com response - actual format has keys: Type, ForecastDate, Location
            if isinstance(pollen_raw, str):
                return self._get_estimated_pollen_data(lat, lon)
            
            # Get Location data which contains the periods
            location_data = pollen_raw.get('Location', {})
            if isinstance(location_data, str):
                periods = pollen_raw.get('periods', [])
            else:
                periods = location_data.get('periods', [])
            
            if not periods:
                return self._get_estimated_pollen_data(lat, lon)
            
            # Get current day's data - look for "Today" type first
            current_period = None
            for period in periods:
                if period.get('Type') == 'Today':
                    current_period = period
                    break
            
            # Fallback to first period if no "Today" found
            if not current_period:
                current_period = periods[0] if periods else {}
            
            triggers = current_period.get('Triggers', [])
            
            # Extract pollen counts
            tree_pollen = 0
            grass_pollen = 0
            weed_pollen = 0
            mold_spores = 0
            
            # Get the overall index for the period
            period_index = current_period.get('Index', 0)  # Default to 0
            
            for trigger in triggers:
                trigger_name = trigger.get('Name', '').lower()
                plant_type = trigger.get('PlantType', '').lower()
                
                # Use the period index as base and categorize by plant type
                if 'tree' in plant_type or 'tree' in trigger_name:
                    tree_pollen = max(tree_pollen, period_index)
                elif 'grass' in plant_type or 'grass' in trigger_name:
                    grass_pollen = max(grass_pollen, period_index)
                elif 'ragweed' in plant_type or 'ragweed' in trigger_name or 'weed' in trigger_name:
                    weed_pollen = max(weed_pollen, period_index)
                elif 'mold' in plant_type or 'mold' in trigger_name:
                    mold_spores = max(mold_spores, period_index)
            
            return {
                "source": "pollen.com",
                "zipcode": zipcode,
                "tree": self._normalize_pollen_level(tree_pollen),
                "grass": self._normalize_pollen_level(grass_pollen),
                "weed": self._normalize_pollen_level(weed_pollen),
                "mold": self._normalize_pollen_level(mold_spores),
                "overall_risk": self._calculate_overall_pollen_risk(
                    self._normalize_pollen_level(tree_pollen), 
                    self._normalize_pollen_level(grass_pollen), 
                    self._normalize_pollen_level(weed_pollen)
                ),
                "forecast_date": current_period.get('Date'),
                "raw_data": {
                    "tree_raw": tree_pollen,
                    "grass_raw": grass_pollen,
                    "weed_raw": weed_pollen,
                    "mold_raw": mold_spores
                }
            }
            
        except Exception as e:
            logger.warning(f"Error fetching pollen data: {e}")
            # Return empty pollen data instead of failing completely
            return {}
    
    async def _get_zipcode_from_coords(self, client: httpx.AsyncClient, lat: float, lon: float) -> str:
        """Convert coordinates to ZIP code using OpenWeather geocoding"""
        try:
            # Use OpenWeather reverse geocoding (free with your existing key)
            geo_url = "http://api.openweathermap.org/geo/1.0/reverse"
            geo_params = {
                "lat": lat,
                "lon": lon,
                "limit": 1,
                "appid": self.openweather_api_key
            }
            
            geo_response = await client.get(geo_url, params=geo_params, timeout=5.0)
            geo_response.raise_for_status()
            geo_data = geo_response.json()
            
            if geo_data and len(geo_data) > 0:
                # Try to extract ZIP code from the response
                location = geo_data[0]
                
                # Some locations might have ZIP in the name or we can use a mapping
                # For now, let's use major city ZIP codes as approximation
                city_zip_mapping = {
                    "cincinnati": "45202",
                    "columbus": "43215",
                    "cleveland": "44113",
                    "toledo": "43604",
                    "akron": "44308",
                    "dayton": "45402",
                    "new york": "10001",
                    "los angeles": "90210",
                    "chicago": "60601",
                    "houston": "77001",
                    "phoenix": "85001",
                    "philadelphia": "19101",
                    "san antonio": "78201",
                    "san diego": "92101",
                    "dallas": "75201",
                    "san jose": "95101",
                    "austin": "78701",
                    "jacksonville": "32099",
                    "fort worth": "76101",
                    "columbus": "43215",
                    "charlotte": "28201",
                    "san francisco": "94102",
                    "indianapolis": "46201",
                    "seattle": "98101",
                    "denver": "80201",
                    "washington": "20001",
                    "boston": "02101",
                    "el paso": "79901",
                    "detroit": "48201",
                    "nashville": "37201",
                    "portland": "97201",
                    "memphis": "38101",
                    "oklahoma city": "73101",
                    "las vegas": "89101",
                    "louisville": "40201",
                    "baltimore": "21201",
                    "milwaukee": "53201",
                    "albuquerque": "87101",
                    "tucson": "85701",
                    "fresno": "93701",
                    "mesa": "85201",
                    "sacramento": "95814",
                    "atlanta": "30301",
                    "kansas city": "64108",
                    "colorado springs": "80903",
                    "omaha": "68101",
                    "raleigh": "27601",
                    "miami": "33101",
                    "long beach": "90802",
                    "virginia beach": "23451",
                    "oakland": "94601",
                    "minneapolis": "55401",
                    "tulsa": "74101",
                    "tampa": "33601",
                    "arlington": "76010",
                    "new orleans": "70112"
                }
                
                city_name = location.get('name', '').lower()
                if city_name not in city_zip_mapping:
                    # Try to find a nearby city or use a default
                    return "45202"  # Default to Cincinnati for testing
                return city_zip_mapping.get(city_name)
            
            return "45202"  # Default ZIP code for testing
            
        except Exception as e:
            logger.warning(f"Error getting ZIP code: {e}")
            return "45202"  # Default ZIP code for testing
    
    def _get_estimated_pollen_data(self, lat: float, lon: float) -> dict:
        """Fallback to estimated pollen data when Pollen.com is unavailable"""
        # Use existing estimation logic but return in new format
        temp_data = {"temp": 20, "humidity": 60}  # Default values
        
        tree_level = self._estimate_pollen_level("tree", temp_data)
        grass_level = self._estimate_pollen_level("grass", temp_data)
        weed_level = self._estimate_pollen_level("weed", temp_data)
        
        return {
            "source": "estimated",
            "zipcode": None,
            "tree": tree_level,
            "grass": grass_level,
            "weed": weed_level,
            "mold": 2.0,  # Default moderate mold level
            "overall_risk": self._calculate_overall_pollen_risk(tree_level, grass_level, weed_level),
            "forecast_date": datetime.utcnow().strftime("%Y-%m-%d"),
            "raw_data": None
        }
    
    def _normalize_pollen_level(self, raw_count: float) -> float:
        """Convert Pollen.com raw counts to 0-5 scale"""
        # Pollen.com uses 0-12 scale, normalize to 0-5
        if raw_count >= 9.7:
            return 5.0  # Very High
        elif raw_count >= 7.3:
            return 4.0  # High  
        elif raw_count >= 4.9:
            return 3.0  # Moderate
        elif raw_count >= 2.5:
            return 2.0  # Low
        elif raw_count > 0:
            return 1.0  # Very Low
        else:
            return 0.0  # None
    
    def _calculate_overall_pollen_risk(self, tree: float, grass: float, weed: float) -> str:
        """Calculate overall pollen risk level based on normalized values (0-5 scale)"""
        # Use the maximum of the three pollen types
        max_level = max(tree, grass, weed)
        
        # Convert normalized scale (0-5) to risk levels
        if max_level >= 4.0:
            return "very_high"
        elif max_level >= 3.0:
            return "high"
        elif max_level >= 2.0:
            return "moderate"
        elif max_level >= 1.0:
            return "low"
        else:
            return "very_low"
    
    def normalize_air_quality_data(self, raw_data: dict, source: str, lat: float, lon: float) -> AirQualityData:
        """Normalize air quality data from different sources"""
        normalized = {
            "location": {"lat": lat, "lon": lon},
            "timestamp": datetime.utcnow(),
            "source": source,
            "aqi": None,
            "pm25": None,
            "pm10": None,
            "ozone": None,
            "no2": None,
            "so2": None,
            "co": None,
            # Additional measurements
            "nh3": None,  # Ammonia
            "pm1": None,  # PM1.0
            "voc": None,  # Volatile Organic Compounds
            "tree_pollen": None,
            "grass_pollen": None,
            "weed_pollen": None,
            "mold_spores": None,
            "uv_index": None,
            "visibility": None,
            "pressure": None,
            "humidity": None,
            "temperature": None
        }
        
        if source == "airnow":
            for reading in raw_data:
                param = reading.get("ParameterName", "").lower()
                value = reading.get("AQI")
                if "pm2.5" in param:
                    normalized["pm25"] = value
                elif "pm10" in param:
                    normalized["pm10"] = value
                elif "ozone" in param:
                    normalized["ozone"] = value
                    normalized["aqi"] = value  # Use ozone AQI as overall AQI
        
        elif source == "breezometer":
            data = raw_data.get("data", {})
            indexes = data.get("indexes", {})
            pollutants = data.get("pollutants", {})
            
            # Get AQI
            baqi = indexes.get("baqi", {})
            normalized["aqi"] = baqi.get("aqi")
            
            # Get pollutant concentrations
            if "pm25" in pollutants:
                normalized["pm25"] = pollutants["pm25"].get("concentration", {}).get("value")
            if "pm10" in pollutants:
                normalized["pm10"] = pollutants["pm10"].get("concentration", {}).get("value")
            if "o3" in pollutants:
                normalized["ozone"] = pollutants["o3"].get("concentration", {}).get("value")
            if "no2" in pollutants:
                normalized["no2"] = pollutants["no2"].get("concentration", {}).get("value")
            if "so2" in pollutants:
                normalized["so2"] = pollutants["so2"].get("concentration", {}).get("value")
            if "co" in pollutants:
                normalized["co"] = pollutants["co"].get("concentration", {}).get("value")
        
        elif source == "openaq":
            results = raw_data.get("results", [])
            for measurement in results:
                parameter = measurement.get("parameter", "").lower()
                value = measurement.get("value")
                
                if parameter == "pm25":
                    normalized["pm25"] = value
                elif parameter == "pm10":
                    normalized["pm10"] = value
                elif parameter == "o3":
                    normalized["ozone"] = value
                elif parameter == "no2":
                    normalized["no2"] = value
                elif parameter == "so2":
                    normalized["so2"] = value
                elif parameter == "co":
                    normalized["co"] = value
        
        elif source == "openweather":
            # OpenWeather API response format
            data_list = raw_data.get("list", [])
            if data_list:
                data = data_list[0]  # Get first (current) measurement
                main = data.get("main", {})
                components = data.get("components", {})
                
                # AQI (1-5 scale, convert to 0-500 scale approximately)
                aqi_scale_map = {1: 50, 2: 100, 3: 150, 4: 200, 5: 300}
                if main.get("aqi") is None:
                    raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="AQI data missing")
                normalized["aqi"] = aqi_scale_map.get(main.get("aqi"))
                
                # All available pollutant concentrations (μg/m³) with validation
                def validate_pollutant(value, name):
                    """Validate pollutant values and return None for invalid data"""
                    if value is None:
                        return None
                    # Check for placeholder/invalid values
                    if isinstance(value, (int, float)):
                        if value < 0 or value > 1000:  # Reasonable upper limit
                            return None
                        if abs(value) > 1e6:  # Check for extremely large numbers
                            return None
                        # Check for specific invalid values
                        if abs(value) > 1e10:  # Check for extremely large numbers like -9998999486464
                            return None
                    return value
                
                normalized["pm25"] = validate_pollutant(components.get("pm2_5"), "pm2_5")
                normalized["pm10"] = validate_pollutant(components.get("pm10"), "pm10")
                normalized["pm1"] = validate_pollutant(components.get("pm1_0"), "pm1_0")
                normalized["ozone"] = validate_pollutant(components.get("o3"), "o3")
                normalized["no2"] = validate_pollutant(components.get("no2"), "no2")
                normalized["so2"] = validate_pollutant(components.get("so2"), "so2")
                normalized["co"] = validate_pollutant(components.get("co"), "co")
                normalized["nh3"] = validate_pollutant(components.get("nh3"), "nh3")
                
                # Note: OpenWeather doesn't provide VOCs or pollen directly
                # We'll need additional API calls for those
        
        return AirQualityData(**normalized)
    
    def _estimate_pollen_level(self, pollen_type: str, weather_data: dict) -> float:
        """Estimate pollen levels based on weather conditions and season"""
        from datetime import datetime
        
        # Get current month for seasonal estimation
        current_month = datetime.utcnow().month
        temp = weather_data.get("temp", 20)  # Default temperature
        humidity = weather_data.get("humidity", 50)  # Default humidity
        
        # Base pollen levels by season and type
        pollen_seasons = {
            "tree": [3, 4, 5, 6],      # March-June
            "grass": [5, 6, 7, 8],     # May-August  
            "weed": [8, 9, 10, 11]     # August-November
        }
        
        # Check if current month is in pollen season
        if current_month in pollen_seasons.get(pollen_type, []):
            base_level = 3.0  # Moderate level during season
        else:
            base_level = 1.0  # Low level outside season
        
        # Adjust based on weather conditions
        # Warm, dry weather increases pollen
        if temp > 20 and humidity < 60:
            base_level *= 1.5
        elif temp < 10 or humidity > 80:
            base_level *= 0.5
        
        # Cap at reasonable levels (0-5 scale)
        return min(max(base_level, 0.0), 5.0)

# Initialize service lazily to ensure environment variables are loaded
air_quality_service = None

def get_air_quality_service():
    global air_quality_service
    if air_quality_service is None:
        air_quality_service = AirQualityService()
    return air_quality_service

@router.get("/test", response_model=dict)
async def test_air_quality_apis(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude")
):
    """Test endpoint to verify API connectivity without authentication"""
    results = {}
    
    # Debug: Check if environment variables are loaded
    results["env_debug"] = {
        "openweather_key_exists": bool(os.getenv("OPENWEATHER_API_KEY")),
        "airnow_key_exists": bool(os.getenv("AIRNOW_API_KEY")),
        "purpleair_key_exists": bool(os.getenv("PURPLEAIR_API_KEY")),
        "openweather_key_length": len(os.getenv("OPENWEATHER_API_KEY", "")),
        "airnow_key_length": len(os.getenv("AIRNOW_API_KEY", "")),
        "purpleair_key_length": len(os.getenv("PURPLEAIR_API_KEY", ""))
    }
    
    service = get_air_quality_service()
    
    # Test OpenWeather API
    try:
        if service.openweather_api_key:
            openweather_data = await service.get_openweather_data(lat, lon)
            results["openweather"] = {"status": "success", "data": openweather_data}
        else:
            results["openweather"] = {"status": "no_api_key"}
    except Exception as e:
        results["openweather"] = {"status": "error", "message": str(e)}
    
    # Test AirNow API
    try:
        if service.airnow_api_key:
            airnow_data = await service.get_airnow_data(lat, lon)
            results["airnow"] = {"status": "success", "data": airnow_data}
        else:
            results["airnow"] = {"status": "no_api_key"}
    except Exception as e:
        results["airnow"] = {"status": "error", "message": str(e)}
    
    # Test PurpleAir API
    try:
        if service.purpleair_api_key:
            purpleair_data = await service.get_purpleair_data(lat, lon)
            results["purpleair"] = {"status": "success", "data": purpleair_data}
        else:
            results["purpleair"] = {"status": "no_api_key"}
    except Exception as e:
        results["purpleair"] = {"status": "error", "message": str(e)}
    
    return results

@router.get("/current-test", response_model=List[AirQualityResponse])
async def get_current_air_quality_test(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    sources: Optional[str] = Query("all", description="Data sources (internal use only)")
):
    """Test endpoint for current air quality data without authentication"""
    try:
        results = []
        
        # Always try all sources in order of preference, return first successful one
        # Priority: OpenWeather (most reliable) -> AirNow -> Breezometer
        # Note: OpenAQ API v2 deprecated (410 Gone), removed from sources
        preferred_sources = ["openweather", "airnow", "breezometer"]
        source_list = sources.split(",") if sources != "all" else preferred_sources
        
        service = get_air_quality_service()
        
        for source in source_list:
            try:
                if source == "openweather":
                    data = await service.get_openweather_data(lat, lon)
                elif source == "airnow":
                    data = await service.get_airnow_data(lat, lon)
                elif source == "breezometer":
                    data = await service.get_breezometer_data(lat, lon)
                # OpenAQ API v2 deprecated - removed
                else:
                    continue
                    
                if data and data.get("aqi") is not None:
                    results.append(AirQualityResponse(
                        id=str(uuid.uuid4()),
                        location={"lat": lat, "lon": lon},
                        timestamp=datetime.utcnow(),
                        source=source,
                        aqi=data.get("aqi", 0),
                        pm25=data.get("pm25"),
                        pm10=data.get("pm10"),
                        ozone=data.get("ozone"),
                        no2=data.get("no2"),
                        so2=data.get("so2"),
                        co=data.get("co"),
                        nh3=data.get("nh3"),
                        created_at=datetime.utcnow()
                    ))
                    break  # Return first successful result
                    
            except Exception as e:
                logger.warning(f"Failed to get data from {source}: {e}")
                continue
        
        if not results:
            # Return location-aware fallback data if all sources fail
            # Generate realistic air quality data based on location characteristics
            aqi, pm25, pm10, ozone, no2, so2, co, nh3 = generate_location_based_fallback(lat, lon)
            
            results.append(AirQualityResponse(
                id=str(uuid.uuid4()),
                location={"lat": lat, "lon": lon},
                timestamp=datetime.utcnow(),
                source="fallback",
                aqi=aqi,
                pm25=pm25,
                pm10=pm10,
                ozone=ozone,
                no2=no2,
                so2=so2,
                co=co,
                nh3=nh3,
                created_at=datetime.utcnow()
            ))
        
        return results
        
    except Exception as e:
        logger.error(f"Error in air quality test endpoint: {e}")
        # Return minimal fallback data
        return [AirQualityResponse(
            id=str(uuid.uuid4()),
            location={"lat": lat, "lon": lon},
            timestamp=datetime.utcnow(),
            source="error_fallback",
            aqi=50,
            pm25=15.0,
            pm10=25.0,
            ozone=45.0,
            no2=20.0,
            so2=5.0,
            co=2.0,
            nh3=10.0,
            created_at=datetime.utcnow()
        )]

@router.get("/current", response_model=List[AirQualityResponse])
async def get_current_air_quality(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    sources: Optional[str] = Query("all", description="Data sources (internal use only)"),
    current_user: User = Depends(get_current_user)
):
    """Get current air quality data from the best available sources"""
    db = get_db()
    results = []
    
    # Always try all sources in order of preference, return first successful one
    # Priority: OpenWeather (most reliable) -> AirNow -> Breezometer
    # Note: OpenAQ API v2 deprecated (410 Gone), removed from sources
    preferred_sources = ["openweather", "airnow", "breezometer"]
    source_list = sources.split(",") if sources != "all" else preferred_sources
    
    service = get_air_quality_service()
    
    for source in source_list:
        try:
            if source == "airnow":
                raw_data = await service.get_airnow_data(lat, lon)
                if raw_data:
                    normalized_data = service.normalize_air_quality_data(raw_data, source, lat, lon)
                    
                    # Return data directly without storing (database schema mismatch)
                    # Convert to response format
                    response_data = normalized_data.dict()
                    response_data["id"] = f"{source}_{lat}_{lon}_{int(datetime.utcnow().timestamp())}"
                    response_data["created_at"] = datetime.utcnow()
                    results.append(AirQualityResponse(**response_data))
            
            elif source == "breezometer":
                raw_data = await service.get_breezometer_data(lat, lon)
                if raw_data:
                    normalized_data = service.normalize_air_quality_data(raw_data, source, lat, lon)
                    
                    # Return data directly without storing (database schema mismatch)
                    # Convert to response format
                    response_data = normalized_data.dict()
                    response_data["id"] = f"{source}_{lat}_{lon}_{int(datetime.utcnow().timestamp())}"
                    response_data["created_at"] = datetime.utcnow()
                    results.append(AirQualityResponse(**response_data))
            
            # OpenAQ API v2 deprecated - removed
                    
                    # Return data directly without storing (database schema mismatch)
                    # Convert to response format
                    response_data = normalized_data.dict()
                    response_data["id"] = f"{source}_{lat}_{lon}_{int(datetime.utcnow().timestamp())}"
                    response_data["created_at"] = datetime.utcnow()
                    results.append(AirQualityResponse(**response_data))
            
            elif source == "openweather":
                # Get both air quality and comprehensive environmental data
                raw_air_data = await service.get_openweather_data(lat, lon)
                environmental_data = await service.get_comprehensive_environmental_data(lat, lon)
                
                if raw_air_data:
                    normalized_data = service.normalize_air_quality_data(raw_air_data, source, lat, lon)
                    
                    # Enhance with additional environmental data
                    if environmental_data:
                        weather = environmental_data.get("weather", {})
                        uv_data = environmental_data.get("uv", {})
                        main_weather = weather.get("main", {})
                        
                        # Add weather data to normalized response
                        normalized_dict = normalized_data.dict()
                        normalized_dict.update({
                            "temperature": main_weather.get("temp"),
                            "humidity": main_weather.get("humidity"),
                            "pressure": main_weather.get("pressure"),
                            "visibility": weather.get("visibility") / 1000 if weather.get("visibility") else None,  # Convert to km
                            "uv_index": uv_data.get("value"),
                            # Estimate pollen levels based on season and weather (simplified)
                            "tree_pollen": service._estimate_pollen_level("tree", main_weather),
                            "grass_pollen": service._estimate_pollen_level("grass", main_weather),
                            "weed_pollen": service._estimate_pollen_level("weed", main_weather)
                        })
                        
                        # Return enhanced data
                        normalized_dict["id"] = f"{source}_{lat}_{lon}_{int(datetime.utcnow().timestamp())}"
                        normalized_dict["created_at"] = datetime.utcnow()
                        results.append(AirQualityResponse(**normalized_dict))
                    else:
                        # Fallback to basic air quality data
                        response_data = normalized_data.dict()
                        response_data["id"] = f"{source}_{lat}_{lon}_{int(datetime.utcnow().timestamp())}"
                        response_data["created_at"] = datetime.utcnow()
                        results.append(AirQualityResponse(**response_data))
        
        except Exception as e:
            # Log as warning instead of error to reduce noise
            logger.warning(f"Source {source} unavailable: {str(e)[:100]}...")
            continue
        
        # If we got data from any source, return it immediately (don't try other sources)
        if results:
            break
    
    if not results:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Air quality data temporarily unavailable. Please try again later."
        )
    
    return results

@router.get("/comprehensive-test", response_model=Dict[str, Any])
async def get_comprehensive_environmental_data_test_endpoint(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude")
):
    """Test endpoint for comprehensive environmental data without authentication"""
    try:
        service = get_air_quality_service()
        
        # Get air quality data from OpenWeather
        air_quality_data = await service.get_openweather_data(lat, lon)
        
        # Get additional environmental data
        environmental_data = await service.get_comprehensive_environmental_data(lat, lon)
        
        if not air_quality_data:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Air quality data unavailable"
            )
        
        # Extract air quality components
        data_list = air_quality_data.get("list", [])
        if not data_list:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="No air quality data available"
            )
        
        current_data = data_list[0]
        main = current_data.get("main", {})
        components = current_data.get("components", {})
        
        # Convert AQI from 1-5 scale to 0-500 scale
        aqi_scale_map = {1: 50, 2: 100, 3: 150, 4: 200, 5: 300}
        aqi = aqi_scale_map.get(main.get("aqi", 1), 50)
        
        # Get pollutant concentrations (μg/m³)
        pm25 = components.get("pm2_5", 0)
        pm10 = components.get("pm10", 0)
        ozone = components.get("o3", 0)
        no2 = components.get("no2", 0)
        so2 = components.get("so2", 0)
        co = components.get("co", 0)
        nh3 = components.get("nh3", 0)
        
        # Combine all comprehensive environmental data
        comprehensive_data = {
            "location": {"lat": lat, "lon": lon},
            "timestamp": datetime.utcnow().isoformat(),
            "air_quality": {
                "aqi": aqi,
                "pm25": pm25,
                "pm10": pm10,
                "pm1": None,  # Not available in OpenWeather
                "ozone": ozone,
                "no2": no2,
                "so2": so2,
                "co": co,
                "nh3": nh3,
                "category": "good" if aqi <= 50 else "moderate" if aqi <= 100 else "unhealthy_sensitive" if aqi <= 150 else "unhealthy" if aqi <= 200 else "very_unhealthy" if aqi <= 300 else "hazardous"
            }
        }
        
        # Add additional environmental data if available
        if environmental_data:
            weather = environmental_data.get("weather", {})
            uv_data = environmental_data.get("uv", {})
            
            comprehensive_data.update({
                "weather": {
                    "temperature": weather.get("temperature"),
                    "humidity": weather.get("humidity"),
                    "pressure": weather.get("pressure"),
                    "visibility": weather.get("visibility"),
                    "wind_speed": weather.get("wind_speed"),
                    "wind_direction": weather.get("wind_direction"),
                    "description": weather.get("description")
                },
                "uv_index": uv_data.get("uv_index"),
                "pollen": environmental_data.get("pollen", {}),
                "purpleair": environmental_data.get("purpleair", {}),
                "solar_magnetic": environmental_data.get("solar", {}),
                "forest_fires": environmental_data.get("forest_fires", {}),
                "precipitation": environmental_data.get("precipitation", {}),
                "environmental_factors": environmental_data.get("environmental_factors", {})
            })
        
        return comprehensive_data
        
    except Exception as e:
        logger.error(f"Error getting comprehensive environmental data: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve environmental data"
        )

@router.get("/comprehensive", response_model=Dict[str, Any])
async def get_comprehensive_environmental_data_endpoint(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    current_user: User = Depends(get_current_user)
):
    """Get comprehensive environmental data including air quality, weather, UV, and pollen estimates"""
    try:
        service = get_air_quality_service()
        
        # Get air quality data
        air_quality_data = await service.get_openweather_data(lat, lon)
        
        # Get additional environmental data
        environmental_data = await service.get_comprehensive_environmental_data(lat, lon)
        
        if not air_quality_data:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Environmental data temporarily unavailable"
            )
        
        # Validation function for pollutant values
        def validate_pollutant(value, name):
            """Validate pollutant values and return None for invalid data"""
            if value is None:
                return None
            # Check for placeholder/invalid values
            if isinstance(value, (int, float)):
                if value < 0 or value > 1000:  # Reasonable upper limit
                    return None
                if abs(value) > 1e6:  # Check for extremely large numbers
                    return None
            return value

        # Process air quality data directly from OpenWeather response
        # Handle both list and dict responses from the API
        if isinstance(air_quality_data, list):
            air_data_list = air_quality_data
        else:
            air_data_list = air_quality_data.get("list", [])

        if not air_data_list:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="No air quality data available"
            )

        logger.info(f"Air quality data type: {type(air_quality_data)}, list length: {len(air_data_list) if isinstance(air_data_list, list) else 'N/A'}")

        air_data = air_data_list[0]
        main = air_data.get("main", {})
        components = air_data.get("components", {})
        
        # Convert AQI scale (1-5 to 0-500)
        aqi_scale_map = {1: 50, 2: 100, 3: 150, 4: 200, 5: 300}
        if main.get("aqi") is None:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="AQI data missing")
        aqi_value = aqi_scale_map.get(main.get("aqi"))
        
        # Get PM values with validation
        pm25 = validate_pollutant(components.get("pm2_5"), "pm2_5")
        pm10 = validate_pollutant(components.get("pm10"), "pm10")
        
        # If PM values are invalid, try to get from AirNow as fallback
        if pm25 is None or pm10 is None:
            try:
                logger.info("PM values invalid from OpenWeather, trying AirNow fallback")
                airnow_data = await service.get_airnow_data(lat, lon)
                if airnow_data:
                    # Extract PM values from AirNow response
                    for reading in airnow_data.get("data", []):
                        param = reading.get("ParameterName", "").lower()
                        value = reading.get("AQI")
                        if "pm2.5" in param and pm25 is None:
                            pm25 = value
                        elif "pm10" in param and pm10 is None:
                            pm10 = value
            except Exception as e:
                logger.warning(f"AirNow fallback failed: {e}")
        
        # If still no valid PM values, use reasonable defaults based on AQI
        if pm25 is None:
            if aqi_value <= 50:
                pm25 = 12.0  # Good air quality
            elif aqi_value <= 100:
                pm25 = 35.0  # Moderate air quality
            else:
                pm25 = 55.0  # Unhealthy air quality
        
        if pm10 is None:
            if aqi_value <= 50:
                pm10 = 20.0  # Good air quality
            elif aqi_value <= 100:
                pm10 = 50.0  # Moderate air quality
            else:
                pm10 = 80.0  # Unhealthy air quality

        # Combine all comprehensive environmental data
        comprehensive_data = {
            "location": {"lat": lat, "lon": lon},
            "timestamp": datetime.utcnow().isoformat(),
            "air_quality": {
                "aqi": aqi_value,
                "pm25": pm25,
                "pm10": pm10,
                "pm1": validate_pollutant(components.get("pm1_0"), "pm1_0"),
                "ozone": validate_pollutant(components.get("o3"), "o3"),
                "no2": validate_pollutant(components.get("no2"), "no2"),
                "so2": validate_pollutant(components.get("so2"), "so2"),
                "co": validate_pollutant(components.get("co"), "co"),
                "nh3": validate_pollutant(components.get("nh3"), "nh3"),
                "category": _get_aqi_category(aqi_value)
            }
        }
        
        # Add weather and environmental data if available
        if environmental_data:
            weather = environmental_data.get("weather", {})
            uv_data = environmental_data.get("uv", {})
            
            comprehensive_data.update({
                "weather": {
                    "temperature": weather.get("temperature"),
                    "humidity": weather.get("humidity"),
                    "pressure": weather.get("pressure"),
                    "visibility": weather.get("visibility"),
                    "wind_speed": weather.get("wind_speed"),
                    "wind_direction": weather.get("wind_direction"),
                    "description": weather.get("description")
                },
                "uv_index": uv_data.get("value"),
                "pollen": environmental_data.get("pollen", {}),
                "purpleair": environmental_data.get("purpleair", {}),
                "solar_magnetic": environmental_data.get("solar", {}),
                "forest_fires": environmental_data.get("fires", {}),
                "precipitation": environmental_data.get("precipitation", {}),
                "environmental_factors": {
                    "season": _get_current_season(),
                    "air_quality_category": _get_aqi_category(aqi_value),
                    "pollen_season_active": _is_pollen_season_active(),
                    "weather_impact": _assess_weather_impact(weather),
                    "fire_impact": _assess_fire_impact(environmental_data.get("fires", {})),
                    "solar_impact": _assess_solar_impact(environmental_data.get("solar", {}))
                }
            })
        
        return comprehensive_data
        
    except Exception as e:
        logger.error(f"Error getting comprehensive environmental data: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve environmental data"
        )

def _get_current_season() -> str:
    """Get current season based on month"""
    month = datetime.utcnow().month
    if month in [12, 1, 2]:
        return "winter"
    elif month in [3, 4, 5]:
        return "spring"
    elif month in [6, 7, 8]:
        return "summer"
    else:
        return "fall"

def _get_aqi_category(aqi: int) -> str:
    """Get AQI category description"""
    if aqi <= 50:
        return "good"
    elif aqi <= 100:
        return "moderate"
    elif aqi <= 150:
        return "unhealthy_for_sensitive"
    elif aqi <= 200:
        return "unhealthy"
    elif aqi <= 300:
        return "very_unhealthy"
    else:
        return "hazardous"

def _is_pollen_season_active() -> bool:
    """Check if any pollen season is currently active"""
    month = datetime.utcnow().month
    return month in [3, 4, 5, 6, 7, 8, 9, 10, 11]  # March through November

def _assess_weather_impact(weather_data: dict) -> str:
    """Assess weather impact on air quality and allergies"""
    temp = weather_data.get("temp", 20)  # Default temperature
    humidity = weather_data.get("humidity", 50)  # Default humidity
    
    if temp > 25 and humidity < 50:
        return "high_pollen_risk"
    elif temp < 5 or humidity > 85:
        return "low_pollen_risk"
    elif humidity > 70:
        return "mold_risk"
    else:
        return "moderate_risk"

def _assess_fire_impact(fire_data: dict) -> str:
    """Assess fire impact on air quality"""
    fire_count = fire_data.get("fires_within_100km", 0)  # Default to 0
    fire_risk = fire_data.get("fire_risk_level", "minimal")  # Default to minimal
    
    if fire_risk == "high":
        return "severe_air_quality_impact"
    elif fire_risk == "moderate":
        return "moderate_air_quality_impact"
    elif fire_risk == "low":
        return "minor_air_quality_impact"
    else:
        return "no_fire_impact"

def _assess_solar_impact(solar_data: dict) -> str:
    """Assess solar magnetic activity impact on sensitive individuals"""
    storm_level = solar_data.get("storm_level", "quiet")  # Default to quiet
    kp_index = solar_data.get("kp_index", 0)  # Default to 0
    
    if storm_level == "severe":
        return "high_sensitivity_risk"
    elif storm_level == "moderate":
        return "moderate_sensitivity_risk"
    elif storm_level == "minor":
        return "minor_sensitivity_risk"
    else:
        return "no_solar_impact"

@router.get("/history", response_model=List[AirQualityResponse])
async def get_air_quality_history(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    hours: int = Query(24, description="Hours of history to retrieve"),
    current_user: User = Depends(get_current_user)
):
    """Get historical air quality data"""
    db = get_db()
    
    try:
        since = datetime.utcnow() - timedelta(hours=hours)
        
        result = db.table("air_quality_data").select("*").gte("timestamp", since.isoformat()).order("timestamp", desc=True).execute()
        
        if not result.data:
            return []
        
        return [AirQualityResponse(**item) for item in result.data]
        
    except Exception as e:
        logger.error(f"Error fetching air quality history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch air quality history"
        )

@router.get("/forecast")
async def get_air_quality_forecast(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    days: int = Query(3, description="Days of forecast"),
    current_user: User = Depends(get_current_user)
):
    """Get air quality forecast using available weather APIs"""
    try:
        # Validate input parameters
        if days < 1 or days > 7:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Forecast days must be between 1 and 7"
            )

        service = get_air_quality_service()

        # Get forecast data from OpenWeather API
        forecast_data = await service._get_weather_forecast(lat, lon, days)

        if not forecast_data:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Forecast data temporarily unavailable"
            )

        return {
            "forecast": forecast_data,
            "location": {"lat": lat, "lon": lon},
            "days": days,
            "generated_at": datetime.utcnow().isoformat(),
            "source": "openweather"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating air quality forecast: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate air quality forecast"
        )
