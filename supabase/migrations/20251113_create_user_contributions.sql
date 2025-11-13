-- Create enum types for contribution management
CREATE TYPE contribution_type AS ENUM (
  'NEW_INSTITUTION',
  'EDIT_INSTITUTION',
  'NEW_MAJOR',
  'EDIT_DATA',
  'CORRECTION'
);

CREATE TYPE contribution_status AS ENUM (
  'PENDING',
  'APPROVED',
  'REJECTED',
  'IN_REVIEW'
);

-- Create user_contributions table
-- Note: user_id references will be added when user authentication is implemented
CREATE TABLE IF NOT EXISTS user_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,  -- Will be UUID when auth is implemented
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  type contribution_type NOT NULL,
  status contribution_status NOT NULL DEFAULT 'PENDING',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,  -- Will be UUID when auth is implemented
  reason TEXT,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_user_contributions_user_id ON user_contributions(user_id);
CREATE INDEX idx_user_contributions_status ON user_contributions(status);
CREATE INDEX idx_user_contributions_type ON user_contributions(type);
CREATE INDEX idx_user_contributions_submitted_at ON user_contributions(submitted_at DESC);
CREATE INDEX idx_user_contributions_reviewed_by ON user_contributions(reviewed_by);
CREATE INDEX idx_user_contributions_data_gin ON user_contributions USING gin(data);

-- Create moderation_actions audit trail table
CREATE TABLE IF NOT EXISTS moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contribution_id UUID NOT NULL REFERENCES user_contributions(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('APPROVE', 'REJECT', 'REQUEST_CHANGES')),
  reason TEXT NOT NULL,
  moderator_id TEXT NOT NULL,  -- Will be UUID when auth is implemented
  moderator_name TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Create indexes for moderation_actions
CREATE INDEX idx_moderation_actions_contribution_id ON moderation_actions(contribution_id);
CREATE INDEX idx_moderation_actions_moderator_id ON moderation_actions(moderator_id);
CREATE INDEX idx_moderation_actions_timestamp ON moderation_actions(timestamp DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user_contributions
CREATE TRIGGER update_user_contributions_updated_at
  BEFORE UPDATE ON user_contributions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Note: Row Level Security (RLS) will be added when Supabase auth is integrated
-- For now, API-level authorization will be used

-- Insert sample data for testing (optional, remove in production)
-- This creates a test admin user and sample contributions
-- Note: You'll need actual user IDs from your auth.users table

COMMENT ON TABLE user_contributions IS 'Stores user-submitted contributions for moderation';
COMMENT ON TABLE moderation_actions IS 'Audit trail of all moderation actions';
COMMENT ON COLUMN user_contributions.data IS 'JSONB payload containing contribution-specific data (institution details, field changes, etc.)';
COMMENT ON COLUMN user_contributions.reason IS 'Reason provided by moderator for approval/rejection';
