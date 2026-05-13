/**
 * Dynamic Sitemap Edge Function
 * Generates XML sitemap with all published content
 */

import { createClient } from 'npm:@supabase/supabase-js@2';

const SITE_URL = 'https://hatzibur.co.il';

interface ContentItem {
  id: string;
  updated_at?: string;
  created_at?: string;
  gregorian_date?: string;
}

Deno.serve(async () => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const today = new Date().toISOString().split('T')[0];

    // Fetch content from all tables
    const [siahRes, newsRes, before18Res, beinRes, historicalRes, galleriesRes, eventsRes] = await Promise.all([
      supabase.from('siah_hatzibur').select('id, updated_at, gregorian_date').order('created_at', { ascending: false }).limit(100),
      supabase.from('news_batzibur').select('id, updated_at, created_at').order('created_at', { ascending: false }).limit(100),
      supabase.from('before_18_years').select('id, updated_at, gregorian_date').order('created_at', { ascending: false }).limit(100),
      supabase.from('bein_hatzibur').select('id, updated_at, created_at').order('created_at', { ascending: false }).limit(100),
      supabase.from('historical_events').select('id, updated_at, gregorian_date').order('created_at', { ascending: false }).limit(100),
      supabase.from('galleries').select('id, updated_at, created_at').order('created_at', { ascending: false }).limit(100),
      supabase.from('events').select('id, updated_at, event_date').order('created_at', { ascending: false }).limit(50),
    ]);

    // Generate URL entries
    const urls: string[] = [];
    
    // Static pages
    urls.push(generateUrl(SITE_URL, today, 'daily', '1.0'));
    urls.push(generateUrl(`${SITE_URL}/newspaper`, today, 'weekly', '0.9'));
    urls.push(generateUrl(`${SITE_URL}/siah`, today, 'daily', '0.9'));
    urls.push(generateUrl(`${SITE_URL}/news-batzibur`, today, 'daily', '0.9'));
    urls.push(generateUrl(`${SITE_URL}/bein-hatzibur`, today, 'daily', '0.8'));
    urls.push(generateUrl(`${SITE_URL}/before-18`, today, 'weekly', '0.8'));
    urls.push(generateUrl(`${SITE_URL}/historical`, today, 'weekly', '0.8'));
    urls.push(generateUrl(`${SITE_URL}/gallery`, today, 'daily', '0.8'));
    urls.push(generateUrl(`${SITE_URL}/events`, today, 'weekly', '0.7'));
    urls.push(generateUrl(`${SITE_URL}/videos`, today, 'weekly', '0.7'));
    urls.push(generateUrl(`${SITE_URL}/advertise`, '2025-01-01', 'monthly', '0.6'));

    // Dynamic content
    if (siahRes.data) {
      for (const item of siahRes.data) {
        const lastmod = getLastmod(item);
        urls.push(generateUrl(`${SITE_URL}/siah/${item.id}`, lastmod, 'monthly', '0.8'));
      }
    }

    if (newsRes.data) {
      for (const item of newsRes.data) {
        const lastmod = getLastmod(item);
        urls.push(generateUrl(`${SITE_URL}/news-batzibur/${item.id}`, lastmod, 'monthly', '0.8'));
      }
    }

    if (before18Res.data) {
      for (const item of before18Res.data) {
        const lastmod = getLastmod(item);
        urls.push(generateUrl(`${SITE_URL}/before-18/${item.id}`, lastmod, 'monthly', '0.7'));
      }
    }

    if (beinRes.data) {
      for (const item of beinRes.data) {
        const lastmod = getLastmod(item);
        urls.push(generateUrl(`${SITE_URL}/bein-hatzibur/${item.id}`, lastmod, 'monthly', '0.7'));
      }
    }

    if (historicalRes.data) {
      for (const item of historicalRes.data) {
        const lastmod = getLastmod(item);
        urls.push(generateUrl(`${SITE_URL}/historical/${item.id}`, lastmod, 'monthly', '0.7'));
      }
    }

    if (galleriesRes.data) {
      for (const item of galleriesRes.data) {
        const lastmod = getLastmod(item);
        urls.push(generateUrl(`${SITE_URL}/gallery/${item.id}`, lastmod, 'monthly', '0.7'));
      }
    }

    if (eventsRes.data) {
      for (const item of eventsRes.data) {
        const lastmod = (item as any).event_date?.split('T')[0] || item.updated_at?.split('T')[0] || today;
        urls.push(generateUrl(`${SITE_URL}/events/${item.id}`, lastmod, 'monthly', '0.6'));
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    console.error('Sitemap generation error:', err);
    return new Response('Error generating sitemap', { status: 500 });
  }
});

function generateUrl(loc: string, lastmod: string, changefreq: string, priority: string): string {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function getLastmod(item: ContentItem): string {
  const date = item.updated_at || item.gregorian_date || item.created_at;
  if (date) {
    try {
      return new Date(date).toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }
  return new Date().toISOString().split('T')[0];
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
