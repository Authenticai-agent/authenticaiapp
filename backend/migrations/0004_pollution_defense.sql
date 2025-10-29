-- Pollution Defense Protocol Tables Migration
-- Creates tables for tracking pollution defense sessions and symptom check-ins

-- ============================================================================
-- Pollution Defense Sessions Table
-- Tracks each time a user activates the pollution defense protocol
-- ============================================================================

CREATE TABLE IF NOT EXISTS pollution_defense_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    phase VARCHAR(50) NOT NULL, -- pre_exposure, during_exposure, post_exposure
    aqi FLOAT NOT NULL,
    pm25 FLOAT,
    o3 FLOAT,
    location JSONB,
    checklist_completed JSONB DEFAULT '{}',
    walk_started_at TIMESTAMP,
    reminders_shown JSONB DEFAULT '[]',
    recovery_completed JSONB DEFAULT '{}',
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active', -- active, completed, abandoned
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pollution_sessions_user ON pollution_defense_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_pollution_sessions_started ON pollution_defense_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_pollution_sessions_status ON pollution_defense_sessions(status);

-- ============================================================================
-- Pollution Defense Symptoms Table
-- Tracks post-exposure symptom check-ins
-- ============================================================================

CREATE TABLE IF NOT EXISTS pollution_defense_symptoms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES pollution_defense_sessions(id) ON DELETE CASCADE,
    cough BOOLEAN DEFAULT FALSE,
    wheeze BOOLEAN DEFAULT FALSE,
    fatigue BOOLEAN DEFAULT FALSE,
    eye_irritation BOOLEAN DEFAULT FALSE,
    throat_irritation BOOLEAN DEFAULT FALSE,
    overall_feeling INTEGER CHECK (overall_feeling BETWEEN 1 AND 5),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pollution_symptoms_user ON pollution_defense_symptoms(user_id);
CREATE INDEX IF NOT EXISTS idx_pollution_symptoms_session ON pollution_defense_symptoms(session_id);
CREATE INDEX IF NOT EXISTS idx_pollution_symptoms_created ON pollution_defense_symptoms(created_at);

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON TABLE pollution_defense_sessions IS 'Tracks user pollution defense protocol sessions with AQI data and completion status';
COMMENT ON TABLE pollution_defense_symptoms IS 'Tracks post-exposure symptom check-ins to monitor health impact';

COMMENT ON COLUMN pollution_defense_sessions.phase IS 'Current phase: pre_exposure, during_exposure, post_exposure';
COMMENT ON COLUMN pollution_defense_sessions.aqi IS 'Air Quality Index at session start (US AQI scale 0-500)';
COMMENT ON COLUMN pollution_defense_sessions.pm25 IS 'PM2.5 particulate matter in µg/m³';
COMMENT ON COLUMN pollution_defense_sessions.o3 IS 'Ozone level in ppb';
COMMENT ON COLUMN pollution_defense_sessions.location IS 'User location as {lat, lon, address}';
COMMENT ON COLUMN pollution_defense_sessions.checklist_completed IS 'Pre-exposure checklist items completed';
COMMENT ON COLUMN pollution_defense_sessions.reminders_shown IS 'Array of reminder IDs shown during walk';
COMMENT ON COLUMN pollution_defense_sessions.recovery_completed IS 'Post-exposure recovery steps completed';

COMMENT ON COLUMN pollution_defense_symptoms.overall_feeling IS 'Overall feeling scale 1-5 (1=Great, 5=Not good)';
COMMENT ON COLUMN pollution_defense_symptoms.wheeze IS 'Critical symptom - triggers medical recommendation if true';
