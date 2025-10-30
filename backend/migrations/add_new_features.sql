-- Migration: Add tables for multiple locations, notifications, and historical data
-- Date: 2025-10-30
-- Features: Saved locations, notification settings, AQ history, notification log

-- 1. Saved Locations Table
CREATE TABLE IF NOT EXISTS saved_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    lat FLOAT NOT NULL,
    lon FLOAT NOT NULL,
    address TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_location UNIQUE (user_id, name)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_saved_locations_user_id ON saved_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_locations_primary ON saved_locations(user_id, is_primary);

-- 2. Notification Settings Table
CREATE TABLE IF NOT EXISTS notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    aqi_threshold INTEGER DEFAULT 100,
    enabled BOOLEAN DEFAULT TRUE,
    quiet_hours_start TIME DEFAULT '22:00:00',
    quiet_hours_end TIME DEFAULT '07:00:00',
    max_daily_notifications INTEGER DEFAULT 2,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings(user_id);

-- 3. Air Quality History Table
CREATE TABLE IF NOT EXISTS air_quality_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    location_name VARCHAR(255) NOT NULL,
    lat FLOAT NOT NULL,
    lon FLOAT NOT NULL,
    date DATE NOT NULL,
    aqi INTEGER NOT NULL,
    pm25 FLOAT NOT NULL,
    pm10 FLOAT,
    ozone FLOAT,
    no2 FLOAT,
    so2 FLOAT,
    co FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_location_date UNIQUE (user_id, location_name, date)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_aq_history_user_id ON air_quality_history(user_id);
CREATE INDEX IF NOT EXISTS idx_aq_history_date ON air_quality_history(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_aq_history_location ON air_quality_history(user_id, location_name, date DESC);

-- 4. Notification Log Table
CREATE TABLE IF NOT EXISTS notification_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    aqi INTEGER NOT NULL,
    lat FLOAT NOT NULL,
    lon FLOAT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_notification_log_user_id ON notification_log(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_sent_at ON notification_log(user_id, sent_at DESC);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE saved_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE air_quality_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for saved_locations
CREATE POLICY "Users can view their own saved locations"
    ON saved_locations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved locations"
    ON saved_locations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved locations"
    ON saved_locations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved locations"
    ON saved_locations FOR DELETE
    USING (auth.uid() = user_id);

-- 7. RLS Policies for notification_settings
CREATE POLICY "Users can view their own notification settings"
    ON notification_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification settings"
    ON notification_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification settings"
    ON notification_settings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notification settings"
    ON notification_settings FOR DELETE
    USING (auth.uid() = user_id);

-- 8. RLS Policies for air_quality_history
CREATE POLICY "Users can view their own AQ history"
    ON air_quality_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AQ history"
    ON air_quality_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AQ history"
    ON air_quality_history FOR DELETE
    USING (auth.uid() = user_id);

-- 9. RLS Policies for notification_log
CREATE POLICY "Users can view their own notification log"
    ON notification_log FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification log"
    ON notification_log FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 10. Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. Create triggers for updated_at
CREATE TRIGGER update_saved_locations_updated_at
    BEFORE UPDATE ON saved_locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at
    BEFORE UPDATE ON notification_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 12. Comments for documentation
COMMENT ON TABLE saved_locations IS 'Stores user saved locations (max 5 per user)';
COMMENT ON TABLE notification_settings IS 'User notification preferences and thresholds';
COMMENT ON TABLE air_quality_history IS 'Daily snapshots of air quality data for trend analysis';
COMMENT ON TABLE notification_log IS 'Log of sent notifications for rate limiting';

-- Migration complete
