import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  Users,
  Eye,
  Clock,
  MousePointerClick,
  TrendingUp,
  TrendingDown,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  ArrowUpRight,
  Calendar,
  RefreshCw,
  FileText,
  BarChart3,
  Activity,
  Loader2,
  ChevronDown,
  Download } from
'lucide-react';

interface OverviewStats {
  totalSessions: number;
  totalPageviews: number;
  uniqueVisitors: number;
  avgSessionDuration: number;
  bounceRate: number;
  avgPagesPerSession: number;
}

interface DeviceStats {
  device_type: string;
  count: number;
  percentage: number;
}

interface TopPage {
  page_path: string;
  page_title: string | null;
  views: number;
  unique_sessions: number;
  avg_time: number;
  avg_scroll: number;
}

interface TopContent {
  content_type: string;
  content_id: string;
  content_title: string | null;
  views: number;
  unique_visitors: number;
  avg_time: number;
  avg_scroll: number;
}

interface ReferrerStats {
  referrer: string;
  count: number;
  percentage: number;
}

interface HourlyStats {
  hour: number;
  sessions: number;
  pageviews: number;
}

interface RecentSession {
  session_id: string;
  started_at: string;
  device_type: string | null;
  browser: string | null;
  landing_page: string | null;
  page_count: number | null;
  total_time_seconds: number | null;
  is_active: boolean | null;
}

type DateRange = '24h' | '7d' | '30d' | '90d';

