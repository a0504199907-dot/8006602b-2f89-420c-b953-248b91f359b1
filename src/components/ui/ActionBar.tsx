import { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Heart,
  Facebook,
  Share2,
  Link as LinkIcon,
  Printer } from
'lucide-react';

interface ActionBarProps {
  title: string;
  content?: string;
  className?: string;
}

/**
 * סרגל פעולות משותף לכל דפי הכתבות
 * כולל: האזן, שמור, פייסבוק, וואטסאפ, העתק קישור, הדפסה
 */
export default function ActionBar({ title, content, className = '' }: ActionBarProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const toggleAudio = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const text = content?.replace(/<[^>]*>/g, '') || title;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'he-IL';
      utterance.rate = 0.9;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`, '_blank');
        break;
      case 'copy':
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('הקישור הועתק!');
        break;
      case 'print':
        window.print();
        break;
    }
  };

  return (
    <div data-ev-id="ev_0e8e628f12" className={`flex flex-wrap items-center gap-3 ${className}`}>
      {/* האזן */}
      <button data-ev-id="ev_94a523b5c7"
      onClick={toggleAudio}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
      isPlaying ?
      'bg-secondary text-primary' :
      'bg-muted hover:bg-muted/80 text-foreground'}`
      }>

        {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        {isPlaying ? 'עצור' : 'האזן'}
      </button>

      {/* שמור */}
      <button data-ev-id="ev_f4855f1d83"
      onClick={() => setIsSaved(!isSaved)}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
      isSaved ?
      'bg-red-500 text-white' :
      'bg-muted hover:bg-muted/80 text-foreground'}`
      }>

        <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        שמור
      </button>

      {/* פייסבוק */}
      <button data-ev-id="ev_5eedfe7656"
      onClick={() => handleShare('facebook')}
      className="p-2 bg-muted hover:bg-muted/80 rounded-xl transition-colors"
      title="שתף בפייסבוק">

        <Facebook className="w-4 h-4" />
      </button>

      {/* וואטסאפ */}
      <button data-ev-id="ev_e763f91e32"
      onClick={() => handleShare('whatsapp')}
      className="p-2 bg-muted hover:bg-muted/80 rounded-xl transition-colors"
      title="שתף בוואטסאפ">

        <Share2 className="w-4 h-4" />
      </button>

      {/* העתק קישור */}
      <button data-ev-id="ev_862c79450b"
      onClick={() => handleShare('copy')}
      className="p-2 bg-muted hover:bg-muted/80 rounded-xl transition-colors"
      title="העתק קישור">

        <LinkIcon className="w-4 h-4" />
      </button>

      {/* הדפסה */}
      <button data-ev-id="ev_65e7c5e6e8"
      onClick={() => handleShare('print')}
      className="p-2 bg-muted hover:bg-muted/80 rounded-xl transition-colors"
      title="הדפס">

        <Printer className="w-4 h-4" />
      </button>
    </div>);

}