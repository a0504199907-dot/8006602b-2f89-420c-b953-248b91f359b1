import { useState, useEffect } from 'react';
import { Type } from 'lucide-react';

export type TextSize = 'small' | 'normal' | 'large';

interface TextSizeSelectorProps {
  storageKey?: string;
  onSizeChange?: (size: TextSize) => void;
}

const SIZES: {key: TextSize;label: string;scale: string;}[] = [
{ key: 'small', label: 'א', scale: '0.9' },
{ key: 'normal', label: 'א', scale: '1' },
{ key: 'large', label: 'א', scale: '1.15' }];


export default function TextSizeSelector({ storageKey = 'article-text-size', onSizeChange }: TextSizeSelectorProps) {
  const [activeSize, setActiveSize] = useState<TextSize>('normal');

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved && (saved === 'small' || saved === 'normal' || saved === 'large')) {
      setActiveSize(saved as TextSize);
      onSizeChange?.(saved as TextSize);
    }
  }, [storageKey, onSizeChange]);

  const handleSizeChange = (size: TextSize) => {
    setActiveSize(size);
    localStorage.setItem(storageKey, size);
    onSizeChange?.(size);
  };

  return (
    <div data-ev-id="ev_7c7f89b5af" className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
      <Type className="w-4 h-4 text-muted-foreground" />
      <span data-ev-id="ev_cfea78539b" className="text-sm text-muted-foreground ml-1">גודל טקסט:</span>
      <div data-ev-id="ev_02256e3b35" className="flex items-center gap-1">
        {SIZES.map((size, idx) =>
        <button data-ev-id="ev_32965bcf50"
        key={size.key}
        onClick={() => handleSizeChange(size.key)}
        className={`
              w-8 h-8 rounded-md flex items-center justify-center transition-all
              font-bold font-serif
              ${activeSize === size.key ?
        'bg-secondary text-secondary-foreground shadow-sm' :
        'bg-transparent text-foreground hover:bg-muted'}
            `}
        style={{ fontSize: idx === 0 ? '14px' : idx === 1 ? '18px' : '22px' }}
        title={size.key === 'small' ? 'טקסט קטן' : size.key === 'normal' ? 'טקסט רגיל' : 'טקסט גדול'}>

            {size.label}
          </button>
        )}
      </div>
    </div>);

}

export function getTextSizeClass(size: TextSize): string {
  switch (size) {
    case 'small':
      return 'text-base md:text-lg leading-relaxed';
    case 'large':
      return 'text-xl md:text-2xl leading-loose';
    default:
      return 'text-lg md:text-xl leading-relaxed';
  }
}