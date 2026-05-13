-- Create writers table
CREATE TABLE public.writers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.writers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for writers - public read, authenticated write
CREATE POLICY "Anyone can view writers"
  ON public.writers
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert writers"
  ON public.writers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update writers"
  ON public.writers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete writers"
  ON public.writers
  FOR DELETE
  TO authenticated
  USING (true);

-- Index for faster name lookups
CREATE INDEX idx_writers_name ON public.writers(name);