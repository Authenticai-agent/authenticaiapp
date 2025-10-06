import os
from typing import Dict, Any, Optional, List
from datetime import datetime
from utils.logger import setup_logger
from fastapi import HTTPException, status

logger = setup_logger()

class LLMService:
    """
    LLM Service using local knowledge base only - No API keys required
    All responses generated from rule-based system and health knowledge base
    """
    def __init__(self):
        # No LLM API initialization - using local knowledge base only
        self.openai_client = None
        self.gemini_model = None
        logger.info("LLMService initialized in LOCAL MODE - No API keys required")
    
    async def process_voice_query(self, query: str, user_context: Dict[str, Any], conversation_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Process voice queries with contextual understanding"""
        
        # Build context-aware prompt
        system_prompt = self._build_system_prompt(user_context)
        user_prompt = f"""
        User query: "{query}"
        
        Please provide a helpful, concise response suitable for voice delivery. 
        Keep responses under 30 seconds when spoken aloud.
        Focus on actionable advice related to air quality, allergies, and asthma management.
        """
        
        # Always use local knowledge base (no LLM API calls)
        try:
            response = self._fallback_response(query, user_context)
            
            return {
                "response_text": response,
                "response_type": "informational",
                "additional_data": {
                    "query_processed_at": datetime.utcnow().isoformat(),
                    "model_used": "local_knowledge_base"
                }
            }
            
        except Exception as e:
            logger.error(f"Error processing voice query: {e}")
            return {
                "response_text": "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
                "response_type": "error"
            }
    
    async def generate_todays_recommendations(self, user_context: Dict[str, Any], environmental_data: Dict[str, Any], 
                                            risk_level: str, risk_score: float) -> str:
        """Generate today's recommendations using Authie wellness coach prompt"""
        name = user_context.get('name', 'there')
        allergies = user_context.get('allergies', [])
        asthma_severity = user_context.get('asthma_severity', 'none')
        triggers = user_context.get('triggers', [])
        
        # Extract environmental data
        aqi = environmental_data.get('aqi', 'unknown')
        pm25 = environmental_data.get('pm25', 'unknown')
        pm10 = environmental_data.get('pm10', 'unknown')
        ozone = environmental_data.get('ozone', 'unknown')
        temperature = environmental_data.get('temperature_c', 'unknown')
        humidity = environmental_data.get('humidity_pct', 'unknown')
        pollen_data = environmental_data.get('pollen', {})
        
        prompt = f"""
        You are Authie, a premium respiratory wellness and lifestyle coach. 
        Your job: deliver concise, uplifting, data-anchored TODAY'S RECOMMENDATIONS 
        that feel exclusive, personal, and worth $19.99/month. 

        USER PROFILE:
        - Name: {name}
        - Asthma Severity: {asthma_severity}
        - Known Triggers: {triggers}
        - Allergies: {allergies}

        TODAY'S CONDITIONS:
        - AQI: {aqi}
        - PM2.5: {pm25} μg/m³ (safe limit: 35 μg/m³)
        - PM10: {pm10} μg/m³ (safe limit: 150 μg/m³)
        - Ozone: {ozone} μg/m³ (safe limit: 70 ppb)
        - Pollen Index: {pollen_data.get('overall_risk', 'unknown')} 
          (Tree: {pollen_data.get('tree', 'unknown')}, Grass: {pollen_data.get('grass', 'unknown')}, Weed: {pollen_data.get('weed', 'unknown')})
        - Temperature: {temperature}°C | Humidity: {humidity}%
        - Current Risk: {risk_level} (score: {risk_score}/100)

        TODAY'S RECOMMENDATIONS STRUCTURE (≤200 words):

        1. **Opening** (1 sentence)  
           - Personalize with the user's name and one data fact (e.g., "Good morning Sarah, today's PM2.5 is elevated at 42 μg/m³.")  

        2. **Today's Action Plan** (4–5 SPECIFIC, DATA-DRIVEN RECOMMENDATIONS)  
           - Exact times ("Best window for outdoor walk: before 9 AM").  
           - Exact durations ("Limit outdoor time to 20 minutes between 3–5 PM").  
           - Exact alternatives ("Use AC in recirculation mode instead of opening windows during pollen peaks").  
           - Include practical, everyday steps (e.g., "Run your bathroom fan for 30 minutes to clear humidity").  
           - Quantify benefit where possible ("This reduces particle exposure by ~60%").  

        3. **Quick Reminder** (1 sentence)  
           - Short, motivating note on when to take extra care ("Watch for the pollen surge this afternoon—plan indoor activities then").  

        REQUIREMENTS:  
        ✅ Friendly, supportive tone that feels premium and personal  
        ✅ Always reference today's real data (numbers + pollutants)  
        ✅ Keep it highly actionable with times, durations, alternatives, and quantified benefits  
        ✅ Stay concise (<200 words total)  
        ✅ Must feel exclusive and valuable enough to share  

        ❌ No medical advice, prescriptions, or inhaler mentions  
        ❌ No vague or generic recommendations  
        """
        
        # Always use local knowledge base (no LLM API calls)
        try:
            return self._fallback_todays_recommendations(name, risk_level, aqi, pm25, ozone, asthma_severity, pollen_data.get('overall_risk', 'low'))
        except Exception as e:
            logger.error(f"Error generating today's recommendations: {e}")
            return f"Hello {name}, based on today's conditions (Risk: {risk_level}), we recommend checking air quality before outdoor activities."

    async def generate_daily_briefing(self, user_context: Dict[str, Any], environmental_data: Dict[str, Any], 
                                    risk_level: str, risk_score: float) -> str:
        """Generate personalized daily health briefing using Authie wellness coach prompt"""
        
        name = user_context.get('name', 'there')
        allergies = user_context.get('allergies', [])
        asthma_severity = user_context.get('asthma_severity', 'none')
        triggers = user_context.get('triggers', [])
        
        # Extract environmental data
        aqi = environmental_data.get('aqi', 'unknown')
        pm25 = environmental_data.get('pm25', 'unknown')
        pm10 = environmental_data.get('pm10', 'unknown')
        ozone = environmental_data.get('ozone', 'unknown')
        temperature = environmental_data.get('temperature_c', 'unknown')
        humidity = environmental_data.get('humidity_pct', 'unknown')
        pollen_data = environmental_data.get('pollen', {})
        
        prompt = f"""
        You are Authie, a premium respiratory wellness and lifestyle coach. 
        Your job: deliver a concise, uplifting, data-anchored DAILY BRIEFING 
        that feels exclusive, personal, and worth $19.99/month. 

        USER PROFILE:
        - Name: {name}
        - Asthma Severity: {asthma_severity}
        - Known Triggers: {triggers}
        - Allergies: {allergies}

        TODAY'S CONDITIONS:
        - AQI: {aqi}
        - PM2.5: {pm25} μg/m³ (safe limit: 35 μg/m³)
        - PM10: {pm10} μg/m³ (safe limit: 150 μg/m³)
        - Ozone: {ozone} μg/m³ (safe limit: 70 ppb)
        - Pollen Index: {pollen_data.get('overall_risk', 'unknown')} 
          (Tree: {pollen_data.get('tree', 'unknown')}, Grass: {pollen_data.get('grass', 'unknown')}, Weed: {pollen_data.get('weed', 'unknown')})
        - Temperature: {temperature}°C | Humidity: {humidity}%
        - Current Risk: {risk_level} (score: {risk_score}/100)

        DAILY BRIEFING STRUCTURE (≤200 words):

        1. **Warm Greeting** (1 sentence)  
           - Personalize with the user's name and one data fact (e.g., "Good morning Sarah, today's PM2.5 is elevated at 42 μg/m³.")  

        2. **Today's Conditions** (2–3 sentences)  
           - Translate raw data into what's happening outside right now.  
           - Highlight the ONE or TWO biggest risks (e.g., "ozone peaks this afternoon at 70 ppb").  

        3. **How It Affects YOU** (1–2 sentences)  
           - Directly link conditions to the user's profile and triggers (e.g., "Since grass pollen is high and you're sensitive, outdoor exercise could be irritating today.").  

        4. **Your Action Plan** (3–4 SPECIFIC, DATA-DRIVEN TIPS)  
           - Exact times ("Best window for outdoor walk: before 9 AM").  
           - Exact durations ("Limit outdoor time to 20 minutes between 3–5 PM").  
           - Exact alternatives ("Use AC in recirculation mode instead of opening windows during pollen peaks").  
           - Include practical, everyday steps (e.g., "Run your bathroom fan for 30 minutes to clear humidity").  
           - Quantify benefit where possible ("This reduces particle exposure by ~60%").  

        5. **Quick Reminder** (1 sentence)  
           - Short, motivating note on when to take extra care ("Watch for the pollen surge this afternoon—plan indoor activities then").  

        REQUIREMENTS:  
        ✅ Friendly, supportive tone that feels premium and personal  
        ✅ Always reference today's real data (numbers + pollutants)  
        ✅ Keep it highly actionable with times, durations, alternatives, and quantified benefits  
        ✅ Stay concise (<200 words total)  
        ✅ Must feel exclusive and valuable enough to share  
        ✅ Complete all sentences - do not truncate or cut off mid-sentence

        ❌ No medical advice, prescriptions, or inhaler mentions  
        ❌ No vague or generic recommendations  
        """
        
        try:
            if self.gemini_model:
                try:
                    return await self._query_gemini(prompt)
                except Exception as gemini_error:
                    logger.warning(f"Gemini failed, falling back to OpenAI: {gemini_error}")
                    if self.openai_client:
                        return await self._query_openai("You are Authenticai, a helpful AI prevention coach for allergies and asthma.", prompt)
                    else:
                        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="LLM briefing failed")
            elif self.openai_client:
                return await self._query_openai("You are Authenticai, a helpful AI prevention coach for allergies and asthma.", prompt)
            else:
                raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="LLM briefing failed")
                
        except Exception as e:
            logger.error(f"Error generating daily briefing: {e}")
            # Fallback to rule-based briefing
            return self._fallback_briefing(name, risk_level, risk_score, user_context)
    
    async def generate_real_time_briefing(self, user_context: Dict[str, Any], environmental_data: Dict[str, Any], 
                                        risk_level: str, risk_score: float) -> str:
        """Generate real-time environmental briefing using Authie wellness coach prompt"""
        
        name = user_context.get('name', 'there')
        allergies = user_context.get('allergies', [])
        asthma_severity = user_context.get('asthma_severity', 'none')
        triggers = user_context.get('triggers', [])
        
        # Extract environmental data
        aqi = environmental_data.get('aqi', 'unknown')
        pm25 = environmental_data.get('pm25', 'unknown')
        pm10 = environmental_data.get('pm10', 'unknown')
        ozone = environmental_data.get('ozone', 'unknown')
        temperature = environmental_data.get('temperature_c', 'unknown')
        humidity = environmental_data.get('humidity_pct', 'unknown')
        pollen_data = environmental_data.get('pollen', {})
        
        prompt = f"""
        You are Authie, a premium respiratory wellness and lifestyle coach. 
        Your job: deliver a concise, uplifting, data-anchored REAL-TIME BRIEFING 
        that feels exclusive, personal, and worth $19.99/month. 

        USER PROFILE:
        - Name: {name}
        - Asthma Severity: {asthma_severity}
        - Known Triggers: {triggers}
        - Allergies: {allergies}

        CURRENT CONDITIONS:
        - AQI: {aqi}
        - PM2.5: {pm25} μg/m³ (safe limit: 35 μg/m³)
        - PM10: {pm10} μg/m³ (safe limit: 150 μg/m³)
        - Ozone: {ozone} μg/m³ (safe limit: 70 ppb)
        - Pollen Index: {pollen_data.get('overall_risk', 'unknown')} 
          (Tree: {pollen_data.get('tree', 'unknown')}, Grass: {pollen_data.get('grass', 'unknown')}, Weed: {pollen_data.get('weed', 'unknown')})
        - Temperature: {temperature}°C | Humidity: {humidity}%
        - Current Risk: {risk_level} (score: {risk_score}/100)

        REAL-TIME BRIEFING STRUCTURE (≤100 words):

        1. **Current Status** (1 sentence)  
           - Personalize with the user's name and current data fact (e.g., "Hi Sarah, current PM2.5 is at 42 μg/m³.")  

        2. **Right Now Action Plan** (2–3 SPECIFIC, IMMEDIATE RECOMMENDATIONS)  
           - Exact times ("Best window for outdoor walk: before 9 AM").  
           - Exact durations ("Limit outdoor time to 20 minutes between 3–5 PM").  
           - Exact alternatives ("Use AC in recirculation mode instead of opening windows during pollen peaks").  
           - Include practical, everyday steps (e.g., "Run your bathroom fan for 30 minutes to clear humidity").  
           - Quantify benefit where possible ("This reduces particle exposure by ~60%").  

        3. **Quick Reminder** (1 sentence)  
           - Short, motivating note on when to take extra care ("Watch for the pollen surge this afternoon—plan indoor activities then").  

        REQUIREMENTS:  
        ✅ Friendly, supportive tone that feels premium and personal  
        ✅ Always reference current real data (numbers + pollutants)  
        ✅ Keep it highly actionable with times, durations, alternatives, and quantified benefits  
        ✅ Stay concise (<100 words total)  
        ✅ Must feel exclusive and valuable enough to share  

        ❌ No medical advice, prescriptions, or inhaler mentions  
        ❌ No vague or generic recommendations  
        """
        
        try:
            if self.gemini_model:
                return await self._query_gemini(prompt)
            elif self.openai_client:
                return await self._query_openai("You are Authenticai, a helpful AI prevention coach for allergies and asthma.", prompt)
            else:
                raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="LLM real-time briefing failed")
                
        except Exception as e:
            logger.error(f"Error generating real-time briefing: {e}")
            # Fallback to rule-based real-time briefing
            return self._fallback_real_time_briefing(name, risk_level, risk_score, user_context)
    
    async def generate_education_snippet(self, topic: Optional[str], user_context: Dict[str, Any]) -> str:
        """Generate educational content snippet"""
        
        if not topic:
            # Choose topic based on user context
            allergies = user_context.get("allergies", [])
            if "pollen" in allergies or "tree" in str(allergies).lower():
                topic = "pollen and seasonal allergies"
            elif "dust" in str(allergies).lower():
                topic = "dust mites and indoor air quality"
            elif user_context.get("asthma_severity") != "none":
                topic = "asthma triggers and management"
            else:
                topic = "indoor air quality basics"
        
        prompt = f"""
        Create a brief, educational snippet about {topic} for someone with allergies/asthma.
        
        User context:
        - Allergies: {user_context.get('allergies', [])}
        - Asthma severity: {user_context.get('asthma_severity', 'none')}
        - Age: {user_context.get('age', 'adult')}
        
        Requirements:
        1. Keep it under 30 seconds when spoken
        2. Include one interesting fact or tip
        3. Make it actionable and practical
        4. Use simple, clear language
        5. End with a specific action they can take today
        
        Format as a friendly, conversational snippet suitable for voice delivery.
        """
        
        try:
            if self.gemini_model:
                return await self._query_gemini(prompt)
            elif self.openai_client:
                return await self._query_openai("You are Authenticai, an educational AI coach for allergies and asthma.", prompt)
            else:
                raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="LLM education failed")
                
        except Exception as e:
            logger.error(f"Error generating education snippet: {e}")
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="LLM education failed")
    
    def _build_system_prompt(self, user_context: Dict[str, Any]) -> str:
        """Build system prompt with user context"""
        return f"""
        You are Authenticai, an AI prevention coach specializing in allergies and asthma management.
        
        User profile:
        - Allergies: {user_context.get('allergies', [])}
        - Asthma severity: {user_context.get('asthma_severity', 'none')}
        - Known triggers: {user_context.get('triggers', [])}
        - Age: {user_context.get('age', 'not specified')}
        - Location: {user_context.get('location', 'not specified')}
        
        Guidelines:
        1. Provide helpful, evidence-based advice
        2. Keep responses concise and actionable
        3. Personalize based on user's specific allergies and triggers
        4. Always prioritize safety - recommend consulting healthcare providers for medical decisions
        5. Focus on prevention and environmental management
        6. Use encouraging, supportive tone
        """
    
    async def _query_gemini(self, prompt: str) -> str:
        """Query Gemini model with retry logic"""
        import asyncio
        
        for attempt in range(3):
            try:
                # Use asyncio.to_thread to make the synchronous call async
                response = await asyncio.to_thread(self.gemini_model.generate_content, prompt)
                if response and response.text:
                    return response.text
                else:
                    raise Exception("Empty response from Gemini")
            except Exception as e:
                logger.warning(f"Gemini attempt {attempt + 1} failed: {e}")
                if attempt < 2:  # Don't sleep on last attempt
                    await asyncio.sleep(1 * (attempt + 1))  # Exponential backoff
                else:
                    raise
    
    async def _query_openai(self, system_prompt: str, user_prompt: str) -> str:
        """Query OpenAI model using the cheapest option: GPT-4o Mini"""
        if not self.openai_client:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="OpenAI client not initialized")
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4o-mini",  # Cheapest OpenAI model: $0.15/1M input, $0.60/1M output
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=2000,
                temperature=0.7
            )
            content = response.choices[0].message.content
            if not content or content.strip() == "":
                raise Exception("OpenAI returned empty response")
            return content
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            raise
    
    def _fallback_response(self, query: str, user_context: Dict[str, Any]) -> str:
        """Provide fallback response when LLM services are unavailable"""
        query_lower = query.lower()
        
        if "air quality" in query_lower or "aqi" in query_lower:
            return "Air quality can significantly impact your symptoms. Check your local AQI and consider staying indoors when levels are high, especially above 100."
        
        elif "pollen" in query_lower:
            return "Pollen levels vary by season and weather. Keep windows closed during high pollen days, shower after being outdoors, and consider using air purifiers."
        
        elif "symptoms" in query_lower or "flareup" in query_lower:
            return "If you're experiencing symptoms, move to a clean air environment, use your rescue inhaler if prescribed, and avoid known triggers. Contact your healthcare provider if symptoms persist."
        
        else:
            return "I can help you understand air quality, pollen levels, and environmental triggers. What specific aspect of your respiratory health would you like to know about?"
    
    def _fallback_todays_recommendations(self, name: str, risk_level: str, aqi: float, pm25: float, ozone: float, 
                                       asthma_severity: str, pollen_risk: str) -> str:
        """Generate fallback today's recommendations when LLM is unavailable"""
        
        if risk_level == "low":
            return f"""Good morning {name}, today's PM2.5 is at {pm25} μg/m³—well within safe limits.

**Today's Action Plan:**
1. **Outdoor activities before 10 AM** - Best time for exercise when air is freshest
2. **Keep windows open 2-4 hours** - Fresh air circulation improves indoor quality
3. **Perfect day for walking** - Low pollution means 30+ minutes of outdoor time is safe
4. **Use natural ventilation** - AC not needed with such clean outdoor air

**Quick reminder:** Enjoy today's excellent air quality—it's perfect for staying active!"""
            
        elif risk_level == "moderate":
            return f"""Good morning {name}, today's PM2.5 is elevated at {pm25} μg/m³—above the 35 μg/m³ safe limit.

**Today's Action Plan:**
1. **Outdoor activities before 9 AM only** - PM2.5 levels are lowest in early morning
2. **Limit outdoor time to 15-20 minutes** - Cumulative exposure builds up quickly
3. **Use AC recirculation mode 2-6 PM** - Filters out 60% of PM2.5 particles during peak hours
4. **Run bathroom fan for 30 minutes** - Reduces indoor humidity and improves air circulation

**Quick reminder:** Watch for the ozone surge this afternoon—plan indoor activities then."""
            
        elif risk_level == "high":
            return f"""Good morning {name}, today's PM2.5 is high at {pm25} μg/m³—{pm25/35:.1f}x above safe limits.

**Today's Action Plan:**
1. **Stay indoors 12-4 PM** - PM2.5 levels peak during these hours, making outdoor air dangerous
2. **Use air purifier for 4 hours** - Removes 95% of PM2.5 particles from indoor air
3. **Keep windows closed all day** - Prevents outdoor pollutants from entering your home
4. **Avoid outdoor exercise completely** - High pollution levels make breathing difficult

**Quick reminder:** Today requires maximum indoor protection—your respiratory health comes first."""
            
        else:  # very_high
            return f"""Good morning {name}, today's PM2.5 is dangerously high at {pm25} μg/m³—{pm25/35:.1f}x above safe limits.

**Today's Action Plan:**
1. **Stay indoors at all times** - Outdoor air is dangerous for your respiratory health
2. **Use air purifier continuously** - Essential for removing harmful particles from indoor air
3. **Keep all windows and doors closed** - Prevents dangerous outdoor air from entering
4. **Avoid any outdoor activities** - Current conditions can trigger severe symptoms
5. **Have emergency contacts ready** - Be prepared for potential health emergencies

**Quick reminder:** Today requires maximum indoor protection—your health comes first."""

    def _fallback_briefing(self, name: str, risk_level: str, risk_score: float, user_context: dict = None) -> str:
        """Premium wellness fallback briefing when LLM is unavailable"""
        if user_context is None:
            user_context = {}
        
        # Extract user profile for personalization
        allergies = user_context.get('allergies', [])
        asthma_severity = user_context.get('asthma_severity', 'none')
        triggers = user_context.get('triggers', [])
        age = user_context.get('age', 'unknown')
        
        # Extract environmental data for wellness analysis
        environmental = user_context.get('environmental', {})
        aqi = environmental.get('aqi', 'unknown')
        pm25 = environmental.get('pm25', 'unknown')
        pm10 = environmental.get('pm10', 'unknown')
        ozone = environmental.get('ozone', 'unknown')
        no2 = environmental.get('no2', 'unknown')
        so2 = environmental.get('so2', 'unknown')
        co = environmental.get('co', 'unknown')
        nh3 = environmental.get('nh3', 'unknown')
        humidity = environmental.get('humidity_pct', 'unknown')
        pollen_data = environmental.get('pollen', {})
        
        if risk_level == "low":
            return f"""Good morning {name}, today's PM2.5 is at {pm25} μg/m³—well within safe limits.

TODAY'S CONDITIONS: Excellent air quality (AQI {aqi}) with PM2.5 at {pm25} μg/m³ and ozone at {ozone} μg/m³. Perfect conditions for outdoor activities.

HOW IT AFFECTS YOU: With {asthma_severity} asthma, today's clean air means you can enjoy outdoor activities comfortably.

YOUR ACTION PLAN:
1. **Outdoor activities before 10 AM** - Best time for exercise when air is freshest
2. **Keep windows open 2-4 hours** - Fresh air circulation improves indoor quality
3. **Perfect day for walking** - Low pollution means 30+ minutes of outdoor time is safe
4. **Use natural ventilation** - AC not needed with such clean outdoor air

QUICK REMINDER: Enjoy today's excellent air quality—it's perfect for staying active!

Remember: This is wellness guidance to help you feel your best. Always consult healthcare providers for medical concerns."""
            
        elif risk_level == "moderate":
            return f"""Good morning {name}, today's PM2.5 is elevated at {pm25} μg/m³—above the 35 μg/m³ safe limit.

TODAY'S CONDITIONS: Moderate air quality (AQI {aqi}) with PM2.5 at {pm25} μg/m³ and ozone at {ozone} μg/m³. Ozone peaks 2-6 PM today.

HOW IT AFFECTS YOU: With {asthma_severity} asthma, you'll feel more sensitive during peak hours, especially 2-6 PM.

YOUR ACTION PLAN:
1. **Outdoor activities before 9 AM only** - PM2.5 levels are lowest in early morning
2. **Limit outdoor time to 15-20 minutes** - Cumulative exposure builds up quickly
3. **Use AC recirculation mode 2-6 PM** - Filters out 60% of PM2.5 particles during peak hours
4. **Run bathroom fan for 30 minutes** - Reduces indoor humidity and improves air circulation

QUICK REMINDER: Watch for the ozone surge this afternoon—plan indoor activities then.

Remember: This is wellness guidance to help you feel your best. Always consult healthcare providers for medical concerns."""
            
        elif risk_level == "high":
            return f"""Good morning {name}, today's PM2.5 is high at {pm25} μg/m³—{pm25/35:.1f}x above safe limits.

TODAY'S CONDITIONS: Poor air quality (AQI {aqi}) with PM2.5 at {pm25} μg/m³ and ozone at {ozone} μg/m³. Conditions worsen 12-4 PM.

HOW IT AFFECTS YOU: With {asthma_severity} asthma, today's conditions create significant breathing challenges, especially midday.

YOUR ACTION PLAN:
1. **Stay indoors 12-4 PM** - PM2.5 levels peak during these hours, making outdoor air dangerous
2. **Use air purifier for 4 hours** - Removes 95% of PM2.5 particles from indoor air
3. **Keep windows closed all day** - Prevents outdoor pollutants from entering your home
4. **Avoid outdoor exercise completely** - High pollution levels make breathing difficult

QUICK REMINDER: Today requires maximum indoor protection—your respiratory health comes first.

Remember: This is wellness guidance to help you feel your best. Always consult healthcare providers for medical concerns."""
            
        else:  # very_high
            return f"""Good morning {name}, today's PM2.5 is dangerously high at {pm25} μg/m³—{pm25/35:.1f}x above safe limits.

TODAY'S CONDITIONS: Very poor air quality (AQI {aqi}) with PM2.5 at {pm25} μg/m³ and ozone at {ozone} μg/m³. Conditions are hazardous all day.

HOW IT AFFECTS YOU: With {asthma_severity} asthma, today's conditions pose severe health risks and require immediate indoor protection.

YOUR ACTION PLAN:
1. **Stay indoors at all times** - Outdoor air is dangerous for your respiratory health
2. **Use air purifier continuously** - Essential for removing harmful particles from indoor air
3. **Keep all windows and doors closed** - Prevents dangerous outdoor air from entering
4. **Avoid any outdoor activities** - Current conditions can trigger severe symptoms
5. **Have emergency contacts ready** - Be prepared for potential health emergencies

QUICK REMINDER: Today requires maximum indoor protection—your health comes first.

Remember: This is wellness guidance to help you feel your best. Always consult healthcare providers for medical concerns."""
    
    def _fallback_real_time_briefing(self, name: str, risk_level: str, risk_score: float, user_context: dict = None) -> str:
        """Premium wellness real-time briefing when LLM is unavailable"""
        if user_context is None:
            user_context = {}
        
        # Extract user profile for personalization
        allergies = user_context.get('allergies', [])
        asthma_severity = user_context.get('asthma_severity', 'none')
        triggers = user_context.get('triggers', [])
        
        # Extract environmental data
        environmental = user_context.get('environmental', {})
        aqi = environmental.get('aqi', 'unknown')
        pm25 = environmental.get('pm25', 'unknown')
        ozone = environmental.get('ozone', 'unknown')
        pollen_data = environmental.get('pollen', {})
        
        if risk_level == "low":
            return f"""Good morning {name}, current PM2.5 is at {pm25} μg/m³—excellent conditions.

**Current conditions:** AQI {aqi} with clean air perfect for outdoor activities.

**Your action plan:**
1. **Outdoor activities before 10 AM** - Best time for exercise when air is freshest
2. **Keep windows open 2-4 hours** - Fresh air circulation improves indoor quality
3. **Perfect day for walking** - Low pollution means 30+ minutes of outdoor time is safe

**Quick reminder:** Enjoy today's excellent air quality—it's perfect for staying active!"""
            
        elif risk_level == "moderate":
            return f"""Good morning {name}, current PM2.5 is elevated at {pm25} μg/m³—above safe limits.

**Current conditions:** AQI {aqi} with moderate air quality. Ozone peaks 2-6 PM today.

**Your action plan:**
1. **Outdoor activities before 9 AM only** - PM2.5 levels are lowest in early morning
2. **Limit outdoor time to 15-20 minutes** - Cumulative exposure builds up quickly
3. **Use AC recirculation mode 2-6 PM** - Filters out 60% of PM2.5 particles during peak hours

**Quick reminder:** Watch for the ozone surge this afternoon—plan indoor activities then."""
            
        elif risk_level == "high":
            return f"""Good morning {name}, current PM2.5 is high at {pm25} μg/m³—{pm25/35:.1f}x above safe limits.

**Current conditions:** AQI {aqi} with poor air quality. Conditions worsen 12-4 PM.

**Your action plan:**
1. **Stay indoors 12-4 PM** - PM2.5 levels peak during these hours, making outdoor air dangerous
2. **Use air purifier for 4 hours** - Removes 95% of PM2.5 particles from indoor air
3. **Keep windows closed all day** - Prevents outdoor pollutants from entering your home

**Quick reminder:** Today requires maximum indoor protection—your respiratory health comes first."""
            
        else:  # very_high
            return f"""Good morning {name}, current PM2.5 is dangerously high at {pm25} μg/m³—{pm25/35:.1f}x above safe limits.

**Current conditions:** AQI {aqi} with very poor air quality. Conditions are hazardous all day.

**Your action plan:**
1. **Stay indoors at all times** - Outdoor air is dangerous for your respiratory health
2. **Use air purifier continuously** - Essential for removing harmful particles from indoor air
3. **Keep all windows and doors closed** - Prevents dangerous outdoor air from entering

**Quick reminder:** Today requires maximum indoor protection—your health comes first."""
    
    def _fallback_education(self, topic: str) -> str:
        """Fallback education content"""
        education_content = {
            "pollen and seasonal allergies": "Did you know that pollen counts are typically highest in the early morning and evening? Try to plan outdoor activities for mid-day when possible, and always shower and change clothes after spending time outside during pollen season.",
            
            "dust mites and indoor air quality": "Dust mites thrive in humidity above 50%. Keep your home's humidity between 30-50% using a dehumidifier, and wash bedding weekly in hot water above 130°F to eliminate dust mites effectively.",
            
            "asthma triggers and management": "Temperature changes can trigger asthma symptoms. When moving between different temperature environments, try to breathe through your nose to warm and humidify the air before it reaches your lungs.",
            
            "indoor air quality basics": "Indoor air can be 2-5 times more polluted than outdoor air. Simple steps like using exhaust fans while cooking, avoiding harsh cleaning chemicals, and maintaining your HVAC system can significantly improve your indoor air quality."
        }
        
        return education_content.get(topic, "Maintaining good indoor air quality and avoiding known triggers are key to managing allergies and asthma. Consider using air purifiers and monitoring local air quality daily.")
    
    async def generate_risk_prediction(self, environmental_data: Dict[str, Any], user_context: Dict[str, Any], prediction_date: datetime) -> Dict[str, Any]:
        """Generate AI-powered risk prediction using Gemini for cost efficiency"""
        
        system_prompt = f"""You are an expert respiratory health AI assistant specializing in asthma and allergy risk prediction.
        
        User Profile:
        - Name: {user_context.get('name', 'User')}
        - Allergies: {user_context.get('allergies', [])}
        - Asthma Severity: {user_context.get('asthma_severity', 'unknown')}
        - Known Triggers: {user_context.get('triggers', [])}
        
        Environmental Data for {prediction_date.strftime('%Y-%m-%d')}:
        - Air Quality Index: {environmental_data.get('air_quality', {}).get('aqi', 'unknown')}
        - PM2.5: {environmental_data.get('air_quality', {}).get('pm25', 'unknown')} μg/m³
        - Temperature: {environmental_data.get('weather', {}).get('temperature', 'unknown')}°C
        - Humidity: {environmental_data.get('weather', {}).get('humidity', 'unknown')}%
        - Pollen Levels: {environmental_data.get('pollen', {}).get('tree_pollen', 'unknown')}
        
        RISK SCORING GUIDELINES:
        - AQI 0-50 (Good): Risk score 0-25
        - AQI 51-100 (Moderate): Risk score 25-50
        - AQI 101-150 (Unhealthy for Sensitive): Risk score 50-75
        - AQI 151+ (Unhealthy): Risk score 75-100
        
        Base risk on actual environmental conditions. Good air quality (AQI ≤50) should result in low risk scores (0-25).
        
        Based on this data, provide a risk assessment with:
        1. Risk score (0-100) - MUST align with AQI levels
        2. Risk level (low/moderate/high/very_high)
        3. Top 3 contributing factors
        4. 3 specific recommendations
        
        Respond ONLY with valid JSON in this exact format:
        {{"risk_score": XX, "risk_level": "low|moderate|high|very_high", "factors": ["Factor 1", "Factor 2"], "recommendations": [{{"action": "Recommendation text", "reasoning": "Why this helps", "priority": "low|medium|high"}}]}}"""
        
        try:
            if self.gemini_model:
                response = await self._query_gemini(system_prompt)
                # Parse JSON response with guardrails
                import json
                try:
                    # Strip code fences if present
                    text = response.strip()
                    if text.startswith('```json'):
                        text = text[7:]
                    if text.endswith('```'):
                        text = text[:-3]
                    result = json.loads(text)
                    # Validate minimal schema
                    if not isinstance(result, dict):
                        raise ValueError('Prediction result is not an object')
                    for key in ["risk_score", "risk_level", "factors", "recommendations"]:
                        if key not in result:
                            raise ValueError(f"Missing key: {key}")
                    # Clamp values
                    try:
                        result["risk_score"] = max(0, min(100, float(result["risk_score"])))
                    except Exception:
                        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Invalid risk score from LLM")
                    return result
                except Exception:
                    raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="LLM prediction failed")
            elif self.openai_client:
                # Fallback to OpenAI if configured
                response = await self._query_openai("You are Authenticai, a helpful AI prevention coach for allergies and asthma.", system_prompt)
                import json
                try:
                    # Strip code fences if present
                    text = response.strip()
                    if text.startswith('```json'):
                        text = text[7:]
                    if text.endswith('```'):
                        text = text[:-3]
                    result = json.loads(text)
                    # Validate minimal schema
                    if not isinstance(result, dict):
                        raise ValueError('Prediction result is not an object')
                    for key in ["risk_score", "risk_level", "factors", "recommendations"]:
                        if key not in result:
                            raise ValueError(f"Missing key: {key}")
                    # Clamp values
                    try:
                        result["risk_score"] = max(0, min(100, float(result["risk_score"])))
                    except Exception:
                        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Invalid risk score from LLM")
                    return result
                except Exception:
                    raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="LLM prediction failed")
            else:
                raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="No LLM configured")
                
        except Exception as e:
            logger.error(f"Error generating risk prediction: {e}")
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="LLM prediction failed")
    
    async def generate_forecast(self, days: int, environmental_forecast: List[Dict[str, Any]], user_context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate multi-day risk forecast using Gemini"""
        
        # Simplify environmental data to avoid token limits
        env_summary = f"Environmental data available for {len(environmental_forecast)} days"
        if environmental_forecast:
            first_day = environmental_forecast[0]
            env_summary += f" (Sample: AQI {first_day.get('aqi', 'unknown')}, PM2.5 {first_day.get('pm25', 'unknown')})"
        
        system_prompt = f"""You are an expert respiratory health AI assistant creating a {days}-day forecast.
        
        User Profile:
        - Name: {user_context.get('name', 'User')}
        - Allergies: {user_context.get('allergies', [])}
        - Asthma Severity: {user_context.get('asthma_severity', 'unknown')}
        - Known Triggers: {user_context.get('triggers', [])}
        
        Environmental Data: {env_summary}
        
        Create a {days}-day forecast with daily risk assessments. For each day provide:
        1. Date (format: YYYY-MM-DD)
        2. Risk score (0-100)
        3. Risk level (low/moderate/high/very_high)
        4. Brief summary (1-2 sentences)
        5. Top recommendation
        
        IMPORTANT: Respond ONLY with valid JSON array. Do NOT include markdown code blocks or any other text.
        
        Example format:
        [{{"date": "2025-09-19", "risk_score": 45, "risk_level": "moderate", "summary": "Moderate risk due to air quality.", "top_recommendation": "Monitor AQI levels"}}]"""
        
        try:
            if self.gemini_model:
                try:
                    response = await self._query_gemini(system_prompt)
                    import json
                    try:
                        result = json.loads(response)
                        return result
                    except json.JSONDecodeError as jde:
                        logger.error(f"Gemini returned non-JSON forecast: {jde}")
                        # Fallback to OpenAI if Gemini returns invalid JSON
                        if self.openai_client:
                            logger.info("Falling back to OpenAI for forecast generation")
                            response = await self._query_openai("You are Authenticai, a helpful AI prevention coach for allergies and asthma.", system_prompt)
                            logger.info(f"OpenAI response length: {len(response) if response else 0}")
                            if not response or response.strip() == "":
                                logger.error("OpenAI returned empty response")
                                raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="OpenAI returned empty response")
                            try:
                                result = json.loads(response)
                                return result
                            except json.JSONDecodeError as jde2:
                                logger.error(f"OpenAI returned non-JSON forecast: {jde2}")
                                logger.error(f"Response content: {response[:500]}...")
                                raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="LLM forecast returned invalid JSON")
                        else:
                            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="LLM forecast returned invalid JSON")
                except Exception as gemini_error:
                    logger.warning(f"Gemini failed, falling back to OpenAI: {gemini_error}")
                    if self.openai_client:
                        logger.info(f"Using OpenAI for forecast generation with prompt length: {len(system_prompt)}")
                        response = await self._query_openai("You are Authenticai, a helpful AI prevention coach for allergies and asthma.", system_prompt)
                        logger.info(f"OpenAI response length: {len(response) if response else 0}")
                        if not response or response.strip() == "":
                            logger.error("OpenAI returned empty response")
                            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="OpenAI returned empty response")
                        import json
                        try:
                            # Strip code fences if present
                            text = response.strip()
                            if text.startswith('```json'):
                                text = text[7:]
                            elif text.startswith('```'):
                                text = text[3:]
                            if text.endswith('```'):
                                text = text[:-3]
                            result = json.loads(text.strip())
                            return result
                        except json.JSONDecodeError as jde:
                            logger.error(f"OpenAI returned non-JSON forecast: {jde}")
                            logger.error(f"Response content: {response[:500]}...")
                            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="LLM forecast returned invalid JSON")
                    else:
                        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="LLM forecast service unavailable")
            elif self.openai_client:
                # Fallback to OpenAI if configured
                logger.info(f"Using OpenAI for forecast generation with prompt length: {len(system_prompt)}")
                response = await self._query_openai("You are Authenticai, a helpful AI prevention coach for allergies and asthma.", system_prompt)
                logger.info(f"OpenAI response length: {len(response) if response else 0}")
                if not response or response.strip() == "":
                    logger.error("OpenAI returned empty response")
                    raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="OpenAI returned empty response")
                import json
                try:
                    # Strip code fences if present
                    text = response.strip()
                    if text.startswith('```json'):
                        text = text[7:]
                    elif text.startswith('```'):
                        text = text[3:]
                    if text.endswith('```'):
                        text = text[:-3]
                    result = json.loads(text.strip())
                    return result
                except json.JSONDecodeError as jde:
                    logger.error(f"OpenAI returned non-JSON forecast: {jde}")
                    logger.error(f"Response content: {response[:500]}...")
                    raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="LLM forecast returned invalid JSON")
            else:
                raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="No LLM configured for forecast")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error generating forecast: {e}")
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="LLM forecast failed")
    
    def _fallback_risk_prediction(self, environmental_data: Dict[str, Any], user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback risk prediction when AI is unavailable"""
        aqi = environmental_data.get('air_quality', {}).get('aqi', 50)
        
        # Dynamic rule-based risk assessment
        humidity = environmental_data.get('weather', {}).get('humidity', 50)
        pollen = environmental_data.get('pollen', {}).get('tree_pollen', 0)
        
        # Calculate base risk from AQI
        base_risk = min(90, aqi * 0.6)  # Scale AQI to 0-90 range
        
        # Add modifiers for other factors
        humidity_modifier = max(0, (humidity - 60) * 0.3)  # High humidity increases risk
        pollen_modifier = pollen * 5  # Pollen impact
        
        risk_score = min(100, base_risk + humidity_modifier + pollen_modifier)
        
        # Determine risk level based on calculated score
        if risk_score <= 30:
            risk_level = "low"
        elif risk_score <= 55:
            risk_level = "moderate"
        elif risk_score <= 80:
            risk_level = "high"
        else:
            risk_level = "very_high"
        
        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "factors": ["Air quality levels", "Seasonal patterns", "Personal triggers"],
            "recommendations": [
                {"type": "monitoring", "message": "Check air quality before going outside", "priority": "high"},
                {"type": "medication", "message": "Keep rescue inhaler accessible", "priority": "high"},
                {"type": "lifestyle", "message": "Consider indoor activities if AQI is high", "priority": "medium"}
            ]
        }
    
    def _fallback_forecast(self, days: int, user_context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Fallback forecast when AI is unavailable"""
        from datetime import timedelta
        
        forecast = []
        base_date = datetime.utcnow()
        
        for i in range(days):
            date = base_date + timedelta(days=i)
            forecast.append({
                "date": date.strftime('%Y-%m-%d'),
                "risk_score": 45 + (i * 5),  # Gradually increasing risk
                "risk_level": "moderate",
                "summary": f"Moderate risk expected with typical seasonal patterns.",
                "top_recommendation": "Monitor air quality and avoid known triggers"
            })
        
        return forecast
