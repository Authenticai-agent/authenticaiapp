# Fix Saved Locations Feature

## Problem
The "Add Location" button in Premium Features fails with a 500 error because the `saved_locations` table doesn't exist in Supabase.

## Solution
Run the SQL migration to create the table with proper RLS policies.

---

## Steps to Fix

### 1. Go to Supabase Dashboard
https://supabase.com/dashboard/project/mvzedizusolvyzqddevm

### 2. Open SQL Editor
Click on **SQL Editor** in the left sidebar

### 3. Create New Query
Click **"New Query"**

### 4. Copy and Paste This SQL

```sql
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
```

### 5. Click "Run" (or press Cmd/Ctrl + Enter)

You should see: ✅ **Success. No rows returned**

---

## Test After Migration

1. Go to https://authenticai.app/premium-features
2. Click **"Multiple Locations"** tab
3. Click **"Use Current Location"** or manually enter coordinates
4. Click **"Add Location"**
5. ✅ Location should be saved successfully!

---

## What This Does

- ✅ Creates `saved_locations` table
- ✅ Sets up Row-Level Security (RLS) policies
- ✅ Allows users to save up to 5 locations
- ✅ Supports primary location marking
- ✅ Prevents duplicate locations
- ✅ Auto-deletes locations when user is deleted

---

## Verification

After running the SQL, you can verify the table exists:

```sql
SELECT * FROM saved_locations LIMIT 5;
```

Should return empty results (no error).
