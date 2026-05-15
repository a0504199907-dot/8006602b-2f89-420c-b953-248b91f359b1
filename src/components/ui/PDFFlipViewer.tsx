// PDF Flip Viewer — magazine-style page-flip viewer.
//
// How it works:
//  1. Loads the PDF via pdf.js (worker served from /pdf.worker.min.mjs to avoid CSP issues).
//  2. Renders EVERY page off-screen to a canvas, captures it as a data URL.
//  3. Feeds the array of images into HTMLFlipBook — so the flip animation
//     never has to wait on react-pdf to re-render mid-flip.
//  4. On mobile (<640px) uses single-page portrait mode; on larger screens
//     uses two-page spread.
import { useState, useCallback, useRef, useEffect } from 'react';
import { pdfjs } from 'react-pdf';
import HTMLFlipBook from 'react-pageflip';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ChevronLeft, ZoomIn, ZoomOut,
  Download, X, Maximize2, Minimize2, BookOpen,
  Loader2, FileText, AlertTriangle, RotateCcw } from
'lucide-react';

// Worker is bundled in /public so it's served from the same origin (no CSP issues).
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PDFFlipViewerProps {
  pdfUrl: string;
  title?: string;
  issueNumber?: number;
  hebrewDate?: string;
  onClose: () => void;
}

// Sensible default aspect ratio for a magazine page (close to A4).
const DEFAULT_ASPECT = 1 / 1.414;

