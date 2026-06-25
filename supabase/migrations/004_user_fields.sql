-- ============================================================
-- Add first_name, last_name, role_type, profile_completed to users
-- ============================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_type TEXT DEFAULT 'incoming' CHECK (role_type IN ('incoming', 'outgoing'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_country TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;
