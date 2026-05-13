import Layout from '@/components/layout/Layout';
import ArticleCard from '@/components/ui/ArticleCard';
import PageAds from '@/components/ui/PageAds';
import { useArticles } from '@/hooks/useArticles';
import { BookOpen, Loader2 } from 'lucide-react';

export default function ArticlesPage() {
  const { articles, loading } = useArticles({ limit: 20 });

  return (
    <Layout>
      {/* Page Header */}
      <div data-ev-id="ev_17d4918a65" className="bg-gradient-to-br from-articles to-amber-800 text-white py-10">
        <div data-ev-id="ev_6925bc5f74" className="container mx-auto px-4">
          <h1 data-ev-id="ev_7498fe5523" className="text-4xl font-bold font-serif">מאמרים וכתבות</h1>
          <p data-ev-id="ev_6c2b823c99" className="mt-2 opacity-80 text-lg">מאמרים מעמיקים, כתבות וסיפורים מעולם החסידות</p>
          <div data-ev-id="ev_0345a30bf5" className="w-16 h-1 bg-secondary mt-4 rounded-full" />
        </div>
      </div>

      {/* Content */}
      <section data-ev-id="ev_5f1f131501" className="py-10 bg-background">
        <div data-ev-id="ev_9235aac31d" className="container mx-auto px-4">
          {/* Loading State */}
          {loading &&
          <div data-ev-id="ev_6e825d7403" className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-secondary animate-spin" />
            </div>
          }

          {/* No Articles */}
          {!loading && articles.length === 0 &&
          <div data-ev-id="ev_2c39426f6f" className="text-center py-20">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p data-ev-id="ev_7e53c69acb" className="text-muted-foreground">אין מאמרים להצגה</p>
            </div>
          }

          {/* Articles Content */}
          {!loading && articles.length > 0 &&
          <div data-ev-id="ev_d442eb485d">
              {/* Featured article */}
              {articles[0] &&
            <div data-ev-id="ev_fe5062c233" className="mb-10">
                  <ArticleCard article={articles[0]} variant="large" />
                </div>
            }

              {/* More articles */}
              <div data-ev-id="ev_677587e32a" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.slice(1).map((article) =>
              <ArticleCard key={article.id} article={article} variant="medium" />
              )}
              </div>

              {/* Load more button */}
              <div data-ev-id="ev_6ef48883f5" className="text-center mt-10">
                <button data-ev-id="ev_b5cb64bcc1" className="px-8 py-3 bg-secondary text-primary font-bold hover:bg-secondary-light transition-all duration-200 shadow-gold">
                  טען עוד מאמרים
                </button>
              </div>
            </div>
          }
        </div>
      </section>

      {/* Bottom Banner - Full Width */}
      <PageAds page="articles-list" position="bottom" />
    </Layout>);

}