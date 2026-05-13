-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bein_hatzibur_published ON bein_hatzibur(is_published, sort_order);
CREATE INDEX IF NOT EXISTS idx_newspaper_issues_published ON newspaper_issues(is_published, gregorian_date DESC);
CREATE INDEX IF NOT EXISTS idx_siah_hatzibur_published ON siah_hatzibur(is_published, gregorian_date DESC);
CREATE INDEX IF NOT EXISTS idx_before_18_years_published ON before_18_years(is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_batzibur_published ON news_batzibur(is_published, gregorian_date DESC);
CREATE INDEX IF NOT EXISTS idx_historical_events_published ON historical_events(is_published, event_year_gregorian DESC);
CREATE INDEX IF NOT EXISTS idx_ad_placements_slot ON ad_placements(slot_name, is_active);
CREATE INDEX IF NOT EXISTS idx_ad_creatives_active ON ad_creatives(is_active);
CREATE INDEX IF NOT EXISTS idx_galleries_status ON galleries(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status, event_date);