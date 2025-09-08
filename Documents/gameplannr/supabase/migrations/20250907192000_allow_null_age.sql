-- Allow NULL values for age column in profiles table
ALTER TABLE profiles ALTER COLUMN age DROP NOT NULL;
