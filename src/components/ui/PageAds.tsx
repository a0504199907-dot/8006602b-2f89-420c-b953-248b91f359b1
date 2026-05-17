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
  const impressionTracked = useRef<Set<string>>(new Set());

  // Get slot config from AD_SLOTS
  const slotConfig = AD_SLOTS[pageType]?.[position];
  const slotName = `${pageType}-${position}`;
  const size = slotConfig?.size || '300x250';

  useEffect(() => {
    fetchAds();
  }, [slotName, size, section, articleId]);

  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, rotationInterval);
    return () => clearInterval(interval);
  }, [ads.length, rotationInterval]);

  useEffect(() => {
    const currentAd = ads[currentIndex];
    if (currentAd && !impressionTracked.current.has(currentAd.id)) {
      impressionTracked.current.add(currentAd.id);
      trackImpression(currentAd.id);
    }
  }, [currentIndex, ads]);

  const fetchAds = async () => {
    if (!supabase || !slotName) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const now = new Date().toISOString();

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

      const articlePlacements: AdData[] = [];
      const sectionPlacements: AdData[] = [];
      const defaultPlacements: AdData[] = [];

      for (const placement of data || []) {
        const creative = (placement as any).ad_creatives;
        if (!creative || !creative.is_active) continue;

        const campaign = creative.ad_campaigns;
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

        if (placement.article_id) {
          if (placement.article_id === articleId) {
            articlePlacements.push(adData);
          }
        } else if (placement.section && placement.section !== 'default') {
          if (placement.section === section) {
            sectionPlacements.push(adData);
          }
        } else {
          defaultPlacements.push(adData);
        }
      }

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
      if (err?.name !== 'AbortError') {
        console.error('Error fetching ads:', err);
      }
    }
  };

  const handleClick = (ad: AdData) => {
    trackClick(ad.id);
    if (ad.target_url) {
      window.open(ad.target_url, '_blank', 'noopener,noreferrer');
    }
  };

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
  const isFullWidth = size === '728x90' || size === '970x90' || size === '970x250' || size === '320x100';
  const widthClass = isFullWidth ? 'w-full' : 'w-full';

  const currentAd = ads[currentIndex];

  if (!currentAd) {
    if (!showPlaceholder) return null;
    return (
      <div className={`${heightClass} ${widthClass} bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center text-muted-foreground/40 ${className}`}>
        <Megaphone className="w-8 h-8 mb-2" />
        <span className="text-xs font-medium">מקום לפרסומת</span>
      </div>);
  }

  return (
    <div className={`relative overflow-hidden ${widthClass} ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentAd.id}
          initial={false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className={`cursor-pointer ${heightClass}`}
          style={{ backgroundColor: currentAd.background_color || '#f5f5f5' }}
          onClick={() => handleClick(currentAd)}>

          {currentAd.image_url ?
          <img
            src={currentAd.image_url}
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
            decoding="async" /> :

          <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-500">{currentAd.title || ''}</span>
            </div>
          }
        </motion.div>
      </AnimatePresence>
    </div>);

}
