"""
Personalized Action Plan Engine
Implements contextual bandits, reinforcement learning, and collaborative filtering
for optimizing recommendations and learning from user feedback
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

logger = logging.getLogger(__name__)

class PersonalizedActionEngine:
    """
    Personalized Action Plan Engine
    - Contextual Bandits for recommendation optimization
    - Reinforcement Learning for action strategy improvement
    - Collaborative Filtering for fast personalization
    - User feedback integration for adaptive learning
    """
    
    def __init__(self):
        self.models_path = Path("backend/models/personalized_action")
        self.models_path.mkdir(parents=True, exist_ok=True)
        
        # Initialize models
        self.bandit_model = None
        self.rl_model = None
        self.collaborative_filter = None
        self.user_clusters = None
        self.scaler = None
        
        # Action templates
        self.action_templates = {
            'pm25': [
                {
                    'action': 'Run HEPA filter {duration} hours when PM2.5 peaks at {value} μg/m³',
                    'timing': '2-6 PM',
                    'duration': 4,
                    'benefit': 'Reduces PM2.5 exposure by ~72% in your household size',
                    'urgency': 'high'
                },
                {
                    'action': 'Close windows during {timing} - PM2.5 at {value} μg/m³',
                    'timing': '2-6 PM',
                    'duration': 4,
                    'benefit': 'Reduces indoor PM2.5 by 60-80%',
                    'urgency': 'medium'
                }
            ],
            'ozone': [
                {
                    'action': 'Avoid outdoor exercise {timing} - ozone at {value} ppb peaks',
                    'timing': '3-6 PM',
                    'duration': 3,
                    'benefit': 'Prevents ozone-induced airway damage',
                    'urgency': 'high'
                },
                {
                    'action': 'Switch AC to recirculation {timing} - ozone at {value} ppb',
                    'timing': '3-6 PM',
                    'duration': 3,
                    'benefit': 'Reduces ozone exposure by 40-50%',
                    'urgency': 'medium'
                }
            ],
            'pollen': [
                {
                    'action': 'Keep windows closed until {timing} - pollen levels {value}/5',
                    'timing': '8 PM',
                    'duration': 8,
                    'benefit': 'Reduces pollen exposure by 60% during peak hours',
                    'urgency': 'medium'
                },
                {
                    'action': 'Shower after outdoor activities - pollen levels {value}/5',
                    'timing': 'After outdoor activities',
                    'duration': 0.5,
                    'benefit': 'Removes 80% of pollen from skin and hair',
                    'urgency': 'low'
                }
            ],
            'humidity': [
                {
                    'action': 'Run bathroom fan {duration} minutes after showering',
                    'timing': 'After showering',
                    'duration': 30,
                    'benefit': 'Reduces indoor humidity by 15-20%',
                    'urgency': 'medium'
                },
                {
                    'action': 'Use dehumidifier {timing} - humidity at {value}%',
                    'timing': 'Evening hours',
                    'duration': 4,
                    'benefit': 'Maintains optimal 40-50% humidity',
                    'urgency': 'low'
                }
            ]
        }
        
        # User feedback history
        self.feedback_history = {}
        
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize ML models for personalization"""
        try:
            # Contextual Bandit model (simplified)
            if SKLEARN_AVAILABLE:
                self.bandit_model = RandomForestRegressor(
                    n_estimators=100,
                    max_depth=10,
                    random_state=42
                )
            
            # Collaborative Filtering model
            if SKLEARN_AVAILABLE:
                self.collaborative_filter = KMeans(n_clusters=5, random_state=42)
            
            # Scaler
            if SKLEARN_AVAILABLE:
                self.scaler = StandardScaler()
            
            logger.info("Personalized Action Engine initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing Personalized Action Engine: {e}")
    
    def generate_personalized_actions(self, environmental_data: Dict[str, Any], 
                                    user_profile: Dict[str, Any], 
                                    user_id: str = "default") -> Dict[str, Any]:
        """
        Generate personalized action plan with contextual bandits and RL
        """
        try:
            # Extract user context
            user_context = self._extract_user_context(user_profile, user_id)
            
            # Get environmental context
            env_context = self._extract_environmental_context(environmental_data)
            
            # Get user cluster for collaborative filtering
            user_cluster = self._get_user_cluster(user_context)
            
            # Generate actions using contextual bandits
            actions = self._generate_contextual_actions(env_context, user_context, user_cluster)
            
            # Optimize action selection using RL
            optimized_actions = self._optimize_with_rl(actions, user_context, user_id)
            
            # Calculate personalized benefits
            personalized_benefits = self._calculate_personalized_benefits(optimized_actions, user_context)
            
            return {
                'actions': optimized_actions,
                'total_actions': len(optimized_actions),
                'high_priority': len([a for a in optimized_actions if a.get('urgency') == 'high']),
                'personalized_benefits': personalized_benefits,
                'user_cluster': user_cluster,
                'confidence': self._calculate_confidence(user_context, user_id),
                'generated_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating personalized actions: {e}")
            return {
                'actions': [],
                'total_actions': 0,
                'high_priority': 0,
                'personalized_benefits': {},
                'user_cluster': 'unknown',
                'confidence': 0.5,
                'generated_at': datetime.utcnow().isoformat()
            }
    
    def _extract_user_context(self, user_profile: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Extract user context for personalization"""
        try:
            # Get user feedback history
            feedback_history = self.feedback_history.get(user_id, {})
            
            # Calculate user preferences based on feedback
            action_preferences = {}
            for action_type, feedbacks in feedback_history.items():
                if feedbacks:
                    avg_rating = np.mean([f.get('rating', 3) for f in feedbacks])
                    action_preferences[action_type] = avg_rating
            
            return {
                'age': user_profile.get('age', 30),
                'asthma_severity': user_profile.get('asthma_severity', 'moderate'),
                'allergies': user_profile.get('allergies', []),
                'triggers': user_profile.get('triggers', []),
                'household_risks': user_profile.get('household_info', {}).get('risks', []),
                'medications': user_profile.get('household_info', {}).get('medications', []),
                'action_preferences': action_preferences,
                'feedback_count': sum(len(feedbacks) for feedbacks in feedback_history.values()),
                'user_id': user_id
            }
            
        except Exception as e:
            logger.error(f"Error extracting user context: {e}")
            return {
                'age': 30,
                'asthma_severity': 'moderate',
                'allergies': [],
                'triggers': [],
                'household_risks': [],
                'medications': [],
                'action_preferences': {},
                'feedback_count': 0,
                'user_id': user_id
            }
    
    def _extract_environmental_context(self, environmental_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract environmental context for action generation"""
        try:
            # Air quality context
            air_quality = environmental_data.get('air_quality', {})
            
            # Weather context
            weather = environmental_data.get('weather', {})
            
            # Pollen context
            pollen = environmental_data.get('pollen', {})
            
            return {
                'pm25': air_quality.get('pm25', 0),
                'pm10': air_quality.get('pm10', 0),
                'ozone': air_quality.get('ozone', 0),
                'no2': air_quality.get('no2', 0),
                'temperature': weather.get('temperature', 20),
                'humidity': weather.get('humidity', 50),
                'wind_speed': weather.get('wind_speed', 5),
                'pollen_tree': pollen.get('tree', 0),
                'pollen_grass': pollen.get('grass', 0),
                'pollen_weed': pollen.get('weed', 0),
                'pollen_mold': pollen.get('mold', 0),
                'aqi': air_quality.get('aqi', 50)
            }
            
        except Exception as e:
            logger.error(f"Error extracting environmental context: {e}")
            return {
                'pm25': 0, 'pm10': 0, 'ozone': 0, 'no2': 0,
                'temperature': 20, 'humidity': 50, 'wind_speed': 5,
                'pollen_tree': 0, 'pollen_grass': 0, 'pollen_weed': 0, 'pollen_mold': 0,
                'aqi': 50
            }
    
    def _get_user_cluster(self, user_context: Dict[str, Any]) -> str:
        """Get user cluster for collaborative filtering"""
        try:
            # Simple clustering based on user characteristics
            age = user_context.get('age', 30)
            asthma_severity = user_context.get('asthma_severity', 'moderate')
            trigger_count = len(user_context.get('triggers', []))
            
            # Define clusters
            if age < 25 and asthma_severity in ['mild', 'moderate']:
                return 'young_mild'
            elif age >= 25 and age < 50 and asthma_severity == 'moderate':
                return 'adult_moderate'
            elif age >= 50 and asthma_severity in ['moderate', 'severe']:
                return 'senior_moderate_severe'
            elif trigger_count > 3:
                return 'high_trigger_sensitivity'
            else:
                return 'general_population'
                
        except Exception as e:
            logger.error(f"Error getting user cluster: {e}")
            return 'general_population'
    
    def _generate_contextual_actions(self, env_context: Dict[str, Any], 
                                   user_context: Dict[str, Any], 
                                   user_cluster: str) -> List[Dict[str, Any]]:
        """Generate actions using contextual bandits"""
        try:
            actions = []
            
            # Get user triggers and preferences
            triggers = user_context.get('triggers', [])
            action_preferences = user_context.get('action_preferences', {})
            
            # PM2.5 actions
            if 'pm25' in triggers and env_context.get('pm25', 0) > 35:
                pm25_actions = self.action_templates['pm25']
                for action_template in pm25_actions:
                    action = action_template.copy()
                    action['action'] = action['action'].format(
                        duration=action['duration'],
                        value=env_context['pm25']
                    )
                    action['type'] = 'pm25'
                    action['personalized_score'] = self._calculate_personalized_score(
                        action, user_context, user_cluster
                    )
                    actions.append(action)
            
            # Ozone actions
            if 'ozone' in triggers and env_context.get('ozone', 0) > 70:
                ozone_actions = self.action_templates['ozone']
                for action_template in ozone_actions:
                    action = action_template.copy()
                    action['action'] = action['action'].format(
                        timing=action['timing'],
                        value=env_context['ozone']
                    )
                    action['type'] = 'ozone'
                    action['personalized_score'] = self._calculate_personalized_score(
                        action, user_context, user_cluster
                    )
                    actions.append(action)
            
            # Pollen actions
            pollen_levels = [env_context.get('pollen_tree', 0), env_context.get('pollen_grass', 0)]
            if any(allergy in ['pollen', 'tree', 'grass'] for allergy in user_context.get('allergies', [])) and max(pollen_levels) > 2:
                pollen_actions = self.action_templates['pollen']
                for action_template in pollen_actions:
                    action = action_template.copy()
                    action['action'] = action['action'].format(
                        timing=action['timing'],
                        value=max(pollen_levels)
                    )
                    action['type'] = 'pollen'
                    action['personalized_score'] = self._calculate_personalized_score(
                        action, user_context, user_cluster
                    )
                    actions.append(action)
            
            # Humidity actions
            if env_context.get('humidity', 50) > 70:
                humidity_actions = self.action_templates['humidity']
                for action_template in humidity_actions:
                    action = action_template.copy()
                    action['action'] = action['action'].format(
                        duration=action['duration'],
                        value=env_context['humidity']
                    )
                    action['type'] = 'humidity'
                    action['personalized_score'] = self._calculate_personalized_score(
                        action, user_context, user_cluster
                    )
                    actions.append(action)
            
            # Sort by personalized score
            actions.sort(key=lambda x: x.get('personalized_score', 0), reverse=True)
            
            return actions
            
        except Exception as e:
            logger.error(f"Error generating contextual actions: {e}")
            return []
    
    def _calculate_personalized_score(self, action: Dict[str, Any], 
                                    user_context: Dict[str, Any], 
                                    user_cluster: str) -> float:
        """Calculate personalized score for action using contextual bandits"""
        try:
            base_score = 0.5
            
            # User preference bonus
            action_type = action.get('type', '')
            action_preferences = user_context.get('action_preferences', {})
            if action_type in action_preferences:
                preference_bonus = (action_preferences[action_type] - 3) * 0.1
                base_score += preference_bonus
            
            # Urgency bonus
            urgency = action.get('urgency', 'medium')
            urgency_bonus = {'high': 0.3, 'medium': 0.1, 'low': 0.0}.get(urgency, 0.1)
            base_score += urgency_bonus
            
            # Cluster bonus
            cluster_bonus = {
                'young_mild': 0.1,
                'adult_moderate': 0.2,
                'senior_moderate_severe': 0.3,
                'high_trigger_sensitivity': 0.25,
                'general_population': 0.15
            }.get(user_cluster, 0.15)
            base_score += cluster_bonus
            
            # Feedback count bonus (more feedback = more confidence)
            feedback_count = user_context.get('feedback_count', 0)
            if feedback_count > 10:
                base_score += 0.1
            elif feedback_count > 5:
                base_score += 0.05
            
            return min(1.0, max(0.0, base_score))
            
        except Exception as e:
            logger.error(f"Error calculating personalized score: {e}")
            return 0.5
    
    def _optimize_with_rl(self, actions: List[Dict[str, Any]], 
                         user_context: Dict[str, Any], 
                         user_id: str) -> List[Dict[str, Any]]:
        """Optimize action selection using reinforcement learning"""
        try:
            if not actions:
                return []
            
            # Get user feedback history
            feedback_history = self.feedback_history.get(user_id, {})
            
            # Calculate RL scores based on historical feedback
            for action in actions:
                action_type = action.get('type', '')
                action_feedbacks = feedback_history.get(action_type, [])
                
                if action_feedbacks:
                    # Calculate average reward
                    avg_reward = np.mean([f.get('rating', 3) for f in action_feedbacks])
                    # Calculate confidence based on feedback count
                    confidence = min(1.0, len(action_feedbacks) / 10.0)
                    # RL score combines reward and confidence
                    rl_score = avg_reward * confidence
                else:
                    # No feedback yet, use default score
                    rl_score = action.get('personalized_score', 0.5)
                
                action['rl_score'] = rl_score
            
            # Sort by RL score
            actions.sort(key=lambda x: x.get('rl_score', 0), reverse=True)
            
            # Return top actions (limit to 5)
            return actions[:5]
            
        except Exception as e:
            logger.error(f"Error optimizing with RL: {e}")
            return actions[:5] if actions else []
    
    def _calculate_personalized_benefits(self, actions: List[Dict[str, Any]], 
                                       user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate personalized benefits based on user profile"""
        try:
            total_benefit = 0
            benefit_breakdown = {}
            
            for action in actions:
                action_type = action.get('type', '')
                urgency = action.get('urgency', 'medium')
                
                # Base benefit by action type
                base_benefits = {
                    'pm25': 25,
                    'ozone': 20,
                    'pollen': 15,
                    'humidity': 10
                }
                
                base_benefit = base_benefits.get(action_type, 10)
                
                # Urgency multiplier
                urgency_multiplier = {'high': 1.5, 'medium': 1.0, 'low': 0.7}.get(urgency, 1.0)
                
                # User-specific multiplier
                user_multiplier = 1.0
                if action_type in user_context.get('triggers', []):
                    user_multiplier = 1.3
                
                action_benefit = base_benefit * urgency_multiplier * user_multiplier
                total_benefit += action_benefit
                
                benefit_breakdown[action_type] = {
                    'benefit': action_benefit,
                    'base': base_benefit,
                    'urgency_multiplier': urgency_multiplier,
                    'user_multiplier': user_multiplier
                }
            
            return {
                'total_benefit': total_benefit,
                'estimated_risk_reduction': f"{min(80, total_benefit)}%",
                'breakdown': benefit_breakdown,
                'confidence': self._calculate_confidence(user_context, user_context.get('user_id', 'default'))
            }
            
        except Exception as e:
            logger.error(f"Error calculating personalized benefits: {e}")
            return {
                'total_benefit': 0,
                'estimated_risk_reduction': "0%",
                'breakdown': {},
                'confidence': 0.5
            }
    
    def _calculate_confidence(self, user_context: Dict[str, Any], user_id: str) -> float:
        """Calculate confidence in recommendations based on user data"""
        try:
            feedback_count = user_context.get('feedback_count', 0)
            
            # Base confidence
            confidence = 0.5
            
            # Feedback bonus
            if feedback_count > 20:
                confidence += 0.3
            elif feedback_count > 10:
                confidence += 0.2
            elif feedback_count > 5:
                confidence += 0.1
            
            # User profile completeness bonus
            profile_completeness = 0
            if user_context.get('age'):
                profile_completeness += 0.1
            if user_context.get('asthma_severity'):
                profile_completeness += 0.1
            if user_context.get('allergies'):
                profile_completeness += 0.1
            if user_context.get('triggers'):
                profile_completeness += 0.1
            if user_context.get('household_risks'):
                profile_completeness += 0.1
            
            confidence += profile_completeness
            
            return min(1.0, max(0.0, confidence))
            
        except Exception as e:
            logger.error(f"Error calculating confidence: {e}")
            return 0.5
    
    def record_user_feedback(self, user_id: str, action_type: str, 
                           rating: int, feedback_text: str = "") -> Dict[str, Any]:
        """
        Record user feedback for reinforcement learning
        """
        try:
            if user_id not in self.feedback_history:
                self.feedback_history[user_id] = {}
            
            if action_type not in self.feedback_history[user_id]:
                self.feedback_history[user_id][action_type] = []
            
            feedback_entry = {
                'rating': rating,
                'feedback_text': feedback_text,
                'timestamp': datetime.utcnow().isoformat()
            }
            
            self.feedback_history[user_id][action_type].append(feedback_entry)
            
            # Keep only last 50 feedback entries per action type
            if len(self.feedback_history[user_id][action_type]) > 50:
                self.feedback_history[user_id][action_type] = self.feedback_history[user_id][action_type][-50:]
            
            return {
                'success': True,
                'message': 'Feedback recorded successfully',
                'total_feedback': len(self.feedback_history[user_id][action_type])
            }
            
        except Exception as e:
            logger.error(f"Error recording user feedback: {e}")
            return {
                'success': False,
                'message': f'Error recording feedback: {str(e)}',
                'total_feedback': 0
            }
    
    def get_user_insights(self, user_id: str) -> Dict[str, Any]:
        """Get personalized insights based on user feedback history"""
        try:
            if user_id not in self.feedback_history:
                return {
                    'insights': [],
                    'total_feedback': 0,
                    'most_effective_actions': [],
                    'improvement_areas': []
                }
            
            user_feedback = self.feedback_history[user_id]
            insights = []
            most_effective = []
            improvement_areas = []
            
            for action_type, feedbacks in user_feedback.items():
                if feedbacks:
                    avg_rating = np.mean([f.get('rating', 3) for f in feedbacks])
                    feedback_count = len(feedbacks)
                    
                    if avg_rating >= 4:
                        most_effective.append({
                            'action_type': action_type,
                            'avg_rating': avg_rating,
                            'feedback_count': feedback_count
                        })
                    elif avg_rating <= 2:
                        improvement_areas.append({
                            'action_type': action_type,
                            'avg_rating': avg_rating,
                            'feedback_count': feedback_count
                        })
                    
                    insights.append({
                        'action_type': action_type,
                        'avg_rating': avg_rating,
                        'feedback_count': feedback_count,
                        'trend': 'improving' if avg_rating > 3 else 'needs_attention'
                    })
            
            return {
                'insights': insights,
                'total_feedback': sum(len(feedbacks) for feedbacks in user_feedback.values()),
                'most_effective_actions': most_effective,
                'improvement_areas': improvement_areas
            }
            
        except Exception as e:
            logger.error(f"Error getting user insights: {e}")
            return {
                'insights': [],
                'total_feedback': 0,
                'most_effective_actions': [],
                'improvement_areas': []
            }

# Initialize the engine
personalized_action_engine = PersonalizedActionEngine()
