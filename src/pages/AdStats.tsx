import { useParams } from 'react-router';
import { motion } from 'framer-motion';
import { useCampaignByShareToken } from '@/hooks/useAds';
import { Eye, MousePointer, Percent, Calendar, TrendingUp, BarChart3, Loader2, Image as ImageIcon } from 'lucide-react';

export default function AdStats() {
  const { token } = useParams<{token: string;}>();
  const {
    campaign,
    creatives,
    stats,
    totalImpressions,
    totalClicks,
    ctr,
    loading,
    error
  } = useCampaignByShareToken(token || '');

  if (loading) {
    return (
      <div data-ev-id="ev_971ff228d8" className="min-h-screen bg-background flex items-center justify-center">
        <div data-ev-id="ev_1b19cfd42c" className="text-center">
          <Loader2 className="w-12 h-12 text-secondary animate-spin mx-auto" />
          <p data-ev-id="ev_67455078a2" className="text-muted-foreground mt-4">טוען נתונים...</p>
        </div>
      </div>);

  }

  if (error || !campaign) {
    return (
      <div data-ev-id="ev_65232bf358" className="min-h-screen bg-background flex items-center justify-center">
        <div data-ev-id="ev_9cd4b4cd8f" className="text-center bg-surface p-10 rounded-2xl shadow-card border border-border max-w-md">
          <div data-ev-id="ev_49fad5b693" className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-red-500" />
          </div>
          <h1 data-ev-id="ev_32afe0d26e" className="text-2xl font-bold text-foreground mb-2">הקמפיין לא נמצא</h1>
          <p data-ev-id="ev_e6ec2aa474" className="text-muted-foreground">הקישור אינו תקין או שהקמפיין הוסר</p>
        </div>
      </div>);

  }

  // Group stats by date for chart
  const statsByDate = stats.reduce((acc: Record<string, {impressions: number;clicks: number;}>, s) => {
    if (!acc[s.date]) {
      acc[s.date] = { impressions: 0, clicks: 0 };
    }
    acc[s.date].impressions += s.impressions || 0;
    acc[s.date].clicks += s.clicks || 0;
    return acc;
  }, {});

  const chartData = Object.entries(statsByDate).
  sort(([a], [b]) => a.localeCompare(b)).
  slice(-14); // Last 14 days

  const maxImpressions = Math.max(...chartData.map(([, d]) => d.impressions), 1);

  // Stats by creative
  const creativeStats = creatives.map((creative) => {
    const creativeStatsData = stats.filter((s) => s.creative_id === creative.id);
    const impressions = creativeStatsData.reduce((sum, s) => sum + (s.impressions || 0), 0);
    const clicks = creativeStatsData.reduce((sum, s) => sum + (s.clicks || 0), 0);
    const creativeCtr = impressions > 0 ? (clicks / impressions * 100).toFixed(2) : '0';
    return { ...creative, impressions, clicks, ctr: creativeCtr };
  });

  const statusLabels: Record<string, {label: string;color: string;}> = {
    draft: { label: 'טיוטה', color: 'bg-gray-500' },
    active: { label: 'פעיל', color: 'bg-green-500' },
    paused: { label: 'מושהה', color: 'bg-yellow-500' },
    completed: { label: 'הסתיים', color: 'bg-blue-500' },
    cancelled: { label: 'בוטל', color: 'bg-red-500' }
  };

  const campaignStatus = statusLabels[campaign.status] || statusLabels.draft;

  return (
    <div data-ev-id="ev_d2691990fb" className="min-h-screen bg-background py-10">
      <div data-ev-id="ev_d7870284f6" className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary via-primary to-primary/90 rounded-2xl p-8 mb-8 shadow-lg">

          <div data-ev-id="ev_e5cae50a42" className="flex items-start justify-between">
            <div data-ev-id="ev_4ec8466ece">
              <span data-ev-id="ev_bbbba69fe0" className={`${campaignStatus.color} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                {campaignStatus.label}
              </span>
              <h1 data-ev-id="ev_be8b1ddf96" className="text-3xl font-bold text-white mt-3 font-serif">{campaign.name}</h1>
              <p data-ev-id="ev_e95f28cab7" className="text-white/70 mt-2">לקוח: {campaign.client_name}</p>
            </div>
            <div data-ev-id="ev_de53f07b39" className="text-left">
              <div data-ev-id="ev_d5786cee96" className="flex items-center gap-2 text-white/70 text-sm">
                <Calendar className="w-4 h-4" />
                <span data-ev-id="ev_17fabea44f">תקופת פרסום</span>
              </div>
              <p data-ev-id="ev_b31e93b046" className="text-white text-sm mt-1">
                {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString('he-IL') : 'לא הוגדר'}
                {' - '}
                {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString('he-IL') : 'ללא הגבלה'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div data-ev-id="ev_fa90011b37" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface rounded-2xl p-6 border border-border shadow-card">

            <div data-ev-id="ev_c5e53e5fdb" className="flex items-center gap-4">
              <div data-ev-id="ev_003ef7135f" className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Eye className="w-7 h-7 text-blue-500" />
              </div>
              <div data-ev-id="ev_c6783acd67">
                <p data-ev-id="ev_305bf86fa7" className="text-3xl font-bold text-foreground">{totalImpressions.toLocaleString()}</p>
                <p data-ev-id="ev_11feffecb5" className="text-muted-foreground">חשיפות</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface rounded-2xl p-6 border border-border shadow-card">

            <div data-ev-id="ev_1f81357b72" className="flex items-center gap-4">
              <div data-ev-id="ev_713fa85fac" className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <MousePointer className="w-7 h-7 text-purple-500" />
              </div>
              <div data-ev-id="ev_025283fed2">
                <p data-ev-id="ev_a37f1438dd" className="text-3xl font-bold text-foreground">{totalClicks.toLocaleString()}</p>
                <p data-ev-id="ev_12a178de86" className="text-muted-foreground">הקלקות</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-surface rounded-2xl p-6 border border-border shadow-card">

            <div data-ev-id="ev_7d267fa05a" className="flex items-center gap-4">
              <div data-ev-id="ev_8440235f32" className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Percent className="w-7 h-7 text-green-500" />
              </div>
              <div data-ev-id="ev_36c1cf936e">
                <p data-ev-id="ev_5d9ec58b5d" className="text-3xl font-bold text-foreground">{ctr}%</p>
                <p data-ev-id="ev_426ea9add1" className="text-muted-foreground">אחוז הקלקה (CTR)</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Chart */}
        {chartData.length > 0 &&
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-surface rounded-2xl p-6 border border-border shadow-card mb-8">

            <div data-ev-id="ev_54cfae7b29" className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-secondary" />
              <h2 data-ev-id="ev_8c891e6515" className="text-lg font-bold text-foreground font-serif">חשיפות לאורך זמן</h2>
            </div>
            
            <div data-ev-id="ev_51dedb7a4c" className="flex items-end gap-2 h-48">
              {chartData.map(([date, data], i) =>
            <div data-ev-id="ev_93676a1473" key={date} className="flex-1 flex flex-col items-center gap-2">
                  <div data-ev-id="ev_cf9e8842b4" className="w-full flex flex-col gap-1">
                    <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${data.impressions / maxImpressions * 100}%` }}
                  transition={{ delay: 0.5 + i * 0.05, duration: 0.5 }}
                  className="w-full bg-blue-500/30 rounded-t-lg min-h-[4px]"
                  style={{ height: `${Math.max(data.impressions / maxImpressions * 150, 4)}px` }} />

                  </div>
                  <span data-ev-id="ev_9498512c74" className="text-xs text-muted-foreground transform -rotate-45 origin-top-right whitespace-nowrap">
                    {new Date(date).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' })}
                  </span>
                </div>
            )}
            </div>

            <div data-ev-id="ev_1cf02486fc" className="flex items-center gap-6 mt-6 pt-4 border-t border-border">
              <div data-ev-id="ev_54733f54c4" className="flex items-center gap-2">
                <div data-ev-id="ev_bc7d6c0ce3" className="w-3 h-3 bg-blue-500/30 rounded" />
                <span data-ev-id="ev_865c3f8de6" className="text-sm text-muted-foreground">חשיפות</span>
              </div>
            </div>
          </motion.div>
        }

        {/* Creatives Performance */}
        {creativeStats.length > 0 &&
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-surface rounded-2xl p-6 border border-border shadow-card">

            <div data-ev-id="ev_3e3df51cb0" className="flex items-center gap-2 mb-6">
              <ImageIcon className="w-5 h-5 text-secondary" />
              <h2 data-ev-id="ev_e62ecdf9a9" className="text-lg font-bold text-foreground font-serif">ביצועי באנרים</h2>
            </div>

            <div data-ev-id="ev_630efde103" className="flex flex-col gap-4">
              {creativeStats.map((creative, i) =>
            <motion.div
              key={creative.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">

                  {/* Thumbnail */}
                  <div data-ev-id="ev_55d31a0b88" className="w-20 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {creative.image_url ?
                <img data-ev-id="ev_7f814ef5b7"
                src={creative.image_url}
                alt={creative.name}
                className="w-full h-full object-cover" /> :


                <div data-ev-id="ev_f83e0253dc" className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                      </div>
                }
                  </div>

                  {/* Info */}
                  <div data-ev-id="ev_9777d119eb" className="flex-1 min-w-0">
                    <h3 data-ev-id="ev_98ec9bba09" className="font-medium text-foreground truncate">{creative.name}</h3>
                    <p data-ev-id="ev_73c44cc6d0" className="text-sm text-muted-foreground">גודל: {creative.size}</p>
                  </div>

                  {/* Stats */}
                  <div data-ev-id="ev_5ec0815820" className="flex items-center gap-6 text-sm">
                    <div data-ev-id="ev_689152d2bf" className="text-center">
                      <p data-ev-id="ev_facfba72f4" className="font-bold text-foreground">{creative.impressions.toLocaleString()}</p>
                      <p data-ev-id="ev_cae4742c0c" className="text-muted-foreground text-xs">חשיפות</p>
                    </div>
                    <div data-ev-id="ev_987e713d31" className="text-center">
                      <p data-ev-id="ev_793c624600" className="font-bold text-foreground">{creative.clicks.toLocaleString()}</p>
                      <p data-ev-id="ev_a0ee199ca8" className="text-muted-foreground text-xs">הקלקות</p>
                    </div>
                    <div data-ev-id="ev_2c144f738e" className="text-center">
                      <p data-ev-id="ev_e71bcc10bd" className="font-bold text-green-500">{creative.ctr}%</p>
                      <p data-ev-id="ev_2e8a90997f" className="text-muted-foreground text-xs">CTR</p>
                    </div>
                  </div>
                </motion.div>
            )}
            </div>
          </motion.div>
        }

        {/* Footer */}
        <div data-ev-id="ev_3499205a4e" className="text-center mt-8 text-muted-foreground text-sm">
          <p data-ev-id="ev_d6b82c962d">הנתונים מתעדכנים בזמן אמת</p>
          <p data-ev-id="ev_742f32ab0a" className="mt-1">עדכון אחרון: {new Date().toLocaleDateString('he-IL')} {new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>
    </div>);

}