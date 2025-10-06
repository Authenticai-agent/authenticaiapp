import httpx
import os
from datetime import datetime
from typing import Dict, Any, Optional
from utils.logger import setup_logger

logger = setup_logger()

class PollenService:
    def __init__(self):
        self.pollen_api_key = os.getenv("POLLEN_API_KEY")
        self.tomorrow_io_key = os.getenv("TOMORROW_IO_API_KEY")
    
    async def get_pollen_data_tomorrow_io(self, lat: float, lon: float) -> Dict[str, Any]:
        """Get pollen data from Tomorrow.io API"""
        if not self.tomorrow_io_key:
            raise ValueError("Tomorrow.io API key not configured")
        
        url = "https://api.tomorrow.io/v4/timelines"
        params = {
            "location": f"{lat},{lon}",
            "fields": ["treeIndex", "grassIndex", "weedIndex", "moldIndex"],
            "timesteps": "1d",
            "units": "metric",
            "apikey": self.tomorrow_io_key
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                return response.json()
            except httpx.RequestError as e:
                logger.error(f"Tomorrow.io pollen API request failed: {e}")
                raise
    
    async def get_pollen_data_breezometer(self, lat: float, lon: float) -> Dict[str, Any]:
        """Get pollen data from Breezometer API"""
        breezometer_key = os.getenv("BREEZOMETER_API_KEY")
        if not breezometer_key:
            raise ValueError("Breezometer API key not configured")
        
        url = "https://api.breezometer.com/pollen/v2/current-conditions"
        params = {
            "lat": lat,
            "lon": lon,
            "key": breezometer_key,
            "features": "types_information,plants_information,forecasts"
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                return response.json()
            except httpx.RequestError as e:
                logger.error(f"Breezometer pollen API request failed: {e}")
                raise
    
    def normalize_pollen_data(self, raw_data: Dict[str, Any], source: str, lat: float, lon: float) -> Dict[str, Any]:
        """Normalize pollen data from different sources"""
        normalized = {
            "location": {"lat": lat, "lon": lon},
            "timestamp": datetime.utcnow(),
            "tree_pollen": None,
            "grass_pollen": None,
            "weed_pollen": None,
            "mold_spores": None,
            "total_pollen": None,
            "source": source
        }
        
        if source == "tomorrow_io":
            timelines = raw_data.get("data", {}).get("timelines", [])
            if timelines:
                intervals = timelines[0].get("intervals", [])
                if intervals:
                    values = intervals[0].get("values", {})
                    normalized["tree_pollen"] = values.get("treeIndex")
                    normalized["grass_pollen"] = values.get("grassIndex")
                    normalized["weed_pollen"] = values.get("weedIndex")
                    normalized["mold_spores"] = values.get("moldIndex")
        
        elif source == "breezometer":
            data = raw_data.get("data", {})
            types = data.get("types", {})
            
            if "tree" in types:
                normalized["tree_pollen"] = types["tree"].get("index", {}).get("value")
            if "grass" in types:
                normalized["grass_pollen"] = types["grass"].get("index", {}).get("value")
            if "weed" in types:
                normalized["weed_pollen"] = types["weed"].get("index", {}).get("value")
            
            # Calculate total pollen
            pollen_values = [v for v in [normalized["tree_pollen"], normalized["grass_pollen"], normalized["weed_pollen"]] if v is not None]
            if pollen_values:
                normalized["total_pollen"] = max(pollen_values)
        
        return normalized
