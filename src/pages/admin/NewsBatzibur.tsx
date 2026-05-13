import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import ImageUploader from '@/components/ui/ImageUploader';
import RichTextEditor from '@/components/ui/RichTextEditor';
import SmartAutocomplete from '@/components/ui/SmartAutocomplete';
import { useHebrewDate } from '@/hooks/useHebrewDateFull';
import { useChassiduyot } from '@/hooks/useChassiduyot';
import { useWriters } from '@/hooks/useWriters';
import {
  Plus,
  Edit,
  Trash2,
  Newspaper,
  Loader2,
  X,
  Eye,
  Star,
  Calendar,
  User,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Copy } from
'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  content: string;
  hebrew_date: string | null;
  gregorian_date: string;
  chassidut: string | null;
  location: string | null;
  author: string | null;
  is_published: boolean;
  is_featured: boolean;
  views: number;
  display_order: number;
  created_at: string;
}

export default function AdminNewsBatzibur() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [reordering, setReordering] = useState(false);
  const hebrewDate = useHebrewDate();
  const { chassiduyot, addChassidut } = useChassiduyot();
  const { writers, addWriter } = useWriters();

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    content: '',
    hebrew_date: '',
    gregorian_date: new Date().toISOString().split('T')[0],
    chassidut: '',
    location: '',
    author: '',
    is_published: true,
    is_featured: false
  });

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (!editingItem) {
      setFormData((prev) => ({
        ...prev,
        hebrew_date: hebrewDate.hebrewFull
      }));
    }
  }, [hebrewDate, editingItem]);

  const fetchItems = async () => {
    if (!supabase) {setLoading(false);return;}

    try {
      const { data, error } = await supabase.
      from('news_batzibur').
      select('*').
      order('display_order', { ascending: false }).
      order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
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
        from('news_batzibur').
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
        subtitle: formData.subtitle || null,
        image_url: formData.image_url || null,
        content: formData.content,
        hebrew_date: formData.hebrew_date || null,
        gregorian_date: formData.gregorian_date,
        chassidut: formData.chassidut || null,
        location: formData.location || null,
        author: formData.author || null,
        is_published: formData.is_published,
        is_featured: formData.is_featured
      };

      if (editingItem) {
        const { error } = await supabase.
        from('news_batzibur').
        update(itemData).
        eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const maxOrder = items.length > 0 ? Math.max(...items.map((i) => i.display_order || 0)) : 0;
        const { error } = await supabase.
        from('news_batzibur').
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
    if (!confirm('האם למחוק את הפריט?')) return;
    if (!supabase) return;

    try {
      const { error } = await supabase.from('news_batzibur').delete().eq('id', id);
      if (error) throw error;
      setItems(items.filter((i) => i.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const duplicateItem = async (item: NewsItem) => {
    if (!supabase) return;

    try {
      const maxOrder = items.length > 0 ? Math.max(...items.map((i) => i.display_order || 0)) : 0;
      const { error } = await supabase.
      from('news_batzibur').
      insert({
        title: `${item.title} (עותק)`,
        subtitle: item.subtitle,
        image_url: item.image_url,
        content: item.content,
        hebrew_date: item.hebrew_date,
        gregorian_date: item.gregorian_date,
        chassidut: item.chassidut,
        location: item.location,
        author: item.author,
        is_published: false,
        is_featured: false,
        display_order: maxOrder + 1
      });
      if (error) throw error;
      fetchItems();
    } catch (error) {
      console.error('Error duplicating item:', error);
    }
  };

  const togglePublish = async (item: NewsItem) => {
    if (!supabase) return;
    const newStatus = !item.is_published;
    setItems(items.map((i) => i.id === item.id ? { ...i, is_published: newStatus } : i));

    try {
      const { error } = await supabase.
      from('news_batzibur').
      update({ is_published: newStatus }).
      eq('id', item.id);
      if (error) throw error;
    } catch (error) {
      console.error('Error toggling publish:', error);
      setItems(items.map((i) => i.id === item.id ? { ...i, is_published: !newStatus } : i));
    }
  };

  const openEditModal = (item: NewsItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      subtitle: item.subtitle || '',
      image_url: item.image_url || '',
      content: item.content || '',
      hebrew_date: item.hebrew_date || '',
      gregorian_date: item.gregorian_date,
      chassidut: item.chassidut || '',
      location: item.location || '',
      author: item.author || '',
      is_published: item.is_published,
      is_featured: item.is_featured
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      image_url: '',
      content: '',
      hebrew_date: hebrewDate.hebrewFull,
      gregorian_date: new Date().toISOString().split('T')[0],
      chassidut: '',
      location: '',
      author: '',
      is_published: true,
      is_featured: false
    });
  };

  return (
    <AdminLayout>
      <div data-ev-id="ev_4c7bbb2639" className="flex flex-col gap-6">
        {/* Header */}
        <div data-ev-id="ev_29bd7f0a24" className="flex items-center justify-between">
          <div data-ev-id="ev_db30bdc55d">
            <h1 data-ev-id="ev_d202346db1" className="text-2xl font-bold text-foreground font-serif">ניוז בציבור</h1>
            <p data-ev-id="ev_7a15f052e8" className="text-muted-foreground mt-1">חדשות מהעולם החסידי</p>
          </div>
          <button data-ev-id="ev_b1a022a6db"
          onClick={() => {resetForm();setEditingItem(null);setShowModal(true);}}
          className="flex items-center gap-2 bg-secondary hover:bg-secondary-light text-primary font-bold px-5 py-2.5 rounded-xl transition-colors">

            <Plus className="w-5 h-5" />
            חדשות חדשה
          </button>
        </div>

        {/* Reorder hint */}
        {items.length > 1 &&
        <div data-ev-id="ev_97459841bb" className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
            <ArrowUpDown className="w-4 h-4" />
            <span data-ev-id="ev_6b5798b096">השתמש בחיצים כדי לשנות את סדר הפריטים</span>
          </div>
        }

        {/* Items List */}
        {loading ?
        <div data-ev-id="ev_5b7fc64785" className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-secondary animate-spin" />
          </div> :
        items.length === 0 ?
        <div data-ev-id="ev_6c5602b2b5" className="text-center py-20 bg-surface rounded-2xl border border-border">
            <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p data-ev-id="ev_9a806af282" className="text-muted-foreground">אין פריטים להצגה</p>
          </div> :

        <div data-ev-id="ev_151ee7ca7e" className="bg-surface rounded-2xl border border-border overflow-hidden">
            {items.map((item, idx) =>
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`flex items-center gap-4 p-5 ${idx !== items.length - 1 ? 'border-b border-border' : ''}`}>

                {/* Reorder buttons */}
                <div data-ev-id="ev_02c0b0d818" className="flex flex-col gap-1">
                  <button data-ev-id="ev_4a42fc008a"
              onClick={() => moveItem(idx, 'up')}
              disabled={idx === 0 || reordering}
              className={`p-1 rounded transition-colors ${idx === 0 ? 'text-muted-foreground/30 cursor-not-allowed' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
              title="העבר למעלה">

                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button data-ev-id="ev_e255f0b73b"
              onClick={() => moveItem(idx, 'down')}
              disabled={idx === items.length - 1 || reordering}
              className={`p-1 rounded transition-colors ${idx === items.length - 1 ? 'text-muted-foreground/30 cursor-not-allowed' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
              title="העבר למטה">

                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Thumbnail */}
                <div data-ev-id="ev_0ae5a6330b" className="w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0">
                  {item.image_url ?
              <img data-ev-id="ev_dc19bf1a8b" src={item.image_url} alt="" className="w-full h-full object-cover" /> :

              <div data-ev-id="ev_53d32fe07d" className="w-full h-full flex items-center justify-center">
                      <Newspaper className="w-8 h-8 text-muted-foreground" />
                    </div>
              }
                </div>

                {/* Info */}
                <div data-ev-id="ev_c739539482" className="flex-1 min-w-0">
                  <div data-ev-id="ev_4cb8523a61" className="flex items-center gap-2 mb-1">
                    {item.is_featured && <Star className="w-4 h-4 text-secondary fill-secondary" />}
                    <h3 data-ev-id="ev_f2f41d43b1" className="font-bold text-foreground truncate">{item.title}</h3>
                  </div>
                  {item.subtitle &&
              <p data-ev-id="ev_146135ce59" className="text-sm text-muted-foreground truncate">{item.subtitle}</p>
              }
                  <div data-ev-id="ev_70761f8333" className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span data-ev-id="ev_2790626a7d" className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {item.hebrew_date || item.gregorian_date}
                    </span>
                    <span data-ev-id="ev_9967fc6a51" className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {item.views} צפיות
                    </span>
                    {item.author &&
                <span data-ev-id="ev_c1bafa7a3b" className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {item.author}
                      </span>
                }
                  </div>
                </div>

                {/* Status */}
                <button data-ev-id="ev_4648178875"
            onClick={() => togglePublish(item)}
            className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all hover:scale-105 ${
            item.is_published ?
            'bg-green-500/20 text-green-500 hover:bg-green-500/30' :
            'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30'}`
            }>

                  {item.is_published ? 'מפורסם' : 'טיוטה'}
                </button>

                {/* Actions */}
                <div data-ev-id="ev_6cea70e821" className="flex items-center gap-2">
                  <button data-ev-id="ev_1d0023e9b5"
              onClick={() => duplicateItem(item)}
              className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors text-blue-500"
              title="שכפל">

                    <Copy className="w-4 h-4" />
                  </button>
                  <button data-ev-id="ev_cb45591df1"
              onClick={() => openEditModal(item)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="ערוך">

                    <Edit className="w-4 h-4" />
                  </button>
                  <button data-ev-id="ev_12019a1529"
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
      <div data-ev-id="ev_7a463d553a" className="fixed inset-0 bg-background z-50 overflow-y-auto">
          <div data-ev-id="ev_00697ccde6" className="min-h-screen">
            <div data-ev-id="ev_9a74182f92" className="sticky top-0 bg-surface border-b border-border z-10">
              <div data-ev-id="ev_c864b5bbc9" className="container mx-auto px-4 py-4 flex items-center justify-between">
                <h2 data-ev-id="ev_4a8bf52cfc" className="text-xl font-bold text-foreground">
                  {editingItem ? 'עריכת חדשות' : 'חדשות חדשה'}
                </h2>
                <div data-ev-id="ev_9e8ebac8a8" className="flex items-center gap-3">
                  {saveSuccess && <span data-ev-id="ev_32b243dec3" className="text-green-500 text-sm">✓ נשמר בהצלחה</span>}
                  <button data-ev-id="ev_1ce0c9d8c1"
                onClick={() => {setShowModal(false);setEditingItem(null);resetForm();}}
                className="p-2 hover:bg-muted rounded-lg transition-colors">

                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            <form data-ev-id="ev_43d7315667" onSubmit={handleSubmit} className="container mx-auto px-4 py-8 max-w-4xl">
              <div data-ev-id="ev_58e58f7c61" className="flex flex-col gap-6">
                <div data-ev-id="ev_4b0a1c14ac">
                  <label data-ev-id="ev_b42071fc96" className="block text-sm font-medium text-foreground mb-2">כותרת *</label>
                  <input data-ev-id="ev_acf394e26c"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-foreground"
                required />

                </div>

                <div data-ev-id="ev_3e9c9f68b5">
                  <label data-ev-id="ev_cc560d1dee" className="block text-sm font-medium text-foreground mb-2">תקציר</label>
                  <textarea data-ev-id="ev_792706ef96"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-foreground resize-none"
                rows={2} />

                </div>

                <div data-ev-id="ev_fa11ab3e0a">
                  <label data-ev-id="ev_7ba5eb5069" className="block text-sm font-medium text-foreground mb-2">תמונה</label>
                  <ImageUploader
                  value={formData.image_url}
                  onChange={(url) => setFormData({ ...formData, image_url: url })}
                  folder="news-batzibur" />

                </div>

                <div data-ev-id="ev_dddabed410">
                  <label data-ev-id="ev_e066b1a2fc" className="block text-sm font-medium text-foreground mb-2">תוכן</label>
                  <RichTextEditor
                  value={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder="כתוב את תוכן החדשות..." />

                </div>

                <div data-ev-id="ev_3a28303256">
                  <label data-ev-id="ev_89ddef9a75" className="block text-sm font-medium text-foreground mb-2">מחבר</label>
                  <SmartAutocomplete
                  value={formData.author}
                  onChange={(value) => setFormData({ ...formData, author: value })}
                  options={writers.map((w) => ({ value: w.name, label: w.name }))}
                  onAddNew={addWriter}
                  placeholder="בחר או הוסף מחבר" />

                </div>

                <div data-ev-id="ev_acea15025a" className="grid grid-cols-2 gap-4">
                  <div data-ev-id="ev_24c63864ab">
                    <label data-ev-id="ev_f98f782e22" className="block text-sm font-medium text-foreground mb-2">תאריך עברי</label>
                    <input data-ev-id="ev_55800db6f9"
                  type="text"
                  value={formData.hebrew_date}
                  onChange={(e) => setFormData({ ...formData, hebrew_date: e.target.value })}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-foreground" />

                  </div>
                  <div data-ev-id="ev_4630439132">
                    <label data-ev-id="ev_53d077dc13" className="block text-sm font-medium text-foreground mb-2">תאריך לועזי</label>
                    <input data-ev-id="ev_c088f9d908"
                  type="date"
                  value={formData.gregorian_date}
                  onChange={(e) => setFormData({ ...formData, gregorian_date: e.target.value })}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-foreground" />

                  </div>
                </div>

                <div data-ev-id="ev_409d9c9480" className="grid grid-cols-2 gap-4">
                  <div data-ev-id="ev_c666da446f">
                    <label data-ev-id="ev_a3c90c9668" className="block text-sm font-medium text-foreground mb-2">חסידות</label>
                    <SmartAutocomplete
                    value={formData.chassidut}
                    onChange={(value) => setFormData({ ...formData, chassidut: value })}
                    options={chassiduyot.map((c) => ({ value: c.name, label: c.name }))}
                    onAddNew={addChassidut}
                    placeholder="בחר או הוסף חסידות" />

                  </div>
                  <div data-ev-id="ev_1e54a7a2ee">
                    <label data-ev-id="ev_fddf54679b" className="block text-sm font-medium text-foreground mb-2">מיקום</label>
                    <input data-ev-id="ev_eb615e4db6"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-foreground"
                  placeholder="ירושלים, בני ברק..." />

                  </div>
                </div>

                <div data-ev-id="ev_5a751b510b" className="flex items-center gap-6">
                  <label data-ev-id="ev_c24363ff0d" className="flex items-center gap-2 cursor-pointer">
                    <input data-ev-id="ev_e84c10e6ee"
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="w-5 h-5 rounded border-border text-secondary focus:ring-secondary" />

                    <span data-ev-id="ev_8ca777d004" className="text-foreground">פרסם</span>
                  </label>
                  <label data-ev-id="ev_61ac626128" className="flex items-center gap-2 cursor-pointer">
                    <input data-ev-id="ev_3ccd34674c"
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-5 h-5 rounded border-border text-secondary focus:ring-secondary" />

                    <span data-ev-id="ev_8f75910a3d" className="text-foreground">מובלט</span>
                  </label>
                </div>

                <div data-ev-id="ev_b59a6075f4" className="flex justify-end gap-3 pt-4 border-t border-border">
                  <button data-ev-id="ev_cf2fff19db"
                type="button"
                onClick={() => {setShowModal(false);setEditingItem(null);resetForm();}}
                className="px-6 py-3 text-muted-foreground hover:text-foreground transition-colors">

                    ביטול
                  </button>
                  <button data-ev-id="ev_6572df002c"
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