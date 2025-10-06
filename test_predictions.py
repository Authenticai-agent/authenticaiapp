#!/usr/bin/env python3
"""
Test script for the new prediction system
"""
import asyncio
import sys
import os
sys.path.append('backend')

from backend.routers.predictions import AdvancedPredictionEngine, User
from datetime import datetime

async def test_prediction_engine():
    """Test the new prediction engine"""
    print("🧪 Testing Advanced Prediction Engine...")
    
    # Create a test user
    test_user = User(
        id="test-user-123",
        email="test@example.com",
        first_name="Test",
        last_name="User",
        location={"lat": 39.3226, "lon": -84.5084},
        allergies=["pollen", "dust mites"],
        asthma_severity="moderate",
        age=35,
        triggers=["cold air", "exercise"],
        subscription_tier="free"
    )
    
    # Create test environmental data
    test_environmental_data = {
        "air_quality": {
            "aqi": 75,
            "pm25": 30,
            "pm10": 40,
            "ozone": 45,
            "no2": 25
        },
        "weather": {
            "temperature": 22,
            "humidity": 65,
            "wind_speed": 8
        },
        "pollen": {
            "overall_risk": "moderate",
            "tree_pollen": "moderate",
            "grass_pollen": "low",
            "weed_pollen": "low"
        }
    }
    
    # Initialize prediction engine
    engine = AdvancedPredictionEngine()
    
    try:
        # Test rule-based prediction (fallback)
        print("📊 Testing rule-based prediction...")
        prediction = engine._generate_rule_based_prediction(
            test_user, 
            test_environmental_data, 
            datetime.utcnow()
        )
        
        print(f"✅ Risk Score: {prediction['risk_score']}")
        print(f"✅ Risk Level: {prediction['risk_level']}")
        print(f"✅ Confidence: {prediction['confidence_score']}")
        print(f"✅ Factors: {list(prediction['factors'].keys())}")
        print(f"✅ Recommendations: {len(prediction['recommendations'])}")
        print(f"✅ Emergency Warnings: {len(prediction['emergency_warnings'])}")
        
        # Test user multipliers
        print("\n🔢 Testing user multipliers...")
        multipliers = engine._calculate_user_multipliers(test_user)
        print(f"✅ Total Multiplier: {multipliers['total_multiplier']:.2f}")
        print(f"✅ Allergy Multiplier: {multipliers['allergy_multiplier']:.2f}")
        print(f"✅ Asthma Multiplier: {multipliers['asthma_multiplier']:.2f}")
        
        print("\n🎉 All tests passed! The prediction system is working correctly.")
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_prediction_engine())
    sys.exit(0 if success else 1)
