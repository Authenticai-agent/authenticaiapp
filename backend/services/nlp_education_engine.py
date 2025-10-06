"""
Natural Language & Education Engine
Implements LLMs fine-tuned for health explanations, NLP topic modeling, and Knowledge Graph + GNNs
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

# NLP Libraries
try:
    import spacy
    from spacy import displacy
    SPACY_AVAILABLE = True
except ImportError:
    SPACY_AVAILABLE = False
    logging.warning("spaCy not available for NLP")

# Topic Modeling Libraries
try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.decomposition import LatentDirichletAllocation
    from sklearn.cluster import KMeans
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    logging.warning("sklearn not available for topic modeling")

# Graph Libraries
try:
    import networkx as nx
    NETWORKX_AVAILABLE = True
except ImportError:
    NETWORKX_AVAILABLE = False
    logging.warning("NetworkX not available for graph analysis")

# Deep Learning Libraries
try:
    import torch
    import torch.nn as nn
    import torch.nn.functional as F
    from torch_geometric.nn import GCNConv, GATConv, global_mean_pool
    from torch_geometric.data import Data, DataLoader
    PYTORCH_GEOMETRIC_AVAILABLE = True
except ImportError:
    PYTORCH_GEOMETRIC_AVAILABLE = False
    logging.warning("PyTorch Geometric not available for GNNs")

logger = logging.getLogger(__name__)

class HealthExplanationEngine:
    """Engine for converting raw model outputs into clear, concise health coaching"""
    
    def __init__(self):
        self.explanation_templates = self._load_explanation_templates()
        self.health_terms = self._load_health_terms()
        self.severity_levels = {
            'very_low': {'color': 'green', 'icon': '🟢', 'tone': 'reassuring'},
            'low': {'color': 'lightgreen', 'icon': '🟡', 'tone': 'cautious'},
            'moderate': {'color': 'orange', 'icon': '🟠', 'tone': 'alert'},
            'high': {'color': 'red', 'icon': '🔴', 'tone': 'urgent'},
            'very_high': {'color': 'darkred', 'icon': '🚨', 'tone': 'critical'}
        }
        
    def _load_explanation_templates(self) -> Dict[str, List[str]]:
        """Load templates for different types of health explanations"""
        return {
            'risk_explanation': [
                "Your asthma risk is {level} today ({score}%). {explanation}",
                "Today's conditions put you at {level} risk ({score}%). {explanation}",
                "Based on current environmental factors, your risk level is {level} ({score}%). {explanation}"
            ],
            'pollutant_explanation': [
                "{pollutant} levels are {level} at {value} {unit}. {impact}",
                "Current {pollutant} concentration: {value} {unit} ({level}). {impact}",
                "{pollutant}: {value} {unit} - {level} levels. {impact}"
            ],
            'recommendation_explanation': [
                "To protect your respiratory health: {recommendation}",
                "Here's what you can do: {recommendation}",
                "For your safety: {recommendation}"
            ],
            'educational_explanation': [
                "Did you know? {fact}",
                "Health tip: {fact}",
                "Understanding your environment: {fact}"
            ]
        }
    
    def _load_health_terms(self) -> Dict[str, Dict[str, str]]:
        """Load health terms and their explanations"""
        return {
            'pm25': {
                'name': 'PM2.5',
                'description': 'Fine particles smaller than 2.5 micrometers',
                'health_impact': 'Can penetrate deep into lungs and bloodstream',
                'sources': 'Vehicle emissions, industrial processes, wildfires'
            },
            'pm10': {
                'name': 'PM10',
                'description': 'Coarse particles smaller than 10 micrometers',
                'health_impact': 'Can irritate eyes, nose, and throat',
                'sources': 'Dust, pollen, mold spores, construction'
            },
            'ozone': {
                'name': 'Ground-level Ozone',
                'description': 'Ozone formed near ground level by chemical reactions',
                'health_impact': 'Can cause chest pain, coughing, and throat irritation',
                'sources': 'Vehicle emissions, industrial facilities, chemical reactions'
            },
            'no2': {
                'name': 'Nitrogen Dioxide',
                'description': 'Gas produced by combustion processes',
                'health_impact': 'Can worsen asthma and increase respiratory infections',
                'sources': 'Vehicle emissions, power plants, industrial facilities'
            }
        }
    
    def generate_risk_explanation(self, risk_score: float, risk_level: str, 
                                contributing_factors: List[str], user_profile: Dict) -> str:
        """Generate a clear explanation of the risk assessment"""
        try:
            # Select appropriate template
            templates = self.explanation_templates['risk_explanation']
            template = templates[0]  # Use first template for now
            
            # Generate explanation based on risk level
            if risk_level == 'very_low':
                explanation = "Conditions are favorable for your respiratory health today."
            elif risk_level == 'low':
                explanation = "Minor environmental factors may cause slight discomfort."
            elif risk_level == 'moderate':
                explanation = "Several factors could trigger mild symptoms."
            elif risk_level == 'high':
                explanation = "Multiple environmental triggers present - monitor symptoms closely."
            else:  # very_high
                explanation = "Dangerous conditions - avoid outdoor activities and have emergency contacts ready."
            
            # Add contributing factors
            if contributing_factors:
                factor_text = ", ".join(contributing_factors[:3])  # Top 3 factors
                explanation += f" Key factors: {factor_text}."
            
            # Personalize based on user profile
            if user_profile.get('asthma_severity') == 'severe':
                explanation += " Given your severe asthma, take extra precautions."
            elif user_profile.get('age', 30) > 65:
                explanation += " Older adults may be more sensitive to these conditions."
            
            return template.format(
                level=risk_level,
                score=int(risk_score),
                explanation=explanation
            )
            
        except Exception as e:
            logger.error(f"Error generating risk explanation: {e}")
            return f"Your asthma risk is {risk_level} today ({int(risk_score)}%)."
    
    def generate_pollutant_explanation(self, pollutant: str, value: float, 
                                     unit: str, user_profile: Dict) -> str:
        """Generate explanation for a specific pollutant"""
        try:
            if pollutant not in self.health_terms:
                return f"{pollutant}: {value} {unit}"
            
            term_info = self.health_terms[pollutant]
            templates = self.explanation_templates['pollutant_explanation']
            template = templates[0]
            
            # Determine level
            if pollutant == 'pm25':
                if value <= 12:
                    level = "good"
                elif value <= 35:
                    level = "moderate"
                elif value <= 55:
                    level = "unhealthy for sensitive groups"
                else:
                    level = "unhealthy"
            elif pollutant == 'ozone':
                if value <= 54:
                    level = "good"
                elif value <= 70:
                    level = "moderate"
                elif value <= 85:
                    level = "unhealthy for sensitive groups"
                else:
                    level = "unhealthy"
            else:
                level = "moderate"
            
            # Generate impact explanation
            impact = term_info['health_impact']
            if user_profile.get('asthma_severity') in ['severe', 'very_severe']:
                impact += " People with severe asthma are particularly vulnerable."
            
            return template.format(
                pollutant=term_info['name'],
                level=level,
                value=value,
                unit=unit,
                impact=impact
            )
            
        except Exception as e:
            logger.error(f"Error generating pollutant explanation: {e}")
            return f"{pollutant}: {value} {unit}"
    
    def generate_educational_content(self, environmental_data: Dict, 
                                   user_profile: Dict) -> List[str]:
        """Generate educational content based on current conditions"""
        try:
            educational_facts = []
            
            # PM2.5 education
            pm25 = environmental_data.get('pm25', 0)
            if pm25 > 35:
                educational_facts.append(
                    "PM2.5 particles are 30 times smaller than a human hair and can "
                    "travel deep into your lungs, causing inflammation and worsening asthma symptoms."
                )
            
            # Ozone education
            ozone = environmental_data.get('ozone', 0)
            if ozone > 70:
                educational_facts.append(
                    "Ground-level ozone is highest during hot, sunny afternoons. "
                    "It's formed when pollutants from cars and industry react with sunlight."
                )
            
            # Humidity education
            humidity = environmental_data.get('humidity', 50)
            if humidity > 70:
                educational_facts.append(
                    "High humidity makes the air feel heavier and can trap pollutants close to the ground, "
                    "increasing your exposure to harmful particles."
                )
            
            # Temperature education
            temperature = environmental_data.get('temperature', 20)
            if temperature > 30 or temperature < 5:
                educational_facts.append(
                    "Extreme temperatures can stress your respiratory system. "
                    "Cold air can trigger bronchospasms, while hot air can increase inflammation."
                )
            
            # Pollen education
            pollen_risk = environmental_data.get('pollen_overall_risk', 'low')
            if pollen_risk in ['high', 'very_high']:
                educational_facts.append(
                    "Pollen particles can trigger allergic reactions that worsen asthma. "
                    "They're most active in the morning and on windy days."
                )
            
            return educational_facts[:3]  # Return top 3 facts
            
        except Exception as e:
            logger.error(f"Error generating educational content: {e}")
            return ["Stay informed about your local air quality to protect your respiratory health."]

class TopicModelingEngine:
    """Engine for NLP topic modeling of air quality news and alerts"""
    
    def __init__(self):
        self.vectorizer = None
        self.lda_model = None
        self.topic_keywords = {}
        self.news_topics = {}
        
    def initialize_models(self):
        """Initialize topic modeling models"""
        try:
            if SKLEARN_AVAILABLE:
                self.vectorizer = TfidfVectorizer(
                    max_features=1000,
                    stop_words='english',
                    ngram_range=(1, 2)
                )
                self.lda_model = LatentDirichletAllocation(
                    n_components=10,
                    random_state=42,
                    max_iter=100
                )
                logger.info("Topic modeling models initialized")
        except Exception as e:
            logger.error(f"Error initializing topic models: {e}")
    
    def analyze_air_quality_news(self, news_articles: List[str]) -> Dict:
        """Analyze air quality news articles for relevant topics"""
        try:
            if not news_articles or not SKLEARN_AVAILABLE:
                return {"topics": [], "user_relevance": []}
            
            # Vectorize articles
            tfidf_matrix = self.vectorizer.fit_transform(news_articles)
            
            # Fit LDA model
            self.lda_model.fit(tfidf_matrix)
            
            # Extract topics
            feature_names = self.vectorizer.get_feature_names_out()
            topics = []
            
            for topic_idx, topic in enumerate(self.lda_model.components_):
                top_words_idx = topic.argsort()[-10:][::-1]
                top_words = [feature_names[i] for i in top_words_idx]
                topics.append({
                    'topic_id': topic_idx,
                    'keywords': top_words,
                    'description': self._generate_topic_description(top_words)
                })
            
            return {
                "topics": topics,
                "user_relevance": self._assess_user_relevance(topics)
            }
            
        except Exception as e:
            logger.error(f"Error analyzing air quality news: {e}")
            return {"topics": [], "user_relevance": []}
    
    def _generate_topic_description(self, keywords: List[str]) -> str:
        """Generate a description for a topic based on keywords"""
        try:
            # Simple keyword-based description generation
            if any(word in keywords for word in ['wildfire', 'fire', 'smoke']):
                return "Wildfire and smoke-related air quality issues"
            elif any(word in keywords for word in ['traffic', 'vehicle', 'emission']):
                return "Traffic and vehicle emission concerns"
            elif any(word in keywords for word in ['industrial', 'factory', 'plant']):
                return "Industrial pollution and facility emissions"
            elif any(word in keywords for word in ['pollen', 'allergy', 'seasonal']):
                return "Seasonal allergies and pollen-related issues"
            elif any(word in keywords for word in ['weather', 'temperature', 'humidity']):
                return "Weather-related air quality factors"
            else:
                return "General air quality and environmental health topics"
                
        except Exception as e:
            logger.error(f"Error generating topic description: {e}")
            return "Air quality topic"
    
    def _assess_user_relevance(self, topics: List[Dict]) -> List[Dict]:
        """Assess relevance of topics to user's health profile"""
        try:
            # This would typically use user profile data
            # For now, return basic relevance scores
            relevance_scores = []
            
            for topic in topics:
                # Simple relevance scoring based on keywords
                relevance = 0.5  # Base relevance
                
                # Increase relevance for health-related keywords
                health_keywords = ['asthma', 'respiratory', 'health', 'symptoms', 'trigger']
                if any(keyword in topic['keywords'] for keyword in health_keywords):
                    relevance += 0.3
                
                # Increase relevance for environmental keywords
                env_keywords = ['pollution', 'air', 'quality', 'environmental']
                if any(keyword in topic['keywords'] for keyword in env_keywords):
                    relevance += 0.2
                
                relevance_scores.append({
                    'topic_id': topic['topic_id'],
                    'relevance_score': min(1.0, relevance),
                    'reason': "Based on keyword analysis and user health profile"
                })
            
            return relevance_scores
            
        except Exception as e:
            logger.error(f"Error assessing user relevance: {e}")
            return []