export default function PDFFlipViewer(props: PDFFlipViewerProps) {
  const { pdfUrl, title, issueNumber, hebrewDate, onClose } = props;

  const [pages, setPages] = useState<string[]>([]);
  const [aspectRatio, setAspectRatio] = useState(DEFAULT_ASPECT);
  const [loadProgress, setLoadProgress] = useState(0); // 0..1
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  const flipBookRef = useRef<any>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cancelRenderRef = useRef(false);

  // Track viewport size — single page on phones, two pages on tablets+.
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Render every PDF page to a data-URL image. Done once when pdfUrl changes.
  useEffect(() => {
    cancelRenderRef.current = false;
    setPages([]);
    setLoadProgress(0);
    setIsLoading(true);
    setError(null);

    const renderAll = async () => {
      try {
        const loadingTask = pdfjs.getDocument(pdfUrl);
        const doc = await loadingTask.promise;
        if (cancelRenderRef.current) return;

        const totalPages = doc.numPages;
        const rendered: string[] = [];

        // Use first page to figure out aspect ratio.
        const firstPage = await doc.getPage(1);
        const firstViewport = firstPage.getViewport({ scale: 1 });
        if (firstViewport.height > 0) {
          setAspectRatio(firstViewport.width / firstViewport.height);
        }

        // Limit render scale: high enough for crisp text, low enough to avoid
        // running out of memory on large issues.
        const RENDER_SCALE = 1.5;

        for (let i = 1; i <= totalPages; i++) {
          if (cancelRenderRef.current) return;

          const page = await doc.getPage(i);
          const viewport = page.getViewport({ scale: RENDER_SCALE });
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Canvas not supported');

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({ canvasContext: ctx, viewport, canvas }).promise;
          rendered.push(canvas.toDataURL('image/jpeg', 0.85));
          // Free the canvas memory now that we have the data URL.
          canvas.width = 0;
          canvas.height = 0;

          if (cancelRenderRef.current) return;
          setLoadProgress(i / totalPages);
        }

        if (!cancelRenderRef.current) {
          setPages(rendered);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('PDF render error:', err);
        if (!cancelRenderRef.current) {
          setError('שגיאה בטעינת הגיליון. נסו לרענן את הדף.');
          setIsLoading(false);
        }
      }
    };

    renderAll();

    return () => {
      cancelRenderRef.current = true;
    };
  }, [pdfUrl]);

  // Lock body scroll while the viewer is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Compute the page width/height for HTMLFlipBook based on the stage size
  // and whether we're in single- or double-page mode.
  const [pageDims, setPageDims] = useState({ width: 380, height: 540 });
  useEffect(() => {
    const measure = () => {
      const stage = stageRef.current;
      if (!stage) return;

      // Subtract padding for the navigation controls inside the stage.
      const availWidth = stage.clientWidth - 32;
      const availHeight = stage.clientHeight - 32;
      if (availWidth <= 0 || availHeight <= 0) return;

      // On mobile we render ONE page wide; on desktop we render TWO pages wide.
      const pagesAcross = isMobile ? 1 : 2;
      const widthFromHeight = availHeight * aspectRatio * pagesAcross;
      const heightFromWidth = availWidth / pagesAcross / aspectRatio;

      let pageWidth: number;
      let pageHeight: number;

      if (widthFromHeight <= availWidth) {
        // Limited by height: use full available height.
        pageHeight = availHeight;
        pageWidth = pageHeight * aspectRatio;
      } else {
        // Limited by width: use full available width.
        pageWidth = availWidth / pagesAcross;
        pageHeight = pageWidth / aspectRatio;
      }

      setPageDims({
        width: Math.max(200, Math.floor(pageWidth)),
        height: Math.max(280, Math.floor(pageHeight))
      });
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [aspectRatio, isMobile, isFullscreen, pages.length]);

  const onFlip = useCallback((e: {data: number;}) => {
    setCurrentPage(e.data);
  }, []);

  const goToPrev = () => {
    flipBookRef.current?.pageFlip()?.flipPrev();
  };
  const goToNext = () => {
    flipBookRef.current?.pageFlip()?.flipNext();
  };

  const zoomIn = () => setScale((s) => Math.min(s + 0.1, 1.8));
  const zoomOut = () => setScale((s) => Math.max(s - 0.1, 0.6));
  const resetZoom = () => setScale(1);
  const toggleFullscreen = () => setIsFullscreen((f) => !f);

  // Keyboard navigation — RTL: right arrow = previous, left arrow = next.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToPrev();
      else if (e.key === 'ArrowLeft') goToNext();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const displayTitle = title || 'גליון';
  const subtitleParts: string[] = [];
  if (issueNumber) subtitleParts.push('#' + issueNumber);
  if (hebrewDate) subtitleParts.push(hebrewDate);
  const subtitle = subtitleParts.join(' · ');

  const pagesAcross = isMobile ? 1 : 2;
  const visiblePageLabel = pagesAcross === 2 && currentPage + 1 < pages.length ?
  `${currentPage + 1}–${currentPage + 2}` :
  `${currentPage + 1}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={`${displayTitle} ${subtitle}`}>

      {/* Header */}
      <div data-ev-id="ev_pdf_header" className="bg-primary/95 backdrop-blur-sm text-white px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2 shrink-0">
        <div data-ev-id="ev_pdf_title" className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-secondary shrink-0" />
          <div data-ev-id="ev_pdf_title_text" className="min-w-0">
            <h3 className="font-bold text-sm sm:text-lg font-serif truncate">{displayTitle}</h3>
            {subtitle && <p className="text-white/70 text-xs sm:text-sm truncate">{subtitle}</p>}
          </div>
        </div>

        <div data-ev-id="ev_pdf_actions" className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Zoom: hidden on phones to save room */}
          <div data-ev-id="ev_pdf_zoom" className="hidden md:flex items-center gap-1 bg-white/10 rounded-lg px-1">
            <button onClick={zoomOut} disabled={scale <= 0.6} aria-label="הקטן" className="p-2 hover:bg-white/10 rounded disabled:opacity-30">
              <ZoomOut className="w-4 h-4" />
            </button>
            <button onClick={resetZoom} aria-label="איפוס זום" className="px-2 py-1 hover:bg-white/10 rounded text-xs min-w-[50px]">
              {Math.round(scale * 100)}%
            </button>
            <button onClick={zoomIn} disabled={scale >= 1.8} aria-label="הגדל" className="p-2 hover:bg-white/10 rounded disabled:opacity-30">
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button onClick={toggleFullscreen} aria-label="מסך מלא" className="hidden sm:flex p-2 hover:bg-white/10 rounded-lg">
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          <a href={pdfUrl} download target="_blank" rel="noopener noreferrer" aria-label="הורד גיליון" className="p-2 hover:bg-white/10 rounded-lg">
            <Download className="w-5 h-5" />
          </a>

          <button onClick={onClose} aria-label="סגור" className="p-2 hover:bg-red-500/50 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stage (where the flipbook lives) */}
      <div
        data-ev-id="ev_pdf_stage"
        ref={stageRef}
        className="flex-1 overflow-hidden bg-gradient-to-b from-zinc-800 to-zinc-900 relative flex items-center justify-center">

        <AnimatePresence>
          {isLoading &&
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-zinc-900/70 backdrop-blur-sm z-10">
              <div className="text-center px-6">
                <Loader2 className="w-12 h-12 text-secondary animate-spin mx-auto mb-4" />
                <p className="text-white/90 font-medium mb-2">טוען את הגיליון…</p>
                <div className="w-56 h-2 bg-white/10 rounded-full mx-auto overflow-hidden">
                  <div
                  className="h-full bg-secondary transition-all duration-200"
                  style={{ width: `${Math.round(loadProgress * 100)}%` }} />

                </div>
                <p className="text-white/60 text-xs mt-2">{Math.round(loadProgress * 100)}%</p>
              </div>
            </motion.div>
          }
        </AnimatePresence>

        {error &&
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10 p-6">
            <div className="text-center max-w-sm">
              <AlertTriangle className="w-14 h-14 text-amber-400 mx-auto mb-4" />
              <p className="text-white text-lg mb-2 font-medium">{error}</p>
              <p className="text-white/60 text-sm mb-4">אפשר להוריד את הגיליון ולפתוח באופן ידני</p>
              <div className="flex items-center justify-center gap-2">
                <a
                href={pdfUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-primary rounded-lg font-bold">

                  <Download className="w-4 h-4" />
                  הורד PDF
                </a>
                <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg">

                  <RotateCcw className="w-4 h-4" />
                  נסה שוב
                </button>
              </div>
            </div>
          </div>
        }

        {/* The flipbook only mounts once all pages are ready. This avoids
            HTMLFlipBook trying to lay out pages before they exist. */}
        {!isLoading && !error && pages.length > 0 &&
        <div
          className="transition-transform duration-200"
          style={{ transform: `scale(${scale})` }}>

            <HTMLFlipBook
            key={`${pagesAcross}-${pageDims.width}-${pageDims.height}`}
            ref={flipBookRef}
            width={pageDims.width}
            height={pageDims.height}
            size="fixed"
            minWidth={200}
            maxWidth={1200}
            minHeight={280}
            maxHeight={1600}
            showCover={true}
            mobileScrollSupport={false}
            onFlip={onFlip}
            className="shadow-2xl"
            style={{} as any}
            startPage={0}
            drawShadow={true}
            flippingTime={500}
            usePortrait={isMobile}
            startZIndex={0}
            autoSize={false}
            maxShadowOpacity={0.4}
            showPageCorners={true}
            disableFlipByClick={false}
            swipeDistance={30}
            clickEventForward={true}
            useMouseEvents={true}>

              {pages.map((imgSrc, i) =>
            <div
              data-ev-id="ev_pdf_page"
              key={i}
              className="bg-white overflow-hidden">

                  <img
                src={imgSrc}
                alt={`עמוד ${i + 1}`}
                width={pageDims.width}
                height={pageDims.height}
                className="w-full h-full select-none pointer-events-none"
                draggable={false} />

                </div>
            )}
            </HTMLFlipBook>
          </div>
        }
      </div>

      {/* Footer / pagination */}
      <div data-ev-id="ev_pdf_footer" className="bg-primary/95 backdrop-blur-sm text-white px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2 shrink-0">
        <button
          onClick={goToNext}
          disabled={!pages.length || currentPage + pagesAcross >= pages.length}
          className="flex items-center gap-1.5 bg-secondary hover:bg-secondary-light text-primary px-3 sm:px-5 py-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium text-sm sm:text-base">

          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">הקודם</span>
        </button>

        <div data-ev-id="ev_pdf_counter" className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5 text-sm">
          <span className="text-white/70">עמוד</span>
          <span className="font-bold text-secondary">{visiblePageLabel}</span>
          <span className="text-white/50">/ {pages.length || '…'}</span>
        </div>

        <button
          onClick={goToPrev}
          disabled={!pages.length || currentPage <= 0}
          className="flex items-center gap-1.5 bg-secondary hover:bg-secondary-light text-primary px-3 sm:px-5 py-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium text-sm sm:text-base">

          <span className="hidden sm:inline">הבא</span>
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </motion.div>);

}
