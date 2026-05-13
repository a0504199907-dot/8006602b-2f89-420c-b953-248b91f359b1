import { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, X, Loader2, FileText, Eye, Download } from 'lucide-react';

interface PDFUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
}

export default function PDFUploader({
  value,
  onChange,
  label = 'קובץ PDF',
  placeholder = 'הדבק קישור או העלה קובץ PDF'
}: PDFUploaderProps) {
  const [mode, setMode] = useState<'url' | 'upload'>('url');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('נא להעלות רק קבצי PDF');
      return;
    }

    // Limit file size to 50MB
    if (file.size > 50 * 1024 * 1024) {
      alert('הקובץ גדול מדי. מקסימום 50MB');
      return;
    }

    setUploading(true);
    setFileName(file.name);

    try {
      // Convert to base64 for now (in production, upload to storage)
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        onChange(base64);
        setUploading(false);
      };
      reader.onerror = () => {
        alert('שגיאה בקריאת הקובץ');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('שגיאה בהעלאת הקובץ');
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const clearFile = () => {
    onChange('');
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isValidPdfUrl = (url: string) => {
    return url && (url.endsWith('.pdf') || url.startsWith('data:application/pdf'));
  };

  return (
    <div data-ev-id="ev_49579fcbce" className="flex flex-col gap-2">
      <label data-ev-id="ev_833a3639f8" className="block text-sm font-medium">{label}</label>
      
      {/* Mode Toggle */}
      <div data-ev-id="ev_084825ef76" className="flex gap-2 mb-2">
        <button data-ev-id="ev_55c4c2dd5d"
        type="button"
        onClick={() => setMode('url')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
        mode === 'url' ?
        'bg-amber-500 text-black font-medium' :
        'bg-zinc-800 text-zinc-400 hover:text-white'}`
        }>

          <LinkIcon className="w-4 h-4" />
          קישור
        </button>
        <button data-ev-id="ev_ebc8a3099d"
        type="button"
        onClick={() => setMode('upload')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
        mode === 'upload' ?
        'bg-amber-500 text-black font-medium' :
        'bg-zinc-800 text-zinc-400 hover:text-white'}`
        }>

          <Upload className="w-4 h-4" />
          העלאה
        </button>
      </div>

      {mode === 'url' ? (
      /* URL Input */
      <input data-ev-id="ev_c66e7977f3"
      type="url"
      value={value.startsWith('data:') ? '' : value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl py-2.5 px-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
      placeholder={placeholder}
      dir="ltr" />) : (


      /* Upload Area */
      <div data-ev-id="ev_34e25043bf"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => fileInputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
      dragOver ?
      'border-amber-500 bg-amber-500/10' :
      'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/50'}`
      }>

          <input data-ev-id="ev_149ae3036e"
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className="hidden" />

          
          {uploading ?
        <div data-ev-id="ev_d54862517c" className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              <p data-ev-id="ev_2877c0c0e8" className="text-zinc-400">מעלה קובץ...</p>
            </div> :

        <div data-ev-id="ev_2c08433303" className="flex flex-col items-center gap-2">
              <FileText className="w-8 h-8 text-zinc-500" />
              <p data-ev-id="ev_78ef1eea08" className="text-zinc-400">גרור קובץ PDF לכאן או לחץ לבחירה</p>
              <p data-ev-id="ev_d477404169" className="text-xs text-zinc-500">עד 50MB</p>
            </div>
        }
        </div>)
      }

      {/* Preview */}
      {value &&
      <div data-ev-id="ev_f9e156d2bd" className="mt-3 p-4 bg-zinc-800/50 border border-zinc-700 rounded-xl">
          <div data-ev-id="ev_0823014f19" className="flex items-center justify-between">
            <div data-ev-id="ev_1d5060cbec" className="flex items-center gap-3">
              <div data-ev-id="ev_bf0b761516" className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-red-400" />
              </div>
              <div data-ev-id="ev_5979ba46e5">
                <p data-ev-id="ev_e9cc4095e5" className="text-white font-medium">
                  {fileName || 'קובץ PDF'}
                </p>
                <p data-ev-id="ev_faab284a17" className="text-xs text-zinc-500">
                  {isValidPdfUrl(value) ? 'קובץ תקין' : 'בדוק את הקישור'}
                </p>
              </div>
            </div>
            <div data-ev-id="ev_a1773dd105" className="flex items-center gap-2">
              {isValidPdfUrl(value) &&
            <a data-ev-id="ev_b0b5cbdecf"
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
            onClick={(e) => e.stopPropagation()}>

                  <Eye className="w-4 h-4 text-white" />
                </a>
            }
              <button data-ev-id="ev_b3b859c3d4"
            type="button"
            onClick={clearFile}
            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors">

                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      }
    </div>);

}