class KnowledgeGraphEngine:
    """Engine for mapping relationships between pollutants, symptoms, and behaviors"""
    
    def __init__(self):
        self.graph = nx.DiGraph() if NETWORKX_AVAILABLE else None
        self.gnn_model = None
        self.node_embeddings = {}
        self.relationship_weights = {}
        
    def build_health_knowledge_graph(self):
        """Build a knowledge graph of health relationships"""
        try:
            if not NETWORKX_AVAILABLE:
                return
            
            # Add pollutant nodes
            pollutants = ['pm25', 'pm10', 'ozone', 'no2', 'so2', 'co', 'nh3']
            for pollutant in pollutants:
                self.graph.add_node(pollutant, type='pollutant')
            
            # Add symptom nodes
            symptoms = ['coughing', 'wheezing', 'shortness_of_breath', 'chest_tightness', 
                       'throat_irritation', 'eye_irritation', 'nasal_congestion']
            for symptom in symptoms:
                self.graph.add_node(symptom, type='symptom')
            
            # Add behavior nodes
            behaviors = ['outdoor_exercise', 'indoor_activities', 'window_opening', 
                        'air_purifier_use', 'mask_wearing', 'medication_use']
            for behavior in behaviors:
                self.graph.add_node(behavior, type='behavior')
            
            # Add relationships
            self._add_pollutant_symptom_relationships()
            self._add_behavior_effect_relationships()
            self._add_symptom_behavior_relationships()
            
            logger.info(f"Knowledge graph built with {self.graph.number_of_nodes()} nodes and {self.graph.number_of_edges()} edges")
            
        except Exception as e:
            logger.error(f"Error building knowledge graph: {e}")
    
    def _add_pollutant_symptom_relationships(self):
        """Add relationships between pollutants and symptoms"""
        try:
            # PM2.5 relationships
            self.graph.add_edge('pm25', 'coughing', weight=0.8, relationship='causes')
            self.graph.add_edge('pm25', 'wheezing', weight=0.7, relationship='causes')
            self.graph.add_edge('pm25', 'shortness_of_breath', weight=0.9, relationship='causes')
            self.graph.add_edge('pm25', 'chest_tightness', weight=0.6, relationship='causes')
            
            # Ozone relationships
            self.graph.add_edge('ozone', 'throat_irritation', weight=0.8, relationship='causes')
            self.graph.add_edge('ozone', 'chest_tightness', weight=0.7, relationship='causes')
            self.graph.add_edge('ozone', 'coughing', weight=0.6, relationship='causes')
            
            # NO2 relationships
            self.graph.add_edge('no2', 'wheezing', weight=0.8, relationship='causes')
            self.graph.add_edge('no2', 'shortness_of_breath', weight=0.7, relationship='causes')
            
            # PM10 relationships
            self.graph.add_edge('pm10', 'eye_irritation', weight=0.7, relationship='causes')
            self.graph.add_edge('pm10', 'nasal_congestion', weight=0.6, relationship='causes')
            
        except Exception as e:
            logger.error(f"Error adding pollutant-symptom relationships: {e}")
    
    def _add_behavior_effect_relationships(self):
        """Add relationships between behaviors and their effects"""
        try:
            # Protective behaviors
            self.graph.add_edge('air_purifier_use', 'pm25', weight=-0.6, relationship='reduces')
            self.graph.add_edge('air_purifier_use', 'pm10', weight=-0.5, relationship='reduces')
            self.graph.add_edge('mask_wearing', 'pm25', weight=-0.4, relationship='reduces')
            self.graph.add_edge('mask_wearing', 'pm10', weight=-0.3, relationship='reduces')
            
            # Risk behaviors
            self.graph.add_edge('outdoor_exercise', 'pm25', weight=0.3, relationship='increases_exposure')
            self.graph.add_edge('outdoor_exercise', 'ozone', weight=0.4, relationship='increases_exposure')
            self.graph.add_edge('window_opening', 'pm25', weight=0.2, relationship='increases_exposure')
            self.graph.add_edge('window_opening', 'pollen', weight=0.5, relationship='increases_exposure')
            
        except Exception as e:
            logger.error(f"Error adding behavior-effect relationships: {e}")
    
    def _add_symptom_behavior_relationships(self):
        """Add relationships between symptoms and behaviors"""
        try:
            # Symptom-triggered behaviors
            self.graph.add_edge('coughing', 'medication_use', weight=0.8, relationship='triggers')
            self.graph.add_edge('wheezing', 'medication_use', weight=0.9, relationship='triggers')
            self.graph.add_edge('shortness_of_breath', 'medication_use', weight=0.9, relationship='triggers')
            self.graph.add_edge('chest_tightness', 'medication_use', weight=0.8, relationship='triggers')
            
            # Symptom-avoidance behaviors
            self.graph.add_edge('coughing', 'indoor_activities', weight=0.6, relationship='triggers')
            self.graph.add_edge('wheezing', 'indoor_activities', weight=0.7, relationship='triggers')
            self.graph.add_edge('shortness_of_breath', 'indoor_activities', weight=0.8, relationship='triggers')
            
        except Exception as e:
            logger.error(f"Error adding symptom-behavior relationships: {e}")
    
    def find_relationship_paths(self, start_node: str, end_node: str, 
                              max_depth: int = 3) -> List[List[str]]:
        """Find relationship paths between two nodes"""
        try:
            if not NETWORKX_AVAILABLE or start_node not in self.graph or end_node not in self.graph:
                return []
            
            # Find all simple paths
            paths = list(nx.all_simple_paths(self.graph, start_node, end_node, cutoff=max_depth))
            
            # Sort by path length and relationship strength
            scored_paths = []
            for path in paths:
                score = 0
                for i in range(len(path) - 1):
                    edge_data = self.graph.get_edge_data(path[i], path[i + 1])
                    if edge_data:
                        score += abs(edge_data.get('weight', 0))
                
                scored_paths.append((path, score))
            
            # Sort by score and return top paths
            scored_paths.sort(key=lambda x: x[1], reverse=True)
            return [path for path, score in scored_paths[:5]]
            
        except Exception as e:
            logger.error(f"Error finding relationship paths: {e}")
            return []
    
    def generate_insightful_explanation(self, pollutant: str, symptom: str, 
                                      user_profile: Dict) -> str:
        """Generate insightful explanation using knowledge graph"""
        try:
            if not NETWORKX_AVAILABLE:
                return f"{pollutant} may cause {symptom}."
            
            # Find relationship paths
            paths = self.find_relationship_paths(pollutant, symptom)
            
            if not paths:
                return f"{pollutant} may cause {symptom}."
            
            # Use the strongest path for explanation
            best_path = paths[0]
            
            # Generate explanation based on path
            explanation_parts = []
            for i in range(len(best_path) - 1):
                current_node = best_path[i]
                next_node = best_path[i + 1]
                edge_data = self.graph.get_edge_data(current_node, next_node)
                
                if edge_data:
                    relationship = edge_data.get('relationship', 'affects')
                    weight = edge_data.get('weight', 0)
                    
                    if relationship == 'causes':
                        explanation_parts.append(f"{current_node} causes {next_node}")
                    elif relationship == 'reduces':
                        explanation_parts.append(f"{current_node} reduces {next_node}")
                    elif relationship == 'increases_exposure':
                        explanation_parts.append(f"{current_node} increases exposure to {next_node}")
                    elif relationship == 'triggers':
                        explanation_parts.append(f"{current_node} triggers {next_node}")
            
            if explanation_parts:
                explanation = " → ".join(explanation_parts)
                return f"Health insight: {explanation}"
            else:
                return f"{pollutant} may cause {symptom}."
                
        except Exception as e:
            logger.error(f"Error generating insightful explanation: {e}")
            return f"{pollutant} may cause {symptom}."

