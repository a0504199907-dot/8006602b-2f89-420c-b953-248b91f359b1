import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { useState, useCallback, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Type,
  Minus,
  Code,
  X,
  Check
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = 'התחל לכתוב כאן...',
  className = ''
}: RichTextEditorProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Image.configure({
        inline: true,
        allowBase64: true
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-secondary underline'
        }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Underline,
      Placeholder.configure({
        placeholder
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[300px] p-4 text-foreground',
        dir: 'rtl'
      }
    }
  });

  // Update content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const addLink = useCallback(() => {
    if (!editor || !linkUrl) return;

    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }
    setShowLinkInput(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  const addImage = useCallback(() => {
    if (!editor || !imageUrl) return;
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setShowImageInput(false);
    setImageUrl('');
  }, [editor, imageUrl]);

  if (!editor) return null;

  const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title






  }: {onClick: () => void;isActive?: boolean;disabled?: boolean;children: React.ReactNode;title?: string;}) =>
  <button data-ev-id="ev_8551a3718b"
  type="button"
  onClick={onClick}
  disabled={disabled}
  title={title}
  className={`p-2 rounded-lg transition-colors ${
  isActive ?
  'bg-secondary text-primary' :
  'hover:bg-muted text-foreground'} ${
  disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>

      {children}
    </button>;


  const ToolbarDivider = () =>
  <div data-ev-id="ev_c12a11d1d2" className="w-px h-6 bg-border mx-1" />;


  return (
    <div data-ev-id="ev_5e68e622e4" className={`border border-border rounded-xl overflow-hidden bg-surface ${className}`}>
      {/* Toolbar */}
      <div data-ev-id="ev_35781c74f8" className="flex flex-wrap items-center gap-1 p-2 bg-muted/30 border-b border-border">
        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="בטל">

          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="בצע שוב">

          <Redo className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="כותרת 1">

          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="כותרת 2">

          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="כותרת 3">

          <Heading3 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          isActive={editor.isActive('paragraph')}
          title="פיסקה">

          <Type className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Text Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="מודגש">

          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="נטוי">

          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="קו תחתון">

          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="קו חוצה">

          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="יישור לימין">

          <AlignRight className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="מרכוז">

          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="יישור לשמאל">

          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="רשימה">

          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="רשימה ממוספרת">

          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Quote & Code */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="ציטוט">

          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          title="קוד">

          <Code className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="קו מפריד">

          <Minus className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Link */}
        <div data-ev-id="ev_3534aab271" className="relative">
          <ToolbarButton
            onClick={() => setShowLinkInput(!showLinkInput)}
            isActive={editor.isActive('link') || showLinkInput}
            title="קישור">

            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>
          {showLinkInput &&
          <div data-ev-id="ev_6426e92458" className="absolute top-full right-0 mt-2 p-3 bg-surface border border-border rounded-xl shadow-lg z-20 flex items-center gap-2">
              <input data-ev-id="ev_19327a156d"
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://..."
            className="px-3 py-2 bg-muted border border-border rounded-lg text-sm w-64"
            dir="ltr"
            autoFocus />

              <button data-ev-id="ev_f10865eb98"
            type="button"
            onClick={addLink}
            className="p-2 bg-secondary text-primary rounded-lg">

                <Check className="w-4 h-4" />
              </button>
              <button data-ev-id="ev_85204f2b43"
            type="button"
            onClick={() => {setShowLinkInput(false);setLinkUrl('');}}
            className="p-2 bg-muted rounded-lg">

                <X className="w-4 h-4" />
              </button>
            </div>
          }
        </div>

        {/* Image */}
        <div data-ev-id="ev_c111deeaaa" className="relative">
          <ToolbarButton
            onClick={() => setShowImageInput(!showImageInput)}
            isActive={showImageInput}
            title="תמונה">

            <ImageIcon className="w-4 h-4" />
          </ToolbarButton>
          {showImageInput &&
          <div data-ev-id="ev_4cef295f8b" className="absolute top-full right-0 mt-2 p-3 bg-surface border border-border rounded-xl shadow-lg z-20 flex items-center gap-2">
              <input data-ev-id="ev_7afbc3d40c"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="כתובת URL לתמונה"
            className="px-3 py-2 bg-muted border border-border rounded-lg text-sm w-64"
            dir="ltr"
            autoFocus />

              <button data-ev-id="ev_648552d621"
            type="button"
            onClick={addImage}
            className="p-2 bg-secondary text-primary rounded-lg">

                <Check className="w-4 h-4" />
              </button>
              <button data-ev-id="ev_a46a2d40f7"
            type="button"
            onClick={() => {setShowImageInput(false);setImageUrl('');}}
            className="p-2 bg-muted rounded-lg">

                <X className="w-4 h-4" />
              </button>
            </div>
          }
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="[&_.ProseMirror]:min-h-[300px] [&_.ProseMirror]:p-4 [&_.ProseMirror]:outline-none
          [&_.ProseMirror_h1]:text-3xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mb-4 [&_.ProseMirror_h1]:font-serif
          [&_.ProseMirror_h2]:text-2xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:mb-3 [&_.ProseMirror_h2]:font-serif
          [&_.ProseMirror_h3]:text-xl [&_.ProseMirror_h3]:font-bold [&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_h3]:font-serif
          [&_.ProseMirror_p]:mb-4 [&_.ProseMirror_p]:leading-relaxed
          [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pr-6 [&_.ProseMirror_ul]:mb-4
          [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pr-6 [&_.ProseMirror_ol]:mb-4
          [&_.ProseMirror_li]:mb-1
          [&_.ProseMirror_blockquote]:border-r-4 [&_.ProseMirror_blockquote]:border-secondary 
          [&_.ProseMirror_blockquote]:pr-4 [&_.ProseMirror_blockquote]:py-2 [&_.ProseMirror_blockquote]:my-4
          [&_.ProseMirror_blockquote]:bg-muted/30 [&_.ProseMirror_blockquote]:rounded-l-xl [&_.ProseMirror_blockquote]:italic
          [&_.ProseMirror_hr]:my-6 [&_.ProseMirror_hr]:border-border
          [&_.ProseMirror_img]:rounded-xl [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:my-4
          [&_.ProseMirror_pre]:bg-zinc-900 [&_.ProseMirror_pre]:text-zinc-100 [&_.ProseMirror_pre]:p-4 
          [&_.ProseMirror_pre]:rounded-xl [&_.ProseMirror_pre]:my-4 [&_.ProseMirror_pre]:overflow-x-auto
          [&_.ProseMirror_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
          [&_.ProseMirror_.is-editor-empty:first-child::before]:text-muted-foreground
          [&_.ProseMirror_.is-editor-empty:first-child::before]:float-right
          [&_.ProseMirror_.is-editor-empty:first-child::before]:pointer-events-none
        " />

    </div>
  );
}
