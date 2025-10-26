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
                # Use Gemini 2.5 Flash - fast, cost-effective, and stable
                self.model = genai.GenerativeModel('models/gemini-2.5-flash')
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
        Generate daily briefing with Gemini API priority for professional tone
        
        Args:
            environmental_data: PM2.5, ozone, pollen, weather data
            user_profile: User health profile
            risk_score: Calculated risk score (0-100)
            
        Returns:
            Personalized daily briefing string
        """
        # Step 1: Try Gemini API FIRST for professional wellness coach tone
        if self.model:
            try:
                logger.info("🔄 ATTEMPTING Gemini API for professional daily briefing")
                logger.info(f"🔄 Model type: {type(self.model)}")
                logger.info(f"🔄 User: {user_profile.get('name', 'unknown')}")
                logger.info(f"🔄 Risk score: {risk_score}")
                
                result = await self._query_gemini_daily_briefing(
                    environmental_data, user_profile, risk_score
                )
                
                logger.info(f"✅ Gemini API SUCCESS! Response length: {len(result)} chars")
                return result
                
            except Exception as e:
                # Sanitize error to prevent API key leakage
                safe_error = SecurityValidator.sanitize_api_keys(str(e))
                logger.error(f"❌❌❌ Gemini API FAILED: {safe_error}")
                logger.error(f"❌ Exception type: {type(e).__name__}")
                import traceback
                logger.error(f"❌ Traceback: {traceback.format_exc()}")
                # Fall through to knowledge base
        else:
            logger.error("❌❌❌ Gemini model is NULL! API key not configured properly!")
            logger.error(f"❌ API key exists: {bool(self.api_key)}")
            logger.error(f"❌ API key length: {len(self.api_key) if self.api_key else 0}")
        
        # Step 2: Fall back to knowledge base if Gemini unavailable
        kb_briefing = self._generate_from_knowledge_base(
            environmental_data, user_profile, risk_score, briefing_type='daily'
        )
        
        if kb_briefing:
            logger.info("✅ Daily briefing generated from knowledge base")
            return kb_briefing
        
        # Step 3: Final fallback to basic response
        logger.warning("⚠️ Using basic fallback for daily briefing")
        return self._generate_basic_fallback(environmental_data, user_profile, risk_score)
    
    async def generate_wellness_boost(
        self,
        user_profile: Dict[str, Any],
        risk_score: float,
        environmental_data: Dict[str, Any]
    ) -> str:
        """
        Generate wellness boost with Gemini API priority for professional tone
        """
        # Step 1: Try Gemini API FIRST for professional wellness coach tone
        if self.model:
            try:
                logger.info("🔄 Using Gemini API for professional wellness boost")
                return await self._query_gemini_wellness(user_profile, risk_score, environmental_data)
            except Exception as e:
                # Sanitize error to prevent API key leakage
                safe_error = SecurityValidator.sanitize_api_keys(str(e))
                logger.warning(f"⚠️ Gemini API failed, falling back to knowledge base: {safe_error}")
        else:
            logger.warning("⚠️ Gemini not configured, using knowledge base")
        
        # Step 2: Fall back to knowledge base
        kb_wellness = self._generate_wellness_from_kb(user_profile, risk_score, environmental_data)
        
        if kb_wellness:
            logger.info("✅ Wellness boost generated from knowledge base")
            return kb_wellness
        
        # Step 3: Final fallback
        return self._generate_basic_wellness_fallback(user_profile, risk_score)
    
    async def generate_action_plan(
        self,
        primary_risk: str,
        environmental_data: Dict[str, Any],
        user_profile: Dict[str, Any]
    ) -> list:
        """
        Generate action plan with Gemini API priority for professional tone
        """
        # Step 1: Try Gemini API FIRST for professional wellness coach tone
        if self.model:
            try:
                logger.info("🔄 Using Gemini API for professional action plan")
                return await self._query_gemini_actions(primary_risk, environmental_data, user_profile)
            except Exception as e:
                # Sanitize error to prevent API key leakage
                safe_error = SecurityValidator.sanitize_api_keys(str(e))
                logger.warning(f"⚠️ Gemini API failed, falling back to knowledge base: {safe_error}")
        else:
            logger.warning("⚠️ Gemini not configured, using knowledge base")
        
        # Step 2: Fall back to knowledge base
        kb_actions = self._generate_actions_from_kb(primary_risk, environmental_data, user_profile)
        
        if kb_actions:
            logger.info("✅ Action plan generated from knowledge base")
            return kb_actions
        
        # Step 3: Final fallback
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
        DISABLED: Always return None to force Gemini API usage for professional tone
        """
        # Always return None to prioritize Gemini API
        # Knowledge base is too basic - lacks interaction analysis and professional tone
        return None
    
    def _generate_wellness_from_kb(
        self,
        user_profile: Dict[str, Any],
        risk_score: float,
        environmental_data: Dict[str, Any]
    ) -> Optional[str]:
        """Generate wellness boost from knowledge base - DISABLED for Gemini"""
        # Always return None to force Gemini API usage
        return None
    
    def _generate_actions_from_kb(
        self,
        primary_risk: str,
        environmental_data: Dict[str, Any],
        user_profile: Dict[str, Any]
    ) -> Optional[list]:
        """Generate action plan from knowledge base - DISABLED for Gemini"""
        # Always return None to force Gemini API usage
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
        
        # Get detailed health information
        health_conditions = user_profile.get('health_conditions', [])
        medications = user_profile.get('medications', [])
        allergies = user_profile.get('allergies', [])
        triggers = user_profile.get('triggers', [])
        
        # Build health profile string
        health_profile = f"- Primary Condition: {condition if condition else 'General wellness'}\n"
        health_profile += f"- Age: {user_profile.get('age', 'adult')}\n"
        
        if health_conditions:
            health_profile += f"- Health Conditions: {', '.join(health_conditions)}\n"
        if medications:
            health_profile += f"- Current Medications: {', '.join(medications)}\n"
        if allergies:
            health_profile += f"- Allergies: {', '.join(allergies)}\n"
        if triggers:
            health_profile += f"- Known Triggers: {', '.join(triggers)}\n"
        
        prompt = f"""You are a trusted wellness coach who explains health information clearly and professionally.

Generate a *Daily Air Quality and Wellbeing Briefing* for {name}.

**User Profile:**
{health_profile}

**Current Environmental Conditions:**
- PM2.5: {pm25:.1f} µg/m³ (safe limit: 35 µg/m³)
- Ozone: {ozone:.0f} ppb (safe limit: 70 ppb)
- Pollen: {pollen}/100 (0-20=low, 21-40=moderate, 41-100=high)
- Temperature: {temperature}°C
- Humidity: {humidity}%
- Overall Risk Score: {risk_score:.0f}/100

**LANGUAGE REQUIREMENTS:**
- Write at a 10th-grade reading level (clear, simple, direct)
- Avoid medical jargon: NO "manifested", "epithelial lining", "mucociliary clearance", "alveolar sacs", "hypersensitivity"
- Use everyday words: "airways" not "respiratory tract", "breathing tubes" not "bronchioles", "irritation" not "inflammation"
- Be professional but conversational - like a knowledgeable friend who happens to be a health expert
- Accurately describe pollen: 0-20="low", 21-40="moderate", 41-100="high"

**Required Structure (300-400 words total):**

**1. Daily Briefing (100-150 words):**
- Warm greeting with today's conditions in plain language
- **PERSONALIZE based on their specific health conditions and medications**
- Explain how air quality affects their specific condition (e.g., if they have asthma + take albuterol, mention how PM2.5 can trigger symptoms requiring rescue inhaler use)
- Include risk score: {risk_score:.0f}/100
- If they have allergies, mention pollen levels and how it interacts with their specific allergens

**2. How Pollutants Affect Your Health (75-100 words):**
- Explain PM2.5 and ozone in simple terms (tiny particles + irritating gas)
- **TAILOR to their health conditions**: If they have diabetes, mention cardiovascular effects; if COPD, mention lung function; if asthma, mention airway inflammation
- When both are high, they work together to make breathing harder (30-40% more irritation)
- Describe effects clearly: "makes airways swollen and sensitive", "harder to breathe deeply"
- Mention how weather affects this (simple explanation)
- **If they take medications, mention how air quality can affect medication effectiveness or need**

**3. 🎯 Your Action Plan (3-4 items):**
- Clear, time-specific actions (e.g., "6-9 AM: Go for your morning walk")
- **PERSONALIZE based on their triggers and medications**: If smoke is a trigger, emphasize avoiding outdoor cooking areas; if they take controller medications, remind them about timing
- Explain benefits in simple terms (e.g., "cuts your exposure by 60%")
- Include: when to open windows, water intake, exercise timing, what to avoid
- Use numbered list with specific times and amounts
- **If they have specific allergies, give allergy-specific advice** (e.g., "Keep windows closed during peak pollen hours 10 AM-3 PM")

**4. 💪 Wellness Boost (50-75 words):**
- Acknowledge their efforts in simple, encouraging language
- **PERSONALIZE**: Reference their specific condition management (e.g., "Managing asthma while staying active takes real dedication")
- Share one research-backed fact relevant to their condition
- Give one easy wellness tip tailored to their health profile
- End with genuine, motivating words

**CRITICAL: This briefing MUST be highly personalized to {name}'s specific health profile. Reference their conditions, medications, allergies, and triggers throughout. Make them feel like this briefing was written specifically for them, not a generic template.**

**Tone:** Professional but friendly, clear and direct, encouraging and supportive — like a health-savvy friend who genuinely cares about their wellbeing."""

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
