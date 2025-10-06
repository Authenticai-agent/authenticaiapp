"""
300+ Action Plan Variations
Personalized action plans based on environmental conditions
"""

import random
from typing import List, Dict

class ActionPlanVariations:
    """Provides 300+ unique action plan variations"""
    
    def __init__(self):
        # PM2.5 High Risk Actions (50)
        self.pm25_high_actions = [
            # Indoor safety (15)
            "🏠 Stay indoors - PM2.5 inflames airways in 30 minutes",
            "🚪 Keep windows closed - outdoor PM2.5 is {pm25}x WHO safe limit",
            "🏠 Run air purifier on high - removes 99.97% of particles",
            "🚪 Seal gaps under doors with towels to block outdoor air",
            "🏠 Create clean room with HEPA purifier running continuously",
            "🚪 Use weather stripping on windows to prevent infiltration",
            "🏠 Close vents if no HEPA filtration in HVAC system",
            "🚪 Wet mop floors to capture settled particles",
            "🏠 Avoid cooking that creates smoke or fumes",
            "🚪 Use bathroom and kitchen exhaust fans",
            "🏠 Keep indoor humidity 30-50% to prevent particle suspension",
            "🚪 Place air purifiers in bedroom and main living area",
            "🏠 Avoid burning candles or incense",
            "🚪 Keep pets groomed to reduce dander mixing with PM2.5",
            "🏠 Use damp cloth for dusting instead of dry sweeping",
            
            # Mask protection (15)
            "😷 N95 mask essential if going outside - blocks 95% of particles",
            "😷 Fit test N95 mask - pinch nose bridge for proper seal",
            "😷 Replace N95 after 8 hours of use or if damp",
            "😷 KN95 mask acceptable alternative to N95",
            "😷 Avoid cloth masks - only 10-30% effective for PM2.5",
            "😷 Surgical mask better than nothing - 60% effective",
            "😷 Check mask seal - no air leaking around edges",
            "😷 Wear mask even for brief outdoor exposure",
            "😷 Keep spare masks in car and bag",
            "😷 Double mask if only surgical available",
            "😷 Avoid touching mask while wearing",
            "😷 Store masks in clean, dry place",
            "😷 Discard disposable masks after single use",
            "😷 Wash reusable masks after each use",
            "😷 Choose masks with nose wire for better fit",
            
            # Medication & health (20)
            "💊 Use rescue inhaler preventively before any outdoor exposure",
            "💊 Take antihistamine to reduce inflammatory response",
            "💊 Use corticosteroid inhaler as prescribed",
            "💊 Keep rescue medication within arm's reach",
            "💊 Monitor peak flow meter - call doctor if <80% personal best",
            "💊 Take anti-inflammatory supplements (omega-3, quercetin)",
            "💊 Use nebulizer treatment if symptoms worsen",
            "💊 Increase controller medication dose per doctor's plan",
            "💊 Have oral steroids ready per asthma action plan",
            "💊 Use spacer with inhaler for better medication delivery",
            "💊 Rinse mouth after inhaler to prevent thrush",
            "💊 Track symptoms hourly to catch early warning signs",
            "💊 Avoid NSAIDs if aspirin-sensitive asthma",
            "💊 Take vitamin D3 to support immune function",
            "💊 Use saline nasal rinse to clear particles",
            "💊 Apply mentholated rub to chest for comfort",
            "💊 Take magnesium to relax airways",
            "💊 Use leukotriene inhibitor as prescribed",
            "💊 Keep emergency contacts and medications listed",
            "💊 Charge phone fully in case emergency call needed",
        ]
        
        # PM2.5 Moderate Actions (50)
        self.pm25_moderate_actions = [
            # Timing strategies (15)
            "⏰ Exercise before 8 AM when PM2.5 lowest",
            "⏰ Avoid outdoor activity 12-6 PM when PM2.5peaks",
            "⏰ Check AQI hourly - conditions can change quickly",
            "⏰ Plan errands for early morning hours",
            "⏰ Delay outdoor exercise until AQI improves",
            "⏰ Monitor wind direction - avoid downwind of traffic",
            "⏰ Wait 2 hours after rain for PM2.5 to settle",
            "⏰ Evening hours often better than afternoon",
            "⏰ Sunrise walks when air is cleanest",
            "⏰ Avoid rush hour traffic times",
            "⏰ Plan outdoor activities around weather fronts",
            "⏰ Check forecast for next 3 hours before going out",
            "⏰ Early morning grocery shopping avoids crowds and pollution",
            "⏰ Sunset walks after PM2.5 has settled",
            "⏰ Weekends often have lower traffic pollution",
            
            # Route optimization (15)
            "🚶 Choose routes >500m from highways - reduces exposure 70%",
            "🚶 Walk in parks away from traffic",
            "🚶 Use residential streets instead of main roads",
            "🚶 Avoid construction zones and industrial areas",
            "🚶 Choose tree-lined streets - vegetation filters PM2.5",
            "🚶 Walk upwind of traffic when possible",
            "🚶 Use pedestrian bridges over busy roads",
            "🚶 Take longer route if it avoids pollution sources",
            "🚶 Walk on side of street away from traffic",
            "🚶 Avoid bus stops and taxi stands",
            "🚶 Choose routes with good air circulation",
            "🚶 Stay away from idling vehicles",
            "🚶 Use bike paths separated from roads",
            "🚶 Walk in open areas rather than street canyons",
            "🚶 Avoid tunnels and underpasses where pollution concentrates",
            
            # Protective measures (20)
            "😷 Wear KN95 mask if sensitive - provides good protection",
            "😷 Consider mask for exercise if symptoms appear",
            "😷 Keep mask handy in case conditions worsen",
            "💨 Breathe through nose to filter particles naturally",
            "💨 Reduce exercise intensity by 30% to lower breathing rate",
            "💨 Take walking breaks every 10 minutes",
            "💨 Practice pursed-lip breathing during activity",
            "💨 Monitor breathing - stop if any difficulty",
            "💨 Carry rescue inhaler during outdoor activity",
            "💨 Stay hydrated - drink water every 15 minutes",
            "💨 Avoid mouth breathing which bypasses nasal filtration",
            "💨 Use pre-exercise inhaler if prescribed",
            "💨 Warm up indoors before outdoor exercise",
            "💨 Cool down indoors after outdoor activity",
            "💨 Shower immediately after outdoor exposure",
            "💨 Change clothes to remove particle-laden fabric",
            "💨 Wash face and hands to remove settled particles",
            "💨 Use saline nasal spray after outdoor exposure",
            "💨 Gargle with salt water to clear throat",
            "💨 Monitor symptoms for 2 hours after exposure",
        ]
        
        # Ozone High Actions (50)
        self.ozone_high_actions = [
            # Timing avoidance (15)
            "☀️ Avoid 12-6 PM when ozone peaks - levels 3x higher",
            "☀️ Exercise 6-9 AM when ozone 40% lower",
            "☀️ Stay indoors during afternoon heat",
            "☀️ Plan outdoor activities before 10 AM",
            "☀️ Evening after 7 PM safer than afternoon",
            "☀️ Cloudy days have 30% less ozone",
            "☀️ Ozone highest on hot, sunny, stagnant days",
            "☀️ Check hourly ozone forecast",
            "☀️ Avoid outdoor exercise on code orange days",
            "☀️ Morning dog walks instead of afternoon",
            "☀️ Delay yard work until evening",
            "☀️ Reschedule outdoor events to morning",
            "☀️ Indoor gym during peak ozone hours",
            "☀️ Sunrise activities when ozone minimal",
            "☀️ Wait for weather front to clear ozone",
            
            # Shade & location (15)
            "🌳 Stay in shade - reduces ozone exposure 25%",
            "🌳 Tree cover filters ozone naturally",
            "🌳 Parks with mature trees offer protection",
            "🌳 Avoid open fields during peak sun",
            "🌳 Covered walkways reduce exposure",
            "🌳 Indoor shopping malls safe alternative",
            "🌳 Shaded trails better than exposed paths",
            "🌳 Forest walks filter ozone 30%",
            "🌳 Avoid reflective surfaces that intensify heat",
            "🌳 Seek north-facing slopes in afternoon",
            "🌳 Use umbrellas for portable shade",
            "🌳 Covered patios safer than open decks",
            "🌳 Indoor pool better than outdoor",
            "🌳 Air-conditioned spaces protect from ozone",
            "🌳 Basement activities during peak hours",
            
            # Activity modification (20)
            "🏃 Reduce exercise intensity 50% during high ozone",
            "🏃 Walk instead of jog to lower breathing rate",
            "🏃 Take frequent breaks every 5-10 minutes",
            "🏃 Shorten outdoor workout from 45 to 20 minutes",
            "🏃 Indoor cardio alternatives during ozone alerts",
            "🏃 Swimming indoors excellent ozone-free exercise",
            "🏃 Yoga and stretching instead of running",
            "🏃 Strength training indoors",
            "🏃 Stationary bike in air-conditioned space",
            "🏃 Treadmill walking with fan",
            "🏃 Indoor climbing gym alternative",
            "🏃 Dance or aerobics class indoors",
            "🏃 Elliptical machine low-impact option",
            "🏃 Indoor basketball or volleyball",
            "🏃 Pilates or barre class",
            "🏃 Rowing machine full-body workout",
            "🏃 Indoor track if available",
            "🏃 Home workout videos",
            "🏃 Resistance band exercises",
            "🏃 Bodyweight circuit training indoors",
        ]
        
        # Pollen High Actions (50)
        self.pollen_high_actions = [
            # Avoidance strategies (15)
            "🌸 Stay indoors 5-10 AM when pollen peaks",
            "🌸 Keep windows closed during high pollen",
            "🌸 Use AC with HEPA filter instead of open windows",
            "🌸 Avoid parks and gardens during pollen season",
            "🌸 Check pollen forecast before outdoor plans",
            "🌸 Rain washes pollen - wait 30 min after for outdoor activity",
            "🌸 Windy days spread pollen - stay indoors",
            "🌸 Grass cutting releases pollen - avoid freshly mowed areas",
            "🌸 Flowering trees peak different times - know your triggers",
            "🌸 Evening pollen levels 50% lower than morning",
            "🌸 Cloudy days have less pollen than sunny",
            "🌸 Urban areas have less pollen than rural",
            "🌸 Concrete areas safer than grassy fields",
            "🌸 Indoor activities during peak pollen season",
            "🌸 Postpone outdoor events during pollen surge",
            
            # Protection methods (15)
            "😷 Wear wraparound sunglasses to block pollen from eyes",
            "😷 Use pollen mask or N95 when outdoors",
            "😷 Apply petroleum jelly inside nose to trap pollen",
            "😷 Wear hat to prevent pollen in hair",
            "😷 Long sleeves reduce skin contact with pollen",
            "😷 Gloves when gardening to avoid pollen transfer",
            "😷 Face shield for severe pollen allergy",
            "😷 Scarf over nose and mouth as barrier",
            "😷 Swim goggles for eye protection",
            "😷 Bandana or buff as pollen filter",
            "😷 Avoid touching face with pollen-exposed hands",
            "😷 Keep car windows closed while driving",
            "😷 Use recirculation mode in car AC",
            "😷 Wipe down car interior to remove pollen",
            "😷 Keep outdoor gear in garage, not bedroom",
            
            # Post-exposure care (20)
            "🚿 Shower immediately after outdoor exposure",
            "🚿 Wash hair to remove trapped pollen",
            "🚿 Change clothes - pollen clings to fabric",
            "🚿 Leave shoes at door to prevent tracking pollen",
            "🚿 Wash face and hands frequently",
            "🚿 Rinse eyes with saline solution",
            "🚿 Use neti pot to clear nasal passages",
            "🚿 Gargle with salt water",
            "🚿 Wipe pets with damp cloth after outdoor time",
            "🚿 Wash bedding in hot water weekly",
            "🚿 Dry clothes in dryer, not outside",
            "🚿 Vacuum with HEPA filter daily during pollen season",
            "🚿 Damp mop floors to capture pollen",
            "🚿 Use air purifier in bedroom overnight",
            "🚿 Take antihistamine before outdoor exposure",
            "🚿 Use nasal steroid spray as prescribed",
            "🚿 Eye drops for itchy, watery eyes",
            "🚿 Cold compress on eyes for relief",
            "🚿 Humidifier to soothe irritated airways",
            "🚿 Avoid rubbing eyes - worsens symptoms",
        ]
        
        # Excellent Conditions Actions (50)
        self.excellent_actions = [
            # Outdoor exercise (20)
            "🏃 Perfect for 45-60 min outdoor cardio - build endurance",
            "🚴 Long bike ride to strengthen cardiovascular system",
            "🏊 Outdoor swim - excellent for lung capacity",
            "⛰️ Hiking builds strength and lung function",
            "🏃 Interval training - alternate fast/slow pace",
            "🚴 Mountain biking for varied terrain challenge",
            "🏊 Open water swimming when available",
            "⛰️ Trail running in nature",
            "🏃 Group fitness class in park",
            "🚴 Cycling tour of scenic routes",
            "🏊 Beach activities and swimming",
            "⛰️ Rock climbing outdoors",
            "🏃 Soccer or frisbee with friends",
            "🚴 Bike commuting to work",
            "🏊 Paddleboarding or kayaking",
            "⛰️ Nature photography walks",
            "🏃 Outdoor boot camp class",
            "🚴 Tandem biking with partner",
            "🏊 Snorkeling in clean waters",
            "⛰️ Geocaching adventure",
            
            # Capacity building (15)
            "💪 Increase workout duration by 10-15 minutes",
            "💪 Add hills or stairs to build lung capacity",
            "💪 Try new outdoor sport to challenge yourself",
            "💪 Increase exercise intensity gradually",
            "💪 Practice breathing techniques during exercise",
            "💪 Set new personal distance record",
            "💪 Join outdoor running or cycling group",
            "💪 Train for 5K or 10K race",
            "💪 Add resistance to cardio workout",
            "💪 Combine cardio with strength training",
            "💪 Try high-intensity interval training",
            "💪 Increase speed or pace",
            "💪 Add plyometric exercises",
            "💪 Practice sprint intervals",
            "💪 Build up to longer endurance sessions",
            
            # Enjoyment & wellness (15)
            "🌞 Enjoy sunshine - vitamin D boosts immunity 40%",
            "🌞 Practice outdoor meditation or yoga",
            "🌞 Have picnic in park",
            "🌞 Outdoor tai chi or qigong",
            "🌞 Nature walk for mental health",
            "🌞 Outdoor photography session",
            "🌞 Birdwatching or nature observation",
            "🌞 Outdoor sketching or painting",
            "🌞 Gardening for exercise and relaxation",
            "🌞 Play outdoor games with family",
            "🌞 Outdoor concert or event",
            "🌞 Farmers market walking tour",
            "🌞 Outdoor dining experience",
            "🌞 Sunrise or sunset viewing",
            "🌞 Star gazing in evening",
        ]
        
        # Weather-specific actions (50)
        self.weather_actions = [
            # Cold weather (15)
            "🥶 Wear scarf over nose/mouth - warms air before breathing",
            "🥶 Breathe through nose to warm and humidify air",
            "🥶 Warm up indoors for 10 minutes before outdoor exercise",
            "🥶 Layer clothing to maintain body temperature",
            "🥶 Use inhaler 15 minutes before cold exposure",
            "🥶 Shorten outdoor duration in extreme cold",
            "🥶 Stay hydrated even in cold weather",
            "🥶 Avoid sudden temperature changes",
            "🥶 Use humidifier indoors to prevent dry airways",
            "🥶 Drink warm fluids before outdoor activity",
            "🥶 Cover ears and head to retain body heat",
            "🥶 Avoid exercising in temperatures below 20°F",
            "🥶 Use face mask designed for cold weather",
            "🥶 Take breaks in warm indoor spaces",
            "🥶 Monitor for cold-induced bronchospasm",
            
            # Hot weather (15)
            "🥵 Exercise early morning before heat peaks",
            "🥵 Stay hydrated - drink 8oz water every 15 minutes",
            "🥵 Wear light, breathable clothing",
            "🥵 Take frequent shade breaks",
            "🥵 Use cooling towel on neck",
            "🥵 Avoid peak heat hours 11 AM - 4 PM",
            "🥵 Reduce intensity by 30% in heat",
            "🥵 Watch for heat exhaustion symptoms",
            "🥵 Wear sunscreen to prevent skin stress",
            "🥵 Use electrolyte drinks, not just water",
            "🥵 Wet hat or bandana for cooling",
            "🥵 Choose shaded routes",
            "🥵 Indoor exercise if heat index >90°F",
            "🥵 Acclimate gradually to hot weather",
            "🥵 Monitor heart rate - heat increases it 10-20 bpm",
            
            # Humidity effects (20)
            "💧 High humidity makes breathing harder - reduce intensity 40%",
            "💧 Dehumidifier indoors maintains 30-50% humidity",
            "💧 Low humidity dries airways - use humidifier",
            "💧 Humid air holds pollen longer - avoid outdoor activity",
            "💧 AC removes humidity and filters air",
            "💧 Humid conditions increase mold - check home",
            "💧 Drink more water in humid conditions",
            "💧 Humidity >65% triggers symptoms - stay indoors",
            "💧 Use hygrometer to monitor indoor humidity",
            "💧 Ventilate bathroom after shower",
            "💧 Fix leaks to prevent humidity buildup",
            "💧 Use exhaust fans when cooking",
            "💧 Dry clothes in dryer, not indoors",
            "💧 Store firewood outside to reduce humidity",
            "💧 Humidity <30% irritates airways - add moisture",
            "💧 Humid weather slows sweat evaporation",
            "💧 Choose indoor pool over outdoor in humidity",
            "💧 Basement dehumidifier prevents mold",
            "💧 Plants can increase indoor humidity naturally",
            "💧 Monitor weather app for humidity levels",
        ]
    
    def get_action_plan(self, primary_risk: str, environmental_data: Dict, user_profile: Dict) -> List[str]:
        """Get personalized action plan based on primary risk and CURRENT conditions"""
        actions = []
        
        pm25 = environmental_data.get('pm25', 0)
        ozone = environmental_data.get('ozone', 0)
        pollen = environmental_data.get('pollen_index', 0)
        humidity = environmental_data.get('humidity', 50)
        temp_c = environmental_data.get('temperature', 20)  # Celsius
        temp_f = (temp_c * 9/5) + 32  # Convert to Fahrenheit
        
        # Select actions based on primary risk
        if primary_risk == 'pm25':
            if pm25 > 55:  # High
                actions = random.sample(self.pm25_high_actions, 3)
            else:  # Moderate
                actions = random.sample(self.pm25_moderate_actions, 3)
        
        elif primary_risk == 'ozone':
            actions = random.sample(self.ozone_high_actions, 3)
        
        elif primary_risk == 'pollen':
            actions = random.sample(self.pollen_high_actions, 3)
        
        elif primary_risk == 'excellent':
            actions = random.sample(self.excellent_actions, 3)
        
        else:
            # Weather-based actions - USE FAHRENHEIT for temperature checks
            if temp_f < 40 or temp_f > 85 or humidity > 65:
                actions = random.sample(self.weather_actions, 3)
            else:
                actions = random.sample(self.excellent_actions, 3)
        
        # CRITICAL: Filter out contradictory advice based on ACTUAL conditions
        filtered_actions = []
        for action in actions:
            # Skip humidity advice that contradicts current conditions
            if 'Humidity <30%' in action and humidity > 50:
                continue  # Don't tell them to add moisture when it's already humid
            if 'Humidity >65%' in action and humidity < 40:
                continue  # Don't tell them it's humid when it's dry
            if 'High humidity' in action and humidity < 50:
                continue
            if 'Low humidity' in action and humidity > 60:
                continue
            
            # Skip COLD weather advice when it's NOT cold (>50°F / 10°C)
            if ('🥶' in action or 'cold' in action.lower() or 'Cold' in action) and temp_f > 50:
                continue  # Don't give cold weather advice when it's warm
            
            # Skip HOT weather advice when it's NOT hot (<75°F / 24°C)
            if ('🥵' in action or 'heat' in action.lower() or 'Heat' in action) and temp_f < 75:
                continue  # Don't give hot weather advice when it's cool
            
            filtered_actions.append(action)
        
        # If we filtered too many, add context-appropriate ones
        while len(filtered_actions) < 3:
            if humidity > 65:
                filtered_actions.append(f"💧 Current humidity {humidity}% is high - use dehumidifier indoors (optimal 30-50%)")
            elif humidity < 30:
                filtered_actions.append(f"💧 Current humidity {humidity}% is low - use humidifier to prevent airway dryness")
            else:
                filtered_actions.append("💧 Humidity levels are optimal for breathing comfort")
            break
        
        return filtered_actions[:3]

# Global instance
action_variations = ActionPlanVariations()
