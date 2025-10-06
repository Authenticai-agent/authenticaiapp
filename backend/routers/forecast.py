"""
Air Quality Forecast API
Provides 24-hour predictions for AQI, PM2.5, and Ozone
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any
import httpx
import os
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/forecast/tomorrow")
async def get_tomorrow_forecast(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude")
) -> Dict[str, Any]:
    """
    Get tomorrow's air quality forecast
    
    Returns predictions for:
    - AQI (Air Quality Index)
    - PM2.5 (Fine Particulate Matter)
    - Ozone (O3)
    
    Uses OpenWeather Air Pollution API forecast endpoint
    """
    try:
        openweather_key = os.getenv("OPENWEATHER_API_KEY")
        
        if not openweather_key:
            logger.warning("OpenWeather API key not configured")
            return _generate_forecast_fallback(lat, lon)
        
        # Fetch forecast from OpenWeather
        url = "http://api.openweathermap.org/data/2.5/air_pollution/forecast"
        params = {
            "lat": lat,
            "lon": lon,
            "appid": openweather_key
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            if not data.get('list') or len(data['list']) == 0:
                return _generate_forecast_fallback(lat, lon)
            
            # Get tomorrow's forecast (24 hours from now)
            # API returns hourly forecasts, we want ~24 hours ahead
            tomorrow_index = min(24, len(data['list']) - 1)
            tomorrow_data = data['list'][tomorrow_index]
            
            components = tomorrow_data['components']
            aqi_index = tomorrow_data['main']['aqi']
            
            # Convert OpenWeather AQI (1-5) to US AQI using PM2.5
            # This is more accurate than simple multiplication
            pm25 = components.get('pm2_5', 0)
            
            # Calculate US AQI from PM2.5 concentration
            if pm25 <= 12.0:
                us_aqi = ((50 - 0) / (12.0 - 0.0)) * (pm25 - 0.0) + 0
            elif pm25 <= 35.4:
                us_aqi = ((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51
            elif pm25 <= 55.4:
                us_aqi = ((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5) + 101
            elif pm25 <= 150.4:
                us_aqi = ((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5) + 151
            elif pm25 <= 250.4:
                us_aqi = ((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5) + 201
            elif pm25 <= 350.4:
                us_aqi = ((400 - 301) / (350.4 - 250.5)) * (pm25 - 250.5) + 301
            else:
                us_aqi = ((500 - 401) / (500.4 - 350.5)) * (pm25 - 350.5) + 401
            
            forecast = {
                'aqi': int(us_aqi),
                'pm25': round(pm25, 1),
                'pm10': round(components.get('pm10', 0), 1),
                'ozone': round(components.get('o3', 0), 1),
                'no2': round(components.get('no2', 0), 1),
                'so2': round(components.get('so2', 0), 1),
                'co': round(components.get('co', 0), 1),
                'timestamp': tomorrow_data['dt'],
                'forecast_time': datetime.fromtimestamp(tomorrow_data['dt']).isoformat(),
                'source': 'openweather_forecast',
                'openweather_aqi_index': aqi_index  # Keep original for debugging
            }
            
            logger.info(f"✅ REAL FORECAST for ({lat}, {lon}): AQI={forecast['aqi']}, PM2.5={forecast['pm25']}, Source=OpenWeather API")
            return forecast
            
    except httpx.HTTPError as e:
        logger.error(f"HTTP error fetching forecast: {e}")
        return _generate_forecast_fallback(lat, lon)
    except Exception as e:
        logger.error(f"Error fetching forecast: {e}")
        return _generate_forecast_fallback(lat, lon)


def _generate_forecast_fallback(lat: float, lon: float) -> Dict[str, Any]:
    """
    FALLBACK ONLY - Returns null to indicate no forecast available
    
    We should NOT generate fake forecasts - better to show no data
    """
    logger.warning(f"⚠️ NO REAL FORECAST DATA AVAILABLE for ({lat}, {lon}) - API key missing or API failed")
    
    # Return null/empty to indicate no forecast available
    # Frontend should handle this gracefully
    return {
        'aqi': None,
        'pm25': None,
        'pm10': None,
        'ozone': None,
        'no2': None,
        'so2': None,
        'co': None,
        'timestamp': None,
        'forecast_time': None,
        'source': 'no_data_available',
        'error': 'Forecast data unavailable - API key not configured or API request failed'
    }
    


@router.get("/forecast/week")
async def get_week_forecast(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude")
) -> Dict[str, Any]:
    """
    Get 7-day air quality forecast
    
    Premium feature - requires subscription
    Returns daily predictions for the next 7 days
    """
    # This would be a premium feature
    # For now, return a simple response
    return {
        "message": "7-day forecast is a premium feature",
        "upgrade_url": "/pricing",
        "preview": {
            "tomorrow": await get_tomorrow_forecast(lat, lon)
        }
    }
