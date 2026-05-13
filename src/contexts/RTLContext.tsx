import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Direction = 'rtl' | 'ltr';
type Language = 'he' | 'en';

interface RTLContextType {
  direction: Direction;
  language: Language;
  isRTL: boolean;
  setLanguage: (lang: Language) => void;
  t: (heText: string, enText?: string) => string;
}

const RTLContext = createContext<RTLContextType | undefined>(undefined);

// Hebrew translations for common UI elements
const translations: Record<string, { he: string; en: string }> = {
  // Navigation
  'home': { he: 'בית', en: 'Home' },
  'news': { he: 'חדשות', en: 'News' },
  'articles': { he: 'כתבות', en: 'Articles' },
  'events': { he: 'אירועים', en: 'Events' },
  'gallery': { he: 'גלריה', en: 'Gallery' },
  'videos': { he: 'סרטונים', en: 'Videos' },
  
  // Actions
  'save': { he: 'שמירה', en: 'Save' },
  'cancel': { he: 'ביטול', en: 'Cancel' },
  'delete': { he: 'מחיקה', en: 'Delete' },
  'edit': { he: 'עריכה', en: 'Edit' },
  'create': { he: 'יצירה', en: 'Create' },
  'search': { he: 'חיפוש', en: 'Search' },
  'filter': { he: 'סינון', en: 'Filter' },
  'close': { he: 'סגירה', en: 'Close' },
  'submit': { he: 'שליחה', en: 'Submit' },
  'loading': { he: 'טוען...', en: 'Loading...' },
  
  // Status
  'published': { he: 'פורסם', en: 'Published' },
  'draft': { he: 'טיוטה', en: 'Draft' },
  'scheduled': { he: 'מתוזמן', en: 'Scheduled' },
  'active': { he: 'פעיל', en: 'Active' },
  'inactive': { he: 'לא פעיל', en: 'Inactive' },
  
  // Admin
  'dashboard': { he: 'לוח בקרה', en: 'Dashboard' },
  'settings': { he: 'הגדרות', en: 'Settings' },
  'users': { he: 'משתמשים', en: 'Users' },
  'analytics': { he: 'אנליטיקס', en: 'Analytics' },
  'categories': { he: 'קטגוריות', en: 'Categories' },
  'ads': { he: 'פרסומות', en: 'Ads' },
  
  // Common
  'read_more': { he: 'קרא עוד', en: 'Read More' },
  'share': { he: 'שיתוף', en: 'Share' },
  'comments': { he: 'תגובות', en: 'Comments' },
  'views': { he: 'צפיות', en: 'Views' },
  'date': { he: 'תאריך', en: 'Date' },
  'author': { he: 'כותב', en: 'Author' },
  'category': { he: 'קטגוריה', en: 'Category' },
  
  // Time
  'today': { he: 'היום', en: 'Today' },
  'yesterday': { he: 'אתמול', en: 'Yesterday' },
  'days_ago': { he: 'ימים', en: 'days ago' },
  'hours_ago': { he: 'שעות', en: 'hours ago' },
  'minutes_ago': { he: 'דקות', en: 'minutes ago' },
  'just_now': { he: 'עכשיו', en: 'Just now' },
  
  // Messages
  'no_results': { he: 'לא נמצאו תוצאות', en: 'No results found' },
  'error': { he: 'אירעה שגיאה', en: 'An error occurred' },
  'success': { he: 'פעולה הושלמה', en: 'Action completed' },
  'confirm_delete': { he: 'האם אתה בטוח שברצונך למחוק?', en: 'Are you sure you want to delete?' },
};

export function RTLProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('he');
  
  const direction: Direction = language === 'he' ? 'rtl' : 'ltr';
  const isRTL = direction === 'rtl';

  // Update document direction when language changes
  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
    
    // Add RTL class for additional styling hooks
    if (isRTL) {
      document.documentElement.classList.add('rtl');
      document.documentElement.classList.remove('ltr');
    } else {
      document.documentElement.classList.add('ltr');
      document.documentElement.classList.remove('rtl');
    }
  }, [direction, language, isRTL]);

  // Translation function
  const t = (heText: string, enText?: string): string => {
    // If it's a translation key, look it up
    if (translations[heText]) {
      return language === 'he' ? translations[heText].he : translations[heText].en;
    }
    // Otherwise return the appropriate text
    return language === 'he' ? heText : (enText || heText);
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  };

  // Load saved language preference
  useEffect(() => {
    const saved = localStorage.getItem('app-language') as Language | null;
    if (saved) {
      setLanguageState(saved);
    }
  }, []);

  return (
    <RTLContext.Provider value={{ direction, language, isRTL, setLanguage, t }}>
      {children}
    </RTLContext.Provider>
  );
}

export function useRTL() {
  const context = useContext(RTLContext);
  if (!context) {
    // Return default RTL values if not in provider
    return {
      direction: 'rtl' as Direction,
      language: 'he' as Language,
      isRTL: true,
      setLanguage: () => {},
      t: (heText: string) => heText
    };
  }
  return context;
}

// Utility hook for RTL-aware styling
export function useRTLValue<T>(rtlValue: T, ltrValue: T): T {
  const { isRTL } = useRTL();
  return isRTL ? rtlValue : ltrValue;
}

// Helper for RTL-aware icons/positions
export function rtlClass(className: string): string {
  const rtlMappings: Record<string, string> = {
    'left': 'right',
    'right': 'left',
    'pl-': 'pr-',
    'pr-': 'pl-',
    'ml-': 'mr-',
    'mr-': 'ml-',
    'text-left': 'text-right',
    'text-right': 'text-left',
    'rounded-l': 'rounded-r',
    'rounded-r': 'rounded-l',
    'border-l': 'border-r',
    'border-r': 'border-l',
    '-left-': '-right-',
    '-right-': '-left-',
  };

  let result = className;
  Object.entries(rtlMappings).forEach(([ltr, rtl]) => {
    if (result.includes(ltr)) {
      result = result.replace(new RegExp(ltr, 'g'), `__RTL_${rtl}__`);
    }
  });
  // Clean up placeholders
  result = result.replace(/__RTL_/g, '').replace(/__/g, '');
  return result;
}
