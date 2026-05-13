import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { getCache, setCache, CACHE_KEYS } from '@/lib/cache';
import PDFFlipViewer from '@/components/ui/PDFFlipViewer';
import PageAds from '@/components/ui/PageAds';
import {
  Newspaper,
  Calendar,
  FileText,
  Loader2,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight } from
'lucide-react';

interface NewspaperIssue {
  id: string;
  issue_number: number;
  title: string;
  cover_image_url: string | null;
  pdf_url: string | null;
  hebrew_date: string | null;
  gregorian_date: string;
  parasha: string | null;
  description: string | null;
}

interface SelectedPdf {
  url: string;
  title: string;
  issueNumber: number;
  hebrewDate?: string;
}

const CACHE_KEY = 'newspaper_page_issues';

export default function NewspaperPage() {
  const [issues, setIssues] = useState<NewspaperIssue[]>(() => getCache(CACHE_KEY) || []);
  const [loading, setLoading] = useState(!getCache(CACHE_KEY));
  const [selectedPdf, setSelectedPdf] = useState<SelectedPdf | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    // Show cached data immediately
    const cached = getCache<NewspaperIssue[]>(CACHE_KEY);
    if (cached && cached.length > 0) {
      setIssues(cached);
      setLoading(false);
    }
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    if (!supabase) {setLoading(false);return;}

    try {
      const { data, error } = await supabase.
      from('newspaper_issues').
      select('*').
      eq('is_published', true).
      order('gregorian_date', { ascending: false });

      if (error) throw error;
      setIssues(data || []);
      setCache(CACHE_KEY, data || []);
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(issues.length / itemsPerPage);
  const paginatedIssues = issues.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const latestIssue = issues[0];

  return (
    <Layout>
      <div data-ev-id="ev_9dea55da35" className="container mx-auto px-4 py-8">
        {/* Header */}
        <div data-ev-id="ev_029ec300c3" className="text-center mb-10">
          <h1 data-ev-id="ev_2b55ca6a30" className="text-4xl font-bold text-foreground font-serif mb-3">עמוד שער</h1>
          <p data-ev-id="ev_b70cd3090d" className="text-muted-foreground text-lg">ארכיון גיליונות עיתון הציבור החרדי</p>
        </div>

        {loading ?
        <div data-ev-id="ev_8736b8ff94" className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-secondary animate-spin" />
          </div> :

        <>
            {/* Latest Issue Highlight */}
            {latestIssue &&
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 bg-gradient-to-br from-primary to-primary-light rounded-3xl overflow-hidden">

                <div data-ev-id="ev_280d52bc5f" className="grid md:grid-cols-2 gap-0">
                  {/* Cover Image */}
                  <div data-ev-id="ev_a336735d0c" className="relative aspect-[3/4] md:aspect-auto">
                    {latestIssue.cover_image_url ?
                <img data-ev-id="ev_9417116835"
                src={latestIssue.cover_image_url}
                alt={latestIssue.title}
                className="w-full h-full object-cover" /> :


                <div data-ev-id="ev_64fcd4858c" className="w-full h-full bg-white/10 flex items-center justify-center">
                        <Newspaper className="w-24 h-24 text-white/30" />
                      </div>
                }
                    <div data-ev-id="ev_b83842ae86" className="absolute top-4 right-4 bg-secondary text-primary px-4 py-2 rounded-full font-bold">
                      גיליון אחרון!
                    </div>
                  </div>

                  {/* Info */}
                  <div data-ev-id="ev_93284fdd35" className="p-8 md:p-12 flex flex-col justify-center text-white">
                    <div data-ev-id="ev_b92796ee29" className="mb-4">
                      <span data-ev-id="ev_f34cc1bf10" className="text-secondary text-lg font-bold">גיליון {latestIssue.issue_number}</span>
                    </div>
                    <h2 data-ev-id="ev_a76aca781a" className="text-3xl md:text-4xl font-bold font-serif mb-4">{latestIssue.title}</h2>
                    <div data-ev-id="ev_eb655ef8be" className="flex items-center gap-4 mb-4 text-white/80">
                      <span data-ev-id="ev_8c264dc18c" className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        {latestIssue.hebrew_date}
                      </span>
                      {latestIssue.parasha &&
                  <span data-ev-id="ev_3b0caaef20" className="bg-white/20 px-3 py-1 rounded-full text-sm">
                          {latestIssue.parasha}
                        </span>
                  }
                    </div>
                    {latestIssue.description &&
                <p data-ev-id="ev_200cd378bc" className="text-white/80 mb-6 line-clamp-3">{latestIssue.description}</p>
                }
                    <div data-ev-id="ev_47df0c43fd" className="flex flex-wrap gap-3">
                      {latestIssue.pdf_url &&
                  <button data-ev-id="ev_9078434f84"
                  onClick={() => setSelectedPdf({ 
                    url: latestIssue.pdf_url!, 
                    title: latestIssue.title,
                    issueNumber: latestIssue.issue_number,
                    hebrewDate: latestIssue.hebrew_date || undefined
                  })}
                  className="flex items-center gap-2 bg-secondary hover:bg-secondary-light text-primary font-bold px-6 py-3 rounded-xl transition-colors">

                          <Eye className="w-5 h-5" />
                          צפה בגיליון
                        </button>
                  }
                      {latestIssue.pdf_url &&
                  <a data-ev-id="ev_e576ba7179"
                  href={latestIssue.pdf_url}
                  download
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold px-6 py-3 rounded-xl transition-colors">

                          <Download className="w-5 h-5" />
                          הורדה
                        </a>
                  }
                    </div>
                  </div>
                </div>
              </motion.div>
          }

            {/* All Issues Grid */}
            <h2 data-ev-id="ev_af392d953a" className="text-2xl font-bold text-foreground font-serif mb-6">כל הגיליונות</h2>
            
            {issues.length === 0 ?
          <div data-ev-id="ev_2157910dda" className="text-center py-20 bg-surface rounded-2xl border border-border">
                <Newspaper className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p data-ev-id="ev_d830456117" className="text-muted-foreground text-lg">אין גיליונות להצגה</p>
              </div> :

          <>
                <div data-ev-id="ev_d7f87f90c4" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {paginatedIssues.map((issue, idx) =>
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-surface rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all group cursor-pointer"
                onClick={() => issue.pdf_url && setSelectedPdf({ 
                  url: issue.pdf_url, 
                  title: issue.title,
                  issueNumber: issue.issue_number,
                  hebrewDate: issue.hebrew_date || undefined
                })}>

                      <div data-ev-id="ev_899144e676" className="aspect-[3/4] relative overflow-hidden">
                        {issue.cover_image_url ?
                  <img data-ev-id="ev_9a98781ae9"
                  src={issue.cover_image_url}
                  alt={issue.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> :


                  <div data-ev-id="ev_4bad6df955" className="w-full h-full bg-muted flex items-center justify-center">
                            <FileText className="w-12 h-12 text-muted-foreground" />
                          </div>
                  }
                        <div data-ev-id="ev_86b9bfca25" className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye className="w-10 h-10 text-white" />
                        </div>
                        <div data-ev-id="ev_48fc1736bd" className="absolute top-2 right-2 bg-secondary text-primary text-xs font-bold px-2 py-1 rounded-full">
                          #{issue.issue_number}
                        </div>
                      </div>
                      <div data-ev-id="ev_2d5bf87319" className="p-3">
                        <p data-ev-id="ev_ab737b75f4" className="text-sm font-bold text-foreground line-clamp-1">{issue.title}</p>
                        <p data-ev-id="ev_140466a325" className="text-xs text-muted-foreground">{issue.hebrew_date}</p>
                      </div>
                    </motion.div>
              )}
                </div>

                {/* Pagination */}
                {totalPages > 1 &&
            <div data-ev-id="ev_59437adbdc" className="flex items-center justify-center gap-2 mt-8">
                    <button data-ev-id="ev_d9bfd156cf"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-muted disabled:opacity-50 transition-colors">

                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <span data-ev-id="ev_8fab601746" className="text-foreground">
                      עמוד {currentPage} מתוך {totalPages}
                    </span>
                    <button data-ev-id="ev_1bc035e00f"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-muted disabled:opacity-50 transition-colors">

                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  </div>
            }
              </>
          }
          </>
        }
      </div>

      {/* Bottom Banner Ad */}
      <div data-ev-id="ev_4f9a48d8df" className="bg-muted/30 py-8">
        <div data-ev-id="ev_88714a3ea2" className="container mx-auto px-4">
          <PageAds page="newspaper" position="bottom" />
        </div>
      </div>

      {/* PDF FlipBook Viewer Modal */}
      {selectedPdf &&
      <PDFFlipViewer
        pdfUrl={selectedPdf.url}
        title={selectedPdf.title}
        issueNumber={selectedPdf.issueNumber}
        hebrewDate={selectedPdf.hebrewDate}
        onClose={() => setSelectedPdf(null)} />

      }
    </Layout>);

}