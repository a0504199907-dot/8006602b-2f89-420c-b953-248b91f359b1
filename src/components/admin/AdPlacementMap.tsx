import { useState } from 'react';
import {
  Monitor,
  Smartphone,
  X,
  Check,
  Eye,
  Info } from
'lucide-react';

interface AdPlacementMapProps {
  onSelectSlot?: (slotName: string) => void;
  selectedSlot?: string;
  activeSlots?: string[]; // Slots that have active ads
}

const SLOT_POSITIONS: Record<string, {top: string;left: string;width: string;height: string;label: string;}> = {
  // Desktop positions
  'top-banner': { top: '8%', left: '15%', width: '70%', height: '8%', label: 'באנר עליון' },
  'leaderboard': { top: '8%', left: '5%', width: '90%', height: '6%', label: 'ליידרבורד' },
  'sidebar-top': { top: '20%', left: '75%', width: '20%', height: '15%', label: 'סיידבר עליון' },
  'sidebar-mid': { top: '40%', left: '75%', width: '20%', height: '15%', label: 'סיידבר אמצע' },
  'sidebar-bottom': { top: '60%', left: '75%', width: '20%', height: '15%', label: 'סיידבר תחתון' },
  'sidebar-sticky': { top: '35%', left: '75%', width: '20%', height: '30%', label: 'סיידבר נצמד' },
  'mid-content': { top: '45%', left: '15%', width: '55%', height: '8%', label: 'בין כתבות' },
  'article-top': { top: '18%', left: '15%', width: '55%', height: '6%', label: 'ראש כתבה' },
  'in-article': { top: '50%', left: '25%', width: '35%', height: '12%', label: 'בתוך כתבה' },
  'article-bottom': { top: '75%', left: '15%', width: '55%', height: '6%', label: 'תחתית כתבה' },
  'bottom-banner': { top: '88%', left: '10%', width: '80%', height: '8%', label: 'באנר תחתית' },
  'floating-bottom': { top: '92%', left: '20%', width: '60%', height: '6%', label: 'צף בתחתית' },
  'floating-corner': { top: '70%', left: '2%', width: '18%', height: '15%', label: 'צף בפינה' },
  'popup': { top: '25%', left: '25%', width: '50%', height: '40%', label: 'פופאפ' }
};

const MOBILE_POSITIONS: Record<string, {top: string;left: string;width: string;height: string;label: string;}> = {
  'mobile-top': { top: '10%', left: '10%', width: '80%', height: '8%', label: 'מובייל עליון' },
  'mobile-sticky': { top: '90%', left: '10%', width: '80%', height: '8%', label: 'מובייל צף' },
  'mobile-native': { top: '40%', left: '10%', width: '80%', height: '15%', label: 'מובייל נייטיב' },
  'mobile-interstitial': { top: '15%', left: '5%', width: '90%', height: '70%', label: 'מסך מלא' }
};

