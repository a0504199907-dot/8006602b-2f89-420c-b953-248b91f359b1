import { ReactNode } from 'react';
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

const HEADER_HEIGHT = 151;

export default function Layout({ children, showTicker = true, showSideAds = true, pageType = 'home', section, articleId }: LayoutProps) {
  return (
    <div data-ev-id="ev_89a8c2495e" className="min-h-screen bg-background" style={{ overflowX: 'clip' }}>
      <Header />
      {showTicker && <NewsTicker />}

      {/* Content with side ads */}
      <div data-ev-id="ev_99f5f9e784" className="flex">
        {/* Left Ad Column */}
        {showSideAds &&
          <div
            data-ev-id="ev_7d69ab93a5"
            className="hidden xl:block w-[180px] shrink-0 px-2 pt-4"
            style={{
              position: 'sticky',
              top: HEADER_HEIGHT,
              alignSelf: 'flex-start',
              maxHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
              overflow: 'hidden',
            }}
          >
            <FloatingAd pageType={pageType} side="left" section={section} articleId={articleId} />
          </div>
        }

        {/* Main Content */}
        <main data-ev-id="ev_4208ec8c61" className="flex-1 min-w-0">
          {children}
        </main>

        {/* Right Ad Column */}
        {showSideAds &&
          <div
            data-ev-id="ev_6455f33204"
            className="hidden xl:block w-[180px] shrink-0 px-2 pt-4"
            style={{
              position: 'sticky',
              top: HEADER_HEIGHT,
              alignSelf: 'flex-start',
              maxHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
              overflow: 'hidden',
            }}
          >
            <FloatingAd pageType={pageType} side="right" section={section} articleId={articleId} />
          </div>
        }
      </div>

      <Footer />
      <FloatingActions />
      <CookieConsentBanner />
    </div>);

}
