"""
📘 Authenticai Dynamic Daily Briefings Engine
Master implementation of personalized, adaptive daily air quality briefings

Every briefing is unique - adapts to:
- Live environmental conditions (from APIs)
- Individual user profiles (asthma severity, triggers, age, lifestyle)
- Scientific thresholds and health impacts (WHO, EPA, ATS, AAFA, CDC)

No two briefings are the same: they evolve daily with changing air quality and personal health needs.
"""

from typing import Dict, List, Any
from datetime import datetime
import logging
from services.health_knowledge_base import health_kb
from services.wellness_variations import wellness_variations
from services.action_variations import action_variations

logger = logging.getLogger(__name__)

class DynamicDailyBriefingEngine:
    """
    Generates dynamic, personalized daily briefings that adapt to:
    1. Real-time environmental conditions
    2. Individual user health profiles
    3. Scientific health thresholds
    4. Personal preferences and lifestyle goals
    """
    
    def __init__(self):
        # WHO/EPA/CDC Scientific Thresholds
        self.thresholds = {
            'pm25': {
                'who_safe': 15.0,      # WHO 24-hour guideline
                'epa_moderate': 35.0,   # EPA moderate threshold
                'epa_unhealthy': 55.0   # EPA unhealthy threshold
            },
            'ozone': {
                'who_safe': 50.0,       # WHO 8-hour guideline (ppb)
                'epa_moderate': 100.0,  # EPA moderate threshold
                'epa_unhealthy': 150.0  # EPA unhealthy threshold
            },
            'no2': {
                'who_safe': 25.0,       # WHO 24-hour guideline (ppb)
                'epa_moderate': 50.0,   # EPA moderate threshold
                'epa_unhealthy': 100.0  # EPA unhealthy threshold
            },
            'humidity': {
                'optimal_low': 30.0,
                'optimal_high': 50.0,
                'high_threshold': 65.0
            },
            'pollen': {
                'low': 30,
                'moderate': 50,
                'high': 70
            }
        }
    
    def generate_daily_briefing(self, environmental_data: Dict, user_profile: Dict) -> str:
        """
        Generate comprehensive dynamic daily briefing
        
        Args:
            environmental_data: Live API data (PM2.5, ozone, pollen, weather, etc.)
            user_profile: User health profile (age, condition, triggers, goals, preferences)
            
        Returns:
            Personalized daily briefing string
        """
        print(f"🚀🚀🚀 generate_daily_briefing called with user_profile condition: '{user_profile.get('condition')}'")
        logger.info(f"🚀 generate_daily_briefing called with user_profile condition: '{user_profile.get('condition')}'")
        try:
            # Step 1: Calculate risk score using premium_lean_engine for consistency
            from services.premium_lean_engine import premium_lean_engine
            risk_analysis = premium_lean_engine.calculate_daily_risk_score(environmental_data)
            score = risk_analysis['risk_score']
            
            # Step 2: Determine primary risk driver
            primary_risk = self._determine_primary_risk(environmental_data)
            logger.info(f"🎯 Primary risk: {primary_risk}, score: {score}")
            
            # Step 3: Generate risk introduction with primary driver
            risk_intro = self._generate_risk_intro(score, user_profile, primary_risk)
            
            # Step 4: Build scientific explanation
            explanation = self._build_explanation(environmental_data, user_profile)
            
            # Step 5: Build personalized action plan
            logger.info(f"📝 About to call _build_action_plan with condition: '{user_profile.get('condition')}'")
            action_plan = self._build_action_plan(primary_risk, environmental_data, user_profile)
            logger.info(f"✅ _build_action_plan returned {len(action_plan)} actions")
            
            # Step 6: Build wellness boost
            wellness = self._build_wellness_boost(user_profile, score, environmental_data)
            
            # Step 7: Assemble final briefing
            user_name = user_profile.get('name', 'there')
            # Add timestamp with local time based on location
            from datetime import datetime
            import pytz
            from timezonefinder import TimezoneFinder
            
            # Get timezone from coordinates
            tf = TimezoneFinder()
            lat = environmental_data.get('lat', 0)
            lon = environmental_data.get('lon', 0)
            timezone_str = tf.timezone_at(lat=lat, lng=lon)
            
            if timezone_str:
                local_tz = pytz.timezone(timezone_str)
                local_time = datetime.now(local_tz).strftime('%I:%M %p')
                time_display = f"{local_time} local time"
            else:
                # Fallback to UTC if timezone not found
                current_time = datetime.utcnow().strftime('%H:%M UTC')
                time_display = current_time
            
            # Format briefing with clear sections and visual hierarchy
            conditions_formatted = explanation.replace(" | ", "\n\n• ")
            
            # Add longevity insight based on conditions
            longevity_insight = ""
            if score < 30:
                longevity_insight = f"\n\n💚 LONGEVITY INSIGHT: {health_kb.longevity_facts['clean_air_benefit']}"
            elif score > 60:
                longevity_insight = f"\n\n⚠️ HEALTH IMPACT: {health_kb.longevity_facts['pollution_cost']}"
            
            # Add weather-specific insights if applicable
            weather_insight = ""
            precipitation = environmental_data.get('precipitation', 0)
            if precipitation > 2:
                weather_insight = f"\n\n🌧️ WEATHER BENEFIT: {health_kb.weather_interactions['rain_benefit']['immediate']}. {health_kb.weather_interactions['rain_benefit']['timing']}"
            
            briefing = (
                f"{risk_intro}\n\n"
                f"{'='*60}\n"
                f"📍 CURRENT CONDITIONS (as of {time_display})\n"
                f"{'='*60}\n\n"
                f"• {conditions_formatted}\n\n"
                f"{'='*60}\n"
                f"🎯 YOUR ACTION PLAN\n"
                f"{'='*60}\n\n"
                + "\n\n".join(action_plan) + "\n\n"
                f"{'='*60}\n"
                f"💪 WELLNESS BOOST\n"
                f"{'='*60}\n\n"
                + "\n\n".join(wellness)
                + longevity_insight
                + weather_insight + "\n\n"
                f"{'='*60}\n\n"
                f"Stay resilient, {user_name} — today's environment is unique, "
                f"but so is your strategy. 💪"
            )
            
            return briefing
            
        except Exception as e:
            import traceback
            print(f"❌❌❌ EXCEPTION in generate_daily_briefing: {e}")
            print(f"❌ Traceback: {traceback.format_exc()}")
            logger.error(f"Error generating dynamic briefing: {e}", exc_info=True)
            return self._generate_fallback_briefing(user_profile)
    
    def _calculate_daily_risk_score(self, data: Dict) -> float:
        """Calculate comprehensive risk score (0-100)"""
        pm25 = data.get('pm25', 0)
        ozone = data.get('ozone', 0)
        no2 = data.get('no2', 0)
        humidity = data.get('humidity', 50)
        pollen = data.get('pollen_level', 0)
        temperature = data.get('temperature', 20)
        
        # Weighted risk components
        pm25_risk = min(40, (pm25 / self.thresholds['pm25']['epa_moderate']) * 40)
        ozone_risk = min(30, (ozone / self.thresholds['ozone']['epa_moderate']) * 30)
        no2_risk = min(20, (no2 / self.thresholds['no2']['epa_moderate']) * 20)
        
        # Weather amplification
        humidity_penalty = max(0, (humidity - self.thresholds['humidity']['high_threshold']) * 0.15)
        temp_penalty = max(0, abs(temperature - 22) * 0.1)
        pollen_penalty = (pollen / 100) * 10
        
        # Synergistic effects
        synergy_bonus = 0
        if pm25 > self.thresholds['pm25']['who_safe'] and ozone > self.thresholds['ozone']['who_safe']:
            synergy_bonus = 15  # Multi-pollutant amplification
        
        total_risk = pm25_risk + ozone_risk + no2_risk + humidity_penalty + temp_penalty + pollen_penalty + synergy_bonus
        return min(100, max(0, total_risk))
    
    def _generate_risk_intro(self, score: float, user_profile: Dict, primary_risk: str = None) -> str:
        """Generate personalized risk introduction with primary risk driver"""
        from datetime import datetime
        import pytz
        from timezonefinder import TimezoneFinder
        
        user_name = user_profile.get('name', 'there')
        condition = user_profile.get('condition', '').lower()
        
        # Check if user has asthma or respiratory condition
        has_asthma = 'asthma' in condition
        has_allergies = 'allerg' in condition or 'pollen' in str(user_profile.get('triggers', []))
        
        # Determine time of day based on location
        lat = user_profile.get('lat', 0)
        lon = user_profile.get('lon', 0)
        tf = TimezoneFinder()
        timezone_str = tf.timezone_at(lat=lat, lng=lon)
        
        greeting = "Hello"
        if timezone_str:
            local_tz = pytz.timezone(timezone_str)
            local_hour = datetime.now(local_tz).hour
            if 5 <= local_hour < 12:
                greeting = "Good morning"
            elif 12 <= local_hour < 17:
                greeting = "Good afternoon"
            elif 17 <= local_hour < 21:
                greeting = "Good evening"
            else:
                greeting = "Hello"
        
        # Add primary risk driver note if available
        risk_driver_note = f" (driven by {primary_risk})" if primary_risk else ""
        
        # Generate appropriate intro based on health status - be specific about what's causing the risk
        if has_asthma:
            # Asthma-specific messaging
            condition_text = condition if 'asthma' in condition else f"{condition} asthma"
            if score < 25:
                return f"{greeting}, {user_name}! ☀️ Today's breathing risk is LOW for your {condition_text}. Great day for outdoor activities."
            elif score < 50:
                return f"{greeting}, {user_name}. ⚠️ Today's breathing risk is MODERATE for your {condition_text}{risk_driver_note}. Take standard precautions."
            elif score < 75:
                return f"{greeting}, {user_name}. 🚨 Today's breathing risk is HIGH for your {condition_text}{risk_driver_note}. Extra caution needed."
            else:
                return f"{greeting}, {user_name}. 🔴 Today's breathing risk is VERY HIGH for your {condition_text}{risk_driver_note}. Limit outdoor exposure."
        else:
            # General wellness messaging - be specific about what's elevated
            if score < 25:
                return f"{greeting}, {user_name}! ☀️ Air quality is EXCELLENT today. Perfect conditions for outdoor activities and exercise."
            elif score < 50:
                if primary_risk:
                    return f"{greeting}, {user_name}. ⚠️ {primary_risk.title()} levels are ELEVATED today. Some precautions recommended for outdoor activities."
                else:
                    return f"{greeting}, {user_name}. ⚠️ Air quality is MODERATE today. Some precautions recommended for outdoor activities."
            elif score < 75:
                if primary_risk:
                    return f"{greeting}, {user_name}. 🚨 {primary_risk.title()} levels are UNHEALTHY today. Limit outdoor exposure and take protective measures."
                else:
                    return f"{greeting}, {user_name}. 🚨 Air quality is UNHEALTHY today. Limit outdoor exposure and take protective measures."
            else:
                if primary_risk:
                    return f"{greeting}, {user_name}. 🔴 {primary_risk.title()} levels are VERY UNHEALTHY today. Minimize outdoor activities and protect your respiratory health."
                else:
                    return f"{greeting}, {user_name}. 🔴 Air quality is VERY UNHEALTHY today. Minimize outdoor activities and protect your respiratory health."
    
    def _build_explanation(self, data: Dict, user_profile: Dict) -> str:
        """Build comprehensive scientific explanation using ALL environmental factors"""
        parts = []
        
        # Extract ALL environmental data
        pm25 = data.get('pm25', 0)
        pm10 = data.get('pm10', 0)
        ozone = data.get('ozone', 0)
        no2 = data.get('no2', 0)
        so2 = data.get('so2', 0)
        co = data.get('co', 0)
        nh3 = data.get('nh3', 0)
        pollen = data.get('pollen_level', 0)
        humidity = data.get('humidity', 50)
        temperature = data.get('temperature', 20)
        wind_speed = data.get('wind_speed', 0)
        pressure = data.get('pressure', 1013)
        precipitation = data.get('precipitation', 0)
        uv_index = data.get('uv_index', 0)
        
        # PM2.5 insights with health effects - context-aware messaging
        if pm25 > self.thresholds['pm25']['epa_unhealthy']:
            parts.append(f"Tiny particles (PM2.5) are {pm25:.1f} - UNHEALTHY. Health effects: These microscopic particles penetrate deep into lungs, causing inflammation, triggering attacks, and reducing oxygen absorption. Can worsen breathing within 30 minutes.")
        elif pm25 > self.thresholds['pm25']['epa_moderate']:
            parts.append(f"Tiny particles (PM2.5) are {pm25:.1f} - MODERATE. Health effects: Irritates airways, causes coughing and chest tightness during exercise. Sensitive individuals may experience shortness of breath.")
        elif pm25 > self.thresholds['pm25']['who_safe']:
            parts.append(f"Tiny particles (PM2.5) are {pm25:.1f} - slightly elevated. Health effects: May cause mild throat irritation and increased mucus production in sensitive individuals.")
        else:
            # Check if other pollutants are high - if so, clarify PM2.5 is good but not the whole picture
            if ozone > 80 or no2 > 80 or pollen > 60:
                parts.append(f"Tiny particles (PM2.5) are {pm25:.1f} - EXCELLENT ✓. However, other pollutants are elevated (see below).")
            else:
                parts.append(f"Tiny particles (PM2.5) are {pm25:.1f} - EXCELLENT ✓. Air is clean for outdoor exercise.")
        
        # PM10 insights (dust particles) - with health effects from knowledge base
        pm10_effect = health_kb.get_pm10_health_effect(pm10)
        if pm10_effect:
            parts.append(f"Dust (PM10) is {pm10:.1f} μg/m³. {pm10_effect}")
        
        # Ozone insights (smog) - ALWAYS show with health effects (current conditions only)
        if ozone > self.thresholds['ozone']['epa_unhealthy']:
            parts.append(f"Smog (Ozone) is {ozone:.0f} ppb - UNHEALTHY right now. Causes chest tightness, coughing, and reduces lung function by 15%. Avoid outdoor exercise.")
        elif ozone > self.thresholds['ozone']['epa_moderate']:
            parts.append(f"Smog (Ozone) is {ozone:.0f} ppb - MODERATE right now. Reduces lung function 10-15% during exercise. Note: Ozone typically peaks 2-6 PM.")
        elif ozone > self.thresholds['ozone']['who_safe']:
            parts.append(f"Smog (Ozone) is {ozone:.0f} ppb - slightly elevated right now. Can irritate airways during heavy exercise. Note: Levels may rise later in the day.")
        elif ozone > 0:
            parts.append(f"Smog (Ozone) is {ozone:.0f} ppb - low right now. Note: Ozone typically increases during daytime, peaking 2-6 PM.")
        
        # NO₂ insights (car exhaust) - ALWAYS show with health effects
        if no2 > self.thresholds['no2']['epa_moderate']:
            parts.append(f"Car exhaust (NO₂) is {no2:.0f} ppb - HIGH. Irritates lungs and increases respiratory infections by 30%. Avoid busy roads.")
        elif no2 > self.thresholds['no2']['who_safe']:
            parts.append(f"Car exhaust (NO₂) is {no2:.0f} ppb - elevated. Can worsen asthma symptoms. Exercise 2+ blocks from highways.")
        elif no2 > 0:
            parts.append(f"Car exhaust (NO₂) is {no2:.0f} ppb - low. Minimal traffic pollution impact.")
        
        # SO₂ insights (factory smoke) - ALWAYS show with specific health effects
        if so2 > 75:
            parts.append(f"Factory smoke (SO₂) is {so2:.0f} ppb - HIGH. Causes airway constriction within minutes. Can trigger severe asthma attacks. Hospital visits increase 15%.")
        elif so2 > 40:
            parts.append(f"Factory smoke (SO₂) is {so2:.0f} ppb - MODERATE. Irritates airways and worsens breathing difficulty in sensitive individuals.")
        elif so2 > 0:
            parts.append(f"Factory smoke (SO₂) is {so2:.0f} ppb - low. Minimal industrial pollution.")
        
        # CO insights (carbon monoxide) - ALWAYS show with specific health effects
        if co > 9000:
            parts.append(f"Carbon monoxide (CO) is {co:.0f} μg/m³ - HIGH. Reduces oxygen delivery causing headaches, dizziness, and worsens asthma. Avoid heavy exercise.")
        elif co > 4000:
            parts.append(f"Carbon monoxide (CO) is {co:.0f} μg/m³ - MODERATE. Can reduce exercise capacity and worsen breathing in people with lung conditions.")
        elif co > 0:
            parts.append(f"Carbon monoxide (CO) is {co:.0f} μg/m³ - low. Minimal impact from car emissions.")
        
        # NH₃ insights (ammonia) - ALWAYS show with specific health effects
        if nh3 > 200:
            parts.append(f"Ammonia (NH₃) is {nh3:.0f} μg/m³ - HIGH. Irritates eyes, nose, throat and airways. Triggers coughing and breathing difficulty.")
        elif nh3 > 0:
            parts.append(f"Ammonia (NH₃) is {nh3:.0f} μg/m³ - low. Minimal agricultural emissions.")
        
        # Pollen (allergy triggers) - ALWAYS show with specific health effects
        if pollen > self.thresholds['pollen']['high']:
            if humidity > self.thresholds['humidity']['high_threshold']:
                parts.append(f"Pollen is HIGH ({pollen:.0f}/100) with {humidity:.0f}% humidity. Triggers sneezing, itchy eyes, runny nose, and can worsen breathing. Humid air makes pollen stay airborne 3x longer and swell, releasing more allergens.")
            else:
                parts.append(f"Pollen is HIGH ({pollen:.0f}/100). Triggers sneezing, itchy eyes, runny nose, and worsens respiratory symptoms. Allergy medication use increases 50% at this level.")
        elif pollen > self.thresholds['pollen']['moderate']:
            if humidity > self.thresholds['humidity']['high_threshold']:
                parts.append(f"Pollen is MODERATE ({pollen:.0f}/100) with {humidity:.0f}% humidity. Can trigger mild allergy symptoms (sneezing, itchy eyes). Humid air makes pollen more reactive and harder to avoid.")
            else:
                parts.append(f"Pollen is MODERATE ({pollen:.0f}/100). Can trigger mild allergy symptoms in sensitive individuals. Exercise early morning (6-8 AM) when pollen counts are 60% lower.")
        elif pollen > 0:
            parts.append(f"Pollen is LOW ({pollen:.0f}/100). Minimal allergy impact today. Good conditions for outdoor activities.")
        
        # Temperature effects (show both C and F)
        temp_f = (temperature * 9/5) + 32
        if temperature > 30 and humidity > 70:
            parts.append(f"It's HOT ({temperature:.0f}°C / {temp_f:.0f}°F) and HUMID ({humidity:.0f}%) - this combo makes it hard to breathe and you can overheat. Limit outdoor activity and drink lots of water.")
        elif temperature < 10:
            parts.append(f"It's COLD ({temperature:.0f}°C / {temp_f:.0f}°F) - cold air can make your airways tighten up. Warm up slowly and breathe through a scarf.")
        elif temperature > 30:
            parts.append(f"It's HOT ({temperature:.0f}°C / {temp_f:.0f}°F) - heat makes air pollution worse. Stay hydrated and exercise when it's cooler.")
        
        # Wind effects with health implications (show both km/h and mph)
        wind_mph = wind_speed * 0.621371
        if wind_speed > 25:
            parts.append(f"VERY STRONG WINDS ({wind_speed:.0f} km/h / {wind_mph:.0f} mph) - disperses pollution away from ground level (good) but stirs up dust and pollen (bad for allergies). Net effect: May trigger coughing and eye irritation in sensitive individuals.")
        elif wind_speed > 15:
            parts.append(f"MODERATE WINDS ({wind_speed:.0f} km/h / {wind_mph:.0f} mph) - helps disperse pollutants naturally. Good for air quality.")
        elif wind_speed < 8 and (pm25 > 15 or ozone > 60):
            parts.append(f"CALM CONDITIONS ({wind_speed:.0f} km/h / {wind_mph:.0f} mph) - very light wind can't disperse pollutants effectively. Health impact: Pollutants accumulate at ground level. With normal wind (15+ km/h), concentrations would be 40-60% lower. Stagnant air increases exposure.")
        elif wind_speed < 8:
            parts.append(f"CALM CONDITIONS ({wind_speed:.0f} km/h / {wind_mph:.0f} mph) - very light wind today. Pollutants may linger longer than usual.")
        
        # Pressure effects (weather patterns)
        if pressure > 1020 and (pm25 > 25 or ozone > 80):
            parts.append(f"High air pressure ({pressure:.0f} mb) - creates temperature inversion that traps pollution at ground level. Pollutants can't disperse upward, making concentrations higher than normal.")
        
        # Rain effects (natural air cleaner)
        if precipitation > 5:
            parts.append(f"RAIN ({precipitation:.0f} mm) - great news! Rain washes pollution out of the air. Air quality gets 40-60% better within 30 minutes.")
        
        # UV/Sun warnings
        if uv_index > 8:
            parts.append(f"Sun is VERY STRONG (UV {uv_index:.0f}) - you can get sunburned quickly. Use sunscreen and stay in shade 10 AM-4 PM.")
        elif uv_index > 6:
            parts.append(f"Sun is STRONG (UV {uv_index:.0f}) - use sunscreen if you're outside for a while.")
        
        # DANGEROUS COMBINATIONS (when multiple bad things happen together)
        # Get pollutant interactions from knowledge base with specific health effects
        pollutant_interactions = health_kb.get_pollutant_interaction(pm25, ozone, no2, so2)
        
        synergies = []
        
        # Add knowledge base pollutant interactions with health effects
        for interaction in pollutant_interactions:
            synergies.append(f"⚠️ {interaction['combo']}: {interaction['effect']} ({interaction['mechanism']})")
        
        # Weather + pollutant interactions with detailed health effects (LOWER THRESHOLDS)
        
        # PM2.5 + PM10 interaction
        pm10 = data.get('pm10', 0)
        if pm25 > 15 and pm10 > 50:
            synergies.append(f"⚠️ PM2.5 ({pm25:.1f}) + PM10 ({pm10:.1f}) INTERACTION: Fine + coarse particles together. Health effects: PM2.5 penetrates deep into lungs while PM10 irritates upper airways. Combined effect causes coughing, wheezing, and increased mucus production. 40% worse than either alone.")
        
        # PM2.5 + Ozone interaction
        if pm25 > 15 and ozone > 40:
            synergies.append(f"⚠️ PM2.5 ({pm25:.1f}) + Ozone ({ozone:.0f} ppb) INTERACTION: Particles + gas pollutants amplify each other. Health effects: Ozone damages lung tissue, making it more vulnerable to PM2.5 penetration. Combined effect reduces lung function by 25% (vs 15% from ozone alone). Risk of asthma attacks increases 3x.")
        
        # PM2.5 + NO₂ interaction
        if pm25 > 15 and no2 > 20:
            synergies.append(f"⚠️ PM2.5 ({pm25:.1f}) + NO₂ ({no2:.0f} ppb) INTERACTION: Particles + traffic exhaust. Health effects: NO₂ inflames airways, allowing PM2.5 to penetrate deeper. Increases respiratory infections by 30%. Children and elderly most vulnerable.")
        
        # Humid + pollen
        if humidity > 60 and pollen > 30:
            synergies.append(f"⚠️ Humidity ({humidity:.0f}%) + Pollen INTERACTION: Moisture makes pollen grains swell and burst, releasing 3x more allergens. Health effects: Severe sneezing, runny nose, itchy eyes, potential asthma attacks. Symptoms 50% worse than dry conditions.")
        
        # Heat + ozone (with F conversion)
        temp_f = (temperature * 9/5) + 32
        if temperature > 25 and ozone > 40:
            synergies.append(f"⚠️ Heat ({temperature:.0f}°C / {temp_f:.0f}°F) + Ozone ({ozone:.0f} ppb) INTERACTION: Sunlight + heat accelerates ozone formation from car exhaust. Health effects: Ozone levels will continue rising throughout the day, reaching peak concentrations between 2-6 PM. Causes chest tightness, coughing, 15-20% reduction in lung function. Avoid outdoor exercise during peak hours.")
        
        # Low wind + pollution (with mph conversion)
        wind_mph = wind_speed * 0.621371
        if wind_speed < 10 and pm25 > 15:
            synergies.append(f"⚠️ Low wind ({wind_speed:.0f} km/h / {wind_mph:.0f} mph) + PM2.5 ({pm25:.1f}) INTERACTION: Weak wind can't disperse pollutants. Health effects: Pollutants accumulate at breathing level. With normal wind (15+ km/h), PM2.5 would be {pm25*0.6:.1f}. Prolonged exposure worsens asthma, causes chest tightness.")
        
        # Cold + humid (with F conversion)
        if temperature < 10 and humidity > 60:
            synergies.append(f"⚠️ Cold ({temperature:.0f}°C / {temp_f:.0f}°F) + Humidity ({humidity:.0f}%) INTERACTION: Cold air constricts airways while moisture triggers bronchospasm. Health effects: Double trigger causes rapid airway narrowing, wheezing, shortness of breath within minutes. Breathe through warm scarf to pre-warm air.")
        
        # High pressure + pollution (temperature inversion)
        if pressure > 1015 and pm25 > 15:
            synergies.append(f"⚠️ High pressure ({pressure:.0f} mb) + PM2.5 ({pm25:.1f}) INTERACTION: Temperature inversion traps polluted air under cool air layer. Health effects: Pollutants can't escape upward, concentrating at ground level. Creates 'pollution dome' - prolonged exposure worsens respiratory symptoms throughout the day.")
        
        # Solar radiation + ozone
        if uv_index > 3 and ozone > 30:
            synergies.append(f"⚠️ UV (index {uv_index}) + Ozone ({ozone:.0f} ppb) INTERACTION: UV radiation drives photochemical reactions, creating ozone from car exhaust (NO₂). Health effects: Forms photochemical smog that irritates eyes, nose, throat, damages lung tissue. Worst 11 AM-3 PM when sun is strongest.")
        
        # Strong wind + PM10/dust (with mph conversion)
        if wind_speed > 20 and pm10 > 50:
            synergies.append(f"⚠️ Strong wind ({wind_speed:.0f} km/h / {wind_mph:.0f} mph) + PM10 ({pm10:.1f}) INTERACTION: Wind stirs up dust and coarse particles. Health effects: While wind disperses PM2.5 (good), it increases PM10 exposure (bad). Causes eye irritation, coughing, throat irritation. Wear sunglasses, avoid dusty areas.")
        
        # Rain + PM2.5 (positive interaction)
        if precipitation > 1 and pm25 > 12:
            synergies.append(f"✅ Rain ({precipitation:.0f} mm) + PM2.5 ({pm25:.1f}) BENEFIT: Raindrops capture and remove particles from air (wet deposition). Health effects: PM2.5 will drop to ~{pm25*0.5:.1f} within 30 minutes. Breathing becomes easier, coughing reduces. Great time for outdoor activity after rain stops!")
        
        # Rain + Pollen (positive interaction)
        if precipitation > 0.5 and pollen > 30:
            synergies.append(f"✅ Rain ({precipitation:.0f} mm) + Pollen BENEFIT: Rain washes pollen from air. Health effects: Pollen counts drop by 60-80% during rain. Allergy symptoms improve significantly. Best time for outdoor activity is during or right after rain.")
        
        # Pollen + Humidity (already covered above, but add if not triggered)
        if pollen > 40 and humidity > 60 and not any('Pollen' in s for s in synergies):
            synergies.append(f"⚠️ Pollen ({pollen:.0f}) + Humidity ({humidity:.0f}%) INTERACTION: Moisture makes pollen grains absorb water and burst. Health effects: Releases more allergens into air. Expect sneezing, itchy eyes, runny nose. Keep windows closed, use air purifier.")
        
        # UV + Pollen
        if uv_index > 5 and pollen > 40:
            synergies.append(f"⚠️ UV (index {uv_index}) + Pollen INTERACTION: Strong sunlight increases pollen release from plants. Health effects: Pollen counts peak midday when UV is strongest. Worst allergy symptoms 10 AM-4 PM. Exercise early morning or evening.")
        
        # Snow/Cold + Pollution (winter inversion) (with F conversion)
        if temperature < 5 and pm25 > 20:
            synergies.append(f"⚠️ Cold ({temperature:.0f}°C / {temp_f:.0f}°F) + PM2.5 ({pm25:.1f}) INTERACTION: Cold air creates temperature inversion, trapping pollution at ground level. Health effects: Pollutants concentrate in breathing zone. Cold also constricts airways. Double impact on respiratory system. Stay indoors, use air purifier.")
        
        # Solar radiation + Temperature + Ozone (photochemical smog formation) (with F conversion)
        if uv_index > 6 and temperature > 25 and ozone > 60:
            synergies.append(f"⚠️ UV ({uv_index}) + Heat ({temperature:.0f}°C / {temp_f:.0f}°F) + Ozone ({ozone:.0f} ppb) TRIPLE INTERACTION: Perfect conditions for photochemical smog formation. Health effects: Ozone will continue rising throughout afternoon, reaching dangerous levels. Causes severe respiratory irritation. Avoid all outdoor activity 11 AM-6 PM.")
        
        # NEW INTERACTIONS - More pollutant combinations
        
        # SO₂ + PM2.5 interaction
        if so2 > 20 and pm25 > 15:
            synergies.append(f"⚠️ SO₂ ({so2:.0f} ppb) + PM2.5 ({pm25:.1f}) INTERACTION: Sulfur dioxide + particles create acidic aerosols. Health effects: Irritates airways more than either pollutant alone. Causes coughing, chest tightness, worsens asthma. Industrial areas most affected.")
        
        # CO + PM2.5 interaction
        if co > 1000 and pm25 > 15:
            synergies.append(f"⚠️ CO ({co:.0f} μg/m³) + PM2.5 ({pm25:.1f}) INTERACTION: Carbon monoxide reduces oxygen delivery while particles inflame lungs. Health effects: Increased fatigue, headaches, shortness of breath. Traffic-heavy areas most affected. Avoid rush hour exercise.")
        
        # NO₂ + Ozone interaction
        if no2 > 40 and ozone > 50:
            synergies.append(f"⚠️ NO₂ ({no2:.0f} ppb) + Ozone ({ozone:.0f} ppb) INTERACTION: Traffic exhaust + photochemical smog. Health effects: Both irritate airways independently, combined they reduce lung function by 30%. Causes wheezing, chest pain. Peak danger 12-4 PM near roads.")
        
        # High humidity + PM2.5 interaction
        if humidity > 70 and pm25 > 20:
            synergies.append(f"⚠️ High Humidity ({humidity:.0f}%) + PM2.5 ({pm25:.1f}) INTERACTION: Moisture makes particles stick to airways longer. Health effects: Particles absorb water, become heavier, settle deeper in lungs. Harder to clear. Increases infection risk by 25%.")
        
        # Temperature inversion + multiple pollutants
        if pressure > 1020 and (pm25 > 20 or no2 > 40 or ozone > 50):
            synergies.append(f"⚠️ TEMPERATURE INVERSION (Pressure {pressure:.0f} mb): Warm air layer traps ALL pollutants at ground level. Health effects: PM2.5, NO₂, and Ozone concentrate in breathing zone. Air quality will worsen throughout day. Stay indoors, close windows, use air purifier.")
        
        # Pollen + Ozone interaction
        if pollen > 40 and ozone > 50:
            synergies.append(f"⚠️ Pollen ({pollen:.0f}) + Ozone ({ozone:.0f} ppb) INTERACTION: Ozone damages pollen grains, making them release more allergens. Health effects: Allergy symptoms 40% worse than pollen alone. Causes severe sneezing, itchy eyes, asthma attacks. Worst 11 AM-3 PM.")
        
        # Pollen + NO₂ interaction
        if pollen > 40 and no2 > 40:
            synergies.append(f"⚠️ Pollen ({pollen:.0f}) + NO₂ ({no2:.0f} ppb) INTERACTION: Traffic exhaust makes pollen more allergenic. Health effects: NO₂ modifies pollen proteins, increasing allergic reactions by 50%. Living near busy roads worsens seasonal allergies significantly.")
        
        # PM10 + Ozone interaction
        if pm10 > 50 and ozone > 50:
            synergies.append(f"⚠️ PM10 ({pm10:.1f}) + Ozone ({ozone:.0f} ppb) INTERACTION: Coarse dust + gas pollutant. Health effects: PM10 irritates upper airways while ozone damages deep lung tissue. Combined effect causes coughing, throat irritation, reduced exercise capacity. Avoid dusty outdoor areas.")
        
        # Extreme heat + multiple pollutants
        if temperature > 32 and (pm25 > 20 or ozone > 60):
            synergies.append(f"⚠️ EXTREME HEAT ({temperature:.0f}°C / {temp_f:.0f}°F) + POLLUTION: Heat stress + air pollution = dangerous combination. Health effects: Body struggles to cool itself while fighting pollution. Risk of heat exhaustion, respiratory distress. Stay indoors in AC, drink water, avoid all outdoor activity.")
        
        if synergies:
            parts.extend(synergies)
        
        return " | ".join(parts) if parts else f"Air quality is excellent today (PM2.5: {pm25:.1f} µg/m³, Ozone: {ozone:.0f} ppb). Perfect conditions for outdoor activities."
    
    def _determine_primary_risk(self, data: Dict) -> str:
        """Determine the primary environmental risk driver with user-friendly name"""
        pm25 = data.get('pm25', 0)
        pm10 = data.get('pm10', 0)
        ozone = data.get('ozone', 0)
        pollen = data.get('pollen_level', 0)
        no2 = data.get('no2', 0)
        so2 = data.get('so2', 0)
        co = data.get('co', 0)
        temperature = data.get('temperature', 20)
        humidity = data.get('humidity', 50)
        
        # Map pollutants to user-friendly names
        risk_names = {
            'pm25': 'tiny particles (PM2.5)',
            'pm10': 'dust (PM10)',
            'ozone': 'smog (Ozone)',
            'no2': 'car exhaust (NO₂)',
            'so2': 'factory smoke (SO₂)',
            'co': 'carbon monoxide (CO)',
            'pollen': 'pollen',
            'temperature': 'heat',
            'humidity': 'humidity',
            'temp_humidity': 'heat + humidity'
        }
        
        # Calculate actual risk contribution for each factor (matching risk calculation)
        risks = []
        
        # Pollutants - use WHO safe thresholds for detection
        if pm25 > self.thresholds['pm25']['who_safe']:
            risks.append(('pm25', (pm25 / self.thresholds['pm25']['epa_moderate']) * 40))
        if pm10 > 50:
            risks.append(('pm10', (pm10 / 50) * 20))
        if ozone > self.thresholds['ozone']['who_safe']:
            risks.append(('ozone', (ozone / self.thresholds['ozone']['epa_moderate']) * 30))
        if pollen > self.thresholds['pollen']['moderate']:  # Lower threshold!
            risks.append(('pollen', (pollen / 100) * 10))
        if no2 > self.thresholds['no2']['who_safe']:
            risks.append(('no2', (no2 / self.thresholds['no2']['epa_moderate']) * 20))
        if so2 > 20:  # Lower threshold
            risks.append(('so2', (so2 / 40) * 15))
        if co > 2000:  # Lower threshold
            risks.append(('co', (co / 4000) * 10))
        
        # Weather factors
        if temperature > 30 and humidity > 70:
            risks.append(('temp_humidity', abs(temperature - 22) * 0.1 + (humidity - 70) * 0.15))
        elif temperature > 30:
            risks.append(('temperature', abs(temperature - 22) * 0.1))
        elif humidity > 70:
            risks.append(('humidity', (humidity - 70) * 0.15))
        
        if not risks:
            return None
        
        # Return highest actual risk contribution with user-friendly name
        risks.sort(key=lambda x: x[1], reverse=True)
        primary = risks[0][0]
        return risk_names.get(primary, primary)
    
    def _build_action_plan(self, primary_risk: str, data: Dict, user_profile: Dict) -> List[str]:
        """Build personalized action plan based on primary risk and user profile"""
        logger.info(f"🎯 _build_action_plan - primary_risk: '{primary_risk}'")
        
        # Use the comprehensive action variations system (300+ unique actions)
        actions = action_variations.get_action_plan(primary_risk, data, user_profile)
        
        # Add medication reminders for asthma users
        condition = user_profile.get('condition', '')
        has_asthma = bool(condition and condition.strip())
        
        if has_asthma and ('severe' in condition.lower() or 'moderate' in condition.lower()):
            from services.premium_lean_engine import premium_lean_engine
            risk_analysis = premium_lean_engine.calculate_daily_risk_score(data)
            score = risk_analysis['risk_score']
            
            if score > 75:
                kb_guidance = health_kb.get_exercise_guidance(score)
                actions.append(f"💊 {kb_guidance['medication']}")
            elif score > 40:
                med_facts = health_kb.medication_facts['preventive']
                actions.append(f"💊 {med_facts['timing']} — {med_facts['effectiveness']}")
        
        return actions if actions else ["✅ Conditions are good — enjoy your day with normal precautions"]
        
        # Adapt actions to primary risk with variations
        if primary_risk == 'pm25':
            if pm25 > self.thresholds['pm25']['epa_unhealthy']:
                indoor_actions = [
                    "🏠 STAY INDOORS — PM2.5 at this level can inflame airways in 30 minutes",
                    "🏠 Indoor day recommended — outdoor PM2.5 can trigger asthma attacks within 20-30 minutes",
                    "🏠 Avoid outdoor activities — PM2.5 levels cause immediate respiratory distress"
                ]
                mask_actions = [
                    "😷 N95 mask essential for any outdoor errands (blocks 95% of particles)",
                    "😷 Wear N95/KN95 mask if you must go outside — surgical masks won't protect against PM2.5",
                    "😷 N95 respirator required for outdoor exposure — fit test for proper seal"
                ]
                purifier_actions = [
                    "💨 Run air purifier on high — reduces indoor PM2.5 by 80%",
                    "💨 Keep air purifier running continuously — change to high setting",
                    "💨 Close windows and run HEPA air purifier — creates clean air sanctuary"
                ]
                actions.append(random.choice(indoor_actions))
                actions.append(random.choice(mask_actions))
                actions.append(random.choice(purifier_actions))
            elif pm25 > self.thresholds['pm25']['epa_moderate']:
                route_actions = [
                    "🛣️ Choose exercise routes away from traffic — cuts PM2.5 exposure by 60%",
                    "🌳 Exercise in parks away from roads — trees filter PM2.5 by 30-50%",
                    "🚶 Walk on side streets, not main roads — reduces PM2.5 exposure significantly"
                ]
                timing_actions = [
                    "⏱️ Limit outdoor activity to 20-30 minutes maximum",
                    "⏰ Keep outdoor sessions brief (under 30 min) — longer exposure worsens symptoms",
                    "🕐 Short outdoor sessions only — return indoors if you feel chest tightness"
                ]
                mask_actions = [
                    "😷 Consider N95 mask for outdoor exercise",
                    "😷 N95 mask recommended if exercising near roads",
                    "😷 Wear mask if you're sensitive to air pollution"
                ]
                actions.append(random.choice(route_actions))
                actions.append(random.choice(timing_actions))
                actions.append(random.choice(mask_actions))
        
        elif primary_risk == 'ozone':
            if ozone > self.thresholds['ozone']['epa_unhealthy']:
                actions.append("🏠 Indoor activities only — ozone this high causes chest tightness even at rest")
                actions.append("🪟 Keep windows closed, especially 12-6 PM when ozone peaks")
                actions.append("💊 Have rescue inhaler accessible at all times")
            elif ozone > self.thresholds['ozone']['epa_moderate']:
                actions.append("⏰ Exercise 6-9 AM when ozone drops 40% below afternoon levels")
                actions.append("🚫 Avoid outdoor activity 12-6 PM (ozone peak causes 3x more symptoms)")
                actions.append("🌳 If afternoon needed: stay in shade, reduces exposure 25%")
        
        elif primary_risk == 'pollen':
            actions.append("🕐 Exercise early morning (6-8 AM) when pollen counts are lowest")
            actions.append("🪟 Keep windows shut 10 AM-6 PM (blocks 60% of indoor pollen)")
            actions.append("🚿 Shower after outdoor activity to remove pollen from hair and skin")
            if humidity > self.thresholds['humidity']['high_threshold']:
                actions.append(f"💧 Humidity at {humidity:.0f}% makes pollen more reactive — extra precautions needed")
        
        elif primary_risk == 'no2':
            actions.append("🚗 Choose exercise routes >500m from highways (reduces NO₂ exposure 70%)")
            actions.append("🏞️ Parks and green spaces have 60% less NO₂ than roadside routes")
            actions.append("⏰ Avoid rush hours (7-9 AM, 4-7 PM) when traffic emissions peak")
        
        elif 'pollen' in str(primary_risk):
            actions.append("🕐 Exercise early morning (6-8 AM) when pollen counts are lowest")
            actions.append("🪟 Keep windows shut 10 AM-6 PM (blocks 60% of indoor pollen)")
            actions.append("🚿 Shower after outdoor activity to remove pollen from hair and skin")
            if humidity > 70:
                actions.append(f"💧 Humidity at {humidity:.0f}% makes pollen more reactive — extra precautions needed")
        
        elif 'heat' in str(primary_risk) or 'temperature' in str(primary_risk):
            actions.append("🌅 Exercise early morning (6-8 AM) or evening (after 7 PM) when cooler")
            actions.append("💧 Drink water before, during, and after activity — heat increases dehydration risk")
            actions.append("🌳 Stay in shade — reduces heat exposure by 10-15°C")
            actions.append("⏱️ Limit outdoor sessions to 20-30 minutes maximum")
        
        else:
            # General low-moderate risk actions with variations FROM KNOWLEDGE BASE
            if score < 25:
                # Use knowledge base for low risk guidance
                kb_guidance = health_kb.get_exercise_guidance(score)
                excellent_actions = [
                    [f"🏃 {kb_guidance['duration']}", f"🌳 {kb_guidance['location']}", f"💪 {kb_guidance['benefit']}"],
                    ["🚴 Great day for longer outdoor workout — take advantage of clean air!", f"🏞️ {kb_guidance['location']}", f"⚡ {kb_guidance['longevity']}"],
                    [f"🏃‍♀️ {kb_guidance['duration']} — ideal conditions", "🌲 Forest paths have 50% cleaner air than urban streets", f"🎯 {kb_guidance['benefit']}"]
                ]
                actions.extend(random.choice(excellent_actions))
            elif score < 50:
                # Moderate risk with variations
                timing_options = [
                    "🌅 Best exercise window: 6-9 AM when air quality is freshest",
                    "⏰ Morning exercise recommended (6-9 AM) — pollution lowest then",
                    "🌄 Early morning best — air quality deteriorates throughout day"
                ]
                duration_options = [
                    "⏱️ Limit outdoor sessions to 30-40 minutes, monitor how you feel",
                    "🕐 Keep workouts under 40 minutes — stop if you feel chest tightness",
                    "⏳ Moderate duration (30-40 min) — pay attention to breathing"
                ]
                route_options = [
                    "🛣️ Choose routes away from busy roads (reduces NO₂ exposure 70%)",
                    "🌳 Stick to parks and residential areas — avoid highways",
                    "🚶 Side streets and greenways have 60% less traffic pollution"
                ]
                actions.append(random.choice(timing_options))
                actions.append(random.choice(duration_options))
                actions.append(random.choice(route_options))
                if 'pollen' in triggers:
                    pollen_actions = [
                        "🚿 Shower after outdoor activity to remove pollen from hair and skin",
                        "👕 Change clothes after outdoor exercise — pollen clings to fabric",
                        "🧴 Rinse face and hands after being outside — removes pollen"
                    ]
                    actions.append(random.choice(pollen_actions))
        
        # Add medication reminder ONLY for users with asthma
        # If condition is set (not empty), user has asthma (condition is severity level like 'severe', 'moderate', etc.)
        has_asthma = bool(condition and condition.strip())
        
        # Debug logging
        print(f"🔍🔍🔍 Medication check - condition: '{condition}', has_asthma: {has_asthma}, score: {score}")
        logger.info(f"🔍 Medication check - condition: '{condition}', has_asthma: {has_asthma}, score: {score}")
        
        if has_asthma and ('severe' in condition.lower() or 'moderate' in condition.lower()):
            logger.info(f"✅ Adding asthma medication advice for {condition}")
            # Add medication advice based on risk score
            if score > 75:
                # Very high risk - strong medication reminder
                kb_guidance = health_kb.get_exercise_guidance(score)
                actions.append(f"💊 {kb_guidance['medication']}")
                actions.append(f"🆘 {kb_guidance['emergency']}")
                logger.info(f"Added high-risk medication: {kb_guidance['medication']}")
            elif score > 40:
                # Moderate-high risk - preventive medication
                med_facts = health_kb.medication_facts['preventive']
                actions.append(f"💊 {med_facts['timing']} — {med_facts['effectiveness']}")
                # Add rescue inhaler reminder
                rescue_facts = health_kb.medication_facts['rescue']
                actions.append(f"🆘 {rescue_facts['carry']}")
                logger.info(f"Added moderate-risk medication")
            elif score > 25:
                # Low-moderate risk - basic reminder
                actions.append("💊 Keep rescue inhaler accessible during outdoor activities")
                logger.info(f"Added low-risk medication reminder")
        else:
            logger.info(f"❌ No asthma medication added - has_asthma: {has_asthma}, condition: '{condition}'")
        
        if not has_asthma and score > 50:
            # For healthy users in poor air quality, add general protective measures
            if score > 75:
                actions.append("😷 Consider N95 mask for essential outdoor activities — blocks 95% of harmful particles")
                actions.append("🏠 Stay indoors when possible — indoor air is 5x cleaner with proper ventilation")
            elif score > 60:
                actions.append("😷 Wear mask if exercising outdoors — reduces pollutant exposure by 70%")
        
        # Add fitness goal-specific advice
        if 'run' in fitness_goal.lower():
            if score > 60:
                actions.append("🏃 Consider treadmill/indoor training today — lungs recover faster indoors")
            elif score > 40:
                actions.append("🏃 Reduce pace by 20% and use 'talk test' — if can't speak comfortably, slow down")
        
        return actions if actions else ["✅ Conditions are good — enjoy your day with normal precautions"]
    
    def _build_wellness_boost(self, user_profile: Dict, score: float, data: Dict) -> List[str]:
        """Build personalized wellness tips with daily variation (300+ variations)"""
        logger.info(f"🎯 _build_wellness_boost - score: {score}")
        
        # Use the comprehensive wellness variations system (300+ unique tips)
        risk_level = 'high' if score > 60 else 'moderate' if score > 30 else 'low'
        wellness_text = wellness_variations.get_wellness_boost(risk_level, user_profile)
        
        # Return as list of tips
        return wellness_text.split('\n') if wellness_text else []
        
        # Nutrition tip pools - FROM KNOWLEDGE BASE with quantified benefits
        nutrition_high = [
            f"🥗 {health_kb.nutrition_defense['antioxidants']['foods']} — {health_kb.nutrition_defense['antioxidants']['quantified']}",
            "🫐 Blueberries + spinach smoothie — antioxidants neutralize free radicals from air pollution",
            f"🥜 Walnuts/flaxseeds — {health_kb.nutrition_defense['omega3']['quantified']}",
            f"🍊 {health_kb.nutrition_defense['vitamin_c']['foods']} — {health_kb.nutrition_defense['vitamin_c']['benefit']}. {health_kb.nutrition_defense['vitamin_c']['timing']}",
            "🥕 Carrots + sweet potato — strengthens lung tissue against pollutants",
            "🧄 Garlic (2 cloves) — reduces mucus production by 30% on high pollution days",
            "🍇 Purple grapes + pomegranate — powerful antioxidants protect against oxidative stress",
            "🥑 Avocado toast — vitamin E shields lung membranes from pollution",
            "🫑 Bell peppers (red/yellow) — high vitamin C content boosts lung defense",
            f"💧 {health_kb.nutrition_defense['hydration']['amount']} — {health_kb.nutrition_defense['hydration']['benefit']}"
        ]
        nutrition_moderate = [
            f"🐟 {health_kb.nutrition_defense['omega3']['foods']} — {health_kb.nutrition_defense['omega3']['quantified']}",
            "🥦 Broccoli for dinner — boosts your body's natural detox system by 50%",
            f"🍵 {health_kb.nutrition_defense['antioxidants']['foods'].split(',')[3]} — neutralizes harmful pollution particles",
            "🌰 Brazil nuts (2-3 daily) — reduces lung inflammation naturally",
            "🍎 Apple a day — reduces allergic reactions by 40%",
            "🥬 Kale smoothie — protects airways from long-term inflammation damage",
            "🍠 Sweet potato — beta-carotene supports respiratory health",
            "🥥 Coconut water — keeps airways hydrated and functioning well",
            "🍋 Lemon water in morning — helps body eliminate toxins overnight",
            f"💧 {health_kb.nutrition_defense['hydration']['quantified']}"
        ]
        
        # Sleep tip pools - FROM KNOWLEDGE BASE with quantified benefits
        sleep_high = [
            f"😴 {health_kb.sleep_recovery['timing']['duration']} — {health_kb.sleep_recovery['importance']['immune']}",
            f"🛏️ {health_kb.sleep_recovery['bedroom_air']['purifier']}. Also reduces indoor PM2.5 by 80%",
            f"🌙 {health_kb.sleep_recovery['timing']['quality']} — deep sleep helps repair lung tissue",
            f"🛌 {health_kb.sleep_recovery['timing']['duration']} — {health_kb.sleep_recovery['importance']['inflammation']}",
            f"😴 {health_kb.sleep_recovery['timing']['consistency']}",
            "🌜 Get to bed by 10 PM — peak repair hormones released 11 PM-2 AM",
            f"💤 Quality sleep crucial today — {health_kb.sleep_recovery['importance']['medication']}",
            f"🛏️ {health_kb.sleep_recovery['bedroom_air']['humidity']} + air purifier for optimal breathing"
        ]
        sleep_low = [
            f"🛏️ {health_kb.sleep_recovery['bedroom_air']['purifier']}",
            f"😴 {health_kb.sleep_recovery['timing']['consistency']}",
            "🌿 Lavender essential oil — reduces stress that triggers asthma symptoms",
            "🛌 Sleep on 2 pillows — elevating your head reduces nighttime asthma by 20%",
            "🌙 Dark room (blackout curtains) — darkness helps your body produce anti-inflammatory hormones",
            "📵 No screens 1h before bed — blue light disrupts sleep quality",
            "🧘 Relaxation before bed — stress worsens asthma, calm mind = calm airways",
            f"🧺 {health_kb.sleep_recovery['bedroom_air']['allergens']}"
        ]
        
        # Hydration tip pool - plain language with benefits (EXPANDED)
        hydration_tips = [
            "💧 Stay hydrated (8-10 glasses) — helps your body clear out pollutants 50% faster",
            "🥤 Warm water with lemon — helps thin mucus so you can clear pollutants easier",
            "🫖 Herbal tea (ginger, turmeric) — reduces airway inflammation naturally",
            "💦 Electrolyte water — keeps your airways moist and better at trapping pollutants",
            "🍵 Peppermint tea — relaxes airways, makes breathing 15% easier",
            "🥥 Coconut water — keeps lung tissue hydrated and healthy",
            "🫖 Chamomile tea — soothes irritated airways from pollution",
            "💧 Drink water every hour — constant hydration helps mucus stay thin",
            "🍋 Hot water with honey — coats throat, reduces irritation from pollutants",
            "🫖 Ginger tea — natural anti-inflammatory for airways"
        ]
        
        # Exercise & Movement tips
        exercise_tips = [
            "🧘 Yoga or stretching — improves lung capacity by 15% and reduces stress",
            "🚶 Walking 30 min daily — strengthens cardiovascular system and improves oxygen delivery",
            "🏊 Swimming — excellent for respiratory health, builds lung capacity without pollution exposure",
            "🚴 Cycling indoors — maintains fitness on high pollution days without outdoor exposure",
            "💪 Strength training 2-3x/week — builds respiratory muscles, improves breathing efficiency",
            "🤸 Deep breathing exercises — increases lung capacity by 20% over 8 weeks",
            "🧘‍♀️ Tai chi — gentle movement improves lung function and reduces inflammation",
            "🏃 Interval training — boosts cardiovascular health, but avoid on high pollution days"
        ]
        
        # Stress Management tips
        stress_tips = [
            "🧘 Meditation 10 min daily — reduces stress hormones that worsen inflammation by 30%",
            "🌳 Nature time — spending 20 min in green spaces lowers cortisol by 25%",
            "📱 Digital detox — screen breaks reduce stress and improve sleep quality",
            "🎵 Music therapy — listening to calming music reduces stress-induced inflammation",
            "😊 Laughter — genuine laughter increases oxygen intake and reduces stress hormones",
            "🤝 Social connection — strong relationships reduce inflammation markers by 40%",
            "📝 Journaling — writing about stress reduces its physical impact on your body",
            "🎨 Creative activities — art, music, crafts reduce cortisol and improve mood"
        ]
        
        # Indoor Air Quality tips
        indoor_air_tips = [
            "🪴 Indoor plants (spider plant, peace lily) — filter air pollutants naturally",
            "🪟 Ventilate smart — open windows when outdoor AQI <50, close when >100",
            "🧹 Vacuum with HEPA filter 2x/week — removes 99% of indoor particles",
            "🕯️ Avoid scented candles — release VOCs that irritate airways",
            "🧴 Use natural cleaning products — chemical cleaners worsen indoor air quality",
            "💨 Air purifier in bedroom — reduces indoor PM2.5 by 80%, improves sleep",
            "👟 Shoes off indoors — prevents tracking outdoor pollutants inside",
            "🌡️ Maintain humidity 40-50% — optimal for respiratory health and pollutant control"
        ]
        
        # Immune Support tips
        immune_tips = [
            "☀️ Vitamin D (15 min sun or supplement) — strengthens immune response to pollutants",
            "🦠 Probiotics — gut health linked to 70% of immune function",
            "🧄 Garlic + onions — natural antimicrobials boost respiratory defense",
            "🍄 Mushrooms (shiitake, maitake) — beta-glucans enhance immune function",
            "🥣 Bone broth — collagen supports gut lining and immune health",
            "🌶️ Spicy foods (cayenne, jalapeño) — clear sinuses and boost circulation",
            "🍯 Raw honey — antimicrobial properties protect respiratory tract",
            "🧊 Cold showers — brief cold exposure strengthens immune system"
        ]
        
        # Breathing Techniques tips
        breathing_tips = [
            "🫁 Box breathing (4-4-4-4) — reduces stress and improves oxygen efficiency",
            "🌬️ Diaphragmatic breathing — strengthens respiratory muscles, increases lung capacity",
            "👃 Nasal breathing — filters air better than mouth breathing, reduces pollutant intake",
            "🧘 Alternate nostril breathing — balances nervous system, improves lung function",
            "💨 Pursed lip breathing — helps clear pollutants from lungs more effectively",
            "🫁 Breath holds — increases CO2 tolerance, improves oxygen utilization",
            "🌊 4-7-8 breathing — activates relaxation response, reduces inflammation",
            "🎵 Singing or humming — exercises respiratory muscles, improves lung capacity"
        ]
        
        # Check if user has asthma for appropriate messaging
        condition = user_profile.get('condition', '').lower()
        has_asthma = 'asthma' in condition
        
        # Select tips with variation
        if preferences.get('nutrition', True):
            if score > 50:
                tip = random.choice(nutrition_high)
                # Replace asthma-specific language for healthy users
                if not has_asthma:
                    tip = tip.replace('asthma symptoms', 'respiratory health')
                    tip = tip.replace('airway inflammation', 'inflammation')
                tips.append(tip)
            elif score > 30:
                tip = random.choice(nutrition_moderate)
                if not has_asthma:
                    tip = tip.replace('asthma symptoms', 'respiratory health')
                tips.append(tip)
        
        if preferences.get('sleep', True):
            if score > 40:
                tip = random.choice(sleep_high)
                # Replace asthma-specific language for healthy users
                if not has_asthma:
                    tip = tip.replace('asthma control', 'respiratory health')
                    tip = tip.replace('asthma symptoms', 'health issues')
                    tip = tip.replace('asthma', 'breathing')
                tips.append(tip)
            else:
                tip = random.choice(sleep_low)
                if not has_asthma:
                    tip = tip.replace('asthma control', 'respiratory health')
                    tip = tip.replace('asthma symptoms', 'breathing issues')
                    tip = tip.replace('asthma', 'breathing')
                tips.append(tip)
        
        # Always add hydration tip
        tips.append(random.choice(hydration_tips))
        
        # Add diverse wellness tips based on score and variety
        # Use day of year to rotate through different categories
        day_of_year = datetime.now().timetuple().tm_yday
        category_rotation = day_of_year % 5  # Rotate through 5 categories
        
        if category_rotation == 0:
            # Exercise & Movement day
            tips.append(random.choice(exercise_tips))
        elif category_rotation == 1:
            # Stress Management day
            tips.append(random.choice(stress_tips))
        elif category_rotation == 2:
            # Indoor Air Quality day
            tips.append(random.choice(indoor_air_tips))
        elif category_rotation == 3:
            # Immune Support day
            tips.append(random.choice(immune_tips))
        else:
            # Breathing Techniques day
            tips.append(random.choice(breathing_tips))
        
        # Add longevity fact for motivation on good air days
        if score < 50:
            tips.append(f"💚 {health_kb.get_longevity_fact()}")
        
        return tips if tips else ["✨ Keep up your healthy habits — consistency builds resilience!"]
    
    def _generate_fallback_briefing(self, user_profile: Dict) -> str:
        """Generate fallback briefing if data is unavailable"""
        user_name = user_profile.get('name', 'there')
        return (
            f"Good morning, {user_name}! 🌤️\n\n"
            f"We're experiencing temporary data issues, but here are general tips:\n"
            f"• Check local air quality before outdoor activities\n"
            f"• Keep rescue medication accessible\n"
            f"• Stay hydrated and well-rested\n"
            f"• Monitor your symptoms closely\n\n"
            f"We'll have your personalized briefing ready soon!"
        )
    
    def get_briefing_metadata(self, environmental_data: Dict, user_profile: Dict) -> Dict[str, Any]:
        """Get metadata about the briefing for analytics"""
        # Use premium_lean_engine for consistent risk calculation
        from services.premium_lean_engine import premium_lean_engine
        risk_analysis = premium_lean_engine.calculate_daily_risk_score(environmental_data)
        score = risk_analysis['risk_score']
        risk_level = risk_analysis['risk_level']
        primary_risk = self._determine_primary_risk(environmental_data)
        
        return {
            'risk_score': score,
            'risk_level': risk_level,
            'primary_risk_driver': primary_risk,
            'personalization_factors': {
                'user_triggers': user_profile.get('triggers', []),
                'fitness_goal': user_profile.get('fitness_goal', ''),
                'preferences': user_profile.get('preferences', {})
            },
            'environmental_summary': {
                'pm25': environmental_data.get('pm25', 0),
                'ozone': environmental_data.get('ozone', 0),
                'pollen': environmental_data.get('pollen_level', 0),
                'humidity': environmental_data.get('humidity', 50)
            },
            'generated_at': datetime.utcnow().isoformat() + 'Z'  # Add Z to indicate UTC
        }
    
    def generate_time_specific_briefing(self, environmental_data: Dict, user_profile: Dict, time_of_day: str) -> str:
        """
        Generate time-of-day specific briefing (morning, midday, evening)
        
        Args:
            environmental_data: Current environmental conditions
            user_profile: User health profile
            time_of_day: 'morning', 'midday', or 'evening'
        """
        try:
            score = self._calculate_daily_risk_score(environmental_data)
            primary_risk = self._determine_primary_risk(environmental_data)
            user_name = user_profile.get('name', 'there')
            
            if time_of_day == 'morning':
                return self._generate_morning_briefing(environmental_data, user_profile, score, primary_risk)
            elif time_of_day == 'midday':
                return self._generate_midday_update(environmental_data, user_profile, score, primary_risk)
            elif time_of_day == 'evening':
                return self._generate_evening_reflection(environmental_data, user_profile, score, primary_risk)
            else:
                return self.generate_daily_briefing(environmental_data, user_profile)
                
        except Exception as e:
            logger.error(f"Error generating time-specific briefing: {e}")
            return self._generate_fallback_briefing(user_profile)
    
    def _generate_morning_briefing(self, data: Dict, profile: Dict, score: float, primary_risk: str) -> str:
        """Generate morning-specific briefing (full day ahead)"""
        user_name = profile.get('name', 'there')
        greeting = f"Good morning, {user_name}! ☀️"
        
        # Full daily briefing with emphasis on planning
        base_briefing = self.generate_daily_briefing(data, profile)
        
        # Add morning-specific planning tip
        morning_tip = "\n\n🌅 Morning Planning Tip:\n"
        if score < 50:
            morning_tip += "Great day to get outdoor exercise done early. Air quality tends to be best before 10 AM."
        else:
            morning_tip += "Plan indoor activities for today. Check conditions again at noon before any outdoor plans."
        
        return base_briefing + morning_tip
    
    def _generate_midday_update(self, data: Dict, profile: Dict, score: float, primary_risk: str) -> str:
        """Generate midday check-in (afternoon planning)"""
        user_name = profile.get('name', 'there')
        
        ozone = data.get('ozone', 0)
        pm25 = data.get('pm25', 0)
        
        briefing = f"Midday Update, {user_name}! 🌤️\n\n"
        
        if primary_risk == 'ozone' and ozone > 100:
            briefing += f"⚠️ Ozone is building up ({ozone:.0f} ppb). Peak expected 2-6 PM.\n"
            briefing += "Recommendation: Postpone outdoor activities until after 7 PM when ozone drops.\n\n"
        elif pm25 > 35:
            briefing += f"⚠️ PM2.5 remains elevated ({pm25:.0f} μg/m³).\n"
            briefing += "Recommendation: Continue indoor activities. Use N95 mask if you must go out.\n\n"
        else:
            briefing += f"✅ Conditions are manageable (Risk: {score:.0f}/100).\n"
            briefing += "Afternoon outdoor activity is okay with normal precautions.\n\n"
        
        briefing += "Evening forecast: Check back at 6 PM for tomorrow's outlook."
        
        return briefing
    
    def _generate_evening_reflection(self, data: Dict, profile: Dict, score: float, primary_risk: str) -> str:
        """Generate evening reflection (tomorrow preview)"""
        user_name = profile.get('name', 'there')
        
        briefing = f"Evening Reflection, {user_name}! 🌙\n\n"
        briefing += f"Today's conditions: Risk was {score:.0f}/100.\n\n"
        
        # Tomorrow preview (simplified forecast)
        briefing += "Tomorrow's Preview:\n"
        if score < 50:
            briefing += "🌤️ Similar conditions expected. Plan outdoor activities for morning.\n"
        else:
            briefing += "⚠️ Conditions may remain challenging. Prepare for indoor alternatives.\n"
        
        # Evening wellness tip
        briefing += "\n💤 Tonight's Focus:\n"
        if score > 50:
            briefing += "Run air purifier in bedroom — improves sleep quality by 25%.\n"
            briefing += "Prioritize 7-8h sleep to help your body recover from today's exposure."
        else:
            briefing += "Great day for recovery! Maintain your sleep schedule for optimal respiratory health."
        
        return briefing

# Initialize engine
dynamic_briefing_engine = DynamicDailyBriefingEngine()
