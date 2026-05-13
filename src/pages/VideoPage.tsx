import Layout from '@/components/layout/Layout';
import SectionHeader from '@/components/ui/SectionHeader';
import VideoCard from '@/components/ui/VideoCard';
import PageAds from '@/components/ui/PageAds';
import StaggerGrid, { StaggerItem } from '@/components/ui/StaggerGrid';
import { Video, Loader2 } from 'lucide-react';
import { useVideos } from '@/hooks/useVideos';

export default function VideoPage() {
  const { videos, loading } = useVideos({ limit: 20 });

  return (
    <Layout>
      <div data-ev-id="ev_7d179fe858" className="py-8 bg-background">
        <div data-ev-id="ev_dec1e53edc" className="container mx-auto px-4">
          {/* Header */}
          <div data-ev-id="ev_15689cf03b" className="mb-8">
            <SectionHeader
              title="ערוץ הוידאו"
              icon={<Video className="w-6 h-6" />}
              variant="gold" />

            <p data-ev-id="ev_0fde695af1" className="text-muted-foreground mt-2">צפו בסרטונים האחרונים מהאירועים והטישים</p>
          </div>

          {/* Loading State */}
          {loading &&
          <div data-ev-id="ev_73186bcab9" className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-secondary animate-spin" />
            </div>
          }

          {/* Videos Grid */}
          {!loading && videos.length > 0 &&
          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video) =>
            <StaggerItem key={video.id}>
                  <VideoCard video={video} variant="medium" />
                </StaggerItem>
            )}
            </StaggerGrid>
          }

          {/* No Videos */}
          {!loading && videos.length === 0 &&
          <div data-ev-id="ev_bbfd561604" className="text-center py-20">
              <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p data-ev-id="ev_24cb954c9a" className="text-muted-foreground">אין סרטונים להצגה</p>
            </div>
          }
        </div>
      </div>

      {/* Bottom Banner - Full Width */}
      <PageAds page="video-list" position="bottom" />
    </Layout>);

}