import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { addWatermark, shouldWatermark } from '@/lib/watermark';
import SmartAutocomplete from '@/components/ui/SmartAutocomplete';
import { useChassiduyot } from '@/hooks/useChassiduyot';
import { usePhotographers } from '@/hooks/usePhotographers';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Image as ImageIcon,
  Camera,
  Loader2,
  X,
  Upload,
  Link as LinkIcon,
  GripVertical,
  ImagePlus,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Copy
} from
'lucide-react';

interface Gallery {
  id: string;
  title: string;
  slug: string;
  cover_image: string;
  chassidut: string;
  event_type: string;
  status: string;
  views: number;
  display_order: number;
  created_at: string;
}

interface GalleryImage {
  id: string;
  image_url: string;
  caption: string;
  photographer: string;
  sort_order: number;
  isNew?: boolean;
}

export default function AdminGalleries() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingGallery, setEditingGallery] = useState<Gallery | null>(null);
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);
  const { chassiduyot, addChassidut } = useChassiduyot();
  const { photographers, addPhotographer } = usePhotographers();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    cover_image: '',
    chassidut: '',
    event_type: '',
    hebrew_date: '',
    status: 'draft'
  });

  // Gallery images state
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);

  // Cover image upload state
  const [coverMode, setCoverMode] = useState<'url' | 'upload'>('url');
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverDragOver, setCoverDragOver] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Gallery images upload state
  const [galleryDragOver, setGalleryDragOver] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.
      from('galleries').
      select('*').
      order('display_order', { ascending: false }).
      order('created_at', { ascending: false });

      if (error) throw error;
      setGalleries(data || []);
    } catch (error) {
      console.error('Error fetching galleries:', error);
    } finally {
      setLoading(false);
    }
  };

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    if (!supabase) return;
    const filteredList = filteredGalleries;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= filteredList.length) return;

    const currentItem = filteredList[index];
    const swapItem = filteredList[newIndex];

    setReordering(true);

    const currentOrder = currentItem.display_order || 0;
    const swapOrder = swapItem.display_order || 0;

    setGalleries(galleries.map((g) => {
      if (g.id === currentItem.id) return { ...g, display_order: swapOrder };
      if (g.id === swapItem.id) return { ...g, display_order: currentOrder };
      return g;
    }));

    try {
      await supabase.from('galleries').update({ display_order: swapOrder }).eq('id', currentItem.id);
      await supabase.from('galleries').update({ display_order: currentOrder }).eq('id', swapItem.id);
    } catch (error) {
      console.error('Error updating order:', error);
      fetchGalleries();
    } finally {
      setReordering(false);
    }
  };

  const fetchGalleryImages = async (galleryId: string) => {
    if (!supabase) return;

    setLoadingImages(true);
    try {
      const { data, error } = await supabase.
      from('gallery_images').
      select('*').
      eq('gallery_id', galleryId).
      order('sort_order', { ascending: true });

      if (error) throw error;
      setGalleryImages(data || []);
    } catch (error) {
      console.error('Error fetching gallery images:', error);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setSaving(true);
    try {
      let galleryId = editingGallery?.id;

      if (editingGallery) {
        const { error } = await supabase.
        from('galleries').
        update(formData).
        eq('id', editingGallery.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.
        from('galleries').
        insert(formData).
        select('id').
        single();
        if (error) throw error;
        galleryId = data.id;
      }

      // Save gallery images
      if (galleryId) {
        // Delete removed images
        const existingIds = galleryImages.filter((img) => !img.isNew).map((img) => img.id);
        if (editingGallery) {
          const { error: deleteError } = await supabase.
          from('gallery_images').
          delete().
          eq('gallery_id', galleryId).
          not('id', 'in', `(${existingIds.join(',')})`);
          if (deleteError) console.error('Error deleting images:', deleteError);
        }

        // Insert new images
        const newImages = galleryImages.filter((img) => img.isNew);
        if (newImages.length > 0) {
          const { error: insertError } = await supabase.
          from('gallery_images').
          insert(newImages.map((img, idx) => ({
            gallery_id: galleryId,
            image_url: img.image_url,
            caption: img.caption || null,
            photographer: img.photographer || null,
            sort_order: existingIds.length + idx
          })));
          if (insertError) console.error('Error inserting images:', insertError);
        }

        // Update existing images (captions, order)
        for (const img of galleryImages.filter((i) => !i.isNew)) {
          await supabase.
          from('gallery_images').
          update({
            caption: img.caption || null,
            photographer: img.photographer || null,
            sort_order: img.sort_order
          }).
          eq('id', img.id);
        }
      }

      setShowModal(false);
      setEditingGallery(null);
      resetForm();
      fetchGalleries();
    } catch (error) {
      console.error('Error saving gallery:', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteGallery = async (id: string) => {
    if (!confirm('האם למחוק את הגלריה?')) return;
    if (!supabase) return;

    try {
      const { error } = await supabase.from('galleries').delete().eq('id', id);
      if (error) throw error;
      setGalleries(galleries.filter((g) => g.id !== id));
    } catch (error) {
      console.error('Error deleting gallery:', error);
    }
  };

  const duplicateGallery = async (gallery: Gallery) => {
    if (!supabase) return;

    try {
      const maxOrder = galleries.length > 0 ? Math.max(...galleries.map((g) => g.display_order || 0)) : 0;
      const newSlug = `${gallery.slug}-copy-${Date.now()}`;
      const { error } = await supabase
        .from('galleries')
        .insert({
          title: `${gallery.title} (עותק)`,
          slug: newSlug,
          cover_image: gallery.cover_image,
          chassidut: gallery.chassidut,
          event_type: gallery.event_type,
          status: 'draft',
          display_order: maxOrder + 1
        });
      if (error) throw error;
      fetchGalleries();
    } catch (error) {
      console.error('Error duplicating gallery:', error);
    }
  };

  const openEditModal = (gallery: Gallery) => {
    setEditingGallery(gallery);
    setFormData({
      title: gallery.title,
      slug: gallery.slug,
      description: '',
      cover_image: gallery.cover_image || '',
      chassidut: gallery.chassidut || '',
      event_type: gallery.event_type || '',
      hebrew_date: '',
      status: gallery.status
    });
    setCoverMode(gallery.cover_image?.startsWith('data:') ? 'upload' : 'url');
    fetchGalleryImages(gallery.id);
    setShowModal(true);
  };

  const openNewModal = () => {
    resetForm();
    setEditingGallery(null);
    setGalleryImages([]);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      cover_image: '',
      chassidut: '',
      event_type: '',
      hebrew_date: '',
      status: 'draft'
    });
    setCoverMode('url');
    setGalleryImages([]);
  };

  // Cover image handlers
  const handleCoverFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('נא להעלות רק קבצי תמונה');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('הקובץ גדול מדי. מקסימום 2MB');
      return;
    }

    setCoverUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64 = e.target?.result as string;
          // Add watermark if image is large enough
          const shouldAdd = await shouldWatermark(base64);
          const finalImage = shouldAdd ? await addWatermark(base64) : base64;
          setFormData((prev) => ({ ...prev, cover_image: finalImage }));
        } catch (err) {
          console.error('Error processing image:', err);
          setFormData((prev) => ({ ...prev, cover_image: e.target?.result as string }));
        } finally {
          setCoverUploading(false);
        }
      };
      reader.onerror = () => {
        alert('שגיאה בקריאת הקובץ');
        setCoverUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error uploading file:', err);
      setCoverUploading(false);
    }
  };

  const handleCoverDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setCoverDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleCoverFileSelect(file);
  };

  // Gallery images handlers
  const handleGalleryFilesSelect = async (files: FileList) => {
    const validFiles = Array.from(files).filter((f) =>
    f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024
    );

    for (const file of validFiles) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64 = e.target?.result as string;
          // Add watermark if image is large enough
          const shouldAdd = await shouldWatermark(base64);
          const finalImage = shouldAdd ? await addWatermark(base64) : base64;
          setGalleryImages((prev) => [...prev, {
            id: `new-${Date.now()}-${Math.random()}`,
            image_url: finalImage,
            caption: '',
            photographer: '',
            sort_order: prev.length,
            isNew: true
          }]);
        } catch (err) {
          console.error('Error processing image:', err);
          // Fallback to original
          setGalleryImages((prev) => [...prev, {
            id: `new-${Date.now()}-${Math.random()}`,
            image_url: e.target?.result as string,
            caption: '',
            photographer: '',
            sort_order: prev.length,
            isNew: true
          }]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setGalleryDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleGalleryFilesSelect(e.dataTransfer.files);
    }
  };

  const removeGalleryImage = (id: string) => {
    setGalleryImages((prev) => prev.filter((img) => img.id !== id));
  };

  const updateImageCaption = (id: string, caption: string) => {
    setGalleryImages((prev) => prev.map((img) =>
    img.id === id ? { ...img, caption } : img
    ));
  };

  const filteredGalleries = galleries.filter((g) =>
  g?.title?.toLowerCase()?.includes(search.toLowerCase())
  );

  const eventTypes = [
  { value: 'wedding', label: 'חתונה' },
  { value: 'bar_mitzvah', label: 'בר מצווה' },
  { value: 'tish', label: 'טיש' },
  { value: 'celebration', label: 'שמחה' },
  { value: 'yahrtzeit', label: 'יארצייט' }];


  return (
    <AdminLayout>
      <div data-ev-id="ev_1289338c20" className="flex flex-col gap-6">
        {/* Header */}
        <div data-ev-id="ev_192d2a9c78" className="flex items-center justify-between">
          <div data-ev-id="ev_217acd1319">
            <h1 data-ev-id="ev_3e1a8c5686" className="text-2xl font-bold text-foreground font-serif">ניהול גלריות</h1>
            <p data-ev-id="ev_6c175b762b" className="text-muted-foreground mt-1">{galleries.length} גלריות במערכת</p>
          </div>
          <button data-ev-id="ev_84287caf74"
          onClick={openNewModal}
          className="flex items-center gap-2 bg-secondary hover:bg-secondary-light text-primary font-bold px-5 py-2.5 rounded-xl transition-colors">

            <Plus className="w-5 h-5" />
            גלריה חדשה
          </button>
        </div>

        {/* Search */}
        <div data-ev-id="ev_c32f9ad016" className="relative max-w-md">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input data-ev-id="ev_4d1fdf2117"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="חיפוש גלריות..."
          className="w-full bg-surface border border-border rounded-xl py-3 px-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary" />

        </div>

        {/* Reorder hint */}
        {filteredGalleries.length > 1 && !search &&
        <div data-ev-id="ev_1e2b2cfeb4" className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
            <ArrowUpDown className="w-4 h-4" />
            <span data-ev-id="ev_aae5685c39">השתמש בחיצים כדי לשנות את סדר הגלריות</span>
          </div>
        }

        {/* Galleries Grid */}
        {loading ?
        <div data-ev-id="ev_e882d80017" className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-secondary animate-spin" />
          </div> :
        filteredGalleries.length === 0 ?
        <div data-ev-id="ev_c6cf0b57fc" className="text-center py-20 bg-surface rounded-2xl border border-border">
            <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p data-ev-id="ev_e011812ff4" className="text-muted-foreground">אין גלריות להצגה</p>
          </div> :

        <div data-ev-id="ev_4b37587be2" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGalleries.map((gallery, idx) =>
          <motion.div
            key={gallery.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-surface rounded-2xl border border-border overflow-hidden group relative">

                {/* Reorder buttons */}
                {!search &&
            <div data-ev-id="ev_8b01fb7e6e" className="absolute top-2 right-2 z-10 flex flex-col gap-1 bg-black/50 rounded-lg p-1">
                    <button data-ev-id="ev_fcacff6eab"
              onClick={() => moveItem(idx, 'up')}
              disabled={idx === 0 || reordering}
              className={`p-1 rounded transition-colors ${idx === 0 ? 'text-white/30 cursor-not-allowed' : 'text-white hover:bg-white/20'}`}
              title="העבר למעלה">

                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button data-ev-id="ev_b4a9523715"
              onClick={() => moveItem(idx, 'down')}
              disabled={idx === filteredGalleries.length - 1 || reordering}
              className={`p-1 rounded transition-colors ${idx === filteredGalleries.length - 1 ? 'text-white/30 cursor-not-allowed' : 'text-white hover:bg-white/20'}`}
              title="העבר למטה">

                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
            }

                <div data-ev-id="ev_4451724fd5" className="relative aspect-[4/3]">
                  {gallery.cover_image ?
              <img data-ev-id="ev_44f809d1c5"
              src={gallery.cover_image}
              alt={gallery.title}
              className="w-full h-full object-cover" /> :


              <div data-ev-id="ev_8dabc43e06" className="w-full h-full bg-muted flex items-center justify-center">
                      <Camera className="w-12 h-12 text-muted-foreground" />
                    </div>
              }
                  <div data-ev-id="ev_2c61eca348" className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button data-ev-id="ev_4813fb56f8"
                onClick={() => openEditModal(gallery)}
                className="p-3 bg-white rounded-full hover:bg-secondary transition-colors">

                      <Edit className="w-5 h-5 text-primary" />
                    </button>
                    <button data-ev-id="ev_68796116d5"
                onClick={() => deleteGallery(gallery.id)}
                className="p-3 bg-white rounded-full hover:bg-red-500 hover:text-white transition-colors">

                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <span data-ev-id="ev_c3bd2f06e3" className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${gallery.status === 'published' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                    {gallery.status === 'published' ? 'פורסם' : 'טיוטה'}
                  </span>
                </div>
                <div data-ev-id="ev_b0fef57ed5" className="p-4">
                  <h3 data-ev-id="ev_e2da646eaa" className="font-bold text-foreground line-clamp-1">{gallery.title}</h3>
                  {gallery.chassidut &&
              <span data-ev-id="ev_c006481e61" className="text-sm text-secondary">{gallery.chassidut}</span>
              }
                </div>
              </motion.div>
          )}
          </div>
        }
      </div>

      {/* Modal */}
      {showModal &&
      <div data-ev-id="ev_e287200034" className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            <div data-ev-id="ev_d797ae0d33" className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-surface z-10">
              <h2 data-ev-id="ev_a30e3d249b" className="text-xl font-bold text-foreground">
                {editingGallery ? 'עריכת גלריה' : 'גלריה חדשה'}
              </h2>
              <button data-ev-id="ev_863d945efb" onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form data-ev-id="ev_ed1c57b664" onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              {/* Title */}
              <div data-ev-id="ev_de12ead8f8">
                <label data-ev-id="ev_bd1e988270" className="block text-sm font-medium mb-2">כותרת</label>
                <input data-ev-id="ev_ce4739ec0f"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({
                ...prev,
                title: e.target.value,
                slug: e.target.value.toLowerCase().replace(/\s+/g, '-')
              }))}
              className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4"
              required />

              </div>
              
              {/* Cover Image Uploader */}
              <div data-ev-id="ev_c391fff4b4">
                <label data-ev-id="ev_3b4d2541f3" className="block text-sm font-medium mb-2">תמונת שער</label>
                
                {/* Mode Toggle */}
                <div data-ev-id="ev_ea3f87884e" className="flex gap-2 mb-3">
                  <button data-ev-id="ev_1989d8d9d8"
                type="button"
                onClick={() => setCoverMode('url')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                coverMode === 'url' ?
                'bg-secondary text-primary font-medium' :
                'bg-muted text-muted-foreground hover:text-foreground'}`
                }>

                    <LinkIcon className="w-4 h-4" />
                    קישור
                  </button>
                  <button data-ev-id="ev_1970c277dc"
                type="button"
                onClick={() => setCoverMode('upload')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                coverMode === 'upload' ?
                'bg-secondary text-primary font-medium' :
                'bg-muted text-muted-foreground hover:text-foreground'}`
                }>

                    <Upload className="w-4 h-4" />
                    העלאה
                  </button>
                </div>
                
                {coverMode === 'url' ?
              <input data-ev-id="ev_930c528309"
              type="url"
              value={formData.cover_image.startsWith('data:') ? '' : formData.cover_image}
              onChange={(e) => setFormData((prev) => ({ ...prev, cover_image: e.target.value }))}
              className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4"
              placeholder="הדבק קישור לתמונה"
              dir="ltr" /> :


              <div data-ev-id="ev_d29fd95eff"
              onDrop={handleCoverDrop}
              onDragOver={(e) => {e.preventDefault();setCoverDragOver(true);}}
              onDragLeave={() => setCoverDragOver(false)}
              onClick={() => coverInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              coverDragOver ?
              'border-secondary bg-secondary/10' :
              'border-border hover:border-muted-foreground hover:bg-muted/30'}`
              }>

                    <input data-ev-id="ev_45e33061cc"
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCoverFileSelect(file);
                }}
                className="hidden" />

                    {coverUploading ?
                <div data-ev-id="ev_c8c8ecd45c" className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 text-secondary animate-spin" />
                        <p data-ev-id="ev_2f225ec28b" className="text-muted-foreground">מעלה תמונה...</p>
                      </div> :

                <div data-ev-id="ev_b366d03a82" className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-muted-foreground" />
                        <p data-ev-id="ev_4910e35d2a" className="text-muted-foreground">גרור תמונה לכאן או לחץ לבחירה</p>
                        <p data-ev-id="ev_c0e7934960" className="text-xs text-muted-foreground/70">עד 2MB, פורמטים: JPG, PNG, GIF, WebP</p>
                      </div>
                }
                  </div>
              }
                
                {/* Cover Preview */}
                {formData.cover_image &&
              <div data-ev-id="ev_1d79cd1158" className="relative mt-3">
                    <div data-ev-id="ev_aef80d3332" className="relative rounded-xl overflow-hidden border border-border bg-muted">
                      <img data-ev-id="ev_71f2b96139"
                  src={formData.cover_image}
                  alt="תצוגה מקדימה"
                  className="w-full h-40 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }} />

                      <button data-ev-id="ev_87b0fdf4ae"
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, cover_image: '' }))}
                  className="absolute top-2 left-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">

                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
              }
              </div>
              
              {/* Chassidut & Event Type */}
              <div data-ev-id="ev_5dc1386d72" className="grid grid-cols-2 gap-4">
                <div data-ev-id="ev_6e0c8de71d">
                  <label data-ev-id="ev_eeb4b3707d" className="block text-sm font-medium mb-2">חסידות</label>
                  <SmartAutocomplete
                  value={formData.chassidut}
                  onChange={(value) => setFormData((prev) => ({ ...prev, chassidut: value }))}
                  placeholder="בחר או הקלד חסידות"
                  options={chassiduyot}
                  onAddNew={addChassidut} />


                </div>
                <div data-ev-id="ev_fd9a65dead">
                  <label data-ev-id="ev_17ae819b16" className="block text-sm font-medium mb-2">סוג אירוע</label>
                  <select data-ev-id="ev_0e4f191c74"
                value={formData.event_type}
                onChange={(e) => setFormData((prev) => ({ ...prev, event_type: e.target.value }))}
                className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4">

                    <option data-ev-id="ev_2696d8aab4" value="">בחר</option>
                    {eventTypes.map((t) =>
                  <option data-ev-id="ev_d03a86e877" key={t.value} value={t.value}>{t.label}</option>
                  )}
                  </select>
                </div>
              </div>
              
              {/* Gallery Images Section */}
              <div data-ev-id="ev_58108c1cbd" className="border-t border-border pt-5 mt-2">
                <label data-ev-id="ev_cfbaf435a9" className="block text-sm font-medium mb-3">תמונות הגלריה</label>
                
                {loadingImages ?
              <div data-ev-id="ev_04626b1567" className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-secondary animate-spin" />
                  </div> :

              <>
                    {/* Images Grid */}
                    {galleryImages.length > 0 &&
                <div data-ev-id="ev_15f39f64f3" className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                        {galleryImages.map((img, idx) =>
                  <div data-ev-id="ev_6bc4aecc56" key={img.id} className="relative group">
                            <div data-ev-id="ev_51f973474e" className="aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                              <img data-ev-id="ev_75b4f53c2f"
                      src={img.image_url}
                      alt={img.caption || `תמונה ${idx + 1}`}
                      className="w-full h-full object-cover" />

                            </div>
                            <button data-ev-id="ev_2b6f17eee7"
                    type="button"
                    onClick={() => removeGalleryImage(img.id)}
                    className="absolute -top-2 -left-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">

                              <X className="w-3 h-3" />
                            </button>
                            <input data-ev-id="ev_bc147684e9"
                    type="text"
                    value={img.caption}
                    onChange={(e) => updateImageCaption(img.id, e.target.value)}
                    placeholder="כיתוב..."
                    className="w-full mt-1 text-xs bg-muted/50 border border-border rounded px-2 py-1" />

                          </div>
                  )}
                      </div>
                }
                    
                    {/* Upload Area */}
                    <div data-ev-id="ev_68bcbe4663"
                onDrop={handleGalleryDrop}
                onDragOver={(e) => {e.preventDefault();setGalleryDragOver(true);}}
                onDragLeave={() => setGalleryDragOver(false)}
                onClick={() => galleryInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                galleryDragOver ?
                'border-secondary bg-secondary/10' :
                'border-border hover:border-muted-foreground hover:bg-muted/30'}`
                }>

                      <input data-ev-id="ev_bc2d710535"
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) handleGalleryFilesSelect(e.target.files);
                  }}
                  className="hidden" />

                      <div data-ev-id="ev_958371282a" className="flex flex-col items-center gap-2">
                        <ImagePlus className="w-8 h-8 text-muted-foreground" />
                        <p data-ev-id="ev_33e592366e" className="text-muted-foreground">גרור תמונות לכאן או לחץ להוספה</p>
                        <p data-ev-id="ev_63a88f0fc8" className="text-xs text-muted-foreground/70">ניתן לבחור מספר תמונות בבת אחת</p>
                      </div>
                    </div>
                  </>
              }
              </div>
              
              {/* Status */}
              <div data-ev-id="ev_e9e3969e4a">
                <label data-ev-id="ev_5f4231b887" className="block text-sm font-medium mb-2">סטטוס</label>
                <select data-ev-id="ev_7e972207ce"
              value={formData.status}
              onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4">

                  <option data-ev-id="ev_4e7514e374" value="draft">טיוטה</option>
                  <option data-ev-id="ev_f41462b71d" value="published">פורסם</option>
                </select>
              </div>
              
              {/* Actions */}
              <div data-ev-id="ev_03c5124c92" className="flex gap-3 mt-4">
                <button data-ev-id="ev_5f50dc2242"
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 py-2.5 border border-border rounded-xl hover:bg-muted transition-colors">

                  ביטול
                </button>
                <button data-ev-id="ev_3eaa52d995"
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-secondary text-primary font-bold rounded-xl hover:bg-secondary-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2">

                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  שמור
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      }
    </AdminLayout>);

}
