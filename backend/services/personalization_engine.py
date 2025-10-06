"""
Personalization Engine for Collaborative Filtering and Meta-Learning
Implements user similarity, collaborative filtering, and meta-learning for rapid personalization
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Any, Tuple, Optional
from datetime import datetime, timedelta
import json
import logging
from pathlib import Path
import joblib
from collections import defaultdict
import warnings
warnings.filterwarnings('ignore')

# ML Libraries
try:
    from sklearn.metrics.pairwise import cosine_similarity
    from sklearn.decomposition import NMF, TruncatedSVD
    from sklearn.cluster import KMeans
    from sklearn.preprocessing import StandardScaler
    from sklearn.model_selection import train_test_split
    from sklearn.linear_model import LinearRegression, Ridge
    from sklearn.ensemble import RandomForestRegressor
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    logging.warning("sklearn not available for personalization")

# Deep Learning Libraries
try:
    import tensorflow as tf
    from tensorflow.keras.models import Sequential, Model
    from tensorflow.keras.layers import Dense, Embedding, Flatten, Input, Concatenate
    from tensorflow.keras.optimizers import Adam
    from tensorflow.keras.callbacks import EarlyStopping
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False
    logging.warning("TensorFlow not available for personalization")

logger = logging.getLogger(__name__)

class UserSimilarityEngine:
    """Engine for finding similar users based on triggers, symptoms, and responses"""
    
    def __init__(self):
        self.user_profiles = {}
        self.user_symptoms = defaultdict(list)
        self.user_responses = defaultdict(list)
        self.similarity_matrix = None
        self.scaler = StandardScaler() if SKLEARN_AVAILABLE else None
        
    def add_user_profile(self, user_id: str, profile: Dict):
        """Add user profile for similarity calculation"""
        self.user_profiles[user_id] = profile
        
    def add_symptom_data(self, user_id: str, date: str, symptoms: List[str], severity: int, triggers: List[str]):
        """Add symptom data for user"""
        self.user_symptoms[user_id].append({
            'date': date,
            'symptoms': symptoms,
            'severity': severity,
            'triggers': triggers,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    def add_response_data(self, user_id: str, date: str, prediction_accuracy: float, user_rating: int):
        """Add user response data for personalization"""
        self.user_responses[user_id].append({
            'date': date,
            'prediction_accuracy': prediction_accuracy,
            'user_rating': user_rating,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    def calculate_user_similarity(self, user_id: str, n_similar: int = 5) -> List[Dict]:
        """Calculate similarity between users based on profiles and behavior"""
        try:
            if user_id not in self.user_profiles:
                return []
            
            target_profile = self.user_profiles[user_id]
            similarities = []
            
            for other_user_id, other_profile in self.user_profiles.items():
                if other_user_id == user_id:
                    continue
                
                # Calculate profile similarity
                profile_sim = self._calculate_profile_similarity(target_profile, other_profile)
                
                # Calculate behavior similarity
                behavior_sim = self._calculate_behavior_similarity(user_id, other_user_id)
                
                # Combined similarity
                combined_sim = (profile_sim * 0.6) + (behavior_sim * 0.4)
                
                similarities.append({
                    'user_id': other_user_id,
                    'similarity_score': combined_sim,
                    'profile_similarity': profile_sim,
                    'behavior_similarity': behavior_sim
                })
            
            # Sort by similarity and return top N
            similarities.sort(key=lambda x: x['similarity_score'], reverse=True)
            return similarities[:n_similar]
            
        except Exception as e:
            logger.error(f"Error calculating user similarity: {e}")
            return []
    
    def _calculate_profile_similarity(self, profile1: Dict, profile2: Dict) -> float:
        """Calculate similarity between user profiles"""
        try:
            # Asthma severity similarity
            severity_map = {'none': 0, 'mild': 1, 'moderate': 2, 'severe': 3, 'very_severe': 4}
            severity1 = severity_map.get(profile1.get('asthma_severity', 'none'), 0)
            severity2 = severity_map.get(profile2.get('asthma_severity', 'none'), 0)
            severity_sim = 1.0 - abs(severity1 - severity2) / 4.0
            
            # Age similarity (normalized)
            age1 = profile1.get('age', 30)
            age2 = profile2.get('age', 30)
            age_sim = 1.0 - abs(age1 - age2) / 50.0  # Assume max age difference of 50
            
            # Allergies similarity (Jaccard)
            allergies1 = set(profile1.get('allergies', []))
            allergies2 = set(profile2.get('allergies', []))
            if allergies1 or allergies2:
                allergy_sim = len(allergies1.intersection(allergies2)) / len(allergies1.union(allergies2))
            else:
                allergy_sim = 1.0
            
            # Triggers similarity (Jaccard)
            triggers1 = set(profile1.get('triggers', []))
            triggers2 = set(profile2.get('triggers', []))
            if triggers1 or triggers2:
                trigger_sim = len(triggers1.intersection(triggers2)) / len(triggers1.union(triggers2))
            else:
                trigger_sim = 1.0
            
            # Weighted average
            total_sim = (
                severity_sim * 0.3 +
                age_sim * 0.2 +
                allergy_sim * 0.25 +
                trigger_sim * 0.25
            )
            
            return max(0.0, min(1.0, total_sim))
            
        except Exception as e:
            logger.error(f"Error calculating profile similarity: {e}")
            return 0.0
    
    def _calculate_behavior_similarity(self, user1_id: str, user2_id: str) -> float:
        """Calculate similarity based on user behavior and responses"""
        try:
            # Get recent symptoms (last 30 days)
            recent_symptoms1 = self._get_recent_symptoms(user1_id, days=30)
            recent_symptoms2 = self._get_recent_symptoms(user2_id, days=30)
            
            if not recent_symptoms1 or not recent_symptoms2:
                return 0.5  # Default similarity if no data
            
            # Calculate symptom pattern similarity
            symptom_sim = self._calculate_symptom_pattern_similarity(recent_symptoms1, recent_symptoms2)
            
            # Calculate response pattern similarity
            response_sim = self._calculate_response_pattern_similarity(user1_id, user2_id)
            
            return (symptom_sim + response_sim) / 2.0
            
        except Exception as e:
            logger.error(f"Error calculating behavior similarity: {e}")
            return 0.0
    
    def _get_recent_symptoms(self, user_id: str, days: int = 30) -> List[Dict]:
        """Get recent symptoms for a user"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        recent_symptoms = []
        
        for symptom_data in self.user_symptoms[user_id]:
            try:
                symptom_date = datetime.fromisoformat(symptom_data['date'].replace('Z', '+00:00'))
                if symptom_date >= cutoff_date:
                    recent_symptoms.append(symptom_data)
            except:
                continue
        
        return recent_symptoms
    
    def _calculate_symptom_pattern_similarity(self, symptoms1: List[Dict], symptoms2: List[Dict]) -> float:
        """Calculate similarity in symptom patterns"""
        try:
            # Extract symptom frequencies
            symptoms1_freq = defaultdict(int)
            symptoms2_freq = defaultdict(int)
            
            for symptom_data in symptoms1:
                for symptom in symptom_data.get('symptoms', []):
                    symptoms1_freq[symptom] += 1
            
            for symptom_data in symptoms2:
                for symptom in symptom_data.get('symptoms', []):
                    symptoms2_freq[symptom] += 1
            
            # Calculate cosine similarity
            all_symptoms = set(symptoms1_freq.keys()).union(set(symptoms2_freq.keys()))
            if not all_symptoms:
                return 0.5
            
            vec1 = [symptoms1_freq[symptom] for symptom in all_symptoms]
            vec2 = [symptoms2_freq[symptom] for symptom in all_symptoms]
            
            if SKLEARN_AVAILABLE:
                similarity = cosine_similarity([vec1], [vec2])[0][0]
            else:
                # Manual cosine similarity calculation
                dot_product = sum(a * b for a, b in zip(vec1, vec2))
                norm1 = sum(a * a for a in vec1) ** 0.5
                norm2 = sum(b * b for b in vec2) ** 0.5
                similarity = dot_product / (norm1 * norm2) if norm1 * norm2 > 0 else 0
            
            return max(0.0, min(1.0, similarity))
            
        except Exception as e:
            logger.error(f"Error calculating symptom pattern similarity: {e}")
            return 0.0
    
    def _calculate_response_pattern_similarity(self, user1_id: str, user2_id: str) -> float:
        """Calculate similarity in user response patterns"""
        try:
            responses1 = self.user_responses[user1_id]
            responses2 = self.user_responses[user2_id]
            
            if not responses1 or not responses2:
                return 0.5
            
            # Calculate average rating similarity
            avg_rating1 = np.mean([r['user_rating'] for r in responses1])
            avg_rating2 = np.mean([r['user_rating'] for r in responses2])
            rating_sim = 1.0 - abs(avg_rating1 - avg_rating2) / 5.0  # 5-point scale
            
            # Calculate accuracy similarity
            avg_accuracy1 = np.mean([r['prediction_accuracy'] for r in responses1])
            avg_accuracy2 = np.mean([r['prediction_accuracy'] for r in responses2])
            accuracy_sim = 1.0 - abs(avg_accuracy1 - avg_accuracy2) / 1.0  # 0-1 scale
            
            return (rating_sim + accuracy_sim) / 2.0
            
        except Exception as e:
            logger.error(f"Error calculating response pattern similarity: {e}")
            return 0.0

