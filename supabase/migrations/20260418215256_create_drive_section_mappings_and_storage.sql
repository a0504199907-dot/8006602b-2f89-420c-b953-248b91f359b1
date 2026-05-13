-- Table for storing folder name to table mappings
CREATE TABLE public.drive_section_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  folder_name TEXT NOT NULL UNIQUE,
  target_table TEXT NOT NULL,
  display_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.drive_section_mappings ENABLE ROW LEVEL SECURITY;

-- Policies - authenticated users can read, admins can modify
CREATE POLICY "Authenticated users can read mappings"
  ON public.drive_section_mappings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage mappings"
  ON public.drive_section_mappings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Insert default mappings based on existing sections
INSERT INTO public.drive_section_mappings (folder_name, target_table, display_name) VALUES
  ('גיליונות העיתון', 'newspaper_issues', 'גיליונות העיתון'),
  ('עיתון', 'newspaper_issues', 'גיליונות העיתון'),
  ('שיח הציבור', 'siah_hatzibur', 'שיח הציבור'),
  ('לפני 18 שנה', 'before_18_years', 'לפני 18 שנה'),
  ('בעין הציבור', 'bein_hatzibur', 'בעין הציבור'),
  ('נייעס בציבור', 'news_batzibur', 'נייעס בציבור'),
  ('חדשות בציבור', 'news_batzibur', 'נייעס בציבור'),
  ('אירועים היסטוריים', 'historical_events', 'אירועים היסטוריים'),
  ('היסטוריה', 'historical_events', 'אירועים היסטוריים'),
  ('כתבות', 'articles', 'כתבות'),
  ('חדשות', 'articles', 'כתבות'),
  ('גלריות', 'galleries', 'גלריות'),
  ('אלבומים', 'galleries', 'גלריות'),
  ('אירועים', 'events', 'אירועים'),
  ('סרטונים', 'videos', 'סרטונים'),
  ('וידאו', 'videos', 'סרטונים');

-- Create index for faster lookups
CREATE INDEX idx_drive_section_mappings_folder_name ON public.drive_section_mappings(folder_name);
CREATE INDEX idx_drive_section_mappings_active ON public.drive_section_mappings(is_active) WHERE is_active = true;

-- Create storage bucket for synced images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'synced-images',
  'synced-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- Storage policies - public read, service role write
CREATE POLICY "Public can view synced images"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'synced-images');

CREATE POLICY "Service role can upload synced images"
  ON storage.objects
  FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'synced-images');

CREATE POLICY "Service role can update synced images"
  ON storage.objects
  FOR UPDATE
  TO service_role
  USING (bucket_id = 'synced-images');

CREATE POLICY "Service role can delete synced images"
  ON storage.objects
  FOR DELETE
  TO service_role
  USING (bucket_id = 'synced-images');