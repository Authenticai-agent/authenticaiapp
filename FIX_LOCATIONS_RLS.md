# Fix Saved Locations RLS Policy

## Problem
The RLS policies use `auth.uid()` which only works with Supabase Auth.
Since your app uses JWT authentication (not Supabase Auth), the policies block all operations.

## Solution
Update the RLS policies to work with the service role key.

---

## Run This SQL in Supabase Dashboard

### 1. Go to Supabase SQL Editor
https://supabase.com/dashboard/project/mvzedizusolvyzqddevm/sql

### 2. Run This SQL:

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own locations" ON saved_locations;
DROP POLICY IF EXISTS "Users can insert their own locations" ON saved_locations;
DROP POLICY IF EXISTS "Users can update their own locations" ON saved_locations;
DROP POLICY IF EXISTS "Users can delete their own locations" ON saved_locations;

-- Disable RLS (since we're using service role key)
ALTER TABLE saved_locations DISABLE ROW LEVEL SECURITY;

-- OR keep RLS enabled but allow service role to bypass it
-- (This is already the default behavior for service_role key)
ALTER TABLE saved_locations ENABLE ROW LEVEL SECURITY;

-- Create permissive policies that allow service role
CREATE POLICY "Allow all for service role"
    ON saved_locations
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create policies for authenticated users (if using Supabase Auth in future)
CREATE POLICY "Allow all for authenticated users"
    ON saved_locations
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
```

### 3. Click "Run"

---

## Alternative: Disable RLS Completely

If you want to keep it simple (since you're using service role key):

```sql
ALTER TABLE saved_locations DISABLE ROW LEVEL SECURITY;
```

This is safe because:
- ✅ Your backend uses the service role key
- ✅ Your backend validates user_id from JWT tokens
- ✅ Users can't access the database directly

---

## After Running SQL

1. Wait for Railway to redeploy (~2 minutes)
2. Go to https://authenticai.app/premium-features
3. Try "Add Location" again
4. ✅ Should work!
