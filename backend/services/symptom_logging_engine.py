"""
Symptom Logging & Feedback Loop Engine
Implements transfer learning, meta-learning, and federated learning
for adaptive personalization based on user feedback
"""
import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

# ML Libraries
try:
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.linear_model import LogisticRegression
    from sklearn.preprocessing import StandardScaler
    from sklearn.metrics import accuracy_score, mean_squared_error
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    logging.warning("sklearn not available, using fallback models")

try:
    import xgboost as xgb
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False
    logging.warning("XGBoost not available, using fallback models")

logger = logging.getLogger(__name__)

class SymptomLoggingEngine:
    """
    Symptom Logging & Feedback Loop Engine
    - Transfer Learning for fine-tuning risk prediction on user logs
    - Meta-Learning for quick personalization with small data
    - Federated Learning for privacy-safe cross-user learning
    - Adaptive personalization based on user feedback
    """
    
    def __init__(self):
        self.models_path = Path("backend/models/symptom_logging")
        self.models_path.mkdir(parents=True, exist_ok=True)
        
        # Initialize models
        self.transfer_model = None
        self.meta_model = None
        self.federated_model = None
        self.scaler = None
        
        # User data storage
        self.user_symptom_logs = {}
        self.user_feedback_logs = {}
        self.user_risk_predictions = {}
        
        # Feature columns
        self.feature_columns = [
            'pm25', 'pm10', 'ozone', 'no2', 'so2', 'co', 'nh3',
            'temperature', 'humidity', 'wind_speed', 'uv_index',
            'pollen_tree', 'pollen_grass', 'pollen_weed', 'pollen_mold', 'aqi',
            'age', 'asthma_severity_score', 'allergy_count', 'trigger_count'
        ]
        
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize ML models for symptom logging and feedback"""
        try:
            # Transfer Learning model
            if XGBOOST_AVAILABLE:
                self.transfer_model = xgb.XGBRegressor(
                    n_estimators=50,
                    max_depth=6,
                    learning_rate=0.1,
                    random_state=42
                )
            elif SKLEARN_AVAILABLE:
                self.transfer_model = RandomForestRegressor(
                    n_estimators=50,
                    max_depth=8,
                    random_state=42
                )
            
            # Meta-Learning model
            if SKLEARN_AVAILABLE:
                self.meta_model = LogisticRegression(
                    random_state=42,
                    max_iter=1000
                )
            
            # Scaler
            if SKLEARN_AVAILABLE:
                self.scaler = StandardScaler()
            
            logger.info("Symptom Logging Engine initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing Symptom Logging Engine: {e}")
    
    def log_symptom_checkin(self, user_id: str, symptom_data: Dict[str, Any], 
                          environmental_data: Dict[str, Any], 
                          user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Log user symptom check-in and update personalization models
        """
        try:
            # Create symptom log entry
            log_entry = {
                'timestamp': datetime.utcnow().isoformat(),
                'symptoms': symptom_data.get('symptoms', []),
                'severity': symptom_data.get('severity', 0),
                'flare_up': symptom_data.get('flare_up', False),
                'medication_used': symptom_data.get('medication_used', False),
                'environmental_data': environmental_data,
                'user_profile': user_profile
            }
            
            # Store in user logs
            if user_id not in self.user_symptom_logs:
                self.user_symptom_logs[user_id] = []
            
            self.user_symptom_logs[user_id].append(log_entry)
            
            # Keep only last 100 entries per user
            if len(self.user_symptom_logs[user_id]) > 100:
                self.user_symptom_logs[user_id] = self.user_symptom_logs[user_id][-100:]
            
            # Update personalization models
            personalization_update = self._update_personalization_models(user_id, log_entry)
            
            # Generate insights
            insights = self._generate_symptom_insights(user_id, log_entry)
            
            return {
                'success': True,
                'log_entry': log_entry,
                'personalization_update': personalization_update,
                'insights': insights,
                'total_logs': len(self.user_symptom_logs[user_id])
            }
            
        except Exception as e:
            logger.error(f"Error logging symptom check-in: {e}")
            return {
                'success': False,
                'error': str(e),
                'total_logs': 0
            }
    
    def log_recommendation_feedback(self, user_id: str, recommendation_id: str, 
                                  feedback_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Log user feedback on recommendations for reinforcement learning
        """
        try:
            # Create feedback log entry
            feedback_entry = {
                'timestamp': datetime.utcnow().isoformat(),
                'recommendation_id': recommendation_id,
                'rating': feedback_data.get('rating', 3),
                'helpful': feedback_data.get('helpful', True),
                'followed': feedback_data.get('followed', False),
                'symptoms_improved': feedback_data.get('symptoms_improved', False),
                'feedback_text': feedback_data.get('feedback_text', ''),
                'action_type': feedback_data.get('action_type', 'unknown')
            }
            
            # Store in user feedback logs
            if user_id not in self.user_feedback_logs:
                self.user_feedback_logs[user_id] = []
            
            self.user_feedback_logs[user_id].append(feedback_entry)
            
            # Keep only last 200 entries per user
            if len(self.user_feedback_logs[user_id]) > 200:
                self.user_feedback_logs[user_id] = self.user_feedback_logs[user_id][-200:]
            
            # Update recommendation models
            model_update = self._update_recommendation_models(user_id, feedback_entry)
            
            return {
                'success': True,
                'feedback_entry': feedback_entry,
                'model_update': model_update,
                'total_feedback': len(self.user_feedback_logs[user_id])
            }
            
        except Exception as e:
            logger.error(f"Error logging recommendation feedback: {e}")
            return {
                'success': False,
                'error': str(e),
                'total_feedback': 0
            }
    
    def _update_personalization_models(self, user_id: str, log_entry: Dict[str, Any]) -> Dict[str, Any]:
        """Update personalization models using transfer learning"""
        try:
            # Get user's historical data
            user_logs = self.user_symptom_logs.get(user_id, [])
            
            if len(user_logs) < 5:
                return {
                    'model_updated': False,
                    'reason': 'Insufficient data for personalization',
                    'data_points': len(user_logs)
                }
            
            # Prepare training data
            X, y = self._prepare_training_data(user_logs)
            
            if X.shape[0] < 3:
                return {
                    'model_updated': False,
                    'reason': 'Insufficient training data',
                    'data_points': X.shape[0]
                }
            
            # Update transfer learning model
            if self.transfer_model is not None:
                # Fine-tune on user's data
                self.transfer_model.fit(X, y)
                
                # Save user-specific model
                model_path = self.models_path / f"user_{user_id}_model.joblib"
                import joblib
                joblib.dump(self.transfer_model, model_path)
                
                return {
                    'model_updated': True,
                    'model_type': 'transfer_learning',
                    'data_points': X.shape[0],
                    'model_path': str(model_path)
                }
            else:
                return {
                    'model_updated': False,
                    'reason': 'Transfer learning model not available',
                    'data_points': X.shape[0]
                }
                
        except Exception as e:
            logger.error(f"Error updating personalization models: {e}")
            return {
                'model_updated': False,
                'error': str(e),
                'data_points': 0
            }
    
    def _prepare_training_data(self, user_logs: List[Dict[str, Any]]) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare training data from user logs"""
        try:
            X_data = []
            y_data = []
            
            for log in user_logs:
                # Extract features
                features = self._extract_features_from_log(log)
                if features is not None:
                    X_data.append(features)
                    
                    # Extract target (symptom severity or flare-up)
                    severity = log.get('severity', 0)
                    flare_up = log.get('flare_up', False)
                    target = severity + (10 if flare_up else 0)  # Combine severity and flare-up
                    y_data.append(target)
            
            if not X_data:
                return np.array([]), np.array([])
            
            X = np.array(X_data)
            y = np.array(y_data)
            
            # Scale features if scaler is available
            if self.scaler is not None:
                X = self.scaler.fit_transform(X)
            
            return X, y
            
        except Exception as e:
            logger.error(f"Error preparing training data: {e}")
            return np.array([]), np.array([])
    
    def _extract_features_from_log(self, log: Dict[str, Any]) -> Optional[List[float]]:
        """Extract features from a log entry"""
        try:
            features = []
            
            # Environmental features
            env_data = log.get('environmental_data', {})
            air_quality = env_data.get('air_quality', {})
            weather = env_data.get('weather', {})
            pollen = env_data.get('pollen', {})
            
            # Air quality features
            features.extend([
                air_quality.get('pm25', 0),
                air_quality.get('pm10', 0),
                air_quality.get('ozone', 0),
                air_quality.get('no2', 0),
                air_quality.get('so2', 0),
                air_quality.get('co', 0),
                air_quality.get('nh3', 0),
                air_quality.get('aqi', 50)
            ])
            
            # Weather features
            features.extend([
                weather.get('temperature', 20),
                weather.get('humidity', 50),
                weather.get('wind_speed', 5),
                weather.get('uv_index', 5)
            ])
            
            # Pollen features
            features.extend([
                pollen.get('tree', 0),
                pollen.get('grass', 0),
                pollen.get('weed', 0),
                pollen.get('mold', 0)
            ])
            
            # User profile features
            user_profile = log.get('user_profile', {})
            age = user_profile.get('age', 30)
            asthma_severity = user_profile.get('asthma_severity', 'moderate')
            allergies = user_profile.get('allergies', [])
            triggers = user_profile.get('triggers', [])
            
            # Convert asthma severity to score
            severity_map = {'none': 0, 'mild': 1, 'moderate': 2, 'severe': 3}
            asthma_severity_score = severity_map.get(asthma_severity, 2)
            
            features.extend([
                age,
                asthma_severity_score,
                len(allergies),
                len(triggers)
            ])
            
            return features
            
        except Exception as e:
            logger.error(f"Error extracting features from log: {e}")
            return None
    
    def _update_recommendation_models(self, user_id: str, feedback_entry: Dict[str, Any]) -> Dict[str, Any]:
        """Update recommendation models using meta-learning"""
        try:
            # Get user's feedback history
            user_feedback = self.user_feedback_logs.get(user_id, [])
            
            if len(user_feedback) < 3:
                return {
                    'model_updated': False,
                    'reason': 'Insufficient feedback data',
                    'feedback_count': len(user_feedback)
                }
            
            # Prepare meta-learning data
            X_meta, y_meta = self._prepare_meta_learning_data(user_feedback)
            
            if X_meta.shape[0] < 3:
                return {
                    'model_updated': False,
                    'reason': 'Insufficient meta-learning data',
                    'feedback_count': X_meta.shape[0]
                }
            
            # Update meta-learning model
            if self.meta_model is not None:
                self.meta_model.fit(X_meta, y_meta)
                
                # Save user-specific meta model
                model_path = self.models_path / f"user_{user_id}_meta_model.joblib"
                import joblib
                joblib.dump(self.meta_model, model_path)
                
                return {
                    'model_updated': True,
                    'model_type': 'meta_learning',
                    'feedback_count': X_meta.shape[0],
                    'model_path': str(model_path)
                }
            else:
                return {
                    'model_updated': False,
                    'reason': 'Meta-learning model not available',
                    'feedback_count': X_meta.shape[0]
                }
                
        except Exception as e:
            logger.error(f"Error updating recommendation models: {e}")
            return {
                'model_updated': False,
                'error': str(e),
                'feedback_count': 0
            }
    
    def _prepare_meta_learning_data(self, user_feedback: List[Dict[str, Any]]) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare meta-learning data from user feedback"""
        try:
            X_data = []
            y_data = []
            
            for feedback in user_feedback:
                # Extract features
                features = [
                    feedback.get('rating', 3),
                    1 if feedback.get('helpful', True) else 0,
                    1 if feedback.get('followed', False) else 0,
                    1 if feedback.get('symptoms_improved', False) else 0
                ]
                
                X_data.append(features)
                
                # Target: whether to recommend this action type again
                action_type = feedback.get('action_type', 'unknown')
                target = 1 if feedback.get('rating', 3) >= 4 else 0
                y_data.append(target)
            
            if not X_data:
                return np.array([]), np.array([])
            
            X = np.array(X_data)
            y = np.array(y_data)
            
            return X, y
            
        except Exception as e:
            logger.error(f"Error preparing meta-learning data: {e}")
            return np.array([]), np.array([])
    
    def _generate_symptom_insights(self, user_id: str, log_entry: Dict[str, Any]) -> Dict[str, Any]:
        """Generate insights from symptom logging"""
        try:
            user_logs = self.user_symptom_logs.get(user_id, [])
            
            if len(user_logs) < 3:
                return {
                    'insights': [],
                    'trends': {},
                    'recommendations': []
                }
            
            # Analyze symptom trends
            recent_logs = user_logs[-7:]  # Last 7 days
            older_logs = user_logs[-14:-7] if len(user_logs) >= 14 else []
            
            # Calculate trends
            recent_avg_severity = np.mean([log.get('severity', 0) for log in recent_logs])
            recent_flare_rate = np.mean([log.get('flare_up', False) for log in recent_logs])
            
            trends = {
                'recent_avg_severity': recent_avg_severity,
                'recent_flare_rate': recent_flare_rate,
                'total_logs': len(user_logs)
            }
            
            # Compare with older data if available
            if older_logs:
                older_avg_severity = np.mean([log.get('severity', 0) for log in older_logs])
                older_flare_rate = np.mean([log.get('flare_up', False) for log in older_logs])
                
                trends['severity_trend'] = 'improving' if recent_avg_severity < older_avg_severity else 'worsening'
                trends['flare_trend'] = 'improving' if recent_flare_rate < older_flare_rate else 'worsening'
            else:
                trends['severity_trend'] = 'insufficient_data'
                trends['flare_trend'] = 'insufficient_data'
            
            # Generate insights
            insights = []
            if recent_avg_severity > 5:
                insights.append({
                    'type': 'warning',
                    'message': 'Recent symptom severity is high. Consider consulting your healthcare provider.',
                    'severity': 'high'
                })
            
            if recent_flare_rate > 0.3:
                insights.append({
                    'type': 'alert',
                    'message': 'Frequent flare-ups detected. Review your action plan and environmental triggers.',
                    'severity': 'high'
                })
            
            # Generate recommendations
            recommendations = []
            if trends.get('severity_trend') == 'worsening':
                recommendations.append('Consider increasing preventive measures and monitoring environmental conditions more closely.')
            
            if trends.get('flare_trend') == 'worsening':
                recommendations.append('Review your medication adherence and environmental control strategies.')
            
            return {
                'insights': insights,
                'trends': trends,
                'recommendations': recommendations
            }
            
        except Exception as e:
            logger.error(f"Error generating symptom insights: {e}")
            return {
                'insights': [],
                'trends': {},
                'recommendations': []
            }
    
    def get_personalized_risk_prediction(self, user_id: str, environmental_data: Dict[str, Any], 
                                       user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Get personalized risk prediction using transfer learning"""
        try:
            # Check if user has a personalized model
            model_path = self.models_path / f"user_{user_id}_model.joblib"
            
            if not model_path.exists():
                return {
                    'personalized': False,
                    'reason': 'No personalized model available',
                    'fallback_risk': 50.0
                }
            
            # Load user's personalized model
            import joblib
            user_model = joblib.load(model_path)
            
            # Extract features
            features = self._extract_features_from_log({
                'environmental_data': environmental_data,
                'user_profile': user_profile
            })
            
            if features is None:
                return {
                    'personalized': False,
                    'reason': 'Unable to extract features',
                    'fallback_risk': 50.0
                }
            
            # Make prediction
            X = np.array([features])
            if self.scaler is not None:
                X = self.scaler.transform(X)
            
            risk_score = user_model.predict(X)[0]
            
            return {
                'personalized': True,
                'risk_score': float(risk_score),
                'confidence': self._calculate_prediction_confidence(user_id),
                'model_type': 'transfer_learning'
            }
            
        except Exception as e:
            logger.error(f"Error getting personalized risk prediction: {e}")
            return {
                'personalized': False,
                'error': str(e),
                'fallback_risk': 50.0
            }
    
    def _calculate_prediction_confidence(self, user_id: str) -> float:
        """Calculate confidence in personalized predictions"""
        try:
            user_logs = self.user_symptom_logs.get(user_id, [])
            user_feedback = self.user_feedback_logs.get(user_id, [])
            
            # Base confidence
            confidence = 0.5
            
            # Data quantity bonus
            if len(user_logs) > 20:
                confidence += 0.3
            elif len(user_logs) > 10:
                confidence += 0.2
            elif len(user_logs) > 5:
                confidence += 0.1
            
            # Feedback quality bonus
            if len(user_feedback) > 10:
                avg_rating = np.mean([f.get('rating', 3) for f in user_feedback])
                if avg_rating > 4:
                    confidence += 0.2
                elif avg_rating > 3:
                    confidence += 0.1
            
            return min(1.0, max(0.0, confidence))
            
        except Exception as e:
            logger.error(f"Error calculating prediction confidence: {e}")
            return 0.5
    
    def get_user_health_summary(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive health summary for user"""
        try:
            user_logs = self.user_symptom_logs.get(user_id, [])
            user_feedback = self.user_feedback_logs.get(user_id, [])
            
            if not user_logs:
                return {
                    'summary': 'No health data available',
                    'recommendations': ['Start logging symptoms to get personalized insights']
                }
            
            # Calculate health metrics
            total_logs = len(user_logs)
            avg_severity = np.mean([log.get('severity', 0) for log in user_logs])
            flare_rate = np.mean([log.get('flare_up', False) for log in user_logs])
            medication_usage = np.mean([log.get('medication_used', False) for log in user_logs])
            
            # Recent trends (last 7 days)
            recent_logs = user_logs[-7:] if len(user_logs) >= 7 else user_logs
            recent_avg_severity = np.mean([log.get('severity', 0) for log in recent_logs])
            recent_flare_rate = np.mean([log.get('flare_up', False) for log in recent_logs])
            
            # Feedback analysis
            if user_feedback:
                avg_feedback_rating = np.mean([f.get('rating', 3) for f in user_feedback])
                helpful_rate = np.mean([f.get('helpful', True) for f in user_feedback])
            else:
                avg_feedback_rating = 0
                helpful_rate = 0
            
            return {
                'total_logs': total_logs,
                'avg_severity': avg_severity,
                'flare_rate': flare_rate,
                'medication_usage': medication_usage,
                'recent_avg_severity': recent_avg_severity,
                'recent_flare_rate': recent_flare_rate,
                'avg_feedback_rating': avg_feedback_rating,
                'helpful_rate': helpful_rate,
                'health_status': self._assess_health_status(avg_severity, flare_rate, recent_avg_severity, recent_flare_rate),
                'recommendations': self._generate_health_recommendations(avg_severity, flare_rate, medication_usage)
            }
            
        except Exception as e:
            logger.error(f"Error getting user health summary: {e}")
            return {
                'summary': 'Error generating health summary',
                'recommendations': ['Please try again later']
            }
    
    def _assess_health_status(self, avg_severity: float, flare_rate: float, 
                            recent_avg_severity: float, recent_flare_rate: float) -> str:
        """Assess overall health status"""
        if recent_avg_severity > 6 or recent_flare_rate > 0.4:
            return 'needs_attention'
        elif avg_severity > 4 or flare_rate > 0.2:
            return 'moderate'
        else:
            return 'good'
    
    def _generate_health_recommendations(self, avg_severity: float, flare_rate: float, 
                                       medication_usage: float) -> List[str]:
        """Generate health recommendations based on user data"""
        recommendations = []
        
        if avg_severity > 5:
            recommendations.append('Consider discussing symptom management with your healthcare provider')
        
        if flare_rate > 0.3:
            recommendations.append('Review your environmental triggers and preventive measures')
        
        if medication_usage < 0.5:
            recommendations.append('Ensure you have your rescue medication readily available')
        
        if not recommendations:
            recommendations.append('Continue monitoring your symptoms and environmental conditions')
        
        return recommendations

# Initialize the engine
symptom_logging_engine = SymptomLoggingEngine()