class CollaborativeFilteringEngine:
    """Collaborative filtering for personalized recommendations"""
    
    def __init__(self):
        self.user_item_matrix = None
        self.user_factors = None
        self.item_factors = None
        self.user_embeddings = {}
        self.item_embeddings = {}
        self.scaler = StandardScaler() if SKLEARN_AVAILABLE else None
        
    def build_user_item_matrix(self, user_data: Dict[str, List[Dict]]):
        """Build user-item matrix from user interaction data"""
        try:
            # Extract unique users and items (environmental conditions)
            users = list(user_data.keys())
            items = set()
            
            for user_symptoms in user_data.values():
                for symptom_data in user_symptoms:
                    # Use environmental conditions as items
                    triggers = symptom_data.get('triggers', [])
                    items.update(triggers)
            
            items = list(items)
            
            # Build matrix
            matrix = np.zeros((len(users), len(items)))
            user_to_idx = {user: idx for idx, user in enumerate(users)}
            item_to_idx = {item: idx for idx, item in enumerate(items)}
            
            for user, user_symptoms in user_data.items():
                user_idx = user_to_idx[user]
                for symptom_data in user_symptoms:
                    severity = symptom_data.get('severity', 0)
                    triggers = symptom_data.get('triggers', [])
                    
                    for trigger in triggers:
                        item_idx = item_to_idx[trigger]
                        # Use severity as rating (0-5 scale)
                        matrix[user_idx, item_idx] = max(matrix[user_idx, item_idx], severity)
            
            self.user_item_matrix = matrix
            self.user_to_idx = user_to_idx
            self.item_to_idx = item_to_idx
            self.users = users
            self.items = items
            
            logger.info(f"Built user-item matrix: {len(users)} users, {len(items)} items")
            
        except Exception as e:
            logger.error(f"Error building user-item matrix: {e}")
    
    def train_matrix_factorization(self, n_factors: int = 50):
        """Train matrix factorization model"""
        try:
            if self.user_item_matrix is None or not SKLEARN_AVAILABLE:
                return
            
            # Use NMF for matrix factorization
            nmf = NMF(n_components=n_factors, random_state=42, max_iter=200)
            self.user_factors = nmf.fit_transform(self.user_item_matrix)
            self.item_factors = nmf.components_
            
            logger.info(f"Trained matrix factorization with {n_factors} factors")
            
        except Exception as e:
            logger.error(f"Error training matrix factorization: {e}")
    
    def get_personalized_recommendations(self, user_id: str, n_recommendations: int = 5) -> List[Dict]:
        """Get personalized recommendations for a user"""
        try:
            if user_id not in self.user_to_idx:
                return []
            
            user_idx = self.user_to_idx[user_id]
            user_vector = self.user_factors[user_idx]
            
            # Calculate scores for all items
            item_scores = np.dot(user_vector, self.item_factors)
            
            # Get top recommendations
            top_items = np.argsort(item_scores)[::-1][:n_recommendations]
            
            recommendations = []
            for item_idx in top_items:
                item_name = self.items[item_idx]
                score = item_scores[item_idx]
                
                recommendations.append({
                    'trigger': item_name,
                    'risk_score': float(score),
                    'recommendation': self._generate_trigger_recommendation(item_name, score)
                })
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error getting personalized recommendations: {e}")
            return []
    
    def _generate_trigger_recommendation(self, trigger: str, score: float) -> str:
        """Generate recommendation text for a trigger"""
        if score >= 4.0:
            return f"High risk for {trigger}. Avoid exposure and monitor symptoms closely."
        elif score >= 3.0:
            return f"Moderate risk for {trigger}. Limit exposure and have rescue medication ready."
        elif score >= 2.0:
            return f"Low-moderate risk for {trigger}. Monitor conditions and be prepared."
        else:
            return f"Low risk for {trigger}. Normal precautions should be sufficient."

