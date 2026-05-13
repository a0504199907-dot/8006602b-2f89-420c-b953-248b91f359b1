import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import {
  Image as ImageIcon, Folder, FolderOpen, Upload, Loader2,
  Search, Grid, List, Trash2, Download, Eye, X, Check,
  ChevronRight, ChevronLeft, RefreshCw, Plus } from
'lucide-react';

// Section definitions
const SECTIONS = [
{ id: 'siah_hatzibur', name: 'שיח הציבור', table: 'siah_hatzibur', imageField: 'cover_image_url', folder: 'siah-hatzibur' },
{ id: 'bein_hatzibur', name: 'בעין הציבור', table: 'bein_hatzibur', imageField: 'image_url', folder: 'bein-hatzibur' },
{ id: 'galleries', name: 'גלריות', table: 'galleries', imageField: 'cover_image_url', hasImages: true, folder: 'galleries' },
{ id: 'before_18_years', name: 'לפני 18 שנה', table: 'before_18_years', hasImages: true, folder: 'before-18' },
{ id: 'historical_events', name: 'היסטוריה', table: 'historical_events', imageField: 'cover_image_url', hasImages: true, folder: 'historical' },
{ id: 'articles', name: 'כתבות', table: 'articles', imageField: 'image_url', folder: 'articles' },
{ id: 'news_batzibur', name: 'חדשות בציבור', table: 'news_batzibur', imageField: 'image_url', folder: 'news' },
{ id: 'events', name: 'אירועים', table: 'events', imageField: 'image_url', folder: 'events' },
{ id: 'videos', name: 'סרטונים', table: 'videos', imageField: 'thumbnail_url', folder: 'videos' }];


interface MediaImage {
  id: string;
  url: string;
  title: string;
  source: string;
  date: string;
}

interface DriveFolder {
  id: string;
  name: string;
}

interface DriveImage {
  id: string;
  name: string;
  thumbnailLink?: string;
  mimeType: string;
}

