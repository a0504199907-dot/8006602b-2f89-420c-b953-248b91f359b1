import { useState } from 'react';
import { Plus, Image as ImageIcon, Trash2, ToggleRight, ToggleLeft, PanelLeft, PanelRight, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { AD_SLOTS, PAGE_TYPE_LABELS, getSlotName, type PageType, type SlotPosition } from '@/hooks/useAds';

interface Placement {
  id: string;
  creative_id: string;
  slot_name: string;
  is_active: boolean;
  section?: string | null;
  creative?: {
    id: string;
    name: string;
    image_url: string;
    size?: string;
    campaign?: { name: string };
  };
}

interface PageLayoutPreviewProps {
  pageType: PageType;
  placements: Placement[];
  onAddPlacement: (pageType: PageType, position: SlotPosition) => void;
  onTogglePlacement: (placement: Placement) => void;
  onDeletePlacement: (id: string) => void;
}

interface AdSlotProps {
  pageType: PageType;
  position: SlotPosition;
  height?: string;
  label: string;
  sizeLabel: string;
  placements: Placement[];
  expanded: boolean;
  onToggleExpand: () => void;
  onAdd: () => void;
  onTogglePlacement: (p: Placement) => void;
  onDeletePlacement: (id: string) => void;
}

function AdSlot({
  height = 'h-32',
  label,
  sizeLabel,
  placements,
  expanded,
  onToggleExpand,
  onAdd,
  onTogglePlacement,
  onDeletePlacement
}: AdSlotProps) {
  const activeCount = placements.filter(p => p.is_active).length;
  const inactiveCount = placements.length - activeCount;
  const featured = placements.find(p => p.is_active) || placements[0] || null;
  const hasAny = placements.length > 0;
  const hasActive = activeCount > 0;

  return (
    <div className={`relative rounded-lg border-2 transition-all ${height} ${
      hasActive ? 'border-green-500 bg-green-50/80' : hasAny ? 'border-amber-400 bg-amber-50/40' : 'border-dashed border-gray-300 bg-gray-50/50 hover:border-amber-400 hover:bg-amber-50/30'
    }`}>
      <div className="absolute top-0 left-0 right-0 bg-white/95 backdrop-blur-sm px-2 py-1 border-b border-gray-200 flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[11px] font-bold text-gray-700 truncate">{label}</span>
          {hasAny && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${hasActive ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}`} title="פעיל / סה\"כ">
              {activeCount}/{placements.length}
            </span>
          )}
        </div>
        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${hasActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
          {sizeLabel}
        </span>
      </div>

      <div className="absolute inset-0 pt-7 p-1.5 flex flex-col">
        {featured ? (
          <div className="flex-1 flex flex-col min-h-0">
            {featured.creative?.image_url ? (
              <img src={featured.creative.image_url} alt="" className="flex-1 w-full object-cover rounded min-h-0" />
            ) : (
              <div className="flex-1 bg-green-100 rounded flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-green-400" />
              </div>
            )}
            <div className="flex items-center justify-between mt-1 bg-white rounded px-1.5 py-1 gap-1">
              <span className="text-[10px] text-gray-600 truncate flex-1">{featured.creative?.name || 'פרסומת'}</span>
              <div className="flex items-center gap-0.5">
                <button onClick={onToggleExpand} className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 rounded" title="נהל את כל הפרסומות בסלוט">
                  <Layers className="w-3 h-3" />
                  <span>{placements.length}</span>
                  {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                <button onClick={onAdd} className="p-0.5 text-secondary hover:bg-secondary/10 rounded" title="הוסף פרסומת נוספת">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button onClick={onAdd} className="flex-1 flex flex-col items-center justify-center text-gray-400 hover:text-amber-500 transition-colors rounded hover:bg-amber-50">
            <Plus className="w-8 h-8 mb-1" />
            <span className="text-xs font-medium">הוסף פרסומת</span>
          </button>
        )}
      </div>

      {inactiveCount > 0 && !expanded && (
        <div className="absolute bottom-1 left-1 bg-gray-500/90 text-white text-[9px] px-1.5 py-0.5 rounded">+{inactiveCount} מושבתים</div>
      )}

      {expanded && hasAny && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-lg shadow-xl border border-gray-200 z-30 overflow-hidden">
          <div className="px-3 py-2 bg-gray-50 border-b text-xs font-bold text-gray-700 flex items-center justify-between">
            <span>{placements.length} פרסומות בסלוט "{label}"</span>
            <button onClick={onToggleExpand} className="text-gray-500 hover:text-gray-800"><ChevronUp className="w-4 h-4" /></button>
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
            {placements.map((p) => (
              <div key={p.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50">
                <div className="w-10 h-8 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                  {p.creative?.image_url ? (
                    <img src={p.creative.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-3 h-3 text-gray-400" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{p.creative?.name || 'ללא שם'}</p>
                  <p className="text-[10px] text-gray-500 truncate">{p.creative?.campaign?.name || 'ללא קמפיין'}{p.section && p.section !== 'default' && ` • ${p.section}`}</p>
                </div>
                <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{p.is_active ? 'פעיל' : 'מושבת'}</span>
                <div className="flex items-center gap-0.5">
                  <button onClick={() => onTogglePlacement(p)} className={`p-1 rounded transition-colors ${p.is_active ? 'text-green-500 hover:bg-green-100' : 'text-gray-400 hover:bg-gray-100'}`} title={p.is_active ? 'כבה' : 'הפעל'}>
                    {p.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  </button>
                  <button onClick={() => onDeletePlacement(p.id)} className="p-1 text-red-500 hover:bg-red-100 rounded" title="מחק שיבוץ"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={onAdd} className="w-full px-3 py-2 bg-secondary/10 text-secondary text-xs font-bold hover:bg-secondary/20 flex items-center justify-center gap-1"><Plus className="w-3.5 h-3.5" /> הוסף פרסומת לסלוט זה</button>
        </div>
      )}
    </div>
  );
}

interface FloatingAdProps {
  pageType: PageType;
  position: 'floating-left' | 'floating-right';
  side: 'left' | 'right';
  placements: Placement[];
  expanded: boolean;
  onToggleExpand: () => void;
  onAdd: () => void;
  onTogglePlacement: (p: Placement) => void;
  onDeletePlacement: (id: string) => void;
}

function FloatingAd({ pageType, position, side, placements, expanded, onToggleExpand, onAdd, onTogglePlacement, onDeletePlacement }: FloatingAdProps) {
  const slotConfig = AD_SLOTS[pageType]?.[position];
  if (!slotConfig) return null;
  const activeCount = placements.filter(p => p.is_active).length;
  const featured = placements.find(p => p.is_active) || placements[0] || null;
  const hasAny = placements.length > 0;
  const hasActive = activeCount > 0;
  return (
    <div className={`absolute top-20 ${side === 'left' ? 'left-2' : 'right-2'} w-20 z-20`}>
      <div className={`rounded-lg border-2 transition-all overflow-hidden h-64 ${hasActive ? 'border-green-500 bg-green-50' : hasAny ? 'border-amber-400 bg-amber-50' : 'border-dashed border-amber-400 bg-amber-50/50'}`}>
        <div className="bg-white/95 px-1 py-0.5 text-center border-b">
          <span className="text-[9px] font-bold text-gray-700 flex items-center justify-center gap-1">
            {side === 'left' ? <PanelLeft className="w-3 h-3" /> : <PanelRight className="w-3 h-3" />}
            {slotConfig.name}
          </span>
          <span className="text-[8px] text-gray-500 block">{slotConfig.size}{hasAny && ` • ${activeCount}/${placements.length}`}</span>
        </div>
        {featured ? (
          <div className="p-1 h-full flex flex-col">
            {featured.creative?.image_url ? (
              <img src={featured.creative.image_url} alt="" className="w-full h-40 object-cover rounded" />
            ) : (
              <div className="h-40 bg-green-100 rounded flex items-center justify-center"><ImageIcon className="w-4 h-4 text-green-400" /></div>
            )}
            <div className="flex justify-center gap-1 mt-1">
              <button onClick={onToggleExpand} className="flex items-center gap-0.5 px-1 text-[9px] bg-blue-50 text-blue-600 rounded"><Layers className="w-2.5 h-2.5" />{placements.length}</button>
              <button onClick={onAdd} className="p-0.5 text-secondary hover:bg-secondary/10 rounded"><Plus className="w-3 h-3" /></button>
            </div>
          </div>
        ) : (
          <button onClick={onAdd} className="w-full h-56 flex flex-col items-center justify-center text-amber-500 hover:bg-amber-100 transition-colors"><Plus className="w-6 h-6" /><span className="text-[9px] font-medium mt-1">הוסף</span></button>
        )}
      </div>
      {expanded && hasAny && (
        <div className={`absolute top-0 ${side === 'left' ? 'left-24' : 'right-24'} w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-30 overflow-hidden`}>
          <div className="px-3 py-2 bg-gray-50 border-b text-xs font-bold text-gray-700 flex items-center justify-between">
            <span>{placements.length} פרסומות • {slotConfig.name}</span>
            <button onClick={onToggleExpand} className="text-gray-500 hover:text-gray-800"><ChevronUp className="w-4 h-4" /></button>
          </div>
          <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
            {placements.map((p) => (
              <div key={p.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50">
                <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                  {p.creative?.image_url && <img src={p.creative.image_url} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{p.creative?.name || 'ללא שם'}</p>
                  <p className="text-[10px] text-gray-500 truncate">{p.creative?.campaign?.name || ''}</p>
                </div>
                <button onClick={() => onTogglePlacement(p)} className={p.is_active ? 'text-green-500 p-1' : 'text-gray-400 p-1'}>
                  {p.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </button>
                <button onClick={() => onDeletePlacement(p.id)} className="text-red-500 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PageLayoutPreview({ pageType, placements, onAddPlacement, onTogglePlacement, onDeletePlacement }: PageLayoutPreviewProps) {
  const [expandedSlot, setExpandedSlot] = useState<SlotPosition | null>(null);
  const getPlacementsForSlot = (position: SlotPosition): Placement[] => {
    const slotName = getSlotName(pageType, position);
    return placements.filter(p => p.slot_name === slotName);
  };
  const slotProps = (position: SlotPosition) => ({
    pageType, position,
    placements: getPlacementsForSlot(position),
    expanded: expandedSlot === position,
    onToggleExpand: () => setExpandedSlot(prev => prev === position ? null : position),
    onAdd: () => onAddPlacement(pageType, position),
    onTogglePlacement, onDeletePlacement
  });

  if (pageType === 'home') {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-visible relative">
        <div className="bg-gray-100 px-4 py-3 flex items-center gap-3 border-b">
          <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-yellow-400" /><div className="w-3 h-3 rounded-full bg-green-400" /></div>
          <div className="flex-1 bg-white rounded-lg px-4 py-1.5 text-sm text-gray-500 text-center border">🏠 {PAGE_TYPE_LABELS[pageType]}</div>
        </div>
        <FloatingAd {...slotProps('floating-right')} side="right" />
        <FloatingAd {...slotProps('floating-left')} side="left" />
        <div className="p-6 bg-gradient-to-b from-gray-50 to-white mx-24">
          <div className="h-14 bg-gray-800 rounded-xl mb-4 flex items-center justify-between px-6"><div className="w-28 h-7 bg-amber-500 rounded" /><div className="flex gap-4"><div className="w-14 h-4 bg-gray-600 rounded" /><div className="w-14 h-4 bg-gray-600 rounded" /><div className="w-14 h-4 bg-gray-600 rounded" /></div></div>
          <div className="mb-4 relative"><AdSlot {...slotProps('top-banner')} label="באנר עליון רחב" sizeLabel="970x90" height="h-16" /></div>
          <div className="h-40 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl mb-4 flex items-center justify-center"><span className="text-gray-400 font-medium">כתבה ראשית</span></div>
          <div className="grid grid-cols-3 gap-3 mb-4">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-lg" />)}</div>
          <div className="my-6 relative"><AdSlot {...slotProps('in-feed')} label="פרסומת בין המדורים" sizeLabel="728x90" height="h-20" /></div>
          <div className="grid grid-cols-3 gap-3 mb-4">{[4, 5, 6].map(i => <div key={i} className="h-24 bg-gray-100 rounded-lg" />)}</div>
          <div className="mt-6 relative"><AdSlot {...slotProps('bottom')} label="באנר תחתון גדול" sizeLabel="970x250" height="h-28" /></div>
        </div>
      </div>
    );
  }

  if (pageType === 'section') {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-visible relative">
        <div className="bg-gray-100 px-4 py-3 flex items-center gap-3 border-b">
          <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-yellow-400" /><div className="w-3 h-3 rounded-full bg-green-400" /></div>
          <div className="flex-1 bg-white rounded-lg px-4 py-1.5 text-sm text-gray-500 text-center border">📂 {PAGE_TYPE_LABELS[pageType]}</div>
        </div>
        <FloatingAd {...slotProps('floating-right')} side="right" />
        <FloatingAd {...slotProps('floating-left')} side="left" />
        <div className="p-6 bg-gradient-to-b from-gray-50 to-white mx-24">
          <div className="h-14 bg-gray-800 rounded-xl mb-4 flex items-center justify-between px-6"><div className="w-28 h-7 bg-amber-500 rounded" /><div className="flex gap-4"><div className="w-14 h-4 bg-gray-600 rounded" /><div className="w-14 h-4 bg-gray-600 rounded" /></div></div>
          <div className="flex items-center gap-3 mb-4"><div className="w-1.5 h-10 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full" /><div className="w-40 h-7 bg-gray-300 rounded" /></div>
          <div className="flex flex-col gap-3">{[1, 2, 3, 4].map(i => (<div key={i} className="flex gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100"><div className="w-28 h-20 bg-gray-200 rounded-lg" /><div className="flex-1 py-2"><div className="w-4/5 h-5 bg-gray-300 rounded mb-2" /><div className="w-2/3 h-3 bg-gray-200 rounded" /></div></div>))}</div>
          <div className="mt-6 relative"><AdSlot {...slotProps('bottom')} label="באנר תחתון" sizeLabel="970x250" height="h-28" /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-visible">
      <div className="bg-gray-100 px-4 py-3 flex items-center gap-3 border-b">
        <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-yellow-400" /><div className="w-3 h-3 rounded-full bg-green-400" /></div>
        <div className="flex-1 bg-white rounded-lg px-4 py-1.5 text-sm text-gray-500 text-center border">📝 {PAGE_TYPE_LABELS[pageType]} - כותרת הכתבה</div>
      </div>
      <div className="p-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="h-14 bg-gray-800 rounded-xl mb-4 flex items-center justify-between px-6"><div className="w-28 h-7 bg-amber-500 rounded" /><div className="flex gap-4"><div className="w-14 h-4 bg-gray-600 rounded" /><div className="w-14 h-4 bg-gray-600 rounded" /></div></div>
        <div className="flex gap-6">
          <div className="flex-1">
            <div className="w-4/5 h-8 bg-gray-300 rounded mb-3" />
            <div className="w-1/2 h-4 bg-gray-200 rounded mb-4" />
            <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl mb-4 flex items-center justify-center"><span className="text-gray-400">תמונה ראשית</span></div>
            <div className="flex flex-col gap-2 mb-4">{[1, 2, 3, 4, 5].map(i => (<div key={i} className={`h-3 bg-gray-100 rounded ${i === 5 ? 'w-3/4' : 'w-full'}`} />))}</div>
          </div>
          <div className="w-56 flex flex-col gap-4">
            <div className="text-xs text-gray-400">← חזרה למדור</div>
            <div className="relative"><AdSlot {...slotProps('sidebar-1')} label="פרסומת גדולה" sizeLabel="300x600" height="h-52" /></div>
            <div className="flex flex-col gap-3">
              <div className="relative"><AdSlot {...slotProps('sidebar-2')} label="פרסומת קטנה 1" sizeLabel="300x250" height="h-32" /></div>
              <div className="relative"><AdSlot {...slotProps('sidebar-3')} label="פרסומת קטנה 2" sizeLabel="300x250" height="h-32" /></div>
            </div>
          </div>
        </div>
        <div className="mt-6 relative"><AdSlot {...slotProps('bottom')} label="באנר תחתון" sizeLabel="728x90" height="h-20" /></div>
      </div>
    </div>
  );
}
