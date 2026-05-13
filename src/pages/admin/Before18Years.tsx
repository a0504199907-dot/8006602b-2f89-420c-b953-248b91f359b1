import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import ImageUploader from '@/components/ui/ImageUploader';
import RichTextEditor from '@/components/ui/RichTextEditor';
import SmartAutocomplete from '@/components/ui/SmartAutocomplete';
import { useWriters } from '@/hooks/useWriters';
import { usePhotographers } from '@/hooks/usePhotographers';
import {
  Plus,
  Edit,
  Trash2,
  Clock,
  Loader2,
  X,
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

interface Before18Item {
  id: string;
  title: string;
  week_parasha: string;
  year_hebrew: string;
  year_gregorian: number;
  description: string | null;
  images: ImageWithCaption[];
  author: string | null;
  photographer: string | null;
  is_published: boolean;
  display_order: number;
  created_at: string;
}

export default function AdminBefore18Years() {
  const [items, setItems] = useState<Before18Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Before18Item | null>(null);
  const [reordering, setReordering] = useState(false);
  const { writers, addWriter } = useWriters();
  const { photographers, addPhotographer } = usePhotographers();

  const currentYear = new Date().getFullYear();
  const targetYear = currentYear - 18;

  const [formData, setFormData] = useState({
    title: '',
    week_parasha: '',
    year_hebrew: `תשס"ז`,
    year_gregorian: targetYear,
    description: '',
    images: [] as ImageWithCaption[],
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
      from('before_18_years').
      select('*').
      order('display_order', { ascending: false }).
      order('created_at', { ascending: false });

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
        from('before_18_years').
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

    try {
      setSaving(true);
      setSaveSuccess(false);

      const itemData = {
        title: formData.title,
        week_parasha: formData.week_parasha,
        year_hebrew: formData.year_hebrew,
        year_gregorian: formData.year_gregorian,
        description: formData.description || null,
        images: formData.images,
        author: formData.author || null,
        photographer: formData.photographer || null,
        is_published: formData.is_published
      };

      if (editingItem) {
        const { error } = await supabase.
        from('before_18_years').
        update(itemData).
        eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const maxOrder = items.length > 0 ? Math.max(...items.map((i) => i.display_order || 0)) : 0;
        const { error } = await supabase.
        from('before_18_years').
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
      const { error } = await supabase.from('before_18_years').delete().eq('id', id);
      if (error) throw error;
      setItems(items.filter((i) => i.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const duplicateItem = async (item: Before18Item) => {
    if (!supabase) return;

    try {
      const maxOrder = items.length > 0 ? Math.max(...items.map((i) => i.display_order || 0)) : 0;
      const { error } = await supabase.
      from('before_18_years').
      insert({
        title: `${item.title} (עותק)`,
        week_parasha: item.week_parasha,
        year_hebrew: item.year_hebrew,
        year_gregorian: item.year_gregorian,
        description: item.description,
        images: item.images,
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

  const togglePublish = async (item: Before18Item) => {
    if (!supabase) return;
    const newStatus = !item.is_published;
    setItems(items.map((i) => i.id === item.id ? { ...i, is_published: newStatus } : i));

    try {
      const { error } = await supabase.
      from('before_18_years').
      update({ is_published: newStatus }).
      eq('id', item.id);
      if (error) throw error;
    } catch (error) {
      console.error('Error toggling publish:', error);
      setItems(items.map((i) => i.id === item.id ? { ...i, is_published: !newStatus } : i));
    }
  };

  const openEditModal = (item: Before18Item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      week_parasha: item.week_parasha,
      year_hebrew: item.year_hebrew,
      year_gregorian: item.year_gregorian,
      description: item.description || '',
      images: item.images || [],
      author: item.author || '',
      photographer: item.photographer || '',
      is_published: item.is_published
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      week_parasha: '',
      year_hebrew: `תשס"ז`,
      year_gregorian: targetYear,
      description: '',
      images: [],
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
      <div data-ev-id="ev_85581285c1" className="flex flex-col gap-6">
        {/* Header */}
        <div data-ev-id="ev_aaadc6321b" className="flex items-center justify-between">
          <div data-ev-id="ev_0e3a1ed645">
            <h1 data-ev-id="ev_1a2a120fcb" className="text-2xl font-bold text-foreground font-serif">לפני 18 שנה</h1>
            <p data-ev-id="ev_f41eead9c7" className="text-muted-foreground mt-1">תמונות מהעבר מלפני 18 שנה</p>
          </div>
          <button data-ev-id="ev_f098eb25a8"
          onClick={() => {resetForm();setEditingItem(null);setShowModal(true);}}
          className="flex items-center gap-2 bg-secondary hover:bg-secondary-light text-primary font-bold px-5 py-2.5 rounded-xl transition-colors">

            <Plus className="w-5 h-5" />
            פריט חדש
          </button>
        </div>

        {/* Reorder hint */}
        {items.length > 1 &&
        <div data-ev-id="ev_ebd133bf27" className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
            <ArrowUpDown className="w-4 h-4" />
            <span data-ev-id="ev_54c8f5156b">השתמש בחיצים כדי לשנות את סדר הפריטים</span>
          </div>
        }

        {/* Items List */}
        {loading ?
        <div data-ev-id="ev_eb101437f3" className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-secondary animate-spin" />
          </div> :
        items.length === 0 ?
        <div data-ev-id="ev_b7db85967e" className="text-center py-20 bg-surface rounded-2xl border border-border">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p data-ev-id="ev_ab4aaf96ff" className="text-muted-foreground">אין פריטים להצגה</p>
          </div> :

        <div data-ev-id="ev_504e235469" className="bg-surface rounded-2xl border border-border overflow-hidden">
            {items.map((item, idx) =>
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`flex items-center gap-4 p-5 ${idx !== items.length - 1 ? 'border-b border-border' : ''}`}>

                {/* Reorder buttons */}
                <div data-ev-id="ev_7e07473ebb" className="flex flex-col gap-1">
                  <button data-ev-id="ev_41459ab3bb"
              onClick={() => moveItem(idx, 'up')}
              disabled={idx === 0 || reordering}
              className={`p-1 rounded transition-colors ${idx === 0 ? 'text-muted-foreground/30 cursor-not-allowed' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
              title="העבר למעלה">

                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button data-ev-id="ev_2a3fb33673"
              onClick={() => moveItem(idx, 'down')}
              disabled={idx === items.length - 1 || reordering}
              className={`p-1 rounded transition-colors ${idx === items.length - 1 ? 'text-muted-foreground/30 cursor-not-allowed' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
              title="העבר למטה">

                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Thumbnail */}
                <div data-ev-id="ev_fa31b7abda" className="w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0">
                  {item.images && item.images.length > 0 ?
              <img data-ev-id="ev_cf7dd9af3a" src={item.images[0].url} alt="" className="w-full h-full object-cover" /> :

              <div data-ev-id="ev_b651dcaddd" className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
              }
                </div>

                {/* Info */}
                <div data-ev-id="ev_4c50d01837" className="flex-1 min-w-0">
                  <h3 data-ev-id="ev_c0b8f49c8f" className="font-bold text-foreground truncate">{item.title}</h3>
                  <div data-ev-id="ev_b0aa7c80e0" className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span data-ev-id="ev_39bbcd2f92" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.year_hebrew} ({item.year_gregorian})
                    </span>
                    <span data-ev-id="ev_ef22086965">{item.week_parasha}</span>
                    {item.author &&
                <span data-ev-id="ev_a2b7128bfe" className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {item.author}
                      </span>
                }
                    {item.photographer &&
                <span data-ev-id="ev_47d747f2ba" className="flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        {item.photographer}
                      </span>
                }
                  </div>
                </div>

                {/* Image count */}
                <div data-ev-id="ev_19b2912aad" className="flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                  <ImageIcon className="w-3 h-3" />
                  {item.images?.length || 0} תמונות
                </div>

                {/* Status */}
                <button data-ev-id="ev_00ce892a8f"
            onClick={() => togglePublish(item)}
            className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all hover:scale-105 ${
            item.is_published ?
            'bg-green-500/20 text-green-500 hover:bg-green-500/30' :
            'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30'}`
            }>

                  {item.is_published ? 'מפורסם' : 'טיוטה'}
                </button>

                {/* Actions */}
                <div data-ev-id="ev_2211867076" className="flex items-center gap-2">
                  <button data-ev-id="ev_9f5e2d83e9"
              onClick={() => duplicateItem(item)}
              className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors text-blue-500"
              title="שכפל">

                    <Copy className="w-4 h-4" />
                  </button>
                  <button data-ev-id="ev_6eb6cdfcb1"
              onClick={() => openEditModal(item)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="ערוך">

                    <Edit className="w-4 h-4" />
                  </button>
                  <button data-ev-id="ev_4e6ddb5456"
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
      <div data-ev-id="ev_6e31980c24" className="fixed inset-0 bg-background z-50 overflow-y-auto">
          <div data-ev-id="ev_91869bd257" className="min-h-screen">
            <div data-ev-id="ev_c5d35c9446" className="sticky top-0 bg-surface border-b border-border z-10">
              <div data-ev-id="ev_aea259ca73" className="container mx-auto px-4 py-4 flex items-center justify-between">
                <h2 data-ev-id="ev_1bb0974a55" className="text-xl font-bold text-foreground">
                  {editingItem ? 'עריכת פריט' : 'פריט חדש'}
                </h2>
                <div data-ev-id="ev_a3e477f069" className="flex items-center gap-3">
                  {saveSuccess && <span data-ev-id="ev_ca7c07592a" className="text-green-500 text-sm">✓ נשמר בהצלחה</span>}
                  <button data-ev-id="ev_315ab3c3b2"
                onClick={() => {setShowModal(false);setEditingItem(null);resetForm();}}
                className="p-2 hover:bg-muted rounded-lg transition-colors">

                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            <form data-ev-id="ev_998a3b0855" onSubmit={handleSubmit} className="container mx-auto px-4 py-8 max-w-4xl">
              <div data-ev-id="ev_7a375c0299" className="flex flex-col gap-6">
                <div data-ev-id="ev_146669cb5a">
                  <label data-ev-id="ev_daa985bf6e" className="block text-sm font-medium text-foreground mb-2">כותרת *</label>
                  <input data-ev-id="ev_5ddcb42b4a"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-foreground"
                required />

                </div>

                <div data-ev-id="ev_d3fe0f0908" className="grid grid-cols-2 gap-4">
                  <div data-ev-id="ev_d0a6c3d37a">
                    <label data-ev-id="ev_c6f10f006a" className="block text-sm font-medium text-foreground mb-2">פרשת השבוע *</label>
                    <input data-ev-id="ev_0fc88c7e2f"
                  type="text"
                  value={formData.week_parasha}
                  onChange={(e) => setFormData({ ...formData, week_parasha: e.target.value })}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-foreground"
                  placeholder="פרשת בראשית"
                  required />

                  </div>
                  <div data-ev-id="ev_03419f4089">
                    <label data-ev-id="ev_fbe2d9feb6" className="block text-sm font-medium text-foreground mb-2">שנה עברית *</label>
                    <input data-ev-id="ev_63985a407e"
                  type="text"
                  value={formData.year_hebrew}
                  onChange={(e) => setFormData({ ...formData, year_hebrew: e.target.value })}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-foreground"
                  required />

                  </div>
                </div>

                <div data-ev-id="ev_a4311056eb">
                  <label data-ev-id="ev_3ebfe0c032" className="block text-sm font-medium text-foreground mb-2">שנה לועזית *</label>
                  <input data-ev-id="ev_00f99490ec"
                type="number"
                value={formData.year_gregorian}
                onChange={(e) => setFormData({ ...formData, year_gregorian: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-foreground"
                required />

                </div>

                <div data-ev-id="ev_d281b32cae">
                  <label data-ev-id="ev_4c8769962d" className="block text-sm font-medium text-foreground mb-2">תיאור</label>
                  <RichTextEditor
                  value={formData.description}
                  onChange={(content) => setFormData({ ...formData, description: content })}
                  placeholder="תיאור הפריט..." />

                </div>

                <div data-ev-id="ev_97b600cd3a" className="grid grid-cols-2 gap-4">
                  <div data-ev-id="ev_16205ae073">
                    <label data-ev-id="ev_cb15efbe79" className="block text-sm font-medium text-foreground mb-2">מחבר</label>
                    <SmartAutocomplete
                    value={formData.author}
                    onChange={(value) => setFormData({ ...formData, author: value })}
                    options={writers.map((w) => ({ value: w.name, label: w.name }))}
                    onAddNew={addWriter}
                    placeholder="בחר או הוסף מחבר" />

                  </div>
                  <div data-ev-id="ev_118d86ff87">
                    <label data-ev-id="ev_5eacae3c11" className="block text-sm font-medium text-foreground mb-2">צלם</label>
                    <SmartAutocomplete
                    value={formData.photographer}
                    onChange={(value) => setFormData({ ...formData, photographer: value })}
                    options={photographers.map((p) => ({ value: p.name, label: p.name }))}
                    onAddNew={addPhotographer}
                    placeholder="בחר או הוסף צלם" />

                  </div>
                </div>

                {/* Images Section */}
                <div data-ev-id="ev_986c51a9aa">
                  <label data-ev-id="ev_b6c8da3245" className="block text-sm font-medium text-foreground mb-2">תמונות</label>
                  <div data-ev-id="ev_8ce640e4c7" className="flex flex-col gap-4 p-4 bg-muted rounded-xl border border-border">
                    {/* Add new image */}
                    <div data-ev-id="ev_5aacb84989" className="flex flex-col gap-2">
                      <ImageUploader
                      value={newImageUrl}
                      onChange={setNewImageUrl}
                      folder="before-18-years" />

                      {newImageUrl &&
                    <>
                          <input data-ev-id="ev_72e5b39da0"
                      type="text"
                      value={newImageCaption}
                      onChange={(e) => setNewImageCaption(e.target.value)}
                      placeholder="כיתוב לתמונה"
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-foreground" />

                          <button data-ev-id="ev_68a73de0ae"
                      type="button"
                      onClick={addImage}
                      className="self-start px-4 py-2 bg-secondary text-primary rounded-lg font-medium">

                            הוסף תמונה
                          </button>
                        </>
                    }
                    </div>

                    {/* Existing images */}
                    {formData.images.length > 0 &&
                  <div data-ev-id="ev_143b96c71e" className="flex flex-col gap-2 pt-4 border-t border-border">
                        {formData.images.map((img, index) =>
                    <div data-ev-id="ev_5d908c3151" key={index} className="flex items-center gap-3 p-2 bg-background rounded-lg">
                            <img data-ev-id="ev_6187cf3c03" src={img.url} alt="" className="w-16 h-16 object-cover rounded" />
                            <div data-ev-id="ev_6358232c3c" className="flex-1">
                              <p data-ev-id="ev_6b859a4f98" className="text-sm text-foreground truncate">{img.caption || 'ללא כיתוב'}</p>
                            </div>
                            <button data-ev-id="ev_99bb532e0c"
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

                <label data-ev-id="ev_abd3bd4c63" className="flex items-center gap-2 cursor-pointer">
                  <input data-ev-id="ev_281072dc37"
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                className="w-5 h-5 rounded border-border text-secondary focus:ring-secondary" />

                  <span data-ev-id="ev_0ff5243d33" className="text-foreground">פרסם</span>
                </label>

                <div data-ev-id="ev_952d9316e8" className="flex justify-end gap-3 pt-4 border-t border-border">
                  <button data-ev-id="ev_9fad9287e1"
                type="button"
                onClick={() => {setShowModal(false);setEditingItem(null);resetForm();}}
                className="px-6 py-3 text-muted-foreground hover:text-foreground transition-colors">

                    ביטול
                  </button>
                  <button data-ev-id="ev_114c527b1e"
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