export default function SiteAnalytics() {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [devices, setDevices] = useState<DeviceStats[]>([]);
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [topContent, setTopContent] = useState<TopContent[]>([]);
  const [referrers, setReferrers] = useState<ReferrerStats[]>([]);
  const [hourlyStats, setHourlyStats] = useState<HourlyStats[]>([]);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'realtime'>('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  // Refresh real-time data every 30 seconds
  useEffect(() => {
    if (activeTab === 'realtime') {
      const interval = setInterval(fetchRecentSessions, 30000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  async function fetchAnalytics() {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const hours = dateRange === '24h' ? 24 : dateRange === '7d' ? 168 : dateRange === '30d' ? 720 : 2160;
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - hours);
    const startDateStr = startDate.toISOString();

    try {
      // Fetch all data in parallel
      const [
      sessionsRes,
      pageviewsRes,
      recentRes] =
      await Promise.all([
      supabase.
      from('analytics_sessions').
      select('*').
      gte('started_at', startDateStr),
      supabase.
      from('analytics_pageviews').
      select('*').
      gte('entered_at', startDateStr),
      supabase.
      from('analytics_sessions').
      select('*').
      order('started_at', { ascending: false }).
      limit(20)]
      );

      const sessions = sessionsRes.data ?? [];
      const pageviews = pageviewsRes.data ?? [];
      const recent = recentRes.data ?? [];

      // Calculate overview stats
      const totalSessions = sessions.length;
      const uniqueVisitors = new Set(sessions.map((s) => s.ip_hash)).size;
      const totalPageviews = pageviews.length;
      const totalSessionTime = sessions.reduce((sum, s) => sum + (s.total_time_seconds || 0), 0);
      const avgSessionDuration = totalSessions > 0 ? totalSessionTime / totalSessions : 0;
      const totalPageCount = sessions.reduce((sum, s) => sum + (s.page_count || 0), 0);
      const avgPagesPerSession = totalSessions > 0 ? totalPageCount / totalSessions : 0;
      const bounces = pageviews.filter((p) => p.is_bounce).length;
      const bounceRate = totalPageviews > 0 ? bounces / totalPageviews * 100 : 0;

      setOverview({
        totalSessions,
        totalPageviews,
        uniqueVisitors,
        avgSessionDuration,
        bounceRate,
        avgPagesPerSession
      });

      // Device breakdown
      const deviceCounts: Record<string, number> = {};
      sessions.forEach((s) => {
        const device = s.device_type || 'unknown';
        deviceCounts[device] = (deviceCounts[device] || 0) + 1;
      });
      const deviceStats: DeviceStats[] = Object.entries(deviceCounts).
      map(([device_type, count]) => ({
        device_type,
        count,
        percentage: totalSessions > 0 ? count / totalSessions * 100 : 0
      })).
      sort((a, b) => b.count - a.count);
      setDevices(deviceStats);

      // Top pages
      const pageCounts: Record<string, {views: number;sessions: Set<string>;totalTime: number;totalScroll: number;}> = {};
      pageviews.forEach((p) => {
        const key = p.page_path;
        if (!pageCounts[key]) {
          pageCounts[key] = { views: 0, sessions: new Set(), totalTime: 0, totalScroll: 0 };
        }
        pageCounts[key].views++;
        pageCounts[key].sessions.add(p.session_id);
        pageCounts[key].totalTime += p.time_on_page_seconds || 0;
        pageCounts[key].totalScroll += p.scroll_depth_percent || 0;
      });
      const topPagesData: TopPage[] = Object.entries(pageCounts).
      map(([page_path, data]) => ({
        page_path,
        page_title: pageviews.find((p) => p.page_path === page_path)?.page_title || null,
        views: data.views,
        unique_sessions: data.sessions.size,
        avg_time: data.views > 0 ? data.totalTime / data.views : 0,
        avg_scroll: data.views > 0 ? data.totalScroll / data.views : 0
      })).
      sort((a, b) => b.views - a.views).
      slice(0, 10);
      setTopPages(topPagesData);

      // Top content (articles, galleries, etc.)
      const contentViews = pageviews.filter((p) => p.content_type && p.content_id);
      const contentCounts: Record<string, {views: number;sessions: Set<string>;totalTime: number;totalScroll: number;title: string | null;type: string;}> = {};
      contentViews.forEach((p) => {
        const key = `${p.content_type}:${p.content_id}`;
        if (!contentCounts[key]) {
          contentCounts[key] = { views: 0, sessions: new Set(), totalTime: 0, totalScroll: 0, title: null, type: p.content_type! };
        }
        contentCounts[key].views++;
        contentCounts[key].sessions.add(p.session_id);
        contentCounts[key].totalTime += p.time_on_page_seconds || 0;
        contentCounts[key].totalScroll += p.scroll_depth_percent || 0;
      });
      const topContentData: TopContent[] = Object.entries(contentCounts).
      map(([key, data]) => {
        const [content_type, content_id] = key.split(':');
        return {
          content_type,
          content_id,
          content_title: data.title,
          views: data.views,
          unique_visitors: data.sessions.size,
          avg_time: data.views > 0 ? data.totalTime / data.views : 0,
          avg_scroll: data.views > 0 ? data.totalScroll / data.views : 0
        };
      }).
      sort((a, b) => b.views - a.views).
      slice(0, 10);
      setTopContent(topContentData);

      // Referrers
      const referrerCounts: Record<string, number> = {};
      sessions.forEach((s) => {
        const ref = s.referrer ? new URL(s.referrer).hostname : 'ישיר';
        referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;
      });
      const referrerStats: ReferrerStats[] = Object.entries(referrerCounts).
      map(([referrer, count]) => ({
        referrer,
        count,
        percentage: totalSessions > 0 ? count / totalSessions * 100 : 0
      })).
      sort((a, b) => b.count - a.count).
      slice(0, 8);
      setReferrers(referrerStats);

      // Hourly distribution
      const hourCounts: Record<number, {sessions: number;pageviews: number;}> = {};
      for (let i = 0; i < 24; i++) {
        hourCounts[i] = { sessions: 0, pageviews: 0 };
      }
      sessions.forEach((s) => {
        const hour = new Date(s.started_at).getHours();
        hourCounts[hour].sessions++;
      });
      pageviews.forEach((p) => {
        const hour = new Date(p.entered_at).getHours();
        hourCounts[hour].pageviews++;
      });
      const hourlyData: HourlyStats[] = Object.entries(hourCounts).
      map(([hour, data]) => ({
        hour: parseInt(hour),
        sessions: data.sessions,
        pageviews: data.pageviews
      })).
      sort((a, b) => a.hour - b.hour);
      setHourlyStats(hourlyData);

      // Recent sessions
      setRecentSessions(recent as RecentSession[]);

    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRecentSessions() {
    if (!supabase) return;

    const { data } = await supabase.
    from('analytics_sessions').
    select('*').
    order('started_at', { ascending: false }).
    limit(20);

    if (data) {
      setRecentSessions(data as RecentSession[]);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  }

  function formatDuration(seconds: number): string {
    if (seconds < 60) return `${Math.round(seconds)}ש'`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}ד' ${secs}ש'`;
  }

  function formatTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'כעת';
    if (mins < 60) return `לפני ${mins} דק'`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `לפני ${hours} שע'`;
    const days = Math.floor(hours / 24);
    return `לפני ${days} ימים`;
  }

  function getContentTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'siah_hatzibur': 'שיח הציבור',
      'before_18_years': 'לפני 18 שנה',
      'bein_hatzibur': 'בעין הציבור',
      'news_batzibur': 'נייעס בציבור',
      'historical_events': 'אירועים היסטוריים',
      'galleries': 'גלריות',
      'videos': 'סרטונים',
      'articles': 'כתבות',
      'events': 'אירועים'
    };
    return labels[type] || type;
  }

  function getDeviceIcon(device: string) {
    switch (device) {
      case 'mobile':return <Smartphone className="w-4 h-4" />;
      case 'tablet':return <Tablet className="w-4 h-4" />;
      default:return <Monitor className="w-4 h-4" />;
    }
  }

  const maxHourlyValue = Math.max(...hourlyStats.map((h) => h.pageviews), 1);

  return (
    <AdminLayout>
      <div data-ev-id="ev_eb5201fc68" className="p-6 flex flex-col gap-6">
        {/* Header */}
        <div data-ev-id="ev_102455e324" className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div data-ev-id="ev_d85a4c115c">
            <h1 data-ev-id="ev_709319d41d" className="text-2xl font-bold text-white">אנליטיקס אתר</h1>
            <p data-ev-id="ev_a2b304951f" className="text-zinc-400 mt-1">מעקב אחר ביקורים, תוכן פופולרי וחוויית משתמש</p>
          </div>
          <div data-ev-id="ev_691933fd37" className="flex items-center gap-3">
            {/* Date Range Selector */}
            <div data-ev-id="ev_3e573c2154" className="relative">
              <select data-ev-id="ev_cff8b4fde3"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              className="appearance-none bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 pr-10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">

                <option data-ev-id="ev_e3a6ab31a3" value="24h">24 שעות</option>
                <option data-ev-id="ev_42a321a129" value="7d">7 ימים</option>
                <option data-ev-id="ev_070242b2ce" value="30d">30 ימים</option>
                <option data-ev-id="ev_edda962289" value="90d">90 ימים</option>
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            </div>
            <button data-ev-id="ev_20e0df5ebd"
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50">

              <RefreshCw className={`w-5 h-5 text-zinc-400 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div data-ev-id="ev_4fb16e4365" className="flex gap-2 border-b border-zinc-800 pb-2">
          {[
          { id: 'overview', label: 'סקירה כללית', icon: BarChart3 },
          { id: 'content', label: 'תוכן', icon: FileText },
          { id: 'realtime', label: 'זמן אמת', icon: Activity }].
          map((tab) =>
          <button data-ev-id="ev_04686951f7"
          key={tab.id}
          onClick={() => setActiveTab(tab.id as typeof activeTab)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
          activeTab === tab.id ?
          'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
          'text-zinc-400 hover:text-white hover:bg-zinc-800'}`
          }>

              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          )}
        </div>

        {loading ?
        <div data-ev-id="ev_73d9c727f5" className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          </div> :

        <>
            {/* Overview Tab */}
            {activeTab === 'overview' &&
          <div data-ev-id="ev_d427735075" className="flex flex-col gap-6">
                {/* KPI Cards */}
                <div data-ev-id="ev_f32e5f01fd" className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                  <KPICard
                title="מבקרים ייחודיים"
                value={overview?.uniqueVisitors || 0}
                icon={Users}
                color="amber" />

                  <KPICard
                title="סה״כ צפיות"
                value={overview?.totalPageviews || 0}
                icon={Eye}
                color="blue" />

                  <KPICard
                title="סשנים"
                value={overview?.totalSessions || 0}
                icon={MousePointerClick}
                color="green" />

                  <KPICard
                title="זמן ממוצע בסשן"
                value={formatDuration(overview?.avgSessionDuration || 0)}
                icon={Clock}
                color="purple"
                isText />

                  <KPICard
                title="עמודים לסשן"
                value={(overview?.avgPagesPerSession || 0).toFixed(1)}
                icon={FileText}
                color="cyan"
                isText />

                  <KPICard
                title="שיעור נטישה"
                value={`${(overview?.bounceRate || 0).toFixed(1)}%`}
                icon={TrendingDown}
                color="red"
                isText />

                </div>

                {/* Charts Row */}
                <div data-ev-id="ev_9f75dd7f5f" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Hourly Distribution */}
                  <div data-ev-id="ev_68fd20edc5" className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
                    <h3 data-ev-id="ev_7466bb1095" className="text-lg font-semibold text-white mb-4">התפלגות לפי שעות</h3>
                    <div data-ev-id="ev_7cf3dea298" className="h-48 flex items-end gap-1">
                      {hourlyStats.map((h) =>
                  <div data-ev-id="ev_b0dbc4449e" key={h.hour} className="flex-1 flex flex-col items-center gap-1">
                          <div data-ev-id="ev_58d6f01e3a"
                    className="w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-t transition-all hover:from-amber-400 hover:to-amber-300"
                    style={{ height: `${h.pageviews / maxHourlyValue * 100}%`, minHeight: h.pageviews > 0 ? '4px' : '0' }}
                    title={`${h.pageviews} צפיות`} />

                          <span data-ev-id="ev_c9a92f6d5c" className="text-[10px] text-zinc-500">{h.hour}</span>
                        </div>
                  )}
                    </div>
                  </div>

                  {/* Device Breakdown */}
                  <div data-ev-id="ev_6d71afcd2a" className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
                    <h3 data-ev-id="ev_a9816fbfa1" className="text-lg font-semibold text-white mb-4">מכשירים</h3>
                    <div data-ev-id="ev_03db952f90" className="flex flex-col gap-3">
                      {devices.map((d) =>
                  <div data-ev-id="ev_d4a36a91c7" key={d.device_type} className="flex items-center gap-3">
                          <div data-ev-id="ev_f2f94ff756" className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                            {getDeviceIcon(d.device_type)}
                          </div>
                          <div data-ev-id="ev_187e2fbc18" className="flex-1">
                            <div data-ev-id="ev_476b00711c" className="flex items-center justify-between mb-1">
                              <span data-ev-id="ev_d163c1a2e7" className="text-sm text-white capitalize">
                                {d.device_type === 'mobile' ? 'נייד' : d.device_type === 'tablet' ? 'טאבלט' : 'מחשב'}
                              </span>
                              <span data-ev-id="ev_9aa132bc95" className="text-sm text-zinc-400">{d.count}</span>
                            </div>
                            <div data-ev-id="ev_f5aa68a274" className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                              <div data-ev-id="ev_96167c31e2"
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all"
                        style={{ width: `${d.percentage}%` }} />

                            </div>
                          </div>
                          <span data-ev-id="ev_6031109bd8" className="text-sm text-zinc-500 w-12 text-left">{d.percentage.toFixed(0)}%</span>
                        </div>
                  )}
                    </div>
                  </div>
                </div>

                {/* Top Pages & Referrers */}
                <div data-ev-id="ev_be2eac1e17" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Pages */}
                  <div data-ev-id="ev_01544e3cc8" className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
                    <h3 data-ev-id="ev_8e2513a15c" className="text-lg font-semibold text-white mb-4">עמודים מובילים</h3>
                    <div data-ev-id="ev_7f06d0f896" className="flex flex-col gap-2 max-h-80 overflow-y-auto">
                      {topPages.map((page, i) =>
                  <div data-ev-id="ev_25c7c8edbd" key={page.page_path} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors">
                          <span data-ev-id="ev_d1ca7ff670" className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400">{i + 1}</span>
                          <div data-ev-id="ev_0e083fcc7e" className="flex-1 min-w-0">
                            <p data-ev-id="ev_7f514cdab2" className="text-sm text-white truncate" dir="ltr">{page.page_path}</p>
                            <p data-ev-id="ev_ec46eaa2ae" className="text-xs text-zinc-500">{page.views} צפיות • {formatDuration(page.avg_time)} ממוצע</p>
                          </div>
                          <span data-ev-id="ev_17369e24ca" className="text-sm text-amber-400">{page.avg_scroll.toFixed(0)}%</span>
                        </div>
                  )}
                    </div>
                  </div>

                  {/* Referrers */}
                  <div data-ev-id="ev_b8dc5c315d" className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
                    <h3 data-ev-id="ev_c7e3d108e6" className="text-lg font-semibold text-white mb-4">מקורות תנועה</h3>
                    <div data-ev-id="ev_3543ca6579" className="flex flex-col gap-2">
                      {referrers.map((ref) =>
                  <div data-ev-id="ev_b2f5cde205" key={ref.referrer} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors">
                          <Globe className="w-4 h-4 text-zinc-400" />
                          <div data-ev-id="ev_02c9ccbd4a" className="flex-1">
                            <p data-ev-id="ev_8fc48d86c0" className="text-sm text-white" dir="ltr">{ref.referrer}</p>
                          </div>
                          <span data-ev-id="ev_b6be3ccdc1" className="text-sm text-zinc-400">{ref.count}</span>
                          <span data-ev-id="ev_b00390d332" className="text-xs text-zinc-500 w-12 text-left">{ref.percentage.toFixed(0)}%</span>
                        </div>
                  )}
                    </div>
                  </div>
                </div>
              </div>
          }

            {/* Content Tab */}
            {activeTab === 'content' &&
          <div data-ev-id="ev_cb729a3109" className="flex flex-col gap-6">
                <div data-ev-id="ev_101b70112f" className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
                  <div data-ev-id="ev_9de36db4d9" className="p-4 border-b border-zinc-800">
                    <h3 data-ev-id="ev_c08c318cc0" className="text-lg font-semibold text-white">תוכן פופולרי</h3>
                    <p data-ev-id="ev_105a4dc3c9" className="text-sm text-zinc-400">כתבות, גלריות וסרטונים עם הכי הרבה צפיות</p>
                  </div>
                  <div data-ev-id="ev_94effc9405" className="overflow-x-auto">
                    <table data-ev-id="ev_a744c94b7f" className="w-full">
                      <thead data-ev-id="ev_4d44ce49da">
                        <tr data-ev-id="ev_5dcc14c4ce" className="border-b border-zinc-800">
                          <th data-ev-id="ev_0f59fb81c3" className="text-right text-sm font-medium text-zinc-400 p-4">סוג</th>
                          <th data-ev-id="ev_546c9ca28b" className="text-right text-sm font-medium text-zinc-400 p-4">מזהה</th>
                          <th data-ev-id="ev_629397621b" className="text-right text-sm font-medium text-zinc-400 p-4">צפיות</th>
                          <th data-ev-id="ev_6eeb31c0a4" className="text-right text-sm font-medium text-zinc-400 p-4">מבקרים</th>
                          <th data-ev-id="ev_b6c7bc08c9" className="text-right text-sm font-medium text-zinc-400 p-4">זמן ממוצע</th>
                          <th data-ev-id="ev_35fca904ba" className="text-right text-sm font-medium text-zinc-400 p-4">גלילה</th>
                        </tr>
                      </thead>
                      <tbody data-ev-id="ev_44fc635e79">
                        {topContent.length === 0 ?
                    <tr data-ev-id="ev_93870012b3">
                            <td data-ev-id="ev_f96bd825c9" colSpan={6} className="p-8 text-center text-zinc-500">אין נתונים עדיין</td>
                          </tr> :

                    topContent.map((content) =>
                    <tr data-ev-id="ev_b68b059671" key={`${content.content_type}:${content.content_id}`} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                              <td data-ev-id="ev_ef8966e7c2" className="p-4">
                                <span data-ev-id="ev_213ee36e31" className="px-2 py-1 rounded-full text-xs bg-amber-500/20 text-amber-400">
                                  {getContentTypeLabel(content.content_type)}
                                </span>
                              </td>
                              <td data-ev-id="ev_1e526be95b" className="p-4 text-sm text-white font-mono" dir="ltr">{content.content_id.slice(0, 8)}...</td>
                              <td data-ev-id="ev_284b03317e" className="p-4 text-sm text-white">{content.views}</td>
                              <td data-ev-id="ev_a36c978ebe" className="p-4 text-sm text-zinc-400">{content.unique_visitors}</td>
                              <td data-ev-id="ev_c4124057ba" className="p-4 text-sm text-zinc-400">{formatDuration(content.avg_time)}</td>
                              <td data-ev-id="ev_08ba043fe5" className="p-4">
                                <div data-ev-id="ev_e0e752b520" className="flex items-center gap-2">
                                  <div data-ev-id="ev_16fd136694" className="w-16 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                    <div data-ev-id="ev_9a7651d7f1"
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${content.avg_scroll}%` }} />

                                  </div>
                                  <span data-ev-id="ev_829cf9241b" className="text-sm text-zinc-400">{content.avg_scroll.toFixed(0)}%</span>
                                </div>
                              </td>
                            </tr>
                    )
                    }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
          }

            {/* Real-time Tab */}
            {activeTab === 'realtime' &&
          <div data-ev-id="ev_e0ef03906b" className="flex flex-col gap-6">
                <div data-ev-id="ev_3f103b9049" className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
                  <div data-ev-id="ev_03a4b3731a" className="flex items-center justify-between mb-4">
                    <div data-ev-id="ev_12ac6df373">
                      <h3 data-ev-id="ev_facd37a645" className="text-lg font-semibold text-white">סשנים אחרונים</h3>
                      <p data-ev-id="ev_9107d49cc4" className="text-sm text-zinc-400">מתעדכן כל 30 שניות</p>
                    </div>
                    <div data-ev-id="ev_8a06919775" className="flex items-center gap-2">
                      <span data-ev-id="ev_5ccf984c61" className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span data-ev-id="ev_4564b43628" className="text-sm text-zinc-400">חי</span>
                    </div>
                  </div>
                  <div data-ev-id="ev_a0ab535614" className="flex flex-col gap-2">
                    {recentSessions.map((session) =>
                <motion.div
                  key={session.session_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-4 p-3 rounded-lg border ${
                  session.is_active ?
                  'bg-green-500/10 border-green-500/30' :
                  'bg-zinc-800/50 border-zinc-700/50'}`
                  }>

                        <div data-ev-id="ev_758787bba8" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                          {getDeviceIcon(session.device_type || 'desktop')}
                        </div>
                        <div data-ev-id="ev_68120bf719" className="flex-1 min-w-0">
                          <div data-ev-id="ev_6514b715ee" className="flex items-center gap-2">
                            <span data-ev-id="ev_a214f51e4d" className="text-sm text-white">{session.browser || 'Unknown'}</span>
                            {session.is_active &&
                      <span data-ev-id="ev_cf977715c3" className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400">פעיל</span>
                      }
                          </div>
                          <p data-ev-id="ev_f17da32d35" className="text-xs text-zinc-500 truncate" dir="ltr">{session.landing_page || '/'}</p>
                        </div>
                        <div data-ev-id="ev_e1c4a7afb3" className="text-left">
                          <p data-ev-id="ev_6c8cb56550" className="text-sm text-zinc-400">{session.page_count || 0} עמודים</p>
                          <p data-ev-id="ev_e6adc8962e" className="text-xs text-zinc-500">{formatTimeAgo(session.started_at)}</p>
                        </div>
                      </motion.div>
                )}
                  </div>
                </div>
              </div>
          }
          </>
        }
      </div>
    </AdminLayout>);

}

function KPICard({
  title,
  value,
  icon: Icon,
  color,
  isText = false






}: {title: string;value: number | string;icon: typeof Users;color: 'amber' | 'blue' | 'green' | 'purple' | 'cyan' | 'red';isText?: boolean;}) {
  const colors = {
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
    green: 'from-green-500/20 to-green-600/10 border-green-500/30 text-green-400',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
    cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400',
    red: 'from-red-500/20 to-red-600/10 border-red-500/30 text-red-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-4`}>

      <div data-ev-id="ev_162ac7b254" className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${colors[color].split(' ').pop()}`} />
        <span data-ev-id="ev_727e5bf4f0" className="text-xs text-zinc-400">{title}</span>
      </div>
      <p data-ev-id="ev_fd006fa752" className={`text-2xl font-bold ${colors[color].split(' ').pop()}`}>
        {isText ? value : typeof value === 'number' ? value.toLocaleString('he-IL') : value}
      </p>
    </motion.div>);

}