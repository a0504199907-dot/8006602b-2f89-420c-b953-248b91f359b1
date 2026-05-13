import { useState, useEffect } from 'react';
import { HDate, months, Sedra, HolidayEvent, HebrewCalendar } from '@hebcal/core';

interface HebrewDateResult {
  hebrew: string;
  hebrewFull: string;
  parasha: string;
  gregorian: string;
  day: number;
  month: string;
  year: number;
  holiday?: string;
  isLoading: boolean;
}

// Hebrew number formatting (gematria)
const HEBREW_ONES = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
const HEBREW_TENS = ['', 'י', 'כ', 'ל'];

function numberToHebrew(num: number): string {
  if (num === 15) return 'ט"ו';
  if (num === 16) return 'ט"ז';
  
  let result = '';
  
  if (num >= 10) {
    result += HEBREW_TENS[Math.floor(num / 10)];
    num %= 10;
  }
  
  if (num > 0) {
    result += HEBREW_ONES[num];
  }
  
  // Add gershayim
  if (result.length > 1) {
    result = result.slice(0, -1) + '"' + result.slice(-1);
  } else if (result.length === 1) {
    result += '\'';
  }
  
  return result;
}

// Hebrew year to letters
function yearToHebrew(year: number): string {
  const hundreds = Math.floor((year % 1000) / 100);
  const tens = Math.floor((year % 100) / 10);
  const ones = year % 10;
  
  const hebrewHundreds = ['', 'ק', 'ר', 'ש', 'ת', 'תק', 'תר', 'תש', 'תת', 'תתק'];
  const hebrewTens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
  const hebrewOnes = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
  
  let result = hebrewHundreds[hundreds] || '';
  
  // Handle 15 and 16 specially
  if (tens === 1 && ones === 5) {
    result += 'טו';
  } else if (tens === 1 && ones === 6) {
    result += 'טז';
  } else {
    result += hebrewTens[tens] || '';
    result += hebrewOnes[ones] || '';
  }
  
  // Add gershayim before last letter
  if (result.length > 1) {
    result = result.slice(0, -1) + '"' + result.slice(-1);
  } else if (result.length === 1) {
    result += '\'';
  }
  
  return result;
}

// Hebrew month names
const HEBREW_MONTH_NAMES: Record<number, string> = {
  [months.TISHREI]: 'תשרי',
  [months.CHESHVAN]: 'חשוון',
  [months.KISLEV]: 'כסלו',
  [months.TEVET]: 'טבת',
  [months.SHVAT]: 'שבט',
  [months.ADAR_I]: 'אדר א׳',
  [months.ADAR_II]: 'אדר ב׳',
  [months.NISAN]: 'ניסן',
  [months.IYYAR]: 'אייר',
  [months.SIVAN]: 'סיון',
  [months.TAMUZ]: 'תמוז',
  [months.AV]: 'אב',
  [months.ELUL]: 'אלול',
};

// Get Hebrew month name, handling regular vs leap year Adar
function getHebrewMonthName(hdate: HDate): string {
  const monthNum = hdate.getMonth();
  const isLeapYear = hdate.isLeapYear();
  
  // In non-leap years, ADAR_II (month 13) is just "אדר"
  if (monthNum === months.ADAR_II && !isLeapYear) {
    return 'אדר';
  }
  
  return HEBREW_MONTH_NAMES[monthNum] || hdate.getMonthName('h');
}

// Calculate Hebrew date locally using @hebcal/core
function calculateLocalHebrewDate(date: Date): Omit<HebrewDateResult, 'isLoading'> {
  const hdate = new HDate(date);
  const day = hdate.getDate();
  const year = hdate.getFullYear();
  const monthName = getHebrewMonthName(hdate);
  
  const dayHebrew = numberToHebrew(day);
  const yearHebrew = yearToHebrew(year);
  
  // Get Gregorian date in Hebrew format
  const gregorianStr = date.toLocaleDateString('he-IL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Try to get parasha for this week
  let parasha = '';
  try {
    const sedra = new Sedra(year, true); // true = Israel
    const parashaArr = sedra.get(hdate);
    if (parashaArr && parashaArr.length > 0) {
      // Get Hebrew name for the parasha
      const parashaNames = parashaArr.map(p => p.he || p.name);
      parasha = `פרשת ${parashaNames.join('-')}`;
    }
  } catch {
    // Sedra calculation failed, leave parasha empty
  }
  
  // Try to get holidays
  let holiday = '';
  try {
    const events = HebrewCalendar.getHolidaysOnDate(hdate, true); // true = Israel
    if (events && events.length > 0) {
      // Find the most significant holiday
      const significantEvent = events.find(e => 
        e.getFlags() > 0 && !e.getDesc().includes('Shabbat')
      ) || events[0];
      if (significantEvent) {
        holiday = significantEvent.render('he') || significantEvent.getDesc();
      }
    }
  } catch {
    // Holiday calculation failed, leave holiday empty
  }
  
  return {
    hebrew: `${dayHebrew} ${monthName}`,
    hebrewFull: `${dayHebrew} ${monthName} ${yearHebrew}`,
    parasha,
    gregorian: gregorianStr,
    day,
    month: monthName,
    year,
    holiday
  };
}

export function useHebrewDate(date?: Date): HebrewDateResult {
  const [result, setResult] = useState<HebrewDateResult>(() => {
    // Calculate immediately on mount (synchronous)
    const targetDate = date || new Date();
    return {
      ...calculateLocalHebrewDate(targetDate),
      isLoading: false
    };
  });

  useEffect(() => {
    const targetDate = date || new Date();
    
    // Recalculate if date changes
    const localResult = calculateLocalHebrewDate(targetDate);
    setResult({
      ...localResult,
      isLoading: false
    });
  }, [date]);

  return result;
}

export async function formatHebrewDateFromString(dateStr: string): Promise<string> {
  const date = new Date(dateStr);
  const hdate = new HDate(date);
  
  const day = hdate.getDate();
  const year = hdate.getFullYear();
  const monthName = getHebrewMonthName(hdate);
  
  const dayHebrew = numberToHebrew(day);
  const yearHebrew = yearToHebrew(year);
  
  return `${dayHebrew} ${monthName} ${yearHebrew}`;
}
