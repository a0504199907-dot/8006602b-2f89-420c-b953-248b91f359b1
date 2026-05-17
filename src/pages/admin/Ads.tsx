import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import ImageUploader from '@/components/ui/ImageUploader';
import PageLayoutPreview from '@/components/admin/PageLayoutPreview';
import {
  Plus, Search, MoreVertical, Edit, Trash2, Eye, Calendar,
  BarChart3, Play, Pause, X, Check, Link as LinkIcon, ExternalLink,
  Copy, Loader2, MapPin, Megaphone, Layout, Home, FileText,
  ToggleLeft, ToggleRight, ChevronDown, ChevronUp, Image as ImageIcon, Layers,
  TrendingUp, MousePointerClick, XCircle, Download, Filter, Users } from
'lucide-react';
import {
  AD_SLOTS, PAGE_TYPE_LABELS, SIZE_LABELS, getSlotName, parseSlotName,
  type PageType, type SlotPosition } from
'@/hooks/useAds';

// ============ TYPES ============

interface Campaign {
  id: string;
  name: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  budget: number;
  status: string;
  start_date: string;
  end_date: string;
  notes: string;
  created_at: string;
  share_token: string;
}

interface Creative {
  id: string;
  campaign_id: string;
  name: string;
  size: string;
  image_url: string;
  title: string;
  subtitle: string;
  cta_text: string;
  target_url: string;
  is_active: boolean;
  campaign?: Campaign;
}

interface Placement {
  id: string;
  creative_id: string;
  slot_name: string;
  section: string | null;
  article_id: string | null;
  priority: number;
  is_active: boolean;
  creative?: Creative;
}

interface AdStats {
  impressions: number;
  clicks: number;
  dismissals: number;
}

// ============ CONSTANTS ============

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500',
  active: 'bg-green-500',
  paused: 'bg-yellow-500',
  completed: 'bg-blue-500',
  cancelled: 'bg-red-500'
};

const statusLabels: Record<string, string> = {
  draft: 'טיוטה',
  active: 'פעיל',
  paused: 'מושהה',
  completed: 'הסתיים',
  cancelled: 'בוטל'
};

const PAGE_TYPE_ICONS: Record<PageType, typeof Home> = {
  home: Home,
  section: Layout,
  article: FileText
};

// המדורים באתר
const SECTIONS = [
{ id: 'default', name: 'ברירת מחדל (כל האתר)', icon: '🌐' },
{ id: 'siah-hatzibur', name: 'שיח הציבור', icon: '💬' },
{ id: 'bein-hatzibur', name: 'בעין הציבור', icon: '👁️' },
{ id: 'news-batzibur', name: 'חדשות בציבור', icon: '📰' },
{ id: 'before-18', name: 'לפני 18 שנה', icon: '📅' },
{ id: 'historical', name: 'היסטוריים', icon: '📜' },
{ id: 'galleries', name: 'גלריות', icon: '🖼️' },
{ id: 'videos', name: 'וידאו', icon: '🎬' },
{ id: 'events', name: 'אירועים', icon: '📅' }] as
const;

// ============ MAIN COMPONENT ============

