-- Add author field to news_batzibur
ALTER TABLE public.news_batzibur 
ADD COLUMN IF NOT EXISTS author TEXT;

-- Add author field to bein_hatzibur
ALTER TABLE public.bein_hatzibur 
ADD COLUMN IF NOT EXISTS author TEXT;

-- Add photographer field to bein_hatzibur (for images)
ALTER TABLE public.bein_hatzibur 
ADD COLUMN IF NOT EXISTS photographer TEXT;

-- Add author field to before_18_years
ALTER TABLE public.before_18_years 
ADD COLUMN IF NOT EXISTS author TEXT;

-- Add photographer field to before_18_years (for historical images)
ALTER TABLE public.before_18_years 
ADD COLUMN IF NOT EXISTS photographer TEXT;

-- Add author field to historical_events
ALTER TABLE public.historical_events 
ADD COLUMN IF NOT EXISTS author TEXT;

-- Add photographer field to historical_events
ALTER TABLE public.historical_events 
ADD COLUMN IF NOT EXISTS photographer TEXT;

-- Create index for author searches
CREATE INDEX IF NOT EXISTS idx_news_batzibur_author ON public.news_batzibur(author);
CREATE INDEX IF NOT EXISTS idx_bein_hatzibur_author ON public.bein_hatzibur(author);
CREATE INDEX IF NOT EXISTS idx_before_18_author ON public.before_18_years(author);
CREATE INDEX IF NOT EXISTS idx_historical_author ON public.historical_events(author);