-- Drop existing table if it has wrong constraint
DROP TABLE IF EXISTS donations CASCADE;

-- Create donations table for Stripe subscriptions (without foreign key constraint)
CREATE TABLE IF NOT EXISTS donations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,  -- No foreign key constraint
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'usd',
    status TEXT DEFAULT 'active', -- active, cancelled, past_due
    interval TEXT DEFAULT 'year', -- month, year
    cancel_at_period_end BOOLEAN DEFAULT FALSE, -- User requested to stop recurring donation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_stripe_subscription ON donations(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);

-- Enable RLS
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own donations
DROP POLICY IF EXISTS "Users can view own donations" ON donations;
CREATE POLICY "Users can view own donations"
    ON donations FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Service role can manage donations
DROP POLICY IF EXISTS "Service role can manage donations" ON donations;
CREATE POLICY "Service role can manage donations"
    ON donations FOR ALL
    USING (auth.role() = 'service_role');

-- Add comment
COMMENT ON TABLE donations IS 'Stores Stripe donation/subscription information';
