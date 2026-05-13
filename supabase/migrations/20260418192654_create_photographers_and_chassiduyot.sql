-- Create photographers table
CREATE TABLE public.photographers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chassiduyot table
CREATE TABLE public.chassiduyot (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.photographers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chassiduyot ENABLE ROW LEVEL SECURITY;

-- RLS policies for photographers - authenticated users can read, only authenticated can write
CREATE POLICY "Anyone can read photographers"
  ON public.photographers FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert photographers"
  ON public.photographers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update photographers"
  ON public.photographers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete photographers"
  ON public.photographers FOR DELETE
  TO authenticated
  USING (true);

-- RLS policies for chassiduyot - same pattern
CREATE POLICY "Anyone can read chassiduyot"
  ON public.chassiduyot FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert chassiduyot"
  ON public.chassiduyot FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update chassiduyot"
  ON public.chassiduyot FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete chassiduyot"
  ON public.chassiduyot FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX idx_photographers_name ON public.photographers(name);
CREATE INDEX idx_chassiduyot_name ON public.chassiduyot(name);

-- Populate chassiduyot from existing data (unique values)
INSERT INTO public.chassiduyot (name)
SELECT DISTINCT chassidut FROM public.siah_hatzibur WHERE chassidut IS NOT NULL AND chassidut != ''
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.chassiduyot (name)
SELECT DISTINCT chassidut FROM public.news_batzibur WHERE chassidut IS NOT NULL AND chassidut != ''
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.chassiduyot (name)
SELECT DISTINCT chassidut FROM public.bein_hatzibur WHERE chassidut IS NOT NULL AND chassidut != ''
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.chassiduyot (name)
SELECT DISTINCT chassidut FROM public.galleries WHERE chassidut IS NOT NULL AND chassidut != ''
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.chassiduyot (name)
SELECT DISTINCT chassidut FROM public.events WHERE chassidut IS NOT NULL AND chassidut != ''
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.chassiduyot (name)
SELECT DISTINCT chassidut FROM public.historical_events WHERE chassidut IS NOT NULL AND chassidut != ''
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.chassiduyot (name)
SELECT DISTINCT chassidut FROM public.videos WHERE chassidut IS NOT NULL AND chassidut != ''
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.chassiduyot (name)
SELECT DISTINCT chassidut FROM public.articles WHERE chassidut IS NOT NULL AND chassidut != ''
ON CONFLICT (name) DO NOTHING;

-- Populate photographers from existing data
INSERT INTO public.photographers (name)
SELECT DISTINCT photographer FROM public.bein_hatzibur WHERE photographer IS NOT NULL AND photographer != ''
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.photographers (name)
SELECT DISTINCT photographer FROM public.gallery_images WHERE photographer IS NOT NULL AND photographer != ''
ON CONFLICT (name) DO NOTHING;