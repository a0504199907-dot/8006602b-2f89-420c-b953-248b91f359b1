import { Calendar, BookOpen } from 'lucide-react';
import { useHebrewDate } from '@/hooks/useHebrewDateFull';

export default function HebrewDate() {
  const { hebrewFull, parasha, gregorian, holiday, isLoading } = useHebrewDate();

  return (
    <div data-ev-id="ev_2a6d3200b4" className="bg-secondary">
      <div data-ev-id="ev_9481a28540" className="container mx-auto px-4">
        <div data-ev-id="ev_d7fcc55a8d" className="flex items-center justify-center gap-4 md:gap-8 py-2.5 text-primary">
          <div data-ev-id="ev_6e6bcc0934" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span data-ev-id="ev_2cc9ed19f8" className="font-bold">
              {isLoading ? 'טוען...' : hebrewFull || gregorian}
            </span>
          </div>
          {(parasha || holiday) && !isLoading && (
            <>
              <span data-ev-id="ev_424d79feac" className="text-primary/40">|</span>
              <div data-ev-id="ev_3d95fe5a82" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span data-ev-id="ev_6518e278fe" className="font-medium">
                  {holiday || parasha}
                </span>
              </div>
            </>
          )}
          {gregorian && hebrewFull && !isLoading && (
            <>
              <span data-ev-id="ev_d7ccad2e7e" className="hidden md:inline text-primary/40">|</span>
              <span data-ev-id="ev_dc0459c860" className="hidden md:inline text-sm opacity-70">{gregorian}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}