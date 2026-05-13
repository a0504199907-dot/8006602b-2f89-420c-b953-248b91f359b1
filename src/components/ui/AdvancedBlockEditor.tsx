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
  Camera,
  X,
  Loader2 } from
'lucide-react';
import ImageUploader from './ImageUploader';
import RichTextEditor from './RichTextEditor';
import SmartAutocomplete from './SmartAutocomplete';

// סוגי בלוקים
export type BlockType = 'text' | 'image' | 'subtitle' | 'quote';

export interface ContentBlock {
  id: string;
  type: BlockType;
  // לבלוק טקסט
  content?: string;
  // לבלוק תמונה
  imageUrl?: string;
  caption?: string;
  photographer?: string;
  // לבלוק ציטוט
  quoteSource?: string;
}

interface AdvancedBlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  photographers?: string[];
  onAddPhotographer?: (name: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const BLOCK_TYPES: {type: BlockType;label: string;icon: React.ReactNode;}[] = [
{ type: 'text', label: 'טקסט', icon: <Type className="w-4 h-4" /> },
{ type: 'image', label: 'תמונה', icon: <ImageIcon className="w-4 h-4" /> },
{ type: 'subtitle', label: 'כותרת משנה', icon: <Heading2 className="w-4 h-4" /> },
{ type: 'quote', label: 'ציטוט', icon: <Quote className="w-4 h-4" /> }];


export default function AdvancedBlockEditor({
  blocks,
  onChange,
  photographers = [],
  onAddPhotographer
}: AdvancedBlockEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const addBlock = (type: BlockType) => {
    const newBlock: ContentBlock = {
      id: generateId(),
      type,
      content: '',
      imageUrl: '',
      caption: '',
      photographer: '',
      quoteSource: ''
    };
    onChange([...blocks, newBlock]);
    setShowAddMenu(false);
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

  const getBlockTypeInfo = (type: BlockType) => {
    return BLOCK_TYPES.find((t) => t.type === type) || BLOCK_TYPES[0];
  };

  const renderBlockContent = (block: ContentBlock, index: number) => {
    switch (block.type) {
      case 'text':
        return (
          <div data-ev-id="ev_d09656d1ba" className="mt-3">
            <RichTextEditor
              content={block.content || ''}
              onChange={(content) => updateBlock(block.id, { content })}
              placeholder="כתוב את התוכן כאן..." />

          </div>);

      case 'image':
        return (
          <div data-ev-id="ev_27561778b9" className="mt-3 flex flex-col gap-3">
            <ImageUploader
              value={block.imageUrl || ''}
              onChange={(url) => updateBlock(block.id, { imageUrl: url })}
              placeholder="העלה תמונה" />

            {block.imageUrl &&
            <>
                <div data-ev-id="ev_ca19a6255b">
                  <label data-ev-id="ev_3d30cc19c2" className="block text-sm font-medium mb-1 text-muted-foreground">
                    כיתוב לתמונה
                  </label>
                  <input data-ev-id="ev_1c546f9e93"
                type="text"
                value={block.caption || ''}
                onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                placeholder="תיאור התמונה"
                className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4 text-sm" />

                </div>
                <div data-ev-id="ev_1eaacdcfa2">
                  <label data-ev-id="ev_d4f154ba74" className="block text-sm font-medium mb-1 text-muted-foreground flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5" />
                    קרדיט צלם
                  </label>
                  <SmartAutocomplete
                  value={block.photographer || ''}
                  onChange={(value) => updateBlock(block.id, { photographer: value })}
                  placeholder="בחר או הקלד שם צלם"
                  options={photographers}
                  onAddNew={onAddPhotographer} />

                </div>
                {/* Preview */}
                {(block.caption || block.photographer) &&
              <div data-ev-id="ev_719b2d695f" className="bg-muted/30 rounded-xl p-3 border border-border">
                    <p data-ev-id="ev_cc6a4ad790" className="text-sm text-muted-foreground mb-1">תצוגה מקדימה:</p>
                    <p data-ev-id="ev_6ec5556c13" className="text-sm font-medium">
                      {block.caption || ''}
                      {block.caption && block.photographer && ' - '}
                      {block.photographer &&
                  <span data-ev-id="ev_b9dc52fe8d" className="text-muted-foreground">צילום: {block.photographer}</span>
                  }
                    </p>
                  </div>
              }
              </>
            }
          </div>);




      case 'subtitle':
        return (
          <div data-ev-id="ev_4e881d8761" className="mt-3">
            <input data-ev-id="ev_c6f41b5c97"
            type="text"
            value={block.content || ''}
            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
            placeholder="כותרת משנה"
            className="w-full bg-muted/50 border border-border rounded-xl py-3 px-4 text-lg font-bold" />

          </div>);


      case 'quote':
        return (
          <div data-ev-id="ev_2cbd38e220" className="mt-3 flex flex-col gap-3">
            <div data-ev-id="ev_59555b1d7f" className="relative">
              <Quote className="absolute top-3 right-3 w-5 h-5 text-secondary opacity-50" />
              <textarea data-ev-id="ev_03729b8026"
              value={block.content || ''}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              placeholder="טקסט הציטוט"
              className="w-full bg-muted/50 border border-border rounded-xl py-3 px-4 pr-10 resize-none text-lg italic"
              rows={3} />

            </div>
            <input data-ev-id="ev_427b05dd08"
            type="text"
            value={block.quoteSource || ''}
            onChange={(e) => updateBlock(block.id, { quoteSource: e.target.value })}
            placeholder="מקור הציטוט (אופציונלי)"
            className="w-full bg-muted/50 border border-border rounded-xl py-2 px-4 text-sm" />

          </div>);


      default:
        return null;
    }
  };

  return (
    <div data-ev-id="ev_d7673f1f9f" className="flex flex-col gap-4">
      <label data-ev-id="ev_503a06e4d3" className="block text-sm font-medium text-foreground">תוכן הכתבה (בלוקים)</label>

      {/* Blocks List */}
      <div data-ev-id="ev_04641af440" className="flex flex-col gap-3">
        {blocks.map((block, index) => {
          const typeInfo = getBlockTypeInfo(block.type);

          return (
            <div data-ev-id="ev_6437832748"
            key={block.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`bg-surface border border-border rounded-xl overflow-hidden transition-all ${
            draggedIndex === index ? 'opacity-50 scale-[0.98]' : ''}`
            }>

              {/* Block Header */}
              <div data-ev-id="ev_810e0a5144" className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b border-border">
                <div data-ev-id="ev_301f352c68" className="flex items-center gap-2">
                  <button data-ev-id="ev_a525303fa8"
                  type="button"
                  className="cursor-grab p-1 hover:bg-muted rounded text-muted-foreground"
                  title="גרור לשינוי סדר">

                    <GripVertical className="w-4 h-4" />
                  </button>
                  <div data-ev-id="ev_ad657cb475" className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    {typeInfo.icon}
                    <span data-ev-id="ev_9b26ad9e9c">{typeInfo.label}</span>
                  </div>
                  <span data-ev-id="ev_bd4ae0458d" className="text-xs text-muted-foreground">#{index + 1}</span>
                </div>

                <div data-ev-id="ev_135c11aa97" className="flex items-center gap-1">
                  <button data-ev-id="ev_d6f387b7c1"
                  type="button"
                  onClick={() => moveBlock(index, 'up')}
                  disabled={index === 0}
                  className="p-1.5 hover:bg-muted rounded disabled:opacity-30 disabled:cursor-not-allowed"
                  title="הזז למעלה">

                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button data-ev-id="ev_5842c4ae15"
                  type="button"
                  onClick={() => moveBlock(index, 'down')}
                  disabled={index === blocks.length - 1}
                  className="p-1.5 hover:bg-muted rounded disabled:opacity-30 disabled:cursor-not-allowed"
                  title="הזז למטה">

                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button data-ev-id="ev_50d48efcd0"
                  type="button"
                  onClick={() => deleteBlock(block.id)}
                  className="p-1.5 hover:bg-red-500/10 rounded text-red-500"
                  title="מחק בלוק">

                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Block Content */}
              <div data-ev-id="ev_9d30ecd4b1" className="p-4">
                {renderBlockContent(block, index)}
              </div>
            </div>);

        })}
      </div>

      {/* Add Block Button */}
      <div data-ev-id="ev_c5a55bc16e" className="relative">
        <button data-ev-id="ev_199145b32c"
        type="button"
        onClick={() => setShowAddMenu(!showAddMenu)}
        className="w-full py-3 border-2 border-dashed border-border rounded-xl hover:border-secondary hover:bg-secondary/5 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-secondary">

          <Plus className="w-5 h-5" />
          <span data-ev-id="ev_46251aa082" className="font-medium">הוסף בלוק</span>
        </button>

        {/* Add Menu */}
        {showAddMenu &&
        <div data-ev-id="ev_f504c50a8c" className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-xl z-10 p-2">
            <div data-ev-id="ev_8503279dc0" className="grid grid-cols-2 gap-2">
              {BLOCK_TYPES.map((blockType) =>
            <button data-ev-id="ev_8eea4613f8"
            key={blockType.type}
            type="button"
            onClick={() => addBlock(blockType.type)}
            className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-right">

                  <span data-ev-id="ev_1b2d53df4f" className="p-2 bg-secondary/10 rounded-lg text-secondary">
                    {blockType.icon}
                  </span>
                  <span data-ev-id="ev_0d0de1738c" className="font-medium">{blockType.label}</span>
                </button>
            )}
            </div>
            <button data-ev-id="ev_e0b6a24d3c"
          type="button"
          onClick={() => setShowAddMenu(false)}
          className="w-full mt-2 py-2 text-sm text-muted-foreground hover:text-foreground">

              ביטול
            </button>
          </div>
        }
      </div>
    </div>);

}