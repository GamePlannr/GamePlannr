-- Add payment method columns to session_requests table
ALTER TABLE session_requests ADD COLUMN payment_method TEXT;
ALTER TABLE session_requests ADD COLUMN other_payment_method TEXT;
