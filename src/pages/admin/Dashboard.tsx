import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { useDriveSync } from '@/hooks/useDriveSync';
import {
  Newspaper,
  Image,
  Calendar,
  Video,
  Megaphone,
  Plus,
  ArrowUpRight,
  BarChart3,
  Eye,
  Users,
  MousePointerClick,
  Clock,
  AlertCircle,
  RefreshCw,
  Cloud,
  CheckCircle,
  FolderSync } from

'lucide-react';

interface Stats {
  articles: number;
  galleries: number;
  events: number;
  videos: number;
  campaigns: number;
}

interface RecentItem {
  id: string;
  title: string;
  type: string;
  created_at: string;
  status: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ articles: 0, galleries: 0, events: 0, videos: 0, campaigns: 0 });
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isConnected: driveConnected, pendingCount: drivePendingCount, config: driveConfig } = useDriveSync();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    if (!supabase) {
      setError('מסד הנתונים לא מחובר');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch all stats in parallel with timeout
      const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 5000)
      );

      const fetchData = async () => {
        const [articles, galleries, events, videos, campaigns] = await Promise.all([
        supabase.from('articles').select('id', { count: 'exact', head: true }),
        supabase.from('galleries').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('videos').select('id', { count: 'exact', head: true }),
        supabase.from('ad_campaigns').select('id', { count: 'exact', head: true })]
        );

        setStats({
          articles: articles.count || 0,
          galleries: galleries.count || 0,
          events: events.count || 0,
          videos: videos.count || 0,
          campaigns: campaigns.count || 0
        });

        // Fetch recent items
        const { data: recentArticles } = await supabase.
        from('articles').
        select('id, title, created_at, status').
        order('created_at', { ascending: false }).
        limit(5);

        setRecentItems((recentArticles ?? []).map((a) => ({ ...a, type: 'article' })));
      };

      await Promise.race([fetchData(), timeout]);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('שגיאה בטעינת נתונים');
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
  { label: 'כתבות', value: stats.articles, icon: Newspaper, color: 'amber', path: '/admin/articles' },
  { label: 'גלריות', value: stats.galleries, icon: Image, color: 'blue', path: '/admin/galleries' },
  { label: 'אירועים', value: stats.events, icon: Calendar, color: 'green', path: '/admin/events' },
  { label: 'סרטונים', value: stats.videos, icon: Video, color: 'purple', path: '/admin/videos' },
  { label: 'קמפיינים', value: stats.campaigns, icon: Megaphone, color: 'rose', path: '/admin/ads' }];


  const quickActions = [
  { label: 'כתבה חדשה', icon: Newspaper, path: '/admin/articles/new', color: 'amber' },
  { label: 'גלריה חדשה', icon: Image, path: '/admin/galleries/new', color: 'blue' },
  { label: 'אירוע חדש', icon: Calendar, path: '/admin/events/new', color: 'green' },
  { label: 'סרטון חדש', icon: Video, path: '/admin/videos/new', color: 'purple' }];


  const colorClasses: Record<string, {bg: string;text: string;border: string;}> = {
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' }
  };

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' });
  }

  return (
    <AdminLayout>
      <div data-ev-id="ev_be9e1972ea" className="flex flex-col gap-6">
        {/* Header */}
        <div data-ev-id="ev_a985a42c06" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div data-ev-id="ev_e32fcf1387">
            <h1 data-ev-id="ev_59021ac68c" className="text-2xl font-bold text-white">שלום, ברוך הבא!</h1>
            <p data-ev-id="ev_029ca37d3b" className="text-zinc-400 mt-1">סקירה כללית של מערכת הניהול</p>
          </div>
          <Link
            to="/admin/articles/new"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-900 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all">

            <Plus className="w-5 h-5" />
            כתבה חדשה
          </Link>
        </div>

        {/* Error State */}
        {error &&
        <div data-ev-id="ev_7a6f437ee5" className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center justify-between">
            <div data-ev-id="ev_3a8d6b3cb9" className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span data-ev-id="ev_5a4940b686" className="text-red-400">{error}</span>
            </div>
            <button data-ev-id="ev_ca3257d145"
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors">

              <RefreshCw className="w-4 h-4" />
              נסה שוב
            </button>
          </div>
        }

        {/* Stats Grid */}
        <div data-ev-id="ev_f76a856d90" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {statCards.map((stat) => {
            const colors = colorClasses[stat.color];
            return (
              <Link
                key={stat.label}
                to={stat.path}
                className={`group p-5 rounded-2xl border ${colors.border} ${colors.bg} hover:scale-[1.02] transition-all duration-200`}>

                <div data-ev-id="ev_413fe43781" className="flex items-center justify-between mb-3">
                  <stat.icon className={`w-6 h-6 ${colors.text}`} />
                  <ArrowUpRight className={`w-4 h-4 ${colors.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
                <p data-ev-id="ev_cb0d432ddb" className="text-3xl font-bold text-white mb-1">
                  {loading ?
                  <span data-ev-id="ev_8a6afde32d" className="inline-block w-8 h-8 bg-zinc-700 rounded animate-pulse" /> :

                  stat.value
                  }
                </p>
                <p data-ev-id="ev_a4e216572e" className="text-sm text-zinc-400">{stat.label}</p>
              </Link>);

          })}
        </div>

        {/* Main Content Grid */}
        <div data-ev-id="ev_4ae922600b" className="grid lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div data-ev-id="ev_92cb4464e3" className="lg:col-span-1">
            <div data-ev-id="ev_dbcfa98f78" className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
              <h2 data-ev-id="ev_8ad436bfb1" className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                פעולות מהירות
              </h2>
              <div data-ev-id="ev_a6c6766f3b" className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => {
                  const colors = colorClasses[action.color];
                  return (
                    <Link
                      key={action.label}
                      to={action.path}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${colors.border} ${colors.bg} hover:scale-[1.02] transition-all`}>

                      <action.icon className={`w-6 h-6 ${colors.text}`} />
                      <span data-ev-id="ev_2ad77bf317" className="text-sm text-zinc-300 text-center">{action.label}</span>
                    </Link>);

                })}
              </div>
            </div>

            {/* Stats Preview */}
            <div data-ev-id="ev_b793e29521" className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 mt-4">
              <h2 data-ev-id="ev_644a73a017" className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-400" />
                סטטיסטיקות היום
              </h2>
              <div data-ev-id="ev_5fe9907ad8" className="flex flex-col gap-4">
                <div data-ev-id="ev_098f8d8622" className="flex items-center justify-between">
                  <div data-ev-id="ev_6a4ad31572" className="flex items-center gap-3">
                    <div data-ev-id="ev_d3530b50ac" className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Eye className="w-5 h-5 text-blue-400" />
                    </div>
                    <span data-ev-id="ev_83f9435498" className="text-zinc-400">צפיות</span>
                  </div>
                  <span data-ev-id="ev_5b54edf94e" className="text-xl font-bold text-white">12,847</span>
                </div>
                <div data-ev-id="ev_f6d159e2b7" className="flex items-center justify-between">
                  <div data-ev-id="ev_162d2d808a" className="flex items-center gap-3">
                    <div data-ev-id="ev_dfa70ac9d2" className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-400" />
                    </div>
                    <span data-ev-id="ev_6860f18e8c" className="text-zinc-400">מבקרים</span>
                  </div>
                  <span data-ev-id="ev_4b34fce69b" className="text-xl font-bold text-white">3,421</span>
                </div>
                <div data-ev-id="ev_8c4710e32e" className="flex items-center justify-between">
                  <div data-ev-id="ev_721bce0e49" className="flex items-center gap-3">
                    <div data-ev-id="ev_641738fd9a" className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <MousePointerClick className="w-5 h-5 text-amber-400" />
                    </div>
                    <span data-ev-id="ev_240055b981" className="text-zinc-400">קליקים</span>
                  </div>
                  <span data-ev-id="ev_e77e3bf48c" className="text-xl font-bold text-white">847</span>
                </div>
              </div>
            </div>

            {/* Drive Sync Status */}
            <Link
              to="/admin/drive-sync"
              className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 mt-4 block hover:border-zinc-700 transition-colors">

              <h2 data-ev-id="ev_93ab3214a7" className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Cloud className="w-5 h-5 text-blue-400" />
                סנכרון Drive
              </h2>
              {driveConnected ?
              <div data-ev-id="ev_8b1a2dfdce" className="flex items-center justify-between">
                  <div data-ev-id="ev_26c19028fa" className="flex items-center gap-3">
                    <div data-ev-id="ev_2c8a033278" className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div data-ev-id="ev_fce3c9f5dc">
                      <p data-ev-id="ev_513e8cb640" className="text-zinc-300">מחובר</p>
                      <p data-ev-id="ev_2a9d8b522d" className="text-xs text-zinc-500">{driveConfig?.folder_name}</p>
                    </div>
                  </div>
                  {drivePendingCount > 0 &&
                <span data-ev-id="ev_899bfe2573" className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                      {drivePendingCount} חדשים
                    </span>
                }
                </div> :

              <div data-ev-id="ev_7edeeea73b" className="flex items-center gap-3">
                  <div data-ev-id="ev_ca615e897f" className="w-10 h-10 rounded-xl bg-zinc-700/50 flex items-center justify-center">
                    <FolderSync className="w-5 h-5 text-zinc-500" />
                  </div>
                  <div data-ev-id="ev_56c09b9af2">
                    <p data-ev-id="ev_93fb3b17f6" className="text-zinc-400">לא מחובר</p>
                    <p data-ev-id="ev_8207cc9194" className="text-xs text-zinc-500">לחץ לחיבור Drive</p>
                  </div>
                </div>
              }
            </Link>
          </div>

          {/* Recent Activity */}
          <div data-ev-id="ev_6f7f96d2d3" className="lg:col-span-2">
            <div data-ev-id="ev_68bbcbb397" className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
              <div data-ev-id="ev_7ad7d551ed" className="flex items-center justify-between mb-4">
                <h2 data-ev-id="ev_8865c58eed" className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  פעילות אחרונה
                </h2>
                <Link to="/admin/articles" className="text-amber-400 hover:text-amber-300 text-sm">
                  הצג הכל
                </Link>
              </div>

              {loading ?
              <div data-ev-id="ev_097974d4cf" className="flex flex-col gap-3">
                  {[1, 2, 3, 4, 5].map((i) =>
                <div data-ev-id="ev_d53caf9355" key={i} className="h-16 bg-zinc-800/50 rounded-xl animate-pulse" />
                )}
                </div> :
              recentItems.length === 0 ?
              <div data-ev-id="ev_eee6e0cd00" className="text-center py-12">
                  <Newspaper className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <p data-ev-id="ev_b45c10baa4" className="text-zinc-400 mb-4">אין כתבות עדיין</p>
                  <Link
                  to="/admin/articles/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors">

                    <Plus className="w-4 h-4" />
                    הוסף כתבה ראשונה
                  </Link>
                </div> :

              <div data-ev-id="ev_6c4d05857d" className="flex flex-col gap-3">
                  {recentItems.map((item) =>
                <Link
                  key={item.id}
                  to={`/admin/articles/${item.id}`}
                  className="flex items-center justify-between p-4 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl transition-colors group">

                      <div data-ev-id="ev_5c8b08f938" className="flex items-center gap-3">
                        <div data-ev-id="ev_6aae680d7c" className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                          <Newspaper className="w-5 h-5 text-amber-400" />
                        </div>
                        <div data-ev-id="ev_a408bec124">
                          <p data-ev-id="ev_b473820c19" className="text-white font-medium group-hover:text-amber-400 transition-colors">
                            {item.title}
                          </p>
                          <p data-ev-id="ev_53ebbbb0ef" className="text-sm text-zinc-500">{formatDate(item.created_at)}</p>
                        </div>
                      </div>
                      <span data-ev-id="ev_60d3b65a1d" className={`px-3 py-1 rounded-full text-xs font-medium ${
                  item.status === 'published' ?
                  'bg-green-500/10 text-green-400' :
                  'bg-zinc-700 text-zinc-400'}`
                  }>
                        {item.status === 'published' ? 'פורסם' : 'טיוטה'}
                      </span>
                    </Link>
                )}
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>);

}