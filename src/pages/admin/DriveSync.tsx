import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import {
  Cloud,
  FolderSync,
  Link,
  Unlink,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  FolderOpen,
  FileText,
  AlertCircle,
  Play,
  Settings,
  ChevronRight,
  ChevronLeft,
  Folder,
  X,
  Home,
  Plus,
  Trash2,
  Database } from
'lucide-react';

interface DriveConfig {
  id: string;
  folder_id: string;
  folder_name: string;
  is_active: boolean;
  last_sync_at: string | null;
  created_at: string;
}

interface SyncLog {
  id: string;
  action: string;
  details: any;
  status: string;
  created_at: string;
}

interface SyncedItem {
  id: string;
  drive_folder_name: string;
  target_table: string;
  sync_status: string;
  synced_at: string;
}

interface DriveFolder {
  id: string;
  name: string;
}

interface PostDetail {
  name: string;
  status: 'created' | 'skipped' | 'error';
  contentSource: string | null;
  contentLength: number;
  imagesFound: number;
  imagesUploaded: number;
  mainImage: string | null;
  error?: string;
}

interface SyncResultData {
  success: boolean;
  foldersProcessed: number;
  postsCreated: number;
  postsSkipped: number;
  errors: string[];
  sections: {
    name: string;
    table: string;
    postsFound: number;
    postsCreated: number;
    skipped: number;
    errors: string[];
    details: PostDetail[];
  }[];
  skippedSections: string[];
}

interface SectionMapping {
  id: string;
  folder_name: string;
  target_table: string;
  display_name: string;
  is_active: boolean;
}

const SECTION_NAMES: Record<string, string> = {
  'articles': 'כתבות',
  'siah_hatzibur': 'שיח הציבור',
  'events': 'אירועים',
  'galleries': 'גלריות',
  'bein_hatzibur': 'בעין הציבור',
  'news_batzibur': 'חדשות בציבור',
  'before_18_years': 'לפני 18 שנה',
  'historical_events': 'היסטוריה',
  'videos': 'סרטונים',
  'newspaper_issues': 'גיליונות העיתון'
};

const AVAILABLE_TABLES = [
{ value: 'articles', label: 'כתבות' },
{ value: 'siah_hatzibur', label: 'שיח הציבור' },
{ value: 'events', label: 'אירועים' },
{ value: 'galleries', label: 'גלריות' },
{ value: 'bein_hatzibur', label: 'בעין הציבור' },
{ value: 'news_batzibur', label: 'נייעס בציבור' },
{ value: 'before_18_years', label: 'לפני 18 שנה' },
{ value: 'historical_events', label: 'אירועים היסטוריים' },
{ value: 'videos', label: 'סרטונים' },
{ value: 'newspaper_issues', label: 'גיליונות העיתון' }];


