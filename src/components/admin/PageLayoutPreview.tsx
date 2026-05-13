import { Plus, Image, Trash2, ToggleRight, ToggleLeft, Eye, PanelLeft, PanelRight } from 'lucide-react';
import { AD_SLOTS, PAGE_TYPE_LABELS, getSlotName, type PageType, type SlotPosition } from '@/hooks/useAds';

interface Placement {
  id: string;
  creative_id: string;
  slot_name: string;
  is_active: boolean;
  creative?: {
    id: string;
    name: string;
    image_url: string;
    campaign?: {name: string;};
  };
}

interface PageLayoutPreviewProps {
  pageType: PageType;
  placements: Placement[];
  onAddPlacement: (pageType: PageType, position: SlotPosition) => void;
  onTogglePlacement: (placement: Placement) => void;
  onDeletePlacement: (id: string) => void;
}

export default function PageLayoutPreview({
  pageType,
  placements,
  onAddPlacement,
  onTogglePlacement,
  onDeletePlacement
}: PageLayoutPreviewProps) {

  const getPlacementsForSlot = (position: SlotPosition) => {
    const slotName = getSlotName(pageType, position);
    return placements.filter((p) => p.slot_name === slotName);
  };

  // Ad Slot Box Component
  const AdSlot = ({
    position,
    height = 'h-32',
    label,
    sizeLabel





  }: {position: SlotPosition;height?: string;label: string;sizeLabel: string;}) => {
    const slotConfig = AD_SLOTS[pageType]?.[position];
    if (!slotConfig) return null;

    const slotPlacements = getPlacementsForSlot(position);
    const hasActive = slotPlacements.some((p) => p.is_active);
    const activePlacement = slotPlacements.find((p) => p.is_active);

    return (
      <div data-ev-id="ev_4d6ab15e51"
      className={`relative rounded-lg border-2 transition-all overflow-hidden ${height} ${
      hasActive ?
      'border-green-500 bg-green-50' :
      'border-dashed border-gray-300 bg-gray-50/50 hover:border-amber-400 hover:bg-amber-50/30'}`
      }>

        {/* Header */}
        <div data-ev-id="ev_1acdb6b0d0" className="absolute top-0 left-0 right-0 bg-white/90 backdrop-blur-sm px-2 py-1 border-b border-gray-200 flex items-center justify-between z-10">
          <span data-ev-id="ev_c9aa2efb94" className="text-[11px] font-bold text-gray-700">{label}</span>
          <span data-ev-id="ev_bec81e5f72"
          className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${
          hasActive ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`
          }>

            {sizeLabel}
          </span>
        </div>

        {/* Content */}
        <div data-ev-id="ev_20040fd013" className="absolute inset-0 pt-7 p-2 flex flex-col">
          {activePlacement ?
          <div data-ev-id="ev_a28221a332" className="flex-1 flex flex-col">
              {activePlacement.creative?.image_url ?
            <img data-ev-id="ev_55ab909d33"
            src={activePlacement.creative.image_url}
            alt=""
            className="flex-1 w-full object-cover rounded" /> :


            <div data-ev-id="ev_c1b51dcd70" className="flex-1 bg-green-100 rounded flex items-center justify-center">
                  <Image className="w-6 h-6 text-green-400" />
                </div>
            }

              {/* Controls */}
              <div data-ev-id="ev_b329bcd188" className="flex items-center justify-between mt-1.5 bg-white rounded px-1.5 py-1">
                <span data-ev-id="ev_cdd35ee6b3" className="text-[10px] text-gray-600 truncate flex-1">
                  {activePlacement.creative?.name || 'פרסומת'}
                </span>
                <div data-ev-id="ev_3376f99c82" className="flex items-center gap-1">
                  <button data-ev-id="ev_2f5f0540e8"
                onClick={() => onTogglePlacement(activePlacement)}
                className="p-0.5 text-green-500 hover:bg-green-100 rounded"
                title="השבת">

                    <ToggleRight className="w-4 h-4" />
                  </button>
                  <button data-ev-id="ev_d7d2e43fde"
                onClick={() => onDeletePlacement(activePlacement.id)}
                className="p-0.5 text-red-500 hover:bg-red-100 rounded"
                title="מחק">

                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div> :

          <button data-ev-id="ev_29b75d2d73"
          onClick={() => onAddPlacement(pageType, position)}
          className="flex-1 flex flex-col items-center justify-center text-gray-400 hover:text-amber-500 transition-colors rounded hover:bg-amber-50">

              <Plus className="w-8 h-8 mb-1" />
              <span data-ev-id="ev_b948f1a983" className="text-xs font-medium">הוסף פרסומת</span>
            </button>
          }
        </div>

        {/* Inactive placements indicator */}
        {slotPlacements.filter((p) => !p.is_active).length > 0 &&
        <div data-ev-id="ev_7ff0387d23" className="absolute bottom-1 left-1 bg-gray-500 text-white text-[9px] px-1 rounded">
            +{slotPlacements.filter((p) => !p.is_active).length} מושבתים
          </div>
        }
      </div>);

  };

  // Floating Ad Component
  const FloatingAd = ({
    position,
    side



  }: {position: 'floating-left' | 'floating-right';side: 'left' | 'right';}) => {
    const slotConfig = AD_SLOTS[pageType]?.[position];
    if (!slotConfig) return null;

    const slotPlacements = getPlacementsForSlot(position);
    const hasActive = slotPlacements.some((p) => p.is_active);
    const activePlacement = slotPlacements.find((p) => p.is_active);

    return (
      <div data-ev-id="ev_8382abfdfc"
      className={`absolute top-20 ${side === 'left' ? 'left-2' : 'right-2'} w-20 z-20`}>

        <div data-ev-id="ev_be2e6c33e3"
        className={`rounded-lg border-2 transition-all overflow-hidden h-64 ${
        hasActive ?
        'border-green-500 bg-green-50' :
        'border-dashed border-amber-400 bg-amber-50/50'}`
        }>

          <div data-ev-id="ev_9aabea1bf4" className="bg-white/90 px-1 py-0.5 text-center border-b">
            <span data-ev-id="ev_9583fc4ce9" className="text-[9px] font-bold text-gray-700 flex items-center justify-center gap-1">
              {side === 'left' ? <PanelLeft className="w-3 h-3" /> : <PanelRight className="w-3 h-3" />}
              {slotConfig.name}
            </span>
          </div>
          
          {activePlacement ?
          <div data-ev-id="ev_8b45579c11" className="p-1 h-full">
              {activePlacement.creative?.image_url ?
            <img data-ev-id="ev_ab43b594cf"
            src={activePlacement.creative.image_url}
            alt=""
            className="w-full h-48 object-cover rounded" /> :


            <div data-ev-id="ev_b637a7c7d8" className="h-48 bg-green-100 rounded flex items-center justify-center">
                  <Image className="w-4 h-4 text-green-400" />
                </div>
            }
              <div data-ev-id="ev_e780d80304" className="flex justify-center gap-1 mt-1">
                <button data-ev-id="ev_97b410973f"
              onClick={() => onTogglePlacement(activePlacement)}
              className="p-0.5 text-green-500 hover:bg-green-100 rounded">

                  <ToggleRight className="w-3 h-3" />
                </button>
                <button data-ev-id="ev_a163fbbc97"
              onClick={() => onDeletePlacement(activePlacement.id)}
              className="p-0.5 text-red-500 hover:bg-red-100 rounded">

                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div> :

          <button data-ev-id="ev_e3210f816b"
          onClick={() => onAddPlacement(pageType, position)}
          className="w-full h-56 flex flex-col items-center justify-center text-amber-500 hover:bg-amber-100 transition-colors">

              <Plus className="w-6 h-6" />
              <span data-ev-id="ev_499aa143fb" className="text-[9px] font-medium mt-1">הוסף</span>
            </button>
          }
        </div>
      </div>);

  };

  // ============ HOME PAGE ============
  if (pageType === 'home') {
    return (
      <div data-ev-id="ev_9614fd7fd3" className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden relative">
        {/* Browser Header */}
        <div data-ev-id="ev_3d5a33c61f" className="bg-gray-100 px-4 py-3 flex items-center gap-3 border-b">
          <div data-ev-id="ev_7b2e85900b" className="flex gap-1.5">
            <div data-ev-id="ev_42e7d1204c" className="w-3 h-3 rounded-full bg-red-400" />
            <div data-ev-id="ev_64889fb4a6" className="w-3 h-3 rounded-full bg-yellow-400" />
            <div data-ev-id="ev_0fda23a036" className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div data-ev-id="ev_61094e94c3" className="flex-1 bg-white rounded-lg px-4 py-1.5 text-sm text-gray-500 text-center border">
            🏠 {PAGE_TYPE_LABELS[pageType]}
          </div>
        </div>

        {/* Floating Side Ads */}
        <FloatingAd position="floating-right" side="right" />
        <FloatingAd position="floating-left" side="left" />

        {/* Page Content */}
        <div data-ev-id="ev_e7351aae48" className="p-6 bg-gradient-to-b from-gray-50 to-white mx-24">
          {/* Site Header Mock */}
          <div data-ev-id="ev_1135280839" className="h-14 bg-gray-800 rounded-xl mb-4 flex items-center justify-between px-6">
            <div data-ev-id="ev_f001a002a3" className="w-28 h-7 bg-amber-500 rounded" />
            <div data-ev-id="ev_feaeb191ee" className="flex gap-4">
              <div data-ev-id="ev_a4c59bb4e8" className="w-14 h-4 bg-gray-600 rounded" />
              <div data-ev-id="ev_c47469ef4a" className="w-14 h-4 bg-gray-600 rounded" />
              <div data-ev-id="ev_31759fe0c6" className="w-14 h-4 bg-gray-600 rounded" />
            </div>
          </div>

          {/* Top Banner */}
          <div data-ev-id="ev_bf4b8edc9e" className="mb-4">
            <AdSlot position="top-banner" label="באנר עליון רחב" sizeLabel="970x90" height="h-16" />
          </div>

          {/* Main Content - Hero */}
          <div data-ev-id="ev_bc23bdf8f8" className="h-40 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl mb-4 flex items-center justify-center">
            <span data-ev-id="ev_686fbdb976" className="text-gray-400 font-medium">כתבה ראשית</span>
          </div>

          {/* Article Grid */}
          <div data-ev-id="ev_0f7271a196" className="grid grid-cols-3 gap-3 mb-4">
            {[1, 2, 3].map((i) =>
            <div data-ev-id="ev_c47e03e91f" key={i} className="h-24 bg-gray-100 rounded-lg" />
            )}
          </div>

          {/* In-Feed Ad */}
          <div data-ev-id="ev_c9ec726007" className="my-6">
            <AdSlot position="in-feed" label="פרסומת בין המדורים" sizeLabel="728x90" height="h-20" />
          </div>

          {/* More Content */}
          <div data-ev-id="ev_2e0e597887" className="grid grid-cols-3 gap-3 mb-4">
            {[4, 5, 6].map((i) =>
            <div data-ev-id="ev_e2a089dc65" key={i} className="h-24 bg-gray-100 rounded-lg" />
            )}
          </div>

          {/* Bottom Banner */}
          <div data-ev-id="ev_eece88c487" className="mt-6">
            <AdSlot position="bottom" label="באנר תחתון גדול" sizeLabel="970x250" height="h-28" />
          </div>
        </div>
      </div>);

  }

  // ============ SECTION PAGE ============
  if (pageType === 'section') {
    return (
      <div data-ev-id="ev_4a39fddf5b" className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden relative">
        {/* Browser Header */}
        <div data-ev-id="ev_0ce5b6e437" className="bg-gray-100 px-4 py-3 flex items-center gap-3 border-b">
          <div data-ev-id="ev_c3b47f5c60" className="flex gap-1.5">
            <div data-ev-id="ev_916d03aa54" className="w-3 h-3 rounded-full bg-red-400" />
            <div data-ev-id="ev_165d0ba768" className="w-3 h-3 rounded-full bg-yellow-400" />
            <div data-ev-id="ev_faa80cab7f" className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div data-ev-id="ev_cea596d298" className="flex-1 bg-white rounded-lg px-4 py-1.5 text-sm text-gray-500 text-center border">
            📂 {PAGE_TYPE_LABELS[pageType]} - שיח הציבור
          </div>
        </div>

        {/* Floating Side Ads */}
        <FloatingAd position="floating-right" side="right" />
        <FloatingAd position="floating-left" side="left" />

        {/* Page Content */}
        <div data-ev-id="ev_ce37c2d83f" className="p-6 bg-gradient-to-b from-gray-50 to-white mx-24">
          {/* Site Header Mock */}
          <div data-ev-id="ev_8599a494e7" className="h-14 bg-gray-800 rounded-xl mb-4 flex items-center justify-between px-6">
            <div data-ev-id="ev_098196fd8d" className="w-28 h-7 bg-amber-500 rounded" />
            <div data-ev-id="ev_990d8043a9" className="flex gap-4">
              <div data-ev-id="ev_2befb26c51" className="w-14 h-4 bg-gray-600 rounded" />
              <div data-ev-id="ev_77d785e665" className="w-14 h-4 bg-gray-600 rounded" />
            </div>
          </div>

          {/* Section Title */}
          <div data-ev-id="ev_c206999336" className="flex items-center gap-3 mb-4">
            <div data-ev-id="ev_ab6b552c3e" className="w-1.5 h-10 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full" />
            <div data-ev-id="ev_bb2ab06ca0" className="w-40 h-7 bg-gray-300 rounded" />
          </div>

          {/* Article List */}
          <div data-ev-id="ev_62ece803a5" className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) =>
            <div data-ev-id="ev_64e92b9f2e" key={i} className="flex gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div data-ev-id="ev_3162edba31" className="w-28 h-20 bg-gray-200 rounded-lg" />
                <div data-ev-id="ev_96f738067b" className="flex-1 py-2">
                  <div data-ev-id="ev_db2d6aec92" className="w-4/5 h-5 bg-gray-300 rounded mb-2" />
                  <div data-ev-id="ev_0212b5fdb1" className="w-2/3 h-3 bg-gray-200 rounded" />
                </div>
              </div>
            )}
          </div>

          {/* Bottom Banner */}
          <div data-ev-id="ev_e913d683e4" className="mt-6">
            <AdSlot position="bottom" label="באנר תחתון" sizeLabel="970x250" height="h-28" />
          </div>
        </div>
      </div>);

  }

  // ============ ARTICLE PAGE ============
  return (
    <div data-ev-id="ev_393e2ff922" className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Browser Header */}
      <div data-ev-id="ev_8c1465cb92" className="bg-gray-100 px-4 py-3 flex items-center gap-3 border-b">
        <div data-ev-id="ev_43db59c474" className="flex gap-1.5">
          <div data-ev-id="ev_2aca6b8652" className="w-3 h-3 rounded-full bg-red-400" />
          <div data-ev-id="ev_f93d3f496f" className="w-3 h-3 rounded-full bg-yellow-400" />
          <div data-ev-id="ev_7cdee8a98f" className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div data-ev-id="ev_830ada268d" className="flex-1 bg-white rounded-lg px-4 py-1.5 text-sm text-gray-500 text-center border">
          📝 {PAGE_TYPE_LABELS[pageType]} - כותרת הכתבה
        </div>
      </div>

      {/* Page Content */}
      <div data-ev-id="ev_9bb6cc04c0" className="p-6 bg-gradient-to-b from-gray-50 to-white">
        {/* Site Header Mock */}
        <div data-ev-id="ev_41a2d77e06" className="h-14 bg-gray-800 rounded-xl mb-4 flex items-center justify-between px-6">
          <div data-ev-id="ev_73921257c1" className="w-28 h-7 bg-amber-500 rounded" />
          <div data-ev-id="ev_84906b783f" className="flex gap-4">
            <div data-ev-id="ev_67e452d473" className="w-14 h-4 bg-gray-600 rounded" />
            <div data-ev-id="ev_da44081489" className="w-14 h-4 bg-gray-600 rounded" />
          </div>
        </div>

        {/* Breadcrumbs */}
        <div data-ev-id="ev_951e8bb36a" className="flex gap-2 mb-4 text-xs text-gray-400">
          <span data-ev-id="ev_12cd836ad7">דף הבית</span>
          <span data-ev-id="ev_f919b26332">/</span>
          <span data-ev-id="ev_f75cfa5ea1">מדור</span>
          <span data-ev-id="ev_e89543de9a">/</span>
          <span data-ev-id="ev_f350d83a9f" className="text-gray-600">כותרת הכתבה</span>
        </div>

        {/* Main Layout */}
        <div data-ev-id="ev_a937ce2990" className="flex gap-6">
          {/* Article Content */}
          <div data-ev-id="ev_3760c3c25a" className="flex-1">
            {/* Title */}
            <div data-ev-id="ev_48d2173dbb" className="w-4/5 h-8 bg-gray-300 rounded mb-3" />
            <div data-ev-id="ev_e92b478d6e" className="w-1/2 h-4 bg-gray-200 rounded mb-4" />

            {/* Featured Image */}
            <div data-ev-id="ev_e51a8348a8" className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl mb-4 flex items-center justify-center">
              <span data-ev-id="ev_bfdf01f469" className="text-gray-400">תמונה ראשית</span>
            </div>

            {/* Article Text */}
            <div data-ev-id="ev_f60b4c9cf0" className="flex flex-col gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((i) =>
              <div data-ev-id="ev_ef1633ff12" key={i} className={`h-3 bg-gray-100 rounded ${i === 5 ? 'w-3/4' : 'w-full'}`} />
              )}
            </div>
            <div data-ev-id="ev_9973674e9b" className="flex flex-col gap-2">
              {[1, 2, 3].map((i) =>
              <div data-ev-id="ev_8070767ef3" key={i} className={`h-3 bg-gray-100 rounded ${i === 3 ? 'w-1/2' : 'w-full'}`} />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div data-ev-id="ev_c37ad990b8" className="w-56 flex flex-col gap-4">
            <div data-ev-id="ev_df391f819c" className="text-xs text-gray-400 flex items-center gap-1">
              <span data-ev-id="ev_1b9eef4b84">←</span> חזרה למדור
            </div>

            {/* LARGE Sidebar Ad */}
            <AdSlot position="sidebar-1" label="פרסומת גדולה" sizeLabel="300x600" height="h-52" />

            {/* TWO SMALLER Sidebar Ads */}
            <div data-ev-id="ev_81a3e03906" className="flex flex-col gap-3">
              <AdSlot position="sidebar-2" label="פרסומת קטנה 1" sizeLabel="300x250" height="h-32" />
              <AdSlot position="sidebar-3" label="פרסומת קטנה 2" sizeLabel="300x250" height="h-32" />
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div data-ev-id="ev_a4500844b7" className="mt-6">
          <AdSlot position="bottom" label="באנר תחתון" sizeLabel="728x90" height="h-20" />
        </div>
      </div>
    </div>);

}