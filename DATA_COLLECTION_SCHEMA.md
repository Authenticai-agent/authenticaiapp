# 📊 Data Collection Schema for AI Coach Analysis

## Overview
This document outlines all data points collected for AI-powered wellness insights and coaching.

---

## 1. Daily Ritual Events

### Event: `daily_ritual.started`
```json
{
  "eventType": "daily_ritual.started",
  "timestamp": "2025-10-29T09:30:00Z",
  "userId": "user_123",
  "sessionId": "session_abc",
  "data": {
    "phase": "breathe" | "move" | "protect"
  },
  "environmentalContext": {
    "aqi": 85,
    "pm25": 28.5,
    "humidity": 45,
    "temperature": 22
  }
}
```

### Event: `daily_ritual.phase_completed`
```json
{
  "eventType": "daily_ritual.phase_completed",
  "data": {
    "phase": "breathe",
    "duration_seconds": 120
  }
}
```

### Event: `daily_ritual.completed`
```json
{
  "eventType": "daily_ritual.completed",
  "data": {
    "total_duration_seconds": 420,
    "streak_count": 12
  }
}
```

### Event: `daily_ritual.abandoned`
```json
{
  "eventType": "daily_ritual.abandoned",
  "data": {
    "phase": "move",
    "time_spent_seconds": 45
  }
}
```

---

## 2. Pollution Defense Protocol

### Event: `pollution_defense.triggered`
```json
{
  "eventType": "pollution_defense.triggered",
  "data": {
    "aqi": 127,
    "pm25": 45.2,
    "trigger_reason": "aqi_threshold_exceeded"
  }
}
```

### Event: `pollution_defense.pre_checklist_completed`
```json
{
  "eventType": "pollution_defense.pre_checklist_completed",
  "data": {
    "completed_items": ["mask", "eyewear", "route", "timing"]
  }
}
```

### Event: `pollution_defense.walk_started`
```json
{
  "eventType": "pollution_defense.walk_started",
  "data": {
    "planned_duration_minutes": 15
  }
}
```

### Event: `pollution_defense.walk_completed`
```json
{
  "eventType": "pollution_defense.walk_completed",
  "data": {
    "actual_duration_seconds": 1080,
    "reminders_shown": 3
  }
}
```

### Event: `pollution_defense.symptoms_reported`
```json
{
  "eventType": "pollution_defense.symptoms_reported",
  "data": {
    "cough": false,
    "wheeze": false,
    "fatigue": true,
    "feeling_score": 4
  },
  "environmentalContext": {
    "aqi": 127,
    "pm25": 45.2
  }
}
```

---

## 3. Micro-Coaching Prompts

### Event: `micro_coaching.prompt_shown`
```json
{
  "eventType": "micro_coaching.prompt_shown",
  "data": {
    "prompt_type": "humidity_low",
    "message": "Humidity is low (35%) — take 8 slow inhales"
  }
}
```

### Event: `micro_coaching.prompt_actioned`
```json
{
  "eventType": "micro_coaching.prompt_actioned",
  "data": {
    "prompt_type": "humidity_low",
    "action": "completed_breathing"
  }
}
```

---

## 4. Wellness Journal

### Event: `wellness_journal.entry_created`
```json
{
  "eventType": "wellness_journal.entry_created",
  "data": {
    "mood": "calm",
    "feeling_score": 4,
    "has_notes": true
  },
  "environmentalContext": {
    "aqi": 65,
    "pm25": 18.5,
    "humidity": 52
  }
}
```

### Event: `wellness_journal.correlation_viewed`
```json
{
  "eventType": "wellness_journal.correlation_viewed",
  "data": {
    "metric": "pm25_vs_mood",
    "correlation_strength": 0.72
  }
}
```

---

## 5. Environmental Recovery Tips

### Event: `environmental_tips.tip_shown`
```json
{
  "eventType": "environmental_tips.tip_shown",
  "data": {
    "tip_type": "ginger_tea",
    "recipe": "Warm Ginger Tea"
  }
}
```

### Event: `environmental_tips.recipe_completed`
```json
{
  "eventType": "environmental_tips.recipe_completed",
  "data": {
    "tip_type": "ginger_tea"
  }
}
```

---

## 6. Lung Energy Meter

### Event: `lung_energy.check_in`
```json
{
  "eventType": "lung_energy.check_in",
  "data": {
    "no_flare_up": true,
    "streak_count": 15
  }
}
```

