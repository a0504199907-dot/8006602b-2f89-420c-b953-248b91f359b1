import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointerClick,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  RefreshCw,
  Download,
  Filter,
  ChevronDown,
  Target,
  Users,
  Clock,
  Zap } from
'lucide-react';

interface AnalyticsData {
  totalImpressions: number;
  totalClicks: number;
  totalRevenue: number;
  ctr: number;
  avgCpm: number;
  dailyStats: DailyStat[];
  topCampaigns: CampaignStat[];
  topSlots: SlotStat[];
  hourlyDistribution: HourlyStat[];
  deviceBreakdown: DeviceStat[];
}

interface DailyStat {
  date: string;
  impressions: number;
  clicks: number;
  revenue: number;
}

interface CampaignStat {
  id: string;
  name: string;
  impressions: number;
  clicks: number;
  ctr: number;
  revenue: number;
}

interface SlotStat {
  slot_name: string;
  impressions: number;
  clicks: number;
  ctr: number;
}

interface HourlyStat {
  hour: number;
  impressions: number;
  clicks: number;
}

interface DeviceStat {
  device: string;
  impressions: number;
  percentage: number;
}

type DateRange = '7d' | '30d' | '90d' | 'custom';

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  async function fetchAnalytics() {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString();

      // Fetch impressions from ad_impressions table
      const { data: impressionData } = await supabase
        .from('ad_impressions')
        .select('creative_id, impression_type, created_at, page_url, slot_name')
        .gte('created_at', startDateStr);

      // Process impressions into daily stats
      const dailyMap = new Map<string, { impressions: number; clicks: number; dismissals: number }>();
      
      for (const imp of impressionData ?? []) {
        const date = new Date(imp.created_at).toISOString().split('T')[0];
        if (!dailyMap.has(date)) {
          dailyMap.set(date, { impressions: 0, clicks: 0, dismissals: 0 });
        }
        const stats = dailyMap.get(date)!;
        if (imp.impression_type === 'view') {
          stats.impressions++;
        } else if (imp.impression_type === 'click') {
          stats.clicks++;
        } else if (imp.impression_type === 'dismiss') {
          stats.dismissals++;
        }
      }

      const dailyStats: DailyStat[] = Array.from(dailyMap.entries())
        .map(([date, stats]) => ({
          date,
          impressions: stats.impressions,
          clicks: stats.clicks,
          revenue: stats.impressions * 0.005 // Estimated CPM
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Fetch campaign stats
      const { data: campaignData } = await supabase
        .from('ad_campaigns')
        .select(`
          id,
          name,
          budget,
          ad_creatives (
            id
          )
        `);

      // Map creative IDs to campaigns
      const creativeIdToCampaign = new Map<string, { id: string; name: string; budget: number }>();
      for (const campaign of campaignData ?? []) {
        if (campaign.ad_creatives && Array.isArray(campaign.ad_creatives)) {
          for (const creative of campaign.ad_creatives as { id: string }[]) {
            creativeIdToCampaign.set(creative.id, {
              id: campaign.id,
              name: campaign.name,
              budget: campaign.budget || 0
            });
          }
        }
      }

      // Aggregate impressions by campaign
      const campaignStatsMap = new Map<string, { name: string; impressions: number; clicks: number }>();
      for (const imp of impressionData ?? []) {
        const campaign = creativeIdToCampaign.get(imp.creative_id);
        if (campaign) {
          if (!campaignStatsMap.has(campaign.id)) {
            campaignStatsMap.set(campaign.id, { name: campaign.name, impressions: 0, clicks: 0 });
          }
          const stats = campaignStatsMap.get(campaign.id)!;
          if (imp.impression_type === 'view') {
            stats.impressions++;
          } else if (imp.impression_type === 'click') {
            stats.clicks++;
          }
        }
      }

      // Aggregate by slot
      const slotStatsMap = new Map<string, { impressions: number; clicks: number }>();
      for (const imp of impressionData ?? []) {
        const slotName = imp.slot_name || 'unknown';
        if (!slotStatsMap.has(slotName)) {
          slotStatsMap.set(slotName, { impressions: 0, clicks: 0 });
        }
        const stats = slotStatsMap.get(slotName)!;
        if (imp.impression_type === 'view') {
          stats.impressions++;
        } else if (imp.impression_type === 'click') {
          stats.clicks++;
        }
      }

      const totalImpressions = dailyStats.reduce((sum, d) => sum + d.impressions, 0);
      const totalClicks = dailyStats.reduce((sum, d) => sum + d.clicks, 0);
      const totalRevenue = dailyStats.reduce((sum, d) => sum + d.revenue, 0);
      const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
      const avgCpm = totalImpressions > 0 ? (totalRevenue / totalImpressions) * 1000 : 0;

      // Process campaign stats
      const topCampaigns: CampaignStat[] = Array.from(campaignStatsMap.entries())
        .map(([id, stats]) => ({
          id,
          name: stats.name,
          impressions: stats.impressions,
          clicks: stats.clicks,
          ctr: stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0,
          revenue: stats.impressions * 0.005
        }))
        .sort((a, b) => b.impressions - a.impressions)
        .slice(0, 5);

      // Process slot stats
      const topSlots: SlotStat[] = Array.from(slotStatsMap.entries())
        .map(([slot, stats]) => ({
          slot,
          impressions: stats.impressions,
          clicks: stats.clicks,
          ctr: stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0
        }))
        .sort((a, b) => b.impressions - a.impressions)
        .slice(0, 5);

      // Generate hourly distribution
      const hourlyMap = new Map<number, { impressions: number; clicks: number }>();
      for (let i = 0; i < 24; i++) {
        hourlyMap.set(i, { impressions: 0, clicks: 0 });
      }
      for (const imp of impressionData ?? []) {
        const hour = new Date(imp.created_at).getHours();
        const stats = hourlyMap.get(hour)!;
        if (imp.impression_type === 'view') {
          stats.impressions++;
        } else if (imp.impression_type === 'click') {
          stats.clicks++;
        }
      }

      const hourlyDistribution: HourlyStat[] = Array.from(hourlyMap.entries())
        .map(([hour, stats]) => ({
          hour,
          impressions: stats.impressions,
          clicks: stats.clicks
        }))
        .sort((a, b) => a.hour - b.hour);

      // Device breakdown (estimate from user agent - simplified)
      const deviceMap = { mobile: 0, desktop: 0, tablet: 0 };
      for (const imp of impressionData ?? []) {
        if (imp.impression_type === 'view') {
          // Simple UA detection - in production use a proper UA parser
          const ua = (imp as any).user_agent?.toLowerCase() || '';
          if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
            deviceMap.mobile++;
          } else if (ua.includes('tablet') || ua.includes('ipad')) {
            deviceMap.tablet++;
          } else {
            deviceMap.desktop++;
          }
        }
      }
      const totalDevices = deviceMap.mobile + deviceMap.desktop + deviceMap.tablet || 1;
      const deviceBreakdown: DeviceStat[] = [
        { device: 'מובייל', impressions: deviceMap.mobile, percentage: Math.round((deviceMap.mobile / totalDevices) * 100) },
        { device: 'דסקטופ', impressions: deviceMap.desktop, percentage: Math.round((deviceMap.desktop / totalDevices) * 100) },
        { device: 'טאבלט', impressions: deviceMap.tablet, percentage: Math.round((deviceMap.tablet / totalDevices) * 100) }
      ];

      setData({
        totalImpressions,
        totalClicks,
        totalRevenue,
        ctr,
        avgCpm,
        dailyStats,
        topCampaigns,
        topSlots,
        hourlyDistribution,
        deviceBreakdown
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString('he-IL');
  };

  const formatCurrency = (num: number) => {
    return '₪' + num.toLocaleString('he-IL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  // Calculate chart bar heights
  const maxImpressions = data?.dailyStats ? Math.max(...data.dailyStats.map((d) => d.impressions), 1) : 1;

  if (loading) {
    return (
      <div data-ev-id="ev_44d8851fd1" className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>);

  }

  if (!data) {
    return (
      <div data-ev-id="ev_dd94b8832e" className="text-center py-12 text-zinc-400">
        לא ניתן לטעון את נתוני האנליטיקס
      </div>);

  }

  return (
    <div data-ev-id="ev_65d23b8b37" className="flex flex-col gap-6">
      {/* Header */}
      <div data-ev-id="ev_00e01fdc9b" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div data-ev-id="ev_9411eb9261">
          <h2 data-ev-id="ev_a43342fc32" className="text-xl font-bold text-white">אנליטיקס מתקדם</h2>
          <p data-ev-id="ev_e497a04914" className="text-zinc-400 text-sm mt-1">סקירה מפורטת של ביצועי הפרסום</p>
        </div>
        <div data-ev-id="ev_6f79ddddb0" className="flex items-center gap-3">
          {/* Date Range Selector */}
          <div data-ev-id="ev_3a576d65ff" className="flex bg-zinc-800 rounded-lg p-1">
            {(['7d', '30d', '90d'] as DateRange[]).map((range) =>
            <button data-ev-id="ev_76597ed499"
            key={range}
            onClick={() => setDateRange(range)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
            dateRange === range ?
            'bg-amber-500 text-zinc-900' :
            'text-zinc-400 hover:text-white'}`
            }>

                {range === '7d' ? '7 ימים' : range === '30d' ? '30 ימים' : '90 ימים'}
              </button>
            )}
          </div>
          
          <button data-ev-id="ev_a8fe916370"
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">

            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          
          <button data-ev-id="ev_7d0f65a609" className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div data-ev-id="ev_9f94a2b975" className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="חשיפות"
          value={formatNumber(data.totalImpressions)}
          change={12.5}
          icon={Eye}
          color="blue" />

        <KPICard
          title="קליקים"
          value={formatNumber(data.totalClicks)}
          change={8.3}
          icon={MousePointerClick}
          color="green" />

        <KPICard
          title="CTR"
          value={data.ctr.toFixed(2) + '%'}
          change={-2.1}
          icon={Target}
          color="amber" />

        <KPICard
          title="הכנסות"
          value={formatCurrency(data.totalRevenue)}
          change={15.7}
          icon={DollarSign}
          color="emerald" />

        <KPICard
          title="CPM ממוצע"
          value={formatCurrency(data.avgCpm)}
          change={3.2}
          icon={Zap}
          color="purple" />

      </div>

      {/* Charts Row */}
      <div data-ev-id="ev_38aac15dce" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Chart - Takes 2 columns */}
        <div data-ev-id="ev_c681862aab" className="lg:col-span-2 bg-zinc-900 rounded-2xl border border-zinc-800 p-5">
          <div data-ev-id="ev_c78d4a708d" className="flex items-center justify-between mb-6">
            <h3 data-ev-id="ev_915c72db0e" className="font-bold text-white">חשיפות יומיות</h3>
            <div data-ev-id="ev_fb18971fb0" className="flex items-center gap-4 text-sm">
              <div data-ev-id="ev_7e81cd77c7" className="flex items-center gap-2">
                <div data-ev-id="ev_4a632b87f4" className="w-3 h-3 rounded-full bg-amber-500" />
                <span data-ev-id="ev_6d7c4592f4" className="text-zinc-400">חשיפות</span>
              </div>
              <div data-ev-id="ev_e5cc238201" className="flex items-center gap-2">
                <div data-ev-id="ev_36d0d33623" className="w-3 h-3 rounded-full bg-blue-500" />
                <span data-ev-id="ev_9bae8a16e2" className="text-zinc-400">קליקים</span>
              </div>
            </div>
          </div>
          
          {/* Bar Chart */}
          <div data-ev-id="ev_e433687257" className="h-64 flex items-end gap-1">
            {data.dailyStats.slice(-30).map((day, idx) =>
            <div data-ev-id="ev_2f6b8f5af6" key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${day.impressions / maxImpressions * 100}%` }}
                transition={{ delay: idx * 0.02 }}
                className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-sm min-h-[4px] relative group">

                  <div data-ev-id="ev_af90acaa98" className="absolute bottom-full mb-2 right-1/2 translate-x-1/2 bg-zinc-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {formatNumber(day.impressions)}
                  </div>
                </motion.div>
              </div>
            )}
          </div>
          
          {/* X Axis Labels */}
          <div data-ev-id="ev_6c42171208" className="flex justify-between mt-3 text-xs text-zinc-500">
            <span data-ev-id="ev_4a1b39b354">{data.dailyStats[0]?.date?.split('-').slice(1).join('/')}</span>
            <span data-ev-id="ev_e7512a013d">{data.dailyStats[data.dailyStats.length - 1]?.date?.split('-').slice(1).join('/')}</span>
          </div>
        </div>

        {/* Device Breakdown */}
        <div data-ev-id="ev_4a20872494" className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5">
          <h3 data-ev-id="ev_58606159db" className="font-bold text-white mb-6">התפלגות מכשירים</h3>
          
          <div data-ev-id="ev_93f23aa703" className="flex flex-col gap-4">
            {data.deviceBreakdown.map((device, idx) => {
              const colors = ['amber', 'blue', 'purple'];
              const color = colors[idx] || 'amber';

              return (
                <div data-ev-id="ev_256d7bab19" key={device.device}>
                  <div data-ev-id="ev_63eb5e8f8f" className="flex items-center justify-between mb-2">
                    <span data-ev-id="ev_3bcfdd66f7" className="text-zinc-300">{device.device}</span>
                    <span data-ev-id="ev_06aaafaaf0" className="text-zinc-400 text-sm">{device.percentage}%</span>
                  </div>
                  <div data-ev-id="ev_3c5ea2a896" className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${device.percentage}%` }}
                      transition={{ delay: idx * 0.1 }}
                      className={`h-full bg-gradient-to-r ${color === 'amber' ? 'from-amber-600 to-amber-400' : color === 'blue' ? 'from-blue-600 to-blue-400' : 'from-purple-600 to-purple-400'} rounded-full`} />

                  </div>
                </div>);

            })}
          </div>
          
          {/* Pie Chart Visual */}
          <div data-ev-id="ev_0838195441" className="mt-6 flex items-center justify-center">
            <div data-ev-id="ev_8e7fee9e41" className="relative w-32 h-32">
              <svg data-ev-id="ev_28f33aaf0a" className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle data-ev-id="ev_e72d5fcc72"
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#3f3f46"
                strokeWidth="12" />

                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="12"
                  strokeDasharray="251.2"
                  initial={{ strokeDashoffset: 251.2 }}
                  animate={{ strokeDashoffset: 251.2 * (1 - 0.65) }}
                  transition={{ duration: 1 }} />

                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="12"
                  strokeDasharray="251.2"
                  initial={{ strokeDashoffset: 251.2 }}
                  animate={{ strokeDashoffset: 251.2 * (1 - 0.28) }}
                  transition={{ duration: 1, delay: 0.2 }}
                  style={{ transform: 'rotate(234deg)', transformOrigin: '50% 50%' }} />

              </svg>
              <div data-ev-id="ev_2d380e4a2d" className="absolute inset-0 flex items-center justify-center">
                <PieChart className="w-6 h-6 text-zinc-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Campaigns */}
      <div data-ev-id="ev_605c013b3c" className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5">
        <div data-ev-id="ev_bfc5fb5fdd" className="flex items-center justify-between mb-6">
          <h3 data-ev-id="ev_6a872d016a" className="font-bold text-white">קמפיינים מובילים</h3>
          <button data-ev-id="ev_18afd79e36" className="text-sm text-amber-400 hover:text-amber-300">
            צפה בכולם
          </button>
        </div>
        
        <div data-ev-id="ev_f9c0bd62f4" className="overflow-x-auto">
          <table data-ev-id="ev_73ec0ce492" className="w-full">
            <thead data-ev-id="ev_31e07084e1">
              <tr data-ev-id="ev_bb616e0762" className="border-b border-zinc-800">
                <th data-ev-id="ev_95840ef386" className="text-right text-sm font-medium text-zinc-400 pb-3">קמפיין</th>
                <th data-ev-id="ev_e35b44228e" className="text-right text-sm font-medium text-zinc-400 pb-3">חשיפות</th>
                <th data-ev-id="ev_0f208df8cd" className="text-right text-sm font-medium text-zinc-400 pb-3">קליקים</th>
                <th data-ev-id="ev_49e0b717e1" className="text-right text-sm font-medium text-zinc-400 pb-3">CTR</th>
                <th data-ev-id="ev_fbe98eb738" className="text-right text-sm font-medium text-zinc-400 pb-3">הכנסה</th>
                <th data-ev-id="ev_f3c549d039" className="text-right text-sm font-medium text-zinc-400 pb-3">ביצועים</th>
              </tr>
            </thead>
            <tbody data-ev-id="ev_ac1d7aeaf8">
              {data.topCampaigns.map((campaign, idx) =>
              <motion.tr
                key={campaign.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="border-b border-zinc-800/50 hover:bg-zinc-800/30">

                  <td data-ev-id="ev_da6974d017" className="py-4">
                    <div data-ev-id="ev_0abf3b5a02" className="flex items-center gap-3">
                      <div data-ev-id="ev_80fd2f4477" className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center">
                        <span data-ev-id="ev_b5ea4219b0" className="text-amber-400 font-bold text-sm">#{idx + 1}</span>
                      </div>
                      <span data-ev-id="ev_0f43c1b738" className="font-medium text-white">{campaign.name}</span>
                    </div>
                  </td>
                  <td data-ev-id="ev_d2919a2fb4" className="py-4 text-zinc-300">{formatNumber(campaign.impressions)}</td>
                  <td data-ev-id="ev_0cde78979a" className="py-4 text-zinc-300">{formatNumber(campaign.clicks)}</td>
                  <td data-ev-id="ev_9bc7c4351b" className="py-4">
                    <span data-ev-id="ev_68c3633091" className={`${campaign.ctr > 2 ? 'text-green-400' : campaign.ctr > 1 ? 'text-amber-400' : 'text-red-400'}`}>
                      {campaign.ctr.toFixed(2)}%
                    </span>
                  </td>
                  <td data-ev-id="ev_4c95bf78d8" className="py-4 text-emerald-400 font-medium">{formatCurrency(campaign.revenue)}</td>
                  <td data-ev-id="ev_bd1bc67494" className="py-4">
                    <div data-ev-id="ev_c349bf4557" className="w-20 h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div data-ev-id="ev_90903d0587"
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                    style={{ width: `${Math.min(campaign.impressions / (data.topCampaigns[0]?.impressions || 1) * 100, 100)}%` }} />

                    </div>
                  </td>
                </motion.tr>
              )}
            </tbody>
          </table>
        </div>
        
        {data.topCampaigns.length === 0 &&
        <div data-ev-id="ev_eceb86bd0a" className="text-center py-8 text-zinc-500">
            אין נתוני קמפיינים להצגה
          </div>
        }
      </div>

      {/* Hourly Distribution */}
      <div data-ev-id="ev_7038825129" className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5">
        <h3 data-ev-id="ev_04c3278703" className="font-bold text-white mb-6">התפלגות שעתית</h3>
        
        <div data-ev-id="ev_ab8e7255f4" className="h-40 flex items-end gap-1">
          {data.hourlyDistribution.map((hour, idx) => {
            const maxHourly = Math.max(...data.hourlyDistribution.map((h) => h.impressions), 1);
            const height = hour.impressions / maxHourly * 100;

            return (
              <div data-ev-id="ev_8da6b50b40" key={hour.hour} className="flex-1 flex flex-col items-center">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: idx * 0.02 }}
                  className={`w-full rounded-t min-h-[4px] ${
                  hour.hour >= 8 && hour.hour <= 22 ?
                  'bg-gradient-to-t from-amber-600 to-amber-400' :
                  'bg-zinc-700'}`
                  } />

                {idx % 4 === 0 &&
                <span data-ev-id="ev_4be7774680" className="text-xs text-zinc-500 mt-2">{hour.hour}:00</span>
                }
              </div>);

          })}
        </div>
      </div>
    </div>);

}

// KPI Card Component
function KPICard({
  title,
  value,
  change,
  icon: Icon,
  color






}: {title: string;value: string;change: number;icon: React.ComponentType<{className?: string;}>;color: 'blue' | 'green' | 'amber' | 'emerald' | 'purple';}) {
  const isPositive = change >= 0;

  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/20 text-blue-400',
    green: 'from-green-500/20 to-green-600/10 border-green-500/20 text-green-400',
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/20 text-amber-400',
    emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20 text-emerald-400',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/20 text-purple-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-5 rounded-2xl border bg-gradient-to-br ${colorClasses[color]}`}>

      <div data-ev-id="ev_8690f02e53" className="flex items-center justify-between mb-3">
        <Icon className={`w-5 h-5 ${colorClasses[color].split(' ').pop()}`} />
        <div data-ev-id="ev_8e52feece1" className={`flex items-center gap-1 text-xs font-medium ${
        isPositive ? 'text-green-400' : 'text-red-400'}`
        }>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(change)}%
        </div>
      </div>
      <p data-ev-id="ev_92d9df0351" className="text-2xl font-bold text-white mb-1">{value}</p>
      <p data-ev-id="ev_b6cc0bbc1e" className="text-sm text-zinc-400">{title}</p>
    </motion.div>);

}