class MetaLearningEngine:
    """Meta-learning engine for rapid personalization with few examples"""
    
    def __init__(self):
        self.meta_model = None
        self.user_adaptation_models = {}
        self.scaler = StandardScaler() if SKLEARN_AVAILABLE else None
        
    def train_meta_model(self, all_user_data: Dict[str, List[Dict]]):
        """Train meta-model on all user data"""
        try:
            if not SKLEARN_AVAILABLE:
                return
            
            # Prepare training data
            X_meta = []
            y_meta = []
            
            for user_id, user_data in all_user_data.items():
                if len(user_data) < 3:  # Need at least 3 examples
                    continue
                
                # Extract features from user's first few examples
                user_features = self._extract_user_meta_features(user_data[:3])
                X_meta.append(user_features)
                
                # Target: average performance on remaining examples
                remaining_data = user_data[3:]
                if remaining_data:
                    avg_performance = np.mean([d.get('prediction_accuracy', 0.5) for d in remaining_data])
                    y_meta.append(avg_performance)
            
            if len(X_meta) < 5:  # Need at least 5 users
                return
            
            # Train meta-model
            X_meta = np.array(X_meta)
            y_meta = np.array(y_meta)
            
            if self.scaler is not None:
                X_meta = self.scaler.fit_transform(X_meta)
            
            self.meta_model = RandomForestRegressor(n_estimators=100, random_state=42)
            self.meta_model.fit(X_meta, y_meta)
            
            logger.info(f"Trained meta-model on {len(X_meta)} users")
            
        except Exception as e:
            logger.error(f"Error training meta-model: {e}")
    
    def _extract_user_meta_features(self, user_data: List[Dict]) -> List[float]:
        """Extract meta-features from user's initial data"""
        try:
            features = []
            
            # Symptom frequency features
            all_symptoms = []
            all_triggers = []
            severities = []
            
            for data in user_data:
                all_symptoms.extend(data.get('symptoms', []))
                all_triggers.extend(data.get('triggers', []))
                severities.append(data.get('severity', 0))
            
            # Symptom diversity
            features.append(len(set(all_symptoms)) / max(1, len(all_symptoms)))
            
            # Trigger diversity
            features.append(len(set(all_triggers)) / max(1, len(all_triggers)))
            
            # Average severity
            features.append(np.mean(severities) if severities else 0)
            
            # Severity variance
            features.append(np.var(severities) if len(severities) > 1 else 0)
            
            # Response consistency
            accuracies = [d.get('prediction_accuracy', 0.5) for d in user_data]
            features.append(np.var(accuracies) if len(accuracies) > 1 else 0)
            
            return features
            
        except Exception as e:
            logger.error(f"Error extracting meta-features: {e}")
            return [0.0] * 5
    
    def adapt_to_new_user(self, user_id: str, initial_data: List[Dict]) -> Dict:
        """Adapt model to new user with few examples"""
        try:
            if len(initial_data) < 2:
                return {"adaptation_score": 0.5, "recommendations": []}
            
            # Extract meta-features
            meta_features = self._extract_user_meta_features(initial_data)
            
            # Predict adaptation potential
            if self.meta_model is not None and self.scaler is not None:
                meta_features_scaled = self.scaler.transform([meta_features])
                adaptation_score = self.meta_model.predict(meta_features_scaled)[0]
            else:
                adaptation_score = 0.5
            
            # Generate personalized recommendations
            recommendations = self._generate_adaptive_recommendations(initial_data, adaptation_score)
            
            return {
                "adaptation_score": float(adaptation_score),
                "recommendations": recommendations,
                "confidence": min(0.9, 0.5 + adaptation_score * 0.4)
            }
            
        except Exception as e:
            logger.error(f"Error adapting to new user: {e}")
            return {"adaptation_score": 0.5, "recommendations": []}
    
    def _generate_adaptive_recommendations(self, initial_data: List[Dict], adaptation_score: float) -> List[str]:
        """Generate adaptive recommendations based on initial data"""
        try:
            recommendations = []
            
            # Analyze patterns in initial data
            all_symptoms = []
            all_triggers = []
            severities = []
            
            for data in initial_data:
                all_symptoms.extend(data.get('symptoms', []))
                all_triggers.extend(data.get('triggers', []))
                severities.append(data.get('severity', 0))
            
            # High adaptation score recommendations
            if adaptation_score > 0.7:
                recommendations.append("Your patterns are well-suited for personalized predictions.")
                recommendations.append("The system will quickly learn your specific triggers and responses.")
            elif adaptation_score > 0.5:
                recommendations.append("Moderate personalization potential detected.")
                recommendations.append("Continue logging symptoms for better accuracy.")
            else:
                recommendations.append("Your patterns are unique - the system will need more data.")
                recommendations.append("Focus on consistent symptom logging for better predictions.")
            
            # Trigger-specific recommendations
            if all_triggers:
                common_triggers = list(set(all_triggers))
                recommendations.append(f"Common triggers detected: {', '.join(common_triggers[:3])}")
            
            # Severity-based recommendations
            if severities:
                avg_severity = np.mean(severities)
                if avg_severity > 3:
                    recommendations.append("High severity symptoms detected - prioritize trigger avoidance.")
                elif avg_severity > 2:
                    recommendations.append("Moderate severity - monitor conditions closely.")
                else:
                    recommendations.append("Low severity patterns - maintain current precautions.")
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error generating adaptive recommendations: {e}")
            return ["Continue logging symptoms for personalized predictions."]

