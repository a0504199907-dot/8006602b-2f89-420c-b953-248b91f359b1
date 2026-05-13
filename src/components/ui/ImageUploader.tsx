import { useState, useRef } from 'react';
import { Upload, FolderOpen, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { addWatermark, shouldWatermark } from '@/lib/watermark';
import DriveImagePicker from './DriveImagePicker';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  disableWatermark?: boolean;
  section?: string; // For Drive folder filtering
}

// ============ IMAGE COMPRESSION ============
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const QUALITY = 0.8; // 80% quality

/**
 * Compress image to reduce file size dramatically
 * - Resizes to max 1200x1200
 * - Compresses as JPEG at 80% quality
 * - Typically reduces 5MB image to ~200KB
 */
async function compressImage(base64: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width;
          width = MAX_WIDTH;
        }
        if (height > MAX_HEIGHT) {
          width = (width * MAX_HEIGHT) / height;
          height = MAX_HEIGHT;
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(base64); // Fallback to original
          return;
        }

        // Use better image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to compressed JPEG
        const compressed = canvas.toDataURL('image/jpeg', QUALITY);
        
        // Log compression results
        const originalSize = Math.round(base64.length / 1024);
        const compressedSize = Math.round(compressed.length / 1024);
        console.log(`Image compressed: ${originalSize}KB → ${compressedSize}KB (${Math.round((1 - compressedSize/originalSize) * 100)}% smaller)`);
        
        resolve(compressed);
      } catch (err) {
        console.error('Compression error:', err);
        resolve(base64); // Fallback to original
      }
    };
    img.onerror = () => {
      console.error('Failed to load image for compression');
      resolve(base64); // Fallback to original
    };
    img.src = base64;
  });
}

export default function ImageUploader({
  value,
  onChange,
  label = 'תמונה',
  placeholder = 'העלה מהמחשב או ייבא מדרייב',
  disableWatermark = false,
  section
}: ImageUploaderProps) {
  const [mode, setMode] = useState<'upload' | 'drive'>('upload');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [showDrivePicker, setShowDrivePicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = async (base64: string): Promise<string> => {
    // Step 1: Compress image
    setUploadStatus('דוחס תמונה...');
    const compressed = await compressImage(base64);
    
    // Step 2: Add watermark if needed
    if (disableWatermark) {
      return compressed;
    }

    setUploadStatus('מוסיף סימן מים...');
    const shouldAdd = await shouldWatermark(compressed);
    if (!shouldAdd) {
      return compressed;
    }

    return addWatermark(compressed);
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('נא להעלות רק קבצי תמונה');
      return;
    }

    // Increased limit since we compress anyway
    if (file.size > 10 * 1024 * 1024) {
      alert('הקובץ גדול מדי. מקסימום 10MB');
      return;
    }

    setUploading(true);
    setUploadStatus('קורא קובץ...');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64 = e.target?.result as string;
          const processedImage = await processImage(base64);
          onChange(processedImage);
        } catch (err) {
          console.error('Error processing image:', err);
          onChange(e.target?.result as string);
        } finally {
          setUploading(false);
          setUploadStatus('');
        }
      };
      reader.onerror = () => {
        alert('שגיאה בקריאת הקובץ');
        setUploading(false);
        setUploadStatus('');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('שגיאה בהעלאת התמונה');
      setUploading(false);
      setUploadStatus('');
    }
  };

  const handleDriveSelect = async (imageUrl: string) => {
    setUploading(true);
    setUploadStatus('מעבד תמונה מדרייב...');
    try {
      const processedImage = await processImage(imageUrl);
      onChange(processedImage);
    } catch (err) {
      console.error('Error processing drive image:', err);
      onChange(imageUrl);
    } finally {
      setUploading(false);
      setUploadStatus('');
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

  const clearImage = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div data-ev-id="ev_248b2bb868" className="flex flex-col gap-2">
      <label data-ev-id="ev_754bda035f" className="block text-sm font-medium">{label}</label>

      {/* Mode Toggle */}
      <div data-ev-id="ev_5e122cc5a2" className="flex gap-2 mb-2">
        <button data-ev-id="ev_c522358064"
        type="button"
        onClick={() => setMode('upload')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
        mode === 'upload' ?
        'bg-secondary text-secondary-foreground font-medium' :
        'bg-muted text-muted-foreground hover:text-foreground'}`
        }>

          <Upload className="w-4 h-4" />
          העלאה
        </button>
        <button data-ev-id="ev_4f4f25daac"
        type="button"
        onClick={() => {
          setMode('drive');
          setShowDrivePicker(true);
        }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
        mode === 'drive' ?
        'bg-secondary text-secondary-foreground font-medium' :
        'bg-muted text-muted-foreground hover:text-foreground'}`
        }>

          <FolderOpen className="w-4 h-4" />
          מדרייב
        </button>
      </div>

      {/* Upload Area - Always visible */}
      <div data-ev-id="ev_4ff3aed803"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !uploading && fileInputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
      uploading ? 'cursor-wait' :
      dragOver ?
      'border-secondary bg-secondary/10 cursor-pointer' :
      'border-border hover:border-secondary/50 hover:bg-muted/50 cursor-pointer'}`
      }>

        <input data-ev-id="ev_24fdf7f8fb"
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className="hidden" />


        {uploading ?
        <div data-ev-id="ev_6b259478dc" className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-secondary animate-spin" />
            <p data-ev-id="ev_fe00ba2de6" className="text-secondary font-medium">{uploadStatus || 'מעבד...'}</p>
            <p data-ev-id="ev_status_hint" className="text-xs text-muted-foreground">התמונה נדחסת אוטומטית לגודל קטן</p>
          </div> :

        <div data-ev-id="ev_a3d01e4bff" className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <p data-ev-id="ev_5d72947050" className="text-muted-foreground">גרור תמונה לכאן או לחץ לבחירה</p>
            <p data-ev-id="ev_bf0af01b64" className="text-xs text-muted-foreground">עד 10MB • דחיסה אוטומטית + לוגו</p>
          </div>
        }
      </div>

      {/* Preview */}
      {value &&
      <div data-ev-id="ev_cb6f4518fd" className="relative mt-2">
          <div data-ev-id="ev_cd4b330378" className="relative rounded-xl overflow-hidden border border-border bg-muted">
            <img data-ev-id="ev_2b66785634"
          src={value}
          alt="תצוגה מקדימה"
          className="w-full h-32 object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '';
            (e.target as HTMLImageElement).alt = 'שגיאה בטעינת התמונה';
          }} />

            <button data-ev-id="ev_858b20793a"
          type="button"
          onClick={clearImage}
          className="absolute top-2 left-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">

              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      }

      {/* Drive Picker Modal */}
      <DriveImagePicker
        isOpen={showDrivePicker}
        onClose={() => setShowDrivePicker(false)}
        onSelect={handleDriveSelect}
        section={section} />

    </div>);

}