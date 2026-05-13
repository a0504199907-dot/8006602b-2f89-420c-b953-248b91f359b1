import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router';
import { supabase } from '@/integrations/supabase/client';

// Generate a unique session ID
function generateSessionId(): string {
  return 'sess_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Get or create session ID from sessionStorage
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

// Parse user agent for device info
function parseUserAgent(): { deviceType: string; browser: string; os: string } {
  const ua = navigator.userAgent;
  
  // Device type
  let deviceType = 'desktop';
  if (/Mobi|Android/i.test(ua)) deviceType = 'mobile';
  else if (/Tablet|iPad/i.test(ua)) deviceType = 'tablet';
  
  // Browser
  let browser = 'unknown';
  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('MSIE') || ua.includes('Trident')) browser = 'IE';
  
  // OS
  let os = 'unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  
  return { deviceType, browser, os };
}

// Get or create visitor hash from edge function (real IP-based)
async function getVisitorHash(): Promise<string> {
  // Check cache first
  const cached = sessionStorage.getItem('analytics_visitor_hash');
  if (cached) return cached;
  
  // Fallback fingerprint if edge function fails
  const fallbackHash = generateFallbackHash();
  
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) return fallbackHash;
    
    const response = await fetch(`${supabaseUrl}/functions/v1/get-visitor-id`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.visitor_id) {
        sessionStorage.setItem('analytics_visitor_hash', data.visitor_id);
        return data.visitor_id;
      }
    }
  } catch (e) {
    console.warn('Failed to get visitor ID from server, using fallback');
  }
  
  sessionStorage.setItem('analytics_visitor_hash', fallbackHash);
  return fallbackHash;
}

// Fallback fingerprint when edge function is unavailable
function generateFallbackHash(): string {
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 0,
    navigator.maxTouchPoints || 0
  ].join('|');
  
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'f_' + Math.abs(hash).toString(36);
}

// Extract page type and content info from URL
function getPageInfo(pathname: string): { pageType: string; contentType?: string; contentId?: string } {
  const segments = pathname.split('/').filter(Boolean);
  
  if (segments.length === 0) {
    return { pageType: 'home' };
  }
  
  const section = segments[0];
  const id = segments[1];
  
  // Map routes to content types
  const contentTypeMap: Record<string, string> = {
    'siah': 'siah_hatzibur',
    'before-18': 'before_18_years',
    'bein-hatzibur': 'bein_hatzibur',
    'news-batzibur': 'news_batzibur',
    'historical': 'historical_events',
    'gallery': 'galleries',
    'video': 'videos',
    'article': 'articles',
    'events': 'events'
  };
  
  const pageTypeMap: Record<string, string> = {
    'siah': 'section',
    'before-18': 'section',
    'bein-hatzibur': 'section',
    'news-batzibur': 'section',
    'historical': 'section',
    'gallery': 'section',
    'video': 'section',
    'events': 'section',
    'articles': 'section',
    'newspaper': 'section',
    'news': 'section',
    'admin': 'admin'
  };
  
  if (id && contentTypeMap[section]) {
    return {
      pageType: 'article',
      contentType: contentTypeMap[section],
      contentId: id
    };
  }
  
  return {
    pageType: pageTypeMap[section] || 'page'
  };
}

// Get UTM parameters from URL
function getUtmParams(): { utm_source?: string; utm_medium?: string; utm_campaign?: string } {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined
  };
}

// Session tracking
let sessionStarted = false;
let currentPageviewId: string | null = null;
let pageEnteredAt: number = 0;
let maxScrollDepth = 0;

async function startSession(pathname: string): Promise<void> {
  if (!supabase || sessionStarted) return;
  
  const sessionId = getSessionId();
  const { deviceType, browser, os } = parseUserAgent();
  const utmParams = getUtmParams();
  
  try {
    await supabase.from('analytics_sessions').insert({
      session_id: sessionId,
      ip_hash: await getVisitorHash(),
      user_agent: navigator.userAgent,
      device_type: deviceType,
      browser,
      os,
      screen_width: screen.width,
      screen_height: screen.height,
      referrer: document.referrer || null,
      landing_page: pathname,
      ...utmParams,
      is_active: true
    });
    sessionStarted = true;
  } catch (error) {
    console.error('Failed to start analytics session:', error);
  }
}

async function trackPageview(pathname: string): Promise<void> {
  if (!supabase) return;
  
  const sessionId = getSessionId();
  const { pageType, contentType, contentId } = getPageInfo(pathname);
  
  // Don't track admin pages
  if (pageType === 'admin') return;
  
  // End previous pageview
  if (currentPageviewId) {
    await endPageview();
  }
  
  pageEnteredAt = Date.now();
  maxScrollDepth = 0;
  
  try {
    const { data } = await supabase.from('analytics_pageviews').insert({
      session_id: sessionId,
      page_url: window.location.href,
      page_path: pathname,
      page_title: document.title,
      page_type: pageType,
      content_type: contentType || null,
      content_id: contentId || null
    }).select('id').single();
    
    currentPageviewId = data?.id || null;
    
    // Update session page count (RPC might not exist, that's ok)
    try {
      await supabase.rpc('increment_session_page_count', { p_session_id: sessionId });
    } catch {
      // Ignore RPC errors
    }
  } catch (error) {
    console.error('Failed to track pageview:', error);
  }
}

