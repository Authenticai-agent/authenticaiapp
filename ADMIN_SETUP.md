# 🔐 Admin Setup Guide

## Quick Setup

### 1. Run Admin Setup Script

From the backend directory:

```bash
cd backend
python setup_admin.py
```

This will create/update the admin user with:
- **Email:** `jura@authenticai.ai`
- **Password:** `admin1234`
- **Admin Role:** `True`

### 2. Login to Admin Dashboard

1. Start the frontend:
   ```bash
   cd frontend
   npm start
   ```

2. Navigate to: `http://localhost:3000/login`

3. Login with:
   - Email: `jura@authenticai.ai`
   - Password: `admin1234`

4. Access admin dashboard: `http://localhost:3000/admin`

---

## Admin Dashboard Features

### 📊 Real-Time Metrics
- Total users
- Active users today
- Daily ritual completion rate
- Average session duration
- Retention rates

### 📈 Feature Analytics
- **Daily Ritual**: Completion rates, duration, streaks
- **Pollution Defense**: Activations, completions, symptoms
- **Wellness Journal**: Entries, correlations
- **Lung Energy**: Check-ins, level progression

### 🧠 AI Insights
- Environmental correlations (PM2.5 vs symptoms)
- Ritual effectiveness measurements
- Optimal timing analysis
- Trigger identification

### 📥 Data Export
Export analytics data as CSV:
- Daily Ritual data
- Pollution Defense events
- Wellness Journal entries
- Lung Energy metrics
- Environmental data
- User behavior
- All data combined

### 🔍 Time Range Filtering
- Last 7 days
- Last 30 days
- Last 90 days

---

## API Endpoints

### Admin Authentication
All admin endpoints require authentication with `is_admin: true`

### Analytics Endpoints

#### GET `/api/v1/admin/metrics?range=7d`
Get aggregated metrics for dashboard

**Response:**
```json
{
  "totalUsers": 1234,
  "activeToday": 456,
  "dailyRitualCompletionRate": 78,
  "avgSessionDuration": 14.5,
  "retentionRate": 82
}
```

#### GET `/api/v1/admin/correlations?range=7d`
Get AI-discovered correlations

**Response:**
```json
[
  {
    "metric": "PM2.5 vs Symptoms",
    "correlation": 0.72,
    "sampleSize": 150,
    "insight": "Users report 72% fewer symptoms when PM2.5 < 25"
  }
]
```

#### GET `/api/v1/admin/export/{data_type}?range=7d`
Export data as CSV

**Data Types:**
- `all` - All analytics events
- `daily_ritual` - Daily ritual events
- `pollution_defense` - Pollution defense events
- `wellness_journal` - Wellness journal entries
- `lung_energy` - Lung energy check-ins
- `environmental` - Environmental tips
- `user_behavior` - App usage metrics

#### POST `/api/v1/analytics/events`
Receive analytics events from frontend (public endpoint)

**Request Body:**
```json
{
  "events": [
    {
      "eventType": "daily_ritual.completed",
      "timestamp": "2025-10-29T09:45:00Z",
      "userId": "user_123",
      "sessionId": "session_abc",
      "data": {
        "total_duration_seconds": 420,
        "streak_count": 12
      },
      "environmentalContext": {
        "aqi": 85,
        "pm25": 28.5,
        "humidity": 45
      }
    }
  ]
}
```

---

## Database Tables

### `analytics_events`
Stores all user interaction events

```sql
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
```

### `wellness_correlations`
Stores AI-discovered correlations

```sql
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

### `user_metrics`
Aggregated user metrics

```sql
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
```

---

## Security

### Admin Access Control
- Only users with `is_admin: true` can access admin endpoints
- JWT token required for all requests
- 403 Forbidden returned for non-admin users

### Data Privacy
- User IDs are hashed before storage
- Personal information is encrypted
- Location data generalized to city level
- GDPR/HIPAA compliant

### Rate Limiting
- Admin endpoints have higher rate limits
- Export operations are throttled to prevent abuse

---

## Troubleshooting

### Admin user not created
```bash
# Check database connection
python -c "from database import get_admin_db; print(get_admin_db())"

# Re-run setup script
python setup_admin.py
```

### Can't access admin dashboard
1. Verify you're logged in with admin account
2. Check browser console for errors
3. Verify backend is running on port 8000
4. Check JWT token includes `is_admin: true`

### No analytics data showing
1. Ensure frontend analytics collector is integrated
2. Check browser console for analytics errors
3. Verify events are being sent to `/api/v1/analytics/events`
4. Check database for `analytics_events` table

### Export not working
1. Verify admin authentication
2. Check time range parameter (7d, 30d, 90d)
3. Ensure data exists for selected range
4. Check backend logs for errors

---

## Next Steps

1. **Run setup script** to create admin user
2. **Login** to admin dashboard
3. **Integrate analytics** in frontend components
4. **Monitor metrics** and user behavior
5. **Export data** for AI analysis
6. **Generate insights** from correlations

---

## Support

For issues or questions:
- Check logs: `backend/logs/`
- Review documentation: `DATA_COLLECTION_SCHEMA.md`
- Contact: jura@authenticai.ai
