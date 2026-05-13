import { useParams, Link } from 'react-router';
import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import PageAds from '@/components/ui/PageAds';
import ActionBar from '@/components/ui/ActionBar';
import { useArticle, useArticles, ContentBlock } from '@/hooks/useArticles';
import { Clock, User, Eye, ChevronLeft, Loader2, Camera } from 'lucide-react';
import TextSizeSelector, { TextSize, getTextSizeClass } from '@/components/ui/TextSizeSelector';
import ArticleVoting from '@/components/ui/ArticleVoting';
import ArticleComments from '@/components/ui/ArticleComments';

// ============ CONTENT BLOCK RENDERER ============
// Renders content blocks as React components
// Images display exactly like the main article image

function ContentBlockRenderer({ blocks, htmlContent, textSizeClass }: {blocks: ContentBlock[];htmlContent?: string;textSizeClass: string;}) {
  // If no blocks or empty, use HTML content fallback
  if (!blocks || blocks.length === 0) {
    if (htmlContent) {
      return (
        <div data-ev-id="ev_13a94f3630"
        className={`article-content prose prose-lg max-w-none ${textSizeClass}`}
        dangerouslySetInnerHTML={{ __html: htmlContent }} />);


    }
    return null;
  }

  return (
    <div data-ev-id="ev_7b92657b2d" className={`article-content ${textSizeClass}`}>
      {blocks.map((block) => {
        switch (block.type) {
          case 'text':
            return block.content ?
            <div data-ev-id="ev_6b33506c92"
            key={block.id}
            className="prose prose-lg max-w-none mb-6"
            dangerouslySetInnerHTML={{ __html: block.content }} /> :

            null;

          case 'image':
            // Display image exactly like main article image
            return block.imageUrl ?
            <div data-ev-id="ev_3ec496aa38" key={block.id} className="my-8">
                <div data-ev-id="ev_bb22d1109e" className="rounded-xl overflow-hidden shadow-lg">
                  <img data-ev-id="ev_639dca9d22"
                src={block.imageUrl}
                alt={block.caption || ''}
                className="w-full h-auto object-contain" />

                </div>
                {(block.caption || block.photographer) &&
              <div data-ev-id="ev_90335cb2da" className="mt-3 text-center">
                    {block.caption &&
                <p data-ev-id="ev_6ae9186750" className="text-foreground font-medium">{block.caption}</p>
                }
                    {block.photographer &&
                <p data-ev-id="ev_278d12a2b3" className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1.5">
                        <Camera className="w-4 h-4" />
                        צילום: {block.photographer}
                      </p>
                }
                  </div>
              }
              </div> :
            null;

          case 'subtitle':
            return block.content ?
            <h2 data-ev-id="ev_6cc7dcc0ad"
            key={block.id}
            className="text-2xl font-bold text-foreground mt-10 mb-4 pb-2 border-b-2 border-secondary">

                {block.content}
              </h2> :
            null;

          case 'quote':
            return block.content ?
            <blockquote data-ev-id="ev_48734f28ce"
            key={block.id}
            className="my-8 p-6 bg-gradient-to-br from-secondary/5 to-secondary/10 border-r-4 border-secondary rounded-l-xl relative">

                <span data-ev-id="ev_b2e835f5da" className="absolute top-2 right-4 text-6xl text-secondary/20 font-serif">"</span>
                <p data-ev-id="ev_40445f6e50" className="text-lg italic text-foreground/90 pr-8">{block.content}</p>
                {block.quoteSource &&
              <cite data-ev-id="ev_ae749b11c6" className="block mt-3 text-sm text-muted-foreground not-italic">
                    — {block.quoteSource}
                  </cite>
              }
              </blockquote> :
            null;

          default:
            return null;
        }
      })}
    </div>);

}

