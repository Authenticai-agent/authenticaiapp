"""
Engagement & Retention Features Engine
Implements sequence models, recommendation engines, and clustering
for personalized challenges, notifications, and user journey tracking
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
    from sklearn.cluster import KMeans
    from sklearn.preprocessing import StandardScaler
    from sklearn.metrics import mean_squared_error
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

try:
    import tensorflow as tf
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import LSTM, Dense, Dropout
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False
    logging.warning("TensorFlow not available, using sklearn for sequence models")

logger = logging.getLogger(__name__)

class EngagementEngine:
    """
    Engagement & Retention Features Engine
    - Sequence Models for predicting user activity patterns
    - Recommendation Engines for suggesting daily habits
    - Clustering for user segmentation and tailored messaging
    - Personalized challenges and journey tracking
    """
    
    def __init__(self):
        self.models_path = Path("backend/models/engagement")
        self.models_path.mkdir(parents=True, exist_ok=True)
        
        # Initialize models
        self.sequence_model = None
        self.recommendation_model = None
        self.clustering_model = None
        self.scaler = None
        
        # User data storage
        self.user_activity_logs = {}
        self.user_journey_data = {}
        self.user_challenges = {}
        
        # Challenge templates
        self.challenge_templates = self._initialize_challenge_templates()
        
        # Notification templates
        self.notification_templates = self._initialize_notification_templates()
        
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize ML models for engagement"""
        try:
            # Sequence model for activity prediction
            if TENSORFLOW_AVAILABLE:
                self._build_sequence_model()
            elif SKLEARN_AVAILABLE:
                self.sequence_model = RandomForestRegressor(
                    n_estimators=100,
                    max_depth=10,
                    random_state=42
                )
            
            # Recommendation model
            if SKLEARN_AVAILABLE:
                self.recommendation_model = RandomForestRegressor(
                    n_estimators=50,
                    max_depth=8,
                    random_state=42
                )
            
            # Clustering model for user segmentation
            if SKLEARN_AVAILABLE:
                self.clustering_model = KMeans(n_clusters=5, random_state=42)
            
            # Scaler
            if SKLEARN_AVAILABLE:
                self.scaler = StandardScaler()
            
            logger.info("Engagement Engine initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing Engagement Engine: {e}")
    
    def _build_sequence_model(self):
        """Build LSTM sequence model for activity prediction"""
        try:
            self.sequence_model = Sequential([
                LSTM(50, activation='relu', input_shape=(7, 10)),  # 7 days, 10 features
                Dropout(0.2),
                Dense(25, activation='relu'),
                Dropout(0.2),
                Dense(1, activation='linear')
            ])
            self.sequence_model.compile(optimizer='adam', loss='mse')
            logger.info("LSTM sequence model built successfully")
            
        except Exception as e:
            logger.error(f"Error building sequence model: {e}")
            self.sequence_model = None
    
    def _initialize_challenge_templates(self) -> Dict[str, List[Dict[str, Any]]]:
        """Initialize challenge templates for user engagement"""
        return {
            'daily_challenges': [
                {
                    'id': 'daily_air_quality_check',
                    'title': 'Daily Air Quality Check',
                    'description': 'Check your local air quality every day for a week',
                    'duration': 7,
                    'points': 50,
                    'difficulty': 'easy',
                    'category': 'awareness'
                },
                {
                    'id': 'indoor_air_improvement',
                    'title': 'Indoor Air Improvement',
                    'description': 'Use air purifiers or open windows when air quality is good',
                    'duration': 14,
                    'points': 100,
                    'difficulty': 'medium',
                    'category': 'action'
                },
                {
                    'id': 'symptom_tracking',
                    'title': 'Symptom Tracking',
                    'description': 'Log your symptoms daily for two weeks',
                    'duration': 14,
                    'points': 150,
                    'difficulty': 'medium',
                    'category': 'health'
                }
            ],
            'weekly_challenges': [
                {
                    'id': 'clean_air_week',
                    'title': 'Clean Air Week',
                    'description': 'Maintain good indoor air quality for a week',
                    'duration': 7,
                    'points': 200,
                    'difficulty': 'medium',
                    'category': 'lifestyle'
                },
                {
                    'id': 'outdoor_activity_optimization',
                    'title': 'Outdoor Activity Optimization',
                    'description': 'Plan outdoor activities during low pollution hours',
                    'duration': 7,
                    'points': 175,
                    'difficulty': 'medium',
                    'category': 'planning'
                }
            ],
            'monthly_challenges': [
                {
                    'id': 'environmental_mastery',
                    'title': 'Environmental Mastery',
                    'description': 'Master your environmental triggers and prevention strategies',
                    'duration': 30,
                    'points': 500,
                    'difficulty': 'hard',
                    'category': 'mastery'
                },
                {
                    'id': 'health_journey_tracking',
                    'title': 'Health Journey Tracking',
                    'description': 'Complete a full month of symptom and environmental tracking',
                    'duration': 30,
                    'points': 400,
                    'difficulty': 'hard',
                    'category': 'commitment'
                }
            ]
        }
    
    def _initialize_notification_templates(self) -> Dict[str, List[Dict[str, Any]]]:
        """Initialize notification templates"""
        return {
            'safety_alerts': [
                {
                    'type': 'high_pollution',
                    'title': 'High Pollution Alert',
                    'message': 'Air quality is unhealthy. Consider staying indoors and using air purifiers.',
                    'priority': 'high',
                    'timing': 'immediate'
                },
                {
                    'type': 'ozone_peak',
                    'title': 'Ozone Peak Hours',
                    'message': 'Ozone levels peak 3-6 PM. Avoid outdoor exercise during these hours.',
                    'priority': 'medium',
                    'timing': 'scheduled'
                }
            ],
            'opportunity_alerts': [
                {
                    'type': 'good_air_quality',
                    'title': 'Good Air Quality Window',
                    'message': 'Air quality is good now! Safe for outdoor activities until 2 PM.',
                    'priority': 'low',
                    'timing': 'scheduled'
                },
                {
                    'type': 'pollen_low',
                    'title': 'Low Pollen Window',
                    'message': 'Pollen levels are low this morning. Great time for outdoor activities!',
                    'priority': 'low',
                    'timing': 'scheduled'
                }
            ],
            'engagement_alerts': [
                {
                    'type': 'challenge_reminder',
                    'title': 'Challenge Progress',
                    'message': 'You\'re 3 days into your Clean Air Week challenge! Keep it up!',
                    'priority': 'low',
                    'timing': 'scheduled'
                },
                {
                    'type': 'achievement',
                    'title': 'Achievement Unlocked',
                    'message': 'Congratulations! You\'ve completed your first week of symptom tracking.',
                    'priority': 'low',
                    'timing': 'immediate'
                }
            ]
        }
    
    def predict_user_behavior(self, user_id: str, environmental_data: Dict[str, Any], 
                            user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict user behavior patterns using sequence models
        """
        try:
            # Get user activity history
            user_activities = self.user_activity_logs.get(user_id, [])
            
            if len(user_activities) < 7:
                return {
                    'predicted_activities': [],
                    'confidence': 0.3,
                    'recommendations': ['Start logging activities to get personalized predictions']
                }
            
            # Prepare sequence data
            sequence_data = self._prepare_sequence_data(user_activities, environmental_data)
            
            # Make predictions
            if self.sequence_model is not None:
                predictions = self._predict_with_sequence_model(sequence_data)
            else:
                predictions = self._predict_with_fallback_model(sequence_data)
            
            # Generate recommendations
            recommendations = self._generate_behavior_recommendations(predictions, user_profile)
            
            return {
                'predicted_activities': predictions,
                'confidence': self._calculate_prediction_confidence(user_activities),
                'recommendations': recommendations,
                'next_optimal_activity': self._get_next_optimal_activity(predictions, environmental_data)
            }
            
        except Exception as e:
            logger.error(f"Error predicting user behavior: {e}")
            return {
                'predicted_activities': [],
                'confidence': 0.0,
                'recommendations': ['Unable to predict behavior patterns'],
                'error': str(e)
            }
    
    def _prepare_sequence_data(self, user_activities: List[Dict[str, Any]], 
                             environmental_data: Dict[str, Any]) -> np.ndarray:
        """Prepare sequence data for prediction"""
        try:
            # Extract features from last 7 days
            sequence_features = []
            
            for i in range(min(7, len(user_activities))):
                activity = user_activities[-(i+1)]
                
                # Activity features
                features = [
                    activity.get('symptom_severity', 0),
                    activity.get('medication_used', 0),
                    activity.get('outdoor_activity', 0),
                    activity.get('air_purifier_used', 0),
                    activity.get('windows_open', 0),
                    activity.get('challenge_progress', 0),
                    activity.get('notification_clicked', 0),
                    activity.get('app_usage_time', 0),
                    activity.get('environmental_check', 0),
                    activity.get('symptom_logged', 0)
                ]
                
                sequence_features.append(features)
            
            # Pad with zeros if less than 7 days
            while len(sequence_features) < 7:
                sequence_features.append([0] * 10)
            
            return np.array(sequence_features)
            
        except Exception as e:
            logger.error(f"Error preparing sequence data: {e}")
            return np.zeros((7, 10))
    
    def _predict_with_sequence_model(self, sequence_data: np.ndarray) -> List[Dict[str, Any]]:
        """Predict using LSTM sequence model"""
        try:
            if self.sequence_model is None:
                return []
            
            # Reshape for LSTM
            X = sequence_data.reshape(1, 7, 10)
            
            # Make prediction
            prediction = self.sequence_model.predict(X)[0][0]
            
            # Convert to activity predictions
            activities = [
                {
                    'activity': 'symptom_logging',
                    'probability': min(1.0, max(0.0, prediction * 0.8)),
                    'optimal_time': 'morning'
                },
                {
                    'activity': 'environmental_check',
                    'probability': min(1.0, max(0.0, prediction * 0.6)),
                    'optimal_time': 'afternoon'
                },
                {
                    'activity': 'challenge_progress',
                    'probability': min(1.0, max(0.0, prediction * 0.4)),
                    'optimal_time': 'evening'
                }
            ]
            
            return activities
            
        except Exception as e:
            logger.error(f"Error predicting with sequence model: {e}")
            return []
    
    def _predict_with_fallback_model(self, sequence_data: np.ndarray) -> List[Dict[str, Any]]:
        """Predict using fallback model"""
        try:
            # Simple rule-based prediction
            avg_activity = np.mean(sequence_data)
            
            activities = [
                {
                    'activity': 'symptom_logging',
                    'probability': min(1.0, max(0.0, avg_activity * 0.8)),
                    'optimal_time': 'morning'
                },
                {
                    'activity': 'environmental_check',
                    'probability': min(1.0, max(0.0, avg_activity * 0.6)),
                    'optimal_time': 'afternoon'
                },
                {
                    'activity': 'challenge_progress',
                    'probability': min(1.0, max(0.0, avg_activity * 0.4)),
                    'optimal_time': 'evening'
                }
            ]
            
            return activities
            
        except Exception as e:
            logger.error(f"Error predicting with fallback model: {e}")
            return []
    
    def _generate_behavior_recommendations(self, predictions: List[Dict[str, Any]], 
                                         user_profile: Dict[str, Any]) -> List[str]:
        """Generate behavior recommendations based on predictions"""
        try:
            recommendations = []
            
            # Get user preferences
            asthma_severity = user_profile.get('asthma_severity', 'moderate')
            triggers = user_profile.get('triggers', [])
            
            # Generate recommendations based on predictions
            for prediction in predictions:
                activity = prediction['activity']
                probability = prediction['probability']
                
                if probability > 0.7:
                    if activity == 'symptom_logging':
                        recommendations.append('Consider logging your symptoms daily to track patterns and triggers')
                    elif activity == 'environmental_check':
                        recommendations.append('Check air quality regularly to plan your daily activities')
                    elif activity == 'challenge_progress':
                        recommendations.append('Participate in challenges to stay engaged with your health goals')
            
            # Add general recommendations
            if asthma_severity == 'severe':
                recommendations.append('Given your severe asthma, consider more frequent environmental monitoring')
            
            if 'pm25' in triggers:
                recommendations.append('Monitor PM2.5 levels closely as you\'re sensitive to fine particles')
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error generating behavior recommendations: {e}")
            return ['Continue monitoring your health and environmental conditions']
    
    def _get_next_optimal_activity(self, predictions: List[Dict[str, Any]], 
                                 environmental_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get the next optimal activity for the user"""
        try:
            if not predictions:
                return {
                    'activity': 'environmental_check',
                    'reason': 'No predictions available',
                    'optimal_time': 'now'
                }
            
            # Find highest probability activity
            best_prediction = max(predictions, key=lambda x: x['probability'])
            
            # Adjust based on environmental conditions
            air_quality = environmental_data.get('air_quality', {})
            aqi = air_quality.get('aqi', 50)
            
            if aqi > 150:
                return {
                    'activity': 'indoor_air_management',
                    'reason': f'AQI is {aqi}, focus on indoor air quality',
                    'optimal_time': 'immediate'
                }
            elif aqi < 50:
                return {
                    'activity': 'outdoor_activity_planning',
                    'reason': f'AQI is {aqi}, good time for outdoor activities',
                    'optimal_time': 'next_2_hours'
                }
            else:
                return {
                    'activity': best_prediction['activity'],
                    'reason': f'Based on your activity patterns (probability: {best_prediction["probability"]:.2f})',
                    'optimal_time': best_prediction['optimal_time']
                }
                
        except Exception as e:
            logger.error(f"Error getting next optimal activity: {e}")
            return {
                'activity': 'environmental_check',
                'reason': 'Error in prediction',
                'optimal_time': 'now'
            }
    
    def _calculate_prediction_confidence(self, user_activities: List[Dict[str, Any]]) -> float:
        """Calculate confidence in predictions"""
        try:
            if len(user_activities) < 7:
                return 0.3
            
            # Base confidence on data quantity
            confidence = min(0.9, 0.3 + (len(user_activities) / 100))
            
            # Adjust based on activity consistency
            recent_activities = user_activities[-7:]
            consistency = np.std([a.get('symptom_severity', 0) for a in recent_activities])
            if consistency < 1.0:  # Low variation = high consistency
                confidence += 0.1
            
            return min(1.0, confidence)
            
        except Exception as e:
            logger.error(f"Error calculating prediction confidence: {e}")
            return 0.3
    
    def generate_personalized_challenges(self, user_id: str, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Generate personalized challenges based on user profile and behavior"""
        try:
            # Get user activity history
            user_activities = self.user_activity_logs.get(user_id, [])
            user_challenges = self.user_challenges.get(user_id, [])
            
            # Determine user segment
            user_segment = self._get_user_segment(user_profile, user_activities)
            
            # Select appropriate challenges
            challenges = self._select_challenges_for_segment(user_segment, user_challenges)
            
            # Personalize challenges
            personalized_challenges = self._personalize_challenges(challenges, user_profile)
            
            return {
                'challenges': personalized_challenges,
                'user_segment': user_segment,
                'total_points_available': sum(c['points'] for c in personalized_challenges),
                'recommended_challenge': personalized_challenges[0] if personalized_challenges else None
            }
            
        except Exception as e:
            logger.error(f"Error generating personalized challenges: {e}")
            return {
                'challenges': [],
                'user_segment': 'unknown',
                'total_points_available': 0,
                'recommended_challenge': None,
                'error': str(e)
            }
    
    def _get_user_segment(self, user_profile: Dict[str, Any], 
                         user_activities: List[Dict[str, Any]]) -> str:
        """Get user segment for challenge personalization"""
        try:
            # Analyze user characteristics
            asthma_severity = user_profile.get('asthma_severity', 'moderate')
            age = user_profile.get('age', 30)
            activity_count = len(user_activities)
            
            # Determine segment
            if asthma_severity == 'severe' and age > 50:
                return 'senior_severe'
            elif asthma_severity in ['moderate', 'severe'] and age < 30:
                return 'young_moderate_severe'
            elif activity_count > 20:
                return 'highly_engaged'
            elif activity_count < 5:
                return 'new_user'
            else:
                return 'moderate_user'
                
        except Exception as e:
            logger.error(f"Error getting user segment: {e}")
            return 'unknown'
    
    def _select_challenges_for_segment(self, user_segment: str, 
                                     existing_challenges: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Select appropriate challenges for user segment"""
        try:
            # Get existing challenge IDs
            existing_ids = [c['id'] for c in existing_challenges]
            
            # Select challenges based on segment
            if user_segment == 'new_user':
                challenges = [c for c in self.challenge_templates['daily_challenges'] 
                            if c['difficulty'] == 'easy' and c['id'] not in existing_ids][:3]
            elif user_segment == 'highly_engaged':
                challenges = [c for c in self.challenge_templates['weekly_challenges'] 
                            if c['id'] not in existing_ids][:2]
            elif user_segment == 'senior_severe':
                challenges = [c for c in self.challenge_templates['daily_challenges'] 
                            if c['category'] == 'health' and c['id'] not in existing_ids][:2]
            else:
                challenges = [c for c in self.challenge_templates['daily_challenges'] 
                            if c['difficulty'] in ['easy', 'medium'] and c['id'] not in existing_ids][:3]
            
            return challenges
            
        except Exception as e:
            logger.error(f"Error selecting challenges for segment: {e}")
            return []
    
    def _personalize_challenges(self, challenges: List[Dict[str, Any]], 
                              user_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Personalize challenges based on user profile"""
        try:
            personalized = []
            
            for challenge in challenges:
                personalized_challenge = challenge.copy()
                
                # Add personalization based on user profile
                asthma_severity = user_profile.get('asthma_severity', 'moderate')
                triggers = user_profile.get('triggers', [])
                
                # Adjust points based on difficulty
                if asthma_severity == 'severe':
                    personalized_challenge['points'] = int(challenge['points'] * 1.2)
                
                # Add trigger-specific messaging
                if 'pm25' in triggers and 'air_quality' in challenge['description'].lower():
                    personalized_challenge['description'] += ' (Perfect for your PM2.5 sensitivity!)'
                
                personalized.append(personalized_challenge)
            
            return personalized
            
        except Exception as e:
            logger.error(f"Error personalizing challenges: {e}")
            return challenges
    
    def generate_notifications(self, user_id: str, environmental_data: Dict[str, Any], 
                             user_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate personalized notifications for the user"""
        try:
            notifications = []
            
            # Get user preferences
            user_activities = self.user_activity_logs.get(user_id, [])
            user_challenges = self.user_challenges.get(user_id, [])
            
            # Generate safety alerts
            safety_alerts = self._generate_safety_alerts(environmental_data, user_profile)
            notifications.extend(safety_alerts)
            
            # Generate opportunity alerts
            opportunity_alerts = self._generate_opportunity_alerts(environmental_data, user_profile)
            notifications.extend(opportunity_alerts)
            
            # Generate engagement alerts
            engagement_alerts = self._generate_engagement_alerts(user_activities, user_challenges)
            notifications.extend(engagement_alerts)
            
            # Sort by priority
            notifications.sort(key=lambda x: {'high': 3, 'medium': 2, 'low': 1}.get(x['priority'], 1), reverse=True)
            
            return notifications[:5]  # Return top 5 notifications
            
        except Exception as e:
            logger.error(f"Error generating notifications: {e}")
            return []
    
    def _generate_safety_alerts(self, environmental_data: Dict[str, Any], 
                              user_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate safety alerts based on environmental conditions"""
        try:
            alerts = []
            
            # Check air quality
            air_quality = environmental_data.get('air_quality', {})
            aqi = air_quality.get('aqi', 50)
            pm25 = air_quality.get('pm25', 0)
            ozone = air_quality.get('ozone', 0)
            
            # High pollution alert
            if aqi > 150:
                alerts.append({
                    'type': 'safety',
                    'title': 'High Pollution Alert',
                    'message': f'AQI is {aqi} - unhealthy for everyone. Stay indoors and use air purifiers.',
                    'priority': 'high',
                    'timing': 'immediate',
                    'action_required': True
                })
            
            # PM2.5 specific alert
            if pm25 > 55 and 'pm25' in user_profile.get('triggers', []):
                alerts.append({
                    'type': 'safety',
                    'title': 'PM2.5 Alert',
                    'message': f'PM2.5 at {pm25:.1f} μg/m³ is dangerous for your sensitivity. Avoid outdoor activities.',
                    'priority': 'high',
                    'timing': 'immediate',
                    'action_required': True
                })
            
            # Ozone peak alert
            if ozone > 85:
                alerts.append({
                    'type': 'safety',
                    'title': 'Ozone Peak Hours',
                    'message': 'Ozone levels are high. Avoid outdoor exercise 3-6 PM.',
                    'priority': 'medium',
                    'timing': 'scheduled',
                    'action_required': False
                })
            
            return alerts
            
        except Exception as e:
            logger.error(f"Error generating safety alerts: {e}")
            return []
    
    def _generate_opportunity_alerts(self, environmental_data: Dict[str, Any], 
                                   user_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate opportunity alerts for good conditions"""
        try:
            alerts = []
            
            # Check air quality
            air_quality = environmental_data.get('air_quality', {})
            aqi = air_quality.get('aqi', 50)
            
            # Good air quality window
            if aqi < 50:
                alerts.append({
                    'type': 'opportunity',
                    'title': 'Good Air Quality Window',
                    'message': f'AQI is {aqi} - good for outdoor activities! Safe until 2 PM.',
                    'priority': 'low',
                    'timing': 'scheduled',
                    'action_required': False
                })
            
            # Pollen check
            pollen = environmental_data.get('pollen', {})
            pollen_tree = pollen.get('tree', 0)
            pollen_grass = pollen.get('grass', 0)
            
            if max(pollen_tree, pollen_grass) < 2 and any(allergy in ['pollen', 'tree', 'grass'] for allergy in user_profile.get('allergies', [])):
                alerts.append({
                    'type': 'opportunity',
                    'title': 'Low Pollen Window',
                    'message': 'Pollen levels are low this morning. Great time for outdoor activities!',
                    'priority': 'low',
                    'timing': 'scheduled',
                    'action_required': False
                })
            
            return alerts
            
        except Exception as e:
            logger.error(f"Error generating opportunity alerts: {e}")
            return []
    
    def _generate_engagement_alerts(self, user_activities: List[Dict[str, Any]], 
                                  user_challenges: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate engagement alerts for user motivation"""
        try:
            alerts = []
            
            # Challenge progress alerts
            active_challenges = [c for c in user_challenges if c.get('status') == 'active']
            
            for challenge in active_challenges:
                progress = challenge.get('progress', 0)
                duration = challenge.get('duration', 7)
                
                if progress >= duration * 0.5:  # Halfway point
                    alerts.append({
                        'type': 'engagement',
                        'title': 'Challenge Progress',
                        'message': f'You\'re halfway through {challenge["title"]}! Keep it up!',
                        'priority': 'low',
                        'timing': 'scheduled',
                        'action_required': False
                    })
                
                if progress >= duration:  # Completed
                    alerts.append({
                        'type': 'engagement',
                        'title': 'Challenge Completed!',
                        'message': f'Congratulations! You\'ve completed {challenge["title"]} and earned {challenge["points"]} points!',
                        'priority': 'low',
                        'timing': 'immediate',
                        'action_required': False
                    })
            
            # Activity streak alerts
            if len(user_activities) >= 7:
                recent_activities = user_activities[-7:]
                daily_checks = sum(1 for a in recent_activities if a.get('environmental_check', False))
                
                if daily_checks >= 5:
                    alerts.append({
                        'type': 'engagement',
                        'title': 'Activity Streak',
                        'message': f'Great job! You\'ve checked air quality {daily_checks} days this week.',
                        'priority': 'low',
                        'timing': 'scheduled',
                        'action_required': False
                    })
            
            return alerts
            
        except Exception as e:
            logger.error(f"Error generating engagement alerts: {e}")
            return []
    
    def track_user_journey(self, user_id: str, journey_data: Dict[str, Any]) -> Dict[str, Any]:
        """Track user journey and progress"""
        try:
            # Store journey data
            if user_id not in self.user_journey_data:
                self.user_journey_data[user_id] = []
            
            journey_entry = {
                'timestamp': datetime.utcnow().isoformat(),
                'data': journey_data
            }
            
            self.user_journey_data[user_id].append(journey_entry)
            
            # Keep only last 100 entries
            if len(self.user_journey_data[user_id]) > 100:
                self.user_journey_data[user_id] = self.user_journey_data[user_id][-100:]
            
            # Generate journey insights
            insights = self._generate_journey_insights(user_id)
            
            return {
                'success': True,
                'journey_entry': journey_entry,
                'insights': insights,
                'total_entries': len(self.user_journey_data[user_id])
            }
            
        except Exception as e:
            logger.error(f"Error tracking user journey: {e}")
            return {
                'success': False,
                'error': str(e),
                'total_entries': 0
            }
    
    def _generate_journey_insights(self, user_id: str) -> Dict[str, Any]:
        """Generate insights from user journey data"""
        try:
            user_journey = self.user_journey_data.get(user_id, [])
            
            if len(user_journey) < 7:
                return {
                    'insights': [],
                    'trends': {},
                    'recommendations': ['Continue tracking your journey to get personalized insights']
                }
            
            # Analyze trends
            recent_entries = user_journey[-7:]
            
            # Calculate engagement metrics
            total_entries = len(user_journey)
            recent_activity = len(recent_entries)
            
            # Generate insights
            insights = []
            
            if recent_activity >= 5:
                insights.append({
                    'type': 'positive',
                    'message': 'Great engagement! You\'ve been actively tracking your health journey.',
                    'impact': 'high'
                })
            
            if total_entries >= 30:
                insights.append({
                    'type': 'milestone',
                    'message': f'You\'ve been tracking your journey for {total_entries} days. Consistency is key!',
                    'impact': 'medium'
                })
            
            return {
                'insights': insights,
                'trends': {
                    'total_entries': total_entries,
                    'recent_activity': recent_activity,
                    'engagement_rate': recent_activity / 7
                },
                'recommendations': [
                    'Continue tracking your daily activities',
                    'Set weekly goals for health monitoring',
                    'Celebrate your progress and milestones'
                ]
            }
            
        except Exception as e:
            logger.error(f"Error generating journey insights: {e}")
            return {
                'insights': [],
                'trends': {},
                'recommendations': ['Unable to generate insights']
            }
    
    def log_user_activity(self, user_id: str, activity_data: Dict[str, Any]) -> Dict[str, Any]:
        """Log user activity for behavior prediction"""
        try:
            # Store activity data
            if user_id not in self.user_activity_logs:
                self.user_activity_logs[user_id] = []
            
            activity_entry = {
                'timestamp': datetime.utcnow().isoformat(),
                'data': activity_data
            }
            
            self.user_activity_logs[user_id].append(activity_entry)
            
            # Keep only last 200 entries
            if len(self.user_activity_logs[user_id]) > 200:
                self.user_activity_logs[user_id] = self.user_activity_logs[user_id][-200:]
            
            return {
                'success': True,
                'activity_entry': activity_entry,
                'total_activities': len(self.user_activity_logs[user_id])
            }
            
        except Exception as e:
            logger.error(f"Error logging user activity: {e}")
            return {
                'success': False,
                'error': str(e),
                'total_activities': 0
            }

# Initialize the engine
engagement_engine = EngagementEngine()
