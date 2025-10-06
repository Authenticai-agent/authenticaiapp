#!/usr/bin/env python3
"""
Test script to verify real-time API data flow to briefing
"""

import asyncio
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from services.llm_service import LLMService
from routers.air_quality import get_air_quality_service

async def test_api_data_flow():
    """Test the API data flow to ensure real-time data reaches the briefing"""
    
    # Initialize services
    llm_service = LLMService()
    air_quality_service = get_air_quality_service()
    
    # Test location (NYC)
    lat, lon = 40.7128, -74.0060
    
    print("Testing API Data Flow to Briefing")
    print("=" * 50)
    print(f"Location: {lat}, {lon}")
    print()
    
    try:
        # Test 1: Get air quality data directly
        print("1. Testing OpenWeather Air Quality API...")
        air_quality_data = await air_quality_service.get_openweather_data(lat, lon)
        
        if air_quality_data:
            print("✅ Air quality data retrieved successfully")
            if "list" in air_quality_data and air_quality_data["list"]:
                components = air_quality_data["list"][0].get("components", {})
                main = air_quality_data["list"][0].get("main", {})
                print(f"   AQI: {main.get('aqi')}")
                print(f"   PM2.5: {components.get('pm2_5')} μg/m³")
                print(f"   PM10: {components.get('pm10')} μg/m³")
                print(f"   Ozone: {components.get('o3')} μg/m³")
                print(f"   NO2: {components.get('no2')} μg/m³")
                print(f"   SO2: {components.get('so2')} μg/m³")
                print(f"   CO: {components.get('co')} mg/m³")
                print(f"   NH3: {components.get('nh3')} μg/m³")
            else:
                print("❌ No air quality data in response")
        else:
            print("❌ Failed to retrieve air quality data")
        
        print()
        
        # Test 2: Get comprehensive environmental data
        print("2. Testing Comprehensive Environmental Data...")
        env_data = await air_quality_service.get_comprehensive_environmental_data(lat, lon)
        
        if env_data:
            print("✅ Environmental data retrieved successfully")
            print(f"   Weather data: {'Yes' if env_data.get('weather') else 'No'}")
            print(f"   UV data: {'Yes' if env_data.get('uv') else 'No'}")
            print(f"   Solar data: {'Yes' if env_data.get('solar') else 'No'}")
            print(f"   Fire data: {'Yes' if env_data.get('fires') else 'No'}")
            print(f"   Pollen data: {'Yes' if env_data.get('pollen') else 'No'}")
            print(f"   Precipitation data: {'Yes' if env_data.get('precipitation') else 'No'}")
        else:
            print("❌ Failed to retrieve environmental data")
        
        print()
        
        # Test 3: Simulate the data processing that happens in coaching router
        print("3. Testing Data Processing (as in coaching router)...")
        
        # Extract air quality data from OpenWeather response
        if air_quality_data and "list" in air_quality_data and air_quality_data["list"]:
            air_components = air_quality_data["list"][0].get("components", {})
            air_main = air_quality_data["list"][0].get("main", {})
            air = {
                "aqi": air_main.get("aqi"),
                "pm25": air_components.get("pm2_5"),
                "pm10": air_components.get("pm10"),
                "ozone": air_components.get("o3"),
                "no2": air_components.get("no2"),
                "so2": air_components.get("so2"),
                "co": air_components.get("co"),
                "nh3": air_components.get("nh3")
            }
        else:
            air = {}
        
        # Extract environmental data
        weather = env_data.get("weather", {}) if env_data else {}
        pollen = env_data.get("pollen", {}) if env_data else {}
        fires = env_data.get("forest_fires", {}) if env_data else {}
        solar = env_data.get("solar_magnetic", env_data.get("solar", {})) if env_data else {}
        precipitation = env_data.get("precipitation", {}) if env_data else {}
        wind = env_data.get("wind", {}) if env_data else {}
        uv = env_data.get("uv", {}) if env_data else {}
        
        # Create environmental snapshot
        environmental_snapshot = {
            "aqi": air.get("aqi"),
            "pm25": air.get("pm25"),
            "pm10": air.get("pm10"),
            "ozone": air.get("ozone"),
            "no2": air.get("no2"),
            "so2": air.get("so2"),
            "co": air.get("co"),
            "nh3": air.get("nh3"),
            "temperature_c": weather.get("main", {}).get("temp") if weather else None,
            "humidity_pct": weather.get("main", {}).get("humidity") if weather else None,
            "pollen": {
                "tree": pollen.get("tree"),
                "grass": pollen.get("grass"),
                "weed": pollen.get("weed"),
                "overall_risk": pollen.get("overall_risk"),
            },
            "fires": {
                "count_100km": fires.get("fires_within_100km"),
                "risk_level": fires.get("fire_risk_level"),
            },
            "solar": {
                "storm_level": solar.get("storm_level"),
                "kp_index": solar.get("kp_index"),
            },
            "precipitation": {
                "intensity": precipitation.get("intensity"),
                "probability": precipitation.get("probability"),
            },
            "wind": {
                "speed": wind.get("speed"),
                "direction": wind.get("direction"),
            },
            "uv": {
                "index": uv.get("value") if uv else None,
                "level": uv.get("level"),
            },
        }
        
        print("✅ Environmental snapshot created successfully")
        print(f"   AQI: {environmental_snapshot['aqi']}")
        print(f"   PM2.5: {environmental_snapshot['pm25']} μg/m³")
        print(f"   PM10: {environmental_snapshot['pm10']} μg/m³")
        print(f"   Ozone: {environmental_snapshot['ozone']} μg/m³")
        print(f"   NO2: {environmental_snapshot['no2']} μg/m³")
        print(f"   SO2: {environmental_snapshot['so2']} μg/m³")
        print(f"   CO: {environmental_snapshot['co']} mg/m³")
        print(f"   NH3: {environmental_snapshot['nh3']} μg/m³")
        print(f"   Temperature: {environmental_snapshot['temperature_c']}°C")
        print(f"   Humidity: {environmental_snapshot['humidity_pct']}%")
        
        print()
        
        # Test 4: Generate briefing with real data
        print("4. Testing Briefing Generation with Real Data...")
        
        user_context = {
            "name": "Sarah",
            "allergies": ["pollen", "dust mites"],
            "asthma_severity": "severe",
            "triggers": ["smoke", "cold air"],
            "environmental": environmental_snapshot,
        }
        
        risk_prediction = {
            "risk_level": "moderate",
            "risk_score": 65,
            "factors": {
                "aqi": environmental_snapshot['aqi'] or 50,
                "pollen": "high",
                "temperature": environmental_snapshot['temperature_c'] or 20,
                "humidity": environmental_snapshot['humidity_pct'] or 50
            },
            "recommendations": [
                "Check current air quality before outdoor activities",
                "Keep rescue medication accessible",
                "Monitor symptoms closely"
            ]
        }
        
        briefing = await llm_service.generate_daily_briefing(risk_prediction, user_context)
        
        print("✅ Briefing generated successfully")
        print()
        print("Generated Briefing:")
        print("-" * 30)
        print(briefing)
        print()
        
        # Check if briefing contains real data
        has_real_data = any([
            str(environmental_snapshot['aqi']) in briefing if environmental_snapshot['aqi'] else False,
            str(environmental_snapshot['pm25']) in briefing if environmental_snapshot['pm25'] else False,
            str(environmental_snapshot['pm10']) in briefing if environmental_snapshot['pm10'] else False,
            str(environmental_snapshot['ozone']) in briefing if environmental_snapshot['ozone'] else False,
            str(environmental_snapshot['no2']) in briefing if environmental_snapshot['no2'] else False,
            str(environmental_snapshot['so2']) in briefing if environmental_snapshot['so2'] else False,
            str(environmental_snapshot['co']) in briefing if environmental_snapshot['co'] else False,
            str(environmental_snapshot['nh3']) in briefing if environmental_snapshot['nh3'] else False,
        ])
        
        if has_real_data:
            print("✅ SUCCESS: Briefing contains real API data!")
        else:
            print("❌ WARNING: Briefing may not contain real API data")
            
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_api_data_flow())
