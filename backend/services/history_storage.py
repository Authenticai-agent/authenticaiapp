"""
History Storage Service for Predictions and Recommendations
Stores 3-day history for user to review past predictions and recommendations
"""

from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import logging
import json
from dataclasses import dataclass, asdict

logger = logging.getLogger(__name__)

@dataclass
class PredictionHistory:
    """Historical prediction data structure"""
    id: str
    user_id: str
    timestamp: datetime
    location: Dict[str, float]  # lat, lon
    location_name: str
    risk_score: float
    risk_level: str
    top_factors: List[str]
    prediction_horizon: str  # "6h", "12h", "1d", "2d", "3d"
    environmental_data: Dict[str, Any]
    user_profile: Dict[str, Any]
    confidence: float
    actual_vs_predicted: Optional[Dict[str, Any]] = None  # Fill later for accuracy tracking

@dataclass
class RecommendationHistory:
    """Historical recommendation data structure"""
    id: str
    user_id: str
    timestamp: datetime
    location: Dict[str, float]
    location_name: str
    risk_score: float
    risk_context: str
    recommendations: List[Dict[str, Any]]
    quantified_benefits: Dict[str, str]
    environmental_trigger: str
    user_action_taken: Optional[Dict[str, Any]] = None
    effectiveness_score: Optional[float] = None

