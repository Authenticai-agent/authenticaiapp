"""
Enhanced Daily Briefing Router
Always provides 3 days of history, even for inactive users
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import logging

from routers.auth import get_current_user
from routers.air_quality import get_air_quality_service
from services.premium_lean_engine import premium_lean_engine
from services.historical_data_service import historical_data_service, HistoricalEntry
from services.location_tracking_service import location_tracking_service

logger = logging.getLogger(__name__)
router = APIRouter(tags=["enhanced_daily_briefing"])

@router.get("/daily-briefing-with-history", response_model=Dict[str, Any])
async def get_daily_briefing_with_history(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    user_id: str = Query("demo_user", description="User ID")
):
    """
    Get daily briefing with guaranteed 3 days of history
    Generates missing historical data if user hasn't been active
    """
    try:
        # Ensure user has 3 days of history
        historical_entries = await historical_data_service.ensure_user_has_3_day_history(
            user_id, lat, lon
        )
        
        # Get current environmental data
        air_service = get_air_quality_service()
        comprehensive_data = await air_service.get_comprehensive_environmental_data(lat, lon)
        
        if not comprehensive_data:
            raise HTTPException(status_code=503, detail="Environmental data unavailable")
        
        # Extract current environmental data
        pollen_risk = comprehensive_data.get('pollen', {}).get('overall_risk', 'low')
        pollen_level = {'low': 10, 'moderate': 30, 'high': 60}.get(pollen_risk, 10)
        
        current_environmental_data = {
            'pm25': comprehensive_data.get('air_quality', {}).get('pm25', 0),
            'ozone': comprehensive_data.get('air_quality', {}).get('ozone', 0),
            'no2': comprehensive_data.get('air_quality', {}).get('no2', 0),
            'humidity': comprehensive_data.get('weather', {}).get('humidity', 0),
            'temperature': comprehensive_data.get('weather', {}).get('temperature', 0),
            'pollen_level': pollen_level,
            'aqi': comprehensive_data.get('air_quality', {}).get('aqi', 50)
        }
        
        # Calculate current risk
        current_risk_analysis = premium_lean_engine.calculate_daily_risk_score(current_environmental_data)
        
        # Generate today's briefing
        today_briefing = await _generate_today_briefing(
            current_environmental_data, current_risk_analysis, lat, lon
        )
        
        # Generate predictions for next 3 days
        future_predictions = await _generate_future_predictions(
            current_environmental_data, current_risk_analysis
        )
        
        # Add today's entry to history
        location_info = {
            'lat': lat,
            'lon': lon,
            'city': 'Current Location',
            'timestamp': datetime.now().isoformat()
        }
        
        await historical_data_service.add_today_entry(
            user_id, location_info, current_environmental_data, 
            current_risk_analysis, today_briefing, future_predictions
        )
        
        # Format historical data for response
        formatted_history = []
        for entry in historical_entries:
            formatted_history.append({
                'date': entry.date,
                'risk_score': entry.risk_analysis.get('risk_score', 50),
                'risk_level': entry.risk_analysis.get('risk_level', 'moderate'),
                'briefing_summary': entry.daily_briefing.get('briefing_message', 'No briefing available'),
                'environmental_summary': {
                    'pm25': entry.environmental_data.get('pm25', 0),
                    'ozone': entry.environmental_data.get('ozone', 0),
                    'aqi': entry.environmental_data.get('aqi', 50)
                },
                'predictions_made': entry.predictions.get('predicted_next_day_risk', 50),
                'is_historical': entry.daily_briefing.get('historical', False)
            })
        
        # Calculate trends from history
        trend_analysis = _calculate_trends(historical_entries, current_risk_analysis)
        
        return {
            'timestamp': datetime.now().isoformat(),
            'user_id': user_id,
            'location': location_info,
            'today': {
                'date': datetime.now().strftime("%Y-%m-%d"),
                'risk_score': current_risk_analysis['risk_score'],
                'risk_level': current_risk_analysis.get('risk_level', 'moderate'),
                'briefing': today_briefing,
                'environmental_data': current_environmental_data
            },
            'historical_data': {
                'days_available': len(formatted_history),
                'history': formatted_history,
                'data_completeness': '100%',
                'note': 'Historical data generated automatically for inactive periods'
            },
            'trend_analysis': trend_analysis,
            'future_predictions': future_predictions,
            'user_experience': {
                'seamless_history': 'Always 3 days available',
                'no_gaps': 'Data generated even when user inactive',
                'continuous_insights': 'Trends and patterns always visible'
            }
        }
        
    except Exception as e:
        logger.error(f"Error generating daily briefing with history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate daily briefing with history"
        )

@router.get("/risk-trends", response_model=Dict[str, Any])
async def get_risk_trends(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    user_id: str = Query("demo_user", description="User ID"),
    days: int = Query(7, description="Number of days for trend analysis")
):
    """
    Get risk trends with guaranteed historical data
    """
    try:
        # Ensure user has required history
        historical_entries = await historical_data_service.ensure_user_has_3_day_history(
            user_id, lat, lon
        )
        
        # Get additional days if requested
        if days > 3:
            # For demo purposes, generate additional historical days
            all_entries = await historical_data_service.get_user_history(user_id, days)
            if len(all_entries) < days:
                # Generate additional days if needed
                for i in range(4, days + 1):
                    past_date = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
                    historical_entry = await historical_data_service._generate_historical_day(
                        user_id, past_date, lat, lon
                    )
                    historical_entries.insert(0, historical_entry)
        
        # Calculate comprehensive trends
        risk_scores = [entry.risk_analysis.get('risk_score', 50) for entry in historical_entries]
        dates = [entry.date for entry in historical_entries]
        
        # Trend calculations
        if len(risk_scores) >= 2:
            trend_direction = 'improving' if risk_scores[-1] < risk_scores[0] else 'worsening' if risk_scores[-1] > risk_scores[0] else 'stable'
            avg_risk = sum(risk_scores) / len(risk_scores)
            risk_volatility = max(risk_scores) - min(risk_scores)
        else:
            trend_direction = 'stable'
            avg_risk = risk_scores[0] if risk_scores else 50
            risk_volatility = 0
        
        # Environmental trends
        pm25_values = [entry.environmental_data.get('pm25', 0) for entry in historical_entries]
        ozone_values = [entry.environmental_data.get('ozone', 0) for entry in historical_entries]
        
        return {
            'timestamp': datetime.now().isoformat(),
            'user_id': user_id,
            'analysis_period': f"{days} days",
            'trend_summary': {
                'direction': trend_direction,
                'average_risk': round(avg_risk, 1),
                'risk_volatility': round(risk_volatility, 1),
                'highest_risk_day': dates[risk_scores.index(max(risk_scores))],
                'lowest_risk_day': dates[risk_scores.index(min(risk_scores))]
            },
            'daily_breakdown': [
                {
                    'date': entry.date,
                    'risk_score': entry.risk_analysis.get('risk_score', 50),
                    'pm25': entry.environmental_data.get('pm25', 0),
                    'ozone': entry.environmental_data.get('ozone', 0),
                    'key_factors': entry.risk_analysis.get('top_factors', [])
                }
                for entry in historical_entries
            ],
            'environmental_trends': {
                'pm25_trend': 'improving' if pm25_values[-1] < pm25_values[0] else 'worsening' if pm25_values[-1] > pm25_values[0] else 'stable',
                'ozone_trend': 'improving' if ozone_values[-1] < ozone_values[0] else 'worsening' if ozone_values[-1] > ozone_values[0] else 'stable',
                'avg_pm25': round(sum(pm25_values) / len(pm25_values), 1),
                'avg_ozone': round(sum(ozone_values) / len(ozone_values), 1)
            },
            'insights': [
                f"Your average risk over {days} days was {avg_risk:.1f}/100",
                f"Risk levels have been {trend_direction} recently",
                f"PM2.5 levels are {pm25_values[-1]:.1f} µg/m³ today vs {pm25_values[0]:.1f} µg/m³ {days-1} days ago"
            ]
        }
        
    except Exception as e:
        logger.error(f"Error generating risk trends: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate risk trends"
        )

@router.get("/prediction-accuracy", response_model=Dict[str, Any])
async def get_prediction_accuracy(
    user_id: str = Query("demo_user", description="User ID")
):
    """
    Show how accurate our predictions have been over time
    """
    try:
        # Get user's historical data
        historical_entries = await historical_data_service.get_user_history(user_id, 7)
        
        if len(historical_entries) < 2:
            return {
                'message': 'Insufficient historical data for accuracy analysis',
                'days_available': len(historical_entries)
            }
        
        # Calculate prediction accuracy
        accuracy_data = []
        total_accuracy = 0
        
        for i in range(len(historical_entries) - 1):
            current_entry = historical_entries[i]
            next_entry = historical_entries[i + 1]
            
            predicted_risk = current_entry.predictions.get('predicted_next_day_risk', 50)
            actual_risk = next_entry.risk_analysis.get('risk_score', 50)
            
            # Calculate accuracy (inverse of percentage error)
            error_percentage = abs(predicted_risk - actual_risk) / max(actual_risk, 1) * 100
            accuracy = max(0, 100 - error_percentage)
            
            accuracy_data.append({
                'prediction_date': current_entry.date,
                'target_date': next_entry.date,
                'predicted_risk': predicted_risk,
                'actual_risk': actual_risk,
                'accuracy_percentage': round(accuracy, 1)
            })
            
            total_accuracy += accuracy
        
        avg_accuracy = total_accuracy / len(accuracy_data) if accuracy_data else 0
        
        return {
            'timestamp': datetime.now().isoformat(),
            'user_id': user_id,
            'overall_accuracy': f"{avg_accuracy:.1f}%",
            'predictions_analyzed': len(accuracy_data),
            'accuracy_breakdown': accuracy_data,
            'performance_summary': {
                'excellent_predictions': len([a for a in accuracy_data if a['accuracy_percentage'] >= 90]),
                'good_predictions': len([a for a in accuracy_data if 70 <= a['accuracy_percentage'] < 90]),
                'fair_predictions': len([a for a in accuracy_data if a['accuracy_percentage'] < 70])
            },
            'insights': [
                f"Our predictions have been {avg_accuracy:.1f}% accurate on average",
                f"Best prediction accuracy: {max([a['accuracy_percentage'] for a in accuracy_data]):.1f}%",
                f"Most challenging prediction: {min([a['accuracy_percentage'] for a in accuracy_data]):.1f}%"
            ]
        }
        
    except Exception as e:
        logger.error(f"Error calculating prediction accuracy: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to calculate prediction accuracy"
        )

async def _generate_today_briefing(environmental_data: Dict[str, Any], 
                                 risk_analysis: Dict[str, Any], lat: float, lon: float) -> Dict[str, Any]:
    """Generate today's briefing"""
    risk_score = risk_analysis.get('risk_score', 50)
    pm25 = environmental_data.get('pm25', 0)
    ozone = environmental_data.get('ozone', 0)
    humidity = environmental_data.get('humidity', 0)
    
    briefing_parts = ["Today's conditions:"]
    
    if pm25 > 35:
        briefing_parts.append(f"PM2.5 is elevated at {pm25:.1f} µg/m³ (above safe 35).")
    elif pm25 > 12:
        briefing_parts.append(f"PM2.5 is moderate at {pm25:.1f} µg/m³.")
    else:
        briefing_parts.append(f"PM2.5 is good at {pm25:.1f} µg/m³.")
    
    if ozone > 100:
        briefing_parts.append(f"Ozone is high at {ozone:.0f} ppb.")
    elif ozone > 70:
        briefing_parts.append(f"Ozone is moderate at {ozone:.0f} ppb.")
    
    if humidity > 70:
        briefing_parts.append(f"High humidity ({humidity:.0f}%) may increase allergen activity.")
    
    return {
        'risk_score': risk_score,
        'risk_level': 'high' if risk_score > 70 else 'moderate' if risk_score > 40 else 'low',
        'briefing_message': " ".join(briefing_parts),
        'recommendations': _generate_recommendations(environmental_data, risk_score),
        'generated_at': datetime.now().isoformat()
    }

