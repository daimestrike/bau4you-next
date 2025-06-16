-- Add missing updated_at column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
 
-- Update existing records to have the current timestamp
UPDATE profiles 
SET updated_at = created_at 
WHERE updated_at IS NULL; 