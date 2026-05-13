-- Add composite indexes for faster homepage queries
-- These indexes will dramatically speed up the filtered + sorted queries used on homepage

-- Galleries: status + display_order + created_at
CREATE INDEX IF NOT EXISTS idx_galleries_homepage 
ON galleries(status, display_order DESC, created_at DESC) 
WHERE status = 'published';

-- Siah Hatzibur: is_published + display_order + gregorian_date  
CREATE INDEX IF NOT EXISTS idx_siah_hatzibur_homepage 
ON siah_hatzibur(is_published, display_order DESC, gregorian_date DESC) 
WHERE is_published = true;

-- News Batzibur: is_published + display_order + gregorian_date
CREATE INDEX IF NOT EXISTS idx_news_batzibur_homepage 
ON news_batzibur(is_published, display_order DESC, gregorian_date DESC) 
WHERE is_published = true;

-- Before 18 Years: is_published + display_order + created_at
CREATE INDEX IF NOT EXISTS idx_before_18_homepage 
ON before_18_years(is_published, display_order DESC, created_at DESC) 
WHERE is_published = true;

-- Bein Hatzibur: is_published + display_order + sort_order
CREATE INDEX IF NOT EXISTS idx_bein_hatzibur_homepage 
ON bein_hatzibur(is_published, display_order DESC, sort_order ASC) 
WHERE is_published = true;

-- Historical Events: is_published + display_order + event_year_gregorian
CREATE INDEX IF NOT EXISTS idx_historical_events_homepage 
ON historical_events(is_published, display_order DESC, event_year_gregorian DESC) 
WHERE is_published = true;

-- Events: status + event_date (for upcoming events)
CREATE INDEX IF NOT EXISTS idx_events_upcoming 
ON events(status, event_date ASC) 
WHERE status = 'published';

-- Videos: status + display_order
CREATE INDEX IF NOT EXISTS idx_videos_homepage 
ON videos(status, display_order DESC) 
WHERE status = 'published';