export default function AdPlacementMap({ onSelectSlot, selectedSlot, activeSlots = [] }: AdPlacementMapProps) {
  const [view, setView] = useState<'desktop' | 'mobile'>('desktop');
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);

  const positions = view === 'desktop' ? SLOT_POSITIONS : MOBILE_POSITIONS;

  return (
    <div data-ev-id="ev_5f793e3f45" className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
      {/* Header */}
      <div data-ev-id="ev_af4d4b5380" className="flex items-center justify-between mb-4">
        <h3 data-ev-id="ev_ff79f0bacb" className="text-lg font-bold text-white flex items-center gap-2">
          <Eye className="w-5 h-5 text-amber-400" />
          מפת מיקומי פרסום
        </h3>
        <div data-ev-id="ev_7eee63ad44" className="flex gap-2">
          <button data-ev-id="ev_93bcfecf5a"
          onClick={() => setView('desktop')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
          view === 'desktop' ?
          'bg-amber-500 text-black font-medium' :
          'bg-zinc-800 text-zinc-400 hover:text-white'}`
          }>

            <Monitor className="w-4 h-4" />
            דסקטופ
          </button>
          <button data-ev-id="ev_1850f742f8"
          onClick={() => setView('mobile')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
          view === 'mobile' ?
          'bg-amber-500 text-black font-medium' :
          'bg-zinc-800 text-zinc-400 hover:text-white'}`
          }>

            <Smartphone className="w-4 h-4" />
            מובייל
          </button>
        </div>
      </div>

      {/* Visual Map */}
      <div data-ev-id="ev_66c5d48511"
      className={`relative bg-zinc-950 rounded-xl border border-zinc-700 overflow-hidden ${
      view === 'desktop' ? 'aspect-video' : 'aspect-[9/16] max-w-[200px] mx-auto'}`
      }>

        {/* Site mockup background */}
        <div data-ev-id="ev_1f60d347fc" className="absolute inset-0 p-4">
          {/* Header mockup */}
          <div data-ev-id="ev_fb6022af8f" className="h-6 bg-zinc-800 rounded mb-2 flex items-center px-2">
            <div data-ev-id="ev_016c031d72" className="w-16 h-3 bg-amber-500/30 rounded" />
          </div>
          
          {/* Content area mockup */}
          <div data-ev-id="ev_c07acd23f2" className="flex gap-2 h-[calc(100%-40px)]">
            <div data-ev-id="ev_6a9b155270" className="flex-1 flex flex-col gap-2">
              {[1, 2, 3, 4].map((i) =>
              <div data-ev-id="ev_1d95203666" key={i} className="flex-1 bg-zinc-800/50 rounded p-2">
                  <div data-ev-id="ev_c054b216cb" className="w-full h-2 bg-zinc-700 rounded mb-1" />
                  <div data-ev-id="ev_96600c654b" className="w-3/4 h-2 bg-zinc-700/50 rounded" />
                </div>
              )}
            </div>
            {view === 'desktop' &&
            <div data-ev-id="ev_52ebe8a392" className="w-1/4 flex flex-col gap-2">
                {[1, 2].map((i) =>
              <div data-ev-id="ev_dad4453025" key={i} className="flex-1 bg-zinc-800/30 rounded" />
              )}
              </div>
            }
          </div>
        </div>

        {/* Ad Slots Overlay */}
        {Object.entries(positions).map(([slotName, pos]) => {
          const isActive = activeSlots.includes(slotName);
          const isSelected = selectedSlot === slotName;
          const isHovered = hoveredSlot === slotName;

          return (
            <div data-ev-id="ev_2c59fb90d3"
            key={slotName}
            onClick={() => onSelectSlot?.(slotName)}
            onMouseEnter={() => setHoveredSlot(slotName)}
            onMouseLeave={() => setHoveredSlot(null)}
            className={`absolute cursor-pointer transition-all duration-200 rounded border-2 flex items-center justify-center ${
            isSelected ?
            'bg-amber-500/40 border-amber-500 z-20' :
            isActive ?
            'bg-green-500/30 border-green-500 z-10' :
            isHovered ?
            'bg-blue-500/30 border-blue-500 z-10' :
            'bg-zinc-600/20 border-zinc-600 border-dashed hover:border-solid'}`
            }
            style={{
              top: pos.top,
              left: pos.left,
              width: pos.width,
              height: pos.height
            }}>

              <span data-ev-id="ev_a28860471c" className={`text-xs font-medium px-1 py-0.5 rounded text-center leading-tight ${
              isSelected ?
              'bg-amber-500 text-black' :
              isActive ?
              'bg-green-500 text-black' :
              'bg-zinc-800 text-zinc-300'}`
              }>
                {pos.label}
              </span>
              
              {/* Status indicator */}
              {isActive &&
              <div data-ev-id="ev_6b33308df0" className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              }
            </div>);

        })}
      </div>

      {/* Legend */}
      <div data-ev-id="ev_c9f9c96d41" className="flex flex-wrap items-center gap-4 mt-4 text-sm">
        <div data-ev-id="ev_f8ebf114b1" className="flex items-center gap-2">
          <div data-ev-id="ev_6267c1567b" className="w-4 h-4 rounded border-2 border-dashed border-zinc-600 bg-zinc-600/20" />
          <span data-ev-id="ev_f4ae1c8ef8" className="text-zinc-400">מיקום פנוי</span>
        </div>
        <div data-ev-id="ev_9444360754" className="flex items-center gap-2">
          <div data-ev-id="ev_2a57c57885" className="w-4 h-4 rounded border-2 border-green-500 bg-green-500/30" />
          <span data-ev-id="ev_25c8c6958e" className="text-zinc-400">פרסום פעיל</span>
        </div>
        <div data-ev-id="ev_4f89a121dc" className="flex items-center gap-2">
          <div data-ev-id="ev_36ed5b3c06" className="w-4 h-4 rounded border-2 border-amber-500 bg-amber-500/40" />
          <span data-ev-id="ev_bae1cffe2d" className="text-zinc-400">נבחר</span>
        </div>
      </div>

      {/* Hovered slot info */}
      {hoveredSlot &&
      <div data-ev-id="ev_6476080ba2" className="mt-4 p-3 bg-zinc-800 rounded-lg flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div data-ev-id="ev_a540849e7c">
            <p data-ev-id="ev_a1154edeaa" className="text-white font-medium">{positions[hoveredSlot]?.label}</p>
            <p data-ev-id="ev_a8489dd500" className="text-zinc-400 text-sm">
              לחץ לבחירת מיקום זה לפרסום
            </p>
          </div>
        </div>
      }
    </div>);

}