#!/usr/bin/env python3
"""
Test script to verify personalized daily briefing functionality
"""

import asyncio
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from services.llm_service import LLMService

async def test_personalized_briefing():
    """Test the personalized briefing functionality"""
    
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
            "pollen": "high",
            "air_quality": "moderate",
            "temperature": "cold"
        },
        "recommendations": [
            "Avoid outdoor exercise",
            "Use air purifier",
            "Keep rescue inhaler handy"
        ]
    }
    
    # Test environmental data
    environmental_data = {
        "aqi": 85,
        "temperature_c": 12,
        "humidity_pct": 65,
        "pollen": {
            "tree": 8.5,
            "grass": 6.2,
            "weed": 4.1
        }
    }
    
    user_context["environmental"] = environmental_data
    
    print("Testing Personalized Daily Briefing")
    print("=" * 50)
    print(f"User Profile: {user_context['name']}")
    print(f"Allergies: {user_context['allergies']}")
    print(f"Asthma Severity: {user_context['asthma_severity']}")
    print(f"Known Triggers: {user_context['triggers']}")
    print(f"Risk Level: {risk_prediction['risk_level']} ({risk_prediction['risk_score']}/100)")
    print()
    
    try:
        # Test the briefing generation
        briefing = await llm_service.generate_daily_briefing(risk_prediction, user_context)
        
        print("Generated Briefing:")
        print("-" * 30)
        print(briefing)
        print()
        
        # Check if briefing is personalized
        name_mentioned = user_context["name"] in briefing
        allergies_mentioned = any(allergy in briefing.lower() for allergy in user_context["allergies"])
        severity_mentioned = user_context["asthma_severity"] in briefing.lower()
        triggers_mentioned = any(trigger in briefing.lower() for trigger in user_context["triggers"])
        
        print("Personalization Check:")
        print(f"✓ Name mentioned: {name_mentioned}")
        print(f"✓ Allergies referenced: {allergies_mentioned}")
        print(f"✓ Asthma severity mentioned: {severity_mentioned}")
        print(f"✓ Triggers referenced: {triggers_mentioned}")
        
        if name_mentioned and (allergies_mentioned or severity_mentioned or triggers_mentioned):
            print("\n✅ SUCCESS: Briefing is properly personalized!")
        else:
            print("\n❌ WARNING: Briefing may not be sufficiently personalized")
            
    except Exception as e:
        print(f"Error testing briefing: {e}")
        print("This might be expected if AI services are not available")

if __name__ == "__main__":
    asyncio.run(test_personalized_briefing())
