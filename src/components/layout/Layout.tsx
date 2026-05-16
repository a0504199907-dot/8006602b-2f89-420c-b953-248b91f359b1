import { ReactNode, useEffect, useRef, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import NewsTicker from '@/components/ui/NewsTicker';
import FloatingActions from '@/components/ui/FloatingActions';
import CookieConsentBanner from '@/components/ui/CookieConsentBanner';
import FloatingAd from '@/components/ui/FloatingAd';
import { PageType } from '@/hooks/useAds';

interface LayoutProps {
  children: ReactNode;
  showTicker?: boolean;
  showSideAds?: boolean;
  pageType?: PageType;
  section?: string;
  articleId?: string;
}

export default function Layout({ children, showTicker = true, showSideAds = true, pageType = 'home', section, articleId }: LayoutProps) {
  const footerRef = useRef<HTMLDivElement>(null);
  const [bannerBottom, setBannerBottom] = useState(0);

  useEffect(() => {
    if (!showSideAds) return;
    const updateBannerBottom = () => {
      const footer = document.querySelector('footer');
      if (!footer) return;
      const footerRect = footer.getBoundingClientRect();
      const viewportH = window.innerHeight;
      if (footerRect.top < viewportH) {
        setBannerBottom(viewportH - footerRect.top);
      } else {
        setBannerBottom(0);
      }
    };
    window.addEventListener('scroll', updateBannerBottom, { passive: true });
    updateBannerBottom();
    return () => window.removeEventListener('scroll', updateBannerBottom);
  }, [showSideAds]);

  const bannerStyle = bannerBottom > 0 ? { bottom: bannerBottom } : undefined;

  return (
    <div data-ev-id="ev_89a8c2495e" className="min-h-screen bg-background">
      <Header />
      {showTicker && <NewsTicker />}

      {/* Fixed Side Ad Overlays */}
      {showSideAds && (
        <>
          <div
            className="hidden xl:flex fixed left-0 w-[180px] px-2 z-40 items-center justify-center overflow-hidden"
            style={{ top: 151, bottom: bannerBottom || undefined }}
          >
            <FloatingAd pageType={pageType} side="left" section={section} articleId={articleId} />
          </div>
          <div
            className="hidden xl:flex fixed right-0 w-[180px] px-2 z-40 items-center justify-center overflow-hidden"
            style={{ top: 151, bottom: bannerBottom || undefined }}
          >
            <FloatingAd pageType={pageType} side="right" section={section} articleId={articleId} />
          </div>
        </>
      )}

      {/* Content with side ads */}
      <div data-ev-id="ev_99f5f9e784" className="flex">
        <div data-ev-id="ev_7d69ab93a5" className="hidden xl:block w-[180px] shrink-0" />
        
        {/* Main Content */}
        <main data-ev-id="ev_4208ec8c61" className="flex-1 min-w-0">
          {children}
        </main>
        
        <div data-ev-id="ev_6455f33204" className="hidden xl:block w-[180px] shrink-0" />
      </div>
      
      <Footer />
      <FloatingActions />
      <CookieConsentBanner />
    </div>);

}
