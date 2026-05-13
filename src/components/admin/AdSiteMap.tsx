import { useState } from 'react';
import { PAGE_AD_SLOTS } from '@/components/ui/PageAds';
import { IN_FEED_CONFIG } from '@/components/ui/InFeedAd';
import {
  Home,
  FileText,
  Image,
  Calendar,
  Video,
  Newspaper,
  History,
  Clock,
  Eye,
  ChevronDown,
  ChevronUp,
  Monitor,
  Smartphone,
  Layout as LayoutIcon,
  CheckCircle,
  AlertCircle } from
'lucide-react';

interface AdSiteMapProps {
  onSelectSlot?: (slot: string, page: string) => void;
  activeSlot?: string;
  activeSlots?: string[]; // List of slots that have active ads
}

const PAGE_INFO: Record<string, {name: string;icon: any;path: string;}> = {
  'home': { name: 'דף הבית', icon: Home, path: '/' },
  'siah-list': { name: 'שיח הציבור - רשימה', icon: FileText, path: '/siah' },
  'siah-detail': { name: 'שיח הציבור - כתבה', icon: FileText, path: '/siah/:id' },
  'before18-list': { name: 'לפני 18 שנה', icon: Clock, path: '/before-18' },
  'bein-list': { name: 'בעין הציבור', icon: Eye, path: '/bein-hatzibur' },
  'news-list': { name: 'נייעס בציבור - רשימה', icon: Newspaper, path: '/news-batzibur' },
  'news-detail': { name: 'נייעס בציבור - ידיעה', icon: Newspaper, path: '/news-batzibur/:id' },
  'historical-list': { name: 'אירועים היסטוריים - רשימה', icon: History, path: '/historical' },
  'historical-detail': { name: 'אירועים היסטוריים - פרטים', icon: History, path: '/historical/:id' },
  'newspaper': { name: 'עיתון', icon: Newspaper, path: '/newspaper' },
  'gallery-list': { name: 'גלריות - רשימה', icon: Image, path: '/gallery' },
  'gallery-detail': { name: 'גלריות - אלבום', icon: Image, path: '/gallery/:id' },
  'events-list': { name: 'אירועים - רשימה', icon: Calendar, path: '/events' },
  'event-detail': { name: 'אירועים - פרטים', icon: Calendar, path: '/events/:id' },
  'video-list': { name: 'סרטונים - רשימה', icon: Video, path: '/video' },
  'video-detail': { name: 'סרטונים - פרטים', icon: Video, path: '/video/:id' },
  'articles-list': { name: 'כתבות - רשימה', icon: FileText, path: '/articles' },
  'article-detail': { name: 'כתבות - פרטים', icon: FileText, path: '/article/:id' }
};

const POSITION_LABELS: Record<string, string> = {
  'top': 'באנר עליון',
  'middle': 'באנר אמצע',
  'bottom': 'באנר תחתון',
  'sidebar-top': 'סיידבר עליון',
  'sidebar-bottom': 'סיידבר תחתון',
  'in-content': 'בתוך התוכן'
};

const SIZE_INFO: Record<string, {label: string;responsive: boolean;}> = {
  '728x90': { label: 'באנר רחב', responsive: true },
  '300x250': { label: 'ריבוע', responsive: false },
  '970x250': { label: 'באנר גדול', responsive: true },
  '320x100': { label: 'מובייל', responsive: false }
};

