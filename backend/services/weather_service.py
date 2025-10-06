import httpx
import os
from datetime import datetime
from typing import Dict, Any, Optional
from utils.logger import setup_logger

logger = setup_logger()

class WeatherService:
    def __init__(self):
        self.openweather_api_key = os.getenv("OPENWEATHER_API_KEY")
        self.base_url = "https://api.openweathermap.org/data/2.5"
    
    async def get_current_weather(self, lat: float, lon: float) -> Dict[str, Any]:
        """Get current weather data from OpenWeatherMap"""
        if not self.openweather_api_key:
            raise ValueError("OpenWeatherMap API key not configured")
        
        url = f"{self.base_url}/weather"
        params = {
            "lat": lat,
            "lon": lon,
            "appid": self.openweather_api_key,
            "units": "metric"
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                return response.json()
            except httpx.RequestError as e:
                logger.error(f"Weather API request failed: {e}")
                raise
    
    async def get_weather_forecast(self, lat: float, lon: float, days: int = 5) -> Dict[str, Any]:
        """Get weather forecast from OpenWeatherMap"""
        if not self.openweather_api_key:
            raise ValueError("OpenWeatherMap API key not configured")
        
        url = f"{self.base_url}/forecast"
        params = {
            "lat": lat,
            "lon": lon,
            "appid": self.openweather_api_key,
            "units": "metric",
            "cnt": days * 8  # 8 forecasts per day (3-hour intervals)
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                return response.json()
            except httpx.RequestError as e:
                logger.error(f"Weather forecast API request failed: {e}")
                raise
    
    def normalize_weather_data(self, raw_data: Dict[str, Any], lat: float, lon: float) -> Dict[str, Any]:
        """Normalize weather data from OpenWeatherMap format"""
        main = raw_data.get("main", {})
        wind = raw_data.get("wind", {})
        
        return {
            "location": {"lat": lat, "lon": lon},
            "timestamp": datetime.utcnow(),
            "temperature": main.get("temp"),
            "humidity": main.get("humidity"),
            "pressure": main.get("pressure"),
            "wind_speed": wind.get("speed"),
            "wind_direction": wind.get("deg"),
            "precipitation": raw_data.get("rain", {}).get("1h", 0) + raw_data.get("snow", {}).get("1h", 0),
            "uv_index": None,  # Would need separate UV API call
            "source": "openweathermap"
        }
