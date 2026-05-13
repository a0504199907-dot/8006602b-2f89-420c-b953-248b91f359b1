import { useState, useRef } from 'react';
import {
  Plus,
  Type,
  Image as ImageIcon,
  Quote,
  Heading2,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Upload,
  Link as LinkIcon,
  X,
  Loader2 } from
'lucide-react';

export interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'subtitle' | 'quote';
  content: string;
  url?: string;
  caption?: string;
  credit?: string;
}

interface BlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export default function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: generateId(),
      type,
      content: '',
      ...(type === 'image' ? { url: '', caption: '', credit: '' } : {})
    };
    onChange([...blocks, newBlock]);
  };

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    onChange(
      blocks.map((block) =>
      block.id === id ? { ...block, ...updates } : block
      )
    );
  };

  const deleteBlock = (id: string) => {
    if (blocks.length === 1) {
      alert('חייב להיות לפחות בלוק אחד');
      return;
    }
    onChange(blocks.filter((block) => block.id !== id));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    onChange(newBlocks);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newBlocks = [...blocks];
    const draggedBlock = newBlocks[draggedIndex];
    newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(index, 0, draggedBlock);
    onChange(newBlocks);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div data-ev-id="ev_ad8ea6b705" className="flex flex-col gap-4">
      <label data-ev-id="ev_9d5c53ec68" className="block text-sm font-medium text-white">תוכן הכתבה (בלוקים)</label>
      
      {/* Blocks List */}
      <div data-ev-id="ev_860fe21e95" className="flex flex-col gap-3">
        {blocks.map((block, index) =>
        <div data-ev-id="ev_a31332405b"
        key={block.id}
        draggable
        onDragStart={() => handleDragStart(index)}
        onDragOver={(e) => handleDragOver(e, index)}
        onDragEnd={handleDragEnd}
        className={`bg-zinc-800/50 border border-zinc-700 rounded-xl overflow-hidden transition-all ${
        draggedIndex === index ? 'opacity-50 scale-[0.98]' : ''}`
        }>

            {/* Block Header */}
            <div data-ev-id="ev_42287f446d" className="flex items-center gap-2 px-4 py-3 bg-zinc-800 border-b border-zinc-700">
              <div data-ev-id="ev_c615cc3133" className="cursor-grab hover:text-amber-400 text-zinc-500">
                <GripVertical className="w-4 h-4" />
              </div>
              <span data-ev-id="ev_a8bee6a319" className="text-xs text-zinc-400 font-medium">
                {block.type === 'text' && 'פסקה'}
                {block.type === 'image' && 'תמונה'}
                {block.type === 'subtitle' && 'כותרת משנה'}
                {block.type === 'quote' && 'ציטוט'}
              </span>
              <div data-ev-id="ev_3f6e17ca05" className="flex-1" />
              <div data-ev-id="ev_6408b25677" className="flex items-center gap-1">
                <button data-ev-id="ev_76cdd648bf"
              type="button"
              onClick={() => moveBlock(index, 'up')}
              disabled={index === 0}
              className="p-1 hover:bg-zinc-700 rounded transition-colors disabled:opacity-30">

                  <ChevronUp className="w-4 h-4" />
                </button>
                <button data-ev-id="ev_1a152fbae1"
              type="button"
              onClick={() => moveBlock(index, 'down')}
              disabled={index === blocks.length - 1}
              className="p-1 hover:bg-zinc-700 rounded transition-colors disabled:opacity-30">

                  <ChevronDown className="w-4 h-4" />
                </button>
                <button data-ev-id="ev_79bf643d40"
              type="button"
              onClick={() => deleteBlock(block.id)}
              className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-colors">

                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Block Content */}
            <div data-ev-id="ev_9d410610da" className="p-4">
              {block.type === 'text' &&
            <TextBlockEditor
              content={block.content}
              onChange={(content) => updateBlock(block.id, { content })} />

            }
              {block.type === 'subtitle' &&
            <SubtitleBlockEditor
              content={block.content}
              onChange={(content) => updateBlock(block.id, { content })} />

            }
              {block.type === 'quote' &&
            <QuoteBlockEditor
              content={block.content}
              onChange={(content) => updateBlock(block.id, { content })} />

            }
              {block.type === 'image' &&
            <ImageBlockEditor
              url={block.url || ''}
              caption={block.caption || ''}
              credit={block.credit || ''}
              onChange={(updates) => updateBlock(block.id, updates)} />

            }
            </div>
          </div>
        )}
      </div>

      {/* Add Block Buttons */}
      <div data-ev-id="ev_25fdc07950" className="flex items-center gap-2 p-4 bg-zinc-800/30 rounded-xl border border-dashed border-zinc-700">
        <span data-ev-id="ev_14070c6565" className="text-sm text-zinc-400 ml-2">הוסף בלוק:</span>
        <button data-ev-id="ev_b1fddd512e"
        type="button"
        onClick={() => addBlock('text')}
        className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors">

          <Type className="w-4 h-4" />
          פסקה
        </button>
        <button data-ev-id="ev_257bfe64d5"
        type="button"
        onClick={() => addBlock('subtitle')}
        className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors">

          <Heading2 className="w-4 h-4" />
          כותרת משנה
        </button>
        <button data-ev-id="ev_1a9d036f25"
        type="button"
        onClick={() => addBlock('image')}
        className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors">

          <ImageIcon className="w-4 h-4" />
          תמונה
        </button>
        <button data-ev-id="ev_ca0516a53b"
        type="button"
        onClick={() => addBlock('quote')}
        className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors">

          <Quote className="w-4 h-4" />
          ציטוט
        </button>
      </div>
    </div>);

}

