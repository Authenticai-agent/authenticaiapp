-- Calendar Integration Tables
-- Stores Google Calendar tokens and appointment reminders

-- Add calendar fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS google_calendar_token TEXT,
ADD COLUMN IF NOT EXISTS calendar_connected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS calendar_connected_at TIMESTAMP;

-- Create appointment_reminders table
CREATE TABLE IF NOT EXISTS appointment_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointment_id TEXT NOT NULL,
    appointment_title TEXT NOT NULL,
    appointment_time TIMESTAMP NOT NULL,
    recommendation TEXT NOT NULL,
    weather_data JSONB,
    air_quality_data JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    read_at TIMESTAMP,
    dismissed_at TIMESTAMP
);

-- Create indexes for appointment_reminders table
CREATE INDEX IF NOT EXISTS idx_appointment_reminders_user 
ON appointment_reminders(user_id);

CREATE INDEX IF NOT EXISTS idx_appointment_reminders_time 
ON appointment_reminders(appointment_time);

CREATE INDEX IF NOT EXISTS idx_appointment_reminders_read 
ON appointment_reminders(user_id, read_at);

-- Create index for calendar-connected users
CREATE INDEX IF NOT EXISTS idx_users_calendar_connected 
ON users(calendar_connected) 
WHERE calendar_connected = TRUE;

COMMENT ON TABLE appointment_reminders IS 'Stores AI-generated health recommendations for upcoming appointments';
COMMENT ON COLUMN users.google_calendar_token IS 'OAuth access token for Google Calendar API';
COMMENT ON COLUMN users.calendar_connected IS 'Whether user has connected their Google Calendar';
