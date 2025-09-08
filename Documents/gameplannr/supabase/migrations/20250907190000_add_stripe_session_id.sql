-- Add stripe_session_id column to sessions table
ALTER TABLE sessions ADD COLUMN stripe_session_id TEXT;

-- Add index for better performance
CREATE INDEX idx_sessions_stripe_session_id ON sessions(stripe_session_id);
