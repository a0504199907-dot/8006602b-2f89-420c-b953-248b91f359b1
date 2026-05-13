import { useState } from 'react';
import { PAGE_AD_SLOTS } from '@/components/ui/PageAds';
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
  Monitor,
  Smartphone,
  Check,
  AlertCircle } from
'lucide-react';

interface VisualAdMapProps {
  onSelectSlot?: (slot: string, page: string, position: string) => void;
  selectedSlot?: string;
  activeSlots?: string[];
}

const PAGE_INFO: Record<string, {name: string;icon: any;path: string;}> = {
  'home': { name: 'דף הבית', icon: Home, path: '/' },
  'siah-list': { name: 'שיח הציבור', icon: FileText, path: '/siah' },
  'siah-detail': { name: 'כתבה בשיח', icon: FileText, path: '/siah/:id' },
  'before18-list': { name: 'לפני 18 שנה', icon: Clock, path: '/before-18' },
  'bein-list': { name: 'בעין הציבור', icon: Eye, path: '/bein-hatzibur' },
  'news-list': { name: 'נייעס בציבור', icon: Newspaper, path: '/news-batzibur' },
  'news-detail': { name: 'ידיעה', icon: Newspaper, path: '/news/:id' },
  'historical-list': { name: 'אירועים היסטוריים', icon: History, path: '/historical' },
  'historical-detail': { name: 'אירוע היסטורי', icon: History, path: '/historical/:id' },
  'newspaper': { name: 'עיתון', icon: Newspaper, path: '/newspaper' },
  'gallery-list': { name: 'גלריות', icon: Image, path: '/gallery' },
  'gallery-detail': { name: 'אלבום', icon: Image, path: '/gallery/:id' },
  'events-list': { name: 'אירועים', icon: Calendar, path: '/events' },
  'event-detail': { name: 'אירוע', icon: Calendar, path: '/events/:id' },
  'video-list': { name: 'סרטונים', icon: Video, path: '/video' },
  'video-detail': { name: 'סרטון', icon: Video, path: '/video/:id' },
  'articles-list': { name: 'כתבות', icon: FileText, path: '/articles' },
  'article-detail': { name: 'כתבה', icon: FileText, path: '/article/:id' }
};

const POSITION_LABELS: Record<string, string> = {
  'top': 'באנר עליון',
  'middle': 'באנר אמצע',
  'bottom': 'באנר תחתון',
  'sidebar-top': 'צד עליון',
  'sidebar-bottom': 'צד תחתון',
  'in-content': 'בתוך תוכן'
};

