import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import { FileText, Shield, Accessibility } from 'lucide-react';

interface PageData {
  title: string;
  content: string;
  meta_description: string | null;
}

const pageIcons: Record<string, typeof FileText> = {
  terms: FileText,
  privacy: Shield,
  accessibility: Accessibility
};

export default function SitePage() {
  const location = useLocation();
  const slug = location.pathname.replace('/', '');
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      if (!supabase || !slug) return;

      const { data, error } = await supabase
        .from('site_pages')
        .select('title, content, meta_description')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (!error && data) {
        setPage(data);
        document.title = `${data.title} | הציבור החרדי`;
      }
      setLoading(false);
    };

    fetchPage();
  }, [slug]);

  const Icon = slug ? pageIcons[slug] || FileText : FileText;

  if (loading) {
    return (
      <Layout showTicker={false}>
        <div data-ev-id="ev_525a4cf4e2" className="container mx-auto px-4 py-20">
          <div data-ev-id="ev_c05f17d8e1" className="max-w-3xl mx-auto">
            <div data-ev-id="ev_5e0ee250b3" className="animate-pulse">
              <div data-ev-id="ev_82e738989b" className="h-10 bg-muted rounded w-1/3 mb-6" />
              <div data-ev-id="ev_fe63df2ea8" className="h-4 bg-muted rounded w-full mb-3" />
              <div data-ev-id="ev_496ded1896" className="h-4 bg-muted rounded w-5/6 mb-3" />
              <div data-ev-id="ev_7ae812bc42" className="h-4 bg-muted rounded w-4/6" />
            </div>
          </div>
        </div>
      </Layout>);

  }

  if (!page) {
    return (
      <Layout showTicker={false}>
        <div data-ev-id="ev_f3f159cdc3" className="container mx-auto px-4 py-20 text-center">
          <h1 data-ev-id="ev_4959819425" className="text-2xl font-bold text-foreground mb-4">הדף לא נמצא</h1>
          <p data-ev-id="ev_ee85fb335d" className="text-muted-foreground">הדף שחיפשת לא קיים או לא פורסם.</p>
        </div>
      </Layout>);

  }

  return (
    <Layout showTicker={false}>
      <div data-ev-id="ev_59765cc208" className="container mx-auto px-4 py-12">
        <div data-ev-id="ev_29ecfb64be" className="max-w-3xl mx-auto">
          {/* Header */}
          <div data-ev-id="ev_0f67fab271" className="flex items-center gap-3 mb-8">
            <div data-ev-id="ev_0477a7f50d" className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Icon className="w-6 h-6 text-secondary" />
            </div>
            <h1 data-ev-id="ev_6428ea2a62" className="text-3xl font-bold text-foreground font-serif">{page.title}</h1>
          </div>

          {/* Content */}
          <div data-ev-id="ev_53725d7898"
          className="prose prose-lg max-w-none text-foreground
              prose-headings:font-serif prose-headings:text-foreground
              prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-a:text-secondary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground
              prose-ul:text-muted-foreground prose-li:my-1"







          dangerouslySetInnerHTML={{ __html: page.content }} />

        </div>
      </div>
    </Layout>);

}