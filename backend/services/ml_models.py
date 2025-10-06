import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import os
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from utils.logger import setup_logger

logger = setup_logger()

class FlareupPredictionModel:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.feature_columns = [
            'aqi', 'pm25', 'pm10', 'ozone', 'no2', 'so2', 'co',
            'temperature', 'humidity', 'pressure', 'wind_speed',
            'tree_pollen', 'grass_pollen', 'weed_pollen', 'mold_spores',
            'age', 'asthma_severity_encoded', 'allergy_count', 'trigger_count',
            'hour_of_day', 'day_of_week', 'month', 'season'
        ]
        self.model_version = "1.0.0"
        self.load_or_create_model()
    
    def load_or_create_model(self):
        """Load existing model or create new one"""
        model_path = "models/flareup_prediction_model.joblib"
        scaler_path = "models/flareup_scaler.joblib"
        
        if os.path.exists(model_path) and os.path.exists(scaler_path):
            try:
                self.model = joblib.load(model_path)
                self.scaler = joblib.load(scaler_path)
                logger.info("Loaded existing ML model")
            except Exception as e:
                logger.error(f"Error loading model: {e}")
                self._create_baseline_model()
        else:
            self._create_baseline_model()
    
    def _create_baseline_model(self):
        """Create a baseline model with synthetic data"""
        logger.info("Creating baseline ML model with synthetic data")
        
        # Generate synthetic training data for baseline model
        n_samples = 1000
        # Use current time as seed for more realistic variation
        np.random.seed(int(datetime.now().timestamp()) % 10000)
        
        # Environmental features
        aqi = np.random.normal(50, 30, n_samples).clip(0, 500)
        pm25 = np.random.normal(12, 8, n_samples).clip(0, 200)
        pm10 = np.random.normal(20, 12, n_samples).clip(0, 300)
        ozone = np.random.normal(0.07, 0.03, n_samples).clip(0, 0.5)
        no2 = np.random.normal(20, 10, n_samples).clip(0, 100)
        so2 = np.random.normal(5, 3, n_samples).clip(0, 50)
        co = np.random.normal(1, 0.5, n_samples).clip(0, 10)
        
        temperature = np.random.normal(20, 10, n_samples)
        humidity = np.random.normal(60, 20, n_samples).clip(0, 100)
        pressure = np.random.normal(1013, 20, n_samples).clip(950, 1050)
        wind_speed = np.random.exponential(5, n_samples).clip(0, 50)
        
        tree_pollen = np.random.poisson(3, n_samples).clip(0, 10)
        grass_pollen = np.random.poisson(2, n_samples).clip(0, 10)
        weed_pollen = np.random.poisson(1, n_samples).clip(0, 10)
        mold_spores = np.random.poisson(2, n_samples).clip(0, 10)
        
        # User features
        age = np.random.normal(35, 15, n_samples).clip(5, 80)
        asthma_severity = np.random.choice([0, 1, 2, 3], n_samples)  # 0=none, 1=mild, 2=moderate, 3=severe
        allergy_count = np.random.poisson(2, n_samples).clip(0, 10)
        trigger_count = np.random.poisson(3, n_samples).clip(0, 15)
        
        # Time features
        hour_of_day = np.random.randint(0, 24, n_samples)
        day_of_week = np.random.randint(0, 7, n_samples)
        month = np.random.randint(1, 13, n_samples)
        season = ((month - 1) // 3) % 4
        
        # Create feature matrix
        X = np.column_stack([
            aqi, pm25, pm10, ozone, no2, so2, co,
            temperature, humidity, pressure, wind_speed,
            tree_pollen, grass_pollen, weed_pollen, mold_spores,
            age, asthma_severity, allergy_count, trigger_count,
            hour_of_day, day_of_week, month, season
        ])
        
        # Generate target variable (flareup risk score 0-100)
        # Higher environmental pollution + user sensitivity = higher risk
        environmental_risk = (aqi/5 + pm25*2 + tree_pollen*5 + grass_pollen*5 + 
                            (humidity > 70) * 10 + (temperature < 5) * 10)
        user_risk = (asthma_severity * 15 + allergy_count * 3 + trigger_count * 2)
        
        y = (environmental_risk + user_risk + np.random.normal(0, 5, n_samples)).clip(0, 100)
        
        # Train model
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=None)
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train Random Forest model
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=None,
            n_jobs=-1
        )
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate model
        y_pred = self.model.predict(X_test_scaled)
        mse = mean_squared_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        logger.info(f"Model trained - MSE: {mse:.2f}, R2: {r2:.3f}")
        
        # Save model
        os.makedirs("models", exist_ok=True)
        joblib.dump(self.model, "models/flareup_prediction_model.joblib")
        joblib.dump(self.scaler, "models/flareup_scaler.joblib")
    
    async def predict_flareup_risk(
        self, 
        environmental_data: Dict[str, Any], 
        user_context: Dict[str, Any],
        prediction_date: datetime
    ) -> Dict[str, Any]:
        """Predict flareup risk score and generate recommendations"""
        
        try:
            # Ensure inputs are not None
            if environmental_data is None:
                environmental_data = {}
            if user_context is None:
                user_context = {}
            
            # Extract features
            features = self._extract_features(environmental_data, user_context, prediction_date)
            
            # Make prediction
            features_scaled = self.scaler.transform([features])
            risk_score = float(self.model.predict(features_scaled)[0])
            risk_score = max(0, min(100, risk_score))  # Clamp to 0-100
            
            # Determine risk level based on score (dynamic thresholds)
            risk_thresholds = {
                "low": 30,
                "moderate": 55,
                "high": 80
            }
            
            if risk_score < risk_thresholds["low"]:
                risk_level = "low"
            elif risk_score < risk_thresholds["moderate"]:
                risk_level = "moderate"
            elif risk_score < risk_thresholds["high"]:
                risk_level = "high"
            else:
                risk_level = "very_high"
            
            # Analyze contributing factors (with error handling)
            try:
                factors = self._analyze_factors(environmental_data, user_context, features)
            except Exception as e:
                logger.warning(f"Error analyzing factors: {e}")
                factors = {"environmental": 0.5, "personal": 0.5}
            
            # Generate recommendations (with error handling)
            try:
                recommendations = self._generate_recommendations(risk_score, factors, user_context)
            except Exception as e:
                logger.warning(f"Error generating recommendations: {e}")
                recommendations = [
                    {"type": "general", "message": "Monitor air quality and avoid known triggers", "priority": "medium"}
                ]
            
            return {
                "risk_score": risk_score,
                "risk_level": risk_level,
                "factors": factors,
                "recommendations": recommendations,
                "model_version": self.model_version,
                "prediction_date": prediction_date.isoformat() if hasattr(prediction_date, 'isoformat') else str(prediction_date)
            }
        except Exception as e:
            logger.error(f"Error in predict_flareup_risk: {e}")
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="ML model prediction failed")
    
    def _extract_features(self, environmental_data: Dict[str, Any], user_context: Dict[str, Any], prediction_date: datetime) -> List[float]:
        """Extract features for model prediction"""
        features = []
        
        # Ensure environmental_data is not None
        if environmental_data is None:
            environmental_data = {}
        
        # Ensure user_context is not None
        if user_context is None:
            user_context = {}
        
        # Air quality features (with safe defaults)
        air_quality = environmental_data.get("air_quality") or {}
        features.extend([
            air_quality.get("aqi", 50),
            air_quality.get("pm25", 12),
            air_quality.get("pm10", 20),
            air_quality.get("ozone", 0.07),
            air_quality.get("no2", 20),
            air_quality.get("so2", 5),
            air_quality.get("co", 1)
        ])
        
        # Weather features (with safe defaults)
        weather = environmental_data.get("weather") or {}
        features.extend([
            weather.get("temperature", 20),
            weather.get("humidity", 60),
            weather.get("pressure", 1013),
            weather.get("wind_speed", 5)
        ])
        
        # Pollen features (with safe defaults)
        pollen = environmental_data.get("pollen") or {}
        features.extend([
            pollen.get("tree_pollen", 2),
            pollen.get("grass_pollen", 2),
            pollen.get("weed_pollen", 1),
            pollen.get("mold_spores", 2)
        ])
        
        # User features (with safe defaults)
        asthma_severity_map = {"none": 0, "mild": 1, "moderate": 2, "severe": 3}
        allergies = user_context.get("allergies") or []
        triggers = user_context.get("triggers") or []
        
        features.extend([
            user_context.get("age") or 35,
            asthma_severity_map.get(user_context.get("asthma_severity"), 0),
            len(allergies) if isinstance(allergies, list) else 0,
            len(triggers) if isinstance(triggers, list) else 0
        ])
        
        # Time features
        features.extend([
            prediction_date.hour,
            prediction_date.weekday(),
            prediction_date.month,
            (prediction_date.month - 1) // 3  # season
        ])
        
        return features
    
    def _analyze_factors(self, environmental_data: Dict[str, Any], user_context: Dict[str, Any], features: List[float]) -> Dict[str, Any]:
        """Analyze contributing risk factors"""
        factors = {}
        
        # Air quality factors
        air_quality = environmental_data.get("air_quality", {})
        aqi = air_quality.get("aqi", 50)
        pm25 = air_quality.get("pm25", 12)
        
        if aqi > 100:
            factors["high_aqi"] = {"value": aqi, "impact": "high", "description": "Air quality is unhealthy"}
        elif aqi > 50:
            factors["moderate_aqi"] = {"value": aqi, "impact": "moderate", "description": "Air quality is moderate"}
        
        if pm25 > 35:
            factors["high_pm25"] = {"value": pm25, "impact": "high", "description": "High fine particulate matter"}
        
        # Weather factors
        weather = environmental_data.get("weather", {})
        humidity = weather.get("humidity", 60)
        temperature = weather.get("temperature", 20)
        
        if humidity > 70:
            factors["high_humidity"] = {"value": humidity, "impact": "moderate", "description": "High humidity can worsen symptoms"}
        
        if temperature < 5:
            factors["cold_temperature"] = {"value": temperature, "impact": "moderate", "description": "Cold air can trigger symptoms"}
        
        # Pollen factors
        pollen = environmental_data.get("pollen", {})
        total_pollen = sum([
            pollen.get("tree_pollen", 0),
            pollen.get("grass_pollen", 0),
            pollen.get("weed_pollen", 0)
        ])
        
        if total_pollen > 6:
            factors["high_pollen"] = {"value": total_pollen, "impact": "high", "description": "High pollen levels"}
        
        return factors
    
    def _generate_recommendations(self, risk_score: float, factors: Dict[str, Any], user_context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate personalized recommendations"""
        recommendations = []
        
        # Use dynamic thresholds for recommendations
        high_threshold = 80
        moderate_threshold = 55
        
        # Professional, data-driven recommendations
        if risk_score > high_threshold:
            recommendations.append({
                "type": "critical_alert",
                "priority": "critical",
                "message": f"CRITICAL: Risk score {risk_score}/100 - Stay indoors immediately and use air filtration",
                "actions": ["emergency_indoor_only", "activate_air_purifier", "monitor_symptoms_continuously"]
            })
        elif risk_score > moderate_threshold:
            recommendations.append({
                "type": "high_caution",
                "priority": "high",
                "message": f"High risk score {risk_score}/100 - Limit outdoor exposure to essential activities only",
                "actions": ["restrict_outdoor_time", "use_n95_mask", "activate_indoor_filtration"]
            })
        
        # Specific factor-based professional recommendations
        if "high_aqi" in factors:
            recommendations.append({
                "type": "environmental_critical",
                "priority": "high",
                "message": "Poor air quality detected - Postpone outdoor activities and activate indoor air filtration systems",
                "actions": ["postpone_outdoor_activities", "activate_hvac_filtration", "monitor_indoor_air_quality"]
            })
        
        if "high_pollen" in factors:
            recommendations.append({
                "type": "pollen_management",
                "priority": "high",
                "message": "High pollen levels - Use HEPA filtration and limit outdoor exposure to low-pollen hours",
                "actions": ["activate_hepa_filtration", "schedule_outdoor_activities_morning", "implement_pollen_barrier_protocols"]
            })
        
        if "high_humidity" in factors:
            recommendations.append({
                "type": "humidity_control",
                "priority": "medium",
                "message": "High humidity detected - Activate dehumidification and increase air circulation",
                "actions": ["activate_dehumidification", "increase_ventilation_rate", "monitor_mold_prevention"]
            })
        
        return recommendations
    
    async def analyze_risk_factors(self, environmental_data: Dict[str, Any], user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze current risk factors without making prediction"""
        features = self._extract_features(environmental_data, user_context, datetime.utcnow())
        factors = self._analyze_factors(environmental_data, user_context, features)
        
        # Convert factors to frontend format
        environmental_factors = []
        personal_factors = []
        
        for factor_key, factor_data in factors.items():
            factor_item = {
                "factor": factor_key,
                "risk_level": factor_data.get("impact", "low"),
                "reasoning": factor_data.get("description", ""),
                "impact_score": factor_data.get("value", 0)
            }
            
            # Categorize factors
            if factor_key in ["high_aqi", "moderate_aqi", "high_pm25", "high_humidity", "cold_temperature", "high_pollen"]:
                environmental_factors.append(factor_item)
            else:
                personal_factors.append(factor_item)
        
        # Add current date environmental factors based on real data
        air_quality = environmental_data.get("air_quality", {})
        weather = environmental_data.get("weather", {})
        pollen = environmental_data.get("pollen", {})
        
        # Air quality factor
        aqi = air_quality.get("aqi", 50)
        if aqi <= 50:
            environmental_factors.append({
                "factor": "air_quality",
                "risk_level": "low",
                "reasoning": f"Good air quality with AQI of {aqi}. PM2.5: {air_quality.get('pm25', 'N/A')} μg/m³, PM10: {air_quality.get('pm10', 'N/A')} μg/m³",
                "impact_score": 15
            })
        elif aqi <= 100:
            environmental_factors.append({
                "factor": "air_quality", 
                "risk_level": "moderate",
                "reasoning": f"Moderate air quality with AQI of {aqi}. Some sensitive individuals may experience minor symptoms.",
                "impact_score": 35
            })
        else:
            environmental_factors.append({
                "factor": "air_quality",
                "risk_level": "high", 
                "reasoning": f"Poor air quality with AQI of {aqi}. Outdoor activities should be limited.",
                "impact_score": 65
            })
        
        # Weather factor
        temp = weather.get("temperature", 20)
        humidity = weather.get("humidity", 50)
        environmental_factors.append({
            "factor": "weather",
            "risk_level": "low" if 15 <= temp <= 25 and 40 <= humidity <= 60 else "moderate",
            "reasoning": f"Temperature: {temp}°C, Humidity: {humidity}%. {'Favorable' if 15 <= temp <= 25 and 40 <= humidity <= 60 else 'May affect sensitive individuals'}",
            "impact_score": 20 if 15 <= temp <= 25 and 40 <= humidity <= 60 else 35
        })
        
        # Pollen factor
        pollen_risk = pollen.get("overall_risk", "low")
        tree = pollen.get("tree", 0)
        grass = pollen.get("grass", 0) 
        weed = pollen.get("weed", 0)
        environmental_factors.append({
            "factor": "pollen",
            "risk_level": pollen_risk,
            "reasoning": f"Pollen levels - Tree: {tree}, Grass: {grass}, Weed: {weed}. Overall risk: {pollen_risk}",
            "impact_score": 25 if pollen_risk == "low" else 45 if pollen_risk == "moderate" else 65
        })
        
        # Personal factors based on user context
        asthma_severity = user_context.get("asthma_severity", "none")
        if asthma_severity and asthma_severity != "none":
            personal_factors.append({
                "factor": "asthma_severity",
                "risk_level": "high" if asthma_severity == "severe" else "moderate",
                "reasoning": f"{asthma_severity.title()} asthma increases sensitivity to environmental triggers",
                "impact_score": 70 if asthma_severity == "severe" else 45
            })
        
        allergies = user_context.get("allergies", [])
        if allergies:
            personal_factors.append({
                "factor": "allergy_sensitivity", 
                "risk_level": "moderate",
                "reasoning": f"Known allergies to: {', '.join(allergies)}. May increase reaction to environmental triggers",
                "impact_score": 40
            })
        
        return {
            "environmental_factors": environmental_factors,
            "personal_factors": personal_factors,
            "analysis_timestamp": datetime.utcnow().isoformat(),
            "date": datetime.utcnow().strftime("%Y-%m-%d")
        }
