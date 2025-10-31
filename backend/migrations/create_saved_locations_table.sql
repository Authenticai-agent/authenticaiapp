-- Create saved_locations table for Premium Features
CREATE TABLE IF NOT EXISTS saved_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    lat DECIMAL(10, 8) NOT NULL,
    lon DECIMAL(11, 8) NOT NULL,
    address TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_location UNIQUE(user_id, lat, lon)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_saved_locations_user_id ON saved_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_locations_is_primary ON saved_locations(user_id, is_primary);

-- Enable RLS
ALTER TABLE saved_locations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own locations" ON saved_locations;
DROP POLICY IF EXISTS "Users can insert their own locations" ON saved_locations;
DROP POLICY IF EXISTS "Users can update their own locations" ON saved_locations;
DROP POLICY IF EXISTS "Users can delete their own locations" ON saved_locations;

-- Create RLS policies
CREATE POLICY "Users can view their own locations"
    ON saved_locations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own locations"
    ON saved_locations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own locations"
    ON saved_locations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own locations"
    ON saved_locations FOR DELETE
    USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON saved_locations TO authenticated;
GRANT ALL ON saved_locations TO service_role;
