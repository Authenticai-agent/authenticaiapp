#!/usr/bin/env python3
"""
Simple test script to verify OpenAI and Gemini API keys are working
"""
import os
import asyncio
from dotenv import load_dotenv
import sys
sys.path.append('backend')

from backend.services.llm_service import LLMService

# Load environment variables
load_dotenv()

async def test_llm_services():
    """Test both OpenAI and Gemini API services"""
    print("🔍 Testing LLM Services...")
    print("=" * 50)
    
    # Initialize LLM service
    llm_service = LLMService()
    
    # Check API key configuration
    openai_key = os.getenv("OPENAI_API_KEY")
    google_key = os.getenv("GOOGLE_API_KEY")
    
    print(f"📋 Configuration Check:")
    print(f"   OpenAI API Key: {'✅ Present' if openai_key else '❌ Missing'}")
    print(f"   Google API Key: {'✅ Present' if google_key else '❌ Missing'}")
    print()
    
    # Test user context
    test_user_context = {
        "name": "Test User",
        "allergies": ["pollen", "dust"],
        "asthma_severity": "mild",
        "triggers": ["smoke", "cold air"],
        "age": "adult",
        "location": "New York"
    }
    
    # Test voice query processing
    print("🎤 Testing Voice Query Processing...")
    try:
        response = await llm_service.process_voice_query(
            query="What's the air quality like today?",
            user_context=test_user_context
        )
        print(f"   ✅ Voice Query Response: {response['response_text'][:100]}...")
        print(f"   📊 Model Used: {response.get('additional_data', {}).get('model_used', 'unknown')}")
    except Exception as e:
        print(f"   ❌ Voice Query Error: {e}")
    
    print()
    
    # Test daily briefing generation
    print("📰 Testing Daily Briefing Generation...")
    try:
        risk_prediction = {
            "risk_score": 65,
            "risk_level": "moderate",
            "factors": {"pollen": 0.7, "air_quality": 0.5},
            "recommendations": ["Use air purifier", "Take preventive medication"]
        }
        
        briefing = await llm_service.generate_daily_briefing(
            risk_prediction=risk_prediction,
            user_context=test_user_context
        )
        print(f"   ✅ Daily Briefing: {briefing[:100]}...")
    except Exception as e:
        print(f"   ❌ Daily Briefing Error: {e}")
    
    print()
    
    # Test education snippet generation
    print("📚 Testing Education Snippet Generation...")
    try:
        education = await llm_service.generate_education_snippet(
            topic="pollen and seasonal allergies",
            user_context=test_user_context
        )
        print(f"   ✅ Education Snippet: {education[:100]}...")
    except Exception as e:
        print(f"   ❌ Education Snippet Error: {e}")
    
    print()
    print("🏁 LLM Service Test Complete!")

if __name__ == "__main__":
    asyncio.run(test_llm_services())
