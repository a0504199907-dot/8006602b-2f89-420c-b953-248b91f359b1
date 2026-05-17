import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdCreative {
  id: string;
  campaign_id: string;
  name: string;
  size: string;
  image_url: string | null;
  mobile_image_url: string | null;
  tablet_image_url: string | null;
  device_type: string;
  title: string | null;
  subtitle: string | null;
  cta_text: string | null;
  target_url: string;
  background_color: string | null;
  is_active: boolean;
}

export interface AdPlacement {
  id: string;
  creative_id: string;
  slot_name: string;
  priority: number | null;
  is_active: boolean;
  days_of_week: number[] | null;
  start_time: string | null;
  end_time: string | null;
}

export interface AdWithPlacement extends AdCreative {
  placement: AdPlacement;
  campaign_status: string;
  campaign_start_date: string | null;
  campaign_end_date: string | null;
}

// ========================================
// מבנה אזורי פרסום - ברור ומסודר
// ========================================

export type PageType = 'home' | 'section' | 'article';
export type SlotPosition = 
  | 'floating-left'   // צף שמאל
  | 'floating-right'  // צף ימין
  | 'top-banner'      // באנר עליון
  | 'in-feed'         // בין המדורים
  | 'sidebar-1'       // סיידבר 1
  | 'sidebar-2'       // סיידבר 2
  | 'sidebar-3'       // סיידבר 3
  | 'bottom';         // באנר תחתון

export interface AdSlotConfig {
  name: string;
  size: string;
  description: string;
  icon?: string;
}

// מבנה אזורי פרסום לפי סוג עמוד
export const AD_SLOTS: Record<PageType, Partial<Record<SlotPosition, AdSlotConfig>>> = {
  // ========== דף הבית ==========
  home: {
    'floating-left': { 
      name: 'צף שמאל', 
      size: '160x600', 
      description: 'פרסומת צפה בצד שמאל - נראית תמיד',
      icon: '◀'
    },
    'floating-right': { 
      name: 'צף ימין', 
      size: '160x600', 
      description: 'פרסומת צפה בצד ימין - נראית תמיד',
      icon: '▶'
    },
    'top-banner': { 
      name: 'באנר עליון', 
      size: '970x90', 
      description: 'באנר רחב בראש העמוד',
      icon: '▬'
    },
    'in-feed': { 
      name: 'בין המדורים', 
      size: '728x90', 
      description: 'פרסומת בין מדורי התוכן (פעם אחת)',
      icon: '☰'
    },
    'bottom': { 
      name: 'באנר תחתון', 
      size: '970x250', 
      description: 'באנר גדול בתחתית דף הבית',
      icon: '▄'
    },
  },
  
  // ========== עמודי מדור ==========
  section: {
    'floating-left': { 
      name: 'צף שמאל', 
      size: '160x600', 
      description: 'פרסומת צפה בצד שמאל',
      icon: '◀'
    },
    'floating-right': { 
      name: 'צף ימין', 
      size: '160x600', 
      description: 'פרסומת צפה בצד ימין',
      icon: '▶'
    },
    'bottom': { 
      name: 'באנר תחתון', 
      size: '970x250', 
      description: 'באנר בתחתית עמוד המדור',
      icon: '▄'
    },
  },
  
  // ========== עמודי תוכן ==========
  article: {
    'sidebar-1': { 
      name: 'סיידבר גדול', 
      size: '300x600', 
      description: 'פרסומת גדולה בסיידבר (גובה כפול)',
      icon: '▐'
    },
    'sidebar-2': { 
      name: 'סיידבר קטן 1', 
      size: '300x250', 
      description: 'פרסומת קטנה ראשונה',
      icon: '▪'
    },
    'sidebar-3': { 
      name: 'סיידבר קטן 2', 
      size: '300x250', 
      description: 'פרסומת קטנה שנייה',
      icon: '▪'
    },
    'bottom': { 
      name: 'באנר תחתון', 
      size: '728x90', 
      description: 'באנר בתחתית עמוד התוכן',
      icon: '▄'
    },
  },
};

export const PAGE_TYPE_LABELS: Record<PageType, string> = {
  home: 'דף הבית',
  section: 'עמודי מדור',
  article: 'עמודי תוכן',
};

export const SIZE_LABELS: Record<string, string> = {
  // Standard IAB ad sizes
  '970x250': 'בילבורד — 970×250',
  '970x90': 'באנר עליון רחב — 970× 90',
  '728x90': 'לידרבורד — 728×90',
  '336x280': 'ריבוע גדול — 336×280',
  '300x600': 'חצי דף — 300×600',
  '300x250': 'ריבוע בינוני — 300×250',
  '250x250': 'ריבוע — 250×250',
  '200x200': 'ריבוע קטן — 200×200',
  '160x600': 'סקייסקרייפר רחב — 160×600',
  '120x600': 'סקייסקרייפר — 120×600',
  '320x100': 'מובייל גדול — 320×100',
  '320x50': 'מובייל באנר — 320×50',
  '468x60': 'באנר מלא — 468×60',
  '234x60': 'חצי באנר — 234×60',
};

// Helper to create slot name
export function getSlotName(pageType: PageType, position: SlotPosition): string {
  return `${pageType}-${position}`;
}

// Helper to parse slot name
export function parseSlotName(slotName: string): { pageType: PageType; position: SlotPosition } | null {
  const parts = slotName.split('-');
  if (parts.length < 2) return null;
  
  const pageType = parts[0] as PageType;
  const position = parts.slice(1).join('-') as SlotPosition;
  
  if (!AD_SLOTS[pageType] || !AD_SLOTS[pageType][position]) return null;
  
  return { pageType, position };
}

