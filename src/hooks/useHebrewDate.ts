import { useState, useEffect } from 'react';

interface HebrewDateInfo {
  hebrew: string;
  hebrewFull: string;
  gregorian: string;
  dayOfWeek: string;
  parasha?: string;
  holiday?: string;
  isShabbat: boolean;
  isYomTov: boolean;
}

const HEBREW_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

const HEBREW_MONTHS = [
  'תשרי', 'חשוון', 'כסלו', 'טבת', 'שבט', 'אדר',
  'ניסן', 'אייר', 'סיון', 'תמוז', 'אב', 'אלול'
];

const HEBREW_MONTHS_LEAP = [
  'תשרי', 'חשוון', 'כסלו', 'טבת', 'שבט', 'אדר א׳',
  'אדר ב׳', 'ניסן', 'אייר', 'סיון', 'תמוז', 'אב', 'אלול'
];

const GEMATRIA = {
  1: 'א׳', 2: 'ב׳', 3: 'ג׳', 4: 'ד׳', 5: 'ה׳', 6: 'ו׳', 7: 'ז׳', 8: 'ח׳', 9: 'ט׳',
  10: 'י׳', 11: 'י״א', 12: 'י״ב', 13: 'י״ג', 14: 'י״ד', 15: 'ט״ו', 16: 'ט״ז',
  17: 'י״ז', 18: 'י״ח', 19: 'י״ט', 20: 'כ׳', 21: 'כ״א', 22: 'כ״ב', 23: 'כ״ג',
  24: 'כ״ד', 25: 'כ״ה', 26: 'כ״ו', 27: 'כ״ז', 28: 'כ״ח', 29: 'כ״ט', 30: 'ל׳'
};

// Simple Hebrew date calculation (approximate - for display purposes)
function getHebrewDate(date: Date): { day: number; month: number; year: number; isLeapYear: boolean } {
  // This is a simplified calculation
  // For production, use a proper Hebrew calendar library like hebcal
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  // Approximate Hebrew year (offset from Gregorian)
  const hebrewYear = year + 3760 + (month >= 9 ? 1 : 0);
  
  // Check if leap year in Hebrew calendar
  const isLeapYear = (7 * hebrewYear + 1) % 19 < 7;
  
  // Approximate Hebrew month and day (very rough)
  // In reality, this requires complex calculation based on lunar calendar
  const monthOffset = (month + 6) % 12; // Tishrei starts around September
  const hebrewMonth = monthOffset;
  const hebrewDay = day;
  
  return {
    day: Math.min(hebrewDay, 30),
    month: hebrewMonth,
    year: hebrewYear,
    isLeapYear
  };
}

function formatHebrewDate(day: number, month: number, year: number, isLeapYear: boolean): string {
  const months = isLeapYear ? HEBREW_MONTHS_LEAP : HEBREW_MONTHS;
  const dayGematria = GEMATRIA[day as keyof typeof GEMATRIA] || day.toString();
  return `${dayGematria} ${months[month]}`;
}

function formatHebrewYear(year: number): string {
  // Format year in Hebrew letters (simplified)
  const thousands = Math.floor(year / 1000);
  const hundreds = Math.floor((year % 1000) / 100);
  const tens = Math.floor((year % 100) / 10);
  const ones = year % 10;
  
  // Simplified - just show the last 3 digits in Hebrew format
  return `ה'תשפ"ד`; // Placeholder - should calculate properly
}

export function useHebrewDate(): HebrewDateInfo {
  const [dateInfo, setDateInfo] = useState<HebrewDateInfo>({
    hebrew: '',
    hebrewFull: '',
    gregorian: '',
    dayOfWeek: '',
    isShabbat: false,
    isYomTov: false
  });

  useEffect(() => {
    const now = new Date();
    const dayIndex = now.getDay();
    const { day, month, year, isLeapYear } = getHebrewDate(now);
    
    const hebrew = formatHebrewDate(day, month, year, isLeapYear);
    const hebrewFull = `יום ${HEBREW_DAYS[dayIndex]}, ${hebrew}`;
    
    const gregorian = now.toLocaleDateString('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    setDateInfo({
      hebrew,
      hebrewFull,
      gregorian,
      dayOfWeek: HEBREW_DAYS[dayIndex],
      isShabbat: dayIndex === 6,
      isYomTov: false // Would need proper holiday calculation
    });
  }, []);

  return dateInfo;
}

// Format relative time in Hebrew
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return 'עכשיו';
  if (diffMinutes < 60) return `לפני ${diffMinutes} דקות`;
  if (diffHours < 24) return `לפני ${diffHours} שעות`;
  if (diffDays === 1) return 'אתמול';
  if (diffDays < 7) return `לפני ${diffDays} ימים`;
  if (diffDays < 30) return `לפני ${Math.floor(diffDays / 7)} שבועות`;
  
  return then.toLocaleDateString('he-IL');
}

// Format number in Hebrew (for views, etc.)
export function formatHebrewNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace('.0', '') + ' מיליון';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace('.0', '') + ' אלף';
  }
  return num.toLocaleString('he-IL');
}
