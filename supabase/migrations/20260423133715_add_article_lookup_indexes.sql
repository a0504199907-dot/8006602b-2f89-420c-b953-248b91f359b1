-- Add indexes for fast single article lookups by ID
-- These support the instant article loading feature

-- Note: Primary key indexes already exist on 'id' columns
-- but adding explicit indexes ensures fast lookups

-- Index for articles table
CREATE INDEX IF NOT EXISTS idx_articles_id_published 
ON articles(id) 
WHERE status = 'published';

-- Index for videos lookup
CREATE INDEX IF NOT EXISTS idx_videos_id_published
ON videos(id)
WHERE status = 'published';

-- Index for galleries lookup  
CREATE INDEX IF NOT EXISTS idx_galleries_id_published
ON galleries(id)
WHERE status = 'published';

-- Index for events lookup
CREATE INDEX IF NOT EXISTS idx_events_id_published
ON events(id)
WHERE status = 'published';