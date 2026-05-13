-- Add section and article_id columns to ad_placements
ALTER TABLE public.ad_placements 
ADD COLUMN IF NOT EXISTS section TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS article_id UUID DEFAULT NULL;

-- Create index for faster lookups by section
CREATE INDEX IF NOT EXISTS ad_placements_section_idx ON public.ad_placements(section);

-- Create index for article-specific ads
CREATE INDEX IF NOT EXISTS ad_placements_article_idx ON public.ad_placements(article_id) WHERE article_id IS NOT NULL;

-- Create composite index for slot + section lookups
CREATE INDEX IF NOT EXISTS ad_placements_slot_section_idx ON public.ad_placements(slot_name, section);