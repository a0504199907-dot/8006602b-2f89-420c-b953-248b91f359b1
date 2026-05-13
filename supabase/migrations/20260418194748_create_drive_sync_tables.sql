-- Google Drive Sync Configuration
CREATE TABLE public.drive_sync_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  folder_id TEXT NOT NULL,
  folder_name TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Folder to Section Mapping
CREATE TABLE public.drive_folder_mapping (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_id UUID REFERENCES public.drive_sync_config(id) ON DELETE CASCADE,
  drive_folder_name TEXT NOT NULL,
  target_section TEXT NOT NULL,
  target_table TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(config_id, drive_folder_name)
);

-- Synced Folders Tracking (to avoid duplicates)
CREATE TABLE public.drive_synced_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_id UUID REFERENCES public.drive_sync_config(id) ON DELETE CASCADE,
  drive_folder_id TEXT NOT NULL,
  drive_folder_name TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_record_id UUID,
  sync_status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(config_id, drive_folder_id)
);

-- Sync Log for monitoring
CREATE TABLE public.drive_sync_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_id UUID REFERENCES public.drive_sync_config(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.drive_sync_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drive_folder_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drive_synced_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drive_sync_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies (authenticated users only)
CREATE POLICY "Authenticated users can read drive config"
  ON public.drive_sync_config FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage drive config"
  ON public.drive_sync_config FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read folder mappings"
  ON public.drive_folder_mapping FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage folder mappings"
  ON public.drive_folder_mapping FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read synced items"
  ON public.drive_synced_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage synced items"
  ON public.drive_synced_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read sync log"
  ON public.drive_sync_log FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert sync log"
  ON public.drive_sync_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Service role policies for Edge Functions
CREATE POLICY "Service role full access to drive config"
  ON public.drive_sync_config FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to folder mappings"
  ON public.drive_folder_mapping FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to synced items"
  ON public.drive_synced_items FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to sync log"
  ON public.drive_sync_log FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_drive_synced_items_folder_id ON public.drive_synced_items(drive_folder_id);
CREATE INDEX idx_drive_sync_log_config_id ON public.drive_sync_log(config_id);
CREATE INDEX idx_drive_sync_log_created_at ON public.drive_sync_log(created_at DESC);