class PersonalizationEngine:
    """Main personalization engine combining all approaches"""
    
    def __init__(self):
        self.similarity_engine = UserSimilarityEngine()
        self.collaborative_engine = CollaborativeFilteringEngine()
        self.meta_learning_engine = MetaLearningEngine()
        self.models_path = Path("backend/models/personalization")
        self.models_path.mkdir(parents=True, exist_ok=True)
        
    def add_user_data(self, user_id: str, profile: Dict, symptoms: List[Dict], responses: List[Dict]):
        """Add comprehensive user data for personalization"""
        try:
            # Add to similarity engine
            self.similarity_engine.add_user_profile(user_id, profile)
            
            for symptom_data in symptoms:
                self.similarity_engine.add_symptom_data(
                    user_id,
                    symptom_data.get('date', ''),
                    symptom_data.get('symptoms', []),
                    symptom_data.get('severity', 0),
                    symptom_data.get('triggers', [])
                )
            
            for response_data in responses:
                self.similarity_engine.add_response_data(
                    user_id,
                    response_data.get('date', ''),
                    response_data.get('prediction_accuracy', 0.5),
                    response_data.get('user_rating', 3)
                )
            
            logger.info(f"Added data for user {user_id}")
            
        except Exception as e:
            logger.error(f"Error adding user data: {e}")
    
    def get_personalized_insights(self, user_id: str) -> Dict:
        """Get comprehensive personalized insights for a user"""
        try:
            insights = {
                "similar_users": [],
                "personalized_recommendations": [],
                "adaptation_analysis": {},
                "risk_patterns": []
            }
            
            # Get similar users
            similar_users = self.similarity_engine.calculate_user_similarity(user_id, n_similar=3)
            insights["similar_users"] = similar_users
            
            # Get personalized recommendations
            if self.collaborative_engine.user_item_matrix is not None:
                recommendations = self.collaborative_engine.get_personalized_recommendations(user_id)
                insights["personalized_recommendations"] = recommendations
            
            # Get adaptation analysis
            user_symptoms = self.similarity_engine.user_symptoms[user_id]
            if len(user_symptoms) >= 2:
                adaptation = self.meta_learning_engine.adapt_to_new_user(user_id, user_symptoms[:5])
                insights["adaptation_analysis"] = adaptation
            
            # Analyze risk patterns
            risk_patterns = self._analyze_risk_patterns(user_id)
            insights["risk_patterns"] = risk_patterns
            
            return insights
            
        except Exception as e:
            logger.error(f"Error getting personalized insights: {e}")
            return {"error": "Failed to generate personalized insights"}
    
    def _analyze_risk_patterns(self, user_id: str) -> List[Dict]:
        """Analyze risk patterns for a user"""
        try:
            user_symptoms = self.similarity_engine.user_symptoms[user_id]
            if not user_symptoms:
                return []
            
            # Analyze trigger patterns
            trigger_frequency = defaultdict(int)
            trigger_severity = defaultdict(list)
            
            for symptom_data in user_symptoms:
                triggers = symptom_data.get('triggers', [])
                severity = symptom_data.get('severity', 0)
                
                for trigger in triggers:
                    trigger_frequency[trigger] += 1
                    trigger_severity[trigger].append(severity)
            
            # Create risk patterns
            patterns = []
            for trigger, frequency in trigger_frequency.items():
                avg_severity = np.mean(trigger_severity[trigger])
                patterns.append({
                    "trigger": trigger,
                    "frequency": frequency,
                    "average_severity": float(avg_severity),
                    "risk_level": "high" if avg_severity > 3 else "moderate" if avg_severity > 2 else "low"
                })
            
            # Sort by risk level
            patterns.sort(key=lambda x: x["average_severity"], reverse=True)
            return patterns[:5]  # Top 5 patterns
            
        except Exception as e:
            logger.error(f"Error analyzing risk patterns: {e}")
            return []
    
    def train_models(self, all_user_data: Dict[str, Dict]):
        """Train all personalization models"""
        try:
            # Prepare data for collaborative filtering
            user_symptom_data = {}
            for user_id, user_data in all_user_data.items():
                user_symptom_data[user_id] = user_data.get('symptoms', [])
            
            # Train collaborative filtering
            self.collaborative_engine.build_user_item_matrix(user_symptom_data)
            self.collaborative_engine.train_matrix_factorization()
            
            # Train meta-learning
            self.meta_learning_engine.train_meta_model(user_symptom_data)
            
            logger.info("Personalization models trained successfully")
            
        except Exception as e:
            logger.error(f"Error training personalization models: {e}")
    
    def save_models(self):
        """Save trained models"""
        try:
            # Save collaborative filtering model
            if self.collaborative_engine.user_item_matrix is not None:
                cf_path = self.models_path / "collaborative_filtering.joblib"
                joblib.dump({
                    'user_item_matrix': self.collaborative_engine.user_item_matrix,
                    'user_factors': self.collaborative_engine.user_factors,
                    'item_factors': self.collaborative_engine.item_factors,
                    'user_to_idx': self.collaborative_engine.user_to_idx,
                    'item_to_idx': self.collaborative_engine.item_to_idx,
                    'users': self.collaborative_engine.users,
                    'items': self.collaborative_engine.items
                }, cf_path)
            
            # Save meta-learning model
            if self.meta_learning_engine.meta_model is not None:
                meta_path = self.models_path / "meta_learning.joblib"
                joblib.dump({
                    'meta_model': self.meta_learning_engine.meta_model,
                    'scaler': self.meta_learning_engine.scaler
                }, meta_path)
            
            logger.info("Personalization models saved successfully")
            
        except Exception as e:
            logger.error(f"Error saving personalization models: {e}")

# Global instance
personalization_engine = PersonalizationEngine()
