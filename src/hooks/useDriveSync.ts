import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DriveSyncConfig {
  id: string;
  folder_id: string;
  folder_name: string;
  is_active: boolean;
  last_sync_at: string | null;
  created_at: string;
}

export interface SyncLog {
  id: string;
  action: string;
  details: any;
  status: string;
  created_at: string;
}

export interface SyncedItem {
  id: string;
  drive_folder_name: string;
  target_table: string;
  sync_status: string;
  synced_at: string;
}

export function useDriveSync() {
  const [config, setConfig] = useState<DriveSyncConfig | null>(null);
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [syncedItems, setSyncedItems] = useState<SyncedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const fetchData = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      // Get active config
      const { data: configData } = await supabase
        .from('drive_sync_config')
        .select('*')
        .eq('is_active', true)
        .single();

      setConfig(configData);

      if (configData) {
        // Get recent logs
        const { data: logsData } = await supabase
          .from('drive_sync_log')
          .select('*')
          .eq('config_id', configData.id)
          .order('created_at', { ascending: false })
          .limit(10);

        setLogs(logsData || []);

        // Get synced items
        const { data: itemsData } = await supabase
          .from('drive_synced_items')
          .select('*')
          .eq('config_id', configData.id)
          .order('synced_at', { ascending: false })
          .limit(50);

        setSyncedItems(itemsData || []);

        // Count recent syncs (last 24h)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const recentItems = (itemsData || []).filter(
          (item) => new Date(item.synced_at) > yesterday
        );
        setPendingCount(recentItems.length);
      }
    } catch (error) {
      console.error('Error fetching drive sync data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const triggerSync = useCallback(async () => {
    if (!config) return { success: false, error: 'No config' };

    setSyncing(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/drive-sync`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ action: 'sync', configId: config.id }),
        }
      );

      const result = await response.json();
      await fetchData(); // Refresh data
      return result;
    } catch (error) {
      console.error('Sync error:', error);
      return { success: false, error: String(error) };
    } finally {
      setSyncing(false);
    }
  }, [config, fetchData]);

  return {
    config,
    logs,
    syncedItems,
    loading,
    syncing,
    pendingCount,
    isConnected: !!config,
    triggerSync,
    refetch: fetchData,
  };
}