export default function AdSiteMap({ onSelectSlot, activeSlot, activeSlots = [] }: AdSiteMapProps) {
  const [expandedPages, setExpandedPages] = useState<string[]>(['home']);

  const togglePage = (page: string) => {
    setExpandedPages((prev) =>
    prev.includes(page) ?
    prev.filter((p) => p !== page) :
    [...prev, page]
    );
  };

  const pages = Object.keys(PAGE_AD_SLOTS);

  // Calculate stats
  const totalSlots = Object.values(PAGE_AD_SLOTS).reduce(
    (acc, slots) => acc + Object.keys(slots || {}).length,
    0
  );
  const filledSlots = activeSlots.length;

  return (
    <div data-ev-id="ev_f12bff47d6" className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div data-ev-id="ev_b3703bef9f" className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div data-ev-id="ev_ae1d7e62ce" className="flex items-center gap-3">
          <LayoutIcon className="w-5 h-5 text-amber-500" />
          <h3 data-ev-id="ev_a8513d04c3" className="text-lg font-bold text-white">מפת מיקומי פרסום</h3>
        </div>
        <div data-ev-id="ev_f184cb2c35" className="flex items-center gap-4 text-sm">
          <div data-ev-id="ev_0339775b74" className="flex items-center gap-2 text-zinc-400">
            <Monitor className="w-4 h-4" />
            <span data-ev-id="ev_53375fd472">דסקטופ</span>
          </div>
          <div data-ev-id="ev_ebcbf8186c" className="flex items-center gap-2 text-zinc-400">
            <Smartphone className="w-4 h-4" />
            <span data-ev-id="ev_245c2c6aa4">מובייל</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div data-ev-id="ev_2781355ff9" className="p-3 border-b border-zinc-800 bg-zinc-950/50 flex items-center gap-4 text-xs">
        <div data-ev-id="ev_f64ee4d715" className="flex items-center gap-2">
          <div data-ev-id="ev_4bd2b30ab5" className="w-2 h-2 rounded-full bg-emerald-500" />
          <span data-ev-id="ev_5e19f5cc2c" className="text-zinc-400">פעיל (יש פרסומת)</span>
        </div>
        <div data-ev-id="ev_4d472eef10" className="flex items-center gap-2">
          <div data-ev-id="ev_b77ee84fa6" className="w-2 h-2 rounded-full bg-zinc-600" />
          <span data-ev-id="ev_1f9ac7dea2" className="text-zinc-400">ריק (ממתין לפרסומת)</span>
        </div>
        <div data-ev-id="ev_5974e21e8d" className="flex items-center gap-2">
          <div data-ev-id="ev_7ef181e5fb" className="w-2 h-2 rounded-full bg-amber-500" />
          <span data-ev-id="ev_1431fc8d5a" className="text-zinc-400">נבחר</span>
        </div>
      </div>

      {/* Pages List */}
      <div data-ev-id="ev_afcd911170" className="divide-y divide-zinc-800 max-h-[500px] overflow-y-auto">
        {pages.map((pageKey) => {
          const pageInfo = PAGE_INFO[pageKey as keyof typeof PAGE_INFO];
          const slots = PAGE_AD_SLOTS[pageKey];
          const feedConfig = IN_FEED_CONFIG[pageKey];
          const isExpanded = expandedPages.includes(pageKey);
          const Icon = pageInfo?.icon || FileText;

          // Count active slots for this page
          const pageSlots = Object.values(slots || {}).map((s) => s.slot);
          const activeCount = pageSlots.filter((s) => activeSlots.includes(s)).length;

          return (
            <div data-ev-id="ev_d476e02322" key={pageKey}>
              {/* Page Header */}
              <button data-ev-id="ev_65e20acd9a"
              onClick={() => togglePage(pageKey)}
              className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors">

                <div data-ev-id="ev_2b7d006d12" className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-amber-500" />
                  <div data-ev-id="ev_0b93babdda" className="text-right">
                    <div data-ev-id="ev_ad7a7b3212" className="font-medium text-white">{pageInfo?.name || pageKey}</div>
                    <div data-ev-id="ev_add274ffe8" className="text-xs text-zinc-500">{pageInfo?.path || '/'}</div>
                  </div>
                </div>
                <div data-ev-id="ev_d89a61b446" className="flex items-center gap-3">
                  <span data-ev-id="ev_2ce0806ab2" className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                  activeCount === pageSlots.length && pageSlots.length > 0 ?
                  'bg-emerald-500/20 text-emerald-400' :
                  activeCount > 0 ?
                  'bg-amber-500/20 text-amber-400' :
                  'bg-zinc-800 text-zinc-400'}`
                  }>
                    {activeCount}/{pageSlots.length} פעילים
                  </span>
                  {feedConfig &&
                  <span data-ev-id="ev_93e7b19cfd" className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">
                      פרסום בין פריטים
                    </span>
                  }
                  {isExpanded ?
                  <ChevronUp className="w-5 h-5 text-zinc-500" /> :
                  <ChevronDown className="w-5 h-5 text-zinc-500" />
                  }
                </div>
              </button>

              {/* Slots List */}
              {isExpanded && slots &&
              <div data-ev-id="ev_bac81a6c3c" className="bg-zinc-950/50 px-4 pb-4">
                  <div data-ev-id="ev_9aaa7467c9" className="grid gap-2">
                    {Object.entries(slots).map(([position, config]) => {
                    const sizeInfo = SIZE_INFO[config.size];
                    const isSelected = activeSlot === config.slot;
                    const hasActiveAd = activeSlots.includes(config.slot);

                    return (
                      <div data-ev-id="ev_c44bc5b429"
                      key={position}
                      onClick={() => onSelectSlot?.(config.slot, pageKey)}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected ?
                      'border-amber-500 bg-amber-500/10' :
                      hasActiveAd ?
                      'border-emerald-500/50 bg-emerald-500/5 hover:border-emerald-500' :
                      'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50'}`
                      }>

                          <div data-ev-id="ev_d76f66d68f" className="flex items-center gap-3">
                            <div data-ev-id="ev_bf4fa8ed76" className={`w-2 h-2 rounded-full ${
                          isSelected ? 'bg-amber-500' : hasActiveAd ? 'bg-emerald-500' : 'bg-zinc-600'}`
                          } />
                            <div data-ev-id="ev_a241c7cdc5">
                              <div data-ev-id="ev_b49e1fcd79" className="text-sm font-medium text-white flex items-center gap-2">
                                {POSITION_LABELS[position] || position}
                                {hasActiveAd &&
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                              }
                                {!hasActiveAd &&
                              <AlertCircle className="w-3.5 h-3.5 text-zinc-500" />
                              }
                              </div>
                              <div data-ev-id="ev_553067f893" className="text-xs text-zinc-500 font-mono">
                                {config.slot}
                              </div>
                            </div>
                          </div>
                          <div data-ev-id="ev_469dfb3948" className="flex items-center gap-2">
                            <span data-ev-id="ev_34ba3fcaf0" className="px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded font-mono">
                              {config.size}
                            </span>
                            <span data-ev-id="ev_25e32171e6" className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs rounded">
                              {sizeInfo?.label}
                            </span>
                            {sizeInfo?.responsive &&
                          <Monitor className="w-4 h-4 text-blue-400" title="מותאם למובייל" />
                          }
                          </div>
                        </div>);

                  })}

                    {/* In-Feed Ads */}
                    {feedConfig &&
                  <div data-ev-id="ev_55c48cade7" className="mt-2 p-3 rounded-lg border border-purple-500/30 bg-purple-500/5">
                        <div data-ev-id="ev_41cd92aa72" className="flex items-center justify-between">
                          <div data-ev-id="ev_323c52ff01">
                            <div data-ev-id="ev_0369143dc7" className="text-sm font-medium text-purple-400">
                              פרסום בין פריטים
                            </div>
                            <div data-ev-id="ev_e799bf49b9" className="text-xs text-zinc-500">
                              כל {feedConfig.interval} פריטים · {feedConfig.slots.length} סלוטים
                            </div>
                          </div>
                          <div data-ev-id="ev_b0132c9dde" className="flex flex-wrap gap-1">
                            {feedConfig.slots.map((slot, idx) =>
                        <span data-ev-id="ev_7f9f32f59a"
                        key={idx}
                        className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded font-mono">

                                {slot}
                              </span>
                        )}
                          </div>
                        </div>
                      </div>
                  }
                  </div>
                </div>
              }
            </div>);

        })}
      </div>

      {/* Summary */}
      <div data-ev-id="ev_afe7253477" className="p-4 border-t border-zinc-800 bg-zinc-950/50">
        <div data-ev-id="ev_29104ada85" className="grid grid-cols-4 gap-4 text-center">
          <div data-ev-id="ev_1b71b0acc9">
            <div data-ev-id="ev_6474af5da2" className="text-2xl font-bold text-amber-500">
              {pages.length}
            </div>
            <div data-ev-id="ev_c9d6a80a82" className="text-xs text-zinc-500">דפים</div>
          </div>
          <div data-ev-id="ev_8543857010">
            <div data-ev-id="ev_47b7329eb6" className="text-2xl font-bold text-blue-400">
              {totalSlots}
            </div>
            <div data-ev-id="ev_acbbc670b6" className="text-xs text-zinc-500">מיקומי פרסום</div>
          </div>
          <div data-ev-id="ev_b976303fc3">
            <div data-ev-id="ev_bf115df22b" className="text-2xl font-bold text-emerald-400">
              {filledSlots}
            </div>
            <div data-ev-id="ev_2734da3afa" className="text-xs text-zinc-500">פעילים</div>
          </div>
          <div data-ev-id="ev_9d60f3d8c1">
            <div data-ev-id="ev_6f6466d5f2" className="text-2xl font-bold text-purple-400">
              {Object.keys(IN_FEED_CONFIG).length}
            </div>
            <div data-ev-id="ev_e3fceab3de" className="text-xs text-zinc-500">פרסום בפיד</div>
          </div>
        </div>
      </div>
    </div>);

}