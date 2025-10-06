"""
User Education Layer Engine
Implements NLP summarization, topic modeling, and knowledge graphs
for converting scientific data into friendly insights and micro-lessons
"""
import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

# NLP Libraries
try:
    from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    logging.warning("transformers not available, using fallback NLP")

try:
    import nltk
    from nltk.corpus import stopwords
    from nltk.tokenize import word_tokenize
    from nltk.stem import WordNetLemmatizer
    NLTK_AVAILABLE = True
except ImportError:
    NLTK_AVAILABLE = False
    logging.warning("NLTK not available, using fallback text processing")

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.decomposition import LatentDirichletAllocation
    from sklearn.cluster import KMeans
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    logging.warning("sklearn not available, using fallback topic modeling")

logger = logging.getLogger(__name__)

class EducationEngine:
    """
    User Education Layer Engine
    - NLP Summarization for converting scientific data to friendly insights
    - Topic Modeling for extracting trending environmental risks
    - Knowledge Graph for linking pollutants to symptoms and actions
    - Micro-lessons and educational content generation
    """
    
    def __init__(self):
        self.models_path = Path("backend/models/education")
        self.models_path.mkdir(parents=True, exist_ok=True)
        
        # Initialize NLP models
        self.summarizer = None
        self.topic_model = None
        self.vectorizer = None
        self.lemmatizer = None
        
        # Knowledge base
        self.knowledge_graph = self._initialize_knowledge_graph()
        self.educational_content = self._initialize_educational_content()
        
        # Topic modeling data
        self.topic_data = []
        self.topic_model_trained = False
        
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize NLP models for education"""
        try:
            # Summarization model
            if TRANSFORMERS_AVAILABLE:
                try:
                    self.summarizer = pipeline(
                        "summarization",
                        model="facebook/bart-large-cnn",
                        tokenizer="facebook/bart-large-cnn"
                    )
                except Exception as e:
                    logger.warning(f"Could not load BART summarizer: {e}")
                    self.summarizer = None
            
            # Topic modeling
            if SKLEARN_AVAILABLE:
                self.vectorizer = TfidfVectorizer(
                    max_features=1000,
                    stop_words='english',
                    ngram_range=(1, 2)
                )
                self.topic_model = LatentDirichletAllocation(
                    n_components=10,
                    random_state=42
                )
            
            # Text processing
            if NLTK_AVAILABLE:
                try:
                    self.lemmatizer = WordNetLemmatizer()
                except Exception as e:
                    logger.warning(f"Could not initialize lemmatizer: {e}")
                    self.lemmatizer = None
            
            logger.info("Education Engine initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing Education Engine: {e}")
    
    def _initialize_knowledge_graph(self) -> Dict[str, Any]:
        """Initialize knowledge graph linking pollutants to symptoms and actions"""
        return {
            'pollutants': {
                'pm25': {
                    'name': 'PM2.5',
                    'description': 'Fine particulate matter smaller than 2.5 micrometers',
                    'symptoms': ['coughing', 'wheezing', 'shortness of breath', 'chest tightness'],
                    'prevention_actions': ['use_hepa_filter', 'close_windows', 'avoid_outdoor_exercise'],
                    'health_effects': 'Can penetrate deep into lungs and cause inflammation',
                    'sources': ['vehicle emissions', 'industrial processes', 'wildfires']
                },
                'pm10': {
                    'name': 'PM10',
                    'description': 'Coarse particulate matter smaller than 10 micrometers',
                    'symptoms': ['coughing', 'throat irritation', 'nasal congestion'],
                    'prevention_actions': ['use_air_purifier', 'wear_mask', 'limit_outdoor_time'],
                    'health_effects': 'Can irritate airways and trigger asthma symptoms',
                    'sources': ['dust', 'pollen', 'construction', 'vehicle emissions']
                },
                'ozone': {
                    'name': 'Ozone',
                    'description': 'Ground-level ozone formed by chemical reactions',
                    'symptoms': ['chest pain', 'coughing', 'throat irritation', 'breathing difficulty'],
                    'prevention_actions': ['avoid_outdoor_exercise', 'use_ac_recirculation', 'stay_indoor_peak_hours'],
                    'health_effects': 'Can cause airway inflammation and reduce lung function',
                    'sources': ['vehicle emissions', 'industrial emissions', 'chemical reactions']
                },
                'no2': {
                    'name': 'Nitrogen Dioxide',
                    'description': 'Gas produced by combustion processes',
                    'symptoms': ['coughing', 'wheezing', 'chest tightness', 'shortness of breath'],
                    'prevention_actions': ['avoid_traffic_areas', 'use_ventilation', 'limit_exposure'],
                    'health_effects': 'Can increase airway sensitivity and trigger asthma',
                    'sources': ['vehicle emissions', 'power plants', 'industrial processes']
                }
            },
            'symptoms': {
                'coughing': {
                    'triggers': ['pm25', 'pm10', 'ozone', 'no2'],
                    'severity_levels': ['mild', 'moderate', 'severe'],
                    'management': ['stay_hydrated', 'use_humidifier', 'avoid_triggers']
                },
                'wheezing': {
                    'triggers': ['pm25', 'ozone', 'no2'],
                    'severity_levels': ['mild', 'moderate', 'severe'],
                    'management': ['use_rescue_inhaler', 'sit_upright', 'breathe_slowly']
                },
                'shortness_of_breath': {
                    'triggers': ['pm25', 'ozone', 'no2'],
                    'severity_levels': ['mild', 'moderate', 'severe'],
                    'management': ['use_rescue_inhaler', 'seek_medical_help', 'avoid_triggers']
                }
            },
            'prevention_actions': {
                'use_hepa_filter': {
                    'effectiveness': 'high',
                    'pollutants_affected': ['pm25', 'pm10'],
                    'implementation': 'Run HEPA filter 2-4 hours daily',
                    'benefits': 'Reduces indoor PM2.5 by 60-80%'
                },
                'close_windows': {
                    'effectiveness': 'medium',
                    'pollutants_affected': ['pm25', 'pm10', 'ozone', 'no2'],
                    'implementation': 'Keep windows closed during peak pollution hours',
                    'benefits': 'Reduces indoor pollution by 40-60%'
                },
                'avoid_outdoor_exercise': {
                    'effectiveness': 'high',
                    'pollutants_affected': ['ozone', 'pm25', 'no2'],
                    'implementation': 'Avoid outdoor activities 3-6 PM on high pollution days',
                    'benefits': 'Prevents 70-90% of outdoor pollution exposure'
                }
            }
        }
    
    def _initialize_educational_content(self) -> Dict[str, List[Dict[str, Any]]]:
        """Initialize educational content and micro-lessons"""
        return {
            'micro_lessons': [
                {
                    'topic': 'humidity_pollen_interaction',
                    'title': 'Why Humidity Makes Pollen Worse',
                    'content': 'High humidity causes pollen grains to swell and release more allergens. When humidity is above 70%, pollen becomes 20% more reactive, making your symptoms worse even if pollen counts stay the same.',
                    'key_takeaway': 'Monitor humidity levels, not just pollen counts',
                    'action_tip': 'Use a dehumidifier when humidity exceeds 70%'
                },
                {
                    'topic': 'pm25_ozone_synergy',
                    'title': 'The PM2.5-Ozone Double Whammy',
                    'content': 'PM2.5 and ozone work together to create 15-25% higher risk than either pollutant alone. PM2.5 particles can carry ozone deeper into your lungs, while ozone makes your airways more sensitive to PM2.5.',
                    'key_takeaway': 'Combined pollution is more dangerous than individual pollutants',
                    'action_tip': 'Be extra cautious when both PM2.5 and ozone are high'
                },
                {
                    'topic': 'temperature_airway_sensitivity',
                    'title': 'How Temperature Affects Your Airways',
                    'content': 'Extreme temperatures (below 5°C or above 30°C) increase airway sensitivity by 10-15%. Cold air can trigger bronchospasm, while hot air increases inflammation and mucus production.',
                    'key_takeaway': 'Temperature extremes make you more sensitive to other triggers',
                    'action_tip': 'Wear a scarf in cold weather and stay cool in hot weather'
                },
                {
                    'topic': 'wind_pollution_spread',
                    'title': 'Wind Patterns and Pollution Spread',
                    'content': 'Wind speed and direction determine how pollution spreads. Light winds (under 5 mph) allow pollution to accumulate, while strong winds can bring pollution from distant sources like wildfires or industrial areas.',
                    'key_takeaway': 'Wind patterns affect local air quality significantly',
                    'action_tip': 'Check wind forecasts to understand pollution sources'
                }
            ],
            'fact_sheets': [
                {
                    'topic': 'aqi_understanding',
                    'title': 'Understanding the Air Quality Index',
                    'content': 'The AQI combines multiple pollutants into a single number. Green (0-50) is good, Yellow (51-100) is moderate, Orange (101-150) is unhealthy for sensitive groups, Red (151-200) is unhealthy, and Purple (201+) is very unhealthy.',
                    'key_points': [
                        'AQI combines PM2.5, PM10, ozone, NO2, SO2, and CO',
                        'Sensitive groups should take precautions at Orange level',
                        'Everyone should avoid outdoor activities at Red level'
                    ]
                },
                {
                    'topic': 'indoor_air_quality',
                    'title': 'Improving Indoor Air Quality',
                    'content': 'Indoor air can be 2-5 times more polluted than outdoor air. Common indoor pollutants include dust mites, pet dander, mold, and chemicals from cleaning products.',
                    'key_points': [
                        'Use HEPA filters to remove particles',
                        'Control humidity to prevent mold growth',
                        'Ventilate when outdoor air quality is good',
                        'Avoid smoking and strong cleaning chemicals'
                    ]
                }
            ],
            'seasonal_guides': [
                {
                    'season': 'spring',
                    'title': 'Spring Allergy Management',
                    'content': 'Spring brings tree pollen, which can trigger severe allergic reactions. Tree pollen season typically runs from March to May, with peak levels in April.',
                    'key_tips': [
                        'Start taking allergy medications before symptoms begin',
                        'Keep windows closed during peak pollen hours (5-10 AM)',
                        'Shower after spending time outdoors',
                        'Use air purifiers with HEPA filters'
                    ]
                },
                {
                    'season': 'summer',
                    'title': 'Summer Air Quality Challenges',
                    'content': 'Summer brings high ozone levels, especially on hot, sunny days. Ozone forms when sunlight reacts with vehicle emissions and industrial pollutants.',
                    'key_tips': [
                        'Avoid outdoor exercise during peak ozone hours (3-6 PM)',
                        'Check air quality forecasts before planning activities',
                        'Use air conditioning to stay cool and filter air',
                        'Stay hydrated to help your body cope with pollution'
                    ]
                }
            ]
        }
    
    def generate_educational_insights(self, environmental_data: Dict[str, Any], 
                                    user_profile: Dict[str, Any], 
                                    risk_factors: List[str] = None) -> Dict[str, Any]:
        """
        Generate educational insights and micro-lessons based on current conditions
        """
        try:
            # Extract key environmental factors
            key_factors = self._extract_key_factors(environmental_data)
            
            # Generate relevant micro-lessons
            micro_lessons = self._get_relevant_micro_lessons(key_factors, user_profile)
            
            # Generate personalized insights
            personalized_insights = self._generate_personalized_insights(key_factors, user_profile)
            
            # Generate topic-based content
            topic_content = self._generate_topic_content(key_factors)
            
            # Create educational summary
            educational_summary = self._create_educational_summary(
                key_factors, micro_lessons, personalized_insights
            )
            
            return {
                'micro_lessons': micro_lessons,
                'personalized_insights': personalized_insights,
                'topic_content': topic_content,
                'educational_summary': educational_summary,
                'key_factors': key_factors,
                'generated_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating educational insights: {e}")
            return {
                'micro_lessons': [],
                'personalized_insights': [],
                'topic_content': [],
                'educational_summary': 'Educational content unavailable',
                'key_factors': [],
                'error': str(e),
                'generated_at': datetime.utcnow().isoformat()
            }
    
    def _extract_key_factors(self, environmental_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract key environmental factors for education"""
        try:
            factors = []
            
            # Air quality factors
            air_quality = environmental_data.get('air_quality', {})
            pm25 = air_quality.get('pm25', 0)
            ozone = air_quality.get('ozone', 0)
            aqi = air_quality.get('aqi', 50)
            
            if pm25 > 35:
                factors.append({
                    'type': 'pollutant',
                    'name': 'PM2.5',
                    'value': pm25,
                    'level': 'high' if pm25 > 55 else 'moderate',
                    'educational_content': self.knowledge_graph['pollutants']['pm25']
                })
            
            if ozone > 70:
                factors.append({
                    'type': 'pollutant',
                    'name': 'Ozone',
                    'value': ozone,
                    'level': 'high' if ozone > 85 else 'moderate',
                    'educational_content': self.knowledge_graph['pollutants']['ozone']
                })
            
            # Weather factors
            weather = environmental_data.get('weather', {})
            humidity = weather.get('humidity', 50)
            temperature = weather.get('temperature', 20)
            
            if humidity > 70:
                factors.append({
                    'type': 'weather',
                    'name': 'Humidity',
                    'value': humidity,
                    'level': 'high',
                    'educational_content': 'High humidity amplifies pollen and mold reactions'
                })
            
            if temperature > 30 or temperature < 5:
                factors.append({
                    'type': 'weather',
                    'name': 'Temperature',
                    'value': temperature,
                    'level': 'extreme',
                    'educational_content': 'Extreme temperatures increase airway sensitivity'
                })
            
            # Pollen factors
            pollen = environmental_data.get('pollen', {})
            pollen_tree = pollen.get('tree', 0)
            pollen_grass = pollen.get('grass', 0)
            
            if pollen_tree > 2 or pollen_grass > 2:
                factors.append({
                    'type': 'pollen',
                    'name': 'Pollen',
                    'value': max(pollen_tree, pollen_grass),
                    'level': 'high' if max(pollen_tree, pollen_grass) > 4 else 'moderate',
                    'educational_content': 'Pollen levels can trigger allergic reactions and asthma'
                })
            
            return factors
            
        except Exception as e:
            logger.error(f"Error extracting key factors: {e}")
            return []
    
    def _get_relevant_micro_lessons(self, key_factors: List[Dict[str, Any]], 
                                  user_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get relevant micro-lessons based on current factors"""
        try:
            relevant_lessons = []
            
            # Check for humidity-pollen interaction
            humidity_factor = next((f for f in key_factors if f['name'] == 'Humidity'), None)
            pollen_factor = next((f for f in key_factors if f['name'] == 'Pollen'), None)
            
            if humidity_factor and pollen_factor:
                lesson = next((l for l in self.educational_content['micro_lessons'] 
                             if l['topic'] == 'humidity_pollen_interaction'), None)
                if lesson:
                    relevant_lessons.append(lesson)
            
            # Check for PM2.5-ozone synergy
            pm25_factor = next((f for f in key_factors if f['name'] == 'PM2.5'), None)
            ozone_factor = next((f for f in key_factors if f['name'] == 'Ozone'), None)
            
            if pm25_factor and ozone_factor:
                lesson = next((l for l in self.educational_content['micro_lessons'] 
                             if l['topic'] == 'pm25_ozone_synergy'), None)
                if lesson:
                    relevant_lessons.append(lesson)
            
            # Check for temperature effects
            temp_factor = next((f for f in key_factors if f['name'] == 'Temperature'), None)
            if temp_factor:
                lesson = next((l for l in self.educational_content['micro_lessons'] 
                             if l['topic'] == 'temperature_airway_sensitivity'), None)
                if lesson:
                    relevant_lessons.append(lesson)
            
            # Add general lessons if no specific ones found
            if not relevant_lessons:
                relevant_lessons.append(self.educational_content['micro_lessons'][0])
            
            return relevant_lessons
            
        except Exception as e:
            logger.error(f"Error getting relevant micro-lessons: {e}")
            return []
    
    def _generate_personalized_insights(self, key_factors: List[Dict[str, Any]], 
                                      user_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate personalized insights based on user profile"""
        try:
            insights = []
            
            # Get user allergies and triggers
            allergies = user_profile.get('allergies', [])
            triggers = user_profile.get('triggers', [])
            asthma_severity = user_profile.get('asthma_severity', 'moderate')
            
            # Generate insights based on user profile
            for factor in key_factors:
                if factor['name'] == 'Pollen' and any(allergy in ['pollen', 'tree', 'grass'] for allergy in allergies):
                    insights.append({
                        'type': 'personalized',
                        'title': 'Your Pollen Sensitivity',
                        'content': f"Since you're allergic to pollen, today's {factor['level']} pollen levels ({factor['value']}/5) are particularly relevant for you. Consider taking preventive measures.",
                        'action_tip': 'Take allergy medication before symptoms begin'
                    })
                
                elif factor['name'] == 'PM2.5' and 'pm25' in triggers:
                    insights.append({
                        'type': 'personalized',
                        'title': 'Your PM2.5 Sensitivity',
                        'content': f"PM2.5 at {factor['value']:.1f} μg/m³ is above the EPA safe limit of 35 μg/m³. As someone sensitive to PM2.5, this could trigger your symptoms.",
                        'action_tip': 'Use HEPA filters and avoid outdoor activities'
                    })
                
                elif factor['name'] == 'Ozone' and 'ozone' in triggers:
                    insights.append({
                        'type': 'personalized',
                        'title': 'Your Ozone Sensitivity',
                        'content': f"Ozone at {factor['value']:.1f} ppb is above the EPA safe limit of 70 ppb. This can cause airway inflammation and trigger your asthma.",
                        'action_tip': 'Avoid outdoor exercise during peak hours (3-6 PM)'
                    })
            
            # Add general insights if no specific ones
            if not insights:
                insights.append({
                    'type': 'general',
                    'title': 'Environmental Awareness',
                    'content': 'Monitoring environmental conditions helps you understand what triggers your symptoms and when to take preventive measures.',
                    'action_tip': 'Keep track of your symptoms and environmental conditions'
                })
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating personalized insights: {e}")
            return []
    
    def _generate_topic_content(self, key_factors: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate topic-based educational content"""
        try:
            content = []
            
            # Add relevant fact sheets
            if any(f['name'] in ['PM2.5', 'Ozone', 'PM10'] for f in key_factors):
                aqi_sheet = next((f for f in self.educational_content['fact_sheets'] 
                                if f['topic'] == 'aqi_understanding'), None)
                if aqi_sheet:
                    content.append(aqi_sheet)
            
            # Add seasonal content based on current date
            current_month = datetime.now().month
            if 3 <= current_month <= 5:  # Spring
                spring_guide = next((g for g in self.educational_content['seasonal_guides'] 
                                   if g['season'] == 'spring'), None)
                if spring_guide:
                    content.append(spring_guide)
            elif 6 <= current_month <= 8:  # Summer
                summer_guide = next((g for g in self.educational_content['seasonal_guides'] 
                                   if g['season'] == 'summer'), None)
                if summer_guide:
                    content.append(summer_guide)
            
            return content
            
        except Exception as e:
            logger.error(f"Error generating topic content: {e}")
            return []
    
    def _create_educational_summary(self, key_factors: List[Dict[str, Any]], 
                                  micro_lessons: List[Dict[str, Any]], 
                                  personalized_insights: List[Dict[str, Any]]) -> str:
        """Create a concise educational summary"""
        try:
            if not key_factors:
                return "No significant environmental factors detected today. Continue monitoring your symptoms and environmental conditions."
            
            # Start with key factors
            summary = f"Today's key environmental factors: {', '.join([f['name'] for f in key_factors])}. "
            
            # Add micro-lesson insight
            if micro_lessons:
                lesson = micro_lessons[0]
                summary += f"{lesson['key_takeaway']}. "
            
            # Add personalized insight
            if personalized_insights:
                insight = personalized_insights[0]
                summary += f"{insight['action_tip']}. "
            
            # Add closing
            summary += "Stay informed and take care of your respiratory health!"
            
            return summary
            
        except Exception as e:
            logger.error(f"Error creating educational summary: {e}")
            return "Educational content unavailable. Please monitor your symptoms and environmental conditions."
    
    def summarize_scientific_data(self, scientific_text: str, max_length: int = 150) -> str:
        """Summarize scientific data into friendly language"""
        try:
            if self.summarizer is not None:
                # Use transformer-based summarization
                summary = self.summarizer(
                    scientific_text,
                    max_length=max_length,
                    min_length=50,
                    do_sample=False
                )
                return summary[0]['summary_text']
            else:
                # Fallback to simple text processing
                return self._simple_summarize(scientific_text, max_length)
                
        except Exception as e:
            logger.error(f"Error summarizing scientific data: {e}")
            return self._simple_summarize(scientific_text, max_length)
    
    def _simple_summarize(self, text: str, max_length: int) -> str:
        """Simple summarization fallback"""
        try:
            # Split into sentences
            sentences = text.split('. ')
            
            # Take first few sentences
            summary_sentences = sentences[:3]
            
            # Join and truncate
            summary = '. '.join(summary_sentences)
            if len(summary) > max_length:
                summary = summary[:max_length] + "..."
            
            return summary
            
        except Exception as e:
            logger.error(f"Error in simple summarization: {e}")
            return "Unable to summarize content"
    
    def extract_topics(self, text_data: List[str]) -> Dict[str, Any]:
        """Extract topics from text data using topic modeling"""
        try:
            if not self.vectorizer or not self.topic_model:
                return {'topics': [], 'error': 'Topic modeling not available'}
            
            # Vectorize text
            X = self.vectorizer.fit_transform(text_data)
            
            # Fit topic model
            self.topic_model.fit(X)
            
            # Get topics
            feature_names = self.vectorizer.get_feature_names_out()
            topics = []
            
            for topic_idx, topic in enumerate(self.topic_model.components_):
                top_words_idx = topic.argsort()[-10:][::-1]
                top_words = [feature_names[i] for i in top_words_idx]
                topics.append({
                    'topic_id': topic_idx,
                    'top_words': top_words,
                    'weight': topic.sum()
                })
            
            self.topic_model_trained = True
            
            return {
                'topics': topics,
                'num_topics': len(topics),
                'trained': True
            }
            
        except Exception as e:
            logger.error(f"Error extracting topics: {e}")
            return {
                'topics': [],
                'error': str(e),
                'trained': False
            }
    
    def get_knowledge_graph_info(self, entity_type: str, entity_name: str) -> Dict[str, Any]:
        """Get information from knowledge graph"""
        try:
            if entity_type in self.knowledge_graph:
                entity_info = self.knowledge_graph[entity_type].get(entity_name)
                if entity_info:
                    return {
                        'found': True,
                        'entity_type': entity_type,
                        'entity_name': entity_name,
                        'information': entity_info
                    }
            
            return {
                'found': False,
                'entity_type': entity_type,
                'entity_name': entity_name,
                'message': 'Entity not found in knowledge graph'
            }
            
        except Exception as e:
            logger.error(f"Error getting knowledge graph info: {e}")
            return {
                'found': False,
                'error': str(e)
            }

# Initialize the engine
education_engine = EducationEngine()