class HistoryStorageEngine:
    """
    Manages storage and retrieval of prediction and recommendation history
    Maintains 3-day rolling window for user review
    """
    
    def __init__(self):
        # In-memory storage (in production, this would be database)
        self.prediction_history: Dict[str, List[PredictionHistory]] = {}
        self.recommendation_history: Dict[str, List[RecommendationHistory]] = {}
        self.location_history: Dict[str, List[Dict[str, Any]]] = {}
        
    def store_prediction(self, prediction_data: Dict[str, Any]) -> str:
        """Store prediction data for user review"""
        try:
            user_id = prediction_data.get('user_id', 'default_user')
            prediction_id = f"pred_{user_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
            
            prediction_rec = PredictionHistory(
                id=prediction_id,
                user_id=user_id,
                timestamp=datetime.utcnow(),
                location=prediction_data.get('location', {}),
                location_name=prediction_data.get('location_name', 'Unknown Location'),
                risk_score=prediction_data.get('risk_score', 0),
                risk_level=prediction_data.get('risk_level', 'unknown'),
                top_factors=prediction_data.get('top_factors', []),
                prediction_horizon=prediction_data.get('prediction_horizon', '1d'),
                environmental_data=prediction_data.get('environmental_data', {}),
                user_profile=prediction_data.get('user_profile', {}),
                confidence=prediction_data.get('confidence', 0.85)
            )
            
            # Store prediction
            if user_id not in self.prediction_history:
                self.prediction_history[user_id] = []
            
            self.prediction_history[user_id].append(prediction_rec)
            
            # Maintain only last 3 days of history
            cutoff_date = datetime.utcnow() - timedelta(days=3)
            self.prediction_history[user_id] = [
                pred for pred in self.prediction_history[user_id]
                if pred.timestamp > cutoff_date
            ]
            
            logger.info(f"Stored prediction {prediction_id} for user {user_id}")
            return prediction_id
            
        except Exception as e:
            logger.error(f"Failed to store prediction: {e}")
            return f"error_{datetime.utcnow().timestamp()}"
    
    def store_recommendation(self, recommendation_data: Dict[str, Any]) -> str:
        """Store recommendation data for user review"""
        try:
            user_id = recommendation_data.get('user_id', 'default_user')
            recommendation_id = f"rec_{user_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
            
            recommendation_rec = RecommendationHistory(
                id=recommendation_id,
                user_id=user_id,
                timestamp=datetime.utcnow(),
                location=recommendation_data.get('location', {}),
                location_name=recommendation_data.get('location_name', 'Unknown Location'),
                risk_score=recommendation_data.get('risk_score', 0),
                risk_context=recommendation_data.get('risk_context', ''),
                recommendations=recommendation_data.get('recommendations', []),
                quantified_benefits=recommendation_data.get('quantified_benefits', {}),
                environmental_trigger=recommendation_data.get('environmental_trigger', 'unknown')
            )
            
            # Store recommendation
            if user_id not in self.recommendation_history:
                self.recommendation_history[user_id] = []
            
            self.recommendation_history[user_id].append(recommendation_rec)
            
            # Maintain only last 3 days of history
            cutoff_date = datetime.utcnow() - timedelta(days=3)
            self.recommendation_history[user_id] = [
                rec for rec in self.recommendation_history[user_id]
                if rec.timestamp > cutoff_date
            ]
            
            logger.info(f"Stored recommendation {recommendation_id} for user {user_id}")
            return recommendation_id
            
        except Exception as e:
            logger.error(f"Failed to store recommendation: {e}")
            return f"error_{datetime.utcnow().timestamp()}"
    
    def store_location_change(self, user_id: str, location_data: Dict[str, Any]) -> None:
        """Store location change for travel tracking"""
        try:
            if user_id not in self.location_history:
                self.location_history[user_id] = []
            
            location_entry = {
                'timestamp': datetime.utcnow(),
                'location': location_data.get('location', {}),
                'location_name': location_data.get('location_name', ''),
                'distance_from_previous': location_data.get('distance_km', 0),
                'environmental_profile': location_data.get('environmental_profile', {}),
                'risk_adaptation': location_data.get('risk_adaptation', {})
            }
            
            self.location_history[user_id].append(location_entry)
            
            # Keep only last 20 location changes
            self.location_history[user_id] = self.location_history[user_id][-20:]
            
        except Exception as e:
            logger.error(f"Failed to store location change: {e}")
    
    def get_prediction_history(self, user_id: str, days: int = 3) -> List[Dict[str, Any]]:
        """Get prediction history for user review"""
        if user_id not in self.prediction_history:
            return []
        
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        recent_predictions = [
            pred for pred in self.prediction_history[user_id]
            if pred.timestamp > cutoff_date
        ]
        
        # Convert to dict format for API response
        return [self._prediction_to_dict(pred) for pred in recent_predictions]
    
    def get_recommendation_history(self, user_id: str, days: int = 3) -> List[Dict[str, Any]]:
        """Get recommendation history for user review"""
        if user_id not in self.recommendation_history:
            return []
        
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        recent_recommendations = [
            rec for rec in self.recommendation_history[user_id]
            if rec.timestamp > cutoff_date
        ]
        
        # Convert to dict format for API response
        return [self._recommendation_to_dict(rec) for rec in recent_recommendations]
    
    def get_location_history(self, user_id: str) -> List[Dict[str, Any]]:
        """Get location change history"""
        if user_id not in self.location_history:
            return []
        
        return [
            {
                'timestamp': entry['timestamp'].isoformat(),
                'location': entry['location'],
                'location_name': entry['location_name'],
                'distance_km': entry['distance_from_previous'],
                'environmental_profile': entry['environmental_profile']
            }
            for entry in self.location_history[user_id]
        ]
    
    def get_history_summary(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive history summary for user dashboard"""
        predictions = self.get_prediction_history(user_id)
        recommendations = self.get_recommendation_history(user_id)
        locations = self.get_location_history(user_id)
        
        # Calculate accuracy metrics (would be enhanced with real tracking)
        avg_prediction_accuracy = sum(p.get('confidence', 0.8) for p in predictions) / len(predictions) if predictions else 0
        avg_risk_accuracy = sum(p.get('risk_score', 50) for p in predictions) / len(predictions) if predictions else 50
        
        return {
            'user_id': user_id,
            'history_summary': {
                'total_predictions': len(predictions),
                'total_recommendations': len(recommendations),
                'location_changes': len(locations),
                'avg_prediction_accuracy': round(avg_prediction_accuracy * 100, 1),
                'avg_risk_assessment': round(avg_risk_accuracy, 1),
                'most_common_risk_factor': self._get_most_common_risk_factor(predictions),
                'most_effective_recommendation': self._get_most_effective_recommendation(recommendations)
            },
            'recent_predictions': predictions[-5:],  # Last 5 predictions
            'recent_recommendations': recommendations[-5:],  # Last 5 recommendations
            'location_timeline': locations[-10:],  # Last 10 location changes
            'timestamp': datetime.utcnow().isoformat(),
            'context': 'historical_data_summary'
        }
    
    def _prediction_to_dict(self, prediction: PredictionHistory) -> Dict[str, Any]:
        """Convert PredictionHistory to dict"""
        return {
            'id': prediction.id,
            'timestamp': prediction.timestamp.isoformat(),
            'location': prediction.location,
            'location_name': prediction.location_name,
            'risk_score': prediction.risk_score,
            'risk_level': prediction.risk_level,
            'top_factors': prediction.top_factors,
            'prediction_horizon': prediction.prediction_horizon,
            'confidence': prediction.confidence,
            'environmental_summary': {
                'pm25': prediction.environmental_data.get('pm25', 0),
                'ozone': prediction.environmental_data.get('ozone', 0),
                'temperature': prediction.environmental_data.get('temperature', 0),
                'humidity': prediction.environmental_data.get('humidity', 0)
            }
        }
    
    def _recommendation_to_dict(self, recommendation: RecommendationHistory) -> Dict[str, Any]:
        """Convert RecommendationHistory to dict"""
        return {
            'id': recommendation.id,
            'timestamp': recommendation.timestamp.isoformat(),
            'location': recommendation.location,
            'location_name': recommendation.location_name,
            'risk_score': recommendation.risk_score,
            'risk_context': recommendation.risk_context,
            'recommendations': recommendation.recommendations,
            'quantified_benefits': recommendation.quantified_benefits,
            'environmental_trigger': recommendation.environmental_trigger
        }
    
    def _get_most_common_risk_factor(self, predictions: List[Dict[str, Any]]) -> str:
        """Find most common risk factor across predictions"""
        if not predictions:
            return "No data"
        
        factor_counts = {}
        for pred in predictions:
            for factor in pred.get('top_factors', []):
                factor_counts[factor] = factor_counts.get(factor, 0) + 1
        
        return max(factor_counts.items(), key=lambda x: x[1])[0] if factor_counts else "Unknown"
    
    def _get_most_effective_recommendation(self, recommendations: List[Dict[str, Any]]) -> str:
        """Find most provided recommendation type"""
        if not recommendations:
            return "No data"
        
        rec_counts = {}
        for rec in recommendations:
            for recommendation in rec.get('recommendations', []):
                rec_type = recommendation.get('type', 'unknown')
                rec_counts[rec_type] = rec_counts.get(rec_type, 0) + 1
        
        return max(rec_counts.items(), key=lambda x: x[1])[0] if rec_counts else "Unknown"

# Global history storage instance
history_storage = HistoryStorageEngine()
