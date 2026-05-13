import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import SmartAutocomplete from '@/components/ui/SmartAutocomplete';
import { useChassiduyot } from '@/hooks/useChassiduyot';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Video,
  Play,
  Eye,
  Loader2,
  X,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Copy } from

'lucide-react';

interface VideoItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration: string;
  chassidut: string;
  status: string;
  views: number;
  display_order: number;
  created_at: string;
}

export default function AdminVideos() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [reordering, setReordering] = useState(false);
  const { chassiduyot, addChassidut } = useChassiduyot();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    duration: '',
    chassidut: '',
    status: 'draft'
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    if (!supabase) {setLoading(false);return;}

    try {
      const { data, error } = await supabase.
      from('videos').
      select('*').
      order('display_order', { ascending: false }).
      order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    if (!supabase) return;
    const filteredList = filteredVideos;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= filteredList.length) return;

    // Find actual items
    const currentItem = filteredList[index];
    const swapItem = filteredList[newIndex];

    setReordering(true);

    // Swap display_order values
    const currentOrder = currentItem.display_order || 0;
    const swapOrder = swapItem.display_order || 0;

    setVideos(videos.map((v) => {
      if (v.id === currentItem.id) return { ...v, display_order: swapOrder };
      if (v.id === swapItem.id) return { ...v, display_order: currentOrder };
      return v;
    }));

    try {
      await supabase.from('videos').update({ display_order: swapOrder }).eq('id', currentItem.id);
      await supabase.from('videos').update({ display_order: currentOrder }).eq('id', swapItem.id);
    } catch (error) {
      console.error('Error updating order:', error);
      fetchVideos();
    } finally {
      setReordering(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    try {
      if (editingVideo) {
        const { error } = await supabase.from('videos').update(formData).eq('id', editingVideo.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('videos').insert(formData);
        if (error) throw error;
      }
      setShowModal(false);
      setEditingVideo(null);
      resetForm();
      fetchVideos();
    } catch (error) {
      console.error('Error saving video:', error);
    }
  };

  const deleteVideo = async (id: string) => {
    if (!confirm('האם למחוק את הסרטון?')) return;
    if (!supabase) return;

    try {
      const { error } = await supabase.from('videos').delete().eq('id', id);
      if (error) throw error;
      setVideos(videos.filter((v) => v.id !== id));
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };

  const duplicateVideo = async (video: VideoItem) => {
    if (!supabase) return;

    try {
      const maxOrder = videos.length > 0 ? Math.max(...videos.map((v) => v.display_order || 0)) : 0;
      const newSlug = `${video.slug}-copy-${Date.now()}`;
      const { error } = await supabase.
      from('videos').
      insert({
        title: `${video.title} (עותק)`,
        slug: newSlug,
        description: video.description,
        video_url: video.video_url,
        thumbnail_url: video.thumbnail_url,
        duration: video.duration,
        chassidut: video.chassidut,
        status: 'draft',
        display_order: maxOrder + 1
      });
      if (error) throw error;
      fetchVideos();
    } catch (error) {
      console.error('Error duplicating video:', error);
    }
  };

  const openEditModal = (video: VideoItem) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      slug: video.slug,
      description: video.description || '',
      video_url: video.video_url,
      thumbnail_url: video.thumbnail_url || '',
      duration: video.duration || '',
      chassidut: video.chassidut || '',
      status: video.status
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      video_url: '',
      thumbnail_url: '',
      duration: '',
      chassidut: '',
      status: 'draft'
    });
  };

  const filteredVideos = videos.filter((v) =>
  v.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div data-ev-id="ev_c7435a4d04" className="flex flex-col gap-6">
        {/* Header */}
        <div data-ev-id="ev_22ecf8fc61" className="flex items-center justify-between">
          <div data-ev-id="ev_6292e0a848">
            <h1 data-ev-id="ev_aa0a7c7193" className="text-2xl font-bold text-foreground font-serif">ניהול וידאו</h1>
            <p data-ev-id="ev_5e03de1959" className="text-muted-foreground mt-1">{videos.length} סרטונים במערכת</p>
          </div>
          <button data-ev-id="ev_89ebb4adcf"
          onClick={() => {resetForm();setEditingVideo(null);setShowModal(true);}}
          className="flex items-center gap-2 bg-secondary hover:bg-secondary-light text-primary font-bold px-5 py-2.5 rounded-xl transition-colors">

            <Plus className="w-5 h-5" />
            סרטון חדש
          </button>
        </div>

        {/* Search */}
        <div data-ev-id="ev_d6a9188874" className="relative max-w-md">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input data-ev-id="ev_ad7d44bd15"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="חיפוש סרטונים..."
          className="w-full bg-surface border border-border rounded-xl py-3 px-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary" />

        </div>

        {/* Reorder hint */}
        {filteredVideos.length > 1 && !search &&
        <div data-ev-id="ev_cb377c5d0d" className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
            <ArrowUpDown className="w-4 h-4" />
            <span data-ev-id="ev_f881584907">השתמש בחיצים כדי לשנות את סדר הסרטונים</span>
          </div>
        }

        {/* Videos Grid */}
        {loading ?
        <div data-ev-id="ev_593e74e670" className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-secondary animate-spin" />
          </div> :
        filteredVideos.length === 0 ?
        <div data-ev-id="ev_b2cd35c423" className="text-center py-20 bg-surface rounded-2xl border border-border">
            <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p data-ev-id="ev_99525fa15b" className="text-muted-foreground">אין סרטונים להצגה</p>
          </div> :

        <div data-ev-id="ev_247e80385b" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video, idx) =>
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-surface rounded-2xl border border-border overflow-hidden group relative">

                {/* Reorder buttons */}
                {!search &&
            <div data-ev-id="ev_d061e73c69" className="absolute top-2 right-2 z-10 flex flex-col gap-1 bg-black/50 rounded-lg p-1">
                    <button data-ev-id="ev_1848cf1a4b"
              onClick={() => moveItem(idx, 'up')}
              disabled={idx === 0 || reordering}
              className={`p-1 rounded transition-colors ${idx === 0 ? 'text-white/30 cursor-not-allowed' : 'text-white hover:bg-white/20'}`}
              title="העבר למעלה">

                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button data-ev-id="ev_fe5e34325c"
              onClick={() => moveItem(idx, 'down')}
              disabled={idx === filteredVideos.length - 1 || reordering}
              className={`p-1 rounded transition-colors ${idx === filteredVideos.length - 1 ? 'text-white/30 cursor-not-allowed' : 'text-white hover:bg-white/20'}`}
              title="העבר למטה">

                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
            }

                <div data-ev-id="ev_5b110a7d2a" className="relative aspect-video">
                  {video.thumbnail_url ?
              <img data-ev-id="ev_41d01069c4"
              src={video.thumbnail_url}
              alt={video.title}
              className="w-full h-full object-cover" /> :


              <div data-ev-id="ev_a9d7e263a6" className="w-full h-full bg-primary flex items-center justify-center">
                      <Play className="w-12 h-12 text-secondary" />
                    </div>
              }
                  <div data-ev-id="ev_64ba6afaa6" className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button data-ev-id="ev_2721145ee8"
                onClick={() => duplicateVideo(video)}
                className="p-3 bg-white rounded-full hover:bg-blue-500 hover:text-white transition-colors"
                title="שכפל">

                      <Copy className="w-5 h-5" />
                    </button>
                    <button data-ev-id="ev_78df14b509"
                onClick={() => openEditModal(video)}
                className="p-3 bg-white rounded-full hover:bg-secondary transition-colors"
                title="ערוך">

                      <Edit className="w-5 h-5 text-primary" />
                    </button>
                    <button data-ev-id="ev_7565c355c6"
                onClick={() => deleteVideo(video.id)}
                className="p-3 bg-white rounded-full hover:bg-red-500 hover:text-white transition-colors"
                title="מחק">

                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  {video.duration &&
              <span data-ev-id="ev_07017044a5" className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      {video.duration}
                    </span>
              }
                  <span data-ev-id="ev_d3616d5da9" className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${video.status === 'published' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                    {video.status === 'published' ? 'פורסם' : 'טיוטה'}
                  </span>
                </div>
                <div data-ev-id="ev_b423fe7a1f" className="p-4">
                  <h3 data-ev-id="ev_5c377a5398" className="font-bold text-foreground line-clamp-1">{video.title}</h3>
                  <div data-ev-id="ev_b948e037a1" className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                    <span data-ev-id="ev_ecf39f45cf" className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {video.views?.toLocaleString() || 0}
                    </span>
                    {video.chassidut &&
                <span data-ev-id="ev_3b52167e88" className="text-secondary">{video.chassidut}</span>
                }
                  </div>
                </div>
              </motion.div>
          )}
          </div>
        }
      </div>

      {/* Modal */}
      {showModal &&
      <div data-ev-id="ev_44b0bdf9c0" className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

            <div data-ev-id="ev_6db27dfaf9" className="flex items-center justify-between p-6 border-b border-border">
              <h2 data-ev-id="ev_43d31f0868" className="text-xl font-bold text-foreground">
                {editingVideo ? 'עריכת סרטון' : 'סרטון חדש'}
              </h2>
              <button data-ev-id="ev_832c160728" onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form data-ev-id="ev_5ddfcb332d" onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div data-ev-id="ev_f2cb575dc0">
                <label data-ev-id="ev_c8706330e3" className="block text-sm font-medium mb-2">כותרת</label>
                <input data-ev-id="ev_596928f5a8"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
              className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4"
              required />

              </div>
              <div data-ev-id="ev_81babf13df">
                <label data-ev-id="ev_e2227dbd6b" className="block text-sm font-medium mb-2">קישור לסרטון (YouTube)</label>
                <input data-ev-id="ev_6d6dd49232"
              type="url"
              value={formData.video_url}
              onChange={(e) => setFormData((prev) => ({ ...prev, video_url: e.target.value }))}
              className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4"
              dir="ltr"
              required />

              </div>
              <div data-ev-id="ev_068e721a8d">
                <label data-ev-id="ev_a1ca3a12ae" className="block text-sm font-medium mb-2">תמונה ממוזערת</label>
                <input data-ev-id="ev_cb4da5a330"
              type="url"
              value={formData.thumbnail_url}
              onChange={(e) => setFormData((prev) => ({ ...prev, thumbnail_url: e.target.value }))}
              className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4"
              dir="ltr" />

              </div>
              <div data-ev-id="ev_a2b22e2c13" className="grid grid-cols-2 gap-4">
                <div data-ev-id="ev_ee65afd609">
                  <label data-ev-id="ev_a11a155637" className="block text-sm font-medium mb-2">משך</label>
                  <input data-ev-id="ev_fa42806294"
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
                className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4"
                placeholder="12:34"
                dir="ltr" />

                </div>
                <div data-ev-id="ev_63c7a60f36">
                  <label data-ev-id="ev_54292ba36a" className="block text-sm font-medium mb-2">חסידות</label>
                  <SmartAutocomplete
                  value={formData.chassidut}
                  onChange={(value) => setFormData((prev) => ({ ...prev, chassidut: value }))}
                  placeholder="בחר או הקלד חסידות"
                  options={chassiduyot}
                  onAddNew={addChassidut} />


                </div>
              </div>
              <div data-ev-id="ev_52835460aa">
                <label data-ev-id="ev_e26e6dee36" className="block text-sm font-medium mb-2">סטטוס</label>
                <select data-ev-id="ev_cbe3dbbc89"
              value={formData.status}
              onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4">

                  <option data-ev-id="ev_9aaea4bbfc" value="draft">טיוטה</option>
                  <option data-ev-id="ev_9bcdc6c67c" value="published">פורסם</option>
                </select>
              </div>
              <div data-ev-id="ev_1a532bc2f1" className="flex gap-3 mt-4">
                <button data-ev-id="ev_363f76ba7e"
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 py-2.5 border border-border rounded-xl hover:bg-muted transition-colors">

                  ביטול
                </button>
                <button data-ev-id="ev_fc95de4285"
              type="submit"
              className="flex-1 py-2.5 bg-secondary text-primary font-bold rounded-xl hover:bg-secondary-light transition-colors">

                  שמור
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      }
    </AdminLayout>);

}