// Text Block Editor
function TextBlockEditor({
  content,
  onChange



}: {content: string;onChange: (content: string) => void;}) {
  return (
    <textarea data-ev-id="ev_cab6b0e50e"
    value={content}
    onChange={(e) => onChange(e.target.value)}
    placeholder="הקלד את תוכן הפסקה..."
    className="w-full min-h-[120px] bg-zinc-900/50 border border-zinc-700 rounded-lg py-3 px-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-y"
    dir="rtl" />);


}

// Subtitle Block Editor
function SubtitleBlockEditor({
  content,
  onChange



}: {content: string;onChange: (content: string) => void;}) {
  return (
    <input data-ev-id="ev_277ea4bd3a"
    type="text"
    value={content}
    onChange={(e) => onChange(e.target.value)}
    placeholder="כותרת משנה..."
    className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg py-3 px-4 text-white text-lg font-bold placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
    dir="rtl" />);


}

// Quote Block Editor
function QuoteBlockEditor({
  content,
  onChange



}: {content: string;onChange: (content: string) => void;}) {
  return (
    <div data-ev-id="ev_3897914da1" className="relative">
      <div data-ev-id="ev_d82855e965" className="absolute right-3 top-3 text-amber-500/50">
        <Quote className="w-6 h-6" />
      </div>
      <textarea data-ev-id="ev_23e0957888"
      value={content}
      onChange={(e) => onChange(e.target.value)}
      placeholder="הקלד את הציטוט..."
      className="w-full min-h-[80px] bg-zinc-900/50 border border-zinc-700 rounded-lg py-3 px-4 pr-12 text-white italic placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-y"
      dir="rtl" />

    </div>);

}