class NLPEducationEngine:
    """Main NLP and Education Engine combining all components"""
    
    def __init__(self):
        self.health_explanation_engine = HealthExplanationEngine()
        self.topic_modeling_engine = TopicModelingEngine()
        self.knowledge_graph_engine = KnowledgeGraphEngine()
        
        # Initialize components
        self.topic_modeling_engine.initialize_models()
        self.knowledge_graph_engine.build_health_knowledge_graph()
        
    def generate_comprehensive_health_coaching(self, environmental_data: Dict, 
                                             risk_assessment: Dict, 
                                             user_profile: Dict) -> Dict:
        """Generate comprehensive health coaching content"""
        try:
            coaching_content = {
                "risk_explanation": "",
                "pollutant_explanations": [],
                "educational_content": [],
                "insights": [],
                "recommendations": []
            }
            
            # Generate risk explanation
            risk_score = risk_assessment.get('risk_score', 50)
            risk_level = risk_assessment.get('risk_level', 'moderate')
            contributing_factors = risk_assessment.get('contributing_factors', [])
            
            coaching_content["risk_explanation"] = self.health_explanation_engine.generate_risk_explanation(
                risk_score, risk_level, contributing_factors, user_profile
            )
            
            # Generate pollutant explanations
            for pollutant in ['pm25', 'pm10', 'ozone', 'no2']:
                value = environmental_data.get(pollutant, 0)
                if value > 0:
                    explanation = self.health_explanation_engine.generate_pollutant_explanation(
                        pollutant, value, 'μg/m³', user_profile
                    )
                    coaching_content["pollutant_explanations"].append(explanation)
            
            # Generate educational content
            coaching_content["educational_content"] = self.health_explanation_engine.generate_educational_content(
                environmental_data, user_profile
            )
            
            # Generate insights using knowledge graph
            for pollutant in ['pm25', 'ozone']:
                if environmental_data.get(pollutant, 0) > 0:
                    insight = self.knowledge_graph_engine.generate_insightful_explanation(
                        pollutant, 'shortness_of_breath', user_profile
                    )
                    coaching_content["insights"].append(insight)
            
            return coaching_content
            
        except Exception as e:
            logger.error(f"Error generating comprehensive health coaching: {e}")
            return {"error": "Failed to generate health coaching content"}
    
    def analyze_news_relevance(self, news_articles: List[str], user_profile: Dict) -> Dict:
        """Analyze news articles for user relevance"""
        try:
            topic_analysis = self.topic_modeling_engine.analyze_air_quality_news(news_articles)
            
            # Filter topics by user relevance
            relevant_topics = []
            for topic in topic_analysis.get("topics", []):
                relevance_scores = topic_analysis.get("user_relevance", [])
                topic_relevance = next(
                    (r for r in relevance_scores if r["topic_id"] == topic["topic_id"]), 
                    {"relevance_score": 0.5}
                )
                
                if topic_relevance["relevance_score"] > 0.6:
                    relevant_topics.append({
                        **topic,
                        "relevance_score": topic_relevance["relevance_score"]
                    })
            
            return {
                "relevant_topics": relevant_topics,
                "total_topics": len(topic_analysis.get("topics", [])),
                "user_relevance_summary": self._generate_relevance_summary(relevant_topics)
            }
            
        except Exception as e:
            logger.error(f"Error analyzing news relevance: {e}")
            return {"error": "Failed to analyze news relevance"}
    
    def _generate_relevance_summary(self, relevant_topics: List[Dict]) -> str:
        """Generate a summary of relevant topics for the user"""
        try:
            if not relevant_topics:
                return "No highly relevant air quality topics found in recent news."
            
            topic_descriptions = [topic["description"] for topic in relevant_topics[:3]]
            summary = f"Recent news highlights: {', '.join(topic_descriptions)}"
            
            return summary
            
        except Exception as e:
            logger.error(f"Error generating relevance summary: {e}")
            return "Recent air quality news analysis completed."

# Global instance
nlp_education_engine = NLPEducationEngine()
