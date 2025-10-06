-- Migration: Create missing tables for full functionality
-- Date: 2025-09-27
-- Purpose: Add tables for smart devices, health tracking, subscriptions, and community features

-- Smart Devices table for IoT integration
CREATE TABLE IF NOT EXISTS smart_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_name VARCHAR(255) NOT NULL,
    device_type VARCHAR(100) NOT NULL, -- 'air_purifier', 'thermostat', 'humidity_sensor', etc.
    device_brand VARCHAR(100),
    device_model VARCHAR(100),
    connection_status VARCHAR(50) DEFAULT 'disconnected', -- 'connected', 'disconnected', 'error'
    last_seen TIMESTAMP WITH TIME ZONE,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health History table for tracking user health events
CREATE TABLE IF NOT EXISTS health_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL, -- 'flare_up', 'medication_taken', 'symptom_logged', 'prevention_success'
    event_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    severity_level INTEGER CHECK (severity_level >= 1 AND severity_level <= 10),
    symptoms TEXT[],
    triggers TEXT[],
    medications_taken TEXT[],
    notes TEXT,
    location_lat DECIMAL(10, 8),
    location_lon DECIMAL(11, 8),
    weather_conditions JSONB,
    air_quality_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Profiles table for extended user information
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    date_of_birth DATE,
    gender VARCHAR(20),
    height_cm INTEGER,
    weight_kg DECIMAL(5, 2),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(100),
    primary_care_physician VARCHAR(255),
    insurance_provider VARCHAR(255),
    medical_conditions TEXT[],
    current_medications TEXT[],
    allergies TEXT[],
    preferred_language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
    privacy_settings JSONB DEFAULT '{"share_anonymous_data": true, "allow_research": false}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table for premium features
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subscription_type VARCHAR(50) NOT NULL, -- 'free', 'premium', 'family', 'enterprise'
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'trial'
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT true,
    features JSONB DEFAULT '{}', -- Available features for this subscription
    billing_cycle VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'yearly', 'lifetime'
    price_cents INTEGER DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table for transaction tracking
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(50), -- 'stripe', 'paypal', 'apple_pay', etc.
    payment_intent_id VARCHAR(255), -- External payment processor ID
    status VARCHAR(50) NOT NULL, -- 'pending', 'completed', 'failed', 'refunded'
    description TEXT,
    metadata JSONB DEFAULT '{}',
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table for user session management
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    device_info JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community Insights table for engagement features
CREATE TABLE IF NOT EXISTS community_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_lat DECIMAL(10, 8) NOT NULL,
    location_lon DECIMAL(11, 8) NOT NULL,
    radius_km DECIMAL(8, 2) DEFAULT 5.0,
    insight_type VARCHAR(100) NOT NULL, -- 'high_risk_families', 'air_quality_alert', 'pollen_warning'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    risk_level VARCHAR(50), -- 'low', 'moderate', 'high', 'very_high'
    affected_count INTEGER DEFAULT 0,
    data_sources TEXT[],
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback table for user feedback and bug reports
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Allow anonymous feedback
    feedback_type VARCHAR(50) NOT NULL, -- 'bug_report', 'feature_request', 'success_story', 'confusion'
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    page_url VARCHAR(500),
    user_agent TEXT,
    device_info JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
    priority INTEGER DEFAULT 3, -- 1=highest, 5=lowest
    assigned_to VARCHAR(255),
    resolution_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Outcome Tracking table for flare-up prevention success
CREATE TABLE IF NOT EXISTS outcome_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL, -- 'flare_up_prevented', 'symptom_reduced', 'medication_avoided'
    prevention_method VARCHAR(255), -- What action prevented the issue
    severity_before INTEGER CHECK (severity_before >= 1 AND severity_before <= 10),
    severity_after INTEGER CHECK (severity_after >= 1 AND severity_after <= 10),
    time_saved_minutes INTEGER, -- Time saved by prevention
    cost_saved_cents INTEGER, -- Cost saved (medication, ER visit, etc.)
    location_lat DECIMAL(10, 8),
    location_lon DECIMAL(11, 8),
    environmental_factors JSONB, -- Air quality, weather, etc. at time of prevention
    user_notes TEXT,
    verified BOOLEAN DEFAULT false, -- Whether this outcome was verified
    verified_by VARCHAR(255), -- Who verified it (user, caregiver, etc.)
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- B2B2C Organizations table for school/enterprise features
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    organization_type VARCHAR(100) NOT NULL, -- 'school', 'healthcare', 'enterprise', 'community'
    address TEXT,
    location_lat DECIMAL(10, 8),
    location_lon DECIMAL(11, 8),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    subscription_tier VARCHAR(50) DEFAULT 'free',
    max_users INTEGER DEFAULT 10,
    features JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization Users table for B2B2C relationships
CREATE TABLE IF NOT EXISTS organization_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- 'admin', 'nurse', 'teacher', 'parent', 'student'
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_smart_devices_user_id ON smart_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_smart_devices_type ON smart_devices(device_type);
CREATE INDEX IF NOT EXISTS idx_health_history_user_id ON health_history(user_id);
CREATE INDEX IF NOT EXISTS idx_health_history_event_date ON health_history(event_date);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_community_insights_location ON community_insights USING GIST(ST_Point(location_lon, location_lat));
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_outcome_tracking_user_id ON outcome_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_outcome_tracking_event_type ON outcome_tracking(event_type);
CREATE INDEX IF NOT EXISTS idx_organization_users_org_id ON organization_users(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_users_user_id ON organization_users(user_id);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE smart_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE outcome_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic - users can only access their own data)
CREATE POLICY "Users can view own smart devices" ON smart_devices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own smart devices" ON smart_devices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own smart devices" ON smart_devices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own smart devices" ON smart_devices FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own health history" ON health_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own health history" ON health_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own health history" ON health_history FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sessions" ON sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON sessions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own feedback" ON feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert feedback" ON feedback FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can update own feedback" ON feedback FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own outcomes" ON outcome_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own outcomes" ON outcome_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own outcomes" ON outcome_tracking FOR UPDATE USING (auth.uid() = user_id);

-- Community insights are public read
CREATE POLICY "Anyone can view community insights" ON community_insights FOR SELECT USING (true);

-- Organizations and organization_users have more complex policies
CREATE POLICY "Users can view own organizations" ON organization_users FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view organizations they belong to" ON organizations FOR SELECT USING (
    id IN (SELECT organization_id FROM organization_users WHERE user_id = auth.uid())
);

-- Insert default subscription for existing users
INSERT INTO subscriptions (user_id, subscription_type, status, features)
SELECT id, 'free', 'active', '{"basic_predictions": true, "air_quality": true, "daily_briefings": true}'
FROM users 
WHERE id NOT IN (SELECT user_id FROM subscriptions);

-- Insert default user profile for existing users
INSERT INTO user_profiles (user_id, privacy_settings, notification_preferences)
SELECT id, '{"share_anonymous_data": true, "allow_research": false}', '{"email": true, "push": true, "sms": false}'
FROM users 
WHERE id NOT IN (SELECT user_id FROM user_profiles);
