-- Wellness Reports Table
-- Stores generated weekly and monthly wellness reports
-- FREE: 4 weekly + 2 monthly
-- PAID: 12 weekly + 6 monthly

CREATE TABLE IF NOT EXISTS wellness_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_type VARCHAR(10) NOT NULL CHECK (report_type IN ('weekly', 'monthly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  wellness_score INTEGER CHECK (wellness_score >= 0 AND wellness_score <= 100),
  analysis_text TEXT NOT NULL,
  data_summary JSONB,
  generated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure one report per period per user
  CONSTRAINT unique_user_period UNIQUE(user_id, report_type, period_start)
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_user_reports ON wellness_reports(user_id, report_type, period_end DESC);
CREATE INDEX IF NOT EXISTS idx_generated_at ON wellness_reports(generated_at DESC);

-- Function to cleanup old reports based on subscription tier
CREATE OR REPLACE FUNCTION cleanup_old_wellness_reports()
RETURNS void AS $$
BEGIN
  -- Free users: keep last 4 weekly reports
  DELETE FROM wellness_reports
  WHERE id IN (
    SELECT wr.id
    FROM wellness_reports wr
    INNER JOIN users u ON wr.user_id = u.id
    WHERE u.subscription_tier = 'free'
    AND wr.report_type = 'weekly'
    AND wr.id NOT IN (
      SELECT id FROM wellness_reports
      WHERE user_id = wr.user_id
      AND report_type = 'weekly'
      ORDER BY period_end DESC
      LIMIT 4
    )
  );
  
  -- Free users: keep last 2 monthly reports
  DELETE FROM wellness_reports
  WHERE id IN (
    SELECT wr.id
    FROM wellness_reports wr
    INNER JOIN users u ON wr.user_id = u.id
    WHERE u.subscription_tier = 'free'
    AND wr.report_type = 'monthly'
    AND wr.id NOT IN (
      SELECT id FROM wellness_reports
      WHERE user_id = wr.user_id
      AND report_type = 'monthly'
      ORDER BY period_end DESC
      LIMIT 2
    )
  );
  
  -- Paid users: keep last 12 weekly reports
  DELETE FROM wellness_reports
  WHERE id IN (
    SELECT wr.id
    FROM wellness_reports wr
    INNER JOIN users u ON wr.user_id = u.id
    WHERE u.subscription_tier = 'premium'
    AND wr.report_type = 'weekly'
    AND wr.id NOT IN (
      SELECT id FROM wellness_reports
      WHERE user_id = wr.user_id
      AND report_type = 'weekly'
      ORDER BY period_end DESC
      LIMIT 12
    )
  );
  
  -- Paid users: keep last 6 monthly reports
  DELETE FROM wellness_reports
  WHERE id IN (
    SELECT wr.id
    FROM wellness_reports wr
    INNER JOIN users u ON wr.user_id = u.id
    WHERE u.subscription_tier = 'premium'
    AND wr.report_type = 'monthly'
    AND wr.id NOT IN (
      SELECT id FROM wellness_reports
      WHERE user_id = wr.user_id
      AND report_type = 'monthly'
      ORDER BY period_end DESC
      LIMIT 6
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup to run daily at 2 AM
-- Note: Requires pg_cron extension
-- SELECT cron.schedule('cleanup-wellness-reports', '0 2 * * *', 'SELECT cleanup_old_wellness_reports()');