export default function VisualAdMap({ onSelectSlot, selectedSlot, activeSlots = [] }: VisualAdMapProps) {
  const [selectedPage, setSelectedPage] = useState('home');
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');

  const pages = Object.keys(PAGE_AD_SLOTS);
  const currentPageInfo = PAGE_INFO[selectedPage];
  const currentSlots = PAGE_AD_SLOTS[selectedPage] || {};

  const isSlotActive = (slot: string) => activeSlots.includes(slot);
  const isSlotSelected = (slot: string) => selectedSlot === slot;

  const SlotButton = ({ position, slot, size }: {position: string;slot: string;size: string;}) => {
    const active = isSlotActive(slot);
    const selected = isSlotSelected(slot);

    return (
      <button data-ev-id="ev_0ef32fe14d"
      onClick={() => onSelectSlot?.(slot, selectedPage, position)}
      className={`w-full transition-all border-2 border-dashed flex items-center justify-center gap-2 text-sm font-medium ${
      selected ?
      'bg-amber-500 border-amber-500 text-black' :
      active ?
      'bg-emerald-500/20 border-emerald-500 text-emerald-400 hover:bg-emerald-500/30' :
      'bg-zinc-800/50 border-zinc-600 text-zinc-400 hover:border-zinc-500 hover:bg-zinc-800'}`
      }
      style={{
        height: size === '728x90' || size === '320x100' ? '40px' : size === '970x250' ? '80px' : '100px',
        minHeight: size === '300x250' ? '100px' : undefined
      }}>

        {active ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
        <span data-ev-id="ev_b2076658eb">{POSITION_LABELS[position]}</span>
        <span data-ev-id="ev_76b2cad95d" className="text-xs opacity-60">({size})</span>
      </button>);

  };

  return (
    <div data-ev-id="ev_a54bf0254d" className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div data-ev-id="ev_c4b7400ed6" className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <h3 data-ev-id="ev_ad30d1c0b6" className="text-lg font-bold text-white">מפה ויזואלית - מיקומי פרסום</h3>
        <div data-ev-id="ev_0e7e283b6d" className="flex items-center gap-2">
          <button data-ev-id="ev_9baac0f290"
          onClick={() => setDeviceView('desktop')}
          className={`p-2 rounded-lg transition-colors ${
          deviceView === 'desktop' ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`
          }>

            <Monitor className="w-5 h-5" />
          </button>
          <button data-ev-id="ev_16c49850cb"
          onClick={() => setDeviceView('mobile')}
          className={`p-2 rounded-lg transition-colors ${
          deviceView === 'mobile' ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`
          }>

            <Smartphone className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Page Selector */}
      <div data-ev-id="ev_6dd33e33fc" className="p-4 border-b border-zinc-800">
        <div data-ev-id="ev_e7c6e5a265" className="flex flex-wrap gap-2">
          {pages.map((page) => {
            const info = PAGE_INFO[page];
            const Icon = info?.icon || FileText;
            const pageSlots = Object.values(PAGE_AD_SLOTS[page] || {});
            const activeCount = pageSlots.filter((s) => activeSlots.includes(s.slot)).length;

            return (
              <button data-ev-id="ev_c5c222cf37"
              key={page}
              onClick={() => setSelectedPage(page)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedPage === page ?
              'bg-amber-500 text-black font-medium' :
              'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`
              }>

                <Icon className="w-4 h-4" />
                <span data-ev-id="ev_279e040347">{info?.name || page}</span>
                <span data-ev-id="ev_248ee01e46" className={`text-xs px-1.5 py-0.5 rounded ${
                activeCount === pageSlots.length && pageSlots.length > 0 ?
                'bg-emerald-500 text-white' :
                activeCount > 0 ?
                'bg-amber-500 text-black' :
                'bg-zinc-600 text-zinc-300'}`
                }>
                  {activeCount}/{pageSlots.length}
                </span>
              </button>);

          })}
        </div>
      </div>

      {/* Visual Page Layout */}
      <div data-ev-id="ev_45dedc6478" className="p-6">
        <div data-ev-id="ev_7a755239b2" className="text-center mb-4">
          <h4 data-ev-id="ev_7eeb50d163" className="text-white font-bold">{currentPageInfo?.name || selectedPage}</h4>
          <p data-ev-id="ev_36d7f8b807" className="text-zinc-500 text-sm">{currentPageInfo?.path}</p>
        </div>

        {/* Page Preview */}
        <div data-ev-id="ev_14dcd84ee5" className={`mx-auto bg-zinc-950 border border-zinc-700 overflow-hidden ${
        deviceView === 'desktop' ? 'max-w-3xl' : 'max-w-sm'}`
        }>
          
          {/* Header Mockup */}
          <div data-ev-id="ev_0d7a66e970" className="h-12 bg-zinc-800 border-b border-zinc-700 flex items-center justify-between px-4">
            <div data-ev-id="ev_b124ba5b4a" className="flex items-center gap-2">
              <div data-ev-id="ev_2fae0df17c" className="w-8 h-8 bg-amber-500 rounded" />
              <div data-ev-id="ev_508274a9f2" className="w-20 h-3 bg-zinc-600 rounded" />
            </div>
            <div data-ev-id="ev_02260bb5c9" className="flex gap-2">
              {[1, 2, 3, 4].map((i) =>
              <div data-ev-id="ev_37ea3854ab" key={i} className="w-12 h-3 bg-zinc-600 rounded" />
              )}
            </div>
          </div>

          {/* Content Area */}
          <div data-ev-id="ev_6cc589657a" className="p-4 flex flex-col gap-4">
            
            {/* Top Banner */}
            {currentSlots['top'] &&
            <SlotButton
              position="top"
              slot={currentSlots['top'].slot}
              size={currentSlots['top'].size} />

            }

            {/* Main Content Row */}
            <div data-ev-id="ev_46a51a089b" className={`flex gap-4 ${deviceView === 'mobile' ? 'flex-col' : ''}`}>
              {/* Main Content */}
              <div data-ev-id="ev_61bf354f98" className="flex-1 flex flex-col gap-4">
                {/* Content Placeholder */}
                <div data-ev-id="ev_84a39c1f3b" className="bg-zinc-800/30 p-4 rounded border border-zinc-700/50">
                  <div data-ev-id="ev_ddab4dff47" className="w-3/4 h-4 bg-zinc-700 rounded mb-3" />
                  <div data-ev-id="ev_59eed20490" className="w-full h-3 bg-zinc-700/50 rounded mb-2" />
                  <div data-ev-id="ev_fa915c49e4" className="w-full h-3 bg-zinc-700/50 rounded mb-2" />
                  <div data-ev-id="ev_c71ddf5237" className="w-2/3 h-3 bg-zinc-700/50 rounded" />
                </div>

                {/* Middle Banner */}
                {currentSlots['middle'] &&
                <SlotButton
                  position="middle"
                  slot={currentSlots['middle'].slot}
                  size={currentSlots['middle'].size} />

                }

                {/* More Content */}
                <div data-ev-id="ev_8795a5aff4" className="bg-zinc-800/30 p-4 rounded border border-zinc-700/50">
                  <div data-ev-id="ev_73d5a02fac" className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) =>
                    <div data-ev-id="ev_cc8dfca3a1" key={i} className="aspect-video bg-zinc-700/50 rounded" />
                    )}
                  </div>
                </div>

                {/* In-Content Ad */}
                {currentSlots['in-content'] &&
                <SlotButton
                  position="in-content"
                  slot={currentSlots['in-content'].slot}
                  size={currentSlots['in-content'].size} />

                }
              </div>

              {/* Sidebar */}
              {deviceView === 'desktop' && (currentSlots['sidebar-top'] || currentSlots['sidebar-bottom']) &&
              <div data-ev-id="ev_aae7a17234" className="w-[200px] flex flex-col gap-4">
                  {currentSlots['sidebar-top'] &&
                <SlotButton
                  position="sidebar-top"
                  slot={currentSlots['sidebar-top'].slot}
                  size={currentSlots['sidebar-top'].size} />

                }
                  
                  {/* Sidebar Content */}
                  <div data-ev-id="ev_60676c6504" className="bg-zinc-800/30 p-3 rounded border border-zinc-700/50 flex-1">
                    <div data-ev-id="ev_ad188b91d2" className="w-full h-3 bg-zinc-700 rounded mb-2" />
                    <div data-ev-id="ev_fa94d12139" className="w-3/4 h-2 bg-zinc-700/50 rounded mb-2" />
                    <div data-ev-id="ev_e9a5826c64" className="w-full h-2 bg-zinc-700/50 rounded" />
                  </div>

                  {currentSlots['sidebar-bottom'] &&
                <SlotButton
                  position="sidebar-bottom"
                  slot={currentSlots['sidebar-bottom'].slot}
                  size={currentSlots['sidebar-bottom'].size} />

                }
                </div>
              }
            </div>

            {/* Bottom Banner */}
            {currentSlots['bottom'] &&
            <SlotButton
              position="bottom"
              slot={currentSlots['bottom'].slot}
              size={currentSlots['bottom'].size} />

            }
          </div>

          {/* Footer Mockup */}
          <div data-ev-id="ev_0a332ffe19" className="h-16 bg-zinc-800 border-t border-zinc-700 flex items-center justify-center">
            <div data-ev-id="ev_46bf29dc83" className="w-32 h-3 bg-zinc-600 rounded" />
          </div>
        </div>

        {/* Side Ads Preview */}
        <div data-ev-id="ev_96c3630327" className="mt-6 flex justify-between items-center">
          <button data-ev-id="ev_7af59ec7ed"
          onClick={() => onSelectSlot?.('side-left-global', 'global', 'side-left')}
          className={`px-4 py-3 border-2 border-dashed transition-all ${
          isSlotActive('side-left-global') ?
          'bg-emerald-500/20 border-emerald-500 text-emerald-400' :
          'bg-zinc-800/50 border-zinc-600 text-zinc-400 hover:border-zinc-500'}`
          }>

            פרסומת צד שמאל (160x600)
          </button>
          
          <div data-ev-id="ev_2cf3ec0895" className="text-center text-zinc-500 text-sm">
            פרסומות צד מופיעות בכל העמודים<br data-ev-id="ev_bdc0c286ef" />
            עם כפתור X לסגירה
          </div>

          <button data-ev-id="ev_e167c716cc"
          onClick={() => onSelectSlot?.('side-right-global', 'global', 'side-right')}
          className={`px-4 py-3 border-2 border-dashed transition-all ${
          isSlotActive('side-right-global') ?
          'bg-emerald-500/20 border-emerald-500 text-emerald-400' :
          'bg-zinc-800/50 border-zinc-600 text-zinc-400 hover:border-zinc-500'}`
          }>

            פרסומת צד ימין (160x600)
          </button>
        </div>
      </div>

      {/* Legend */}
      <div data-ev-id="ev_b66feeb1cc" className="p-4 border-t border-zinc-800 bg-zinc-950/50">
        <div data-ev-id="ev_a0de80b5a7" className="flex items-center justify-center gap-6 text-sm">
          <div data-ev-id="ev_00d21c85e0" className="flex items-center gap-2">
            <div data-ev-id="ev_6c2d996e21" className="w-3 h-3 bg-emerald-500 rounded" />
            <span data-ev-id="ev_97eea5928b" className="text-zinc-400">פעיל (יש פרסומת)</span>
          </div>
          <div data-ev-id="ev_a637672188" className="flex items-center gap-2">
            <div data-ev-id="ev_286ad28ed4" className="w-3 h-3 bg-zinc-600 rounded" />
            <span data-ev-id="ev_871fa217c8" className="text-zinc-400">ריק (ממתין לפרסומת)</span>
          </div>
          <div data-ev-id="ev_f09e7bf640" className="flex items-center gap-2">
            <div data-ev-id="ev_009a3eed06" className="w-3 h-3 bg-amber-500 rounded" />
            <span data-ev-id="ev_49e12753a4" className="text-zinc-400">נבחר</span>
          </div>
        </div>
      </div>
    </div>);

}