import Layout from '@/components/layout/Layout';
import SectionHeader from '@/components/ui/SectionHeader';
import ArticleCardClean from '@/components/ui/ArticleCardClean';
import PageAds from '@/components/ui/PageAds';
import StaggerGrid, { StaggerItem } from '@/components/ui/StaggerGrid';
import { Newspaper, Loader2 } from 'lucide-react';
import { useArticles } from '@/hooks/useArticles';

export default function NewsPage() {
  const { articles, loading } = useArticles({ limit: 20 });

  return (
    <Layout>
      <div data-ev-id="ev_35c83d65db" className="py-8 bg-background">
        <div data-ev-id="ev_6924446adc" className="container mx-auto px-4">
          {/* Header */}
          <div data-ev-id="ev_d0a43f8c9c" className="mb-8">
            <SectionHeader
              title="כל החדשות"
              icon={<Newspaper className="w-6 h-6" />}
              variant="gold" />

            <p data-ev-id="ev_1681bd20fb" className="text-muted-foreground mt-2">כל החדשות החמות מהעולם החרדי</p>
          </div>

          {/* Loading State */}
          {loading &&
          <div data-ev-id="ev_f91cf17fc1" className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-secondary animate-spin" />
            </div>
          }

          {/* Articles Grid */}
          {!loading && articles.length > 0 &&
          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {articles.map((article, idx) =>
            <StaggerItem key={article.id}>
                  <ArticleCardClean article={article} index={idx} />
                </StaggerItem>
            )}
            </StaggerGrid>
          }

          {/* No Articles */}
          {!loading && articles.length === 0 &&
          <div data-ev-id="ev_bf2c1c23f2" className="text-center py-20">
              <Newspaper className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p data-ev-id="ev_0eb8a8a9d8" className="text-muted-foreground">אין כתבות להצגה</p>
            </div>
          }
        </div>
      </div>

      {/* Bottom Banner - Full Width */}
      <PageAds page="news-list" position="bottom" />
    </Layout>);

}