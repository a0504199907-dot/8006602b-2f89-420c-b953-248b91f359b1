import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import {
  X, Folder, Image as ImageIcon, Loader2, ChevronRight,
  ChevronLeft, Check, FolderOpen, Search, RefreshCw } from
'lucide-react';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webContentLink?: string;
}

interface DriveFolder {
  id: string;
  name: string;
}

interface DriveImagePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
  section?: string; // Optional section to filter folders
}

export default function DriveImagePicker({
  isOpen,
  onClose,
  onSelect,
  section
}: DriveImagePickerProps) {
  const [loading, setLoading] = useState(false);
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [images, setImages] = useState<DriveFile[]>([]);
  const [currentFolder, setCurrentFolder] = useState<DriveFolder | null>(null);
  const [folderPath, setFolderPath] = useState<DriveFolder[]>([]);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [rootFolderId, setRootFolderId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  // Load Drive config on mount
  useEffect(() => {
    if (isOpen) {
      loadDriveConfig();
    }
  }, [isOpen]);

  // Load folder contents when current folder changes
  useEffect(() => {
    if (accessToken && currentFolder) {
      loadFolderContents(currentFolder.id);
    } else if (accessToken && rootFolderId) {
      loadFolderContents(rootFolderId);
    }
  }, [currentFolder, accessToken, rootFolderId]);

  const loadDriveConfig = async () => {
    if (!supabase) return;
    setLoading(true);

    try {
      // Get Drive config
      const { data: config } = await supabase.
      from('drive_sync_config').
      select('*').
      eq('is_active', true).
      single();

      if (!config) {
        alert('לא נמצאה תצורת דרייב. נא להגדיר קודם בעמוד סנכרון דרייב.');
        onClose();
        return;
      }

      // Get access token from settings
      const { data: settings } = await supabase.
      from('site_settings').
      select('value').
      eq('key', 'drive_access_token').
      single();

      if (!settings?.value) {
        alert('לא נמצא טוקן גישה לדרייב. נא להתחבר מחדש.');
        onClose();
        return;
      }

      setAccessToken(settings.value);
      setRootFolderId(config.folder_id);
    } catch (error) {
      console.error('Error loading Drive config:', error);
      alert('שגיאה בטעינת הגדרות הדרייב');
    } finally {
      setLoading(false);
    }
  };

  const loadFolderContents = async (folderId: string) => {
    if (!accessToken) return;
    setLoading(true);

    try {
      // Fetch folders
      const foldersQuery = `'${folderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      const foldersResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(foldersQuery)}&fields=files(id,name)&orderBy=name`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const foldersData = await foldersResponse.json();

      // Fetch images
      const imagesQuery = `'${folderId}' in parents and mimeType contains 'image/' and trashed=false`;
      const imagesResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(imagesQuery)}&fields=files(id,name,mimeType,thumbnailLink,webContentLink)&orderBy=name`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const imagesData = await imagesResponse.json();

      setFolders(foldersData.files || []);
      setImages(imagesData.files || []);
    } catch (error) {
      console.error('Error loading folder contents:', error);
      alert('שגיאה בטעינת תוכן התיקייה');
    } finally {
      setLoading(false);
    }
  };

  const navigateToFolder = (folder: DriveFolder) => {
    setFolderPath([...folderPath, currentFolder!].filter(Boolean));
    setCurrentFolder(folder);
    setSelectedImages(new Set());
  };

  const navigateBack = () => {
    if (folderPath.length > 0) {
      const newPath = [...folderPath];
      const previousFolder = newPath.pop();
      setFolderPath(newPath);
      setCurrentFolder(previousFolder || null);
    } else {
      setCurrentFolder(null);
    }
    setSelectedImages(new Set());
  };

  const toggleImageSelection = (imageId: string) => {
    const newSelection = new Set(selectedImages);
    if (newSelection.has(imageId)) {
      newSelection.delete(imageId);
    } else {
      newSelection.add(imageId);
    }
    setSelectedImages(newSelection);
  };

  const selectAll = () => {
    if (selectedImages.size === images.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(images.map((img) => img.id)));
    }
  };

  const importSelectedImages = async () => {
    if (selectedImages.size === 0) return;
    setImporting(true);

    try {
      // For single selection, just return the image URL
      if (selectedImages.size === 1) {
        const imageId = Array.from(selectedImages)[0];
        const image = images.find((img) => img.id === imageId);
        if (image) {
          // Download and convert to base64
          const response = await fetch(
            `https://www.googleapis.com/drive/v3/files/${imageId}?alt=media`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onload = () => {
            onSelect(reader.result as string);
            onClose();
          };
          reader.readAsDataURL(blob);
        }
      }
    } catch (error) {
      console.error('Error importing images:', error);
      alert('שגיאה בייבוא התמונות');
    } finally {
      setImporting(false);
    }
  };

  const filteredFolders = folders.filter((f) =>
  f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredImages = images.filter((img) =>
  img.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div data-ev-id="ev_8611713c11" className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-surface rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">

          {/* Header */}
          <div data-ev-id="ev_0d0c8b9b72" className="flex items-center justify-between p-4 border-b border-border">
            <div data-ev-id="ev_c3646b65e8" className="flex items-center gap-3">
              <FolderOpen className="w-6 h-6 text-secondary" />
              <h2 data-ev-id="ev_3125e6c2fe" className="text-xl font-bold">בחירת תמונה מדרייב</h2>
            </div>
            <button data-ev-id="ev_19d831f876"
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors">

              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation & Search */}
          <div data-ev-id="ev_47b028ee90" className="flex items-center gap-4 p-4 border-b border-border bg-muted/30">
            {/* Back button */}
            <button data-ev-id="ev_dc942e26d9"
            onClick={navigateBack}
            disabled={!currentFolder && folderPath.length === 0}
            className="p-2 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors">

              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Breadcrumb */}
            <div data-ev-id="ev_583cf8c678" className="flex items-center gap-1 text-sm text-muted-foreground flex-1 overflow-x-auto">
              <span data-ev-id="ev_da9abd3e71"
              onClick={() => {setCurrentFolder(null);setFolderPath([]);}}
              className="cursor-pointer hover:text-foreground">

                תיקייה ראשית
              </span>
              {folderPath.map((folder, idx) =>
              <span data-ev-id="ev_9451700b4a" key={folder.id} className="flex items-center gap-1">
                  <ChevronLeft className="w-4 h-4" />
                  <span data-ev-id="ev_c7d8b00e5e"
                onClick={() => {
                  setFolderPath(folderPath.slice(0, idx));
                  setCurrentFolder(folder);
                }}
                className="cursor-pointer hover:text-foreground">

                    {folder.name}
                  </span>
                </span>
              )}
              {currentFolder &&
              <span data-ev-id="ev_a43d2550ad" className="flex items-center gap-1">
                  <ChevronLeft className="w-4 h-4" />
                  <span data-ev-id="ev_e4e5270112" className="text-foreground font-medium">{currentFolder.name}</span>
                </span>
              }
            </div>

            {/* Search */}
            <div data-ev-id="ev_4013554635" className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input data-ev-id="ev_1e7a3a8d74"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חיפוש..."
              className="w-48 bg-background border border-border rounded-lg py-2 pr-10 pl-4 text-sm" />

            </div>

            {/* Refresh */}
            <button data-ev-id="ev_d1f5f7dcbc"
            onClick={() => currentFolder ? loadFolderContents(currentFolder.id) : loadFolderContents(rootFolderId!)}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-muted transition-colors">

              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Content */}
          <div data-ev-id="ev_57baf6cd98" className="flex-1 overflow-y-auto p-4">
            {loading ?
            <div data-ev-id="ev_438f9518de" className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-secondary" />
              </div> :

            <div data-ev-id="ev_ab9c2a1b2c" className="flex flex-col gap-6">
                {/* Folders */}
                {filteredFolders.length > 0 &&
              <div data-ev-id="ev_f010fcbb07">
                    <h3 data-ev-id="ev_bfeee6be75" className="text-sm font-medium text-muted-foreground mb-3">תיקיות</h3>
                    <div data-ev-id="ev_1b778fe4f3" className="grid grid-cols-4 md:grid-cols-6 gap-3">
                      {filteredFolders.map((folder) =>
                  <button data-ev-id="ev_c362da8305"
                  key={folder.id}
                  onClick={() => navigateToFolder(folder)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted transition-colors">

                          <Folder className="w-10 h-10 text-amber-500" />
                          <span data-ev-id="ev_a7a33bca30" className="text-xs text-center truncate w-full">{folder.name}</span>
                        </button>
                  )}
                    </div>
                  </div>
              }

                {/* Images */}
                {filteredImages.length > 0 &&
              <div data-ev-id="ev_e26581c191">
                    <div data-ev-id="ev_44901cbb5b" className="flex items-center justify-between mb-3">
                      <h3 data-ev-id="ev_1845c88ab3" className="text-sm font-medium text-muted-foreground">
                        תמונות ({filteredImages.length})
                      </h3>
                      <button data-ev-id="ev_9eb1ab17af"
                  onClick={selectAll}
                  className="text-xs text-secondary hover:underline">

                        {selectedImages.size === images.length ? 'בטל בחירה' : 'בחר הכל'}
                      </button>
                    </div>
                    <div data-ev-id="ev_1d6cc75a7e" className="grid grid-cols-4 md:grid-cols-6 gap-3">
                      {filteredImages.map((image) =>
                  <button data-ev-id="ev_f6be427032"
                  key={image.id}
                  onClick={() => toggleImageSelection(image.id)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  selectedImages.has(image.id) ?
                  'border-secondary ring-2 ring-secondary/30' :
                  'border-transparent hover:border-secondary/50'}`
                  }>

                          {image.thumbnailLink ?
                    <img data-ev-id="ev_2b53217f5c"
                    src={image.thumbnailLink.replace('=s220', '=s400')}
                    alt={image.name}
                    className="w-full h-full object-cover" /> :


                    <div data-ev-id="ev_b494a8b040" className="w-full h-full bg-muted flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-muted-foreground" />
                            </div>
                    }
                          
                          {/* Selection indicator */}
                          {selectedImages.has(image.id) &&
                    <div data-ev-id="ev_fc2eaf8047" className="absolute top-2 right-2 w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                    }
                          
                          {/* Name tooltip */}
                          <div data-ev-id="ev_f6af394e1f" className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] p-1 truncate">
                            {image.name}
                          </div>
                        </button>
                  )}
                    </div>
                  </div>
              }

                {/* Empty state */}
                {filteredFolders.length === 0 && filteredImages.length === 0 &&
              <div data-ev-id="ev_39512ddd4c" className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <FolderOpen className="w-16 h-16 mb-4 opacity-50" />
                    <p data-ev-id="ev_cd78871b7a">התיקייה ריקה</p>
                  </div>
              }
              </div>
            }
          </div>

          {/* Footer */}
          <div data-ev-id="ev_7a8a0523af" className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
            <p data-ev-id="ev_29c9ca71be" className="text-sm text-muted-foreground">
              {selectedImages.size > 0 ? `${selectedImages.size} תמונות נבחרו` : 'בחר תמונה לייבוא'}
            </p>
            <div data-ev-id="ev_f5c2e136f8" className="flex gap-3">
              <button data-ev-id="ev_4cbe899afe"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors">

                ביטול
              </button>
              <button data-ev-id="ev_6af8d2d9ab"
              onClick={importSelectedImages}
              disabled={selectedImages.size === 0 || importing}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">

                {importing ?
                <Loader2 className="w-4 h-4 animate-spin" /> :

                <Check className="w-4 h-4" />
                }
                ייבא
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>);

}