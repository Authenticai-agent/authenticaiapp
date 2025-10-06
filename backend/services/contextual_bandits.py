"""
Contextual Bandits for Authenticai
Implements Multi-Armed Bandits for personalized recommendation optimization
Learns the best timing and type of recommendations per user
"""
import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

# Contextual Bandits
try:
    from contextualbandits import ContextualBandit, LinUCB, EpsilonGreedy, ThompsonSampling
    CONTEXTUAL_BANDITS_AVAILABLE = True
except ImportError:
    CONTEXTUAL_BANDITS_AVAILABLE = False
    logging.warning("Contextual Bandits not available, using fallback implementation")

# Scikit-learn for fallback
try:
    from sklearn.linear_model import LogisticRegression, LinearRegression
    from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
    from sklearn.multioutput import MultiOutputClassifier
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    logging.warning("Scikit-learn not available")

logger = logging.getLogger(__name__)

class RecommendationBandit:
    """
    Contextual Bandit for personalized recommendation optimization
    Learns which recommendations work best for each user in different contexts
    """
    
    def __init__(self, n_arms: int = 10):
        self.n_arms = n_arms
        self.models_path = Path("backend/models/bandits")
        self.models_path.mkdir(parents=True, exist_ok=True)
        
        # Available recommendation actions (arms)
        self.actions = [
            "indoor_activity",
            "outdoor_activity", 
            "medication_reminder",
            "air_purifier_on",
            "window_closing",
            "exercise_avoidance",
            "pollen_avoidance",
            "humidity_control",
            "temperature_adjustment",
            "emergency_alert"
        ]
        
        # Initialize bandit models
        self.bandit_models = {}
        self.action_history = {}
        self.reward_history = {}
        
        self._initialize_bandit_models()
    
    def _initialize_bandit_models(self):
        """Initialize contextual bandit models"""
        if CONTEXTUAL_BANDITS_AVAILABLE:
            # Use real contextual bandits
            for action in self.actions:
                self.bandit_models[action] = LinUCB(
                    alpha=0.1,
                    nchoices=2,  # Binary: recommend or not
                    fit_intercept=True
                )
        else:
            # Fallback to sklearn models
            for action in self.actions:
                self.bandit_models[action] = LogisticRegression(
                    random_state=42,
                    max_iter=1000
                )
        
        logger.info(f"Initialized {len(self.bandit_models)} bandit models")
    
    def get_context_features(self, user_profile: Dict[str, Any], environmental_data: Dict[str, Any]) -> np.ndarray:
        """Extract context features for bandit decision"""
        features = []
        
        # User profile features
        features.extend([
            user_profile.get('age', 30) / 100.0,  # Normalized age
            user_profile.get('asthma_severity_score', 2) / 3.0,  # Normalized severity
            len(user_profile.get('allergies', [])) / 10.0,  # Normalized allergy count
            len(user_profile.get('triggers', [])) / 10.0,  # Normalized trigger count
        ])
        
        # Environmental features
        features.extend([
            environmental_data.get('pm25', 0) / 100.0,  # Normalized PM2.5
            environmental_data.get('pm10', 0) / 100.0,  # Normalized PM10
            environmental_data.get('ozone', 0) / 100.0,  # Normalized Ozone
            environmental_data.get('temperature', 20) / 50.0,  # Normalized temperature
            environmental_data.get('humidity', 50) / 100.0,  # Normalized humidity
            environmental_data.get('pollen_tree', 0) / 5.0,  # Normalized pollen
            environmental_data.get('pollen_grass', 0) / 5.0,
            environmental_data.get('pollen_weed', 0) / 5.0,
        ])
        
        # Temporal features
        now = datetime.now()
        features.extend([
            now.hour / 24.0,  # Hour of day
            now.weekday() / 7.0,  # Day of week
            now.month / 12.0,  # Month of year
        ])
        
        return np.array(features).reshape(1, -1)
    
    def select_action(self, context: np.ndarray, user_id: str) -> Tuple[str, float]:
        """Select best action using contextual bandit"""
        if not self.bandit_models:
            return "indoor_activity", 0.5  # Default fallback
        
        # Calculate expected rewards for each action
        action_scores = {}
        
        for action, model in self.bandit_models.items():
            try:
                if CONTEXTUAL_BANDITS_AVAILABLE:
                    # Use real contextual bandit
                    pred = model.predict(context)
                    action_scores[action] = pred[0] if hasattr(pred, '__len__') else pred
                else:
                    # Use sklearn fallback
                    if hasattr(model, 'predict_proba'):
                        prob = model.predict_proba(context)[0][1]  # Probability of positive class
                        action_scores[action] = prob
                    else:
                        pred = model.predict(context)[0]
                        action_scores[action] = max(0, min(1, pred))  # Clamp to [0,1]
                        
            except Exception as e:
                logger.warning(f"Error predicting for action {action}: {e}")
                action_scores[action] = 0.5  # Default score
        
        # Select action with highest expected reward
        best_action = max(action_scores, key=action_scores.get)
        best_score = action_scores[best_action]
        
        # Add exploration (epsilon-greedy)
        if np.random.random() < 0.1:  # 10% exploration
            best_action = np.random.choice(self.actions)
            best_score = action_scores[best_action]
        
        return best_action, best_score
    
    def update_model(self, context: np.ndarray, action: str, reward: float, user_id: str):
        """Update bandit model with new feedback"""
        if action not in self.bandit_models:
            return
        
        # Store feedback
        if user_id not in self.action_history:
            self.action_history[user_id] = []
            self.reward_history[user_id] = []
        
        self.action_history[user_id].append({
            'context': context.flatten().tolist(),
            'action': action,
            'reward': reward,
            'timestamp': datetime.now().isoformat()
        })
        self.reward_history[user_id].append(reward)
        
        # Update model
        try:
            model = self.bandit_models[action]
            
            if CONTEXTUAL_BANDITS_AVAILABLE:
                # Use real contextual bandit update
                model.partial_fit(context, [1 if reward > 0.5 else 0])
            else:
                # Use sklearn fallback - retrain periodically
                if len(self.action_history[user_id]) % 10 == 0:
                    self._retrain_sklearn_model(action, user_id)
                    
        except Exception as e:
            logger.error(f"Error updating bandit model for action {action}: {e}")
    
    def _retrain_sklearn_model(self, action: str, user_id: str):
        """Retrain sklearn model with accumulated data"""
        if user_id not in self.action_history:
            return
        
        # Collect data for this action
        X, y = [], []
        for record in self.action_history[user_id]:
            if record['action'] == action:
                X.append(record['context'])
                y.append(1 if record['reward'] > 0.5 else 0)
        
        if len(X) < 5:  # Need minimum data
            return
        
        try:
            # Retrain model
            model = self.bandit_models[action]
            X = np.array(X)
            y = np.array(y)
            
            model.fit(X, y)
            logger.info(f"Retrained {action} model with {len(X)} samples")
            
        except Exception as e:
            logger.error(f"Error retraining {action} model: {e}")
    
    def get_action_statistics(self, user_id: str) -> Dict[str, Any]:
        """Get statistics about action performance for a user"""
        if user_id not in self.action_history:
            return {"error": "No data for user"}
        
        stats = {}
        for action in self.actions:
            action_data = [r for r in self.action_history[user_id] if r['action'] == action]
            
            if action_data:
                rewards = [r['reward'] for r in action_data]
                stats[action] = {
                    'count': len(action_data),
                    'avg_reward': np.mean(rewards),
                    'std_reward': np.std(rewards),
                    'success_rate': np.mean([r > 0.5 for r in rewards])
                }
            else:
                stats[action] = {
                    'count': 0,
                    'avg_reward': 0.0,
                    'std_reward': 0.0,
                    'success_rate': 0.0
                }
        
        return stats
    
    def get_personalized_recommendations(self, user_profile: Dict[str, Any], 
                                       environmental_data: Dict[str, Any], 
                                       user_id: str) -> List[Dict[str, Any]]:
        """Get personalized recommendations using contextual bandits"""
        # Get context features
        context = self.get_context_features(user_profile, environmental_data)
        
        # Select best actions
        recommendations = []
        for _ in range(3):  # Get top 3 recommendations
            action, score = self.select_action(context, user_id)
            
            # Generate recommendation details
            recommendation = self._generate_recommendation_details(
                action, score, user_profile, environmental_data
            )
            recommendations.append(recommendation)
        
        return recommendations
    
    def _generate_recommendation_details(self, action: str, score: float, 
                                       user_profile: Dict[str, Any], 
                                       environmental_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate detailed recommendation based on action"""
        base_recommendations = {
            "indoor_activity": {
                "title": "Stay Indoors",
                "description": "Consider indoor activities to reduce exposure",
                "urgency": "medium",
                "expected_benefit": f"Reduces exposure by {int(score * 60)}%"
            },
            "outdoor_activity": {
                "title": "Safe Outdoor Time",
                "description": "Good conditions for outdoor activities",
                "urgency": "low",
                "expected_benefit": f"Safe outdoor window with {int(score * 80)}% confidence"
            },
            "medication_reminder": {
                "title": "Medication Reminder",
                "description": "Consider taking preventive medication",
                "urgency": "high",
                "expected_benefit": f"Reduces flare-up risk by {int(score * 70)}%"
            },
            "air_purifier_on": {
                "title": "Use Air Purifier",
                "description": "Turn on air purifier to improve indoor air quality",
                "urgency": "medium",
                "expected_benefit": f"Improves indoor air quality by {int(score * 50)}%"
            },
            "window_closing": {
                "title": "Close Windows",
                "description": "Close windows to reduce outdoor pollutant entry",
                "urgency": "high",
                "expected_benefit": f"Reduces indoor pollutants by {int(score * 40)}%"
            },
            "exercise_avoidance": {
                "title": "Avoid Strenuous Exercise",
                "description": "Avoid outdoor exercise due to poor air quality",
                "urgency": "high",
                "expected_benefit": f"Prevents exercise-induced symptoms by {int(score * 60)}%"
            },
            "pollen_avoidance": {
                "title": "Avoid Pollen Exposure",
                "description": "High pollen levels detected, take precautions",
                "urgency": "medium",
                "expected_benefit": f"Reduces pollen exposure by {int(score * 55)}%"
            },
            "humidity_control": {
                "title": "Control Humidity",
                "description": "Adjust humidity levels for optimal comfort",
                "urgency": "low",
                "expected_benefit": f"Improves comfort by {int(score * 30)}%"
            },
            "temperature_adjustment": {
                "title": "Adjust Temperature",
                "description": "Moderate temperature for better air quality",
                "urgency": "low",
                "expected_benefit": f"Optimizes conditions by {int(score * 25)}%"
            },
            "emergency_alert": {
                "title": "Emergency Alert",
                "description": "Dangerous conditions detected, take immediate action",
                "urgency": "critical",
                "expected_benefit": f"Prevents severe symptoms by {int(score * 90)}%"
            }
        }
        
        recommendation = base_recommendations.get(action, {
            "title": "General Recommendation",
            "description": "Follow general health guidelines",
            "urgency": "medium",
            "expected_benefit": "Helps maintain health"
        })
        
        recommendation.update({
            "action": action,
            "confidence_score": score,
            "timestamp": datetime.now().isoformat()
        })
        
        return recommendation

class ContextualBanditsEngine:
    """
    Main engine for contextual bandits
    Manages multiple bandit models for different recommendation types
    """
    
    def __init__(self):
        self.models_path = Path("backend/models/contextual_bandits")
        self.models_path.mkdir(parents=True, exist_ok=True)
        
        # Initialize recommendation bandit
        self.recommendation_bandit = RecommendationBandit()
        
        # User-specific bandit models
        self.user_bandits = {}
        
    def get_personalized_recommendations(self, user_id: str, user_profile: Dict[str, Any], 
                                       environmental_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get personalized recommendations for a user"""
        # Get or create user-specific bandit
        if user_id not in self.user_bandits:
            self.user_bandits[user_id] = RecommendationBandit()
        
        user_bandit = self.user_bandits[user_id]
        
        # Get recommendations
        recommendations = user_bandit.get_personalized_recommendations(
            user_profile, environmental_data, user_id
        )
        
        return recommendations
    
    def record_feedback(self, user_id: str, action: str, reward: float, 
                       user_profile: Dict[str, Any], environmental_data: Dict[str, Any]):
        """Record user feedback for bandit learning"""
        if user_id not in self.user_bandits:
            self.user_bandits[user_id] = RecommendationBandit()
        
        user_bandit = self.user_bandits[user_id]
        context = user_bandit.get_context_features(user_profile, environmental_data)
        
        # Update bandit model
        user_bandit.update_model(context, action, reward, user_id)
        
        logger.info(f"Recorded feedback for user {user_id}: action={action}, reward={reward}")
    
    def get_user_insights(self, user_id: str) -> Dict[str, Any]:
        """Get insights about user's recommendation preferences"""
        if user_id not in self.user_bandits:
            return {"error": "No data for user"}
        
        user_bandit = self.user_bandits[user_id]
        stats = user_bandit.get_action_statistics(user_id)
        
        # Find best performing actions
        best_actions = sorted(stats.items(), key=lambda x: x[1]['avg_reward'], reverse=True)[:3]
        
        return {
            "user_id": user_id,
            "total_recommendations": sum(s['count'] for s in stats.values()),
            "best_actions": [{"action": action, "avg_reward": data['avg_reward']} 
                           for action, data in best_actions],
            "action_statistics": stats
        }
    
    def train_models(self, user_id: str) -> Dict[str, Any]:
        """Train bandit models for a specific user"""
        if user_id not in self.user_bandits:
            return {"error": "No user bandit found"}
        
        user_bandit = self.user_bandits[user_id]
        
        # Retrain all models
        for action in user_bandit.actions:
            user_bandit._retrain_sklearn_model(action, user_id)
        
        return {
            "status": "success",
            "user_id": user_id,
            "models_retrained": len(user_bandit.actions)
        }

# Global instance
contextual_bandits_engine = ContextualBanditsEngine()