export default function AdminAds() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [stats, setStats] = useState<Record<string, AdStats>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'placements' | 'campaigns' | 'creatives' | 'sections' | 'analytics'>('placements');

  // Analytics state
  const [analyticsDateRange, setAnalyticsDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [analyticsData, setAnalyticsData] = useState<{
    totalImpressions: number;
    totalClicks: number;
    totalDismissals: number;
    ctr: number;
    byPage: {page: string;impressions: number;clicks: number;dismissals: number;}[];
    bySlot: {slot: string;impressions: number;clicks: number;dismissals: number;}[];
    byCampaign: {id: string;name: string;impressions: number;clicks: number;dismissals: number;ctr: number;}[];
    byCreative: {id: string;name: string;campaign: string;impressions: number;clicks: number;dismissals: number;ctr: number;}[];
    daily: {date: string;impressions: number;clicks: number;}[];
  } | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Filters
  const [filterPageType, setFilterPageType] = useState<PageType | 'all'>('home');

  // Section Tab State
  const [activeSection, setActiveSection] = useState('default');
  const [sectionPageType, setSectionPageType] = useState<PageType>('home');
  const [expandedSlots, setExpandedSlots] = useState<Set<string>>(new Set());
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Modals
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showCreativeModal, setShowCreativeModal] = useState(false);
  const [showPlacementModal, setShowPlacementModal] = useState(false);
  const [showSectionPlacementModal, setShowSectionPlacementModal] = useState(false);
  const [selectedSectionSlot, setSelectedSectionSlot] = useState<string | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [editingCreative, setEditingCreative] = useState<Creative | null>(null);

  // Forms
  const [campaignForm, setCampaignForm] = useState({
    name: '', client_name: '', client_email: '', client_phone: '',
    budget: '', status: 'draft', start_date: '', end_date: '', notes: ''
  });

  const [creativeForm, setCreativeForm] = useState({
    campaign_id: '', name: '', size: '300x250', image_url: '',
    title: '', subtitle: '', cta_text: '', target_url: ''
  });

  const [placementForm, setPlacementForm] = useState({
    creative_id: '',
    pageType: 'home' as PageType,
    position: 'top-banner' as SlotPosition,
    section: 'default',
    applyToAll: false
  });

  const [sectionPlacementCreative, setSectionPlacementCreative] = useState('');

  // ============ DATA FETCHING ============

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const [campaignsRes, creativesRes, placementsRes, statsRes] = await Promise.all([
      supabase.from('ad_campaigns').select('*').order('created_at', { ascending: false }),
      supabase.from('ad_creatives').select('*, ad_campaigns(*)').order('created_at', { ascending: false }),
      supabase.from('ad_placements').select('*, ad_creatives(*, ad_campaigns(*))').order('created_at', { ascending: false }),
      supabase.from('ad_impressions').select('creative_id, impression_type')]
      );

      setCampaigns(campaignsRes.data || []);

      const creativesWithCampaign = (creativesRes.data || []).map((c: any) => ({
        ...c,
        campaign: c.ad_campaigns
      }));
      setCreatives(creativesWithCampaign);

      const placementsWithCreative = (placementsRes.data || []).map((p: any) => ({
        ...p,
        section: p.section || 'default',
        creative: p.ad_creatives ? {
          ...p.ad_creatives,
          campaign: p.ad_creatives.ad_campaigns
        } : null
      }));
      setPlacements(placementsWithCreative);

      // Aggregate stats
      const statsMap: Record<string, AdStats> = {};
      for (const imp of statsRes.data || []) {
        if (!statsMap[imp.creative_id]) {
          statsMap[imp.creative_id] = { impressions: 0, clicks: 0, dismissals: 0 };
        }
        if (imp.impression_type === 'view') {
          statsMap[imp.creative_id].impressions++;
        } else if (imp.impression_type === 'click') {
          statsMap[imp.creative_id].clicks++;
        } else if (imp.impression_type === 'dismiss') {
          statsMap[imp.creative_id].dismissals++;
        }
      }
      setStats(statsMap);
    } catch (err) {
      console.error('Error fetching ads data:', err);
    } finally {
      setLoading(false);
    }
  };

  // ============ ANALYTICS FETCH ============

  const fetchAnalytics = async () => {
    if (!supabase) return;

    setAnalyticsLoading(true);

    try {
      const days = analyticsDateRange === '7d' ? 7 : analyticsDateRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString();

      // Fetch all impressions with date filtering
      const { data: impressions } = await supabase.
      from('ad_impressions').
      select('creative_id, impression_type, created_at, page_url, slot_name').
      gte('created_at', startDateStr);

      // Process impressions
      let totalImpressions = 0;
      let totalClicks = 0;
      let totalDismissals = 0;

      const byPageMap: Record<string, {impressions: number;clicks: number;dismissals: number;}> = {};
      const bySlotMap: Record<string, {impressions: number;clicks: number;dismissals: number;}> = {};
      const byCreativeMap: Record<string, {impressions: number;clicks: number;dismissals: number;}> = {};
      const dailyMap: Record<string, {impressions: number;clicks: number;}> = {};

      for (const imp of impressions || []) {
        const pageName = getPageNameFromUrl(imp.page_url);
        const slotName = imp.slot_name || 'unknown';
        const dateKey = imp.created_at?.split('T')[0] || 'unknown';

        if (!byPageMap[pageName]) byPageMap[pageName] = { impressions: 0, clicks: 0, dismissals: 0 };
        if (!bySlotMap[slotName]) bySlotMap[slotName] = { impressions: 0, clicks: 0, dismissals: 0 };
        if (!byCreativeMap[imp.creative_id]) byCreativeMap[imp.creative_id] = { impressions: 0, clicks: 0, dismissals: 0 };
        if (!dailyMap[dateKey]) dailyMap[dateKey] = { impressions: 0, clicks: 0 };

        if (imp.impression_type === 'view') {
          totalImpressions++;
          byPageMap[pageName].impressions++;
          bySlotMap[slotName].impressions++;
          byCreativeMap[imp.creative_id].impressions++;
          dailyMap[dateKey].impressions++;
        } else if (imp.impression_type === 'click') {
          totalClicks++;
          byPageMap[pageName].clicks++;
          bySlotMap[slotName].clicks++;
          byCreativeMap[imp.creative_id].clicks++;
          dailyMap[dateKey].clicks++;
        } else if (imp.impression_type === 'dismiss') {
          totalDismissals++;
          byPageMap[pageName].dismissals++;
          bySlotMap[slotName].dismissals++;
          byCreativeMap[imp.creative_id].dismissals++;
        }
      }

      // Convert maps to arrays
      const byPage = Object.entries(byPageMap).map(([page, data]) => ({ page, ...data })).sort((a, b) => b.impressions - a.impressions);
      const bySlot = Object.entries(bySlotMap).map(([slot, data]) => ({ slot: getSlotLabel(slot), ...data })).sort((a, b) => b.impressions - a.impressions);

      // Get creative and campaign names
      const byCreative = Object.entries(byCreativeMap).map(([id, data]) => {
        const creative = creatives.find((c) => c.id === id);
        return {
          id,
          name: creative?.name || creative?.title || 'לא ידוע',
          campaign: creative?.campaign?.name || 'לא משויך',
          ...data,
          ctr: data.impressions > 0 ? data.clicks / data.impressions * 100 : 0
        };
      }).sort((a, b) => b.impressions - a.impressions);

      // Aggregate by campaign
      const byCampaignMap: Record<string, {id: string;name: string;impressions: number;clicks: number;dismissals: number;}> = {};
      for (const creative of byCreative) {
        const campaignId = creatives.find((c) => c.id === creative.id)?.campaign_id || 'unknown';
        const campaignName = creative.campaign;
        if (!byCampaignMap[campaignId]) {
          byCampaignMap[campaignId] = { id: campaignId, name: campaignName, impressions: 0, clicks: 0, dismissals: 0 };
        }
        byCampaignMap[campaignId].impressions += creative.impressions;
        byCampaignMap[campaignId].clicks += creative.clicks;
        byCampaignMap[campaignId].dismissals += creative.dismissals;
      }

      const byCampaign = Object.values(byCampaignMap).map((c) => ({
        ...c,
        ctr: c.impressions > 0 ? c.clicks / c.impressions * 100 : 0
      })).sort((a, b) => b.impressions - a.impressions);

      const daily = Object.entries(dailyMap).
      map(([date, data]) => ({ date, ...data })).
      sort((a, b) => a.date.localeCompare(b.date));

      setAnalyticsData({
        totalImpressions,
        totalClicks,
        totalDismissals,
        ctr: totalImpressions > 0 ? totalClicks / totalImpressions * 100 : 0,
        byPage,
        bySlot,
        byCampaign,
        byCreative,
        daily
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Helper to extract page name from URL
  const getPageNameFromUrl = (url: string | null): string => {
    if (!url) return 'לא ידוע';
    try {
      const path = new URL(url).pathname;
      if (path === '/' || path === '') return 'דף הבית';
      if (path.includes('/siah')) return 'שיח הציבור';
      if (path.includes('/gallery')) return 'גלריות';
      if (path.includes('/events')) return 'אירועים';
      if (path.includes('/news-batzibur')) return 'נייעס בציבור';
      if (path.includes('/bein-hatzibur')) return 'בעין הציבור';
      if (path.includes('/before-18')) return 'לפני 18 שנה';
      if (path.includes('/historical')) return 'אירועים היסטוריים';
      if (path.includes('/newspaper')) return 'גליונות';
      return path;
    } catch {
      return 'לא ידוע';
    }
  };

  // Helper to get readable slot name
  const getSlotLabel = (slot: string): string => {
    const parsed = parseSlotName(slot);
    if (!parsed) return slot;
    const pageLabel = PAGE_TYPE_LABELS[parsed.pageType] || parsed.pageType;
    const posLabel = SIZE_LABELS[AD_SLOTS[parsed.pageType]?.[parsed.position]?.size] || parsed.position;
    return `${pageLabel} - ${parsed.position}`;
  };

  // Fetch analytics when tab changes to analytics
  useEffect(() => {
    if (activeTab === 'analytics' && !analyticsData) {
      fetchAnalytics();
    }
  }, [activeTab]);

  // Refetch when date range changes
  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [analyticsDateRange]);

  // ============ CAMPAIGN HANDLERS ============

  const handleCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    try {
      const data = {
        name: campaignForm.name,
        client_name: campaignForm.client_name,
        client_email: campaignForm.client_email || null,
        client_phone: campaignForm.client_phone || null,
        budget: parseFloat(campaignForm.budget) || 0,
        status: campaignForm.status,
        start_date: campaignForm.start_date || null,
        end_date: campaignForm.end_date || null,
        notes: campaignForm.notes || ''
      };

      if (editingCampaign) {
        await supabase.from('ad_campaigns').update(data).eq('id', editingCampaign.id);
      } else {
        await supabase.from('ad_campaigns').insert(data);
      }

      setShowCampaignModal(false);
      resetCampaignForm();
      fetchData();
    } catch (err) {
      console.error('Error saving campaign:', err);
    }
  };

  const resetCampaignForm = () => {
    setCampaignForm({
      name: '', client_name: '', client_email: '', client_phone: '',
      budget: '', status: 'draft', start_date: '', end_date: '', notes: ''
    });
    setEditingCampaign(null);
  };

  const editCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setCampaignForm({
      name: campaign.name,
      client_name: campaign.client_name || '',
      client_email: campaign.client_email || '',
      client_phone: campaign.client_phone || '',
      budget: campaign.budget?.toString() || '',
      status: campaign.status,
      start_date: campaign.start_date?.split('T')[0] || '',
      end_date: campaign.end_date?.split('T')[0] || '',
      notes: campaign.notes || ''
    });
    setShowCampaignModal(true);
  };

  const deleteCampaign = async (id: string) => {
    if (!supabase || !confirm('האם למחוק את הקמפיין?')) return;
    await supabase.from('ad_campaigns').delete().eq('id', id);
    fetchData();
  };

  // ============ CREATIVE HANDLERS ============

  const handleCreativeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    try {
      const data = {
        campaign_id: creativeForm.campaign_id,
        name: creativeForm.name,
        size: creativeForm.size,
        image_url: creativeForm.image_url || null,
        title: creativeForm.title || null,
        subtitle: creativeForm.subtitle || null,
        cta_text: creativeForm.cta_text || null,
        target_url: creativeForm.target_url,
        is_active: true
      };

      if (editingCreative) {
        await supabase.from('ad_creatives').update(data).eq('id', editingCreative.id);
      } else {
        await supabase.from('ad_creatives').insert(data);
      }

      setShowCreativeModal(false);
      resetCreativeForm();
      fetchData();
    } catch (err) {
      console.error('Error saving creative:', err);
    }
  };

  const resetCreativeForm = () => {
    setCreativeForm({
      campaign_id: '', name: '', size: '300x250', image_url: '',
      title: '', subtitle: '', cta_text: '', target_url: ''
    });
    setEditingCreative(null);
  };

  const editCreative = (creative: Creative) => {
    setEditingCreative(creative);
    setCreativeForm({
      campaign_id: creative.campaign_id,
      name: creative.name,
      size: creative.size,
      image_url: creative.image_url || '',
      title: creative.title || '',
      subtitle: creative.subtitle || '',
      cta_text: creative.cta_text || '',
      target_url: creative.target_url || ''
    });
    setShowCreativeModal(true);
  };

  const deleteCreative = async (id: string) => {
    if (!supabase || !confirm('האם למחוק את הבאנר?')) return;
    await supabase.from('ad_creatives').delete().eq('id', id);
    fetchData();
  };

  const toggleCreativeActive = async (creative: Creative) => {
    if (!supabase) return;
    await supabase.from('ad_creatives').update({ is_active: !creative.is_active }).eq('id', creative.id);
    fetchData();
  };

  // ============ PLACEMENT HANDLERS ============

  const handlePlacementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !placementForm.creative_id) return;

    try {
      const sectionValue = placementForm.section === 'default' ? null : placementForm.section;

      if (placementForm.applyToAll) {
        // Apply to all positions in this page type
        const positions = Object.keys(AD_SLOTS[placementForm.pageType]) as SlotPosition[];
        const creative = creatives.find((c) => c.id === placementForm.creative_id);

        const placementsToCreate = positions.
        filter((pos) => {
          const slotConfig = AD_SLOTS[placementForm.pageType][pos];
          return slotConfig.size === creative?.size;
        }).
        map((pos) => ({
          creative_id: placementForm.creative_id,
          slot_name: getSlotName(placementForm.pageType, pos),
          section: sectionValue,
          priority: 1,
          is_active: true
        }));

        if (placementsToCreate.length > 0) {
          await supabase.from('ad_placements').insert(placementsToCreate);
        }
      } else {
        const slotName = getSlotName(placementForm.pageType, placementForm.position);
        await supabase.from('ad_placements').insert({
          creative_id: placementForm.creative_id,
          slot_name: slotName,
          section: sectionValue,
          priority: 1,
          is_active: true
        });
      }

      setShowPlacementModal(false);
      setPlacementForm({ creative_id: '', pageType: 'home', position: 'top-banner', section: 'default', applyToAll: false });
      fetchData();
    } catch (err) {
      console.error('Error creating placement:', err);
    }
  };

  const deletePlacement = async (id: string) => {
    if (!supabase || !confirm('האם למחוק את השיבוץ?')) return;
    await supabase.from('ad_placements').delete().eq('id', id);
    fetchData();
  };

  const togglePlacementActive = async (placement: Placement) => {
    if (!supabase) return;
    await supabase.from('ad_placements').update({ is_active: !placement.is_active }).eq('id', placement.id);
    fetchData();
  };

  // Handler for opening placement modal from visual preview
  const handleAddPlacementFromPreview = (pageType: PageType, position: SlotPosition) => {
    setPlacementForm((prev) => ({
      ...prev,
      pageType,
      position,
      applyToAll: false
    }));
    setShowPlacementModal(true);
  };

  // ============ SECTION-BASED HANDLERS ============

  const handleAddSectionPlacement = async () => {
    if (!supabase || !sectionPlacementCreative || !selectedSectionSlot) return;

    try {
      await supabase.from('ad_placements').insert({
        creative_id: sectionPlacementCreative,
        slot_name: selectedSectionSlot,
        section: activeSection,
        priority: 1,
        is_active: true
      });

      setShowSectionPlacementModal(false);
      setSectionPlacementCreative('');
      setSelectedSectionSlot(null);
      fetchData();
    } catch (err) {
      console.error('Error adding section placement:', err);
    }
  };

  const handleApplyToAllSections = async (slotName: string, creativeId: string) => {
    if (!supabase) return;

    try {
      const placementsToCreate = SECTIONS.filter((s) => s.id !== 'default').map((section) => ({
        creative_id: creativeId,
        slot_name: slotName,
        section: section.id,
        priority: 1,
        is_active: true
      }));

      await supabase.from('ad_placements').insert(placementsToCreate);
      setCopySuccess(slotName);
      setTimeout(() => setCopySuccess(null), 2000);
      fetchData();
    } catch (err) {
      console.error('Error applying to all sections:', err);
    }
  };

  const toggleSlotExpand = (slotName: string) => {
    setExpandedSlots((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(slotName)) {
        newSet.delete(slotName);
      } else {
        newSet.add(slotName);
      }
      return newSet;
    });
  };

  const getSectionPlacements = (slotName: string) => {
    return placements.filter((p) =>
    p.slot_name === slotName && (
    p.section === activeSection || activeSection === 'default' && (!p.section || p.section === 'default'))
    );
  };

  // ============ FILTERED DATA ============

  const filteredPlacements = placements.filter((p) => {
    if (filterPageType === 'all') return true;
    const parsed = parseSlotName(p.slot_name);
    return parsed?.pageType === filterPageType;
  });

  // Group placements by page type for visual display
  const placementsByPageType = {
    home: placements.filter((p) => p.slot_name.startsWith('home-')),
    section: placements.filter((p) => p.slot_name.startsWith('section-')),
    article: placements.filter((p) => p.slot_name.startsWith('article-'))
  };

  // Get active creatives for section modal
  const activeCreatives = creatives.filter((c) => c.campaign?.status === 'active');

  // Get current slots for section page type
  const currentSectionSlots = AD_SLOTS[sectionPageType] || {};

  // ============ RENDER ============

  if (loading) {
    return (
      <AdminLayout>
        <div data-ev-id="ev_118ab46866" className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-secondary" />
        </div>
      </AdminLayout>);

  }

  return (
    <AdminLayout>
      <div data-ev-id="ev_b9929e2b65" className="p-6">
        {/* Header */}
        <div data-ev-id="ev_4fd95ea53e" className="flex items-center justify-between mb-8">
          <div data-ev-id="ev_860d9d89e0">
            <h1 data-ev-id="ev_d19decb1d6" className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Megaphone className="w-7 h-7 text-secondary" />
              ניהול פרסומות
            </h1>
            <p data-ev-id="ev_9b443c3aac" className="text-muted-foreground mt-1">
              {campaigns.length} קמפיינים • {creatives.length} באנרים • {placements.length} שיבוצים
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div data-ev-id="ev_39fa920b78" className="flex gap-2 mb-6 border-b border-border">
          {[
          { id: 'placements', label: 'מיקומים', icon: MapPin },
          { id: 'sections', label: 'לפי מדור', icon: Layers },
          { id: 'creatives', label: 'באנרים', icon: ImageIcon },
          { id: 'campaigns', label: 'קמפיינים', icon: Megaphone },
          { id: 'analytics', label: 'אנליטיקס', icon: BarChart3 }].
          map((tab) =>
          <button data-ev-id="ev_0dc6be82f4"
          key={tab.id}
          onClick={() => setActiveTab(tab.id as any)}
          className={`flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors -mb-px ${
          activeTab === tab.id ?
          'border-secondary text-secondary' :
          'border-transparent text-muted-foreground hover:text-foreground'}`
          }>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          )}
        </div>

        {/* ============ PLACEMENTS TAB ============ */}
        {activeTab === 'placements' &&
        <div data-ev-id="ev_e66b10394e" className="flex flex-col gap-6">
            {/* Page Type Selection */}
            <div data-ev-id="ev_58ce50a945" className="bg-surface rounded-xl border border-border p-4">
              <div data-ev-id="ev_7b2cbff582" className="flex items-center justify-between mb-4">
                <h3 data-ev-id="ev_4ab18ef29d" className="font-bold text-foreground">בחר סוג עמוד לעריכה:</h3>
                <button data-ev-id="ev_6af98d3c94"
              onClick={() => setShowPlacementModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors">

                  <Plus className="w-4 h-4" />
                  שיבוץ חדש
                </button>
              </div>
              
              <div data-ev-id="ev_f533f39633" className="grid grid-cols-3 gap-4">
                {(Object.keys(AD_SLOTS) as PageType[]).map((type) => {
                const Icon = PAGE_TYPE_ICONS[type];
                const activeCount = placementsByPageType[type].filter((p) => p.is_active).length;
                const totalSlots = Object.keys(AD_SLOTS[type]).length;

                return (
                  <button data-ev-id="ev_c48dbf7918"
                  key={type}
                  onClick={() => setFilterPageType(type)}
                  className={`p-4 rounded-xl border-2 transition-all text-right ${
                  filterPageType === type ?
                  'border-secondary bg-secondary/10' :
                  'border-border hover:border-secondary/50 hover:bg-muted/50'}`
                  }>

                      <div data-ev-id="ev_0c2f4c5f3d" className="flex items-center gap-3 mb-2">
                        <div data-ev-id="ev_d07c64d9d8" className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      filterPageType === type ? 'bg-secondary text-white' : 'bg-muted'}`
                      }>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div data-ev-id="ev_58c58f77a2">
                          <p data-ev-id="ev_33e428ec2e" className="font-bold text-foreground">{PAGE_TYPE_LABELS[type]}</p>
                          <p data-ev-id="ev_ecd7793a58" className="text-xs text-muted-foreground">
                            {activeCount} / {totalSlots} מיקומים פעילים
                          </p>
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div data-ev-id="ev_bf2100e50a" className="h-2 bg-muted rounded-full overflow-hidden">
                        <div data-ev-id="ev_52e469aa74"
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${activeCount / totalSlots * 100}%` }} />

                      </div>
                    </button>);

              })}
              </div>
            </div>

            {/* Page Preview - Full Width */}
            {filterPageType !== 'all' &&
          <div data-ev-id="ev_ce75cdb5b2" className="w-full">
                <div data-ev-id="ev_9a721b8e76" className="flex items-center gap-2 mb-4">
                  <h3 data-ev-id="ev_05e847a20e" className="text-lg font-bold text-foreground">
                    הדמיית עמוד: {PAGE_TYPE_LABELS[filterPageType]}
                  </h3>
                  <span data-ev-id="ev_c98b7ea89e" className="text-sm text-muted-foreground">
                    (לחץ על "+" להוספת פרסומת)
                  </span>
                </div>
                <PageLayoutPreview
              pageType={filterPageType}
              placements={placementsByPageType[filterPageType]}
              onAddPlacement={handleAddPlacementFromPreview}
              onTogglePlacement={togglePlacementActive}
              onDeletePlacement={deletePlacement} />

              </div>
          }



            {/* Placements Table */}
            <div data-ev-id="ev_668d239727" className="bg-surface rounded-xl border border-border overflow-hidden">
              <div data-ev-id="ev_d80941dc6a" className="p-4 border-b border-border">
                <h3 data-ev-id="ev_8f632ad724" className="font-bold text-foreground">כל השיבוצים ({filteredPlacements.length})</h3>
              </div>
              <div data-ev-id="ev_7d4fa6e306" className="overflow-x-auto">
                <table data-ev-id="ev_e8a0e62d51" className="w-full">
                  <thead data-ev-id="ev_86043de475" className="bg-muted/50">
                    <tr data-ev-id="ev_75fdaeb5f3">
                      <th data-ev-id="ev_2070d2fe45" className="text-right p-3 text-sm font-medium text-muted-foreground">באנר</th>
                      <th data-ev-id="ev_62d16d44c6" className="text-right p-3 text-sm font-medium text-muted-foreground">סוג עמוד</th>
                      <th data-ev-id="ev_e090a5c708" className="text-right p-3 text-sm font-medium text-muted-foreground">מיקום</th>
                      <th data-ev-id="ev_section_col" className="text-right p-3 text-sm font-medium text-muted-foreground">מדור</th>
                      <th data-ev-id="ev_8709181a3a" className="text-right p-3 text-sm font-medium text-muted-foreground">סטטוס</th>
                      <th data-ev-id="ev_3d856ab195" className="text-right p-3 text-sm font-medium text-muted-foreground">פעולות</th>
                    </tr>
                  </thead>
                  <tbody data-ev-id="ev_425ad21d56" className="divide-y divide-border">
                    {filteredPlacements.map((placement) => {
                    const parsed = parseSlotName(placement.slot_name);
                    const slotConfig = parsed ? AD_SLOTS[parsed.pageType][parsed.position] : null;
                    const sectionInfo = SECTIONS.find((s) => s.id === placement.section);

                    return (
                      <tr data-ev-id="ev_9fda256905" key={placement.id} className="hover:bg-muted/30">
                          <td data-ev-id="ev_9a22b1d6b2" className="p-3">
                            <div data-ev-id="ev_95b21b5b64" className="flex items-center gap-3">
                              {placement.creative?.image_url &&
                            <img data-ev-id="ev_d606d60c19" src={placement.creative.image_url} alt="" className="w-12 h-12 rounded object-cover" />
                            }
                              <div data-ev-id="ev_a4804e12e6">
                                <p data-ev-id="ev_018dd3c483" className="font-medium text-foreground">{placement.creative?.name || '-'}</p>
                                <p data-ev-id="ev_e3ec27f1c0" className="text-xs text-muted-foreground">{placement.creative?.campaign?.name}</p>
                              </div>
                            </div>
                          </td>
                          <td data-ev-id="ev_95c593ea05" className="p-3">
                            <span data-ev-id="ev_1c81115c57" className="px-2 py-1 bg-muted rounded text-sm">
                              {parsed ? PAGE_TYPE_LABELS[parsed.pageType] : '-'}
                            </span>
                          </td>
                          <td data-ev-id="ev_7399438f73" className="p-3">
                            <span data-ev-id="ev_ffa2c41d5b" className="text-sm text-foreground">{slotConfig?.name || placement.slot_name}</span>
                          </td>
                          <td data-ev-id="ev_section_val" className="p-3">
                            <span data-ev-id="ev_section_badge" className={`px-2 py-1 rounded text-xs font-medium ${
                          !placement.section || placement.section === 'default' ?
                          'bg-blue-500/10 text-blue-600' :
                          'bg-purple-500/10 text-purple-600'}`
                          }>
                              {sectionInfo ? `${sectionInfo.icon} ${sectionInfo.name}` : '🌐 ברירת מחדל'}
                            </span>
                          </td>
                          <td data-ev-id="ev_391a0e96ca" className="p-3">
                            <button data-ev-id="ev_24e0276304"
                          onClick={() => togglePlacementActive(placement)}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                          placement.is_active ?
                          'bg-green-500/10 text-green-600' :
                          'bg-gray-500/10 text-gray-500'}`
                          }>

                              {placement.is_active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                              {placement.is_active ? 'פעיל' : 'מושבת'}
                            </button>
                          </td>
                          <td data-ev-id="ev_f36f38f216" className="p-3">
                            <button data-ev-id="ev_664e2be733"
                          onClick={() => deletePlacement(placement.id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">

                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>);

                  })}
                    {filteredPlacements.length === 0 &&
                  <tr data-ev-id="ev_725b51ff28">
                        <td data-ev-id="ev_d566b99f49" colSpan={6} className="p-8 text-center text-muted-foreground">
                          אין שיבוצים
                        </td>
                      </tr>
                  }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }

        {/* ============ SECTIONS TAB ============ */}
        {activeTab === 'sections' &&
        <div data-ev-id="ev_8ca1676dcc" className="grid grid-cols-12 gap-6">
            {/* Section Sidebar */}
            <div data-ev-id="ev_944dedd41b" className="col-span-12 lg:col-span-3">
              <div data-ev-id="ev_9b42efc866" className="bg-surface rounded-xl border border-border p-4 sticky top-24">
                <h3 data-ev-id="ev_7a945d0b35" className="font-bold text-foreground mb-4">בחר מדור</h3>
                
                {/* Page Type Selection */}
                <div data-ev-id="ev_f22cfacf25" className="flex gap-2 mb-4">
                  {(['home', 'section', 'article'] as PageType[]).map((pt) =>
                <button data-ev-id="ev_45fd8088b2"
                key={pt}
                onClick={() => setSectionPageType(pt)}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
                sectionPageType === pt ?
                'bg-secondary text-white' :
                'bg-muted hover:bg-muted/80'}`
                }>

                      {PAGE_TYPE_LABELS[pt]}
                    </button>
                )}
                </div>

                <div data-ev-id="ev_61f64aa6b6" className="flex flex-col gap-2">
                  {SECTIONS.map((section) =>
                <button data-ev-id="ev_c23e7d5a02"
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-right transition-all ${
                activeSection === section.id ?
                'bg-secondary text-white' :
                'bg-muted/50 hover:bg-muted text-foreground'}`
                }>

                        <span data-ev-id="ev_75b93c110a" className="text-xl">{section.icon}</span>
                        <div data-ev-id="ev_057e270d18" className="flex-1">
                          <p data-ev-id="ev_38793102bb" className="font-medium text-sm">{section.name}</p>
                          {getSectionPlacements(section.id).length > 0 &&
                    <p data-ev-id="ev_5d01815629" className={`text-xs ${activeSection === section.id ? 'text-white/70' : 'text-muted-foreground'}`}>
                              {getSectionPlacements(section.id).length} פרסומות
                            </p>
                    }
                        </div>
                      </button>
                )}
                </div>
              </div>
            </div>

            {/* Slots Grid */}
            <div data-ev-id="ev_e4644988cd" className="col-span-12 lg:col-span-9">
              <div data-ev-id="ev_f4120298a6" className="bg-surface rounded-xl border border-border">
                {/* Section Header */}
                <div data-ev-id="ev_6330887522" className="p-4 border-b border-border flex items-center justify-between">
                  <div data-ev-id="ev_d0e89c9a56">
                    <h2 data-ev-id="ev_05a9de7136" className="font-bold text-foreground flex items-center gap-2">
                      <span data-ev-id="ev_452ca31f08" className="text-xl">
                        {SECTIONS.find((s) => s.id === activeSection)?.icon}
                      </span>
                      {SECTIONS.find((s) => s.id === activeSection)?.name}
                    </h2>
                    <p data-ev-id="ev_ae9ebdd6a6" className="text-sm text-muted-foreground">
                      {PAGE_TYPE_LABELS[sectionPageType]} - פרסומות למדור זה
                    </p>
                  </div>
                </div>

                {/* Slots List */}
                <div data-ev-id="ev_9f87ea0c35" className="p-4 flex flex-col gap-4">
                  {Object.entries(currentSectionSlots).map(([position, config]) =>
                <div data-ev-id="ev_da85389106"
                key={position}
                className="border border-border rounded-xl overflow-hidden">

                    {/* Slot Header */}
                    <div data-ev-id="ev_3ec77aa891"
                  className="flex items-center justify-between p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleSlotExpand(getSlotName(sectionPageType, position as SlotPosition))}>

                      <div data-ev-id="ev_e163075947" className="flex items-center gap-3">
                        <span data-ev-id="ev_1c0f1e897f" className="text-lg">{config.icon}</span>
                        <div data-ev-id="ev_84fd9f3c9a">
                          <p data-ev-id="ev_8838dbdece" className="font-bold text-foreground">{config.name}</p>
                          <p data-ev-id="ev_655499add4" className="text-xs text-muted-foreground">
                            {config.size} • {getSectionPlacements(getSlotName(sectionPageType, position as SlotPosition)).length} פרסומות פעילה
                          </p>
                        </div>
                      </div>
                      <div data-ev-id="ev_db828a0265" className="flex items-center gap-2">
                        {activeSection !== 'default' && getSectionPlacements(getSlotName(sectionPageType, position as SlotPosition)).length > 0 &&
                      <button data-ev-id="ev_f31a666101"
                      onClick={(e) => {
                        e.stopPropagation();
                        const firstPlacement = getSectionPlacements(getSlotName(sectionPageType, position as SlotPosition))[0];
                        if (firstPlacement?.creative_id) {
                          handleApplyToAllSections(getSlotName(sectionPageType, position as SlotPosition), firstPlacement.creative_id);
                        }
                      }}
                      className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors"
                      title="החל על כל המדורים">

                            {copySuccess === getSlotName(sectionPageType, position as SlotPosition) ?
                        <><Check className="w-3 h-3" /> הוחל!</> :

                        <><Copy className="w-3 h-3" /> החל על כולם</>
                        }
                              </button>
                      }
                        <button data-ev-id="ev_0b15499740"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSectionSlot(getSlotName(sectionPageType, position as SlotPosition));
                        setShowSectionPlacementModal(true);
                      }}
                      className="flex items-center gap-1 px-3 py-1 text-xs bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors">

                              <Plus className="w-3 h-3" />
                              הוסף
                            </button>
                        {expandedSlots.has(getSlotName(sectionPageType, position as SlotPosition)) ?
                      <ChevronUp className="w-5 h-5 text-muted-foreground" /> :

                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      }
                      </div>
                    </div>

                    {/* Slot Content */}
                    <AnimatePresence>
                      {expandedSlots.has(getSlotName(sectionPageType, position as SlotPosition)) &&
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden">

                          <div data-ev-id="ev_bb554278b6" className="p-4 flex flex-col gap-3">
                            {getSectionPlacements(getSlotName(sectionPageType, position as SlotPosition)).length === 0 ?
                        <div data-ev-id="ev_72eea7ad2c" className="text-center py-8 text-muted-foreground">
                                <Megaphone className="w-8 h-8 text-muted-foreground text-muted-foreground mx-auto mb-2 opacity-50" />
                                    <p data-ev-id="ev_7b8c4953a5" className="text-sm">אין פרסומות במיקום זה</p>
                                    <p data-ev-id="ev_5aadfb6e18" className="text-xs">לחץ "הוסף" כדי להוסיף פרסומת</p>
                                  </div> :

                        getSectionPlacements(getSlotName(sectionPageType, position as SlotPosition)).map((placement) =>
                        <div data-ev-id="ev_546e41559c"
                        key={placement.id}
                        className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                        placement.is_active ?
                        'bg-green-500/5 border-green-500/30' :
                        'bg-muted/30 border-border opacity-60'}`
                        }>

                                      {/* Creative Preview */}
                                      <div data-ev-id="ev_d6dc41655e" className="w-20 h-14 rounded bg-muted overflow-hidden flex-shrink-0">
                                        {placement.creative?.image_url ?
                            <img data-ev-id="ev_5aaa0890a3"
                            src={placement.creative.image_url}
                            alt={placement.creative.name}
                            className="w-full h-full object-cover" /> :


                            <div data-ev-id="ev_3d8e1f5bf3" className="w-full h-full flex items-center justify-center">
                                <Megaphone className="w-4 h-4 text-muted-foreground" />
                              </div>
                            }
                                      </div>

                                      {/* Creative Info */}
                                      <div data-ev-id="ev_fcd1b686e8" className="flex-1 min-w-0">
                                        <p data-ev-id="ev_989b4d6013" className="font-medium text-foreground truncate">{placement.creative?.name || 'ללא שם'}</p>
                                        <p data-ev-id="ev_6c33258502" className="text-xs text-muted-foreground">
                                          {placement.creative?.campaign?.name} • {placement.creative?.size}
                                        </p>
                                      </div>

                                      {/* Actions */}
                                      <div data-ev-id="ev_b749bbe0b5" className="flex items-center gap-2">
                                        <button data-ev-id="ev_72a8ef6dec"
                            onClick={() => togglePlacementActive(placement)}
                            className={`p-2 rounded transition-colors ${
                            placement.is_active ?
                            'text-green-500 hover:bg-green-500/10' :
                            'text-muted-foreground hover:bg-muted'}`
                            }
                            title={placement.is_active ? 'כבה' : 'הפעל'}>

                                          {placement.is_active ?
                              <ToggleRight className="w-5 h-5" /> :

                              <ToggleLeft className="w-5 h-5" />
                              }
                                        </button>
                                        <button data-ev-id="ev_75de976564"
                            onClick={() => deletePlacement(placement.id)}
                            className="p-2 rounded text-red-500 hover:bg-red-500/10 transition-colors"
                            title="מחק">

                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                        )
                        }
                          </div>
                        </motion.div>
                    }
                    </AnimatePresence>
                  </div>
                )}
                </div>
              </div>
            </div>
          </div>
        }

        {/* ============ CREATIVES TAB ============ */}
        {activeTab === 'creatives' &&
        <div data-ev-id="ev_dd55a5f355" className="flex flex-col gap-6">
            <div data-ev-id="ev_8843df9d81" className="flex justify-end">
              <button data-ev-id="ev_4832f4f817"
            onClick={() => setShowCreativeModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors">

                <Plus className="w-4 h-4" />
                באנר חדש
              </button>
            </div>

            <div data-ev-id="ev_685257bc03" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {creatives.map((creative) => {
              const creativeStats = stats[creative.id] || { impressions: 0, clicks: 0, dismissals: 0 };
              const ctr = creativeStats.impressions > 0 ?
              (creativeStats.clicks / creativeStats.impressions * 100).toFixed(2) :
              '0';

              return (
                <div data-ev-id="ev_db7f5596c7" key={creative.id} className="bg-surface rounded-xl border border-border overflow-hidden">
                    {creative.image_url &&
                  <img data-ev-id="ev_14aa03f9df" src={creative.image_url} alt="" className="w-full h-40 object-cover" />
                  }
                    <div data-ev-id="ev_c99bcc5e38" className="p-4">
                      <div data-ev-id="ev_9b2dc0d8d1" className="flex items-start justify-between mb-2">
                        <div data-ev-id="ev_963241d6b2">
                          <h3 data-ev-id="ev_0a527468af" className="font-bold text-foreground">{creative.name}</h3>
                          <p data-ev-id="ev_b51a8f758d" className="text-xs text-muted-foreground">{creative.campaign?.name}</p>
                        </div>
                        <span data-ev-id="ev_4e83242247" className={`text-xs px-2 py-0.5 rounded-full ${creative.is_active ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-500'}`}>
                          {creative.is_active ? 'פעיל' : 'מושבת'}
                        </span>
                      </div>
                      
                      <div data-ev-id="ev_37f2ab3670" className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                        <span data-ev-id="ev_cbb17fee3e">{SIZE_LABELS[creative.size] || creative.size}</span>
                      </div>
                      
                      <div data-ev-id="ev_e10f92ce00" className="grid grid-cols-4 gap-2 p-2 bg-muted/50 rounded-lg mb-3">
                        <div data-ev-id="ev_5bdd8d761a" className="text-center">
                          <p data-ev-id="ev_2fe6819db7" className="text-lg font-bold text-foreground">{creativeStats.impressions}</p>
                          <p data-ev-id="ev_7b42e75651" className="text-xs text-muted-foreground">צפיות</p>
                        </div>
                        <div data-ev-id="ev_5e30a3bf40" className="text-center">
                          <p data-ev-id="ev_dd5367adfe" className="text-lg font-bold text-foreground">{creativeStats.clicks}</p>
                          <p data-ev-id="ev_cfcfd00c78" className="text-xs text-muted-foreground">קליקים</p>
                        </div>
                        <div data-ev-id="ev_bef2d73a91" className="text-center">
                          <p data-ev-id="ev_eed14c2eed" className="text-lg font-bold text-red-500">{creativeStats.dismissals}</p>
                          <p data-ev-id="ev_0aa1f060e6" className="text-xs text-muted-foreground">סגירות X</p>
                        </div>
                        <div data-ev-id="ev_ad518b06a8" className="text-center">
                          <p data-ev-id="ev_f60b99b2b0" className="text-lg font-bold text-foreground">{ctr}%</p>
                          <p data-ev-id="ev_8aa72d41ca" className="text-xs text-muted-foreground">CTR</p>
                        </div>
                      </div>
                      
                      <div data-ev-id="ev_c264367d89" className="flex gap-2">
                        <button data-ev-id="ev_80ad1447c1"
                      onClick={() => toggleCreativeActive(creative)}
                      className="flex-1 py-2 text-sm rounded-lg bg-muted hover:bg-muted/80">

                          {creative.is_active ? 'השבת' : 'הפעל'}
                        </button>
                        <button data-ev-id="ev_bd8873c54c"
                      onClick={() => editCreative(creative)}
                      className="p-2 rounded-lg bg-muted hover:bg-muted/80">

                          <Edit className="w-4 h-4" />
                        </button>
                        <button data-ev-id="ev_ee33b361f1"
                      onClick={() => deleteCreative(creative.id)}
                      className="p-2 rounded-lg text-red-500 bg-red-500/10 hover:bg-red-500/20">

                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>);

            })}
              
              {creatives.length === 0 &&
            <div data-ev-id="ev_67e73c220d" className="col-span-full text-center py-12 text-muted-foreground">
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p data-ev-id="ev_3c6b0d7b51">אין באנרים עדיין</p>
                </div>
            }
            </div>
          </div>
        }

        {/* ============ CAMPAIGNS TAB ============ */}
        {activeTab === 'campaigns' &&
        <div data-ev-id="ev_7efea3c9ea" className="flex flex-col gap-6">
            <div data-ev-id="ev_b0cdc1e003" className="flex justify-end">
              <button data-ev-id="ev_d218e84f65"
            onClick={() => setShowCampaignModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors">

                <Plus className="w-4 h-4" />
                קמפיין חדש
              </button>
            </div>

            <div data-ev-id="ev_6919a62550" className="bg-surface rounded-xl border border-border overflow-hidden">
              <table data-ev-id="ev_d53101e4d6" className="w-full">
                <thead data-ev-id="ev_df7073c775" className="bg-muted/50">
                  <tr data-ev-id="ev_657d23a1e0">
                    <th data-ev-id="ev_f5054df305" className="text-right p-3 text-sm font-medium text-muted-foreground">שם הקמפיין</th>
                    <th data-ev-id="ev_cd7cd63c8f" className="text-right p-3 text-sm font-medium text-muted-foreground">לקוח</th>
                    <th data-ev-id="ev_58f73e6518" className="text-right p-3 text-sm font-medium text-muted-foreground">תאריכים</th>
                    <th data-ev-id="ev_bb0f26479d" className="text-right p-3 text-sm font-medium text-muted-foreground">סטטוס</th>
                    <th data-ev-id="ev_ca698944e4" className="text-right p-3 text-sm font-medium text-muted-foreground">פעולות</th>
                  </tr>
                </thead>
                <tbody data-ev-id="ev_957cd0dfb5" className="divide-y divide-border">
                  {campaigns.map((campaign) =>
                <tr data-ev-id="ev_160132d909" key={campaign.id} className="hover:bg-muted/30">
                      <td data-ev-id="ev_4f0a3fef92" className="p-3">
                        <div data-ev-id="ev_dcff239492">
                          <p data-ev-id="ev_999da88f50" className="font-medium text-foreground">{campaign.name}</p>
                          <p data-ev-id="ev_d9bb26247c" className="text-xs text-muted-foreground">{campaign.client_name}</p>
                        </div>
                      </td>
                      <td data-ev-id="ev_ac47309c30" className="p-3">
                        <div data-ev-id="ev_5fd6abfb01" className="text-sm">
                          <p data-ev-id="ev_047a688820" className="text-foreground">{campaign.client_name}</p>
                          {campaign.client_email && <p data-ev-id="ev_b6d0eca3d3" className="text-muted-foreground text-xs">{campaign.client_email}</p>}
                          {campaign.client_phone && <p data-ev-id="ev_f91cebb72c" className="text-muted-foreground text-xs">{campaign.client_phone}</p>}
                        </div>
                      </td>
                      <td data-ev-id="ev_aea8b81adf" className="p-3 text-sm text-muted-foreground">
                        {campaign.start_date && campaign.end_date ?
                    `${new Date(campaign.start_date).toLocaleDateString('he-IL')} - ${new Date(campaign.end_date).toLocaleDateString('he-IL')}` :
                    '-'}
                      </td>
                      <td data-ev-id="ev_91d6182a5f" className="p-3">
                        <span data-ev-id="ev_714492e004" className={`px-2 py-1 rounded-full text-xs text-white ${statusColors[campaign.status]}`}>
                          {statusLabels[campaign.status]}
                        </span>
                      </td>
                      <td data-ev-id="ev_6d0a5c189a" className="p-3">
                        <div data-ev-id="ev_3b1c24be55" className="flex gap-1">
                          {/* Copy Share Link */}
                          <button data-ev-id="ev_0445d7f293"
                      onClick={() => {
                        const shareUrl = `${window.location.origin}/ad-stats/${campaign.share_token}`;
                        const textarea = document.createElement('textarea');
                        textarea.value = shareUrl;
                        textarea.style.position = 'fixed';
                        textarea.style.opacity = '0';
                        document.body.appendChild(textarea);
                        textarea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textarea);
                        setCopySuccess(campaign.id);
                        setTimeout(() => setCopySuccess(null), 2000);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                      copySuccess === campaign.id ?
                      'bg-green-500 text-white' :
                      'hover:bg-muted text-secondary'}`
                      }
                      title="העתק קישור למפרסם">

                            {copySuccess === campaign.id ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                          </button>
                          {/* Open Stats Page */}
                          <button data-ev-id="ev_a1e02322b2"
                      onClick={() => window.open(`/ad-stats/${campaign.share_token}`, '_blank')}
                      className="p-2 hover:bg-muted rounded-lg"
                      title="צפה בדף סטטיסטיקות">

                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button data-ev-id="ev_48b506b4be"
                      onClick={() => editCampaign(campaign)}
                      className="p-2 hover:bg-muted rounded-lg"
                      title="ערוך קמפיין">

                            <Edit className="w-4 h-4" />
                          </button>
                          <button data-ev-id="ev_431d8c49c8"
                      onClick={() => deleteCampaign(campaign.id)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                      title="מחק קמפיין">

                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                )}
                  {campaigns.length === 0 &&
                <tr data-ev-id="ev_fb5d67eb97">
                      <td data-ev-id="ev_4dd1928dab" colSpan={5} className="p-8 text-center text-muted-foreground">
                        אין קמפיינים עדיין
                      </td>
                    </tr>
                }
                </tbody>
              </table>
            </div>
          </div>
        }

        {/* ============ ANALYTICS TAB ============ */}
        {activeTab === 'analytics' &&
        <div data-ev-id="ev_5d3df5e91e" className="flex flex-col gap-6">
          {/* Date Range Filter */}
          <div data-ev-id="ev_064c46c415" className="flex items-center justify-between">
            <h2 data-ev-id="ev_c7eae8119a" className="text-xl font-bold text-foreground">סטטיסטיקות פרסום</h2>
            <div data-ev-id="ev_32532c09c2" className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select data-ev-id="ev_5942414f80"
              value={analyticsDateRange}
              onChange={(e) => setAnalyticsDateRange(e.target.value as '7d' | '30d' | '90d')}
              className="border border-border rounded-lg py-2 px-3 bg-background text-sm">

                <option data-ev-id="ev_210bd54fca" value="7d">7 ימים אחרונים</option>
                <option data-ev-id="ev_255bfd9026" value="30d">30 ימים אחרונים</option>
                <option data-ev-id="ev_03ef9737ca" value="90d">90 ימים אחרונים</option>
              </select>
              <button data-ev-id="ev_63c111c3cb"
              onClick={fetchAnalytics}
              disabled={analyticsLoading}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors">

                {analyticsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                רענן
              </button>
            </div>
          </div>

          {analyticsLoading && !analyticsData ?
          <div data-ev-id="ev_ecbf931549" className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-secondary animate-spin" />
            </div> :
          analyticsData ?
          <>
              {/* KPI Cards */}
              <div data-ev-id="ev_ae26af2f7d" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div data-ev-id="ev_8c99fb2ca8" className="bg-surface rounded-xl border border-border p-5">
                  <div data-ev-id="ev_5df21c67bb" className="flex items-center gap-3 mb-3">
                    <div data-ev-id="ev_8cd9a19c52" className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Eye className="w-5 h-5 text-blue-500" />
                    </div>
                    <span data-ev-id="ev_f923fcc12c" className="text-muted-foreground text-sm">חשיפה</span>
                  </div>
                  <p data-ev-id="ev_98332d391d" className="text-3xl font-bold text-foreground">{analyticsData.totalImpressions.toLocaleString()}</p>
                </div>

                <div data-ev-id="ev_c55ad5c51d" className="bg-surface rounded-xl border border-border p-5">
                  <div data-ev-id="ev_69e218d9f7" className="flex items-center gap-3 mb-3">
                    <div data-ev-id="ev_1489dff254" className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <MousePointerClick className="w-5 h-5 text-green-500" />
                    </div>
                    <span data-ev-id="ev_c973082149" className="text-muted-foreground text-sm">קליקים</span>
                  </div>
                  <p data-ev-id="ev_4c6dc8247e" className="text-3xl font-bold text-foreground">{analyticsData.totalClicks.toLocaleString()}</p>
                </div>

                <div data-ev-id="ev_79fcf4f0b0" className="bg-surface rounded-xl border border-border p-5">
                  <div data-ev-id="ev_8a3c069b8e" className="flex items-center gap-3 mb-3">
                    <div data-ev-id="ev_8153269d78" className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-red-500" />
                    </div>
                    <span data-ev-id="ev_9759a0f24e" className="text-muted-foreground text-sm">סגירות (X)</span>
                  </div>
                  <p data-ev-id="ev_60e0096c1d" className="text-3xl font-bold text-foreground">{analyticsData.totalDismissals.toLocaleString()}</p>
                </div>

                <div data-ev-id="ev_d75851ad2c" className="bg-surface rounded-xl border border-border p-5">
                  <div data-ev-id="ev_2ea5dba9ed" className="flex items-center gap-3 mb-3">
                    <div data-ev-id="ev_49b61fee75" className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-purple-500" />
                    </div>
                    <span data-ev-id="ev_e24ee77edc" className="text-muted-foreground text-sm">CTR</span>
                  </div>
                  <p data-ev-id="ev_f78bbb27e5" className="text-3xl font-bold text-foreground">{analyticsData.ctr.toFixed(2)}%</p>
                </div>
              </div>

              {/* Stats by Page */}
              <div data-ev-id="ev_bfe70ed502" className="bg-surface rounded-xl border border-border p-5">
                <h3 data-ev-id="ev_69b0edc029" className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Layout className="w-5 h-5 text-secondary" />
                  ביצועים לפי עמוד
                </h3>
                <div data-ev-id="ev_ffb19834d6" className="overflow-x-auto">
                  <table data-ev-id="ev_8eebd31158" className="w-full">
                    <thead data-ev-id="ev_a02b23459d">
                      <tr data-ev-id="ev_031d2cf521" className="border-b border-border text-right">
                        <th data-ev-id="ev_a84e99c761" className="py-3 px-4 text-sm font-medium text-muted-foreground">עמוד</th>
                        <th data-ev-id="ev_668c183bba" className="py-3 px-4 text-sm font-medium text-muted-foreground">חשיפה</th>
                        <th data-ev-id="ev_dfa8a08b1c" className="py-3 px-4 text-sm font-medium text-muted-foreground">קליקים</th>
                        <th data-ev-id="ev_69a8ef1245" className="py-3 px-4 text-sm font-medium text-muted-foreground">סגירות</th>
                        <th data-ev-id="ev_fe4e45a3a7" className="py-3 px-4 text-sm font-medium text-muted-foreground">CTR</th>
                      </tr>
                    </thead>
                    <tbody data-ev-id="ev_267069f9e8">
                      {analyticsData.byPage.map((row, idx) =>
                    <tr data-ev-id="ev_62180dc48e" key={idx} className="border-b border-border/50 hover:bg-muted/30">
                          <td data-ev-id="ev_eef0fc5d59" className="py-3 px-4 font-medium">{row.page}</td>
                          <td data-ev-id="ev_b931869808" className="py-3 px-4 text-blue-500">{row.impressions.toLocaleString()}</td>
                          <td data-ev-id="ev_730535a1c4" className="py-3 px-4 text-green-500">{row.clicks.toLocaleString()}</td>
                          <td data-ev-id="ev_005a79482b" className="py-3 px-4 text-red-500">{row.dismissals.toLocaleString()}</td>
                          <td data-ev-id="ev_a16a74d09c" className="py-3 px-4">{row.impressions > 0 ? (row.clicks / row.impressions * 100).toFixed(2) : '0.00'}%</td>
                        </tr>
                    )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Stats by Slot */}
              <div data-ev-id="ev_7000710490" className="bg-surface rounded-xl border border-border p-5">
                <h3 data-ev-id="ev_19c54f12cf" className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-secondary" />
                  ביצועים לפי מיקום
                </h3>
                <div data-ev-id="ev_7abb50ac42" className="overflow-x-auto">
                  <table data-ev-id="ev_e928d07c40" className="w-full">
                    <thead data-ev-id="ev_f98838f066">
                      <tr data-ev-id="ev_c6db9a16da" className="border-b border-border text-right">
                        <th data-ev-id="ev_fe898ba898" className="py-3 px-4 text-sm font-medium text-muted-foreground">מיקום</th>
                        <th data-ev-id="ev_48f0c730d2" className="py-3 px-4 text-sm font-medium text-muted-foreground">חשיפה</th>
                        <th data-ev-id="ev_3e0982b6f0" className="py-3 px-4 text-sm font-medium text-muted-foreground">קליקים</th>
                        <th data-ev-id="ev_62a0d10813" className="py-3 px-4 text-sm font-medium text-muted-foreground">סגירות</th>
                        <th data-ev-id="ev_61dd9b3845" className="py-3 px-4 text-sm font-medium text-muted-foreground">CTR</th>
                      </tr>
                    </thead>
                    <tbody data-ev-id="ev_cf963c7209">
                      {analyticsData.bySlot.map((row, idx) =>
                    <tr data-ev-id="ev_e95f41686b" key={idx} className="border-b border-border/50 hover:bg-muted/30">
                          <td data-ev-id="ev_bfbcb40851" className="py-3 px-4 font-medium">{row.slot}</td>
                          <td data-ev-id="ev_ae810cb5ca" className="py-3 px-4 text-blue-500">{row.impressions.toLocaleString()}</td>
                          <td data-ev-id="ev_e543ca2a86" className="py-3 px-4 text-green-500">{row.clicks.toLocaleString()}</td>
                          <td data-ev-id="ev_005a79482b" className="py-3 px-4 text-red-500">{row.dismissals.toLocaleString()}</td>
                          <td data-ev-id="ev_6d5b0e75f5" className="py-3 px-4">{row.impressions > 0 ? (row.clicks / row.impressions * 100).toFixed(2) : '0.00'}%</td>
                        </tr>
                    )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Stats by Campaign */}
              <div data-ev-id="ev_48f9d65c39" className="bg-surface rounded-xl border border-border p-5">
                <h3 data-ev-id="ev_54bedafbb8" className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-secondary" />
                  ביצועים לפי קמפיין
                </h3>
                <div data-ev-id="ev_4e1c3cd1d7" className="overflow-x-auto">
                  <table data-ev-id="ev_f97b8c3595" className="w-full">
                    <thead data-ev-id="ev_965a10a838">
                      <tr data-ev-id="ev_467d617c09" className="border-b border-border text-right">
                        <th data-ev-id="ev_18423aa08b" className="py-3 px-4 text-sm font-medium text-muted-foreground">קמפיין</th>
                        <th data-ev-id="ev_1520aa2d6b" className="py-3 px-4 text-sm font-medium text-muted-foreground">חשיפה</th>
                        <th data-ev-id="ev_247fbaf937" className="py-3 px-4 text-sm font-medium text-muted-foreground">קליקים</th>
                        <th data-ev-id="ev_08130d86e7" className="py-3 px-4 text-sm font-medium text-muted-foreground">סגירות</th>
                        <th data-ev-id="ev_0c19561f15" className="py-3 px-4 text-sm font-medium text-muted-foreground">CTR</th>
                      </tr>
                    </thead>
                    <tbody data-ev-id="ev_59ef973e64">
                      {analyticsData.byCampaign.map((row, idx) =>
                    <tr data-ev-id="ev_903107998b" key={idx} className="border-b border-border/50 hover:bg-muted/30">
                          <td data-ev-id="ev_2d170091be" className="py-3 px-4 font-medium">{row.name}</td>
                          <td data-ev-id="ev_a23c9f156d" className="py-3 px-4 text-blue-500">{row.impressions.toLocaleString()}</td>
                          <td data-ev-id="ev_8789e86765" className="py-3 px-4 text-green-500">{row.clicks.toLocaleString()}</td>
                          <td data-ev-id="ev_93f4a7058c" className="py-3 px-4 text-red-500">{row.dismissals.toLocaleString()}</td>
                          <td data-ev-id="ev_c7393f371c" className="py-3 px-4">{row.ctr.toFixed(2)}%</td>
                        </tr>
                    )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Stats by Creative */}
              <div data-ev-id="ev_120ef17b2f" className="bg-surface rounded-xl border border-border p-5">
                <h3 data-ev-id="ev_d2619d4934" className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-secondary" />
                  ביצועים לפי באנר
                </h3>
                <div data-ev-id="ev_256da55d2c" className="overflow-x-auto">
                  <table data-ev-id="ev_28c1a0f929" className="w-full">
                    <thead data-ev-id="ev_e19b386857">
                      <tr data-ev-id="ev_37a3f38528" className="border-b border-border text-right">
                        <th data-ev-id="ev_91c951e495" className="py-3 px-4 text-sm font-medium text-muted-foreground">באנר</th>
                        <th data-ev-id="ev_5560a30bd4" className="py-3 px-4 text-sm font-medium text-muted-foreground">קמפיין</th>
                        <th data-ev-id="ev_8d1f731739" className="py-3 px-4 text-sm font-medium text-muted-foreground">חשיפה</th>
                        <th data-ev-id="ev_81a5734cbb" className="py-3 px-4 text-sm font-medium text-muted-foreground">קליקים</th>
                        <th data-ev-id="ev_8da8992c0b" className="py-3 px-4 text-sm font-medium text-muted-foreground">סגירות</th>
                        <th data-ev-id="ev_f4be2ae3ad" className="py-3 px-4 text-sm font-medium text-muted-foreground">CTR</th>
                      </tr>
                    </thead>
                    <tbody data-ev-id="ev_cc34edc28c">
                      {analyticsData.byCreative.map((row, idx) =>
                    <tr data-ev-id="ev_77b511cbe7" key={idx} className="border-b border-border/50 hover:bg-muted/30">
                          <td data-ev-id="ev_1825b1e9ab" className="py-3 px-4 font-medium">{row.name}</td>
                          <td data-ev-id="ev_9b36d516dc" className="py-3 px-4 text-muted-foreground">{row.campaign}</td>
                          <td data-ev-id="ev_ef62876c97" className="py-3 px-4 text-blue-500">{row.impressions.toLocaleString()}</td>
                          <td data-ev-id="ev_de9dc16ca1" className="py-3 px-4 text-green-500">{row.clicks.toLocaleString()}</td>
                          <td data-ev-id="ev_85c1197a01" className="py-3 px-4 text-red-500">{row.dismissals.toLocaleString()}</td>
                          <td data-ev-id="ev_9ddcfbcca8" className="py-3 px-4">{row.ctr.toFixed(2)}%</td>
                        </tr>
                    )}
                    </tbody>
                  </table>
                </div>
              </div>
            </> :

          <div data-ev-id="ev_b37a183f6c" className="text-center py-20 bg-surface rounded-2xl border border-border">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p data-ev-id="ev_bb806b684a" className="text-muted-foreground">לחץ על "רענן" כדי לטעון נתונים</p>
            </div>
          }
        </div>
        }
      </div>

      {/* ============ MODALS ============ */}

      {/* Placement Modal */}
      <AnimatePresence>
        {showPlacementModal &&
        <div data-ev-id="ev_920844a14e" className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-surface rounded-2xl w-full max-w-md">

              <div data-ev-id="ev_c077447a64" className="flex items-center justify-between p-6 border-b border-border">
                <h2 data-ev-id="ev_9568ea9aeb" className="text-xl font-bold">שיבוץ חדש</h2>
                <button data-ev-id="ev_6e0c2b93b3" onClick={() => setShowPlacementModal(false)} className="p-2 hover:bg-muted rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form data-ev-id="ev_11906e6e35" onSubmit={handlePlacementSubmit} className="p-6 flex flex-col gap-4">
                <div data-ev-id="ev_d5dd26a79d">
                  <label data-ev-id="ev_dc31dc6776" className="block text-sm font-medium mb-2">בחר באנר</label>
                  <select data-ev-id="ev_16fea5e813"
                value={placementForm.creative_id}
                onChange={(e) => setPlacementForm((prev) => ({ ...prev, creative_id: e.target.value }))}
                className="w-full border border-border rounded-lg py-2.5 px-4 bg-background"
                required>

                    <option data-ev-id="ev_5c0c0e48f7" value="">בחר...</option>
                    {creatives.filter((c) => c.is_active).map((c) =>
                  <option data-ev-id="ev_e34532cc92" key={c.id} value={c.id}>
                        {c.name} ({SIZE_LABELS[c.size] || c.size})
                      </option>
                  )}
                  </select>
                </div>
                
                <div data-ev-id="ev_c7ceea9b51">
                  <label data-ev-id="ev_c15d5ebdaa" className="block text-sm font-medium mb-2">סוג עמוד</label>
                  <div data-ev-id="ev_7bad5a2ba5" className="grid grid-cols-3 gap-2">
                    {(Object.keys(AD_SLOTS) as PageType[]).map((type) => {
                    const Icon = PAGE_TYPE_ICONS[type];
                    return (
                      <button data-ev-id="ev_30d19a2081"
                      key={type}
                      type="button"
                      onClick={() => setPlacementForm((prev) => ({ ...prev, pageType: type }))}
                      className={`p-3 rounded-lg border-2 transition-colors flex flex-col items-center gap-1 ${
                      placementForm.pageType === type ?
                      'border-secondary bg-secondary/10' :
                      'border-border hover:border-secondary/50'}`
                      }>

                          <Icon className="w-5 h-5" />
                          <span data-ev-id="ev_7e76002b3c" className="text-xs">{PAGE_TYPE_LABELS[type]}</span>
                        </button>);

                  })}
                  </div>
                </div>
                
                <div data-ev-id="ev_ad4efa0d38">
                  <label data-ev-id="ev_b43ef49427" className="block text-sm font-medium mb-2">מיקום</label>
                  <select data-ev-id="ev_50c3ae6608"
                value={placementForm.position}
                onChange={(e) => setPlacementForm((prev) => ({ ...prev, position: e.target.value as SlotPosition }))}
                className="w-full border border-border rounded-lg py-2.5 px-4 bg-background">

                    {(Object.keys(AD_SLOTS[placementForm.pageType]) as SlotPosition[]).map((pos) => {
                    const config = AD_SLOTS[placementForm.pageType][pos];
                    return (
                      <option data-ev-id="ev_3f33864901" key={pos} value={pos}>
                          {config.name} ({config.size})
                        </option>);

                  })}
                  </select>
                </div>

                <div data-ev-id="ev_section_select_wrapper">
                  <label data-ev-id="ev_section_select_label" className="block text-sm font-medium mb-2">מדור (אופציונלי)</label>
                  <select data-ev-id="ev_section_select"
                value={placementForm.section}
                onChange={(e) => setPlacementForm((prev) => ({ ...prev, section: e.target.value }))}
                className="w-full border border-border rounded-lg py-2.5 px-4 bg-background">
                    {SECTIONS.map((section) =>
                  <option data-ev-id="ev_section_opt" key={section.id} value={section.id}>
                        {section.icon} {section.name}
                      </option>
                  )}
                  </select>
                  <p data-ev-id="ev_section_help" className="text-xs text-muted-foreground mt-1">
                    "ברירת מחדל" = מוצג בכל האתר, אלא אם יש פרסומת ספציפית למדור
                  </p>
                </div>
                
                <label data-ev-id="ev_d76dbec153" className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg cursor-pointer">
                  <input data-ev-id="ev_6b4abacf08"
                type="checkbox"
                checked={placementForm.applyToAll}
                onChange={(e) => setPlacementForm((prev) => ({ ...prev, applyToAll: e.target.checked }))}
                className="w-4 h-4 rounded" />

                  <span data-ev-id="ev_0059a4661b" className="text-sm">שבץ לכל המיקומים המתאימים בגודל</span>
                </label>
                
                <button data-ev-id="ev_4aec6dc30c"
              type="submit"
              className="w-full py-3 bg-secondary text-secondary-foreground font-bold rounded-lg hover:bg-secondary/90">

                  שבץ
                </button>
              </form>
            </motion.div>
          </div>
        }
      </AnimatePresence>

      {/* Campaign Modal */}
      <AnimatePresence>
        {showCampaignModal &&
        <div data-ev-id="ev_73f4228621" className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-surface rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">

              <div data-ev-id="ev_7047a4a05a" className="flex items-center justify-between p-6 border-b border-border">
                <h2 data-ev-id="ev_e059d9053d" className="text-xl font-bold">{editingCampaign ? 'עריכת קמפיין' : 'קמפיין חדש'}</h2>
                <button data-ev-id="ev_036e953097" onClick={() => {setShowCampaignModal(false);resetCampaignForm();}} className="p-2 hover:bg-muted rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form data-ev-id="ev_4078ba9dfd" onSubmit={handleCampaignSubmit} className="p-6 flex flex-col gap-4">
                <div data-ev-id="ev_a948345b60">
                  <label data-ev-id="ev_8f22688cfa" className="block text-sm font-medium mb-2">שם הקמפיין *</label>
                  <input data-ev-id="ev_651a6f5531"
                type="text"
                value={campaignForm.name}
                onChange={(e) => setCampaignForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full border border-border rounded-lg py-2.5 px-4 bg-background"
                placeholder="למשל: קמפיין חגים 2024"
                required />

                </div>

                {/* Client Section */}
                <div data-ev-id="ev_a4c08e8ae4" className="bg-muted/30 rounded-xl p-4 flex flex-col gap-4">
                  <h3 data-ev-id="ev_0608df1dd1" className="font-bold text-foreground text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-secondary" />
                    פרטי הלקוח/מפרסם
                  </h3>
                  <div data-ev-id="ev_bc81e8884b">
                    <label data-ev-id="ev_b951e3417b" className="block text-sm font-medium mb-2">שם הלקוח *</label>
                    <input data-ev-id="ev_3a19b3d0a9"
                  type="text"
                  value={campaignForm.client_name}
                  onChange={(e) => setCampaignForm((prev) => ({ ...prev, client_name: e.target.value }))}
                  className="w-full border border-border rounded-lg py-2.5 px-4 bg-background"
                  placeholder="שם המפרסם או החברה"
                  required />

                  </div>
                  <div data-ev-id="ev_1c3846aa35" className="grid grid-cols-2 gap-4">
                    <div data-ev-id="ev_5a5cdfacbb">
                      <label data-ev-id="ev_9c7f2c1c71" className="block text-sm font-medium mb-2">אימייל</label>
                      <input data-ev-id="ev_86c065f8c3"
                    type="email"
                    value={campaignForm.client_email}
                    onChange={(e) => setCampaignForm((prev) => ({ ...prev, client_email: e.target.value }))}
                    className="w-full border border-border rounded-lg py-2.5 px-4 bg-background"
                    placeholder="email@example.com" />

                    </div>
                    <div data-ev-id="ev_2b67add6ae">
                      <label data-ev-id="ev_b9b7666572" className="block text-sm font-medium mb-2">טלפון</label>
                      <input data-ev-id="ev_a5104be4fa"
                    type="tel"
                    value={campaignForm.client_phone}
                    onChange={(e) => setCampaignForm((prev) => ({ ...prev, client_phone: e.target.value }))}
                    className="w-full border border-border rounded-lg py-2.5 px-4 bg-background"
                    placeholder="050-0000000" />

                    </div>
                  </div>
                </div>

                {/* Campaign Details */}
                <div data-ev-id="ev_61246daf21" className="grid grid-cols-2 gap-4">
                  <div data-ev-id="ev_c171cb9a32">
                    <label data-ev-id="ev_9050fd95ce" className="block text-sm font-medium mb-2">תאריך התחלה</label>
                    <input data-ev-id="ev_f166bd246b"
                  type="date"
                  value={campaignForm.start_date}
                  onChange={(e) => setCampaignForm((prev) => ({ ...prev, start_date: e.target.value }))}
                  className="w-full border border-border rounded-lg py-2.5 px-4 bg-background" />

                  </div>
                  <div data-ev-id="ev_0c1a43fb51">
                    <label data-ev-id="ev_9109f820c8" className="block text-sm font-medium mb-2">תאריך סיום</label>
                    <input data-ev-id="ev_d414698be2"
                  type="date"
                  value={campaignForm.end_date}
                  onChange={(e) => setCampaignForm((prev) => ({ ...prev, end_date: e.target.value }))}
                  className="w-full border border-border rounded-lg py-2.5 px-4 bg-background" />

                  </div>
                </div>

                <div data-ev-id="ev_1bb6d3e2f5" className="grid grid-cols-2 gap-4">
                  <div data-ev-id="ev_0785429d3d">
                    <label data-ev-id="ev_22da0f1439" className="block text-sm font-medium mb-2">תקציב (₪)</label>
                    <input data-ev-id="ev_7e240e0aae"
                  type="number"
                  value={campaignForm.budget}
                  onChange={(e) => setCampaignForm((prev) => ({ ...prev, budget: e.target.value }))}
                  className="w-full border border-border rounded-lg py-2.5 px-4 bg-background"
                  placeholder="0" />

                  </div>
                  <div data-ev-id="ev_f7a6e1cf28">
                    <label data-ev-id="ev_08a3acc6e0" className="block text-sm font-medium mb-2">סטטוס</label>
                    <select data-ev-id="ev_b5e4ac3bfa"
                  value={campaignForm.status}
                  onChange={(e) => setCampaignForm((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full border border-border rounded-lg py-2.5 px-4 bg-background">

                      <option data-ev-id="ev_36270c2239" value="draft">טיוטה</option>
                      <option data-ev-id="ev_43276843e8" value="active">פעיל</option>
                      <option data-ev-id="ev_a58c009dcf" value="paused">מושהה</option>
                      <option data-ev-id="ev_1266a48f0b" value="completed">הסתיים</option>
                      <option data-ev-id="ev_ff1104a78c" value="cancelled">בוטל</option>
                    </select>
                  </div>
                </div>

                <div data-ev-id="ev_ac80ccb75b">
                  <label data-ev-id="ev_26a9451c86" className="block text-sm font-medium mb-2">הערות</label>
                  <textarea data-ev-id="ev_d8ac2cf492"
                value={campaignForm.notes}
                onChange={(e) => setCampaignForm((prev) => ({ ...prev, notes: e.target.value }))}
                className="w-full border border-border rounded-lg py-2.5 px-4 bg-background resize-none"
                rows={3}
                placeholder="הערות פנימיות..." />

                </div>

                <button data-ev-id="ev_26a35db092"
              type="submit"
              className="w-full py-3 bg-secondary text-secondary-foreground font-bold rounded-lg hover:bg-secondary/90">

                  {editingCampaign ? 'שמור שינויים' : 'צור קמפיין'}
                </button>
              </form>
            </motion.div>
          </div>
        }
      </AnimatePresence>

      {/* Creative Modal */}
      <AnimatePresence>
        {showCreativeModal &&
        <div data-ev-id="ev_709d600010" className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-surface rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">

              <div data-ev-id="ev_a56c509cda" className="flex items-center justify-between p-6 border-b border-border">
                <h2 data-ev-id="ev_bdc9a796a3" className="text-xl font-bold">{editingCreative ? 'עריכת באנר' : 'באנר חדש'}</h2>
                <button data-ev-id="ev_bab919b74c" onClick={() => {setShowCreativeModal(false);resetCreativeForm();}} className="p-2 hover:bg-muted rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form data-ev-id="ev_7502078eda" onSubmit={handleCreativeSubmit} className="p-6 flex flex-col gap-4">
                <div data-ev-id="ev_29a924893b">
                  <label data-ev-id="ev_d06a338aa7" className="block text-sm font-medium mb-2">קמפיין</label>
                  <select data-ev-id="ev_d22704c74a"
                value={creativeForm.campaign_id}
                onChange={(e) => setCreativeForm((prev) => ({ ...prev, campaign_id: e.target.value }))}
                className="w-full border border-border rounded-lg py-2.5 px-4 bg-background"
                required>

                    <option data-ev-id="ev_fd1a110362" value="">בחר קמפיין...</option>
                    {campaigns.map((c) =>
                  <option data-ev-id="ev_a748650b9f" key={c.id} value={c.id}>{c.name}</option>
                  )}
                  </select>
                </div>
                <div data-ev-id="ev_5eac262f89" className="grid grid-cols-2 gap-4">
                  <div data-ev-id="ev_3e02a4b4aa">
                    <label data-ev-id="ev_f37de85fca" className="block text-sm font-medium mb-2">שם הבאנר</label>
                    <input data-ev-id="ev_ffc5ce291f"
                  type="text"
                  value={creativeForm.name}
                  onChange={(e) => setCreativeForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-border rounded-lg py-2.5 px-4 bg-background"
                  required />

                  </div>
                  <div data-ev-id="ev_861728b464">
                    <label data-ev-id="ev_fa98b9a1ca" className="block text-sm font-medium mb-2">גודל</label>
                    <select data-ev-id="ev_63dd8a8d17"
                  value={creativeForm.size}
                  onChange={(e) => setCreativeForm((prev) => ({ ...prev, size: e.target.value }))}
                  className="w-full border border-border rounded-lg py-2.5 px-4 bg-background">

                      {Object.entries(SIZE_LABELS).map(([value, label]) =>
                    <option data-ev-id="ev_91ea791405" key={value} value={value}>{label} ({value})</option>
                    )}
                    </select>
                  </div>
                </div>
                <div data-ev-id="ev_a8d0e78836">
                  <label data-ev-id="ev_aa35e0bc03" className="block text-sm font-medium mb-2">תמונה</label>
                  <ImageUploader
                  value={creativeForm.image_url}
                  onChange={(url) => setCreativeForm((prev) => ({ ...prev, image_url: url }))}
                  disableWatermark={true} />

                </div>
                <div data-ev-id="ev_0b47c9d97c">
                  <label data-ev-id="ev_3f2fa09891" className="block text-sm font-medium mb-2">קישור (URL)</label>
                  <input data-ev-id="ev_e3e4bd93b9"
                type="url"
                value={creativeForm.target_url}
                onChange={(e) => setCreativeForm((prev) => ({ ...prev, target_url: e.target.value }))}
                className="w-full border border-border rounded-lg py-2.5 px-4 bg-background"
                placeholder="https://..." />

                </div>
                <button data-ev-id="ev_53aa61bfe7"
              type="submit"
              className="w-full py-3 bg-secondary text-secondary-foreground font-bold rounded-lg hover:bg-secondary/90">

                  {editingCreative ? 'שמור' : 'צור באנר'}
                </button>
              </form>
            </motion.div>
          </div>
        }
      </AnimatePresence>

      {/* Section Placement Modal */}
      <AnimatePresence>
        {showSectionPlacementModal &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-surface rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">

            <div data-ev-id="ev_a56c509cda" className="p-6">
              <h2 data-ev-id="ev_bdc9a796a3" className="text-xl font-bold text-foreground mb-4">הוסף פרסומת</h2>
              
              <div data-ev-id="ev_602cbf0d58" className="mb-6">
                <label data-ev-id="ev_9a765a99f7" className="block text-sm font-medium text-foreground mb-2">
                  בחר באנר פעיל
                </label>
                <div data-ev-id="ev_70948a116e" className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                  {activeCreatives.length === 0 ?
                  <p data-ev-id="ev_2ede82d948" className="text-sm text-muted-foreground text-center py-4">
                      אין באנרים פעילים. צור באנר חדש בעמוד ניהול פרסומות.
                    </p> :

                  activeCreatives.map((creative) =>
                  <button data-ev-id="ev_fe8a403981"
                  key={creative.id}
                  onClick={() => setSectionPlacementCreative(creative.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-right ${
                  sectionPlacementCreative === creative.id ?
                  'border-secondary bg-secondary/10' :
                  'border-border hover:border-secondary/50'}`
                  }>

                        <div data-ev-id="ev_59720235ab" className="w-16 h-12 rounded bg-muted overflow-hidden flex-shrink-0">
                          {creative.image_url ?
                      <img data-ev-id="ev_209275d1a2"
                      src={creative.image_url}
                      alt={creative.name}
                      className="w-full h-full object-cover" /> :


                      <div data-ev-id="ev_3d8e1f5bf3" className="w-full h-full flex items-center justify-center">
                              <Megaphone className="w-4 h-4 text-muted-foreground" />
                            </div>
                      }
                        </div>
                        <div data-ev-id="ev_d232dbfe4e" className="flex-1 min-w-0">
                          <p data-ev-id="ev_3ed3859a3e" className="font-medium text-foreground truncate">{creative.name}</p>
                          <p data-ev-id="ev_6c33258502" className="text-xs text-muted-foreground">
                            {creative.campaign?.name} • {creative.size}
                          </p>
                        </div>
                      </button>
                  )
                  }
                </div>
              </div>

              <div data-ev-id="ev_47f4220f4b" className="flex gap-3">
                <button data-ev-id="ev_1a565b9b1f"
                onClick={() => setShowSectionPlacementModal(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors">

                  ביטול
                </button>
                <button data-ev-id="ev_40aadfcc1b"
                onClick={handleAddSectionPlacement}
                disabled={!sectionPlacementCreative}
                className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">

                  הוסף פרסומת
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
        }
      </AnimatePresence>
    </AdminLayout>);

}
