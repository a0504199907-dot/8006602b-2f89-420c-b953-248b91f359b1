-- Create ad_impressions table for tracking ad analytics
CREATE TABLE IF NOT EXISTS public.ad_impressions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creative_id UUID NOT NULL,
  impression_type TEXT NOT NULL CHECK (impression_type IN ('view', 'click', 'dismiss')),
  page_url TEXT,
  slot_name TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for fast analytics queries
CREATE INDEX idx_ad_impressions_creative_id ON public.ad_impressions(creative_id);
CREATE INDEX idx_ad_impressions_created_at ON public.ad_impressions(created_at DESC);
CREATE INDEX idx_ad_impressions_type ON public.ad_impressions(impression_type);
CREATE INDEX idx_ad_impressions_slot ON public.ad_impressions(slot_name);

-- Composite index for analytics queries
CREATE INDEX idx_ad_impressions_analytics ON public.ad_impressions(creative_id, impression_type, created_at DESC);

-- Enable RLS
ALTER TABLE public.ad_impressions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert impressions (tracking)
CREATE POLICY "Anyone can insert impressions"
  ON public.ad_impressions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated users can read impressions (analytics dashboard)
CREATE POLICY "Authenticated users can read impressions"
  ON public.ad_impressions
  FOR SELECT
  TO authenticated
  USING (true);