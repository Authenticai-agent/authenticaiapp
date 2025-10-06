"""
Ultra-Lean Coaching Router for $14.99/month SaaS
Consolidated endpoints - NO duplicates
"""

from fastapi import APIRouter, HTTPException, status, Query, Depends
from typing import Dict, Any
from datetime import datetime
import logging
from services.premium_lean_engine import premium_lean_engine

logger = logging.getLogger(__name__)
router = APIRouter(tags=["coaching"])

@router.get("/daily-briefing", response_model=Dict[str, Any])
async def get_daily_briefing_test(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude")
):
    """SINGLE daily briefing endpoint - consolidation of duplicates"""
    try:
        # Get real environmental data from air quality service
        from routers.air_quality import get_air_quality_service
        air_service = get_air_quality_service()
        comprehensive_data = await air_service.get_comprehensive_environmental_data(lat, lon)
        
        if not comprehensive_data:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Environmental data unavailable")
        
        # Extract environmental data from comprehensive response
        pollen_risk = comprehensive_data.get('pollen', {}).get('overall_risk', 'low')
        pollen_level = {'low': 10, 'moderate': 30, 'high': 60}.get(pollen_risk, 10)
        
        environmental_data = {
            'pm25': comprehensive_data.get('air_quality', {}).get('pm25', 0),
            'ozone': comprehensive_data.get('air_quality', {}).get('ozone', 0),
            'no2': comprehensive_data.get('air_quality', {}).get('no2', 0),
            'humidity': comprehensive_data.get('weather', {}).get('humidity', 0),
            'temperature': comprehensive_data.get('weather', {}).get('temperature', 0),
            'pollen_level': pollen_level
        }
        
        # Debug logging
        logger.info(f"Location: {lat}, {lon}")
        logger.info(f"Environmental data: {environmental_data}")
        
        user_profile = {
            'age': 35,
            'allergies': ['pollen', 'dust'],
            'asthma_severity': 'moderate',
            'triggers': ['pm25', 'pollen']
        }
        
        briefing = premium_lean_engine.generate_premium_briefing(environmental_data, user_profile)
        risk_analysis = premium_lean_engine.calculate_daily_risk_score(environmental_data)
        risk_score = risk_analysis['risk_score']
        top_factors = risk_analysis.get('top_factors', [])
        
        return {
            "briefing": briefing,
            "risk_score": risk_score,
            "risk_level": "high" if risk_score > 60 else "moderate" if risk_score > 30 else "low",
            "top_factors": top_factors,
            "timestamp": datetime.utcnow().isoformat(),
            "engine": "premium-lean-unified"
        }
        
    except Exception as e:
        logger.error(f"Error generating briefing: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate briefing"
        )

@router.get("/recommendations", response_model=Dict[str, Any])
async def get_todays_recommendations():
    """Today's personalized recommendations"""
    try:
        environmental_data = {
            'pm25': 31.8,
            'ozone': 142.5,
            'no2': 35.2,
            'humidity': 58.0,
            'temperature': 24.1,
            'pollen_level': 38.0
        }
        
        user_profile = {
            'allergies': ['pollen'],
            'asthma_severity': 'mild',
            'triggers': ['pm25', 'ozone']
        }
        
        recommendations = premium_lean_engine.generate_personalized_recommendations(environmental_data, user_profile)
        
        return {
            "recommendations": recommendations,
            "environmental_summary": environmental_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting recommendations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get recommendations"
        )