import { ReactNode } from 'react';
import { Link } from 'react-router';
import { Loader2, Megaphone, ArrowRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import PageAds from '@/components/ui/PageAds';

interface ArticleDetailLayoutProps {
  loading: boolean;
  notFound?: boolean;
  backLink: string;
  backText: string;
  breadcrumbs?: {label: string;href?: string;}[];
  children: ReactNode;
}

export default function ArticleDetailLayout({
  loading,
  notFound,
  backLink,
  backText,
  breadcrumbs,
  children
}: ArticleDetailLayoutProps) {
  if (loading) {
    return (
      <Layout showSideAds={false}>
        <div data-ev-id="ev_0f333518ee" className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 text-secondary animate-spin" />
        </div>
      </Layout>);

  }

  if (notFound) {
    return (
      <Layout showSideAds={false}>
        <div data-ev-id="ev_2f640b7b2d" className="container mx-auto px-4 py-20 text-center">
          <h1 data-ev-id="ev_9b07739f1f" className="text-2xl font-bold text-foreground mb-4">הפריט לא נמצא</h1>
          <Link to={backLink} className="text-secondary hover:underline">{backText}</Link>
        </div>
      </Layout>);

  }

  return (
    <Layout showSideAds={false}>
      <div data-ev-id="ev_556e7d62ab" className="container mx-auto px-4 py-6 sm:py-8">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 &&
        <div data-ev-id="ev_82c0a4406e" className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
            {breadcrumbs.map((crumb, idx) =>
          <span data-ev-id="ev_abfe8188b5" key={idx} className="flex items-center gap-2 min-w-0">
                {crumb.href ?
            <Link to={crumb.href} className="hover:text-secondary transition-colors truncate max-w-[150px] sm:max-w-none">
                    {crumb.label}
                  </Link> :

            <span data-ev-id="ev_4b167df75d" className="text-foreground line-clamp-1 max-w-[180px] sm:max-w-none">{crumb.label}</span>
            }
                {idx < breadcrumbs.length - 1 && <span data-ev-id="ev_658e011669">/</span>}
              </span>
          )}
          </div>
        }

        {/* Main Grid: Content + Sidebar */}
        <div data-ev-id="ev_084ff324d4" className="grid grid-cols-12 gap-4 sm:gap-8">
          {/* Content - Right side (RTL) */}
          <div data-ev-id="ev_7555457045" className="col-span-12 lg:col-span-8">
            {children}
          </div>

          {/* Sidebar - Left side (RTL) */}
          <aside data-ev-id="ev_d8369f11dc" className="col-span-12 lg:col-span-4">
            <div data-ev-id="ev_24c6a47cb9" className="sticky top-24 flex flex-col gap-4">
              {/* Back Link */}
              <Link
                to={backLink}
                className="flex items-center gap-2 text-muted-foreground hover:text-secondary transition-colors text-sm">

                <ArrowRight className="w-4 h-4" />
                {backText}
              </Link>

              {/* === SIDEBAR ADS === */}
              
              {/* Large Sidebar Ad (sidebar-1) - 300x600 */}
              <div data-ev-id="ev_65867dbc2d" className="min-h-[600px]">
                <PageAds pageType="article" position="sidebar-1" />
              </div>

              {/* Two Smaller Ads (sidebar-2 + sidebar-3) - 300x250 each */}
              <div data-ev-id="ev_44e556a208" className="min-h-[250px]">
                <PageAds pageType="article" position="sidebar-2" />
              </div>
              
              <div data-ev-id="ev_d531862d61" className="min-h-[250px]">
                <PageAds pageType="article" position="sidebar-3" />
              </div>
            </div>
          </aside>
        </div>

        {/* Bottom Full-Width Ad */}
        <div data-ev-id="ev_cf333a1ae8" className="mt-12">
          <PageAds pageType="article" position="bottom" />
        </div>
      </div>
    </Layout>);

}