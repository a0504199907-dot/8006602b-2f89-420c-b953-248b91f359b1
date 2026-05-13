-- Add description column for rich text content to bein_hatzibur table
ALTER TABLE public.bein_hatzibur 
ADD COLUMN IF NOT EXISTS description TEXT;