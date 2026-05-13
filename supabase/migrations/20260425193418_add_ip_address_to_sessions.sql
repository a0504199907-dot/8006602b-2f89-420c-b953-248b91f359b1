-- Add IP address column to analytics_sessions
ALTER TABLE public.analytics_sessions 
ADD COLUMN IF NOT EXISTS ip_address TEXT;