// Get all slot names as flat array
export function getAllSlotNames(): string[] {
  const slots: string[] = [];
  for (const pageType of Object.keys(AD_SLOTS) as PageType[]) {
    for (const position of Object.keys(AD_SLOTS[pageType]) as SlotPosition[]) {
      slots.push(getSlotName(pageType, position));
    }
  }
  return slots;
}

// Get ads for a specific slot with rotation
export function useAdsForSlot(slotName: string, size: string) {
  const [ads, setAds] = useState<AdWithPlacement[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdsForSlot();
  }, [slotName, size]);

  const fetchAdsForSlot = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('ad_placements')
        .select(`
          id,
          slot_name,
          priority,
          is_active,
          days_of_week,
          start_time,
          end_time,
          ad_creatives (
            id,
            campaign_id,
            name,
            size,
            image_url,
            mobile_image_url,
            tablet_image_url,
            device_type,
            title,
            subtitle,
            cta_text,
            target_url,
            background_color,
            is_active,
            ad_campaigns (
              status,
              start_date,
              end_date
            )
          )
        `)
        .eq('slot_name', slotName)
        .eq('is_active', true);

      if (error) throw error;

      const validAds: AdWithPlacement[] = [];

      for (const placement of data || []) {
        const creative = placement.ad_creatives as any;
        if (!creative || !creative.is_active) continue;

        const campaign = creative.ad_campaigns as any;
        if (!campaign || campaign.status !== 'active') continue;

        if (campaign.start_date && new Date(campaign.start_date) > new Date(now)) continue;
        if (campaign.end_date && new Date(campaign.end_date) < new Date(now)) continue;

        if (creative.size !== size) continue;

        validAds.push({
          ...creative,
          placement: {
            id: placement.id,
            creative_id: creative.id,
            slot_name: placement.slot_name,
            priority: placement.priority,
            is_active: placement.is_active,
            days_of_week: placement.days_of_week,
            start_time: placement.start_time,
            end_time: placement.end_time,
          },
          campaign_status: campaign.status,
          campaign_start_date: campaign.start_date,
          campaign_end_date: campaign.end_date,
        });
      }

      validAds.sort((a, b) => (b.placement.priority || 0) - (a.placement.priority || 0));
      setAds(validAds);
    } catch (err) {
      console.error('Error fetching ads for slot:', err);
    } finally {
      setLoading(false);
    }
  }, [slotName, size]);

  useEffect(() => {
    if (ads.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [ads.length]);

  const currentAd = ads[currentAdIndex] || null;

  return { ads, currentAd, loading, totalAds: ads.length };
}

// Track impression
export async function trackImpression(creativeId: string, slotName?: string) {
  if (!supabase) return;
  
  try {
    await supabase.from('ad_impressions').insert({
      creative_id: creativeId,
      impression_type: 'view',
      user_agent: navigator.userAgent,
      page_url: window.location.href,
      slot_name: slotName || null,
    });
  } catch (err) {
    console.error('Error tracking impression:', err);
  }
}

// Track click
export async function trackClick(creativeId: string, slotName?: string) {
  if (!supabase) return;
  
  try {
    await supabase.from('ad_impressions').insert({
      creative_id: creativeId,
      impression_type: 'click',
      user_agent: navigator.userAgent,
      page_url: window.location.href,
      slot_name: slotName || null,
    });
  } catch (err) {
    console.error('Error tracking click:', err);
  }
}

// Track dismiss
export async function trackDismiss(creativeId: string, slotName?: string) {
  if (!supabase) return;
  
  try {
    await supabase.from('ad_impressions').insert({
      creative_id: creativeId,
      impression_type: 'dismiss',
      user_agent: navigator.userAgent,
      page_url: window.location.href,
      slot_name: slotName || null,
    });
  } catch (err) {
    console.error('Error tracking dismiss:', err);
  }
}

// Campaign share token hook
export function useCampaignByShareToken(shareToken: string) {
  const [campaign, setCampaign] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shareToken) {
      setLoading(false);
      return;
    }

    fetchCampaign();
  }, [shareToken]);

  const fetchCampaign = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data: campaignData, error: campaignError } = await supabase
        .from('ad_campaigns')
        .select(`
          *,
          ad_creatives (
            id,
            name,
            size,
            image_url,
            is_active,
            ad_placements (
              id,
              slot_name,
              is_active
            )
          )
        `)
        .eq('share_token', shareToken)
        .single();

      if (campaignError) throw campaignError;

      setCampaign(campaignData);

      const creativeIds = campaignData.ad_creatives?.map((c: any) => c.id) || [];
      
      if (creativeIds.length > 0) {
        const { data: impressionData } = await supabase
          .from('ad_impressions')
          .select('creative_id, impression_type')
          .in('creative_id', creativeIds);

        const statsMap: Record<string, { impressions: number; clicks: number }> = {};
        
        for (const imp of impressionData || []) {
          if (!statsMap[imp.creative_id]) {
            statsMap[imp.creative_id] = { impressions: 0, clicks: 0 };
          }
          if (imp.impression_type === 'view') {
            statsMap[imp.creative_id].impressions++;
          } else if (imp.impression_type === 'click') {
            statsMap[imp.creative_id].clicks++;
          }
        }

        setStats(statsMap);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { campaign, stats, loading, error };
}