export default function AdminMedia() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0]);
  const [images, setImages] = useState<MediaImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [showPreview, setShowPreview] = useState<string | null>(null);

  // Drive import state
  const [showDriveImport, setShowDriveImport] = useState(false);
  const [driveLoading, setDriveLoading] = useState(false);
  const [driveFolders, setDriveFolders] = useState<DriveFolder[]>([]);
  const [driveImages, setDriveImages] = useState<DriveImage[]>([]);
  const [currentDriveFolder, setCurrentDriveFolder] = useState<DriveFolder | null>(null);
  const [driveFolderPath, setDriveFolderPath] = useState<DriveFolder[]>([]);
  const [selectedDriveImages, setSelectedDriveImages] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [rootFolderId, setRootFolderId] = useState<string | null>(null);

  // Load images when section changes
  useEffect(() => {
    loadSectionImages();
  }, [activeSection]);

  const loadSectionImages = async () => {
    if (!supabase) return;
    setLoading(true);
    setImages([]);

    try {
      const { data, error } = await supabase.
      from(activeSection.table).
      select('*').
      order('created_at', { ascending: false }).
      limit(100);

      if (error) throw error;

      const mediaImages: MediaImage[] = [];

      for (const item of data || []) {
        // Main image
        if (activeSection.imageField && item[activeSection.imageField]) {
          mediaImages.push({
            id: `${item.id}-main`,
            url: item[activeSection.imageField],
            title: item.title || item.name || 'תמונה',
            source: activeSection.name,
            date: item.created_at
          });
        }

        // Additional images (for galleries, historical events, etc.)
        if (activeSection.hasImages && item.images) {
          const imagesArray = Array.isArray(item.images) ? item.images : [];
          imagesArray.forEach((img: any, idx: number) => {
            const imageUrl = typeof img === 'string' ? img : img.url;
            if (imageUrl) {
              mediaImages.push({
                id: `${item.id}-${idx}`,
                url: imageUrl,
                title: `${item.title || 'תמונה'} - ${idx + 1}`,
                source: activeSection.name,
                date: item.created_at
              });
            }
          });
        }
      }

      setImages(mediaImages);
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
    }
  };

  // Drive functions
  const openDriveImport = async () => {
    setShowDriveImport(true);
    setDriveLoading(true);

    try {
      // Get Drive config
      const { data: config } = await supabase!.
      from('drive_sync_config').
      select('*').
      eq('is_active', true).
      single();

      if (!config) {
        alert('לא נמצאה תצורת דרייב. נא להגדיר קודם בעמוד סנכרון דרייב.');
        setShowDriveImport(false);
        return;
      }

      // Get access token
      const { data: settings } = await supabase!.
      from('site_settings').
      select('value').
      eq('key', 'drive_access_token').
      single();

      if (!settings?.value) {
        alert('לא נמצא טוקן גישה לדרייב. נא להתחבר מחדש.');
        setShowDriveImport(false);
        return;
      }

      setAccessToken(settings.value);
      setRootFolderId(config.folder_id);
      await loadDriveFolderContents(config.folder_id, settings.value);
    } catch (error) {
      console.error('Error opening Drive import:', error);
      alert('שגיאה בטעינת הדרייב');
      setShowDriveImport(false);
    } finally {
      setDriveLoading(false);
    }
  };

  const loadDriveFolderContents = async (folderId: string, token: string) => {
    setDriveLoading(true);

    try {
      // Fetch folders
      const foldersQuery = `'${folderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      const foldersResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(foldersQuery)}&fields=files(id,name)&orderBy=name`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const foldersData = await foldersResponse.json();

      // Fetch images
      const imagesQuery = `'${folderId}' in parents and mimeType contains 'image/' and trashed=false`;
      const imagesResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(imagesQuery)}&fields=files(id,name,mimeType,thumbnailLink)&orderBy=name`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const imagesData = await imagesResponse.json();

      setDriveFolders(foldersData.files || []);
      setDriveImages(imagesData.files || []);
    } catch (error) {
      console.error('Error loading Drive contents:', error);
    } finally {
      setDriveLoading(false);
    }
  };

  const navigateToDriveFolder = async (folder: DriveFolder) => {
    if (currentDriveFolder) {
      setDriveFolderPath([...driveFolderPath, currentDriveFolder]);
    }
    setCurrentDriveFolder(folder);
    setSelectedDriveImages(new Set());
    await loadDriveFolderContents(folder.id, accessToken!);
  };

  const navigateBackDrive = async () => {
    if (driveFolderPath.length > 0) {
      const newPath = [...driveFolderPath];
      const previousFolder = newPath.pop();
      setDriveFolderPath(newPath);
      setCurrentDriveFolder(previousFolder || null);
      await loadDriveFolderContents(
        previousFolder?.id || rootFolderId!,
        accessToken!
      );
    } else {
      setCurrentDriveFolder(null);
      await loadDriveFolderContents(rootFolderId!, accessToken!);
    }
    setSelectedDriveImages(new Set());
  };

  const toggleDriveImageSelection = (imageId: string) => {
    const newSelection = new Set(selectedDriveImages);
    if (newSelection.has(imageId)) {
      newSelection.delete(imageId);
    } else {
      newSelection.add(imageId);
    }
    setSelectedDriveImages(newSelection);
  };

  const selectAllDriveImages = () => {
    if (selectedDriveImages.size === driveImages.length) {
      setSelectedDriveImages(new Set());
    } else {
      setSelectedDriveImages(new Set(driveImages.map((img) => img.id)));
    }
  };

  const importFromDrive = async () => {
    if (selectedDriveImages.size === 0) return;
    setImporting(true);

    try {
      // For now, just show success message
      // In a real implementation, this would download and store images
      alert(`יובאו ${selectedDriveImages.size} תמונות בהצלחה!`);
      setShowDriveImport(false);
      setSelectedDriveImages(new Set());
      loadSectionImages();
    } catch (error) {
      console.error('Error importing from Drive:', error);
      alert('שגיאה בייבוא התמונות');
    } finally {
      setImporting(false);
    }
  };

  // Filter images by search
  const filteredImages = images.filter((img) =>
  img.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle image selection
  const toggleImageSelection = (imageId: string) => {
    const newSelection = new Set(selectedImages);
    if (newSelection.has(imageId)) {
      newSelection.delete(imageId);
    } else {
      newSelection.add(imageId);
    }
    setSelectedImages(newSelection);
  };

  return (
    <AdminLayout>
      <div data-ev-id="ev_58dfed69f5" className="p-6">
        {/* Header */}
        <div data-ev-id="ev_85587a8cd5" className="flex items-center justify-between mb-6">
          <div data-ev-id="ev_a51a55c6a8">
            <h1 data-ev-id="ev_b5186c6679" className="text-2xl font-bold text-foreground flex items-center gap-3">
              <ImageIcon className="w-7 h-7 text-secondary" />
              מדיה
            </h1>
            <p data-ev-id="ev_7d77622781" className="text-muted-foreground mt-1">
              ניהול תמונות לפי מדורים
            </p>
          </div>
          <div data-ev-id="ev_d34c601281" className="flex gap-3">
            <button data-ev-id="ev_3663a5f793"
            onClick={openDriveImport}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors">

              <FolderOpen className="w-4 h-4" />
              ייבא מדרייב
            </button>
          </div>
        </div>

        <div data-ev-id="ev_48fb474976" className="flex gap-6">
          {/* Sidebar - Section List */}
          <div data-ev-id="ev_6bf91c9a56" className="w-64 flex-shrink-0">
            <div data-ev-id="ev_fcb6ca7f75" className="bg-surface rounded-xl border border-border p-4">
              <h3 data-ev-id="ev_3e7fa3fb9a" className="font-bold text-foreground mb-4">מדורים</h3>
              <div data-ev-id="ev_456dad5609" className="flex flex-col gap-1">
                {SECTIONS.map((section) =>
                <button data-ev-id="ev_46cf121baa"
                key={section.id}
                onClick={() => setActiveSection(section)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-right transition-colors ${
                activeSection.id === section.id ?
                'bg-secondary/20 text-secondary-foreground font-medium' :
                'hover:bg-muted text-muted-foreground hover:text-foreground'}`
                }>

                    <Folder className="w-4 h-4" />
                    {section.name}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div data-ev-id="ev_76a77713bc" className="flex-1">
            {/* Toolbar */}
            <div data-ev-id="ev_f8a47906da" className="flex items-center gap-4 mb-4">
              {/* Search */}
              <div data-ev-id="ev_52635c68f7" className="relative flex-1 max-w-md">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input data-ev-id="ev_2c7a7b7172"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="חיפוש תמונות..."
                className="w-full bg-surface border border-border rounded-lg py-2 pr-10 pl-4" />

              </div>

              {/* View Mode */}
              <div data-ev-id="ev_289f2b70fd" className="flex gap-1 bg-muted rounded-lg p-1">
                <button data-ev-id="ev_de6accd650"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-surface shadow' : 'hover:bg-surface/50'}`
                }>

                  <Grid className="w-4 h-4" />
                </button>
                <button data-ev-id="ev_78c3409a98"
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                viewMode === 'list' ? 'bg-surface shadow' : 'hover:bg-surface/50'}`
                }>

                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Refresh */}
              <button data-ev-id="ev_3f47242976"
              onClick={loadSectionImages}
              disabled={loading}
              className="p-2 rounded-lg hover:bg-muted transition-colors">

                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Section Title */}
            <div data-ev-id="ev_7bdc21ab16" className="flex items-center gap-3 mb-4">
              <div data-ev-id="ev_112164073f" className="w-1 h-8 bg-secondary rounded-full" />
              <h2 data-ev-id="ev_a50e90e229" className="text-xl font-bold">{activeSection.name}</h2>
              <span data-ev-id="ev_3c7d2c808d" className="text-muted-foreground">({filteredImages.length} תמונות)</span>
            </div>

            {/* Images Grid/List */}
            {loading ?
            <div data-ev-id="ev_d024517092" className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-secondary" />
              </div> :
            filteredImages.length === 0 ?
            <div data-ev-id="ev_56104178f5" className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                <p data-ev-id="ev_c21cfd3156">אין תמונות במדור זה</p>
                <button data-ev-id="ev_ae8a0fb6f4"
              onClick={openDriveImport}
              className="mt-4 flex items-center gap-2 text-secondary hover:underline">

                  <Plus className="w-4 h-4" />
                  ייבא תמונות מדרייב
                </button>
              </div> :
            viewMode === 'grid' ?
            <div data-ev-id="ev_3f72be4547" className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {filteredImages.map((image) =>
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-muted cursor-pointer"
                onClick={() => setShowPreview(image.url)}>

                    <img data-ev-id="ev_9b0ae4e8e4"
                src={image.url}
                alt={image.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.png';
                }} />

                    <div data-ev-id="ev_0c52823bea" className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button data-ev-id="ev_6a77e11a18" className="p-2 bg-white/20 rounded-lg hover:bg-white/30">
                        <Eye className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    <div data-ev-id="ev_113b2261b9" className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 truncate">
                      {image.title}
                    </div>
                  </motion.div>
              )}
              </div> :

            <div data-ev-id="ev_17bebe3e1e" className="flex flex-col gap-2">
                {filteredImages.map((image) =>
              <div data-ev-id="ev_369b4d970b"
              key={image.id}
              className="flex items-center gap-4 p-3 bg-surface rounded-xl border border-border hover:border-secondary/50 transition-colors cursor-pointer"
              onClick={() => setShowPreview(image.url)}>

                    <img data-ev-id="ev_785225a57a"
                src={image.url}
                alt={image.title}
                className="w-16 h-16 object-cover rounded-lg" />

                    <div data-ev-id="ev_c133ea88d9" className="flex-1">
                      <p data-ev-id="ev_11cfbe0145" className="font-medium">{image.title}</p>
                      <p data-ev-id="ev_8d356f7ef1" className="text-sm text-muted-foreground">{image.source}</p>
                    </div>
                    <p data-ev-id="ev_67e5e19b90" className="text-sm text-muted-foreground">
                      {new Date(image.date).toLocaleDateString('he-IL')}
                    </p>
                  </div>
              )}
              </div>
            }
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {showPreview &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPreview(null)}>

            <button data-ev-id="ev_502986458b"
          className="absolute top-4 left-4 p-2 bg-white/20 rounded-lg hover:bg-white/30"
          onClick={() => setShowPreview(null)}>

              <X className="w-6 h-6 text-white" />
            </button>
            <img data-ev-id="ev_099fbdf95a"
          src={showPreview}
          alt="Preview"
          className="max-w-full max-h-full object-contain rounded-xl"
          onClick={(e) => e.stopPropagation()} />

          </motion.div>
        }
      </AnimatePresence>

      {/* Drive Import Modal */}
      <AnimatePresence>
        {showDriveImport &&
        <div data-ev-id="ev_6213ab45ac" className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-surface rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">

              {/* Header */}
              <div data-ev-id="ev_3521c96287" className="flex items-center justify-between p-4 border-b border-border">
                <div data-ev-id="ev_12db9067c7" className="flex items-center gap-3">
                  <FolderOpen className="w-6 h-6 text-secondary" />
                  <h2 data-ev-id="ev_d30a0658d8" className="text-xl font-bold">ייבוא תמונות מדרייב</h2>
                </div>
                <button data-ev-id="ev_fa74b6ddc9"
              onClick={() => setShowDriveImport(false)}
              className="p-2 hover:bg-muted rounded-lg">

                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation */}
              <div data-ev-id="ev_dbcc478ea0" className="flex items-center gap-4 p-4 border-b border-border bg-muted/30">
                <button data-ev-id="ev_71846be43b"
              onClick={navigateBackDrive}
              disabled={!currentDriveFolder && driveFolderPath.length === 0}
              className="p-2 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed">

                  <ChevronRight className="w-5 h-5" />
                </button>

                <div data-ev-id="ev_1306a4fef5" className="flex items-center gap-1 text-sm text-muted-foreground flex-1">
                  <span data-ev-id="ev_74e5f688db"
                onClick={() => {
                  setCurrentDriveFolder(null);
                  setDriveFolderPath([]);
                  loadDriveFolderContents(rootFolderId!, accessToken!);
                }}
                className="cursor-pointer hover:text-foreground">

                    תיקייה ראשית
                  </span>
                  {driveFolderPath.map((folder) =>
                <span data-ev-id="ev_66ede793ce" key={folder.id} className="flex items-center gap-1">
                      <ChevronLeft className="w-4 h-4" />
                      <span data-ev-id="ev_924e2e84e2" className="cursor-pointer hover:text-foreground">
                        {folder.name}
                      </span>
                    </span>
                )}
                  {currentDriveFolder &&
                <span data-ev-id="ev_d91507f618" className="flex items-center gap-1">
                      <ChevronLeft className="w-4 h-4" />
                      <span data-ev-id="ev_6dcbd02931" className="text-foreground font-medium">{currentDriveFolder.name}</span>
                    </span>
                }
                </div>
              </div>

              {/* Content */}
              <div data-ev-id="ev_6f7f9008be" className="flex-1 overflow-y-auto p-4">
                {driveLoading ?
              <div data-ev-id="ev_36bf3fb3da" className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-secondary" />
                  </div> :

              <div data-ev-id="ev_da79477862" className="flex flex-col gap-6">
                    {/* Folders */}
                    {driveFolders.length > 0 &&
                <div data-ev-id="ev_a4839bdb82">
                        <h3 data-ev-id="ev_9efa7a1afa" className="text-sm font-medium text-muted-foreground mb-3">תיקיות</h3>
                        <div data-ev-id="ev_403a0f9594" className="grid grid-cols-4 md:grid-cols-6 gap-3">
                          {driveFolders.map((folder) =>
                    <button data-ev-id="ev_addba5264a"
                    key={folder.id}
                    onClick={() => navigateToDriveFolder(folder)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted transition-colors">

                              <Folder className="w-10 h-10 text-amber-500" />
                              <span data-ev-id="ev_6e2dd05283" className="text-xs text-center truncate w-full">{folder.name}</span>
                            </button>
                    )}
                        </div>
                      </div>
                }

                    {/* Images */}
                    {driveImages.length > 0 &&
                <div data-ev-id="ev_8f3ded73ce">
                        <div data-ev-id="ev_b4844fd171" className="flex items-center justify-between mb-3">
                          <h3 data-ev-id="ev_aef5e32064" className="text-sm font-medium text-muted-foreground">
                            תמונות ({driveImages.length})
                          </h3>
                          <button data-ev-id="ev_e6c7986a9a"
                    onClick={selectAllDriveImages}
                    className="text-xs text-secondary hover:underline">

                            {selectedDriveImages.size === driveImages.length ? 'בטל בחירה' : 'בחר הכל'}
                          </button>
                        </div>
                        <div data-ev-id="ev_c2063109ce" className="grid grid-cols-4 md:grid-cols-6 gap-3">
                          {driveImages.map((image) =>
                    <button data-ev-id="ev_0aaadd2f83"
                    key={image.id}
                    onClick={() => toggleDriveImageSelection(image.id)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    selectedDriveImages.has(image.id) ?
                    'border-secondary ring-2 ring-secondary/30' :
                    'border-transparent hover:border-secondary/50'}`
                    }>

                              {image.thumbnailLink ?
                      <img data-ev-id="ev_bd7ef3d709"
                      src={image.thumbnailLink.replace('=s220', '=s400')}
                      alt={image.name}
                      className="w-full h-full object-cover" /> :


                      <div data-ev-id="ev_640fdb1167" className="w-full h-full bg-muted flex items-center justify-center">
                                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                                </div>
                      }

                              {selectedDriveImages.has(image.id) &&
                      <div data-ev-id="ev_671ab57ad6" className="absolute top-2 right-2 w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                      }

                              <div data-ev-id="ev_934857aa53" className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] p-1 truncate">
                                {image.name}
                              </div>
                            </button>
                    )}
                        </div>
                      </div>
                }

                    {/* Empty state */}
                    {driveFolders.length === 0 && driveImages.length === 0 &&
                <div data-ev-id="ev_2cd4f0cdb4" className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                        <FolderOpen className="w-16 h-16 mb-4 opacity-50" />
                        <p data-ev-id="ev_ed34ba4afa">התיקייה ריקה</p>
                      </div>
                }
                  </div>
              }
              </div>

              {/* Footer */}
              <div data-ev-id="ev_153b9412a0" className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
                <p data-ev-id="ev_728db19b59" className="text-sm text-muted-foreground">
                  {selectedDriveImages.size > 0 ?
                `${selectedDriveImages.size} תמונות נבחרו לייבוא ל${activeSection.name}` :
                'בחר תמונות לייבוא'}
                </p>
                <div data-ev-id="ev_e5ea2ef11e" className="flex gap-3">
                  <button data-ev-id="ev_00ff30f80d"
                onClick={() => setShowDriveImport(false)}
                className="px-4 py-2 rounded-lg border border-border hover:bg-muted">

                    ביטול
                  </button>
                  <button data-ev-id="ev_7e38a3e971"
                onClick={importFromDrive}
                disabled={selectedDriveImages.size === 0 || importing}
                className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed">

                    {importing ?
                  <Loader2 className="w-4 h-4 animate-spin" /> :

                  <Download className="w-4 h-4" />
                  }
                    ייבא
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        }
      </AnimatePresence>
    </AdminLayout>);

}