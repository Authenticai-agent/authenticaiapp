# 🔧 Integration Guide: Daily Wellness Companion Features

## Overview
This guide shows how to integrate the new wellness companion features into your Dashboard.

---

## 1. Daily Ritual Component

### Import and Use
```tsx
import DailyRitual from '../components/DailyRitual';

// In your Dashboard component:
<DailyRitual 
  airQuality={{
    aqi: airQualityData?.aqi,
    pm25: airQualityData?.pm25,
    humidity: airQualityData?.humidity,
    category: airQualityData?.category
  }}
/>
```

### Features
- **7-minute morning ritual**: Breathe (2 min) → Move (3 min) → Protect (2 min)
- **Adaptive guidance**: Changes based on air quality conditions
- **Streak tracking**: Automatically tracks daily completion
- **Professional avatars**: Animated guides for breathing and movement

### Storage
- Completion: `localStorage.getItem('daily_ritual_completed')`
- Streak: `localStorage.getItem('daily_ritual_streak')`

---

## 2. Micro-Coaching Prompts

### Import and Use
```tsx
import MicroCoachingPrompts from '../components/MicroCoachingPrompts';

// In your Dashboard component:
<MicroCoachingPrompts 
  airQuality={{
    aqi: airQualityData?.aqi,
    pm25: airQualityData?.pm25,
    humidity: airQualityData?.humidity,
    temperature: weatherData?.temperature,
    co2: indoorData?.co2
  }}
  weather={{
    condition: weatherData?.condition,
    description: weatherData?.description
  }}
/>
```

### Features
- **Smart prompts**: Up to 3 contextual tips based on conditions
- **Action-oriented**: Each prompt includes specific action to take
- **Color-coded**: Visual indicators for different environmental factors
- **Real-time**: Updates as environmental data changes

---

## 3. Environmental Recovery Tips

### Import and Use
```tsx
import EnvironmentalRecoveryTips from '../components/EnvironmentalRecoveryTips';

// In your Dashboard component:
<EnvironmentalRecoveryTips 
  airQuality={{
    aqi: airQualityData?.aqi,
    pm25: airQualityData?.pm25,
    humidity: airQualityData?.humidity
  }}
  pollenLevel={pollenData?.level}
/>
```

### Features
- **Daily recipe**: One wellness recipe per day based on conditions
- **Step-by-step**: Clear instructions for each remedy
- **Benefits explained**: Why each recipe helps
- **Beautiful design**: Emerald gradient with clear sections

### Recipe Types
- Smoggy day → Warm Ginger Tea
- Dry air → Steam Inhalation
- High pollen → Nasal Rinse
- Clean air → Turmeric Golden Milk
- Default → Mint & Green Tea

---

## 4. Suggested Dashboard Layout

### Morning Section (Top Priority)
```tsx
<div className="dashboard-container">
  {/* Hero: Daily Ritual - Most Important */}
  <section className="mb-6">
    <DailyRitual airQuality={airQuality} />
  </section>

  {/* Micro-Coaching - Quick Wins */}
  <section className="mb-6">
    <MicroCoachingPrompts 
      airQuality={airQuality} 
      weather={weather} 
    />
  </section>

  {/* Environmental Tips - Daily Recipe */}
  <section className="mb-6">
    <EnvironmentalRecoveryTips 
      airQuality={airQuality}
      pollenLevel={pollen?.level}
    />
  </section>

  {/* Existing Components */}
  <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <LungEnergyMeter />
    <SmartScoreTrend currentScore={riskScore} airQuality={airQuality} />
  </section>

  <section className="mb-6">
    <DailyAffirmation />
  </section>

  <section className="mb-6">
    <MorningMovementProgram />
  </section>
</div>
```

---

## 5. Example Dashboard Integration

