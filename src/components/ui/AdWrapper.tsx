import { ReactNode } from 'react';
import PageAds from '@/components/ui/PageAds';

interface AdWrapperProps {
  page: string;
  children: ReactNode;
  showTopAd?: boolean;
  showBottomAd?: boolean;
  sidebar?: ReactNode;
  showSidebarAds?: boolean;
}

/**
 * Wrapper component that adds standard ad placements around content
 * Use this to wrap page content for consistent ad placement
 */
export default function AdWrapper({
  page,
  children,
  showTopAd = true,
  showBottomAd = true,
  sidebar,
  showSidebarAds = true
}: AdWrapperProps) {
  return (
    <>
      {/* Top Banner */}
      {showTopAd &&
      <div data-ev-id="ev_3c4b9587de" className="bg-background py-4 border-b border-border">
          <div data-ev-id="ev_eec5a385d9" className="container mx-auto px-4">
            <PageAds page={page} position="top" />
          </div>
        </div>
      }
      
      {/* Main Content */}
      {sidebar ?
      <div data-ev-id="ev_3fcdb2bf5d" className="container mx-auto px-4 py-8">
          <div data-ev-id="ev_2959d2ed9a" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Content */}
            <div data-ev-id="ev_20d65124df" className="lg:col-span-8">
              {children}
            </div>
            
            {/* Sidebar */}
            <aside data-ev-id="ev_34cde5e2c7" className="lg:col-span-4">
              <div data-ev-id="ev_eee60e53b4" className="sticky top-24 flex flex-col gap-6">
                {showSidebarAds &&
              <PageAds page={page} position="sidebar-top" />
              }
                {sidebar}
                {showSidebarAds &&
              <PageAds page={page} position="sidebar-bottom" />
              }
              </div>
            </aside>
          </div>
        </div> :

      children
      }
      
      {/* Bottom Banner */}
      {showBottomAd &&
      <div data-ev-id="ev_9e0cf06703" className="bg-muted/30 py-8">
          <div data-ev-id="ev_2c0049ecd6" className="container mx-auto px-4">
            <PageAds page={page} position="bottom" />
          </div>
        </div>
      }
    </>);

}