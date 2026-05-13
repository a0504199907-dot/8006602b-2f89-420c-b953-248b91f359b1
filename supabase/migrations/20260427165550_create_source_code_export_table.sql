-- Create table to store source code for export
CREATE TABLE IF NOT EXISTS public.source_code_export (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_path TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'text',
  is_binary BOOLEAN DEFAULT false,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Allow public read for export
ALTER TABLE public.source_code_export ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on source_code_export"
  ON public.source_code_export
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert on source_code_export"
  ON public.source_code_export
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update on source_code_export"
  ON public.source_code_export
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete on source_code_export"
  ON public.source_code_export
  FOR DELETE
  TO authenticated
  USING (true);