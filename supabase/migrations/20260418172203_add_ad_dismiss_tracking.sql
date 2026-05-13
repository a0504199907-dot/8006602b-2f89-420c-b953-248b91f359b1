-- Add dismiss tracking to ad_stats table
ALTER TABLE public.ad_stats 
ADD COLUMN IF NOT EXISTS dismisses INTEGER NOT NULL DEFAULT 0;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_ad_stats_dismisses ON public.ad_stats(dismisses);

-- Add comment
COMMENT ON COLUMN public.ad_stats.dismisses IS 'Number of times users closed this ad with X button';