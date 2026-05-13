// PDF Flip Viewer Component with realistic page-flip effect
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import HTMLFlipBook from 'react-pageflip';
import { motion } from 'framer-motion';
import {
  ChevronRight, ChevronLeft, ZoomIn, ZoomOut,
  Download, X, Maximize2, Minimize2, BookOpen,
  RotateCcw, FileText, Loader2
} from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker - use jsdelivr which is more reliable
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFFlipViewerProps {
  pdfUrl: string;
  title?: string;
  issueNumber?: number;
  hebrewDate?: string;
  onClose: () => void;
}

// Individual page component for the flipbook
const FlipBookPage = React.forwardRef<HTMLDivElement, {pageNumber: number;width: number;height: number;}>(
  ({ pageNumber, width, height }, ref) => {
    return (
      <div data-ev-id="ev_042b651576" ref={ref} className="bg-white shadow-lg">
        <Page
          pageNumber={pageNumber}
          width={width}
          height={height}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          className="!bg-white" />

      </div>);

  }
);
FlipBookPage.displayName = 'FlipBookPage';

export default function PDFFlipViewer(props: PDFFlipViewerProps) {
  const { pdfUrl, title, issueNumber, hebrewDate, onClose } = props;

  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 560 });
  const flipBookRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate dimensions based on container
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerHeight = containerRef.current.clientHeight - 40;
        const containerWidth = containerRef.current.clientWidth - 40;
        // A4 aspect ratio approximately 1:1.4
        const pageHeight = Math.min(containerHeight, 700);
        const pageWidth = pageHeight / 1.4;

        // Make sure both pages fit
        if (pageWidth * 2 > containerWidth) {
          const adjustedWidth = containerWidth / 2 - 20;
          setDimensions({
            width: adjustedWidth,
            height: adjustedWidth * 1.4
          });
        } else {
          setDimensions({
            width: pageWidth,
            height: pageHeight
          });
        }
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isFullscreen]);

  const onDocumentLoadSuccess = useCallback((data: {numPages: number;}) => {
    setNumPages(data.numPages);
    setIsLoading(false);
    setError(null);
  }, []);

  const onDocumentLoadError = useCallback((err: Error) => {
    console.error('PDF Load Error:', err);
    setError('שגיאה בטעינת ה-PDF');
    setIsLoading(false);
  }, []);

  const onFlip = useCallback((e: {data: number;}) => {
    setCurrentPage(e.data);
  }, []);

  const goToPrevPage = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipPrev();
    }
  };

  const goToNextPage = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipNext();
    }
  };

  const goToPage = (page: number) => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flip(page);
    }
  };

  const zoomIn = () => setScale((s) => Math.min(s + 0.1, 1.5));
  const zoomOut = () => setScale((s) => Math.max(s - 0.1, 0.6));
  const resetZoom = () => setScale(1);
  const toggleFullscreen = () => setIsFullscreen((f) => !f);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') goToPrevPage(); // RTL
    if (e.key === 'ArrowLeft') goToNextPage(); // RTL
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  const displayTitle = title || 'גליון';
  const subtitleParts = [];
  if (issueNumber) subtitleParts.push('#' + issueNumber);
  if (hebrewDate) subtitleParts.push(hebrewDate);
  const subtitle = subtitleParts.join(' | ');

  const scaledWidth = dimensions.width * scale;
  const scaledHeight = dimensions.height * scale;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 flex flex-col"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}>

      <div data-ev-id="ev_420c7c8bfa"
      className={`flex flex-col h-full ${isFullscreen ? '' : 'max-w-7xl mx-auto'} w-full`}
      onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div data-ev-id="ev_aaaca3e613" className="bg-primary/90 backdrop-blur-sm text-white p-3 flex items-center justify-between shrink-0">
          <div data-ev-id="ev_0c62a3129d" className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-secondary" />
            <div data-ev-id="ev_f2863da543">
              <h3 data-ev-id="ev_30af46540c" className="font-bold text-lg font-serif">{displayTitle}</h3>
              {subtitle && <p data-ev-id="ev_763c8dfb19" className="text-white/70 text-sm">{subtitle}</p>}
            </div>
          </div>

          <div data-ev-id="ev_ac2d5fc7c7" className="flex items-center gap-2">
            <div data-ev-id="ev_42eb40ec64" className="flex items-center gap-1 bg-white/10 rounded-lg px-2 py-1">
              <button data-ev-id="ev_4a6f6a83fd" onClick={zoomOut} disabled={scale <= 0.6} className="p-2 hover:bg-white/10 rounded disabled:opacity-30">
                <ZoomOut className="w-4 h-4" />
              </button>
              <button data-ev-id="ev_eccd6bd069" onClick={resetZoom} className="px-2 py-1 hover:bg-white/10 rounded text-sm min-w-[60px]">
                {Math.round(scale * 100)}%
              </button>
              <button data-ev-id="ev_c5ac7f1537" onClick={zoomIn} disabled={scale >= 1.5} className="p-2 hover:bg-white/10 rounded disabled:opacity-30">
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            <button data-ev-id="ev_409113923a" onClick={toggleFullscreen} className="p-2 hover:bg-white/10 rounded-lg">
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>

            <a data-ev-id="ev_26d4291c14" href={pdfUrl} download className="p-2 hover:bg-white/10 rounded-lg" target="_blank" rel="noopener noreferrer">
              <Download className="w-5 h-5" />
            </a>

            <button data-ev-id="ev_89480dcd47" onClick={onClose} className="p-2 hover:bg-red-500/50 rounded-lg mr-2">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Content */}
        <div data-ev-id="ev_952a6de413" ref={containerRef} className="flex-1 overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900 relative flex items-center justify-center">
          {isLoading &&
          <div data-ev-id="ev_b0dc5337dd" className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
              <div data-ev-id="ev_e0ddb5ff01" className="text-center">
                <Loader2 className="w-12 h-12 text-secondary animate-spin mx-auto mb-4" />
                <p data-ev-id="ev_3208b55175" className="text-white/70">טוען גליון...</p>
              </div>
            </div>
          }

          {error &&
          <div data-ev-id="ev_2c78fae067" className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
              <div data-ev-id="ev_e05999ec8e" className="text-center">
                <FileText className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <p data-ev-id="ev_df3fca089a" className="text-red-400 text-lg mb-2">{error}</p>
                <button data-ev-id="ev_7c0ab29248"
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-secondary text-primary rounded-lg font-medium">

                  נסה שוב
                </button>
              </div>
            </div>
          }

          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
            className="flex justify-center items-center">

            {numPages > 0 &&
            <HTMLFlipBook
              ref={flipBookRef}
              width={scaledWidth}
              height={scaledHeight}
              size="stretch"
              minWidth={300}
              maxWidth={800}
              minHeight={400}
              maxHeight={1000}
              showCover={true}
              mobileScrollSupport={true}
              onFlip={onFlip}
              className="shadow-2xl"
              style={{ direction: 'rtl' } as any}
              startPage={0}
              drawShadow={true}
              flippingTime={600}
              usePortrait={false}
              startZIndex={0}
              autoSize={false}
              maxShadowOpacity={0.5}
              showPageCorners={true}
              disableFlipByClick={false}
              swipeDistance={30}
              clickEventForward={true}
              useMouseEvents={true}>

                {Array.from({ length: numPages }, (_, index) =>
              <div data-ev-id="ev_11c9ef0de1" key={index} className="bg-white">
                    <Page
                  pageNumber={index + 1}
                  width={scaledWidth}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="!bg-white" />

                  </div>
              )}
              </HTMLFlipBook>
            }
          </Document>
        </div>

        {/* Footer Navigation */}
        <div data-ev-id="ev_54c015e16b" className="bg-primary/90 backdrop-blur-sm text-white p-3 flex items-center justify-between shrink-0">
          <div data-ev-id="ev_19da21e003" className="flex items-center gap-2">
            <button data-ev-id="ev_42766b98ee" onClick={resetZoom} className="flex items-center gap-2 text-white/70 hover:text-white text-sm">
              <RotateCcw className="w-4 h-4" />
              איפוס
            </button>
          </div>

          <div data-ev-id="ev_b4e2008c72" className="flex items-center gap-3">
            <button data-ev-id="ev_99149874c1"
            onClick={goToNextPage}
            disabled={currentPage >= numPages - 1}
            className="flex items-center gap-2 bg-secondary hover:bg-secondary-light px-5 py-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors">

              <ChevronRight className="w-5 h-5" />
              <span data-ev-id="ev_8b4ee57a3b" className="font-medium">הקודם</span>
            </button>

            <div data-ev-id="ev_60cde46c4d" className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1">
              <span data-ev-id="ev_8b6e3ddcf3" className="text-white/70 text-sm">עמוד</span>
              <span data-ev-id="ev_0a7e4858a1" className="font-bold text-secondary">{currentPage + 1}</span>
              <span data-ev-id="ev_28b4c7f8b0" className="text-white/50">מתוך {numPages}</span>
            </div>

            <button data-ev-id="ev_91371917a9"
            onClick={goToPrevPage}
            disabled={currentPage <= 0}
            className="flex items-center gap-2 bg-secondary hover:bg-secondary-light px-5 py-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors">

              <span data-ev-id="ev_8c42177a01" className="font-medium">הבא</span>
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          <div data-ev-id="ev_fc5b443c58" className="flex items-center gap-2">
            <span data-ev-id="ev_5d68e86460" className="text-white/50 text-sm">{numPages} עמודים</span>
          </div>
        </div>
      </div>
    </motion.div>);

}