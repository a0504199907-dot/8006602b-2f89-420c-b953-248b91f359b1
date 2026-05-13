import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, X, Maximize, Minimize } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PDFViewerProps {
  pdfUrl: string;
  title?: string;
  onClose?: () => void;
}

export default function PDFViewer({ pdfUrl, title, onClose }: PDFViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // For now, we'll use an iframe-based PDF viewer
  // In production, you might want to use pdf.js or react-pdf

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 z-50 flex flex-col">

      {/* Header */}
      <div data-ev-id="ev_900a4e2421" className="flex items-center justify-between p-4 bg-primary/90 backdrop-blur-sm">
        <div data-ev-id="ev_51aa5a487e" className="flex items-center gap-4">
          {onClose &&
          <button data-ev-id="ev_0abca05a4b"
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors">

              <X className="w-6 h-6 text-white" />
            </button>
          }
          {title &&
          <h2 data-ev-id="ev_dddc4dabd1" className="text-white font-bold text-lg">{title}</h2>
          }
        </div>

        {/* Controls */}
        <div data-ev-id="ev_a45d773ce9" className="flex items-center gap-2">
          <button data-ev-id="ev_7e32f2ae90"
          onClick={handleZoomOut}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="הקטן">

            <ZoomOut className="w-5 h-5 text-white" />
          </button>
          <span data-ev-id="ev_a7c330d4ed" className="text-white text-sm min-w-[50px] text-center">{zoom}%</span>
          <button data-ev-id="ev_4e49e14300"
          onClick={handleZoomIn}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="הגדל">

            <ZoomIn className="w-5 h-5 text-white" />
          </button>
          
          <div data-ev-id="ev_6dfcf8649d" className="w-px h-6 bg-white/20 mx-2" />
          
          <button data-ev-id="ev_31ad3f006e"
          onClick={toggleFullscreen}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title={isFullscreen ? 'צא ממסך מלא' : 'מסך מלא'}>

            {isFullscreen ?
            <Minimize className="w-5 h-5 text-white" /> :

            <Maximize className="w-5 h-5 text-white" />
            }
          </button>
          
          <a data-ev-id="ev_36f4f37714"
          href={pdfUrl}
          download
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="הורד">

            <Download className="w-5 h-5 text-white" />
          </a>
        </div>
      </div>

      {/* PDF Content */}
      <div data-ev-id="ev_e003af9ad1" className="flex-1 overflow-auto flex items-center justify-center p-4">
        <div data-ev-id="ev_6d37165e88"
        className="bg-white rounded-lg shadow-2xl overflow-hidden transition-transform"
        style={{ transform: `scale(${zoom / 100})` }}>

          <iframe data-ev-id="ev_783591684d"
          src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
          className="w-[800px] h-[1100px] max-w-full"
          title={title || 'PDF Viewer'} />

        </div>
      </div>

      {/* Page Navigation (for future use with pdf.js) */}
      {/* 
        <div className="flex items-center justify-center gap-4 p-4 bg-primary/90">
         <button
           onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
           disabled={currentPage <= 1}
           className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
         >
           <ChevronRight className="w-6 h-6 text-white" />
         </button>
         <span className="text-white">
           עמוד {currentPage} מתוך {totalPages}
         </span>
         <button
           onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
           disabled={currentPage >= totalPages}
           className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
         >
           <ChevronLeft className="w-6 h-6 text-white" />
         </button>
        </div>
        */}
    </motion.div>);

}