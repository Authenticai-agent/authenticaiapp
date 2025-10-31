-- Create briefing_usage table for strict daily briefing limits
-- This ensures free users can ONLY get 5 briefings per day, even if they:
-- - Log out and log back in
-- - Clear localStorage
-- - Hard refresh the page
-- - Use different devices
-- - Server restarts

CREATE TABLE IF NOT EXISTS briefing_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
    briefing_count INTEGER NOT NULL DEFAULT 0,
    last_briefing_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one row per user per day
    CONSTRAINT unique_user_date UNIQUE(user_id, usage_date)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_briefing_usage_user_date ON briefing_usage(user_id, usage_date);
CREATE INDEX IF NOT EXISTS idx_briefing_usage_date ON briefing_usage(usage_date);

-- Enable RLS
ALTER TABLE briefing_usage ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own briefing usage" ON briefing_usage;
DROP POLICY IF EXISTS "Users can insert their own briefing usage" ON briefing_usage;
DROP POLICY IF EXISTS "Users can update their own briefing usage" ON briefing_usage;
DROP POLICY IF EXISTS "Service role can manage all briefing usage" ON briefing_usage;

-- Create RLS policies
CREATE POLICY "Users can view their own briefing usage"
    ON briefing_usage FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own briefing usage"
    ON briefing_usage FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own briefing usage"
    ON briefing_usage FOR UPDATE
    USING (auth.uid() = user_id);

-- Service role can manage all (for backend operations)
CREATE POLICY "Service role can manage all briefing usage"
    ON briefing_usage FOR ALL
    USING (true);

-- Grant permissions
GRANT ALL ON briefing_usage TO authenticated;
GRANT ALL ON briefing_usage TO service_role;

-- Create function to clean up old records (optional, for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_briefing_usage()
RETURNS void AS $$
BEGIN
    -- Delete records older than 30 days
    DELETE FROM briefing_usage
    WHERE usage_date < CURRENT_DATE - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create a function to get or create today's usage
CREATE OR REPLACE FUNCTION get_or_create_briefing_usage(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    usage_date DATE,
    briefing_count INTEGER,
    last_briefing_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- Try to get today's record
    RETURN QUERY
    SELECT 
        bu.id,
        bu.user_id,
        bu.usage_date,
        bu.briefing_count,
        bu.last_briefing_at
    FROM briefing_usage bu
    WHERE bu.user_id = p_user_id
    AND bu.usage_date = CURRENT_DATE;
    
    -- If no record exists, create one
    IF NOT FOUND THEN
        INSERT INTO briefing_usage (user_id, usage_date, briefing_count)
        VALUES (p_user_id, CURRENT_DATE, 0)
        RETURNING 
            briefing_usage.id,
            briefing_usage.user_id,
            briefing_usage.usage_date,
            briefing_usage.briefing_count,
            briefing_usage.last_briefing_at
        INTO id, user_id, usage_date, briefing_count, last_briefing_at;
        
        RETURN NEXT;
    END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE briefing_usage IS 'Tracks daily briefing usage to enforce 5 briefings per day limit for free users';
COMMENT ON COLUMN briefing_usage.briefing_count IS 'Number of briefings generated today (max 5 for free users)';
COMMENT ON COLUMN briefing_usage.last_briefing_at IS 'Timestamp of the last briefing generation';
