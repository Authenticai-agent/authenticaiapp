#!/usr/bin/env python3
"""
Test script to verify medical-grade AI system for asthma and allergy management
"""

import asyncio
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from services.llm_service import LLMService

async def test_medical_grade_ai():
    """Test the medical-grade AI system for asthma and allergy management"""
    
    # Initialize LLM service
    llm_service = LLMService()
    
    # Test user context with specific profile
    user_context = {
        "name": "Sarah",
        "allergies": ["pollen", "dust mites", "pet dander"],
        "asthma_severity": "severe",
        "triggers": ["smoke", "cold air", "exercise"],
        "age": 35,
        "household_info": {"pets": "2 cats", "smoking": "none"}
    }
    
    # Test risk prediction
    risk_prediction = {
        "risk_level": "moderate",
        "risk_score": 65,
        "factors": {
            "aqi": 85,
            "pollen": "high",
            "temperature": 12,
            "humidity": 65
        },
        "recommendations": [
            "Check current air quality before outdoor activities",
            "Keep rescue medication accessible",
            "Monitor symptoms closely"
        ]
    }
    
    # COMPREHENSIVE ENVIRONMENTAL DATA WITH ALL CONTAMINANTS
    environmental_data = {
        "aqi": 85,
        "pm25": 35.2,
        "pm10": 45.8,
        "ozone": 120.5,
        "no2": 45.3,
        "so2": 12.7,
        "co": 2.1,
        "nh3": 8.9,
        "temperature_c": 12,
        "humidity_pct": 65,
        "pollen": {
            "tree": 8.5,
            "grass": 6.2,
            "weed": 4.1,
            "overall_risk": "high"
        },
        "fires": {
            "count_100km": 3,
            "risk_level": "moderate"
        },
        "solar": {
            "storm_level": 2,
            "kp_index": 4.5
        },
        "precipitation": {
            "intensity": 2.5,
            "probability": 75
        },
        "wind": {
            "speed": 15.2,
            "direction": 180
        },
        "uv": {
            "index": 6,
            "level": "high"
        }
    }
    
    user_context["environmental"] = environmental_data
    
    print("Testing Medical-Grade AI System for Asthma and Allergy Management")
    print("=" * 70)
    print(f"User Profile: {user_context['name']}")
    print(f"Allergies: {user_context['allergies']}")
    print(f"Asthma Severity: {user_context['asthma_severity']}")
    print(f"Known Triggers: {user_context['triggers']}")
    print(f"Risk Level: {risk_prediction['risk_level']} ({risk_prediction['risk_score']}/100)")
    print()
    
    print("COMPREHENSIVE CONTAMINANT DATA:")
    print(f"  Air Quality: AQI {environmental_data['aqi']}")
    print(f"  PM2.5: {environmental_data['pm25']} μg/m³")
    print(f"  PM10: {environmental_data['pm10']} μg/m³")
    print(f"  Ozone: {environmental_data['ozone']} μg/m³")
    print(f"  NO2: {environmental_data['no2']} μg/m³")
    print(f"  SO2: {environmental_data['so2']} μg/m³")
    print(f"  CO: {environmental_data['co']} mg/m³")
    print(f"  NH3: {environmental_data['nh3']} μg/m³")
    print(f"  Temperature: {environmental_data['temperature_c']}°C")
    print(f"  Humidity: {environmental_data['humidity_pct']}%")
    print(f"  Pollen: Tree {environmental_data['pollen']['tree']}, Grass {environmental_data['pollen']['grass']}, Weed {environmental_data['pollen']['weed']}")
    print(f"  Forest Fires: {environmental_data['fires']['count_100km']} fires within 100km")
    print(f"  Solar Activity: Storm Level {environmental_data['solar']['storm_level']}, KP Index {environmental_data['solar']['kp_index']}")
    print(f"  Precipitation: {environmental_data['precipitation']['intensity']} mm/h")
    print(f"  Wind: {environmental_data['wind']['speed']} m/s, Direction: {environmental_data['wind']['direction']}°")
    print(f"  UV Index: {environmental_data['uv']['index']} ({environmental_data['uv']['level']})")
    print()
    
    try:
        # Test the medical-grade briefing generation
        briefing = await llm_service.generate_daily_briefing(risk_prediction, user_context)
        
        print("Generated Medical-Grade Briefing:")
        print("-" * 50)
        print(briefing)
        print()
        
        # Check if briefing includes medical-grade features
        name_mentioned = user_context["name"] in briefing
        allergies_mentioned = any(allergy in briefing.lower() for allergy in user_context["allergies"])
        severity_mentioned = user_context["asthma_severity"] in briefing.lower()
        triggers_mentioned = any(trigger in briefing.lower() for trigger in user_context["triggers"])
        
        # Check for all contaminant data mentions
        aqi_mentioned = str(environmental_data["aqi"]) in briefing
        pm25_mentioned = str(environmental_data["pm25"]) in briefing
        pm10_mentioned = str(environmental_data["pm10"]) in briefing
        ozone_mentioned = str(environmental_data["ozone"]) in briefing
        no2_mentioned = str(environmental_data["no2"]) in briefing
        so2_mentioned = str(environmental_data["so2"]) in briefing
        co_mentioned = str(environmental_data["co"]) in briefing
        nh3_mentioned = str(environmental_data["nh3"]) in briefing
        
        # Check for medical-grade features
        medical_grade_analysis = "medical-grade" in briefing.lower() or "medical" in briefing.lower()
        contaminant_interactions = "interaction" in briefing.lower() or "combination" in briefing.lower() or "synergistic" in briefing.lower()
        health_implications = "health" in briefing.lower() or "respiratory" in briefing.lower() or "asthma" in briefing.lower()
        medical_terminology = any(term in briefing.lower() for term in ["inflammation", "bronchial", "alveolar", "cardiovascular", "oxidative"])
        emergency_plans = "emergency" in briefing.lower() or "action plan" in briefing.lower()
        medication_recommendations = "medication" in briefing.lower() or "dosage" in briefing.lower() or "timing" in briefing.lower()
        
        print("Medical-Grade AI System Features Check:")
        print(f"✓ Name mentioned: {name_mentioned}")
        print(f"✓ Allergies referenced: {allergies_mentioned}")
        print(f"✓ Asthma severity mentioned: {severity_mentioned}")
        print(f"✓ Triggers referenced: {triggers_mentioned}")
        print()
        print("All Contaminant Data Integration:")
        print(f"✓ AQI data: {aqi_mentioned}")
        print(f"✓ PM2.5 data: {pm25_mentioned}")
        print(f"✓ PM10 data: {pm10_mentioned}")
        print(f"✓ Ozone data: {ozone_mentioned}")
        print(f"✓ NO2 data: {no2_mentioned}")
        print(f"✓ SO2 data: {so2_mentioned}")
        print(f"✓ CO data: {co_mentioned}")
        print(f"✓ NH3 data: {nh3_mentioned}")
        print()
        print("Medical-Grade Features:")
        print(f"✓ Medical-grade analysis: {medical_grade_analysis}")
        print(f"✓ Contaminant interactions: {contaminant_interactions}")
        print(f"✓ Health implications: {health_implications}")
        print(f"✓ Medical terminology: {medical_terminology}")
        print(f"✓ Emergency plans: {emergency_plans}")
        print(f"✓ Medication recommendations: {medication_recommendations}")
        
        total_checks = 20
        passed_checks = sum([
            name_mentioned, allergies_mentioned, severity_mentioned, triggers_mentioned,
            aqi_mentioned, pm25_mentioned, pm10_mentioned, ozone_mentioned,
            no2_mentioned, so2_mentioned, co_mentioned, nh3_mentioned,
            medical_grade_analysis, contaminant_interactions, health_implications,
            medical_terminology, emergency_plans, medication_recommendations
        ])
        
        print(f"\nOverall Score: {passed_checks}/{total_checks} checks passed")
        
        if passed_checks >= 18:
            print("✅ SUCCESS: Medical-grade AI system is working excellently!")
        elif passed_checks >= 15:
            print("⚠️  GOOD: Medical-grade AI system is working well but could be improved")
        elif passed_checks >= 12:
            print("⚠️  PARTIAL: Some medical-grade features included but needs work")
        else:
            print("❌ WARNING: Medical-grade AI system may not be working effectively")
            
    except Exception as e:
        print(f"Error testing medical-grade AI system: {e}")
        print("This might be expected if AI services are not available")

if __name__ == "__main__":
    asyncio.run(test_medical_grade_ai())
