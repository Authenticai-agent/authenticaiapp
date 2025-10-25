"""
Gemini Flash-Lite Service with Knowledge Base Fallback
Strategy: Check knowledge base first, use Gemini API only if answer not found
Security: API keys are never logged or exposed in responses
"""
import os
import logging
from typing import Dict, Any, Optional
import google.generativeai as genai
from services.health_knowledge_base import health_kb
from services.wellness_variations import wellness_variations
from services.action_variations import action_variations
from utils.security import SecurityValidator

logger = logging.getLogger(__name__)

class GeminiService:
    """
    Gemini Flash-Lite service with knowledge base priority
    1. First checks local knowledge base
    2. Falls back to Gemini Flash-Lite API if needed
    """
    
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        self.model = None
        
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                # Use Gemini 1.5 Flash-8B (Flash-Lite) - fastest and cheapest
                self.model = genai.GenerativeModel('gemini-1.5-flash-8b')
                # Log success without exposing key (use security utility)
                masked_key = SecurityValidator.mask_api_key(self.api_key)
                logger.info(f"✅ Gemini Flash-Lite initialized successfully (key: {masked_key})")
            except Exception as e:
                # Sanitize error message to remove any API keys
                error_msg = SecurityValidator.sanitize_api_keys(str(e))
                logger.error(f"❌ Failed to initialize Gemini: {error_msg}")
                self.model = None
        else:
            logger.warning("⚠️ GEMINI_API_KEY not found - using knowledge base only")
    
    async def generate_daily_briefing(
        self, 
        environmental_data: Dict[str, Any], 
        user_profile: Dict[str, Any],
        risk_score: float
    ) -> str:
        """
        Generate daily briefing with knowledge base priority
        
        Args:
            environmental_data: PM2.5, ozone, pollen, weather data
            user_profile: User health profile
            risk_score: Calculated risk score (0-100)
            
        Returns:
            Personalized daily briefing string
        """
        # Step 1: Try knowledge base first
        kb_briefing = self._generate_from_knowledge_base(
            environmental_data, user_profile, risk_score, briefing_type='daily'
        )
        
        if kb_briefing:
            logger.info("✅ Daily briefing generated from knowledge base")
            return kb_briefing
        
        # Step 2: Fall back to Gemini API if knowledge base insufficient
        if self.model:
            try:
                logger.info("🔄 Falling back to Gemini API for daily briefing")
                return await self._query_gemini_daily_briefing(
                    environmental_data, user_profile, risk_score
                )
            except Exception as e:
                # Sanitize error to prevent API key leakage
                safe_error = SecurityValidator.sanitize_api_keys(str(e))
                logger.error(f"❌ Gemini API failed: {safe_error}")
                # Return basic knowledge base response as final fallback
                return self._generate_basic_fallback(environmental_data, user_profile, risk_score)
        else:
            logger.warning("⚠️ Gemini not available, using basic fallback")
            return self._generate_basic_fallback(environmental_data, user_profile, risk_score)
    
    async def generate_wellness_boost(
        self,
        user_profile: Dict[str, Any],
        risk_score: float,
        environmental_data: Dict[str, Any]
    ) -> str:
        """
        Generate wellness boost with knowledge base priority
        """
        # Step 1: Try knowledge base first
        kb_wellness = self._generate_wellness_from_kb(user_profile, risk_score, environmental_data)
        
        if kb_wellness:
            logger.info("✅ Wellness boost generated from knowledge base")
            return kb_wellness
        
        # Step 2: Fall back to Gemini API
        if self.model:
            try:
                logger.info("🔄 Falling back to Gemini API for wellness boost")
                return await self._query_gemini_wellness(user_profile, risk_score, environmental_data)
            except Exception as e:
                # Sanitize error to prevent API key leakage
                safe_error = SecurityValidator.sanitize_api_keys(str(e))
                logger.error(f"❌ Gemini API failed: {safe_error}")
                return self._generate_basic_wellness_fallback(user_profile, risk_score)
        else:
            return self._generate_basic_wellness_fallback(user_profile, risk_score)
    
    async def generate_action_plan(
        self,
        primary_risk: str,
        environmental_data: Dict[str, Any],
        user_profile: Dict[str, Any]
    ) -> list:
        """
        Generate action plan with knowledge base priority
        """
        # Step 1: Try knowledge base first
        kb_actions = self._generate_actions_from_kb(primary_risk, environmental_data, user_profile)
        
        if kb_actions:
            logger.info("✅ Action plan generated from knowledge base")
            return kb_actions
        
        # Step 2: Fall back to Gemini API
        if self.model:
            try:
                logger.info("🔄 Falling back to Gemini API for action plan")
                return await self._query_gemini_actions(primary_risk, environmental_data, user_profile)
            except Exception as e:
                # Sanitize error to prevent API key leakage
                safe_error = SecurityValidator.sanitize_api_keys(str(e))
                logger.error(f"❌ Gemini API failed: {safe_error}")
                return self._generate_basic_actions_fallback(primary_risk, environmental_data)
        else:
            return self._generate_basic_actions_fallback(primary_risk, environmental_data)
    
    def _generate_from_knowledge_base(
        self,
        environmental_data: Dict[str, Any],
        user_profile: Dict[str, Any],
        risk_score: float,
        briefing_type: str = 'daily'
    ) -> Optional[str]:
        """
        Generate briefing from knowledge base
        Returns None if knowledge base doesn't have sufficient info
        """
        pm25 = environmental_data.get('pm25', 0)
        ozone = environmental_data.get('ozone', 0)
        pollen = environmental_data.get('pollen_level', 0)
        humidity = environmental_data.get('humidity', 50)
        
        # Check if we have relevant knowledge base entries
        pm25_category = self._get_pm25_category(pm25)
        ozone_category = self._get_ozone_category(ozone)
        
        if pm25_category in health_kb.pm25_facts and ozone_category in health_kb.ozone_facts:
            # We have sufficient knowledge base data
            pm25_info = health_kb.pm25_facts[pm25_category]
            ozone_info = health_kb.ozone_facts[ozone_category]
            
            # Build briefing from knowledge base
            name = user_profile.get('name', 'there')
            condition = user_profile.get('condition', 'respiratory health')
            
            briefing_parts = []
            briefing_parts.append(f"Good morning {name}!")
            briefing_parts.append(f"\n\n**Current Conditions:**")
            briefing_parts.append(f"PM2.5: {pm25:.1f} µg/m³ - {pm25_info['impact']}")
            briefing_parts.append(f"Ozone: {ozone:.0f} ppb - {ozone_info['impact']}")
            
            if 'health_effect' in pm25_info:
                briefing_parts.append(f"\n\n**Health Impact:** {pm25_info['health_effect']}")
            
            if 'action' in pm25_info:
                briefing_parts.append(f"\n\n**Recommended Actions:** {pm25_info['action']}")
            
            return "".join(briefing_parts)
        
        return None  # Not enough knowledge base data
    
    def _generate_wellness_from_kb(
        self,
        user_profile: Dict[str, Any],
        risk_score: float,
        environmental_data: Dict[str, Any]
    ) -> Optional[str]:
        """Generate wellness boost from knowledge base"""
        # Use wellness_variations service
        wellness_items = wellness_variations.get_wellness_boost(
            user_profile, risk_score, environmental_data
        )
        
        if wellness_items and len(wellness_items) > 0:
            return "\n\n".join(wellness_items)
        
        return None
    
    def _generate_actions_from_kb(
        self,
        primary_risk: str,
        environmental_data: Dict[str, Any],
        user_profile: Dict[str, Any]
    ) -> Optional[list]:
        """Generate action plan from knowledge base"""
        # Use action_variations service
        actions = action_variations.get_action_plan(
            primary_risk, environmental_data, user_profile
        )
        
        if actions and len(actions) > 0:
            return actions
        
        return None
    
    async def _query_gemini_daily_briefing(
        self,
        environmental_data: Dict[str, Any],
        user_profile: Dict[str, Any],
        risk_score: float
    ) -> str:
        """Query Gemini API for daily briefing"""
        name = user_profile.get('name', 'there')
        condition = user_profile.get('condition', 'respiratory health')
        pm25 = environmental_data.get('pm25', 0)
        ozone = environmental_data.get('ozone', 0)
        pollen = environmental_data.get('pollen_level', 0)
        temperature = environmental_data.get('temperature', 20)
        humidity = environmental_data.get('humidity', 50)
        
        prompt = f"""You are an empathetic and evidence-based wellness coach. 
Generate a personalized *Daily Air Quality and Wellbeing Briefing* for {name}.

User Profile:
- Health Condition: {condition}
- Age: {user_profile.get('age', 'adult')}
- Triggers: {user_profile.get('triggers', [])}

Current Environmental Conditions:
- PM2.5: {pm25:.1f} µg/m³ (safe limit: 35 µg/m³)
- Ozone: {ozone:.0f} ppb (safe limit: 70 ppb)
- Pollen: {pollen}/100
- Temperature: {temperature}°C
- Humidity: {humidity}%
- Overall Risk Score: {risk_score:.0f}/100

Write a friendly, data-informed daily briefing (150–200 words) that includes:
1. A warm, professional greeting that references today's conditions.
2. A short explanation of how today's air and environmental factors may affect their specific condition or energy levels.
3. 3–4 practical, time-specific wellness recommendations (e.g., when to ventilate, hydrate, exercise, rest, or avoid triggers).
4. A confident, encouraging closing message focused on progress and resilience.

Tone: Calm, professional, motivating, and supportive — as if from a trusted wellness coach guiding healthy daily routines."""

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            # Sanitize error to prevent API key leakage
            safe_error = SecurityValidator.sanitize_api_keys(str(e))
            logger.error(f"Gemini API error: {safe_error}")
            raise Exception(safe_error)
    
    async def _query_gemini_wellness(
        self,
        user_profile: Dict[str, Any],
        risk_score: float,
        environmental_data: Dict[str, Any]
    ) -> str:
        """Query Gemini API for wellness boost"""
        prompt = f"""You are a professional wellness coach supporting someone managing respiratory and emotional wellbeing.

Risk Score: {risk_score:.0f}/100
Condition: {user_profile.get('condition', 'respiratory health')}

Write a concise (50–75 words) *Wellness Boost Message* that includes:
1. Acknowledge their consistent efforts in managing their wellbeing.
2. Offer science-based encouragement related to breathing, rest, or stress recovery.
3. Include one actionable tip they can do today (e.g., mindful breathing, hydration, light movement).

Tone: Compassionate, empowering, and informed — balancing science with motivation to help them feel capable and cared for."""

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            # Sanitize error to prevent API key leakage
            safe_error = SecurityValidator.sanitize_api_keys(str(e))
            logger.error(f"Gemini API error: {safe_error}")
            raise Exception(safe_error)
    
    async def _query_gemini_actions(
        self,
        primary_risk: str,
        environmental_data: Dict[str, Any],
        user_profile: Dict[str, Any]
    ) -> list:
        """Query Gemini API for action plan"""
        pm25 = environmental_data.get('pm25', 0)
        ozone = environmental_data.get('ozone', 0)
        
        prompt = f"""You are a wellness coach creating a *Personalized Action Plan* to help the user reduce exposure to {primary_risk}.

Current Environmental Data:
- Primary Risk: {primary_risk}
- PM2.5: {pm25:.1f} µg/m³
- Ozone: {ozone:.0f} ppb

Generate 3–4 clear, science-backed action items that:
- Include specific timing (e.g., "before 9 AM" or "after sunset")
- Include specific duration or limit (e.g., "20 minutes outdoors")
- Quantify benefits where possible (e.g., "reduces exposure by ~60%")
- Reflect both physical and mental wellness balance (e.g., rest, activity, air care)

Return as a numbered list (1–4), each 1–2 sentences long.
Tone: Expert, concise, and motivating — like a trusted daily coach guiding safe, mindful choices."""

        try:
            response = self.model.generate_content(prompt)
            # Parse response into list
            text = response.text
            actions = [line.strip() for line in text.split('\n') if line.strip() and not line.strip().startswith('#')]
            return actions[:4]  # Limit to 4 actions
        except Exception as e:
            # Sanitize error to prevent API key leakage
            safe_error = SecurityValidator.sanitize_api_keys(str(e))
            logger.error(f"Gemini API error: {safe_error}")
            raise Exception(safe_error)
    
    def _generate_basic_fallback(
        self,
        environmental_data: Dict[str, Any],
        user_profile: Dict[str, Any],
        risk_score: float
    ) -> str:
        """Basic fallback when both KB and API fail"""
        name = user_profile.get('name', 'there')
        pm25 = environmental_data.get('pm25', 0)
        ozone = environmental_data.get('ozone', 0)
        
        return f"""Good morning {name}!

**Current Conditions:**
- PM2.5: {pm25:.1f} µg/m³
- Ozone: {ozone:.0f} ppb
- Risk Score: {risk_score:.0f}/100

**Recommendations:**
- Check air quality before outdoor activities
- Limit exposure during peak pollution hours (12-4 PM)
- Use air purifiers indoors when air quality is poor
- Stay hydrated and monitor your symptoms

Stay safe and take care of your respiratory health!"""
    
    def _generate_basic_wellness_fallback(
        self,
        user_profile: Dict[str, Any],
        risk_score: float
    ) -> str:
        """Basic wellness fallback"""
        if risk_score < 30:
            return "Great job managing your respiratory health! Today's clean air is perfect for outdoor activities. Keep up the excellent work!"
        elif risk_score < 60:
            return "You're doing well managing your health. Be mindful of air quality today and adjust activities as needed. Your awareness makes a difference!"
        else:
            return "Taking precautions today shows you're prioritizing your health. Stay indoors when possible and use air purifiers. You're making smart choices!"
    
    def _generate_basic_actions_fallback(
        self,
        primary_risk: str,
        environmental_data: Dict[str, Any]
    ) -> list:
        """Basic actions fallback"""
        pm25 = environmental_data.get('pm25', 0)
        
        if pm25 < 35:
            return [
                "✅ Outdoor activities safe - enjoy fresh air before 10 AM",
                "🪟 Open windows for 2-4 hours to improve indoor air quality",
                "🚶 Perfect day for 30+ minutes of outdoor exercise"
            ]
        elif pm25 < 55:
            return [
                "⏰ Outdoor activities before 9 AM only when air is freshest",
                "⏱️ Limit outdoor time to 15-20 minutes to reduce exposure",
                "❄️ Use AC recirculation mode 2-6 PM to filter particles"
            ]
        else:
            return [
                "🏠 Stay indoors 12-4 PM when pollution peaks",
                "💨 Use air purifier for 4+ hours to clean indoor air",
                "🪟 Keep windows closed all day to block outdoor pollutants"
            ]
    
    def _get_pm25_category(self, pm25: float) -> str:
        """Get PM2.5 category for knowledge base lookup"""
        if pm25 < 12:
            return 'excellent'
        elif pm25 < 35:
            return 'moderate'
        elif pm25 < 55:
            return 'unhealthy_sensitive'
        else:
            return 'unhealthy'
    
    def _get_ozone_category(self, ozone: float) -> str:
        """Get ozone category for knowledge base lookup"""
        if ozone < 70:
            return 'good'
        elif ozone < 100:
            return 'moderate'
        elif ozone < 150:
            return 'unhealthy_sensitive'
        else:
            return 'unhealthy'

# Global instance
gemini_service = GeminiService()
