import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import ImageUploader from '@/components/ui/ImageUploader';
import RichTextEditor from '@/components/ui/RichTextEditor';
import SmartAutocomplete from '@/components/ui/SmartAutocomplete';
import { useWriters } from '@/hooks/useWriters';
import { usePhotographers } from '@/hooks/usePhotographers';
import { useChassiduyot } from '@/hooks/useChassiduyot';
import {
  Plus,
  Edit,
  Trash2,
  History,
  Loader2,
  X,
  Calendar,
  MapPin,
  Image as ImageIcon,
  User,
  Camera,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Copy } from

'lucide-react';

interface ImageWithCaption {
  url: string;
  caption: string;
}

interface HistoricalEvent {
  id: string;
  title: string;
  description: string | null;
  content: string;
  cover_image_url: string | null;
  images: ImageWithCaption[];
  event_year_hebrew: string | null;
  event_year_gregorian: number | null;
  event_decade: string | null;
  chassidut: string | null;
  event_type: string | null;
  location: string | null;
  author: string | null;
  photographer: string | null;
  is_published: boolean;
  display_order: number;
  created_at: string;
}

const DECADES = [
'שנות ה-40', 'שנות ה-50', 'שנות ה-60', 'שנות ה-70',
'שנות ה-80', 'שנות ה-90', 'שנות ה-2000'];


const EVENT_TYPES = [
'חתונה', 'בר מצווה', 'טיש', 'הכתרה', 'הלוויה',
'יארצייט', 'פטירה', 'כנס', 'ביקור', 'אחר'];


