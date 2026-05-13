-- =============================================
-- ANALYTICS SYSTEM - FULL USER TRACKING
-- =============================================

-- 1. Sessions Table - Track unique visitor sessions
CREATE TABLE IF NOT EXISTS public.analytics_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  ip_hash TEXT,
  user_agent TEXT,
  device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  browser TEXT,
  os TEXT,
  screen_width INTEGER,
  screen_height INTEGER,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  landing_page TEXT,
  country TEXT,
  city TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  page_count INTEGER DEFAULT 0,
  total_time_seconds INTEGER DEFAULT 0
);

-- 2. Pageviews Table - Track every page visit
CREATE TABLE IF NOT EXISTS public.analytics_pageviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  page_url TEXT NOT NULL,
  page_path TEXT NOT NULL,
  page_title TEXT,
  page_type TEXT,
  content_id TEXT,
  content_type TEXT,
  entered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  exited_at TIMESTAMP WITH TIME ZONE,
  time_on_page_seconds INTEGER DEFAULT 0,
  scroll_depth_percent INTEGER DEFAULT 0,
  is_bounce BOOLEAN DEFAULT false
);

-- 3. Events Table - Track user interactions
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_category TEXT,
  event_action TEXT,
  event_label TEXT,
  event_value INTEGER,
  page_url TEXT,
  element_id TEXT,
  element_class TEXT,
  element_text TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Content Stats Table - Aggregated content performance
CREATE TABLE IF NOT EXISTS public.analytics_content_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  content_title TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  avg_time_seconds INTEGER DEFAULT 0,
  avg_scroll_depth INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  UNIQUE(content_type, content_id, date)
);

-- =============================================
-- INDEXES FOR FAST QUERIES
-- =============================================

-- Sessions indexes
CREATE INDEX idx_analytics_sessions_started ON public.analytics_sessions(started_at DESC);
CREATE INDEX idx_analytics_sessions_ip ON public.analytics_sessions(ip_hash);
CREATE INDEX idx_analytics_sessions_device ON public.analytics_sessions(device_type);
CREATE INDEX idx_analytics_sessions_active ON public.analytics_sessions(is_active) WHERE is_active = true;
CREATE INDEX idx_analytics_sessions_landing ON public.analytics_sessions(landing_page);

-- Pageviews indexes
CREATE INDEX idx_analytics_pageviews_session ON public.analytics_pageviews(session_id);
CREATE INDEX idx_analytics_pageviews_entered ON public.analytics_pageviews(entered_at DESC);
CREATE INDEX idx_analytics_pageviews_path ON public.analytics_pageviews(page_path);
CREATE INDEX idx_analytics_pageviews_content ON public.analytics_pageviews(content_type, content_id);
CREATE INDEX idx_analytics_pageviews_type ON public.analytics_pageviews(page_type);

-- Events indexes
CREATE INDEX idx_analytics_events_session ON public.analytics_events(session_id);
CREATE INDEX idx_analytics_events_created ON public.analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_category ON public.analytics_events(event_category);

-- Content stats indexes
CREATE INDEX idx_analytics_content_stats_date ON public.analytics_content_stats(date DESC);
CREATE INDEX idx_analytics_content_stats_type ON public.analytics_content_stats(content_type);
CREATE INDEX idx_analytics_content_stats_views ON public.analytics_content_stats(views DESC);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_pageviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_content_stats ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (tracking from client)
CREATE POLICY "Anyone can insert sessions"
  ON public.analytics_sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can insert pageviews"
  ON public.analytics_pageviews FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can insert events"
  ON public.analytics_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Anyone can update their own session (for ending sessions)
CREATE POLICY "Anyone can update sessions"
  ON public.analytics_sessions FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can update pageviews"
  ON public.analytics_pageviews FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated users can read (admin dashboard)
CREATE POLICY "Authenticated users can read sessions"
  ON public.analytics_sessions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read pageviews"
  ON public.analytics_pageviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read events"
  ON public.analytics_events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read content stats"
  ON public.analytics_content_stats FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage content stats"
  ON public.analytics_content_stats FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);