```tsx
import React, { useState, useEffect } from 'react';
import DailyRitual from '../components/DailyRitual';
import MicroCoachingPrompts from '../components/MicroCoachingPrompts';
import EnvironmentalRecoveryTips from '../components/EnvironmentalRecoveryTips';
import LungEnergyMeter from '../components/LungEnergyMeter';
import SmartScoreTrend from '../components/SmartScoreTrend';
import DailyAffirmation from '../components/DailyAffirmation';
import MorningMovementProgram from '../components/MorningMovementProgram';

const Dashboard: React.FC = () => {
  const [airQuality, setAirQuality] = useState(null);
  const [weather, setWeather] = useState(null);
  const [pollen, setPollen] = useState(null);

  useEffect(() => {
    // Fetch your data
    fetchAirQuality();
    fetchWeather();
    fetchPollen();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Message */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          ☀️ Good morning, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Let's start your day with wellness and intention.
        </p>
      </div>

      {/* Daily Ritual - Hero Section */}
      <DailyRitual airQuality={airQuality} />

      {/* Micro-Coaching */}
      <div className="mb-6">
        <MicroCoachingPrompts 
          airQuality={airQuality}
          weather={weather}
        />
      </div>

      {/* Environmental Tips */}
      <div className="mb-6">
        <EnvironmentalRecoveryTips 
          airQuality={airQuality}
          pollenLevel={pollen?.level}
        />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <LungEnergyMeter />
        <SmartScoreTrend 
          currentScore={riskScore} 
          airQuality={airQuality} 
        />
      </div>

      {/* Daily Practices */}
      <div className="space-y-6">
        <DailyAffirmation />
        <MorningMovementProgram />
      </div>
    </div>
  );
};

export default Dashboard;
```

---

## 6. Styling Notes

### Colors Used
- **Daily Ritual**: Golden gradient (warmth, morning energy)
- **Micro-Coaching**: Multi-color (blue, green, red, orange based on condition)
- **Recovery Tips**: Emerald gradient (natural, healing)

### Responsive Design
All components are mobile-friendly with:
- Flexbox/Grid layouts
- Breakpoints at 640px (sm), 768px (md)
- Touch-friendly buttons (min 44px height)

---

## 7. Data Flow

### Air Quality Data Structure
```typescript
interface AirQuality {
  aqi?: number;
  pm25?: number;
  pm10?: number;
  humidity?: number;
  temperature?: number;
  co2?: number;
  category?: string;
}
```

### Weather Data Structure
```typescript
interface Weather {
  condition?: string;
  description?: string;
  temperature?: number;
}
```

---

## 8. Testing Checklist

- [ ] Daily Ritual completes and saves to localStorage
- [ ] Streak increments correctly day-to-day
- [ ] Micro-coaching prompts change based on air quality
- [ ] Recovery tips show correct recipe for conditions
- [ ] All components are mobile responsive
- [ ] Animations run smoothly
- [ ] Data updates in real-time

---

## 9. User Flow

### Morning Experience
1. **User opens app** → Sees warm greeting
2. **Daily Ritual** → Prominent, inviting (not completed yet)
3. **Clicks "Start"** → Guided through 7-minute ritual
4. **Completes ritual** → Celebration, streak updated
5. **Scrolls down** → Sees micro-coaching tips
6. **Reads recovery tip** → Gets daily wellness recipe
7. **Checks metrics** → Lung energy, trends
8. **Practices affirmation** → Emotional boost
9. **Does movement** → Physical wellness

### Result
User feels:
- ✅ Accomplished (completed ritual)
- ✅ Guided (clear actions to take)
- ✅ Cared for (personalized tips)
- ✅ Motivated (streak, progress)
- ✅ Connected (daily companion)

---

## 10. Next Steps

1. **Integrate components** into Dashboard
2. **Test with real data** from your API
3. **Gather user feedback** on ritual flow
4. **Iterate on timing** (adjust 7 minutes if needed)
5. **Add notifications** for ritual reminders
6. **Track completion rates** and optimize

---

## Questions?

See [ROADMAP.md](ROADMAP.md) for future features or [CONTRIBUTING.md](CONTRIBUTING.md) to help build!