export default function AdminHistoricalEvents() {
  const [items, setItems] = useState<HistoricalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<HistoricalEvent | null>(null);
  const [reordering, setReordering] = useState(false);
  const { writers, addWriter } = useWriters();
  const { photographers, addPhotographer } = usePhotographers();
  const { chassiduyot, addChassidut } = useChassiduyot();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    cover_image_url: '',
    images: [] as ImageWithCaption[],
    event_year_hebrew: '',
    event_year_gregorian: null as number | null,
    event_decade: '',
    chassidut: '',
    event_type: '',
    location: '',
    author: '',
    photographer: '',
    is_published: true
  });

  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    if (!supabase) {setLoading(false);return;}

    try {
      const { data, error } = await supabase.
      from('historical_events').
      select('*').
      order('display_order', { ascending: false }).
      order('event_year_gregorian', { ascending: false });

      if (error) throw error;
      setItems((data || []).map((item) => ({
        ...item,
        images: Array.isArray(item.images) ? item.images : []
      })));
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    if (!supabase) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    setReordering(true);
    const newItems = [...items];
    const [movedItem] = newItems.splice(index, 1);
    newItems.splice(newIndex, 0, movedItem);

    const updates = newItems.map((item, idx) => ({
      id: item.id,
      display_order: newItems.length - idx
    }));

    setItems(newItems);

    try {
      for (const update of updates) {
        await supabase.
        from('historical_events').
        update({ display_order: update.display_order }).
        eq('id', update.id);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      fetchItems();
    } finally {
      setReordering(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setSaving(true);
    setSaveSuccess(false);

    try {
      const itemData = {
        title: formData.title,
        description: formData.description || null,
        content: formData.content,
        cover_image_url: formData.cover_image_url || null,
        images: formData.images,
        event_year_hebrew: formData.event_year_hebrew || null,
        event_year_gregorian: formData.event_year_gregorian,
        event_decade: formData.event_decade || null,
        chassidut: formData.chassidut || null,
        event_type: formData.event_type || null,
        location: formData.location || null,
        author: formData.author || null,
        photographer: formData.photographer || null,
        is_published: formData.is_published
      };

      if (editingItem) {
        const { error } = await supabase.
        from('historical_events').
        update(itemData).
        eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const maxOrder = items.length > 0 ? Math.max(...items.map((i) => i.display_order || 0)) : 0;
        const { error } = await supabase.
        from('historical_events').
        insert({ ...itemData, display_order: maxOrder + 1 });
        if (error) throw error;
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setEditingItem(null);
        resetForm();
        fetchItems();
        setSaveSuccess(false);
      }, 1000);
    } catch (error) {
      console.error('Error saving item:', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('האם למחוק את האירוע?')) return;
    if (!supabase) return;

    try {
      const { error } = await supabase.from('historical_events').delete().eq('id', id);
      if (error) throw error;
      setItems(items.filter((i) => i.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const duplicateItem = async (item: HistoricalEvent) => {
    if (!supabase) return;

    try {
      const maxOrder = items.length > 0 ? Math.max(...items.map((i) => i.display_order || 0)) : 0;
      const { error } = await supabase.
      from('historical_events').
      insert({
        title: `${item.title} (עותק)`,
        description: item.description,
        content: item.content,
        cover_image_url: item.cover_image_url,
        images: item.images,
        event_year_hebrew: item.event_year_hebrew,
        event_year_gregorian: item.event_year_gregorian,
        event_decade: item.event_decade,
        chassidut: item.chassidut,
        event_type: item.event_type,
        location: item.location,
        author: item.author,
        photographer: item.photographer,
        is_published: false,
        display_order: maxOrder + 1
      });
      if (error) throw error;
      fetchItems();
    } catch (error) {
      console.error('Error duplicating item:', error);
    }
  };

  const togglePublish = async (item: HistoricalEvent) => {
    if (!supabase) return;
    const newStatus = !item.is_published;
    setItems(items.map((i) => i.id === item.id ? { ...i, is_published: newStatus } : i));

    try {
      const { error } = await supabase.
      from('historical_events').
      update({ is_published: newStatus }).
      eq('id', item.id);
      if (error) throw error;
    } catch (error) {
      console.error('Error toggling publish:', error);
      setItems(items.map((i) => i.id === item.id ? { ...i, is_published: !newStatus } : i));
    }
  };

  const openEditModal = (item: HistoricalEvent) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      content: item.content || '',
      cover_image_url: item.cover_image_url || '',
      images: item.images || [],
      event_year_hebrew: item.event_year_hebrew || '',
      event_year_gregorian: item.event_year_gregorian,
      event_decade: item.event_decade || '',
      chassidut: item.chassidut || '',
      event_type: item.event_type || '',
      location: item.location || '',
      author: item.author || '',
      photographer: item.photographer || '',
      is_published: item.is_published
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      cover_image_url: '',
      images: [],
      event_year_hebrew: '',
      event_year_gregorian: null,
      event_decade: '',
      chassidut: '',
      event_type: '',
      location: '',
      author: '',
      photographer: '',
      is_published: true
    });
    setNewImageUrl('');
    setNewImageCaption('');
  };

  const addImage = () => {
    if (newImageUrl) {
      setFormData({
        ...formData,
        images: [...formData.images, { url: newImageUrl, caption: newImageCaption }]
      });
      setNewImageUrl('');
      setNewImageCaption('');
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  return (
    <AdminLayout>
      <div data-ev-id="ev_fba1e4fbc9" className="flex flex-col gap-6">
        {/* Header */}
        <div data-ev-id="ev_aafc81d546" className="flex items-center justify-between">
          <div data-ev-id="ev_7006c6812f">
            <h1 data-ev-id="ev_6060bc1c8b" className="text-2xl font-bold text-foreground font-serif">אירועים היסטוריים</h1>
            <p data-ev-id="ev_1ae6968561" className="text-muted-foreground mt-1">תמונות מהעבר החסידי</p>
          </div>
          <button data-ev-id="ev_7495af2a5f"
          onClick={() => {resetForm();setEditingItem(null);setShowModal(true);}}
          className="flex items-center gap-2 bg-secondary hover:bg-secondary-light text-primary font-bold px-5 py-2.5 rounded-xl transition-colors">

            <Plus className="w-5 h-5" />
            אירוע חדש
          </button>
        </div>

        {/* Reorder hint */}
        {items.length > 1 &&
        <div data-ev-id="ev_f8f5b6e81a" className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
            <ArrowUpDown className="w-4 h-4" />
            <span data-ev-id="ev_abce6e32df">השתמש בחיצים כדי לשנות את סדר האירועים</span>
          </div>
        }

        {/* Items List */}
        {loading ?
        <div data-ev-id="ev_2890ae565c" className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-secondary animate-spin" />
          </div> :
        items.length === 0 ?
        <div data-ev-id="ev_60573655a2" className="text-center py-20 bg-surface rounded-2xl border border-border">
            <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p data-ev-id="ev_c24f0ea00d" className="text-muted-foreground">אין אירועים להצגה</p>
          </div> :

        <div data-ev-id="ev_65075acb27" className="bg-surface rounded-2xl border border-border overflow-hidden">
            {items.map((item, idx) =>
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`flex items-center gap-4 p-5 ${idx !== items.length - 1 ? 'border-b border-border' : ''}`}>

                {/* Reorder buttons */}
                <div data-ev-id="ev_e0e85f3726" className="flex flex-col gap-1">
                  <button data-ev-id="ev_bb3804442b"
              onClick={() => moveItem(idx, 'up')}
              disabled={idx === 0 || reordering}
              className={`p-1 rounded transition-colors ${idx === 0 ? 'text-muted-foreground/30 cursor-not-allowed' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
              title="העבר למעלה">

                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button data-ev-id="ev_a22093b592"
              onClick={() => moveItem(idx, 'down')}
              disabled={idx === items.length - 1 || reordering}
              className={`p-1 rounded transition-colors ${idx === items.length - 1 ? 'text-muted-foreground/30 cursor-not-allowed' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
              title="העבר למטה">

                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Thumbnail */}
                <div data-ev-id="ev_2e7e32fbce" className="w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0">
                  {item.cover_image_url ?
              <img data-ev-id="ev_f28975f6d7" src={item.cover_image_url} alt="" className="w-full h-full object-cover" /> :

              <div data-ev-id="ev_36e64aa2f2" className="w-full h-full flex items-center justify-center">
                      <History className="w-8 h-8 text-muted-foreground" />
                    </div>
              }
                </div>

                {/* Info */}
                <div data-ev-id="ev_fee772aec4" className="flex-1 min-w-0">
                  <h3 data-ev-id="ev_eeb17cd05d" className="font-bold text-foreground truncate">{item.title}</h3>
                  <div data-ev-id="ev_26dc6e7ba0" className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {item.event_year_hebrew &&
                <span data-ev-id="ev_7138cccc94" className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {item.event_year_hebrew}
                      </span>
                }
                    {item.event_decade && <span data-ev-id="ev_5a4c1884a0">{item.event_decade}</span>}
                    {item.chassidut &&
                <span data-ev-id="ev_e69e48c576" className="bg-secondary/20 text-secondary-dark px-2 py-0.5 rounded">
                        {item.chassidut}
                      </span>
                }
                    {item.event_type &&
                <span data-ev-id="ev_839c92dbbf" className="bg-muted px-2 py-0.5 rounded">{item.event_type}</span>
                }
                  </div>
                </div>

                {/* Image count */}
                <div data-ev-id="ev_111af098ad" className="flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                  <ImageIcon className="w-3 h-3" />
                  {item.images?.length || 0} תמונות
                </div>

                {/* Status */}
                <button data-ev-id="ev_8f95757c91"
            onClick={() => togglePublish(item)}
            className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all hover:scale-105 ${
            item.is_published ?
            'bg-green-500/20 text-green-500 hover:bg-green-500/30' :
            'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30'}`
            }>

                  {item.is_published ? 'מפורסם' : 'טיוטה'}
                </button>

                {/* Actions */}
                <div data-ev-id="ev_aeb99b6cb4" className="flex items-center gap-2">
                  <button data-ev-id="ev_bfbf7ce14f"
              onClick={() => duplicateItem(item)}
              className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors text-blue-500"
              title="שכפל">

                    <Copy className="w-4 h-4" />
                  </button>
                  <button data-ev-id="ev_6bb18eb04b"
              onClick={() => openEditModal(item)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="ערוך">

                    <Edit className="w-4 h-4" />
                  </button>
                  <button data-ev-id="ev_a28b278913"
              onClick={() => deleteItem(item.id)}
              className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-500"
              title="מחק">

                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
          )}
          </div>
        }
      </div>

      {/* Modal */}
      {showModal &&
      <div data-ev-id="ev_efa4856ff9" className="fixed inset-0 bg-background z-50 overflow-y-auto">
          <div data-ev-id="ev_8722234a16" className="min-h-screen">
            <div data-ev-id="ev_1c2821a456" className="sticky top-0 bg-surface border-b border-border z-10">
              <div data-ev-id="ev_36d68a316f" className="container mx-auto px-4 py-4 flex items-center justify-between">
                <h2 data-ev-id="ev_e914506a66" className="text-xl font-bold text-foreground">
                  {editingItem ? 'עריכת אירוע' : 'אירוע חדש'}
                </h2>
                <div data-ev-id="ev_56679bbfff" className="flex items-center gap-3">
                  {saveSuccess && <span data-ev-id="ev_9c14d657fc" className="text-green-500 text-sm">✓ נשמר בהצלחה</span>}
                  <button data-ev-id="ev_ed7570566e"
                onClick={() => {setShowModal(false);setEditingItem(null);resetForm();}}
                className="p-2 hover:bg-muted rounded-lg transition-colors">

                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            <form data-ev-id="ev_bf0c6cccb5" onSubmit={handleSubmit} className="container mx-auto px-4 py-8 max-w-4xl">
              <div data-ev-id="ev_7e2278279d" className="flex flex-col gap-6">
                <div data-ev-id="ev_1947182858">
                  <label data-ev-id="ev_44d5e5c8a9" className="block text-sm font-medium text-foreground mb-2">כותרת *</label>
                  <input data-ev-id="ev_ca3784eff8"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-foreground"
                required />

                </div>

                <div data-ev-id="ev_2fa6948e1e">
                  <label data-ev-id="ev_4713ddf9c4" className="block text-sm font-medium text-foreground mb-2">תמונת שער</label>
                  <ImageUploader
                  value={formData.cover_image_url}
                  onChange={(url) => setFormData({ ...formData, cover_image_url: url })}
                  folder="historical-events" />

                </div>

                <div data-ev-id="ev_1ff392e81f">
                  <label data-ev-id="ev_580948ace5" className="block text-sm font-medium text-foreground mb-2">תיאור קצר</label>
                  <textarea data-ev-id="ev_e06ae7d338"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-foreground resize-none"
                rows={2} />

                </div>

                <div data-ev-id="ev_c9662cb496">
                  <label data-ev-id="ev_9f10b1ea04" className="block text-sm font-medium text-foreground mb-2">תוכן</label>
                  <RichTextEditor
                  value={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder="תוכן האירוע..." />

                </div>

                <div data-ev-id="ev_e2faf38bde" className="grid grid-cols-3 gap-4">
                  <div data-ev-id="ev_f4c7173610">
                    <label data-ev-id="ev_6c9c9486bb" className="block text-sm font-medium text-foreground mb-2">שנה עברית</label>
                    <input data-ev-id="ev_91ab57e9a5"
                  type="text"
                  value={formData.event_year_hebrew}
                  onChange={(e) => setFormData({ ...formData, event_year_hebrew: e.target.value })}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-foreground"
                  placeholder={'תשל"א'} />

                  </div>
                  <div data-ev-id="ev_70893fa935">
                    <label data-ev-id="ev_4146265917" className="block text-sm font-medium text-foreground mb-2">שנה לועזית</label>
                    <input data-ev-id="ev_825c4732a7"
                  type="number"
                  value={formData.event_year_gregorian || ''}
                  onChange={(e) => setFormData({ ...formData, event_year_gregorian: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-foreground"
                  placeholder="1970" />

                  </div>
                  <div data-ev-id="ev_c4a68c1527">
                    <label data-ev-id="ev_6f8c7f96fe" className="block text-sm font-medium text-foreground mb-2">עשור</label>
                    <select data-ev-id="ev_d5f7dea3d3"
                  value={formData.event_decade}
                  onChange={(e) => setFormData({ ...formData, event_decade: e.target.value })}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-foreground">

                      <option data-ev-id="ev_96b8f4609f" value="">בחר עשור</option>
                      {DECADES.map((decade) =>
                    <option data-ev-id="ev_c07b41d47e" key={decade} value={decade}>{decade}</option>
                    )}
                    </select>
                  </div>
                </div>

                <div data-ev-id="ev_88c4be5aea" className="grid grid-cols-2 gap-4">
                  <div data-ev-id="ev_58fd204385">
                    <label data-ev-id="ev_3475615047" className="block text-sm font-medium text-foreground mb-2">סוג אירוע</label>
                    <select data-ev-id="ev_8f14632460"
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-foreground">

                      <option data-ev-id="ev_716b277822" value="">בחר סוג</option>
                      {EVENT_TYPES.map((type) =>
                    <option data-ev-id="ev_9f86ac8e43" key={type} value={type}>{type}</option>
                    )}
                    </select>
                  </div>
                  <div data-ev-id="ev_82e9fe3460">
                    <label data-ev-id="ev_2c3646feeb" className="block text-sm font-medium text-foreground mb-2">מיקום</label>
                    <input data-ev-id="ev_fb92e52177"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-foreground"
                  placeholder="ירושלים, בני ברק..." />

                  </div>
                </div>

                <div data-ev-id="ev_50102818c6">
                  <label data-ev-id="ev_2096bba8dd" className="block text-sm font-medium text-foreground mb-2">חסידות</label>
                  <SmartAutocomplete
                  value={formData.chassidut}
                  onChange={(value) => setFormData({ ...formData, chassidut: value })}
                  options={chassiduyot.map((c) => ({ value: c.name, label: c.name }))}
                  onAddNew={addChassidut}
                  placeholder="בחר או הוסף חסידות" />

                </div>

                <div data-ev-id="ev_8cfaf5754d" className="grid grid-cols-2 gap-4">
                  <div data-ev-id="ev_5836f92895">
                    <label data-ev-id="ev_460e8ef7e6" className="block text-sm font-medium text-foreground mb-2">מחבר</label>
                    <SmartAutocomplete
                    value={formData.author}
                    onChange={(value) => setFormData({ ...formData, author: value })}
                    options={writers.map((w) => ({ value: w.name, label: w.name }))}
                    onAddNew={addWriter}
                    placeholder="בחר או הוסף מחבר" />

                  </div>
                  <div data-ev-id="ev_010429aa82">
                    <label data-ev-id="ev_b00c0f6114" className="block text-sm font-medium text-foreground mb-2">צלם</label>
                    <SmartAutocomplete
                    value={formData.photographer}
                    onChange={(value) => setFormData({ ...formData, photographer: value })}
                    options={photographers.map((p) => ({ value: p.name, label: p.name }))}
                    onAddNew={addPhotographer}
                    placeholder="בחר או הוסף צלם" />

                  </div>
                </div>

                {/* Images Section */}
                <div data-ev-id="ev_70e4e8835e">
                  <label data-ev-id="ev_ba247aba26" className="block text-sm font-medium text-foreground mb-2">תמונות נוספות</label>
                  <div data-ev-id="ev_a3164722b4" className="flex flex-col gap-4 p-4 bg-muted rounded-xl border border-border">
                    <div data-ev-id="ev_4adae6264d" className="flex flex-col gap-2">
                      <ImageUploader
                      value={newImageUrl}
                      onChange={setNewImageUrl}
                      folder="historical-events" />

                      {newImageUrl &&
                    <>
                          <input data-ev-id="ev_df23b5a641"
                      type="text"
                      value={newImageCaption}
                      onChange={(e) => setNewImageCaption(e.target.value)}
                      placeholder="כיתוב לתמונה"
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-foreground" />

                          <button data-ev-id="ev_eaccba3fc0"
                      type="button"
                      onClick={addImage}
                      className="self-start px-4 py-2 bg-secondary text-primary rounded-lg font-medium">

                            הוסף תמונה
                          </button>
                        </>
                    }
                    </div>

                    {formData.images.length > 0 &&
                  <div data-ev-id="ev_d1b5c709b1" className="flex flex-col gap-2 pt-4 border-t border-border">
                        {formData.images.map((img, index) =>
                    <div data-ev-id="ev_2d65cf78ba" key={index} className="flex items-center gap-3 p-2 bg-background rounded-lg">
                            <img data-ev-id="ev_edd04137d9" src={img.url} alt="" className="w-16 h-16 object-cover rounded" />
                            <div data-ev-id="ev_ede2a133eb" className="flex-1">
                              <p data-ev-id="ev_f6766a26f1" className="text-sm text-foreground truncate">{img.caption || 'ללא כיתוב'}</p>
                            </div>
                            <button data-ev-id="ev_ef3b7b6890"
                      type="button"
                      onClick={() => removeImage(index)}
                      className="p-1 text-red-500 hover:bg-red-500/10 rounded">

                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                    )}
                      </div>
                  }
                  </div>
                </div>

                <label data-ev-id="ev_fa4a8993c3" className="flex items-center gap-2 cursor-pointer">
                  <input data-ev-id="ev_ba49d0e0dc"
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                className="w-5 h-5 rounded border-border text-secondary focus:ring-secondary" />

                  <span data-ev-id="ev_09756a3994" className="text-foreground">פרסם</span>
                </label>

                <div data-ev-id="ev_814b380f08" className="flex justify-end gap-3 pt-4 border-t border-border">
                  <button data-ev-id="ev_f297ca9e84"
                type="button"
                onClick={() => {setShowModal(false);setEditingItem(null);resetForm();}}
                className="px-6 py-3 text-muted-foreground hover:text-foreground transition-colors">

                    ביטול
                  </button>
                  <button data-ev-id="ev_b99cbaa492"
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-secondary hover:bg-secondary-light text-primary font-bold px-6 py-3 rounded-xl transition-colors disabled:opacity-50">

                    {saving && <Loader2 className="w-5 h-5 animate-spin" />}
                    {editingItem ? 'עדכן' : 'צור'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      }
    </AdminLayout>);

}