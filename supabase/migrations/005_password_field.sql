-- Add password_hash field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT DEFAULT '';