### Event: `lung_energy.level_up`
```json
{
  "eventType": "lung_energy.level_up",
  "data": {
    "new_level": "Champion",
    "total_points": 30
  }
}
```

---

## 7. Morning Movement Program

### Event: `morning_movement.flow_started`
```json
{
  "eventType": "morning_movement.flow_started",
  "data": {
    "day_number": 5,
    "flow_name": "Gentle Awakening"
  }
}
```

### Event: `morning_movement.flow_completed`
```json
{
  "eventType": "morning_movement.flow_completed",
  "data": {
    "day_number": 5,
    "duration_seconds": 480
  }
}
```

### Event: `morning_movement.exercise_viewed`
```json
{
  "eventType": "morning_movement.exercise_viewed",
  "data": {
    "exercise_name": "Seated belly breathing",
    "exercise_index": 0
  }
}
```

---

## 8. Daily Affirmations

### Event: `affirmation.viewed`
```json
{
  "eventType": "affirmation.viewed",
  "data": {
    "affirmation": "I am safe, supported, and breathing with ease",
    "category": "safety"
  }
}
```

### Event: `affirmation.completed`
```json
{
  "eventType": "affirmation.completed",
  "data": {
    "affirmation": "I am safe, supported, and breathing with ease",
    "repetitions": 5
  }
}
```

---

## 9. App Usage Metrics

### Event: `app.session_started`
```json
{
  "eventType": "app.session_started",
  "data": {}
}
```

### Event: `app.session_ended`
```json
{
  "eventType": "app.session_ended",
  "data": {
    "duration_seconds": 870
  }
}
```

### Event: `app.page_viewed`
```json
{
  "eventType": "app.page_viewed",
  "data": {
    "page_name": "dashboard"
  }
}
```

### Event: `app.feature_used`
```json
{
  "eventType": "app.feature_used",
  "data": {
    "feature_name": "air_quality_check",
    "action": "refresh"
  }
}
```

---

## 10. Air Quality Events

### Event: `air_quality.data_fetched`
```json
{
  "eventType": "air_quality.data_fetched",
  "data": {
    "aqi": 85,
    "pm25": 28.5,
    "location": "New York, NY"
  }
}
```

### Event: `air_quality.alert_triggered`
```json
{
  "eventType": "air_quality.alert_triggered",
  "data": {
    "alert_type": "pm25_high",
    "threshold": 35,
    "current_value": 42.3
  }
}
```

---

## AI Analysis Queries

### 1. Wellness Correlations
**Query:** Find correlation between PM2.5 levels and user-reported symptoms
```sql
SELECT 
  AVG(e.pm25) as avg_pm25,
  s.symptom_type,
  COUNT(*) as occurrence_count,
  CORR(e.pm25, s.severity) as correlation
FROM environmental_data e
JOIN symptom_reports s ON e.date = s.date AND e.user_id = s.user_id
GROUP BY s.symptom_type
HAVING COUNT(*) > 30
ORDER BY correlation DESC;
```

### 2. Ritual Effectiveness
**Query:** Measure ritual completion impact on daily wellness
```sql
SELECT 
  r.user_id,
  r.completion_rate,
  AVG(w.feeling_score) as avg_wellness,
  AVG(l.flare_up_rate) as flare_up_rate
FROM (
  SELECT user_id, 
         COUNT(CASE WHEN completed THEN 1 END) * 100.0 / COUNT(*) as completion_rate
  FROM daily_ritual_events
  GROUP BY user_id
) r
JOIN wellness_journal w ON r.user_id = w.user_id
JOIN lung_energy_checkins l ON r.user_id = l.user_id
GROUP BY r.user_id, r.completion_rate
ORDER BY completion_rate DESC;
```

### 3. Pollution Defense Effectiveness
**Query:** Analyze symptom reduction with protocol usage
```sql
SELECT 
  pd.user_id,
  COUNT(pd.completed) as protocol_uses,
  AVG(CASE WHEN pd.symptoms_reported THEN 1 ELSE 0 END) as symptom_rate,
  AVG(pd.feeling_score) as avg_feeling
FROM pollution_defense_events pd
WHERE pd.completed = true
GROUP BY pd.user_id
HAVING COUNT(pd.completed) > 5
ORDER BY symptom_rate ASC;
```

