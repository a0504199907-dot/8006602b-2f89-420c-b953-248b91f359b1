import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import ImageUploader from '@/components/ui/ImageUploader';
import RichTextEditor from '@/components/ui/RichTextEditor';
import SmartAutocomplete from '@/components/ui/SmartAutocomplete';
import { useHebrewDate } from '@/hooks/useHebrewDateFull';
import { usePhotographers } from '@/hooks/usePhotographers';
import { useChassiduyot } from '@/hooks/useChassiduyot';
import {
  Plus,
  Edit,
  Trash2,
  Eye as EyeIcon,
  Loader2,
  X,
  MapPin,
  Camera,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Copy } from

'lucide-react';

interface BeinItem {
  id: string;
  title: string;
  image_url: string;
  caption: string | null;
  short_text: string | null;
  description: string | null;
  hebrew_date: string | null;
  gregorian_date: string;
  photographer: string | null;
  location: string | null;
  chassidut: string | null;
  is_published: boolean;
  display_order: number;
  created_at: string;
}

export default function AdminBeinHatzibur() {
  const [items, setItems] = useState<BeinItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<BeinItem | null>(null);
  const [reordering, setReordering] = useState(false);
  const hebrewDate = useHebrewDate();
  const { photographers, addPhotographer } = usePhotographers();
  const { chassiduyot, addChassidut } = useChassiduyot();

  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    caption: '',
    short_text: '',
    description: '',
    hebrew_date: '',
    gregorian_date: new Date().toISOString().split('T')[0],
    photographer: '',
    location: '',
    chassidut: '',
    is_published: true
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
      from('bein_hatzibur').
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
        from('bein_hatzibur').
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
        image_url: formData.image_url,
        caption: formData.caption || null,
        short_text: formData.short_text || null,
        description: formData.description || null,
        hebrew_date: formData.hebrew_date || null,
        gregorian_date: formData.gregorian_date,
        photographer: formData.photographer || null,
        location: formData.location || null,
        chassidut: formData.chassidut || null,
        is_published: formData.is_published
      };

      if (editingItem) {
        const { error } = await supabase.
        from('bein_hatzibur').
        update(itemData).
        eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const maxOrder = items.length > 0 ? Math.max(...items.map((i) => i.display_order || 0)) : 0;
        const { error } = await supabase.
        from('bein_hatzibur').
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
    if (!confirm('האם למחוק את התמונה?')) return;
    if (!supabase) return;

    try {
      const { error } = await supabase.from('bein_hatzibur').delete().eq('id', id);
      if (error) throw error;
      setItems(items.filter((i) => i.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const duplicateItem = async (item: BeinItem) => {
    if (!supabase) return;

    try {
      const maxOrder = items.length > 0 ? Math.max(...items.map((i) => i.display_order || 0)) : 0;
      const { error } = await supabase.
      from('bein_hatzibur').
      insert({
        title: `${item.title} (עותק)`,
        image_url: item.image_url,
        caption: item.caption,
        short_text: item.short_text,
        description: item.description,
        hebrew_date: item.hebrew_date,
        gregorian_date: item.gregorian_date,
        photographer: item.photographer,
        location: item.location,
        chassidut: item.chassidut,
        is_published: false,
        display_order: maxOrder + 1
      });
      if (error) throw error;
      fetchItems();
    } catch (error) {
      console.error('Error duplicating item:', error);
    }
  };

  const togglePublish = async (item: BeinItem) => {
    if (!supabase) return;
    const newStatus = !item.is_published;
    setItems(items.map((i) => i.id === item.id ? { ...i, is_published: newStatus } : i));

    try {
      const { error } = await supabase.
      from('bein_hatzibur').
      update({ is_published: newStatus }).
      eq('id', item.id);
      if (error) throw error;
    } catch (error) {
      console.error('Error toggling publish:', error);
      setItems(items.map((i) => i.id === item.id ? { ...i, is_published: !newStatus } : i));
    }
  };

  const openEditModal = (item: BeinItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      image_url: item.image_url,
      caption: item.caption || '',
      short_text: item.short_text || '',
      description: item.description || '',
      hebrew_date: item.hebrew_date || '',
      gregorian_date: item.gregorian_date,
      photographer: item.photographer || '',
      location: item.location || '',
      chassidut: item.chassidut || '',
      is_published: item.is_published
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      image_url: '',
      caption: '',
      short_text: '',
      description: '',
      hebrew_date: hebrewDate.hebrewFull,
      gregorian_date: new Date().toISOString().split('T')[0],
      photographer: '',
      location: '',
      chassidut: '',
      is_published: true
    });
  };

  return (
    <AdminLayout>
      <div data-ev-id="ev_21ef89a5eb" className="flex flex-col gap-6">
        {/* Header */}
        <div data-ev-id="ev_6619d18b03" className="flex items-center justify-between">
          <div data-ev-id="ev_7b179beb99">
            <h1 data-ev-id="ev_f056ce6cb8" className="text-2xl font-bold text-foreground font-serif">בעין הציבור</h1>
            <p data-ev-id="ev_80e73c02c6" className="text-muted-foreground mt-1">תמונות עם כמה שורות טקסט</p>
          </div>
          <button data-ev-id="ev_592882b9eb"
          onClick={() => {resetForm();setEditingItem(null);setShowModal(true);}}
          className="flex items-center gap-2 bg-secondary hover:bg-secondary-light text-primary font-bold px-5 py-2.5 rounded-xl transition-colors">

            <Plus className="w-5 h-5" />
            תמונה חדשה
          </button>
        </div>

        {/* Reorder hint */}
        {items.length > 1 &&
        <div data-ev-id="ev_cdd0d7f4c4" className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
            <ArrowUpDown className="w-4 h-4" />
            <span data-ev-id="ev_d3c5ca03a5">השתמש בחיצים כדי לשנות את סדר התמונות</span>
          </div>
        }

        {/* Items Grid */}
        {loading ?
        <div data-ev-id="ev_c4daa377e7" className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-secondary animate-spin" />
          </div> :
        items.length === 0 ?
        <div data-ev-id="ev_8a216db34f" className="text-center py-20 bg-surface rounded-2xl border border-border">
            <EyeIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p data-ev-id="ev_66acd26bcc" className="text-muted-foreground">אין תמונות להצגה</p>
          </div> :

        <div data-ev-id="ev_76e0095f2a" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item, idx) =>
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.03 }}
            className="bg-surface rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow group relative">

                {/* Reorder buttons */}
                <div data-ev-id="ev_b49d1c02b7" className="absolute top-2 right-2 z-10 flex flex-col gap-1 bg-black/50 rounded-lg p-1">
                  <button data-ev-id="ev_fd2d0fa73a"
              onClick={() => moveItem(idx, 'up')}
              disabled={idx === 0 || reordering}
              className={`p-1 rounded transition-colors ${idx === 0 ? 'text-white/30 cursor-not-allowed' : 'text-white hover:bg-white/20'}`}
              title="העבר למעלה">

                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button data-ev-id="ev_31d459aff0"
              onClick={() => moveItem(idx, 'down')}
              disabled={idx === items.length - 1 || reordering}
              className={`p-1 rounded transition-colors ${idx === items.length - 1 ? 'text-white/30 cursor-not-allowed' : 'text-white hover:bg-white/20'}`}
              title="העבר למטה">

                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Image */}
                <div data-ev-id="ev_2da6f57b57" className="aspect-square relative overflow-hidden">
                  <img data-ev-id="ev_472a5fd965"
              src={item.image_url}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />


                  {/* Overlay */}
                  <div data-ev-id="ev_0092822490" className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div data-ev-id="ev_71e2a595a1" className="absolute bottom-3 right-3 left-3">
                      <p data-ev-id="ev_9d391b7370" className="text-white text-sm line-clamp-2">{item.short_text}</p>
                    </div>
                  </div>

                  {/* Status badge */}
                  <button data-ev-id="ev_55d331a782"
              onClick={() => togglePublish(item)}
              className={`absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-bold transition-all hover:scale-105 ${
              item.is_published ?
              'bg-green-500 text-white hover:bg-green-600' :
              'bg-orange-500 text-white hover:bg-orange-600'}`
              }>

                    {item.is_published ? 'מפורסם' : 'טיוטה'}
                  </button>
                </div>

                {/* Info */}
                <div data-ev-id="ev_ff180cee1b" className="p-3">
                  <h3 data-ev-id="ev_5422adf46a" className="font-bold text-foreground text-sm line-clamp-1">{item.title}</h3>
                  <div data-ev-id="ev_0ed19ff773" className="flex items-center justify-between mt-2">
                    <span data-ev-id="ev_09f685fa7f" className="text-xs text-muted-foreground">{item.hebrew_date}</span>
                    <div data-ev-id="ev_9aeac0927e" className="flex items-center gap-1">
                      <button data-ev-id="ev_8a3a77e595"
                  onClick={() => duplicateItem(item)}
                  className="p-1.5 hover:bg-blue-500/10 rounded transition-colors text-blue-500"
                  title="שכפל">

                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button data-ev-id="ev_f9de9f4458"
                  onClick={() => openEditModal(item)}
                  className="p-1.5 hover:bg-muted rounded transition-colors"
                  title="ערוך">

                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button data-ev-id="ev_6c24162b0e"
                  onClick={() => deleteItem(item.id)}
                  className="p-1.5 hover:bg-red-500/10 rounded transition-colors text-red-500"
                  title="מחק">

                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
          )}
          </div>
        }
      </div>

      {/* Modal */}
      {showModal &&
      <div data-ev-id="ev_457c20a982" className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

            <div data-ev-id="ev_4c183a1580" className="flex items-center justify-between p-6 border-b border-border">
              <h2 data-ev-id="ev_e4f5a17ee0" className="text-xl font-bold text-foreground">
                {editingItem ? 'עריכת תמונה' : 'תמונה חדשה'}
              </h2>
              <div data-ev-id="ev_79c31af4b7" className="flex items-center gap-2">
                {saveSuccess && <span data-ev-id="ev_a7d215b0ad" className="text-green-500 text-sm">✓ נשמר</span>}
                <button data-ev-id="ev_a1be6dfbb6" onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form data-ev-id="ev_bdf0748f8a" onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div data-ev-id="ev_041ef265fd">
                <label data-ev-id="ev_c6a3fe422d" className="block text-sm font-medium mb-2">כותרת</label>
                <input data-ev-id="ev_27c62b814c"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4"
              required />

              </div>

              <div data-ev-id="ev_d615b751c3">
                <label data-ev-id="ev_17835fbbc5" className="block text-sm font-medium mb-2">תמונה</label>
                <ImageUploader
                value={formData.image_url}
                onChange={(url) => setFormData((prev) => ({ ...prev, image_url: url }))}
                placeholder="העלה תמונה" />

              </div>

              <div data-ev-id="ev_8962d95c59">
                <label data-ev-id="ev_e98eb64ed3" className="block text-sm font-medium mb-2">כיתוב קצר</label>
                <input data-ev-id="ev_db5a517933"
              type="text"
              value={formData.short_text}
              onChange={(e) => setFormData((prev) => ({ ...prev, short_text: e.target.value }))}
              className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4"
              placeholder="טקסט שיופיע מתחת לתמונה" />

              </div>

              <div data-ev-id="ev_651cccde15">
                <label data-ev-id="ev_b464d1bed7" className="block text-sm font-medium mb-2">תיאור מלא</label>
                <RichTextEditor
                value={formData.description}
                onChange={(content) => setFormData((prev) => ({ ...prev, description: content }))}
                placeholder="תיאור מפורט..." />

              </div>

              <div data-ev-id="ev_8a6e966d15" className="grid grid-cols-2 gap-4">
                <div data-ev-id="ev_c89154049d">
                  <label data-ev-id="ev_4ea123ac93" className="block text-sm font-medium mb-2">תאריך עברי</label>
                  <input data-ev-id="ev_c57c692c93"
                type="text"
                value={formData.hebrew_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, hebrew_date: e.target.value }))}
                className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4" />

                </div>
                <div data-ev-id="ev_a8a3d58202">
                  <label data-ev-id="ev_e8dabe6f51" className="block text-sm font-medium mb-2">תאריך לועזי</label>
                  <input data-ev-id="ev_be6c3e0ec3"
                type="date"
                value={formData.gregorian_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, gregorian_date: e.target.value }))}
                className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4" />

                </div>
              </div>

              <div data-ev-id="ev_efa2e540c0">
                <label data-ev-id="ev_c64d615d40" className="block text-sm font-medium mb-2">צלם</label>
                <SmartAutocomplete
                value={formData.photographer}
                onChange={(value) => setFormData((prev) => ({ ...prev, photographer: value }))}
                options={photographers.map((p) => ({ value: p.name, label: p.name }))}
                onAddNew={addPhotographer}
                placeholder="בחר או הוסף צלם" />

              </div>

              <div data-ev-id="ev_6dec2e7683" className="grid grid-cols-2 gap-4">
                <div data-ev-id="ev_5722862189">
                  <label data-ev-id="ev_3feaa081f5" className="block text-sm font-medium mb-2">מיקום</label>
                  <input data-ev-id="ev_4ff7f19689"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4"
                placeholder="ירושלים, בני ברק..." />

                </div>
                <div data-ev-id="ev_848347e431">
                  <label data-ev-id="ev_5e2e66d8cc" className="block text-sm font-medium mb-2">חסידות</label>
                  <SmartAutocomplete
                  value={formData.chassidut}
                  onChange={(value) => setFormData((prev) => ({ ...prev, chassidut: value }))}
                  options={chassiduyot.map((c) => ({ value: c.name, label: c.name }))}
                  onAddNew={addChassidut}
                  placeholder="בחר חסידות" />

                </div>
              </div>

              <label data-ev-id="ev_1eb7e9c6e4" className="flex items-center gap-2 cursor-pointer">
                <input data-ev-id="ev_c77fee8cd7"
              type="checkbox"
              checked={formData.is_published}
              onChange={(e) => setFormData((prev) => ({ ...prev, is_published: e.target.checked }))}
              className="w-5 h-5 rounded border-border text-secondary focus:ring-secondary" />

                <span data-ev-id="ev_bfb530c2e5">פרסם</span>
              </label>

              <div data-ev-id="ev_050434db6b" className="flex justify-end gap-3 pt-4 border-t border-border">
                <button data-ev-id="ev_10aaf5b482"
              type="button"
              onClick={() => {setShowModal(false);setEditingItem(null);resetForm();}}
              className="px-6 py-2.5 text-muted-foreground hover:text-foreground transition-colors">

                  ביטול
                </button>
                <button data-ev-id="ev_412d7d2b8a"
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-secondary hover:bg-secondary-light text-primary font-bold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50">

                  {saving && <Loader2 className="w-5 h-5 animate-spin" />}
                  {editingItem ? 'עדכן' : 'צור'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      }
    </AdminLayout>);

}