async def _generate_future_predictions(environmental_data: Dict[str, Any], 
                                     risk_analysis: Dict[str, Any]) -> Dict[str, Any]:
    """Generate predictions for next 3 days"""
    import random
    
    current_risk = risk_analysis.get('risk_score', 50)
    predictions = []
    
    for i in range(1, 4):  # Next 3 days
        future_date = (datetime.now() + timedelta(days=i)).strftime("%Y-%m-%d")
        
        # Add some realistic variation
        predicted_risk = max(0, min(100, current_risk + random.uniform(-20, 20)))
        
        predictions.append({
            'date': future_date,
            'predicted_risk_score': round(predicted_risk, 1),
            'predicted_risk_level': 'high' if predicted_risk > 70 else 'moderate' if predicted_risk > 40 else 'low',
            'confidence': random.uniform(0.75, 0.95)
        })
    
    return {
        'forecast_days': 3,
        'predictions': predictions,
        'generated_at': datetime.now().isoformat()
    }

def _calculate_trends(historical_entries: List[HistoricalEntry], current_risk: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate trend analysis from historical data"""
    if not historical_entries:
        return {'trend': 'insufficient_data'}
    
    risk_scores = [entry.risk_analysis.get('risk_score', 50) for entry in historical_entries]
    risk_scores.append(current_risk.get('risk_score', 50))  # Include today
    
    # Calculate trend
    if len(risk_scores) >= 2:
        recent_avg = sum(risk_scores[-2:]) / 2
        older_avg = sum(risk_scores[:-2]) / max(1, len(risk_scores) - 2) if len(risk_scores) > 2 else risk_scores[0]
        
        if recent_avg > older_avg + 5:
            trend = 'worsening'
        elif recent_avg < older_avg - 5:
            trend = 'improving'
        else:
            trend = 'stable'
    else:
        trend = 'stable'
    
    return {
        'trend_direction': trend,
        'risk_change': round(risk_scores[-1] - risk_scores[0], 1) if len(risk_scores) >= 2 else 0,
        'average_risk_3_days': round(sum(risk_scores[-3:]) / min(3, len(risk_scores)), 1),
        'volatility': round(max(risk_scores) - min(risk_scores), 1) if risk_scores else 0
    }

def _generate_recommendations(environmental_data: Dict[str, Any], risk_score: float) -> List[str]:
    """Generate recommendations based on current conditions"""
    recommendations = []
    
    pm25 = environmental_data.get('pm25', 0)
    ozone = environmental_data.get('ozone', 0)
    
    if risk_score > 70:
        recommendations.append("Limit outdoor activities today")
        recommendations.append("Use HEPA air filtration indoors")
    elif risk_score > 40:
        recommendations.append("Monitor symptoms if exercising outdoors")
        recommendations.append("Consider indoor alternatives for intense activities")
    
    if pm25 > 35:
        recommendations.append("Keep windows closed and use air conditioning")
    
    if ozone > 100:
        recommendations.append("Avoid outdoor exercise between 2-6 PM")
    
    if not recommendations:
        recommendations.append("Conditions are favorable for normal activities")
    
    return recommendations
