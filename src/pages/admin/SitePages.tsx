import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { FileText, Save, Eye, EyeOff } from 'lucide-react';
import RichTextEditor from '@/components/ui/RichTextEditor';

interface SitePage {
  id: string;
  slug: string;
  title: string;
  content: string;
  meta_description: string | null;
  is_published: boolean;
}

export default function AdminSitePages() {
  const [pages, setPages] = useState<SitePage[]>([]);
  const [selectedPage, setSelectedPage] = useState<SitePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    if (!supabase) return;

    const { data } = await supabase.
    from('site_pages').
    select('*').
    order('title');

    if (data) {
      setPages(data);
      if (data.length > 0 && !selectedPage) {
        setSelectedPage(data[0]);
      }
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!supabase || !selectedPage) return;

    setSaving(true);

    const { error } = await supabase.
    from('site_pages').
    update({
      title: selectedPage.title,
      content: selectedPage.content,
      meta_description: selectedPage.meta_description,
      is_published: selectedPage.is_published,
      updated_at: new Date().toISOString()
    }).
    eq('id', selectedPage.id);

    setSaving(false);

    if (!error) {
      fetchPages();
    }
  };

  const togglePublish = async () => {
    if (!selectedPage) return;
    setSelectedPage({ ...selectedPage, is_published: !selectedPage.is_published });
  };

  const pageNames: Record<string, string> = {
    'terms': 'תנאי שימוש',
    'privacy': 'מדיניות פרטיות',
    'accessibility': 'הצהרת נגישות'
  };

  return (
    <AdminLayout>
      <div data-ev-id="ev_4133b7aca8" className="p-6">
        {/* Header */}
        <div data-ev-id="ev_9c3f3811e8" className="flex items-center justify-between mb-6">
          <div data-ev-id="ev_48d0f159ef" className="flex items-center gap-3">
            <div data-ev-id="ev_9b56415d99" className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-secondary" />
            </div>
            <div data-ev-id="ev_322852c42d">
              <h1 data-ev-id="ev_0cc704f6ee" className="text-2xl font-bold text-white">דפי מידע</h1>
              <p data-ev-id="ev_9ccbb7cd78" className="text-zinc-400 text-sm">עריכת דפי תנאים, פרטיות ונגישות</p>
            </div>
          </div>
          
          <button data-ev-id="ev_8747e1db54"
          onClick={handleSave}
          disabled={saving || !selectedPage}
          className="px-4 py-2 bg-secondary text-primary font-bold rounded-lg hover:bg-secondary-light transition-colors disabled:opacity-50 flex items-center gap-2">

            <Save className="w-4 h-4" />
            {saving ? 'שומר...' : 'שמור שינויים'}
          </button>
        </div>

        {loading ?
        <div data-ev-id="ev_efd55420f8" className="text-center py-12">
            <div data-ev-id="ev_8a4974dfc6" className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto" />
          </div> :

        <div data-ev-id="ev_87a5af3700" className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Page List */}
            <div data-ev-id="ev_e59c8825ab" className="lg:col-span-1">
              <div data-ev-id="ev_5ce3c45229" className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                <div data-ev-id="ev_158e96dda9" className="p-4 border-b border-zinc-800">
                  <h2 data-ev-id="ev_6642caeac2" className="font-bold text-white">דפים</h2>
                </div>
                <div data-ev-id="ev_0c19abcd3c" className="divide-y divide-zinc-800">
                  {pages.map((page) =>
                <button data-ev-id="ev_d711f5f890"
                key={page.id}
                onClick={() => setSelectedPage(page)}
                className={`w-full p-4 text-right transition-colors ${
                selectedPage?.id === page.id ?
                'bg-secondary/10 text-secondary' :
                'hover:bg-zinc-800 text-white'}`
                }>

                      <div data-ev-id="ev_e7a88ace0b" className="font-medium">{pageNames[page.slug] || page.title}</div>
                      <div data-ev-id="ev_dd7525d3bb" className="text-xs text-zinc-500 mt-1">/{page.slug}</div>
                    </button>
                )}
                </div>
              </div>
            </div>

            {/* Editor */}
            <div data-ev-id="ev_855234352b" className="lg:col-span-3">
              {selectedPage ?
            <div data-ev-id="ev_d0b1fb18d0" className="bg-zinc-900 rounded-xl border border-zinc-800">
                  <div data-ev-id="ev_fc7abfb181" className="p-4 border-b border-zinc-800 flex items-center justify-between">
                    <input data-ev-id="ev_7960c48321"
                type="text"
                value={selectedPage.title}
                onChange={(e) => setSelectedPage({ ...selectedPage, title: e.target.value })}
                className="text-xl font-bold bg-transparent text-white focus:outline-none" />

                    <button data-ev-id="ev_52ad95df49"
                onClick={togglePublish}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm ${
                selectedPage.is_published ?
                'bg-green-500/10 text-green-400' :
                'bg-zinc-800 text-zinc-400'}`
                }>

                      {selectedPage.is_published ?
                  <><Eye className="w-4 h-4" /> מפורסם</> :

                  <><EyeOff className="w-4 h-4" /> טיוטה</>
                  }
                    </button>
                  </div>
                  
                  <div data-ev-id="ev_a87be5fb8c" className="p-4 border-b border-zinc-800">
                    <label data-ev-id="ev_5d13bba883" className="block text-sm text-zinc-400 mb-2">תיאור ל-SEO</label>
                    <input data-ev-id="ev_cba660b169"
                type="text"
                value={selectedPage.meta_description || ''}
                onChange={(e) => setSelectedPage({ ...selectedPage, meta_description: e.target.value })}
                placeholder="תיאור קצר של הדף למנועי חיפוש"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-secondary focus:outline-none" />

                  </div>

                  <div data-ev-id="ev_645c2bb177" className="p-4">
                    <label data-ev-id="ev_2401b70123" className="block text-sm text-zinc-400 mb-2">תוכן הדף</label>
                    <RichTextEditor
                  value={selectedPage.content}
                  onChange={(content) => setSelectedPage({ ...selectedPage, content })} />

                  </div>
                </div> :

            <div data-ev-id="ev_300774a2bf" className="text-center py-12 text-zinc-500">
                  בחר דף לעריכה
                </div>
            }
            </div>
          </div>
        }
      </div>
    </AdminLayout>);

}