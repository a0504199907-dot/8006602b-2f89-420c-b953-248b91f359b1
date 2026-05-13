import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import ImageUploader from '@/components/ui/ImageUploader';
import AdvancedBlockEditor, { ContentBlock } from '@/components/ui/AdvancedBlockEditor';
import SmartAutocomplete from '@/components/ui/SmartAutocomplete';
import { useHebrewDate } from '@/hooks/useHebrewDateFull';
import { useChassiduyot } from '@/hooks/useChassiduyot';
import { useWriters } from '@/hooks/useWriters';
import { usePhotographers } from '@/hooks/usePhotographers';
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  Loader2,
  X,
  Eye,
  Star,
  Calendar,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Copy } from

'lucide-react';

interface Article {
  id: string;
  title: string;
  subtitle: string | null;
  cover_image_url: string | null;
  content: string;
  content_blocks: ContentBlock[] | null;
  author: string | null;
  hebrew_date: string | null;
  gregorian_date: string;
  chassidut: string | null;
  tags: string[] | null;
  views: number;
  is_published: boolean;
  is_featured: boolean;
  display_order: number;
  created_at: string;
}

export default function AdminSiahHatzibur() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [validationError, setValidationError] = useState('');
  const [reordering, setReordering] = useState(false);
  const hebrewDate = useHebrewDate();
  const { chassiduyot, addChassidut } = useChassiduyot();
  const { writers, addWriter } = useWriters();
  const { photographers, addPhotographer } = usePhotographers();

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    cover_image_url: '',
    content: '',
    content_blocks: [{ id: '1', type: 'text' as const, content: '' }] as ContentBlock[],
    author: '',
    hebrew_date: '',
    gregorian_date: new Date().toISOString().split('T')[0],
    chassidut: '',
    tags: [] as string[],
    is_published: false,
    is_featured: false
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    if (!editingArticle) {
      setFormData((prev) => ({
        ...prev,
        hebrew_date: hebrewDate.hebrewFull
      }));
    }
  }, [hebrewDate, editingArticle]);

  const fetchArticles = async () => {
    if (!supabase) {setLoading(false);return;}

    try {
      const { data, error } = await supabase.
      from('siah_hatzibur').
      select('*').
      order('display_order', { ascending: false }).
      order('created_at', { ascending: false });

      if (error) throw error;
      setArticles((data || []).map((a) => ({
        ...a,
        content: typeof a.content === 'string' ? a.content : JSON.stringify(a.content)
      })));
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    if (!supabase) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= articles.length) return;

    setReordering(true);
    const newArticles = [...articles];
    const [movedItem] = newArticles.splice(index, 1);
    newArticles.splice(newIndex, 0, movedItem);

    // Update display_order for affected items
    const updates = newArticles.map((article, idx) => ({
      id: article.id,
      display_order: newArticles.length - idx // Higher number = first
    }));

    setArticles(newArticles);

    try {
      for (const update of updates) {
        await supabase.
        from('siah_hatzibur').
        update({ display_order: update.display_order }).
        eq('id', update.id);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      fetchArticles(); // Revert on error
    } finally {
      setReordering(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    // Validate required fields
    if (!formData.author.trim()) {
      setValidationError('יש לבחור מחבר');
      return;
    }
    setValidationError('');
    setSaving(true);
    setSaveSuccess(false);

    try {
      // Convert blocks to plain text content
      const textContent = formData.content_blocks.
      filter((b) => b.type === 'text' || b.type === 'subtitle' || b.type === 'quote').
      map((b) => b.content).
      join('\n\n');

      const articleData = {
        title: formData.title,
        subtitle: formData.subtitle || null,
        cover_image_url: formData.cover_image_url || null,
        content: textContent,
        content_blocks: formData.content_blocks,
        author: formData.author || null,
        hebrew_date: formData.hebrew_date || null,
        gregorian_date: formData.gregorian_date,
        chassidut: formData.chassidut || null,
        tags: formData.tags.length > 0 ? formData.tags : null,
        is_published: formData.is_published,
        is_featured: formData.is_featured
      };

      if (editingArticle) {
        const { error } = await supabase.
        from('siah_hatzibur').
        update(articleData).
        eq('id', editingArticle.id);
        if (error) throw error;
      } else {
        // New article gets highest display_order
        const maxOrder = articles.length > 0 ? Math.max(...articles.map((a) => a.display_order || 0)) : 0;
        const { error } = await supabase.
        from('siah_hatzibur').
        insert({ ...articleData, display_order: maxOrder + 1 });
        if (error) throw error;
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setEditingArticle(null);
        resetForm();
        fetchArticles();
        setSaveSuccess(false);
      }, 1000);
    } catch (error) {
      console.error('Error saving article:', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteArticle = async (id: string) => {
    if (!confirm('האם למחוק את הכתבה?')) return;
    if (!supabase) return;

    try {
      const { error } = await supabase.from('siah_hatzibur').delete().eq('id', id);
      if (error) throw error;
      setArticles(articles.filter((a) => a.id !== id));
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  const duplicateArticle = async (article: Article) => {
    if (!supabase) return;

    try {
      const maxOrder = articles.length > 0 ? Math.max(...articles.map((a) => a.display_order || 0)) : 0;
      const { error } = await supabase.
      from('siah_hatzibur').
      insert({
        title: `${article.title} (עותק)`,
        subtitle: article.subtitle,
        cover_image_url: article.cover_image_url,
        content: article.content,
        content_blocks: article.content_blocks,
        author: article.author,
        hebrew_date: article.hebrew_date,
        gregorian_date: article.gregorian_date,
        chassidut: article.chassidut,
        tags: article.tags,
        is_published: false,
        is_featured: false,
        display_order: maxOrder + 1
      });
      if (error) throw error;
      fetchArticles();
    } catch (error) {
      console.error('Error duplicating article:', error);
    }
  };

  // Quick toggle publish status without opening modal
  const togglePublish = async (article: Article) => {
    if (!supabase) return;

    const newStatus = !article.is_published;

    // Optimistic update
    setArticles(articles.map((a) =>
    a.id === article.id ? { ...a, is_published: newStatus } : a
    ));

    try {
      const { error } = await supabase.
      from('siah_hatzibur').
      update({ is_published: newStatus }).
      eq('id', article.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error toggling publish status:', error);
      // Revert on error
      setArticles(articles.map((a) =>
      a.id === article.id ? { ...a, is_published: !newStatus } : a
      ));
    }
  };

  const openEditModal = (article: Article) => {
    setEditingArticle(article);

    // Parse content_blocks or create default from content
    let blocks: ContentBlock[] = [{ id: '1', type: 'text', content: '' }];
    if (article.content_blocks && Array.isArray(article.content_blocks) && article.content_blocks.length > 0) {
      blocks = article.content_blocks;
    } else if (article.content) {
      // If no blocks but has content, create a text block with the content
      blocks = [{ id: '1', type: 'text', content: article.content }];
    }

    setFormData({
      title: article.title,
      subtitle: article.subtitle || '',
      cover_image_url: article.cover_image_url || '',
      content: article.content || '',
      content_blocks: blocks,
      author: article.author || '',
      hebrew_date: article.hebrew_date || '',
      gregorian_date: article.gregorian_date,
      chassidut: article.chassidut || '',
      tags: article.tags || [],
      is_published: article.is_published,
      is_featured: article.is_featured
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      cover_image_url: '',
      content: '',
      content_blocks: [{ id: '1', type: 'text', content: '' }],
      author: '',
      hebrew_date: hebrewDate.hebrewFull,
      gregorian_date: new Date().toISOString().split('T')[0],
      chassidut: '',
      tags: [],
      is_published: false,
      is_featured: false
    });
  };

  return (
    <AdminLayout>
      <div data-ev-id="ev_717da7c030" className="flex flex-col gap-6">
        {/* Header */}
        <div data-ev-id="ev_5ff04e1e6b" className="flex items-center justify-between">
          <div data-ev-id="ev_a04f38b581">
            <h1 data-ev-id="ev_f6b1c8b605" className="text-2xl font-bold text-foreground font-serif">שיח הציבור</h1>
            <p data-ev-id="ev_64a57a30fe" className="text-muted-foreground mt-1">כתבות מעמיקות עם תמונות וטקסט</p>
          </div>
          <button data-ev-id="ev_683347c50b"
          onClick={() => {resetForm();setEditingArticle(null);setShowModal(true);}}
          className="flex items-center gap-2 bg-secondary hover:bg-secondary-light text-primary font-bold px-5 py-2.5 rounded-xl transition-colors">

            <Plus className="w-5 h-5" />
            כתבה חדשה
          </button>
        </div>

        {/* Reorder hint */}
        {articles.length > 1 &&
        <div data-ev-id="ev_efb7bfe988" className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
            <ArrowUpDown className="w-4 h-4" />
            <span data-ev-id="ev_1952334442">השתמש בחיצים כדי לשנות את סדר הכתבות</span>
          </div>
        }

        {/* Articles List */}
        {loading ?
        <div data-ev-id="ev_4e20e4d35a" className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-secondary animate-spin" />
          </div> :
        articles.length === 0 ?
        <div data-ev-id="ev_e48c64fb79" className="text-center py-20 bg-surface rounded-2xl border border-border">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p data-ev-id="ev_2acc3918a1" className="text-muted-foreground">אין כתבות להצגה</p>
          </div> :

        <div data-ev-id="ev_09c13c57cf" className="bg-surface rounded-2xl border border-border overflow-hidden">
            {articles.map((article, idx) =>
          <motion.div
            key={article.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`flex items-center gap-4 p-5 ${idx !== articles.length - 1 ? 'border-b border-border' : ''}`}>

                {/* Reorder buttons */}
                <div data-ev-id="ev_0190b2becb" className="flex flex-col gap-1">
                  <button data-ev-id="ev_0738a22bba"
              onClick={() => moveItem(idx, 'up')}
              disabled={idx === 0 || reordering}
              className={`p-1 rounded transition-colors ${idx === 0 ? 'text-muted-foreground/30 cursor-not-allowed' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
              title="העבר למעלה">

                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button data-ev-id="ev_252363b4e3"
              onClick={() => moveItem(idx, 'down')}
              disabled={idx === articles.length - 1 || reordering}
              className={`p-1 rounded transition-colors ${idx === articles.length - 1 ? 'text-muted-foreground/30 cursor-not-allowed' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
              title="העבר למטה">

                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Thumbnail */}
                <div data-ev-id="ev_913a3dda00" className="w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0">
                  {article.cover_image_url ?
              <img data-ev-id="ev_deebed04f6" src={article.cover_image_url} alt="" className="w-full h-full object-cover" /> :

              <div data-ev-id="ev_07b45bbbab" className="w-full h-full flex items-center justify-center">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                    </div>
              }
                </div>

                {/* Info */}
                <div data-ev-id="ev_81bf1db3ab" className="flex-1 min-w-0">
                  <div data-ev-id="ev_f4d6edb6ae" className="flex items-center gap-2 mb-1">
                    {article.is_featured && <Star className="w-4 h-4 text-secondary fill-secondary" />}
                    <h3 data-ev-id="ev_eda7b8647e" className="font-bold text-foreground truncate">{article.title}</h3>
                  </div>
                  {article.subtitle &&
              <p data-ev-id="ev_0934121a93" className="text-sm text-muted-foreground truncate">{article.subtitle}</p>
              }
                  <div data-ev-id="ev_f8b3fbcb09" className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span data-ev-id="ev_6eb017c533" className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {article.hebrew_date || article.gregorian_date}
                    </span>
                    <span data-ev-id="ev_e83caba3c3" className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {article.views} צפיות
                    </span>
                    {article.chassidut &&
                <span data-ev-id="ev_3db0cf8d63" className="bg-secondary/20 text-secondary-dark px-2 py-0.5 rounded">
                        {article.chassidut}
                      </span>
                }
                  </div>
                </div>

                {/* Status - Clickable to toggle */}
                <button data-ev-id="ev_555858dafd"
            onClick={() => togglePublish(article)}
            title={article.is_published ? 'לחץ להעביר לטיוטה' : 'לחץ לפרסם'}
            className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all hover:scale-105 ${
            article.is_published ?
            'bg-green-500/20 text-green-500 hover:bg-green-500/30' :
            'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30'}`
            }>

                  {article.is_published ? 'מפורסם' : 'טיוטה'}
                </button>

                {/* Actions */}
                <div data-ev-id="ev_b40accc8e2" className="flex items-center gap-2">
                  <button data-ev-id="ev_45a66c0eff"
              onClick={() => duplicateArticle(article)}
              className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors text-blue-500"
              title="שכפל כתבה">

                    <Copy className="w-4 h-4" />
                  </button>
                  <button data-ev-id="ev_c1cb3d211a"
              onClick={() => openEditModal(article)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="ערוך">

                    <Edit className="w-4 h-4" />
                  </button>
                  <button data-ev-id="ev_0b64689351"
              onClick={() => deleteArticle(article.id)}
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

      {/* Full Screen Modal */}
      {showModal &&
      <div data-ev-id="ev_f690973263" className="fixed inset-0 bg-background z-50 overflow-y-auto">
          <div data-ev-id="ev_0f416510bd" className="min-h-screen">
            {/* Modal Header */}
            <div data-ev-id="ev_755b05c099" className="sticky top-0 bg-surface border-b border-border z-10">
              <div data-ev-id="ev_cb4a0380c6" className="container mx-auto px-4 py-4 flex items-center justify-between">
                <h2 data-ev-id="ev_0f18f72911" className="text-xl font-bold text-foreground">
                  {editingArticle ? 'עריכת כתבה' : 'כתבה חדשה'}
                </h2>
                <div data-ev-id="ev_a44668a25c" className="flex items-center gap-3">
                  {saveSuccess &&
                <span data-ev-id="ev_2c8a8ab589" className="text-green-500 text-sm">✓ נשמר בהצלחה</span>
                }
                  <button data-ev-id="ev_e5758b053a"
                onClick={() => {setShowModal(false);setEditingArticle(null);resetForm();}}
                className="p-2 hover:bg-muted rounded-lg transition-colors">

                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <form data-ev-id="ev_3fcc4c5b92" onSubmit={handleSubmit} className="container mx-auto px-4 py-8 max-w-4xl">
              <div data-ev-id="ev_95e71058bc" className="flex flex-col gap-6">
                {/* Title */}
                <div data-ev-id="ev_b92657b1f6">
                  <label data-ev-id="ev_f1616b59b6" className="block text-sm font-medium text-foreground mb-2">כותרת *</label>
                  <input data-ev-id="ev_5b345b0b82"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-foreground"
                required />

                </div>

                {/* Subtitle */}
                <div data-ev-id="ev_1703aac2df">
                  <label data-ev-id="ev_9a61ce08ed" className="block text-sm font-medium text-foreground mb-2">תקציר</label>
                  <textarea data-ev-id="ev_29b1233914"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-foreground resize-none"
                rows={2} />

                </div>

                {/* Cover Image */}
                <div data-ev-id="ev_f10e424317">
                  <label data-ev-id="ev_0aa1dd5f60" className="block text-sm font-medium text-foreground mb-2">תמונה ראשית</label>
                  <ImageUploader
                  value={formData.cover_image_url}
                  onChange={(url) => setFormData({ ...formData, cover_image_url: url })}
                  folder="siah-hatzibur" />

                </div>

                {/* Content Editor */}
                <div data-ev-id="ev_a652576e8b">
                  <label data-ev-id="ev_1ee6841c75" className="block text-sm font-medium text-foreground mb-2">תוכן הכתבה</label>
                  <AdvancedBlockEditor
                  blocks={formData.content_blocks}
                  onChange={(blocks) => setFormData({ ...formData, content_blocks: blocks })}
                  imageFolder="siah-hatzibur" />

                </div>

                {/* Author - Required */}
                <div data-ev-id="ev_065593cdce">
                  <label data-ev-id="ev_9375b328fc" className="block text-sm font-medium text-foreground mb-2">מחבר *</label>
                  <SmartAutocomplete
                  value={formData.author}
                  onChange={(value) => setFormData({ ...formData, author: value })}
                  options={writers.map((w) => ({ value: w.name, label: w.name }))}
                  onAddNew={addWriter}
                  placeholder="בחר או הוסף מחבר" />

                  {validationError &&
                <p data-ev-id="ev_633d3bb8c9" className="text-red-500 text-sm mt-1">{validationError}</p>
                }
                </div>

                {/* Dates */}
                <div data-ev-id="ev_a3888ca84b" className="grid grid-cols-2 gap-4">
                  <div data-ev-id="ev_4e3389a3f0">
                    <label data-ev-id="ev_f4fce3f8ef" className="block text-sm font-medium text-foreground mb-2">תאריך עברי</label>
                    <input data-ev-id="ev_f7e70a0d5a"
                  type="text"
                  value={formData.hebrew_date}
                  onChange={(e) => setFormData({ ...formData, hebrew_date: e.target.value })}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-foreground" />

                  </div>
                  <div data-ev-id="ev_20948df4d1">
                    <label data-ev-id="ev_9c63e878fb" className="block text-sm font-medium text-foreground mb-2">תאריך לועזי</label>
                    <input data-ev-id="ev_95b15f51a1"
                  type="date"
                  value={formData.gregorian_date}
                  onChange={(e) => setFormData({ ...formData, gregorian_date: e.target.value })}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-foreground" />

                  </div>
                </div>

                {/* Chassidut */}
                <div data-ev-id="ev_2ddc444f5e">
                  <label data-ev-id="ev_16f100dc05" className="block text-sm font-medium text-foreground mb-2">חסידות</label>
                  <SmartAutocomplete
                  value={formData.chassidut}
                  onChange={(value) => setFormData({ ...formData, chassidut: value })}
                  options={chassiduyot.map((c) => ({ value: c.name, label: c.name }))}
                  onAddNew={addChassidut}
                  placeholder="בחר או הוסף חסידות" />

                </div>

                {/* Status toggles */}
                <div data-ev-id="ev_cc75bee510" className="flex items-center gap-6">
                  <label data-ev-id="ev_59960be74a" className="flex items-center gap-2 cursor-pointer">
                    <input data-ev-id="ev_f9282559b0"
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="w-5 h-5 rounded border-border text-secondary focus:ring-secondary" />

                    <span data-ev-id="ev_cbf4946055" className="text-foreground">פרסם כתבה</span>
                  </label>
                  <label data-ev-id="ev_4d65d53dbd" className="flex items-center gap-2 cursor-pointer">
                    <input data-ev-id="ev_ab1879a204"
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-5 h-5 rounded border-border text-secondary focus:ring-secondary" />

                    <span data-ev-id="ev_d1a311f459" className="text-foreground">כתבה מובלטת</span>
                  </label>
                </div>

                {/* Submit */}
                <div data-ev-id="ev_e5f2b03fa3" className="flex justify-end gap-3 pt-4 border-t border-border">
                  <button data-ev-id="ev_1806e51f8d"
                type="button"
                onClick={() => {setShowModal(false);setEditingArticle(null);resetForm();}}
                className="px-6 py-3 text-muted-foreground hover:text-foreground transition-colors">

                    ביטול
                  </button>
                  <button data-ev-id="ev_7f198eaf26"
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-secondary hover:bg-secondary-light text-primary font-bold px-6 py-3 rounded-xl transition-colors disabled:opacity-50">

                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    {editingArticle ? 'עדכן כתבה' : 'צור כתבה'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      }
    </AdminLayout>);

}