export default function ArticleDetail() {
  const { id } = useParams<{id: string;}>();
  const { article, loading } = useArticle(id || '');
  const { articles: relatedFromDb } = useArticles({ limit: 4 });
  const [textSize, setTextSize] = useState<TextSize>('normal');

  if (loading) {
    return (
      <Layout>
        <div data-ev-id="ev_c2f410453b" className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="w-12 h-12 text-secondary animate-spin mx-auto" />
          <p data-ev-id="ev_c4bc2059be" className="text-muted-foreground mt-4">טוען...</p>
        </div>
      </Layout>);

  }

  if (!article) {
    return (
      <Layout>
        <div data-ev-id="ev_e90a8be663" className="container mx-auto px-4 py-20 text-center">
          <div data-ev-id="ev_5fcce15edd" className="bg-surface rounded-[12px] p-10 shadow-card border border-border max-w-md mx-auto">
            <h1 data-ev-id="ev_83c016fbc6" className="text-2xl font-bold mb-4 font-serif">הכתבה לא נמצאה</h1>
            <p data-ev-id="ev_bc64412f86" className="text-muted-foreground mb-6">הכתבה שחיפשת לא קיימת או הוסרה</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-primary rounded-[10px] font-bold hover:bg-secondary-light transition-all shadow-gold">
              <ChevronLeft className="w-5 h-5" />
              חזרה לדף הבית
            </Link>
          </div>
        </div>
      </Layout>);

  }

  // DEBUG INFO
  const blocks = article.contentBlocks || [];
  const imageBlocks = blocks.filter((b) => b.type === 'image');
  const debugInfo = `BLOCKS: ${blocks.length} | IMAGES: ${imageBlocks.length} | IMG URL LEN: ${imageBlocks[0]?.imageUrl?.length || 0}`;

  // Related articles
  const relatedArticles = relatedFromDb.filter((a) => a.id !== article.id).slice(0, 3);

  const categoryColors: Record<string, string> = {
    news: 'bg-news',
    articles: 'bg-articles',
    events: 'bg-events',
    video: 'bg-video'
  };

  const categoryLabels: Record<string, string> = {
    news: 'חדשות',
    articles: 'מאמרים',
    events: 'אירועים',
    video: 'וידאו'
  };

  const category = article.category || 'news';

  return (
    <Layout>
      {/* DEBUG BAR - TOP OF PAGE */}
      <div data-ev-id="ev_595e8b261c" style={{ background: 'red', color: 'white', padding: '20px', fontSize: '24px', fontWeight: 'bold', textAlign: 'center', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}>
        {debugInfo}
      </div>
      
      <ActionBar />

      <section data-ev-id="ev_c8c0a33621" className="py-10 bg-background">
        <div data-ev-id="ev_5d02702691" className="container mx-auto px-4">
          <div data-ev-id="ev_03a3c21306" className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main Content */}
            <article data-ev-id="ev_794bf6a0da" className="lg:col-span-2">
              {/* Header */}
              <header data-ev-id="ev_804a1218ef" className="mb-8">
                <div data-ev-id="ev_631eca180f" className="flex items-center gap-3 mb-5">
                  <span data-ev-id="ev_4a23a77707" className={`${categoryColors[category] || 'bg-secondary'} text-white px-4 py-1.5 rounded-[8px] text-sm font-medium`}>
                    {categoryLabels[category] || 'חדשות'}
                  </span>
                  {article.chassidut &&
                  <span data-ev-id="ev_67a9a1f134" className="bg-secondary/15 text-secondary-dark px-4 py-1.5 rounded-[8px] text-sm font-semibold">
                      {article.chassidut}
                    </span>
                  }
                  {article.isBreaking &&
                  <span data-ev-id="ev_658e0ca8fa" className="bg-red-600 text-white px-4 py-1.5 rounded-[8px] text-sm font-bold animate-pulse">
                      חדשות חמות
                    </span>
                  }
                </div>

                <h1 data-ev-id="ev_9d816a3180" className="text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-6 font-serif">
                  {article.title}
                </h1>

                <div data-ev-id="ev_adc5f59438" className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                  <div data-ev-id="ev_5230029346" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-secondary" />
                    <span data-ev-id="ev_96e2449b4f">{article.author}</span>
                  </div>
                  {article.photographer &&
                  <div data-ev-id="ev_photographer_info" className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-secondary" />
                      <span data-ev-id="ev_photographer_name">{article.photographer}</span>
                    </div>
                  }
                  <div data-ev-id="ev_c51651e832" className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-secondary" />
                    <span data-ev-id="ev_1c93be23e1">{article.hebrewDate || new Date(article.publishedAt).toLocaleDateString('he-IL')}</span>
                  </div>
                  <div data-ev-id="ev_c9173e68c0" className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-secondary" />
                    <span data-ev-id="ev_54e33b6eac">{(article.views || 0).toLocaleString()} צפיות</span>
                  </div>
                </div>

                {/* Action Bar */}
                <ActionBar
                  title={article.title}
                  content={`${article.excerpt || ''} ${article.content || ''}`}
                  className="pt-4 border-t border-border" />


                {/* Text Size Selector */}
                <div data-ev-id="ev_9d5a2eaf07" className="mt-4">
                  <TextSizeSelector onSizeChange={setTextSize} />
                </div>
              </header>

              {/* Featured Image */}
              <div data-ev-id="ev_ec4f4e6d16" className="mb-10">
                <div data-ev-id="ev_img_wrapper" className="rounded-2xl overflow-hidden shadow-lg">
                  <img data-ev-id="ev_3775381650"
                  src={article.image}
                  alt={article.title}
                  className="w-full h-auto object-contain" />
                </div>
                {article.photographer &&
                <p data-ev-id="ev_main_photo_credit" className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5">
                    <Camera className="w-4 h-4" />
                    צילום: {article.photographer}
                  </p>
                }
              </div>

              {/* Article Body */}
              <div data-ev-id="ev_9a1aba9eff" className={`${getTextSizeClass(textSize)} text-foreground`}>
                {article.excerpt &&
                <p data-ev-id="ev_e4fac6fef1" className="text-xl md:text-2xl font-medium text-foreground/90 mb-8 leading-relaxed border-r-4 border-secondary pr-4">
                    {article.excerpt}
                  </p>
                }
                
                {/* Render content blocks or HTML fallback */}
                <ContentBlockRenderer blocks={article.contentBlocks || []} htmlContent={article.content} textSizeClass={getTextSizeClass(textSize)} />
              </div>

              {/* Tags */}
              {article.chassidut &&
              <div data-ev-id="ev_be6740516f" className="mt-8 pt-6 border-t border-border">
                  <div data-ev-id="ev_75edf90fb0" className="flex items-center gap-2 flex-wrap">
                    <span data-ev-id="ev_0711fb8ed4" className="text-muted-foreground">תגיות:</span>
                    <span data-ev-id="ev_9cb13243f3" className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm">
                      {article.chassidut}
                    </span>
                  </div>
                </div>
              }

              {/* Voting Section */}
              <div data-ev-id="ev_3fd9b8736f" className="mt-10">
                <ArticleVoting articleType="articles" articleId={id || ''} />
              </div>

              {/* Comments Section */}
              <div data-ev-id="ev_908df76482" className="mt-8">
                <ArticleComments articleType="articles" articleId={id || ''} />
              </div>
            </article>

            {/* Sidebar */}
            <aside data-ev-id="ev_3f74363e56" className="flex flex-col gap-8">
              <PageAds page="article-detail" position="sidebar-top" />

              {/* Related Articles */}
              {relatedArticles.length > 0 &&
              <div data-ev-id="ev_e59f66a784" className="bg-surface rounded-[12px] p-6 shadow-card border border-border">
                <h3 data-ev-id="ev_b5b55fea6b" className="text-lg font-bold mb-4 font-serif">כתבות קשורות</h3>
                <div data-ev-id="ev_249fe0945a" className="flex flex-col gap-4">
                  {relatedArticles.map((relArticle) =>
                  <Link
                    key={relArticle.id}
                    to={`/article/${relArticle.id}`}
                    className="flex gap-3 group">

                      <img data-ev-id="ev_555ab36447"
                    src={relArticle.image}
                    alt={relArticle.title}
                    className="w-20 h-16 object-cover rounded-[8px]" />

                      <div data-ev-id="ev_1515db23d0" className="flex-1">
                        <h4 data-ev-id="ev_10958e5de2" className="font-medium text-sm line-clamp-2 group-hover:text-secondary transition-colors">
                          {relArticle.title}
                        </h4>
                        <span data-ev-id="ev_0721fc4906" className="text-xs text-muted-foreground mt-1 block">
                          {relArticle.hebrewDate || new Date(relArticle.publishedAt).toLocaleDateString('he-IL')}
                        </span>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
              }

              <PageAds page="article-detail" position="sidebar-bottom" />
            </aside>
          </div>
        </div>
      </section>

      {/* Bottom Banner */}
      <section data-ev-id="ev_5b5266fd0a" className="py-8 bg-muted/30">
        <div data-ev-id="ev_c4a9be0b15" className="container mx-auto px-4">
          <PageAds page="article-detail" position="bottom" />
        </div>
      </section>
    </Layout>);

}