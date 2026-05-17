import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { trackImpression, trackClick, AD_SLOTS, PageType, SlotPosition } from '@/hooks/useAds';
import { Megaphone } from 'lucide-react';

interface PageAdsProps {
  pageType: PageType;
  position: SlotPosition;
  section?: string;
  articleId?: string;
  className?: string;
  showPlaceholder?: boolean;
  rotationInterval?: number;
}

interface AdData {
  id: string;
  title: string | null;
  image_url: string | null;
  target_url: string;
  background_color: string | null;
  cta_text: string | null;
}

export default function PageAds({
  pageType,
  position,
  section,
  articleId,
  className = '',
  showPlaceholder = true,
  rotationInterval = 8000
}: PageAdsProps) {
  const [ads, setAds] = useState<AdData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const impressionTracked = useRef<Set<string>>(new Set());

  // Get slot config from AD_SLOTS
  const slotConfig = AD_SLOTS[pageType]?.[position];
  const slotName = `${pageType}-${position}`;
  const size = slotConfig?.size || '300x250';

  useEffect(() => {
    fetchAds();
  }, [slotName, size, section, articleId]);

  // Rotation
  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
      setImageLoaded(false); // Reset for new image
    }, rotationInterval);
    return () => clearInterval(interval);
  }, [ads.length, rotationInterval]);

  // Track impression
  useEffect(() => {
    const currentAd = ads[currentIndex];
    if (currentAd && !impressionTracked.current.has(currentAd.id)) {
      impressionTracked.current.add(currentAd.id);
      trackImpression(currentAd.id);
    }
  }, [currentIndex, ads]);

  const fetchAds = async () => {
    if (!supabase || !slotName) {
      setLoading(false);
      return;
    }

    // Longer timeout - 15 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const now = new Date().toISOString();

      // Fetch ALL placements for this slot - prioritization happens client-side
      // Priority order: article_id > section > default
      const { data, error } = await supabase
        .from('ad_placements')
        .select(`
          id,
          slot_name,
          priority,
          is_active,
          section,
          article_id,
          ad_creatives (
            id,
            size,
            image_url,
            title,
            target_url,
            background_color,
            cta_text,
            is_active,
            ad_campaigns (
              status,
              start_date,
              end_date
            )
          )
        `)
        .eq('slot_name', slotName)
        .eq('is_active', true)
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

      if (error) throw error;

      // Filter and prioritize placements
      const articlePlacements: AdData[] = [];
      const sectionPlacements: AdData[] = [];
      const defaultPlacements: AdData[] = [];

      for (const placement of data || []) {
        const creative = placement.ad_creatives as any;
        if (!creative || !creative.is_active) continue;

        const campaign = creative.ad_campaigns as any;
        if (!campaign || campaign.status !== 'active') continue;

        if (campaign.start_date && new Date(campaign.start_date) > new Date(now)) continue;
        if (campaign.end_date && new Date(campaign.end_date) < new Date(now)) continue;

        const adData: AdData = {
          id: creative.id,
          title: creative.title,
          image_url: creative.image_url,
          target_url: creative.target_url,
          background_color: creative.background_color,
          cta_text: creative.cta_text
        };

        // Categorize by targeting level
        if (placement.article_id) {
          // Article-specific placement
          if (articleId && placement.article_id === articleId) {
            articlePlacements.push(adData);
          }
        } else if (placement.section && placement.section !== 'default') {
          // Section-specific placement
          if (section && placement.section === section) {
            sectionPlacements.push(adData);
          }
        } else {
          // Default placement (no section or section='default', no article_id)
          defaultPlacements.push(adData);
        }
      }

      // Use highest priority placements available (article > section > default)
      let validAds: AdData[] = [];
      if (articlePlacements.length > 0) {
        validAds = articlePlacements;
      } else if (sectionPlacements.length > 0) {
        validAds = sectionPlacements;
      } else {
        validAds = defaultPlacements;
      }

      setAds(validAds);
    } catch (err: any) {
      clearTimeout(timeoutId);
      // Silent fail on timeout/abort
      if (err?.name !== 'AbortError') {
        console.error('Error fetching ads:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (ad: AdData) => {
    trackClick(ad.id);
    if (ad.target_url) {
      window.open(ad.target_url, '_blank', 'noopener,noreferrer');
    }
  };

  // Size classes based on slot - top banners are full width
  const sizeClasses: Record<string, string> = {
    '728x90': 'h-[180px] w-full',
    '970x90': 'h-[180px] w-full',
    '300x250': 'h-[250px]',
    '300x600': 'h-[600px]',
    '970x250': 'h-[250px] w-full',
    '320x100': 'h-[100px] w-full',
    '160x600': 'h-[600px] w-[160px]'
  };

  const heightClass = sizeClasses[size] || 'h-[250px]';

  // Check if this is a full-width banner size
  const isFullWidth = ['728x90', '970x90', '970x250', '320x100'].includes(size);
  const widthClass = isFullWidth ? 'w-full' : '';

  // Show placeholder if no ads and showPlaceholder is true
  if (!loading && ads.length === 0) {
    if (!showPlaceholder) return null;

    return (
      <div data-ev-id="ev_c2b51530d7" className={`${heightClass} ${widthClass} bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center text-muted-foreground/40 ${className}`}>
        <Megaphone className="w-8 h-8 mb-2" />
        <span data-ev-id="ev_b35000df75" className="text-xs font-medium">מקום לפרסומת</span>
      </div>);


  }

  // Still loading
  if (loading) {
    return (
      <div data-ev-id="ev_ad2d44fb2f" className={`${heightClass} ${widthClass} bg-muted/30 animate-pulse ${className}`} />);

  }

  const currentAd = ads[currentIndex];
  if (!currentAd) return null;

  return (
    <div data-ev-id="ev_1901fd4c64" className={`relative overflow-hidden ${widthClass} ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentAd.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`cursor-pointer ${heightClass}`}
          style={{ backgroundColor: currentAd.background_color || '#f5f5f5' }}
          onClick={() => handleClick(currentAd)}>

          {currentAd.image_url ?
          <>
              {!imageLoaded &&
            <div data-ev-id="ev_14d230f807" className="w-full h-full bg-muted/30 animate-pulse absolute inset-0" />
            }
              <img data-ev-id="ev_b1a8be020d"
            src={currentAd.image_url}
            alt=""
            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)} />

            </> :

          <div data-ev-id="ev_df970898ff" className="w-full h-full flex items-center justify-center">
              <span data-ev-id="ev_4828797e89" className="text-gray-500">{currentAd.title || ''}</span>
            </div>
          }
        </motion.div>
      </AnimatePresence>

      {/* NO "פרסומת" label - removed */}

      {/* Pagination dots */}
      {ads.length > 1 &&
      <div data-ev-id="ev_1060f2a823" className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {ads.map((_, idx) =>
        <button data-ev-id="ev_3172ad4ab6"
        key={idx}
        onClick={(e) => {e.stopPropagation();setCurrentIndex(idx);setImageLoaded(false);}}
        className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentIndex ? 'bg-white' : 'bg-white/50'}`} />

        )}
        </div>
      }
    </div>);


}
