-- Migration: Add cancel_at_period_end column to donations table
-- This tracks when users request to stop recurring donations

-- Add the column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'donations' 
        AND column_name = 'cancel_at_period_end'
    ) THEN
        ALTER TABLE donations 
        ADD COLUMN cancel_at_period_end BOOLEAN DEFAULT FALSE;
        
        COMMENT ON COLUMN donations.cancel_at_period_end IS 
        'TRUE when user requested to stop recurring donation. Donation remains active until period ends.';
    END IF;
END $$;

-- Update existing records to FALSE if NULL
UPDATE donations 
SET cancel_at_period_end = FALSE 
WHERE cancel_at_period_end IS NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_donations_cancel_at_period_end 
ON donations(cancel_at_period_end);

-- Verify the change
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'donations' 
AND column_name = 'cancel_at_period_end';
