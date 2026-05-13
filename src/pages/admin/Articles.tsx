import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Loader2,
  Newspaper,
  AlertCircle,
  RefreshCw } from
'lucide-react';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image_url: string;
  status: string;
  views: number;
  created_at: string;
}

const statusColors: Record<string, string> = {
  draft: 'bg-zinc-500',
  scheduled: 'bg-blue-500',
  published: 'bg-green-500',
  archived: 'bg-red-500'
};

const statusLabels: Record<string, string> = {
  draft: 'טיוטה',
  scheduled: 'מתוזמן',
  published: 'פורסם',
  archived: 'ארכיון'
};

export default function AdminArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, [statusFilter]);

  async function fetchArticles() {
    if (!supabase) {
      setError('מסד הנתונים לא מחובר');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase.
      from('articles').
      select('*').
      order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setArticles(data || []);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('שגיאה בטעינת כתבות');
    } finally {
      setLoading(false);
    }
  }

  async function deleteArticle(id: string) {
    if (!confirm('האם למחוק את הכתבה?')) return;
    if (!supabase) return;

    setDeleting(id);
    try {
      const { error } = await supabase.from('articles').delete().eq('id', id);
      if (error) throw error;
      setArticles(articles.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Error deleting article:', err);
      alert('שגיאה במחיקת הכתבה');
    } finally {
      setDeleting(null);
    }
  }

  const filteredArticles = articles.filter((a) =>
  a.title?.toLowerCase().includes(search.toLowerCase())
  );

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  return (
    <AdminLayout>
      <div data-ev-id="ev_00d30c6cd2" className="flex flex-col gap-6">
        {/* Header */}
        <div data-ev-id="ev_e254646a3b" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div data-ev-id="ev_8892643f1a">
            <h1 data-ev-id="ev_92d6b149e8" className="text-2xl font-bold text-white">כתבות</h1>
            <p data-ev-id="ev_9ab8029658" className="text-zinc-400 mt-1">{articles.length} כתבות במערכת</p>
          </div>
          <Link
            to="/admin/articles/new"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-900 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all">

            <Plus className="w-5 h-5" />
            כתבה חדשה
          </Link>
        </div>

        {/* Filters */}
        <div data-ev-id="ev_e4bc880e30" className="flex flex-col sm:flex-row gap-4">
          {/* Status Filter */}
          <div data-ev-id="ev_bdbd528b35" className="flex gap-2 flex-wrap">
            {['all', 'published', 'draft', 'scheduled', 'archived'].map((status) =>
            <button data-ev-id="ev_71ec4eaff5"
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            statusFilter === status ?
            'bg-amber-500 text-black' :
            'bg-zinc-800 text-zinc-400 hover:text-white'}`
            }>

                {status === 'all' ? 'הכל' : statusLabels[status]}
              </button>
            )}
          </div>

          {/* Search */}
          <div data-ev-id="ev_530b118c00" className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input data-ev-id="ev_d35d7c59fe"
            type="text"
            placeholder="חיפוש כתבות..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-4 pr-10 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />

          </div>
        </div>

        {/* Error State */}
        {error &&
        <div data-ev-id="ev_b33ed26635" className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center justify-between">
            <div data-ev-id="ev_a47db4264b" className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span data-ev-id="ev_275d6b3565" className="text-red-400">{error}</span>
            </div>
            <button data-ev-id="ev_9351d3900e"
          onClick={fetchArticles}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors">

              <RefreshCw className="w-4 h-4" />
              נסה שוב
            </button>
          </div>
        }

        {/* Loading State */}
        {loading ?
        <div data-ev-id="ev_f477d8a242" className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
            <p data-ev-id="ev_30b610b4ba" className="text-zinc-400">טוען כתבות...</p>
          </div> :
        filteredArticles.length === 0 ? (
        /* Empty State */
        <div data-ev-id="ev_77b96c229e" className="flex flex-col items-center justify-center py-20 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
            <Newspaper className="w-16 h-16 text-zinc-600 mb-4" />
            <h2 data-ev-id="ev_f0c57134c1" className="text-xl font-bold text-white mb-2">
              {search ? 'לא נמצאו תוצאות' : 'אין כתבות עדיין'}
            </h2>
            <p data-ev-id="ev_1f33ab2bac" className="text-zinc-400 mb-6">
              {search ? 'נסה לחפש משהו אחר' : 'התחל ליצור את הכתבה הראשונה שלך'}
            </p>
            {!search &&
          <Link
            to="/admin/articles/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition-colors">

                <Plus className="w-5 h-5" />
                הוסף כתבה ראשונה
              </Link>
          }
          </div>) : (

        /* Articles List */
        <div data-ev-id="ev_6a7b256e02" className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
            <div data-ev-id="ev_3782d2c621" className="overflow-x-auto">
              <table data-ev-id="ev_fb27b7d393" className="w-full">
                <thead data-ev-id="ev_f8095c437c">
                  <tr data-ev-id="ev_a51aed1b80" className="border-b border-zinc-800">
                    <th data-ev-id="ev_d96a1d2a19" className="text-right text-zinc-400 font-medium px-6 py-4">כותרת</th>
                    <th data-ev-id="ev_8686425cbe" className="text-right text-zinc-400 font-medium px-6 py-4">סטטוס</th>
                    <th data-ev-id="ev_2c53a3558e" className="text-right text-zinc-400 font-medium px-6 py-4">צפיות</th>
                    <th data-ev-id="ev_a3e80a4702" className="text-right text-zinc-400 font-medium px-6 py-4">תאריך</th>
                    <th data-ev-id="ev_4faefdc4ea" className="text-right text-zinc-400 font-medium px-6 py-4">פעולות</th>
                  </tr>
                </thead>
                <tbody data-ev-id="ev_94713fcdbd">
                  {filteredArticles.map((article) =>
                <tr data-ev-id="ev_5737ef81d0"
                key={article.id}
                className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">

                      <td data-ev-id="ev_c25207cc41" className="px-6 py-4">
                        <div data-ev-id="ev_4cd82ba474" className="flex items-center gap-4">
                          {article.image_url &&
                      <img data-ev-id="ev_aaa7b6ac6d"
                      src={article.image_url}
                      alt=""
                      className="w-16 h-12 object-cover rounded-lg" />

                      }
                          <div data-ev-id="ev_c0720b8475">
                            <p data-ev-id="ev_475deb790a" className="text-white font-medium">{article.title}</p>
                            {article.excerpt &&
                        <p data-ev-id="ev_77d0d1f392" className="text-zinc-500 text-sm line-clamp-1">
                                {article.excerpt}
                              </p>
                        }
                          </div>
                        </div>
                      </td>
                      <td data-ev-id="ev_4a31623837" className="px-6 py-4">
                        <span data-ev-id="ev_1f3268bee1"
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusColors[article.status]} bg-opacity-20 text-white`}>

                          <span data-ev-id="ev_ea4c02d8f8" className={`w-2 h-2 rounded-full ${statusColors[article.status]}`} />
                          {statusLabels[article.status] || article.status}
                        </span>
                      </td>
                      <td data-ev-id="ev_e50be64963" className="px-6 py-4">
                        <div data-ev-id="ev_ca06a733e2" className="flex items-center gap-2 text-zinc-400">
                          <Eye className="w-4 h-4" />
                          {article.views || 0}
                        </div>
                      </td>
                      <td data-ev-id="ev_ee9b2a08af" className="px-6 py-4 text-zinc-400 text-sm">
                        {formatDate(article.created_at)}
                      </td>
                      <td data-ev-id="ev_bd0d7d291b" className="px-6 py-4">
                        <div data-ev-id="ev_fe6e0f40ac" className="flex items-center gap-2">
                          <Link
                        to={`/admin/articles/${article.id}`}
                        className="p-2 text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors">

                            <Edit className="w-4 h-4" />
                          </Link>
                          <button data-ev-id="ev_74c69f3eb7"
                      onClick={() => deleteArticle(article.id)}
                      disabled={deleting === article.id}
                      className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50">

                            {deleting === article.id ?
                        <Loader2 className="w-4 h-4 animate-spin" /> :

                        <Trash2 className="w-4 h-4" />
                        }
                          </button>
                        </div>
                      </td>
                    </tr>
                )}
                </tbody>
              </table>
            </div>
          </div>)
        }
      </div>
    </AdminLayout>);

}