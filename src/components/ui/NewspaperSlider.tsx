import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, BookOpen } from 'lucide-react';
import { Link } from 'react-router';
import PDFFlipViewer from './PDFFlipViewer';
import { useNewspaperIssues } from '@/hooks/useNewspaperSections';

interface NewspaperIssue {
  id: string;
  issue_number: number;
  title: string;
  cover_image_url: string;
  pdf_url?: string;
  hebrew_date: string;
  parasha?: string;
}

interface NewspaperSliderProps {
  issues?: NewspaperIssue[];
}

export default function NewspaperSlider({ issues }: NewspaperSliderProps) {
  const { issues: dbIssues } = useNewspaperIssues(10);
  const displayIssues = issues && issues.length > 0 ? issues : dbIssues;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIssue, setSelectedIssue] = useState<NewspaperIssue | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // אם אין גליונות, לא מציגים כלום
  if (displayIssues.length === 0) {
    return null;
  }

  const scrollLeft = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const scrollRight = () => {
    if (currentIndex < displayIssues.length - 4) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const openViewer = (issue: NewspaperIssue) => {
    setSelectedIssue(issue);
  };

  const closeViewer = () => {
    setSelectedIssue(null);
  };

  return (
    <>
      <div data-ev-id="ev_33ce617eb3" className="relative">
        {/* Header - matching SectionHeader design */}
        <div data-ev-id="ev_7199cc5dea" className="flex items-center justify-between mb-6">
          <div data-ev-id="ev_2ea9ea96c6" className="flex items-center gap-3">
            <div data-ev-id="ev_gradient_line" className="w-1 h-8 rounded-full bg-gradient-to-b from-secondary via-secondary/60 to-transparent" />
            <h2 data-ev-id="ev_700f43e152" className="text-2xl md:text-3xl font-bold font-serif text-foreground">
              גליונות הציבור
            </h2>
          </div>
          <Link
            to="/newspaper"
            className="text-muted-foreground hover:text-secondary text-sm font-medium flex items-center gap-1 transition-colors">
            עוד בגליונות הציבור
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Slider Container */}
        <div data-ev-id="ev_a3ef0f7a60" className="relative overflow-hidden px-12">
          {/* Navigation Arrows */}
          <button data-ev-id="ev_4b4843318c"
          onClick={scrollRight}
          disabled={currentIndex >= displayIssues.length - 4}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-secondary hover:bg-secondary-light text-primary rounded-full shadow-lg flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110">
            <ChevronRight className="w-5 h-5" />
          </button>
          <button data-ev-id="ev_677f351584"
          onClick={scrollLeft}
          disabled={currentIndex === 0}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-secondary hover:bg-secondary-light text-primary rounded-full shadow-lg flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110">
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Issues Grid */}
          <div data-ev-id="ev_967612766e" ref={sliderRef} className="px-8">
            <motion.div
              className="flex gap-5"
              animate={{ x: currentIndex * -220 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
              {displayIssues.map((issue, idx) =>
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="shrink-0 w-[200px]">
                  <div data-ev-id="ev_0b0169394f"
                onClick={() => openViewer(issue)}
                className="cursor-pointer group">
                    {/* Cover Image */}
                    <motion.div
                    whileHover={{ y: -10, rotateY: -5 }}
                    className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-xl border-2 border-secondary/20 group-hover:border-secondary transition-all"
                    style={{ perspective: '1000px' }}>
                      <img data-ev-id="ev_cd220d368c"
                    src={issue.cover_image_url}
                    alt={issue.title}
                    className="w-full h-full object-cover" />
                      {/* Overlay on hover */}
                      <div data-ev-id="ev_23d78bf13e" className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div data-ev-id="ev_88cce2152d" className="text-white text-center">
                          <BookOpen className="w-10 h-10 mx-auto mb-2" />
                          <span data-ev-id="ev_0455761804" className="font-bold">דפדף בגליון</span>
                        </div>
                      </div>
                      {/* Issue Number Badge */}
                      <div data-ev-id="ev_d6d205fdcc" className="absolute top-2 right-2 bg-secondary text-primary px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        #{issue.issue_number}
                      </div>
                    </motion.div>
                    
                    {/* Info */}
                    <div data-ev-id="ev_7988ff9b55" className="mt-3 text-center">
                      <h3 data-ev-id="ev_59f5366a37" className="font-bold text-foreground group-hover:text-secondary transition-colors line-clamp-1">
                        {issue.title}
                      </h3>
                      <p data-ev-id="ev_3e7bcce59f" className="text-sm text-muted-foreground">{issue.hebrew_date}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Dots Indicator */}
        {displayIssues.length > 4 &&
        <div data-ev-id="ev_f5c1c2d693" className="flex items-center justify-center gap-2 mt-6">
            {Array.from({ length: Math.max(1, displayIssues.length - 3) }).map((_, idx) =>
          <button data-ev-id="ev_ff6f9e238a"
          key={idx}
          onClick={() => setCurrentIndex(idx)}
          className={`w-2 h-2 rounded-full transition-all ${
          currentIndex === idx ? 'bg-secondary w-6' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'}`
          } />
          )}
          </div>
        }
      </div>

      {/* PDF Viewer Modal */}
      <AnimatePresence>
        {selectedIssue && selectedIssue.pdf_url &&
        <PDFFlipViewer
          pdfUrl={selectedIssue.pdf_url}
          title={selectedIssue.title}
          issueNumber={selectedIssue.issue_number}
          hebrewDate={selectedIssue.hebrew_date}
          onClose={closeViewer} />
        }
      </AnimatePresence>
    </>);

}