async function endPageview(): Promise<void> {
  if (!supabase || !currentPageviewId) return;
  
  const timeOnPage = Math.round((Date.now() - pageEnteredAt) / 1000);
  const isBounce = timeOnPage < 10 && maxScrollDepth < 25;
  
  try {
    await supabase.from('analytics_pageviews').update({
      exited_at: new Date().toISOString(),
      time_on_page_seconds: timeOnPage,
      scroll_depth_percent: maxScrollDepth,
      is_bounce: isBounce
    }).eq('id', currentPageviewId);
  } catch (error) {
    console.error('Failed to end pageview:', error);
  }
  
  currentPageviewId = null;
}

async function endSession(): Promise<void> {
  if (!supabase) return;
  
  const sessionId = getSessionId();
  
  try {
    await supabase.from('analytics_sessions').update({
      ended_at: new Date().toISOString(),
      is_active: false
    }).eq('session_id', sessionId);
  } catch (error) {
    console.error('Failed to end session:', error);
  }
}

// Track custom events
export async function trackEvent(
  eventType: string,
  options?: {
    category?: string;
    action?: string;
    label?: string;
    value?: number;
    elementId?: string;
    elementClass?: string;
    elementText?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  if (!supabase) return;
  
  const sessionId = getSessionId();
  
  try {
    await supabase.from('analytics_events').insert({
      session_id: sessionId,
      event_type: eventType,
      event_category: options?.category || null,
      event_action: options?.action || null,
      event_label: options?.label || null,
      event_value: options?.value || null,
      element_id: options?.elementId || null,
      element_class: options?.elementClass || null,
      element_text: options?.elementText?.slice(0, 100) || null,
      page_url: window.location.href,
      metadata: options?.metadata || null
    });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

// Ad tracking functions
export async function trackAdView(creativeId: string, slotName: string): Promise<void> {
  await trackEvent('ad_view', {
    category: 'ad',
    action: 'view',
    label: slotName,
    metadata: { creative_id: creativeId, slot_name: slotName }
  });
}

export async function trackAdClick(creativeId: string, slotName: string): Promise<void> {
  await trackEvent('ad_click', {
    category: 'ad',
    action: 'click',
    label: slotName,
    metadata: { creative_id: creativeId, slot_name: slotName }
  });
}

export async function trackAdDismiss(creativeId: string, slotName: string): Promise<void> {
  await trackEvent('ad_dismiss', {
    category: 'ad',
    action: 'dismiss',
    label: slotName,
    metadata: { creative_id: creativeId, slot_name: slotName }
  });
}

// Main hook for automatic page tracking
export function useAnalytics(): void {
  const location = useLocation();
  const isInitialized = useRef(false);
  
  // Track scroll depth
  const handleScroll = useCallback(() => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight > 0) {
      const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);
      maxScrollDepth = Math.max(maxScrollDepth, scrollPercent);
      
      // Track scroll milestones
      const milestones = [25, 50, 75, 100];
      for (const milestone of milestones) {
        const key = `scroll_${milestone}_tracked_${location.pathname}`;
        if (scrollPercent >= milestone && !sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, 'true');
          trackEvent('scroll_depth', {
            category: 'engagement',
            action: 'scroll',
            value: milestone,
            metadata: { page: location.pathname }
          });
        }
      }
    }
  }, [location.pathname]);
  
  // Initialize session and tracking
  useEffect(() => {
    if (!supabase) return;
    
    if (!isInitialized.current) {
      isInitialized.current = true;
      startSession(location.pathname);
      
      // Handle page unload
      const handleUnload = () => {
        endPageview();
        endSession();
      };
      
      window.addEventListener('beforeunload', handleUnload);
      
      return () => {
        window.removeEventListener('beforeunload', handleUnload);
      };
    }
  }, [location.pathname]);
  
  // Track page views
  useEffect(() => {
    if (!supabase) return;
    trackPageview(location.pathname);
    
    // Reset scroll tracking for new page
    const milestones = [25, 50, 75, 100];
    for (const milestone of milestones) {
      sessionStorage.removeItem(`scroll_${milestone}_tracked_${location.pathname}`);
    }
  }, [location.pathname]);
  
  // Scroll tracking
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
}

// Utility to track content engagement
export function useContentEngagement(contentType: string, contentId: string, contentTitle?: string): void {
  const startTime = useRef(Date.now());
  const lastScrollDepth = useRef(0);
  
  useEffect(() => {
    if (!supabase || !contentId) return;
    
    startTime.current = Date.now();
    lastScrollDepth.current = 0;
    
    // Track scroll depth for this content
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        lastScrollDepth.current = Math.max(
          lastScrollDepth.current,
          Math.round((window.scrollY / scrollHeight) * 100)
        );
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Update content stats on unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
      
      const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
      const today = new Date().toISOString().split('T')[0];
      
      // Upsert content stats
      supabase.from('analytics_content_stats')
        .upsert(
          {
            content_type: contentType,
            content_id: contentId,
            content_title: contentTitle || null,
            date: today,
            views: 1,
            unique_visitors: 1,
            avg_time_seconds: timeSpent,
            avg_scroll_depth: lastScrollDepth.current
          },
          {
            onConflict: 'content_type,content_id,date',
            ignoreDuplicates: false
          }
        )
        .then(() => {})
        .catch(console.error);
    };
  }, [contentType, contentId, contentTitle]);
}
