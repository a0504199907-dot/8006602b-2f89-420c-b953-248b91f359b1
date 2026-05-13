import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import SmartAutocomplete from '@/components/ui/SmartAutocomplete';
import AdvancedBlockEditor, { ContentBlock } from '@/components/ui/AdvancedBlockEditor';
import { useChassiduyot } from '@/hooks/useChassiduyot';
import { useWriters } from '@/hooks/useWriters';
import { usePhotographers } from '@/hooks/usePhotographers';
import {
  Save,
  ArrowRight,
  Image as ImageIcon,
  Calendar,
  Tag,
  FileText,
  Loader2,
  Eye,
  Clock,
  PenTool,
  Camera } from
'lucide-react';
import ImageUploader from '@/components/ui/ImageUploader';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function AdminArticleEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNew = !id;
  const { chassiduyot, addChassidut } = useChassiduyot();
  const { writers, addWriter } = useWriters();
  const { photographers, addPhotographer } = usePhotographers();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [validationError, setValidationError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    content_blocks: [{ id: '1', type: 'text' as const, content: '' }] as ContentBlock[],
    image_url: '',
    category_id: '',
    chassidut: '',
    author: '',
    photographer: '',
    status: 'draft',
    is_breaking: false,
    is_featured: false,
    scheduled_at: '',
    hebrew_date: '',
    meta_title: '',
    meta_description: ''
  });

  useEffect(() => {
    fetchCategories();
    if (!isNew) {
      fetchArticle();
    }
  }, [id]);

  const fetchCategories = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('categories').select('*').eq('is_active', true);
    setCategories(data || []);
  };

  const fetchArticle = async () => {
    if (!supabase || !id) return;

    try {
      const { data, error } = await supabase.
      from('articles').
      select('*').
      eq('id', id).
      single();

      if (error) throw error;
      if (data) {
        // Parse content_blocks or create default from content
        let blocks: ContentBlock[] = [{ id: '1', type: 'text', content: '' }];
        if (data.content_blocks && Array.isArray(data.content_blocks) && data.content_blocks.length > 0) {
          blocks = data.content_blocks;
        } else if (data.content) {
          blocks = [{ id: '1', type: 'text', content: data.content }];
        }
        
        setFormData({
          title: data.title || '',
          slug: data.slug || '',
          excerpt: data.excerpt || '',
          content: data.content || '',
          content_blocks: blocks,
          image_url: data.image_url || '',
          category_id: data.category_id || '',
          chassidut: data.chassidut || '',
          author: data.author || '',
          photographer: data.photographer || '',
          status: data.status || 'draft',
          is_breaking: data.is_breaking || false,
          is_featured: data.is_featured || false,
          scheduled_at: data.scheduled_at ? new Date(data.scheduled_at).toISOString().slice(0, 16) : '',
          hebrew_date: data.hebrew_date || '',
          meta_title: data.meta_title || '',
          meta_description: data.meta_description || ''
        });
      }
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title.
    toLowerCase().
    replace(/[^\u0590-\u05FFa-z0-9\s-]/g, '').
    replace(/\s+/g, '-').
    replace(/-+/g, '-').
    trim();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title)
    }));
  };

  // Convert blocks to HTML content
  const blocksToHtml = (blocks: ContentBlock[]): string => {
    return blocks.map(block => {
      switch (block.type) {
        case 'text':
          return block.content || '';
        case 'image':
          if (!block.imageUrl) return '';
          let figcaption = '';
          if (block.caption) {
            const photographerSpan = block.photographer 
              ? ' <span class="photographer">צילום: ' + block.photographer + '</span>' 
              : '';
            figcaption = '<figcaption>' + block.caption + photographerSpan + '</figcaption>';
          }
          return '<figure class="content-image"><img src="' + block.imageUrl + '" alt="' + (block.caption || '') + '" />' + figcaption + '</figure>';
        case 'subtitle':
          return '<h2 class="content-subtitle">' + (block.content || '') + '</h2>';
        case 'quote':
          const cite = block.quoteSource ? '<cite>' + block.quoteSource + '</cite>' : '';
          return '<blockquote class="content-quote"><p>' + (block.content || '') + '</p>' + cite + '</blockquote>';
        default:
          return '';
      }
    }).join('\n');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    // Validate required fields
    if (!formData.author.trim()) {
      setValidationError('יש לבחור כתב');
      return;
    }
    setValidationError('');

    setSaving(true);

    try {
      // Convert blocks to HTML content
      const htmlContent = blocksToHtml(formData.content_blocks);
      
      const articleData = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: htmlContent,
        content_blocks: formData.content_blocks,
        image_url: formData.image_url || null,
        category_id: formData.category_id || null,
        chassidut: formData.chassidut || null,
        author: formData.author,
        photographer: formData.photographer || null,
        status: formData.status,
        is_breaking: formData.is_breaking,
        is_featured: formData.is_featured,
        scheduled_at: formData.scheduled_at || null,
        hebrew_date: formData.hebrew_date || null,
        meta_title: formData.meta_title || null,
        meta_description: formData.meta_description || null,
        author_id: user?.id,
        published_at: formData.status === 'published' ? new Date().toISOString() : null
      };

      if (isNew) {
        const { error } = await supabase.from('articles').insert(articleData);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('articles').update(articleData).eq('id', id);
        if (error) throw error;
      }

      navigate('/admin/articles');
    } catch (error) {
      console.error('Error saving article:', error);
      alert('שגיאה בשמירת הכתבה');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div data-ev-id="ev_e8b3025409" className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 text-secondary animate-spin" />
        </div>
      </AdminLayout>);

  }

  return (
    <AdminLayout>
      <form data-ev-id="ev_d4a61aa62a" onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Header */}
        <div data-ev-id="ev_1916781e50" className="flex items-center justify-between">
          <div data-ev-id="ev_1cba0b400e" className="flex items-center gap-4">
            <button data-ev-id="ev_5f477b0a75"
            type="button"
            onClick={() => navigate('/admin/articles')}
            className="p-2 hover:bg-muted rounded-lg transition-colors">

              <ArrowRight className="w-5 h-5" />
            </button>
            <div data-ev-id="ev_ff7e355d3c">
              <h1 data-ev-id="ev_dbbb84edf7" className="text-2xl font-bold text-foreground font-serif">
                {isNew ? 'כתבה חדשה' : 'עריכת כתבה'}
              </h1>
            </div>
          </div>
          <div data-ev-id="ev_f4f34d6e07" className="flex items-center gap-3">
            <button data-ev-id="ev_83a6821875"
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, status: 'draft' }))}
            className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors">

              שמור כטיוטה
            </button>
            <button data-ev-id="ev_1bf2688e20"
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-secondary hover:bg-secondary-light text-primary font-bold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50">

              {saving ?
              <Loader2 className="w-5 h-5 animate-spin" /> :

              <Save className="w-5 h-5" />
              }
              {formData.status === 'published' ? 'פרסם' : 'שמור'}
            </button>
          </div>
        </div>

        <div data-ev-id="ev_83702a0b11" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div data-ev-id="ev_902dc7108a" className="lg:col-span-2 flex flex-col gap-6">
            {/* Title & Slug */}
            <div data-ev-id="ev_23d445a812" className="bg-surface rounded-2xl p-6 border border-border">
              <div data-ev-id="ev_12f2ec8c0b" className="flex flex-col gap-4">
                <div data-ev-id="ev_eec102bd3c">
                  <label data-ev-id="ev_36b27b7679" className="block text-sm font-medium text-foreground mb-2">כותרת</label>
                  <input data-ev-id="ev_9006fb6c44"
                  type="text"
                  value={formData.title}
                  onChange={handleTitleChange}
                  className="w-full bg-muted/50 border border-border rounded-xl py-3 px-4 text-foreground text-xl font-bold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="כותרת הכתבה"
                  required />

                </div>
                <div data-ev-id="ev_66fea01049">
                  <label data-ev-id="ev_9e03e3a53b" className="block text-sm font-medium text-foreground mb-2">Slug (קישור)</label>
                  <input data-ev-id="ev_0217d53f5f"
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4 text-foreground text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="article-slug"
                  required
                  dir="ltr" />

                </div>
              </div>
            </div>

            {/* Excerpt */}
            <div data-ev-id="ev_d7bbffc519" className="bg-surface rounded-2xl p-6 border border-border">
              <label data-ev-id="ev_efa7918f27" className="block text-sm font-medium text-foreground mb-2">תקציר</label>
              <textarea data-ev-id="ev_1d7b59b0e7"
              value={formData.excerpt}
              onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
              className="w-full bg-muted/50 border border-border rounded-xl py-3 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
              placeholder="תקציר קצר של הכתבה..."
              rows={3} />

            </div>

            {/* Content */}
            <div data-ev-id="ev_9609debaa7" className="bg-surface rounded-2xl p-6 border border-border">
              <AdvancedBlockEditor
                blocks={formData.content_blocks}
                onChange={(blocks) => setFormData((prev) => ({ ...prev, content_blocks: blocks }))}
                photographers={photographers}
                onAddPhotographer={addPhotographer}
              />
            </div>

            {/* SEO */}
            <div data-ev-id="ev_ee39d62f50" className="bg-surface rounded-2xl p-6 border border-border">
              <h3 data-ev-id="ev_9a069d46bf" className="font-bold text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-secondary" />
                SEO
              </h3>
              <div data-ev-id="ev_96b16154de" className="flex flex-col gap-4">
                <div data-ev-id="ev_97ad8253d4">
                  <label data-ev-id="ev_78b491c63c" className="block text-sm font-medium text-foreground mb-2">כותרת מטא</label>
                  <input data-ev-id="ev_4aafea172d"
                  type="text"
                  value={formData.meta_title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, meta_title: e.target.value }))}
                  className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="כותרת לתוצאות חיפוש" />

                </div>
                <div data-ev-id="ev_d71dcce268">
                  <label data-ev-id="ev_d68701e6d0" className="block text-sm font-medium text-foreground mb-2">תיאור מטא</label>
                  <textarea data-ev-id="ev_059d02e76d"
                  value={formData.meta_description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, meta_description: e.target.value }))}
                  className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                  placeholder="תיאור קצר לתוצאות חיפוש"
                  rows={2} />

                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div data-ev-id="ev_3c22aa3062" className="flex flex-col gap-6">
            {/* Status */}
            <div data-ev-id="ev_7fda4898f3" className="bg-surface rounded-2xl p-6 border border-border">
              <h3 data-ev-id="ev_686f0bdfde" className="font-bold text-foreground mb-4">סטטוס</h3>
              <select data-ev-id="ev_06589fb91f"
              value={formData.status}
              onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-secondary">

                <option data-ev-id="ev_f87cd9b437" value="draft">טיוטה</option>
                <option data-ev-id="ev_b1afccf5dd" value="scheduled">מתוזמן</option>
                <option data-ev-id="ev_acc8ca644a" value="published">פורסם</option>
                <option data-ev-id="ev_114b195814" value="archived">ארכיון</option>
              </select>

              {formData.status === 'scheduled' &&
              <div data-ev-id="ev_28f228bb96" className="mt-4">
                  <label data-ev-id="ev_ef3870a452" className="block text-sm font-medium text-foreground mb-2">
                    <Clock className="w-4 h-4 inline ml-1" />
                    תאריך פרסום
                  </label>
                  <input data-ev-id="ev_9ca2cab38d"
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) => setFormData((prev) => ({ ...prev, scheduled_at: e.target.value }))}
                className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-secondary" />

                </div>
              }

              <div data-ev-id="ev_432511a7b3" className="flex flex-col gap-3 mt-4">
                <label data-ev-id="ev_19f5f30234" className="flex items-center gap-3 cursor-pointer">
                  <input data-ev-id="ev_dd6ef6d1bb"
                  type="checkbox"
                  checked={formData.is_breaking}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_breaking: e.target.checked }))}
                  className="w-5 h-5 rounded border-border bg-muted/50 text-secondary focus:ring-secondary" />

                  <span data-ev-id="ev_664f81cd10" className="text-sm text-foreground">חדשות חמות</span>
                </label>
                <label data-ev-id="ev_48a83a975a" className="flex items-center gap-3 cursor-pointer">
                  <input data-ev-id="ev_954d3aa239"
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_featured: e.target.checked }))}
                  className="w-5 h-5 rounded border-border bg-muted/50 text-secondary focus:ring-secondary" />

                  <span data-ev-id="ev_8760ab8ed0" className="text-sm text-foreground">כתבה מומלצת</span>
                </label>
              </div>
            </div>

            {/* Image */}
            <div data-ev-id="ev_e035f45053" className="bg-surface rounded-2xl p-6 border border-border">
              <ImageUploader
                value={formData.image_url}
                onChange={(url) => setFormData((prev) => ({ ...prev, image_url: url }))}
                label="תמונה ראשית"
                placeholder="הדבק קישור או העלה תמונה" />

            </div>

            {/* Writer - Required */}
            <div data-ev-id="ev_6def38c986" className="bg-surface rounded-2xl p-6 border border-border">
              <h3 data-ev-id="ev_a84356d610" className="font-bold text-foreground mb-4 flex items-center gap-2">
                <PenTool className="w-5 h-5 text-secondary" />
                כתב <span data-ev-id="ev_dfaf5cadd9" className="text-red-500">*</span>
              </h3>
              <SmartAutocomplete
                value={formData.author}
                onChange={(value) => {
                  setFormData((prev) => ({ ...prev, author: value }));
                  if (value.trim()) setValidationError('');
                }}
                placeholder="בחר או הקלד שם כתב"
                options={writers}
                onAddNew={(name) => addWriter(name)} />

              {validationError &&
              <p data-ev-id="ev_9ec75a035f" className="text-red-500 text-sm mt-2">{validationError}</p>
              }
            </div>

            {/* Photographer */}
            <div data-ev-id="ev_31d13def32" className="bg-surface rounded-2xl p-6 border border-border">
              <h3 data-ev-id="ev_7df6d54ce1" className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5 text-secondary" />
                צלם
              </h3>
              <SmartAutocomplete
                value={formData.photographer}
                onChange={(value) => setFormData((prev) => ({ ...prev, photographer: value }))}
                placeholder="בחר או הקלד שם צלם"
                options={photographers}
                onAddNew={(name) => addPhotographer(name)} />

            </div>

            {/* Category */}
            <div data-ev-id="ev_a98c80e98b" className="bg-surface rounded-2xl p-6 border border-border">
              <h3 data-ev-id="ev_a3994e9bf1" className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-secondary" />
                קטגוריה
              </h3>
              <select data-ev-id="ev_10d09d30f0"
              value={formData.category_id}
              onChange={(e) => setFormData((prev) => ({ ...prev, category_id: e.target.value }))}
              className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-secondary">

                <option data-ev-id="ev_8d07ab2628" value="">בחר קטגוריה</option>
                {categories.map((cat) =>
                <option data-ev-id="ev_29145b1d97" key={cat.id} value={cat.id}>{cat.name}</option>
                )}
              </select>
            </div>

            {/* Chassidut */}
            <div data-ev-id="ev_f8320e34bf" className="bg-surface rounded-2xl p-6 border border-border">
              <h3 data-ev-id="ev_3ff0e1263e" className="font-bold text-foreground mb-4">חסידות</h3>
              <SmartAutocomplete
                value={formData.chassidut}
                onChange={(value) => setFormData((prev) => ({ ...prev, chassidut: value }))}
                placeholder="בחר או הקלד חסידות"
                options={chassiduyot}
                onAddNew={addChassidut} />


            </div>

            {/* Hebrew Date */}
            <div data-ev-id="ev_31d13def32" className="bg-surface rounded-2xl p-6 border border-border">
              <h3 data-ev-id="ev_7df6d54ce1" className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-secondary" />
                תאריך עברי
              </h3>
              <input data-ev-id="ev_e836cda9a4"
              type="text"
              value={formData.hebrew_date}
              onChange={(e) => setFormData((prev) => ({ ...prev, hebrew_date: e.target.value }))}
              className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="למשל: ה' שבט תשפ״ה" />

            </div>
          </div>
        </div>
      </form>
    </AdminLayout>);

}