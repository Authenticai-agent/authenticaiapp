-- Analytics Tables Migration
-- Creates tables for tracking user interactions and AI insights

-- ============================================================================
-- Analytics Events Table
-- Stores all user interaction events with environmental context
-- ============================================================================

CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(100) NOT NULL,
    data JSONB NOT NULL DEFAULT '{}',
    environmental_context JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_data ON analytics_events USING GIN(data);
CREATE INDEX IF NOT EXISTS idx_analytics_events_env ON analytics_events USING GIN(environmental_context);

-- ============================================================================
-- Wellness Correlations Table
-- Stores AI-discovered correlations between environmental factors and wellness
-- ============================================================================

CREATE TABLE IF NOT EXISTS wellness_correlations (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    correlation_value DECIMAL(5,4) NOT NULL,
    sample_size INT NOT NULL,
    insight_text TEXT,
    confidence_level VARCHAR(20),
    calculated_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for querying correlations
CREATE INDEX IF NOT EXISTS idx_wellness_correlations_metric ON wellness_correlations(metric_name);
CREATE INDEX IF NOT EXISTS idx_wellness_correlations_value ON wellness_correlations(correlation_value DESC);

-- ============================================================================
-- User Metrics Table
-- Aggregated metrics per user for quick dashboard access
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_metrics (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_sessions INT DEFAULT 0,
    avg_session_duration INT DEFAULT 0,
    ritual_completion_rate DECIMAL(5,2) DEFAULT 0,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_active TIMESTAMP,
    total_rituals_completed INT DEFAULT 0,
    total_pollution_defense_uses INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_user_metrics_user ON user_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_metrics_last_active ON user_metrics(last_active DESC);

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON TABLE analytics_events IS 'Stores all user interaction events with environmental context for AI analysis';
COMMENT ON TABLE wellness_correlations IS 'AI-discovered correlations between environmental factors and user wellness';
COMMENT ON TABLE user_metrics IS 'Aggregated user metrics for quick dashboard access';

COMMENT ON COLUMN analytics_events.event_type IS 'Type of event (e.g., daily_ritual.started, pollution_defense.completed)';
COMMENT ON COLUMN analytics_events.data IS 'Event-specific data in JSON format';
COMMENT ON COLUMN analytics_events.environmental_context IS 'Air quality and environmental data at time of event';

COMMENT ON COLUMN wellness_correlations.correlation_value IS 'Correlation coefficient between -1 and 1';
COMMENT ON COLUMN wellness_correlations.sample_size IS 'Number of data points used in correlation calculation';
COMMENT ON COLUMN wellness_correlations.confidence_level IS 'Statistical confidence level (low, medium, high)';

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_correlations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_metrics ENABLE ROW LEVEL SECURITY;

-- Analytics Events Policies
-- Users can only see their own events
CREATE POLICY "Users can view own analytics events"
    ON analytics_events FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own events
CREATE POLICY "Users can insert own analytics events"
    ON analytics_events FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Service role can do everything (for admin dashboard)
CREATE POLICY "Service role has full access to analytics events"
    ON analytics_events FOR ALL
    USING (auth.role() = 'service_role');

-- Wellness Correlations Policies
-- All authenticated users can read correlations
CREATE POLICY "Authenticated users can view correlations"
    ON wellness_correlations FOR SELECT
    TO authenticated
    USING (true);

-- Only service role can modify correlations
CREATE POLICY "Service role can manage correlations"
    ON wellness_correlations FOR ALL
    USING (auth.role() = 'service_role');

-- User Metrics Policies
-- Users can only see their own metrics
CREATE POLICY "Users can view own metrics"
    ON user_metrics FOR SELECT
    USING (auth.uid() = user_id);

-- Users can update their own metrics
CREATE POLICY "Users can update own metrics"
    ON user_metrics FOR UPDATE
    USING (auth.uid() = user_id);

-- Service role has full access
CREATE POLICY "Service role has full access to user metrics"
    ON user_metrics FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================================================
-- Functions for automatic updates
-- ============================================================================

-- Function to update user_metrics.updated_at
CREATE OR REPLACE FUNCTION update_user_metrics_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_metrics
CREATE TRIGGER update_user_metrics_timestamp
    BEFORE UPDATE ON user_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_user_metrics_timestamp();

-- Function to update wellness_correlations.updated_at
CREATE OR REPLACE FUNCTION update_wellness_correlations_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for wellness_correlations
CREATE TRIGGER update_wellness_correlations_timestamp
    BEFORE UPDATE ON wellness_correlations
    FOR EACH ROW
    EXECUTE FUNCTION update_wellness_correlations_timestamp();

-- ============================================================================
-- Sample data for testing (optional - remove in production)
-- ============================================================================

-- Insert sample correlations for demonstration
INSERT INTO wellness_correlations (metric_name, correlation_value, sample_size, insight_text, confidence_level)
VALUES 
    ('PM2.5 vs Symptoms', 0.72, 150, 'Users report 72% fewer symptoms when PM2.5 levels are below 25 µg/m³', 'high'),
    ('Daily Ritual vs Wellness', 0.68, 200, 'Users completing daily ritual 5+ days/week report 40% better wellness scores', 'high'),
    ('Humidity vs Wheeze', 0.65, 120, 'High humidity (>70%) correlates with increased wheeze reports', 'medium')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Grant permissions
-- ============================================================================

-- Grant usage on sequences
GRANT USAGE, SELECT ON SEQUENCE wellness_correlations_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE wellness_correlations_id_seq TO service_role;

-- Grant table permissions
GRANT SELECT, INSERT ON analytics_events TO authenticated;
GRANT ALL ON analytics_events TO service_role;

GRANT SELECT ON wellness_correlations TO authenticated;
GRANT ALL ON wellness_correlations TO service_role;

GRANT SELECT, UPDATE ON user_metrics TO authenticated;
GRANT ALL ON user_metrics TO service_role;
