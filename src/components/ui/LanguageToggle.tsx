import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useRTL } from '@/contexts/RTLContext';

interface LanguageToggleProps {
  variant?: 'icon' | 'text' | 'full';
  className?: string;
}

export default function LanguageToggle({
  variant = 'icon',
  className = ''
}: LanguageToggleProps) {
  const { language, setLanguage, t } = useRTL();

  const toggleLanguage = () => {
    setLanguage(language === 'he' ? 'en' : 'he');
  };

  if (variant === 'icon') {
    return (
      <button data-ev-id="ev_9abba24423"
      onClick={toggleLanguage}
      className={`p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${className}`}
      title={language === 'he' ? 'Switch to English' : 'עבור לעברית'}>

        <Globe className="w-5 h-5" />
      </button>);

  }

  if (variant === 'text') {
    return (
      <button data-ev-id="ev_0049d5bc18"
      onClick={toggleLanguage}
      className={`text-sm font-medium text-muted-foreground hover:text-foreground transition-colors ${className}`}>

        {language === 'he' ? 'EN' : 'עב'}
      </button>);

  }

  // Full variant with animation
  return (
    <div data-ev-id="ev_d65c9f2aa0" className={`flex items-center gap-2 ${className}`}>
      <Globe className="w-4 h-4 text-muted-foreground" />
      <div data-ev-id="ev_d3a3dfd927" className="flex bg-muted rounded-lg p-1">
        <button data-ev-id="ev_ac8d07f61e"
        onClick={() => setLanguage('he')}
        className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
        language === 'he' ?
        'bg-primary text-primary-foreground' :
        'text-muted-foreground hover:text-foreground'}`
        }>

          עברית
        </button>
        <button data-ev-id="ev_da65399867"
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
        language === 'en' ?
        'bg-primary text-primary-foreground' :
        'text-muted-foreground hover:text-foreground'}`
        }>

          English
        </button>
      </div>
    </div>);

}