export default function DriveSync() {
  const [config, setConfig] = useState<DriveConfig | null>(null);
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [syncedItems, setSyncedItems] = useState<SyncedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [setupStep, setSetupStep] = useState(1);
  const [folderUrl, setFolderUrl] = useState('');

  // Folder browser state
  const [showFolderBrowser, setShowFolderBrowser] = useState(false);
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [folderPath, setFolderPath] = useState<{id: string;name: string;}[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [savingFolder, setSavingFolder] = useState(false);

  // Sync result state
  const [syncResult, setSyncResult] = useState<SyncResultData | null>(null);
  const [showSyncResult, setShowSyncResult] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  // Migration state
  const [migrating, setMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<any>(null);
  const [showMigrationResult, setShowMigrationResult] = useState(false);

  // Remove duplicates state
  const [removingDuplicates, setRemovingDuplicates] = useState(false);
  const [duplicatesResult, setDuplicatesResult] = useState<any>(null);
  const [showDuplicatesResult, setShowDuplicatesResult] = useState(false);

  // Mappings state
  const [mappings, setMappings] = useState<SectionMapping[]>([]);
  const [showMappings, setShowMappings] = useState(false);
  const [loadingMappings, setLoadingMappings] = useState(false);
  const [newMapping, setNewMapping] = useState({ folderName: '', targetTable: '', displayName: '' });
  const [addingMapping, setAddingMapping] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!supabase) {setLoading(false);return;}

    try {
      // Get config
      const { data: configData } = await supabase.
      from('drive_sync_config').
      select('*').
      eq('is_active', true).
      single();

      setConfig(configData);

      if (configData) {
        // Get recent logs
        const { data: logsData } = await supabase.
        from('drive_sync_log').
        select('*').
        eq('config_id', configData.id).
        order('created_at', { ascending: false }).
        limit(10);

        setLogs(logsData || []);

        // Get synced items
        const { data: itemsData } = await supabase.
        from('drive_synced_items').
        select('*').
        eq('config_id', configData.id).
        order('synced_at', { ascending: false }).
        limit(20);

        setSyncedItems(itemsData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMappings = async () => {
    if (!supabase) return;

    setLoadingMappings(true);
    try {
      const { data, error } = await supabase.
      from('drive_section_mappings').
      select('*').
      order('folder_name');

      if (error) throw error;
      setMappings(data || []);
    } catch (error) {
      console.error('Error fetching mappings:', error);
    } finally {
      setLoadingMappings(false);
    }
  };

  const addNewMapping = async () => {
    if (!supabase || !newMapping.folderName || !newMapping.targetTable) return;

    setAddingMapping(true);
    try {
      const { data, error } = await supabase.
      from('drive_section_mappings').
      insert({
        folder_name: newMapping.folderName,
        target_table: newMapping.targetTable,
        display_name: newMapping.displayName || newMapping.folderName
      }).
      select().
      single();

      if (error) throw error;

      setMappings([...mappings, data]);
      setNewMapping({ folderName: '', targetTable: '', displayName: '' });
    } catch (error) {
      console.error('Error adding mapping:', error);
      alert('שגיאה בהוספת מיפוי');
    } finally {
      setAddingMapping(false);
    }
  };

  const deleteMapping = async (id: string) => {
    if (!supabase) return;
    if (!confirm('האם למחוק את המיפוי?')) return;

    try {
      const { error } = await supabase.
      from('drive_section_mappings').
      delete().
      eq('id', id);

      if (error) throw error;

      setMappings(mappings.filter((m) => m.id !== id));
    } catch (error) {
      console.error('Error deleting mapping:', error);
      alert('שגיאה במחיקת מיפוי');
    }
  };

  const extractFolderIdFromUrl = (url: string): {folderId: string;folderName: string;} | null => {
    // Handle various Google Drive URL formats
    const patterns = [
    /\/folders\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/];


    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return { folderId: match[1], folderName: 'תיקייה ראשית' };
      }
    }

    return null;
  };

  const startOAuth = () => {
    const clientId = '816026594811-5d8nco5p6h5j6l5297d3usoenrcbel33.apps.googleusercontent.com';
    const redirectUri = `${window.location.origin}/admin/drive-sync/callback`;
    const scope = 'https://www.googleapis.com/auth/drive.readonly';

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scope)}&` +
    `access_type=offline&` +
    `prompt=consent`;

    window.location.href = authUrl;
  };

  const handleSync = async (forceSync: boolean = false) => {
    if (!config) return;

    setSyncing(true);
    setSyncResult(null);
    setExpandedSections(new Set()); // Reset expanded sections
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/drive-sync`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ action: 'sync', configId: config.id, forceSync })
        }
      );

      const result = await response.json();
      console.log('Sync result:', result);

      if (result.success !== undefined) {
        setSyncResult(result);
        setShowSyncResult(true);
        fetchData();
      } else {
        alert('שגיאה בסנכרון: ' + (result.error || 'לא ידוע'));
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('שגיאה בסנכרון');
    } finally {
      setSyncing(false);
    }
  };

  const handleMigration = async () => {
    if (!confirm('האם להעביר את כל התמונות מקישורי Drive ל-Storage? פעולה זו עלולה לקחת זמן.')) return;

    setMigrating(true);
    setMigrationResult(null);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/drive-sync`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ action: 'migrate_images' })
        }
      );

      const result = await response.json();
      console.log('Migration result:', result);

      setMigrationResult(result);
      setShowMigrationResult(true);
    } catch (error) {
      console.error('Migration error:', error);
      alert('שגיאה במיגרציה');
    } finally {
      setMigrating(false);
    }
  };

  const handleRemoveDuplicates = async () => {
    if (!confirm('האם למחוק את כל הפוסטים הכפולים? הפוסטים עם התמונות יישארו.')) return;

    setRemovingDuplicates(true);
    setDuplicatesResult(null);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/drive-sync`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ action: 'remove_duplicates' })
        }
      );

      const result = await response.json();
      console.log('Remove duplicates result:', result);

      setDuplicatesResult(result);
      setShowDuplicatesResult(true);
      fetchData(); // Refresh the list
    } catch (error) {
      console.error('Remove duplicates error:', error);
      alert('שגיאה במחיקת כפילויות');
    } finally {
      setRemovingDuplicates(false);
    }
  };

  const disconnectDrive = async () => {
    if (!config || !confirm('האם לנתק את החיבור ל-Google Drive?')) return;

    if (!supabase) return;

    await supabase.
    from('drive_sync_config').
    update({ is_active: false }).
    eq('id', config.id);

    setConfig(null);
    setLogs([]);
    setSyncedItems([]);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Folder browser functions
  const openFolderBrowser = async () => {
    setShowFolderBrowser(true);
    setFolderPath([{ id: 'root', name: 'My Drive' }]);
    await loadFolders('root');
  };

  const loadFolders = async (parentId: string) => {
    if (!config) return;

    setLoadingFolders(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/drive-sync`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            action: 'list_folders',
            configId: config.id,
            parentId
          })
        }
      );

      const result = await response.json();

      if (result.folders) {
        setFolders(result.folders);
      } else {
        console.error('Failed to load folders:', result.error);
      }
    } catch (error) {
      console.error('Error loading folders:', error);
    } finally {
      setLoadingFolders(false);
    }
  };

  const navigateToFolder = async (folder: DriveFolder) => {
    setFolderPath([...folderPath, { id: folder.id, name: folder.name }]);
    await loadFolders(folder.id);
  };

  const navigateBack = async () => {
    if (folderPath.length <= 1) return;

    const newPath = folderPath.slice(0, -1);
    setFolderPath(newPath);
    await loadFolders(newPath[newPath.length - 1].id);
  };

  const navigateToPathIndex = async (index: number) => {
    const newPath = folderPath.slice(0, index + 1);
    setFolderPath(newPath);
    await loadFolders(newPath[newPath.length - 1].id);
  };

  const selectCurrentFolder = async () => {
    if (!config) return;

    const currentFolder = folderPath[folderPath.length - 1];
    setSavingFolder(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/drive-sync`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            action: 'set_folder',
            configId: config.id,
            folderId: currentFolder.id,
            folderName: currentFolder.name
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        setConfig({ ...config, folder_id: currentFolder.id, folder_name: currentFolder.name });
        setShowFolderBrowser(false);
      } else {
        alert('שגיאה בשמירת התיקייה');
      }
    } catch (error) {
      console.error('Error setting folder:', error);
      alert('שגיאה בשמירת התיקייה');
    } finally {
      setSavingFolder(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div data-ev-id="ev_5fcdcabe2b" className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 text-secondary animate-spin" />
        </div>
      </AdminLayout>);

  }

  return (
    <AdminLayout>
      <div data-ev-id="ev_8d13df49e8" className="flex flex-col gap-6">
        {/* Header */}
        <div data-ev-id="ev_d21c8bf3a4" className="flex items-center justify-between">
          <div data-ev-id="ev_e916055879">
            <h1 data-ev-id="ev_f79d950b26" className="text-2xl font-bold text-foreground font-serif flex items-center gap-3">
              <Cloud className="w-7 h-7 text-secondary" />
              סנכרון Google Drive
            </h1>
            <p data-ev-id="ev_434de06140" className="text-muted-foreground mt-1">
              העלאת תוכן אוטומטית מתיקיות בדרייב
            </p>
          </div>

          {config &&
          <div data-ev-id="ev_041b991b67" className="flex items-center gap-3">
              <button data-ev-id="ev_89beb60f05"
            onClick={openFolderBrowser}
            className="flex items-center gap-2 px-4 py-2.5 border border-border text-foreground rounded-xl hover:bg-muted/50 transition-colors">

                <FolderOpen className="w-4 h-4" />
                שנה תיקייה
              </button>
              <button data-ev-id="ev_e3a14cd45d"
            onClick={() => handleSync(false)}
            disabled={syncing}
            className="flex items-center gap-2 bg-secondary hover:bg-secondary-light text-primary font-bold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50">

                {syncing ?
              <Loader2 className="w-5 h-5 animate-spin" /> :

              <RefreshCw className="w-5 h-5" />
              }
                סנכרן חדש
              </button>
              <button data-ev-id="ev_2fa2d1d7b4"
            onClick={() => handleSync(true)}
            disabled={syncing}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50">

                {syncing ?
              <Loader2 className="w-5 h-5 animate-spin" /> :

              <FolderSync className="w-5 h-5" />
              }
                סנכרן מחדש הכל
              </button>
              <button data-ev-id="ev_migrate_btn"
            onClick={handleMigration}
            disabled={migrating || syncing}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
            title="העבר תמונות ישנות מקישורי Drive ל-Storage">

                {migrating ?
              <Loader2 className="w-5 h-5 animate-spin" /> :

              <Database className="w-5 h-5" />
              }
                מיגרציית תמונות
              </button>
              <button data-ev-id="ev_2e6e3ce0c4"
            onClick={handleRemoveDuplicates}
            disabled={removingDuplicates || migrating || syncing}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="מחק פוסטים כפולים">

                {removingDuplicates ?
              <Loader2 className="w-5 h-5 animate-spin" /> :

              <Trash2 className="w-5 h-5" />
              }
                מחק כפילויות
              </button>
              <button data-ev-id="ev_2e6e3ce0c4"
            onClick={disconnectDrive}
            className="flex items-center gap-2 px-4 py-2.5 border border-red-500 text-red-500 rounded-xl hover:bg-red-500/10 transition-colors">

                <Unlink className="w-4 h-4" />
                נתק
              </button>
            </div>
          }
        </div>

        {/* Connection Status */}
        {!config ? (
        /* Setup Flow */
        <div data-ev-id="ev_b7e85b060c" className="bg-surface rounded-2xl border border-border p-8">
            <div data-ev-id="ev_b91bf38b16" className="max-w-xl mx-auto text-center">
              <div data-ev-id="ev_65cdb6cbc2" className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FolderSync className="w-10 h-10 text-secondary" />
              </div>
              <h2 data-ev-id="ev_874aec2bc2" className="text-xl font-bold mb-3">חבר את Google Drive שלך</h2>
              <p data-ev-id="ev_234ef2187a" className="text-muted-foreground mb-6">
                חבר תיקיית Drive כדי להעלות תוכן אוטומטית למערכת
              </p>

              <div data-ev-id="ev_a192b1e307" className="bg-muted/30 rounded-xl p-6 text-right mb-6">
                <h3 data-ev-id="ev_ccdfc57cc6" className="font-bold mb-3">מבנה התיקיות הנדרש:</h3>
                <div data-ev-id="ev_d4bed12833" className="text-sm text-muted-foreground font-mono bg-background rounded-lg p-4 text-right">
                  <div data-ev-id="ev_64bd72e068">📁 תיקייה ראשית</div>
                  <div data-ev-id="ev_b07cf4eb24" className="mr-4">├─ 📁 חדשות</div>
                  <div data-ev-id="ev_9770a8273c" className="mr-8">├─ 📁 כותרת-הפוסט</div>
                  <div data-ev-id="ev_01c5d0d3c1" className="mr-12">├─ 🖼️ תמונה.jpg</div>
                  <div data-ev-id="ev_ca850d37a8" className="mr-12">└─ 📄 תוכן.docx</div>
                  <div data-ev-id="ev_d9676705af" className="mr-4">├─ 📁 שיח הציבור</div>
                  <div data-ev-id="ev_6d73f1c56d" className="mr-4">├─ 📁 אירועים</div>
                  <div data-ev-id="ev_b82721fcca" className="mr-4">└─ ...</div>
                </div>
              </div>

              <button data-ev-id="ev_4b728c42de"
            onClick={startOAuth}
            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition-colors mx-auto">

                <svg data-ev-id="ev_8cfd5b3221" className="w-6 h-6" viewBox="0 0 24 24">
                  <path data-ev-id="ev_eca4ac1e00" fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path data-ev-id="ev_61d934bc11" fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path data-ev-id="ev_a1983abfee" fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path data-ev-id="ev_ea52cecd5b" fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                התחבר עם Google Drive
              </button>
            </div>
          </div>) : (

        /* Connected State */
        <>
            {/* Status Card */}
            <div data-ev-id="ev_5f02ef1d16" className="bg-surface rounded-2xl border border-border p-6">
              <div data-ev-id="ev_8246a41449" className="flex items-center justify-between">
                <div data-ev-id="ev_25a587a1ec" className="flex items-center gap-4">
                  <div data-ev-id="ev_5a765d3cb0" className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-7 h-7 text-green-500" />
                  </div>
                  <div data-ev-id="ev_f326911fc6">
                    <h3 data-ev-id="ev_c5f8d9e6d6" className="font-bold text-lg">מחובר ל-Google Drive</h3>
                    <p data-ev-id="ev_b441dbce89" className="text-muted-foreground flex items-center gap-2">
                      <FolderOpen className="w-4 h-4" />
                      {config.folder_name}
                    </p>
                  </div>
                </div>
                <div data-ev-id="ev_af252e77f2" className="text-left">
                  <p data-ev-id="ev_0f64d06cf1" className="text-sm text-muted-foreground">סנכרון אחרון</p>
                  <p data-ev-id="ev_4f68152235" className="font-medium">
                    {config.last_sync_at ? formatDate(config.last_sync_at) : 'לא בוצע'}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div data-ev-id="ev_7062209907" className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div data-ev-id="ev_284195e90c" className="bg-surface rounded-xl border border-border p-5">
                <div data-ev-id="ev_0580ffbfe6" className="flex items-center gap-3">
                  <div data-ev-id="ev_2f03129aa8" className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-secondary" />
                  </div>
                  <div data-ev-id="ev_1804e7f000">
                    <p data-ev-id="ev_fe302ff6ed" className="text-2xl font-bold">{syncedItems.length}</p>
                    <p data-ev-id="ev_7e9e213cbe" className="text-sm text-muted-foreground">פוסטים סונכרנו</p>
                  </div>
                </div>
              </div>

              <div data-ev-id="ev_2738967285" className="bg-surface rounded-xl border border-border p-5">
                <div data-ev-id="ev_e10aac3df7" className="flex items-center gap-3">
                  <div data-ev-id="ev_d630467419" className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div data-ev-id="ev_56874e4a98">
                    <p data-ev-id="ev_ddae2786e7" className="text-2xl font-bold">
                      {syncedItems.filter((i) => i.sync_status === 'success').length}
                    </p>
                    <p data-ev-id="ev_def2f07f12" className="text-sm text-muted-foreground">הצליחו</p>
                  </div>
                </div>
              </div>

              <div data-ev-id="ev_d3a9d7e0c7" className="bg-surface rounded-xl border border-border p-5">
                <div data-ev-id="ev_5d901b2ace" className="flex items-center gap-3">
                  <div data-ev-id="ev_136e97ceb7" className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <div data-ev-id="ev_d976ce2c6b">
                    <p data-ev-id="ev_f04ba29b2e" className="text-2xl font-bold">
                      {syncedItems.filter((i) => i.sync_status === 'error').length}
                    </p>
                    <p data-ev-id="ev_e3540bae32" className="text-sm text-muted-foreground">נכשלו</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Synced Items */}
            <div data-ev-id="ev_e6f193172b" className="bg-surface rounded-2xl border border-border overflow-hidden">
              <div data-ev-id="ev_61d3c9ab21" className="p-5 border-b border-border">
                <h3 data-ev-id="ev_7b947d54b9" className="font-bold text-lg">פוסטים שסונכרנו</h3>
              </div>
              
              {syncedItems.length === 0 ?
            <div data-ev-id="ev_5a2823cff4" className="p-10 text-center text-muted-foreground">
                  <FolderSync className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p data-ev-id="ev_e04c676b94">אין פוסטים מסונכרנים עדיין</p>
                  <p data-ev-id="ev_204642125c" className="text-sm">לחץ "סנכרן עכשיו" להתחלה</p>
                </div> :

            <div data-ev-id="ev_df85d30a96" className="divide-y divide-border">
                  {syncedItems.map((item) =>
              <div data-ev-id="ev_772832fe27" key={item.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                      <div data-ev-id="ev_87aa98b472" className="flex items-center gap-3">
                        {item.sync_status === 'success' ?
                  <CheckCircle className="w-5 h-5 text-green-500" /> :

                  <XCircle className="w-5 h-5 text-red-500" />
                  }
                        <div data-ev-id="ev_e416bef00c">
                          <p data-ev-id="ev_5213bb8f78" className="font-medium">{item.drive_folder_name}</p>
                          <p data-ev-id="ev_32e4b04710" className="text-sm text-muted-foreground">
                            {SECTION_NAMES[item.target_table] || item.target_table}
                          </p>
                        </div>
                      </div>
                      <span data-ev-id="ev_6c83683af2" className="text-sm text-muted-foreground">
                        {formatDate(item.synced_at)}
                      </span>
                    </div>
              )}
                </div>
            }
            </div>

            {/* Sync Log */}
            {logs.length > 0 &&
          <div data-ev-id="ev_34c3ef52c7" className="bg-surface rounded-2xl border border-border overflow-hidden">
                <div data-ev-id="ev_5500129c8a" className="p-5 border-b border-border">
                  <h3 data-ev-id="ev_f66312066b" className="font-bold text-lg">לוג סנכרונים</h3>
                </div>
                <div data-ev-id="ev_2af750f8b5" className="divide-y divide-border">
                  {logs.map((log) =>
              <div data-ev-id="ev_1cda7c3b65" key={log.id} className="flex items-center justify-between p-4">
                      <div data-ev-id="ev_7389342d8a" className="flex items-center gap-3">
                        {log.status === 'success' ?
                  <CheckCircle className="w-5 h-5 text-green-500" /> :
                  log.status === 'partial' ?
                  <AlertCircle className="w-5 h-5 text-yellow-500" /> :

                  <XCircle className="w-5 h-5 text-red-500" />
                  }
                        <div data-ev-id="ev_899da07f37">
                          <p data-ev-id="ev_e34786e392" className="font-medium">
                            {log.action === 'sync' ? 'סנכרון' : log.action}
                          </p>
                          {log.details &&
                    <p data-ev-id="ev_34df828dcb" className="text-sm text-muted-foreground">
                              {log.details.foldersProcessed} תיקיות • {log.details.postsCreated} פוסטים חדשים
                            </p>
                    }
                        </div>
                      </div>
                      <span data-ev-id="ev_193c0b5fd9" className="text-sm text-muted-foreground">
                        {formatDate(log.created_at)}
                      </span>
                    </div>
              )}
                </div>
              </div>
          }
          </>)
        }

        {/* Section Mappings Manager */}
        <div data-ev-id="ev_201bcd6c59" className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div data-ev-id="ev_1bdc1a61e1" className="p-5 border-b border-border flex items-center justify-between">
            <div data-ev-id="ev_913dac0bfd">
              <h3 data-ev-id="ev_8838b76ffb" className="font-bold text-lg flex items-center gap-2">
                <Database className="w-5 h-5" />
                ניהול מappingsי מדורים
              </h3>
              <p data-ev-id="ev_d5ad00bd74" className="text-sm text-muted-foreground mt-1">
                קבע אילו תיקיות בדרייב מתאימות לאילו מדורים באתר
              </p>
            </div>
            <button data-ev-id="ev_28ba2ced91"
            onClick={() => {
              setShowMappings(!showMappings);
              if (!showMappings && mappings.length === 0) {
                fetchMappings();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors">
              {showMappings ? 'הסתר' : 'הצג מappings'}
            </button>
          </div>
          
          {showMappings &&
          <div data-ev-id="ev_0ff9e747d1" className="p-5">
              {loadingMappings ?
            <div data-ev-id="ev_f6c1928e49" className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div> :

            <>
                  {/* Add new mapping form */}
                  <div data-ev-id="ev_a52d577165" className="bg-muted/30 rounded-xl p-4 mb-4">
                    <h4 data-ev-id="ev_43e91f9323" className="font-medium mb-3">הוסף מapping חדש</h4>
                    <div data-ev-id="ev_9caa638059" className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input data-ev-id="ev_11be90b2f9"
                  type="text"
                  placeholder="שם תיקייה בדרייב"
                  value={newMapping.folderName}
                  onChange={(e) => setNewMapping({ ...newMapping, folderName: e.target.value })}
                  className="px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />

                      <select data-ev-id="ev_da7c609444"
                  value={newMapping.targetTable}
                  onChange={(e) => setNewMapping({ ...newMapping, targetTable: e.target.value })}
                  className="px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option data-ev-id="ev_80af34b97e" value="">בחר מדור</option>
                        {AVAILABLE_TABLES.map((t) =>
                    <option data-ev-id="ev_1504eb63a1" key={t.value} value={t.value}>{t.label}</option>
                    )}
                      </select>
                      <button data-ev-id="ev_0be9d6912f"
                  onClick={addNewMapping}
                  disabled={addingMapping || !newMapping.folderName || !newMapping.targetTable}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {addingMapping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        הוסף
                      </button>
                    </div>
                  </div>
                  
                  {/* Existing mappings */}
                  <div data-ev-id="ev_f34e08f5e3" className="flex flex-col gap-2">
                    {mappings.length === 0 ?
                <div data-ev-id="ev_ae53b0a7c5" className="text-center py-8 text-muted-foreground">
                        <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p data-ev-id="ev_0313c3736a">אין מappings קיימים עדיין</p>
                        <p data-ev-id="ev_2668fc6667" className="text-sm mt-1">הוסף מapping כדי לקשר בין תיקיות בדרייב למדורים באתר</p>
                      </div> :

                <>
                        <div data-ev-id="ev_15fef556bb" className="grid grid-cols-3 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b border-border">
                          <span data-ev-id="ev_7807279de7">תיקייה בדרייב</span>
                          <span data-ev-id="ev_7e84d53f28">מדור באתר</span>
                          <span data-ev-id="ev_5291fd9040">פעולות</span>
                        </div>
                        {mappings.map((mapping) =>
                  <div data-ev-id="ev_23e5887c54" key={mapping.id} className="grid grid-cols-3 gap-4 px-4 py-3 bg-muted/20 rounded-lg items-center">
                            <span data-ev-id="ev_6744a04db5" className="font-medium">{mapping.folder_name}</span>
                            <span data-ev-id="ev_f0ba8781be" className="text-sm">
                              <span data-ev-id="ev_76a93bf2ce" className="bg-primary/10 text-primary px-2 py-1 rounded">
                                {SECTION_NAMES[mapping.target_table] || mapping.target_table}
                              </span>
                            </span>
                            <div data-ev-id="ev_8d86fd0ccd">
                              <button data-ev-id="ev_20ecea9cf1"
                      onClick={() => deleteMapping(mapping.id)}
                      className="flex items-center gap-1 px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors text-sm">
                                <Trash2 className="w-4 h-4" />
                                מחק
                              </button>
                            </div>
                          </div>
                  )}
                      </>
                }
                  </div>
                </>
            }
            </div>
          }
        </div>

        {/* Instructions */}
        <div data-ev-id="ev_d6073488d2" className="bg-muted/30 rounded-xl p-6">
          <h3 data-ev-id="ev_5bd915d479" className="font-bold mb-3 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            איך זה עובד?
          </h3>
          <ol data-ev-id="ev_62370881f1" className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li data-ev-id="ev_8b4f396dcc">צור תיקייה ראשית ב-Google Drive</li>
            <li data-ev-id="ev_9abadf5fa4">בתוכה צור תיקיות לפי שמות המדורים: חדשות, שיח הציבור, אירועים...</li>
            <li data-ev-id="ev_042b504a8f">לכל פוסט, צור תיקייה עם שם הכותרת</li>
            <li data-ev-id="ev_335f602517">בתוך תיקיית הפוסט שים תמונות וקובץ תוכן (Word/Google Doc/טקסט)</li>
            <li data-ev-id="ev_a961dd1c5e">חבר את הדרייב ולחץ "סנכרן עכשיו"</li>
          </ol>
          <p data-ev-id="ev_fc0da9402d" className="mt-4 text-sm bg-secondary/10 rounded-lg p-3">
            <strong data-ev-id="ev_0265a0541e">טיפ:</strong> שם תמונה ראשית כ-"main.jpg" או "ראשית.jpg" כדי שהיא תהיה תמונת הכותרת
          </p>
        </div>
      </div>

      {/* Sync Result Modal */}
      <AnimatePresence>
        {showSyncResult && syncResult &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowSyncResult(false)}>

            <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-surface rounded-2xl border border-border w-full max-w-2xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}>

              {/* Modal Header */}
              <div data-ev-id="ev_4e13defd38" className="flex items-center justify-between p-5 border-b border-border">
                <h3 data-ev-id="ev_0882618aa0" className="font-bold text-lg flex items-center gap-2">
                  {syncResult.errors.length === 0 ?
                <CheckCircle className="w-6 h-6 text-green-500" /> :

                <AlertCircle className="w-6 h-6 text-yellow-500" />
                }
                  תוצאות הסנכרון
                </h3>
                <button data-ev-id="ev_3e9d7b0fb0"
              onClick={() => setShowSyncResult(false)}
              className="p-2 hover:bg-muted rounded-lg transition-colors">

                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Summary Stats */}
              <div data-ev-id="ev_720321f45a" className="p-5 border-b border-border">
                <div data-ev-id="ev_27c397b6a2" className="grid grid-cols-3 gap-4">
                  <div data-ev-id="ev_000d43a422" className="bg-green-500/10 rounded-xl p-4 text-center">
                    <p data-ev-id="ev_b5e4f34f22" className="text-3xl font-bold text-green-500">{syncResult.postsCreated}</p>
                    <p data-ev-id="ev_60c418a898" className="text-sm text-muted-foreground">פוסטים נוצרו</p>
                  </div>
                  <div data-ev-id="ev_9a5a3d2450" className="bg-blue-500/10 rounded-xl p-4 text-center">
                    <p data-ev-id="ev_85c850d88c" className="text-3xl font-bold text-blue-500">{syncResult.postsSkipped}</p>
                    <p data-ev-id="ev_2aa90a5483" className="text-sm text-muted-foreground">דולגו (קיימים)</p>
                  </div>
                  <div data-ev-id="ev_185bf036d0" className="bg-red-500/10 rounded-xl p-4 text-center">
                    <p data-ev-id="ev_b7038ebc53" className="text-3xl font-bold text-red-500">{syncResult.errors.length}</p>
                    <p data-ev-id="ev_9c90204f9f" className="text-sm text-muted-foreground">שגיאות</p>
                  </div>
                </div>
              </div>

              {/* Sections Detail */}
              <div data-ev-id="ev_325ddbde14" className="flex-1 overflow-y-auto p-5">
                <h4 data-ev-id="ev_cbc6e99107" className="font-bold mb-3">מדורים שנסרקו ({syncResult.sections.length})</h4>
                
                {syncResult.sections.length === 0 ?
              <div data-ev-id="ev_b1fe7e8d3c" className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p data-ev-id="ev_ea5315a7b4">לא נמצאו מדורים מתאימים</p>
                    <p data-ev-id="ev_567908ae03" className="text-sm mt-2">ודא ששמות התיקיות תואמים: חדשות, שיח הציבור, אירועים...</p>
                  </div> :

              <div data-ev-id="ev_4e13cd6078" className="flex flex-col gap-3">
                    {syncResult.sections.map((section, i) =>
                <div data-ev-id="ev_34137afe74" key={i} className="bg-muted/30 rounded-xl p-4">
                        <div
                    data-ev-id="ev_0ef78d5524"
                    className="flex items-center justify-between mb-2 cursor-pointer"
                    onClick={() => {
                      const newExpanded = new Set(expandedSections);
                      if (newExpanded.has(i)) {
                        newExpanded.delete(i);
                      } else {
                        newExpanded.add(i);
                      }
                      setExpandedSections(newExpanded);
                    }}>

                          <div data-ev-id="ev_cd4421ee07" className="flex items-center gap-2">
                            <ChevronRight className={`w-4 h-4 transition-transform ${expandedSections.has(i) ? 'rotate-90' : ''}`} />
                            <span data-ev-id="ev_ef0155a794" className="font-medium">{section.name}</span>
                          </div>
                          <span data-ev-id="ev_74160c2426" className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                            {SECTION_NAMES[section.table] || section.table}
                          </span>
                        </div>
                        <div data-ev-id="ev_83074c0f5b" className="flex items-center gap-4 text-sm">
                          <span data-ev-id="ev_59c8ead2c4" className="text-muted-foreground">
                            נמצאו: <strong data-ev-id="ev_3191691e9f" className="text-foreground">{section.postsFound}</strong>
                          </span>
                          <span data-ev-id="ev_1785923577" className="text-green-500">
                            נוצרו: <strong data-ev-id="ev_64798142b9">{section.postsCreated}</strong>
                          </span>
                          <span data-ev-id="ev_f977c81356" className="text-blue-500">
                            דולגו: <strong data-ev-id="ev_e9dd70debc">{section.skipped}</strong>
                          </span>
                          {section.errors.length > 0 &&
                    <span data-ev-id="ev_59e50f8759" className="text-red-500">
                              שגיאות: <strong data-ev-id="ev_c177749108">{section.errors.length}</strong>
                            </span>
                    }
                        </div>
                        
                        {/* Expandable post details */}
                        {expandedSections.has(i) && section.details && section.details.length > 0 &&
                  <div data-ev-id="ev_9921de8869" className="mt-3 border-t border-border pt-3 flex flex-col gap-2">
                            <p data-ev-id="ev_6953c24510" className="text-xs font-medium text-muted-foreground mb-1">פירוט פוסטים:</p>
                            {section.details.map((post, j) =>
                    <div data-ev-id="ev_9184222b5b" key={j} className={`text-xs rounded-lg p-2 ${
                    post.status === 'created' ? 'bg-green-500/10' :
                    post.status === 'skipped' ? 'bg-blue-500/10' :
                    'bg-red-500/10'}`
                    }>
                                <div data-ev-id="ev_72966c056c" className="flex items-center justify-between">
                                  <span data-ev-id="ev_3eb0688ee9" className="font-medium">{post.name}</span>
                                  <span data-ev-id="ev_dbd09fb6c0" className={`px-1.5 py-0.5 rounded text-[10px] ${
                        post.status === 'created' ? 'bg-green-500/20 text-green-500' :
                        post.status === 'skipped' ? 'bg-blue-500/20 text-blue-500' :
                        'bg-red-500/20 text-red-500'}`
                        }>
                                    {post.status === 'created' ? 'נוצר' :
                          post.status === 'skipped' ? 'דולג' : 'שגיאה'}
                                  </span>
                                </div>
                                <div data-ev-id="ev_f255c084b5" className="flex flex-wrap gap-2 mt-1 text-muted-foreground">
                                  {post.contentSource &&
                        <span data-ev-id="ev_89e5e49c42" className="flex items-center gap-1">
                                      <FileText className="w-3 h-3" />
                                      {post.contentSource} ({post.contentLength} תווים)
                                    </span>
                        }
                                  <span data-ev-id="ev_80326a6f5e" className="flex items-center gap-1">
                                    תמונות: {post.imagesUploaded}/{post.imagesFound}
                                    {post.mainImage && <span data-ev-id="ev_2f6107ddcb" className="text-green-500">✓</span>}
                                  </span>
                                </div>
                                {post.error &&
                      <p data-ev-id="ev_a1315affc4" className="text-red-400 mt-1">{post.error}</p>
                      }
                              </div>
                    )}
                          </div>
                  }
                        
                        {section.errors.length > 0 &&
                  <div data-ev-id="ev_965a189fa1" className="mt-2 text-xs text-red-400 bg-red-500/10 rounded p-2">
                      {section.errors.slice(0, 3).join(', ')}
                      {section.errors.length > 3 && ` ועוד ${section.errors.length - 3}...`}
                    </div>
                  }
                      </div>
                )}
                  </div>
              }

                {/* Skipped Sections */}
                {syncResult.skippedSections.length > 0 &&
              <div data-ev-id="ev_a698066a54" className="mt-4">
                    <h4 data-ev-id="ev_17c6a7213a" className="font-bold mb-2 text-muted-foreground">תיקיות שדולגו (לא מוכרות)</h4>
                    <p data-ev-id="ev_315bc42b86" className="text-sm text-muted-foreground">
                      {syncResult.skippedSections.join(', ')}
                    </p>
                  </div>
              }

                {/* Errors */}
                {syncResult.errors.length > 0 &&
              <div data-ev-id="ev_a93435c292" className="mt-4">
                    <h4 data-ev-id="ev_44cbc7286b" className="font-bold mb-2 text-red-500">שגיאות</h4>
                    <div data-ev-id="ev_3ae50e442f" className="bg-red-500/10 rounded-xl p-3 text-sm text-red-400 max-h-32 overflow-y-auto">
                      {syncResult.errors.map((err, i) =>
                  <div data-ev-id="ev_4e0d65fb3e" key={i} className="py-1">{err}</div>
                  )}
                    </div>
                  </div>
              }
              </div>

              {/* Modal Footer */}
              <div data-ev-id="ev_dad47f5c58" className="p-5 border-t border-border">
                <button data-ev-id="ev_9eae2dfa66"
              onClick={() => setShowSyncResult(false)}
              className="w-full bg-secondary hover:bg-secondary-light text-primary font-bold py-3 rounded-xl transition-colors">

                  סגור
                </button>
              </div>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>

      {/* Migration Result Modal */}
      <AnimatePresence>
        {showMigrationResult && migrationResult &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowMigrationResult(false)}>

            <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-surface rounded-2xl border border-border w-full max-w-lg max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}>

              {/* Modal Header */}
              <div data-ev-id="ev_493051dfe9" className="flex items-center justify-between p-5 border-b border-border">
                <h3 data-ev-id="ev_fdb8de65cf" className="font-bold text-lg flex items-center gap-2">
                  <Database className="w-6 h-6 text-purple-500" />
                  תוצאות מיגרציה
                </h3>
                <button data-ev-id="ev_77acc4d6c4"
              onClick={() => setShowMigrationResult(false)}
              className="p-2 hover:bg-muted rounded-lg transition-colors">

                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Summary Stats */}
              <div data-ev-id="ev_094f9ea413" className="p-5 border-b border-border">
                <div data-ev-id="ev_c80fbd2ac4" className="grid grid-cols-3 gap-4">
                  <div data-ev-id="ev_669129730c" className="bg-purple-500/10 rounded-xl p-4 text-center">
                    <p data-ev-id="ev_6ab5ba5f5a" className="text-3xl font-bold text-purple-500">{migrationResult.recordsUpdated || 0}</p>
                    <p data-ev-id="ev_22527ba804" className="text-sm text-muted-foreground">רשומות עודכנו</p>
                  </div>
                  <div data-ev-id="ev_fd002c01d2" className="bg-green-500/10 rounded-xl p-4 text-center">
                    <p data-ev-id="ev_cadc5099f9" className="text-3xl font-bold text-green-500">{migrationResult.imagesUploaded || 0}</p>
                    <p data-ev-id="ev_a13e75b4d1" className="text-sm text-muted-foreground">תמונות הועלו</p>
                  </div>
                  <div data-ev-id="ev_557ae51319" className="bg-red-500/10 rounded-xl p-4 text-center">
                    <p data-ev-id="ev_107d288bc6" className="text-3xl font-bold text-red-500">{migrationResult.errors?.length || 0}</p>
                    <p data-ev-id="ev_32d8e8f4d4" className="text-sm text-muted-foreground">שגיאות</p>
                  </div>
                </div>
              </div>

              {/* Tables Detail */}
              <div data-ev-id="ev_cc57c56342" className="flex-1 overflow-y-auto p-5">
                <h4 data-ev-id="ev_70455c47ba" className="font-bold mb-3">פירוט לפי טבלאות</h4>
                <div data-ev-id="ev_c161d8960b" className="flex flex-col gap-2">
                  {(migrationResult.details || []).map((detail: any, i: number) =>
                <div data-ev-id="ev_7eea46f244" key={i} className="bg-muted/30 rounded-lg p-3 flex items-center justify-between">
                      <span data-ev-id="ev_de0fa7ae01" className="font-medium">{SECTION_NAMES[detail.table] || detail.table}</span>
                      <div data-ev-id="ev_6d6e2709fe" className="flex items-center gap-3 text-sm">
                        <span data-ev-id="ev_87e5c4b214" className="text-green-500">עודכנו: {detail.updated}</span>
                        {detail.errors > 0 && <span data-ev-id="ev_71734555ec" className="text-red-500">שגיאות: {detail.errors}</span>}
                      </div>
                    </div>
                )}
                </div>

                {/* Errors */}
                {migrationResult.errors?.length > 0 &&
              <div data-ev-id="ev_c5b91c8c28" className="mt-4">
                    <h4 data-ev-id="ev_6779cbb7af" className="font-bold mb-2 text-red-500">שגיאות</h4>
                    <div data-ev-id="ev_389995efe8" className="bg-red-500/10 rounded-xl p-3 text-sm text-red-400 max-h-32 overflow-y-auto">
                      {migrationResult.errors.map((err: string, i: number) =>
                  <div data-ev-id="ev_8573f7cc07" key={i} className="py-1">{err}</div>
                  )}
                    </div>
                  </div>
              }
              </div>

              {/* Modal Footer */}
              <div data-ev-id="ev_461f13782a" className="p-5 border-t border-border">
                <button data-ev-id="ev_27d7e044df"
              onClick={() => setShowMigrationResult(false)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors">

                  סגור
                </button>
              </div>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>

      {/* Duplicates Removal Result Modal */}
      <AnimatePresence>
        {showDuplicatesResult && duplicatesResult &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowDuplicatesResult(false)}>

            <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-surface rounded-2xl border border-border w-full max-w-lg max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}>

              {/* Modal Header */}
              <div data-ev-id="ev_7d7852f220" className="flex items-center justify-between p-5 border-b border-border">
                <h3 data-ev-id="ev_f66ed9f9f5" className="font-bold text-lg flex items-center gap-2">
                  <Trash2 className="w-6 h-6 text-red-500" />
                  תוצאות מחיקת כפילויות
                </h3>
                <button data-ev-id="ev_5885c05832"
              onClick={() => setShowDuplicatesResult(false)}
              className="p-2 hover:bg-muted rounded-lg transition-colors">

                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Summary Stats */}
              <div data-ev-id="ev_050ebea726" className="p-5 border-b border-border">
                <div data-ev-id="ev_e42c9c1d20" className="grid grid-cols-2 gap-4">
                  <div data-ev-id="ev_6049de3cb8" className="bg-red-500/10 rounded-xl p-4 text-center">
                    <p data-ev-id="ev_2f12427b52" className="text-3xl font-bold text-red-500">{duplicatesResult.duplicatesRemoved || 0}</p>
                    <p data-ev-id="ev_75c13bd543" className="text-sm text-muted-foreground">פוסטים נמחקו</p>
                  </div>
                  <div data-ev-id="ev_5ceaff460d" className="bg-green-500/10 rounded-xl p-4 text-center">
                    <p data-ev-id="ev_516ebe08c9" className="text-3xl font-bold text-green-500">{duplicatesResult.tablesProcessed || 0}</p>
                    <p data-ev-id="ev_0b3742c3ae" className="text-sm text-muted-foreground">טבלאות נסרקו</p>
                  </div>
                </div>
              </div>

              {/* Tables Detail */}
              <div data-ev-id="ev_eac76810ad" className="flex-1 overflow-y-auto p-5">
                <h4 data-ev-id="ev_13cff010af" className="font-bold mb-3">פירוט לפי טבלאות</h4>
                <div data-ev-id="ev_7e35b64740" className="flex flex-col gap-2">
                  {(duplicatesResult.details || []).map((detail: any, i: number) =>
                <div data-ev-id="ev_59167c3643" key={i} className="bg-muted/30 rounded-lg p-3 flex items-center justify-between">
                      <span data-ev-id="ev_cfffd0f913" className="font-medium">{SECTION_NAMES[detail.table] || detail.table}</span>
                      <div data-ev-id="ev_0fe0277fe9" className="flex items-center gap-3 text-sm">
                        <span data-ev-id="ev_0f843647bc" className="text-red-500">נמחקו: {detail.duplicates}</span>
                        <span data-ev-id="ev_85febef2dc" className="text-green-500">נשמרו: {detail.kept}</span>
                      </div>
                    </div>
                )}
                </div>

                {/* Errors */}
                {duplicatesResult.errors?.length > 0 &&
              <div data-ev-id="ev_523ff70b6d" className="mt-4">
                    <h4 data-ev-id="ev_8b8c661426" className="font-bold mb-2 text-red-500">שגיאות</h4>
                    <div data-ev-id="ev_df33388f0f" className="bg-red-500/10 rounded-xl p-3 text-sm text-red-400 max-h-32 overflow-y-auto">
                      {duplicatesResult.errors.map((err: string, i: number) =>
                  <div data-ev-id="ev_484aea02e8" key={i} className="py-1">{err}</div>
                  )}
                    </div>
                  </div>
              }
              </div>

              {/* Modal Footer */}
              <div data-ev-id="ev_87140e3ff0" className="p-5 border-t border-border">
                <button data-ev-id="ev_5605c32b57"
              onClick={() => setShowDuplicatesResult(false)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors">

                  סגור
                </button>
              </div>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>

      {/* Folder Browser Modal */}
      <AnimatePresence>
        {showFolderBrowser &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFolderBrowser(false)}>

            <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-surface rounded-2xl border border-border w-full max-w-lg max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}>

              {/* Modal Header */}
              <div data-ev-id="ev_bf8e11d5fd" className="flex items-center justify-between p-5 border-b border-border">
                <h3 data-ev-id="ev_9d67e69d14" className="font-bold text-lg">בחר תיקייה</h3>
                <button data-ev-id="ev_279f04c008"
              onClick={() => setShowFolderBrowser(false)}
              className="p-2 hover:bg-muted rounded-lg transition-colors">

                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Breadcrumb */}
              <div data-ev-id="ev_2d8cb76f82" className="flex items-center gap-1 p-4 border-b border-border bg-muted/30 overflow-x-auto">
                {folderPath.map((folder, index) =>
              <div data-ev-id="ev_04d21b1d1f" key={folder.id} className="flex items-center">
                    {index > 0 && <ChevronLeft className="w-4 h-4 text-muted-foreground mx-1" />}
                    <button data-ev-id="ev_01b6c05195"
                onClick={() => navigateToPathIndex(index)}
                className={`px-2 py-1 rounded-lg text-sm whitespace-nowrap transition-colors ${
                index === folderPath.length - 1 ?
                'bg-secondary/20 text-secondary font-medium' :
                'hover:bg-muted text-muted-foreground'}`
                }>

                      {index === 0 ? <Home className="w-4 h-4" /> : folder.name}
                    </button>
                  </div>
              )}
              </div>

              {/* Folder List */}
              <div data-ev-id="ev_ef97b6b37b" className="flex-1 overflow-y-auto p-4">
                {loadingFolders ?
              <div data-ev-id="ev_33bb8e7a7e" className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-secondary animate-spin" />
                  </div> :
              folders.length === 0 ?
              <div data-ev-id="ev_cf5b5df464" className="text-center py-12 text-muted-foreground">
                    <Folder className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p data-ev-id="ev_981d45ee75">אין תת-תיקיות</p>
                  </div> :

              <div data-ev-id="ev_ac416fb108" className="flex flex-col gap-2">
                    {folders.map((folder) =>
                <button data-ev-id="ev_372a27ba5b"
                key={folder.id}
                onClick={() => navigateToFolder(folder)}
                className="flex items-center gap-3 w-full text-right px-4 py-3 hover:bg-muted rounded-lg transition-colors">

                        <Folder className="w-5 h-5 text-secondary" />
                        <span data-ev-id="ev_9b0befff99" className="flex-1">{folder.name}</span>
                        <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                      </button>
                )}
                  </div>
              }
              </div>

              {/* Select Folder Button */}
              <div data-ev-id="ev_eaed38f257" className="p-4 border-t border-border">
                <button data-ev-id="ev_58b91a70cf"
              onClick={async () => {
                const current = folderPath[folderPath.length - 1];
                if (current && current.id !== 'root') {
                  await selectFolder(current.id, current.name);
                }
              }}
              disabled={savingFolder || folderPath.length <= 1}
              className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-secondary-light text-primary font-bold py-3 rounded-xl transition-colors disabled:opacity-50">

                  {savingFolder ?
                <Loader2 className="w-5 h-5 animate-spin" /> :

                <CheckCircle className="w-5 h-5" />
                }
                  בחר תיקייה זו
                </button>
              </div>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>
    </AdminLayout>);

}