### 4. Optimal Timing Analysis
**Query:** Find best times for ritual completion
```sql
SELECT 
  EXTRACT(HOUR FROM timestamp) as hour_of_day,
  COUNT(*) as completions,
  AVG(duration_seconds) as avg_duration,
  AVG(streak_count) as avg_streak
FROM daily_ritual_events
WHERE eventType = 'daily_ritual.completed'
GROUP BY hour_of_day
ORDER BY completions DESC;
```

### 5. Environmental Trigger Identification
**Query:** Identify which environmental factors trigger most issues
```sql
SELECT 
  CASE 
    WHEN aqi > 150 THEN 'very_unhealthy'
    WHEN aqi > 100 THEN 'unhealthy'
    WHEN aqi > 50 THEN 'moderate'
    ELSE 'good'
  END as air_quality_category,
  COUNT(s.symptom_id) as symptom_count,
  AVG(s.severity) as avg_severity,
  ARRAY_AGG(DISTINCT s.symptom_type) as common_symptoms
FROM environmental_data e
JOIN symptom_reports s ON e.date = s.date AND e.user_id = s.user_id
GROUP BY air_quality_category
ORDER BY symptom_count DESC;
```

---

## Data Storage Structure

### PostgreSQL Tables

```sql
-- Events table (all analytics events)
CREATE TABLE analytics_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  user_id VARCHAR(50),
  session_id VARCHAR(100) NOT NULL,
  data JSONB NOT NULL,
  environmental_context JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_events_type ON analytics_events(event_type);
CREATE INDEX idx_events_user ON analytics_events(user_id);
CREATE INDEX idx_events_timestamp ON analytics_events(timestamp);
CREATE INDEX idx_events_data ON analytics_events USING GIN(data);

-- Aggregated metrics table
CREATE TABLE user_metrics (
  user_id VARCHAR(50) PRIMARY KEY,
  total_sessions INT DEFAULT 0,
  avg_session_duration INT DEFAULT 0,
  ritual_completion_rate DECIMAL(5,2) DEFAULT 0,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_active TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Wellness correlations table
CREATE TABLE wellness_correlations (
  id SERIAL PRIMARY KEY,
  metric_name VARCHAR(100) NOT NULL,
  correlation_value DECIMAL(5,4) NOT NULL,
  sample_size INT NOT NULL,
  insight_text TEXT,
  confidence_level VARCHAR(20),
  calculated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Privacy & Security

### Data Anonymization
- User IDs are hashed before storage
- Personal information is encrypted
- Location data is generalized to city level
- IP addresses are not stored

### Data Retention
- Raw events: 90 days
- Aggregated metrics: 2 years
- AI insights: Indefinite (anonymized)

### Compliance
- GDPR compliant
- HIPAA considerations for health data
- User consent required
- Right to deletion honored

---

## AI Coach Insights Generation

### Weekly Analysis
1. **Correlation Discovery**: Find new patterns between environment and wellness
2. **Personalization**: Identify user-specific triggers and optimal routines
3. **Prediction**: Forecast high-risk days based on historical patterns
4. **Recommendations**: Generate personalized coaching tips

### Monthly Reports
1. **Population Health**: Aggregate insights across all users
2. **Feature Effectiveness**: Measure impact of each wellness feature
3. **Trend Analysis**: Identify seasonal patterns and emerging issues
4. **Success Stories**: Highlight users with significant improvements

---

## Export Formats

### CSV Export Structure
```csv
user_id,event_type,timestamp,aqi,pm25,humidity,data_json
user_123,daily_ritual.completed,2025-10-29T09:45:00Z,85,28.5,45,"{""streak"":12}"
```

### JSON Export Structure
```json
{
  "export_date": "2025-10-29",
  "time_range": "7d",
  "total_events": 15234,
  "events": [...]
}
```

---

## Next Steps for AI Coach

1. **Implement ML Models**
   - Time series forecasting for air quality
   - Clustering for user segmentation
   - Classification for symptom prediction

2. **Real-time Insights**
   - Stream processing for immediate alerts
   - Anomaly detection for unusual patterns
   - Adaptive recommendations based on current context

3. **Personalization Engine**
   - Individual baseline calculation
   - Custom threshold setting
   - Tailored ritual timing suggestions

4. **Feedback Loop**
   - A/B testing for feature improvements
   - User satisfaction tracking
   - Continuous model refinement