// Image Block Editor
function ImageBlockEditor({
  url,
  caption,
  credit,
  onChange





}: {url: string;caption: string;credit: string;onChange: (updates: Partial<ContentBlock>) => void;}) {
  const [mode, setMode] = useState<'url' | 'upload'>('url');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('נא להעלות רק קבצי תמונה');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('הקובץ גדול מדי. מקסימום 5MB');
      return;
    }

    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        onChange({ url: base64 });
        setUploading(false);
      };
      reader.onerror = () => {
        alert('שגיאה בקריאת הקובץ');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('שגיאה בהעלאת התמונה');
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  return (
    <div data-ev-id="ev_71dfea3491" className="flex flex-col gap-4">
      {/* Mode Toggle */}
      <div data-ev-id="ev_f4bdcfa7d8" className="flex gap-2">
        <button data-ev-id="ev_19a1a295e2"
        type="button"
        onClick={() => setMode('url')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
        mode === 'url' ?
        'bg-amber-500 text-black font-medium' :
        'bg-zinc-700 text-zinc-400 hover:text-white'}`
        }>

          <LinkIcon className="w-4 h-4" />
          קישור
        </button>
        <button data-ev-id="ev_e4244f3890"
        type="button"
        onClick={() => setMode('upload')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
        mode === 'upload' ?
        'bg-amber-500 text-black font-medium' :
        'bg-zinc-700 text-zinc-400 hover:text-white'}`
        }>

          <Upload className="w-4 h-4" />
          העלאה
        </button>
      </div>

      {mode === 'url' ?
      <input data-ev-id="ev_240003c034"
      type="url"
      value={url.startsWith('data:') ? '' : url}
      onChange={(e) => onChange({ url: e.target.value })}
      className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg py-2.5 px-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
      placeholder="הדבק קישור לתמונה..."
      dir="ltr" /> :


      <div data-ev-id="ev_270edd7fdd"
      onDrop={handleDrop}
      onDragOver={(e) => {e.preventDefault();setDragOver(true);}}
      onDragLeave={() => setDragOver(false)}
      onClick={() => fileInputRef.current?.click()}
      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
      dragOver ?
      'border-amber-500 bg-amber-500/10' :
      'border-zinc-700 hover:border-zinc-600'}`
      }>

          <input data-ev-id="ev_c17638b69d"
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className="hidden" />

          {uploading ?
        <Loader2 className="w-6 h-6 text-amber-500 animate-spin mx-auto" /> :

        <div data-ev-id="ev_77b5dd22c1" className="flex flex-col items-center gap-1">
              <ImageIcon className="w-6 h-6 text-zinc-500" />
              <span data-ev-id="ev_db6431d6d9" className="text-sm text-zinc-400">גרור תמונה או לחץ לבחירה</span>
            </div>
        }
        </div>
      }

      {/* Image Preview */}
      {url &&
      <div data-ev-id="ev_776a514dcf" className="relative">
          <img data-ev-id="ev_076ff14a9b"
        src={url}
        alt="תצוגה מקדימה"
        className="w-full max-h-48 object-contain rounded-lg bg-zinc-900" />

          <button data-ev-id="ev_2691fdf2f6"
        type="button"
        onClick={() => onChange({ url: '' })}
        className="absolute top-2 left-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">

            <X className="w-4 h-4" />
          </button>
        </div>
      }

      {/* Caption & Credit */}
      <div data-ev-id="ev_1ed2a9f322" className="grid grid-cols-2 gap-3">
        <div data-ev-id="ev_6c3f52e671">
          <label data-ev-id="ev_7e4b585fc4" className="block text-xs text-zinc-400 mb-1">כיתוב</label>
          <input data-ev-id="ev_a282a22346"
          type="text"
          value={caption}
          onChange={(e) => onChange({ caption: e.target.value })}
          className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg py-2 px-3 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          placeholder="תיאור התמונה..."
          dir="rtl" />

        </div>
        <div data-ev-id="ev_099f0cdb6d">
          <label data-ev-id="ev_c881e887af" className="block text-xs text-zinc-400 mb-1">קרדיט / צלם</label>
          <input data-ev-id="ev_87cb5ce73c"
          type="text"
          value={credit}
          onChange={(e) => onChange({ credit: e.target.value })}
          className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg py-2 px-3 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          placeholder="שם הצלם..."
          dir="rtl" />

        </div>
      </div>
    </div>);

}