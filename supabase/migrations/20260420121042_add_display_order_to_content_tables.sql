-- Add display_order column to content tables for manual ordering

ALTER TABLE siah_hatzibur ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE news_batzibur ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE bein_hatzibur ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE before_18_years ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE historical_events ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE galleries ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Create indexes for faster ordering
CREATE INDEX IF NOT EXISTS idx_siah_hatzibur_display_order ON siah_hatzibur(display_order DESC);
CREATE INDEX IF NOT EXISTS idx_news_batzibur_display_order ON news_batzibur(display_order DESC);
CREATE INDEX IF NOT EXISTS idx_bein_hatzibur_display_order ON bein_hatzibur(display_order DESC);
CREATE INDEX IF NOT EXISTS idx_before_18_years_display_order ON before_18_years(display_order DESC);
CREATE INDEX IF NOT EXISTS idx_historical_events_display_order ON historical_events(display_order DESC);
CREATE INDEX IF NOT EXISTS idx_galleries_display_order ON galleries(display_order DESC);
CREATE INDEX IF NOT EXISTS idx_events_display_order ON events(display_order DESC);
CREATE INDEX IF NOT EXISTS idx_videos_display_order ON videos(display_order DESC);