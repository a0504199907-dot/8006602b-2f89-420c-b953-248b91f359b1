import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2 } from 'lucide-react';

interface TextToSpeechPlayerProps {
  text: string;
  title?: string;
}

// Known female Hebrew voice names to avoid (prefer male).
const FEMALE_HE_VOICE_PATTERNS = [
  'carmit',
  'female',
  'אישה',
  'נקבה',
  'woman'];


// Known/likely male Hebrew voice names to prefer.
const MALE_HE_VOICE_PATTERNS = [
  'asaf',
  'male',
  'גבר',
  'זכר',
  'man',
  'david',
  'daniel'];


function pickHebrewMaleVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const hebrewVoices = voices.filter((v) => v.lang?.toLowerCase().startsWith('he'));
  if (hebrewVoices.length === 0) return null;

  const lower = (s: string) => (s || '').toLowerCase();

  // 1) Hebrew voice that explicitly looks male
  const explicitMale = hebrewVoices.find((v) =>
  MALE_HE_VOICE_PATTERNS.some((p) => lower(v.name).includes(p))
  );
  if (explicitMale) return explicitMale;

  // 2) Hebrew voice that is NOT a known female voice
  const notFemale = hebrewVoices.find((v) =>
  !FEMALE_HE_VOICE_PATTERNS.some((p) => lower(v.name).includes(p))
  );
  if (notFemale) return notFemale;

  // 3) Fallback: any Hebrew voice
  return hebrewVoices[0] || null;
}

export default function TextToSpeechPlayer({ text }: TextToSpeechPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  // Clean text for reading
  const cleanText = text.
  replace(/<[^>]*>/g, '').
  replace(/&nbsp;/g, ' ').
  replace(/\s+/g, ' ').
  trim();

  // Estimate duration based on Hebrew speech rate (~150 words per minute)
  const wordsPerMinute = 150;
  const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
  const estimatedDuration = Math.max(1, Math.ceil(wordCount / wordsPerMinute * 60));

  // Load voices and pick a Hebrew male voice
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setSelectedVoice(pickHebrewMaleVoice(voices));
      }
    };

    loadVoices();
    window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', loadVoices);
    };
  }, []);

  useEffect(() => {
    setDuration(estimatedDuration);
    return () => {
      stopSpeech();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estimatedDuration]);

  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsPlaying(false);
  }, []);

  const startSpeech = useCallback((fromPosition: number = 0) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const charPosition = Math.floor(fromPosition / estimatedDuration * cleanText.length);
    const textToSpeak = cleanText.substring(charPosition);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'he-IL';
    utterance.rate = playbackRate;
    utterance.pitch = 0.95; // slightly lower pitch — feels more masculine/natural
    utterance.volume = 1;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    } else {
      const voice = pickHebrewMaleVoice(window.speechSynthesis.getVoices());
      if (voice) utterance.voice = voice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      startTimeRef.current = Date.now() - fromPosition * 1000;

      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000 / playbackRate;
        if (elapsed >= estimatedDuration) {
          setCurrentTime(estimatedDuration);
          stopSpeech();
        } else {
          setCurrentTime(Math.floor(elapsed));
        }
      }, 100);
    };

    utterance.onend = () => {
      stopSpeech();
      setCurrentTime(0);
    };

    utterance.onerror = () => {
      stopSpeech();
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [cleanText, estimatedDuration, playbackRate, selectedVoice, stopSpeech]);

  const togglePlay = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      pausedTimeRef.current = currentTime;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setIsPlaying(false);
    } else {
      startSpeech(pausedTimeRef.current);
    }
  };

  const skip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(currentTime + seconds, duration));
    setCurrentTime(newTime);
    pausedTimeRef.current = newTime;

    if (isPlaying) {
      startSpeech(newTime);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    // RTL: progress fills from right, so invert
    const newTime = Math.floor((1 - percentage) * duration);

    setCurrentTime(newTime);
    pausedTimeRef.current = newTime;

    if (isPlaying) {
      startSpeech(newTime);
    }
  };

  const changeSpeed = (rate: number) => {
    setPlaybackRate(rate);
    setShowSpeedMenu(false);

    if (isPlaying) {
      const currentPos = currentTime;
      startSpeech(currentPos);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isSupported) {
    return null;
  }

  const progress = duration > 0 ? currentTime / duration * 100 : 0;

  return (
    <div
      data-ev-id="ev_66d2bdda89"
      className="bg-gradient-to-br from-surface to-muted/30 border border-border rounded-2xl p-4 sm:p-5 shadow-sm"
      dir="rtl">

      {/* Header */}
      <div data-ev-id="ev_header_tts" className="flex items-center justify-between mb-4">
        <div data-ev-id="ev_header_label" className="flex items-center gap-2 text-foreground/80">
          <Volume2 className="w-4 h-4 text-secondary" />
          <span className="text-sm font-medium">האזנה לכתבה</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {Math.ceil(estimatedDuration / 60)} דקות קריאה
        </span>
      </div>

      {/* Main controls row */}
      <div
        data-ev-id="ev_b42bf6e63b"
        className="flex items-center gap-3 sm:gap-4">

        {/* Skip Forward 5s (in RTL, right side feels like "forward" visually) */}
        <button
          data-ev-id="ev_e9e208699c"
          onClick={() => skip(-5)}
          className="relative w-10 h-10 rounded-full flex items-center justify-center text-foreground/70 hover:text-secondary hover:bg-secondary/10 transition-colors flex-shrink-0"
          aria-label="5 שניות אחורה"
          title="5 שניות אחורה">

          <RotateCcw className="w-6 h-6" strokeWidth={1.75} />
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold pt-[1px] pointer-events-none">
            5
          </span>
        </button>

        {/* Play/Pause Button */}
        <button
          data-ev-id="ev_13226de820"
          onClick={togglePlay}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-secondary text-primary flex items-center justify-center hover:bg-secondary-light transition-all shadow-md hover:shadow-lg flex-shrink-0"
          aria-label={isPlaying ? 'השהה' : 'נגן'}>

          {isPlaying ?
          <Pause className="w-6 h-6" /> :

          <Play className="w-6 h-6 ms-0.5" />
          }
        </button>

        {/* Skip Back 5s */}
        <button
          data-ev-id="ev_5010fffd9e"
          onClick={() => skip(5)}
          className="relative w-10 h-10 rounded-full flex items-center justify-center text-foreground/70 hover:text-secondary hover:bg-secondary/10 transition-colors flex-shrink-0"
          aria-label="5 שניות קדימה"
          title="5 שניות קדימה">

          <RotateCw className="w-6 h-6" strokeWidth={1.75} />
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold pt-[1px] pointer-events-none">
            5
          </span>
        </button>

        {/* Progress + Times */}
        <div data-ev-id="ev_progress_wrap" className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3">
          <span
            data-ev-id="ev_802e952f42"
            className="text-xs text-muted-foreground font-mono tabular-nums flex-shrink-0">

            {formatTime(currentTime)}
          </span>

          <div
            data-ev-id="ev_e5ba5a17b4"
            className="flex-1 min-w-[40px] h-2 bg-muted rounded-full cursor-pointer relative group"
            onClick={handleProgressClick}>

            <div
              data-ev-id="ev_c584b00091"
              className="absolute inset-y-0 right-0 bg-secondary rounded-full transition-all"
              style={{ width: `${progress}%` }} />


            <div
              data-ev-id="ev_867239e767"
              className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-secondary rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ right: `calc(${progress}% - 7px)` }} />

          </div>

          <span
            data-ev-id="ev_10326dced7"
            className="text-xs text-muted-foreground font-mono tabular-nums flex-shrink-0">

            {formatTime(duration)}
          </span>
        </div>

        {/* Speed Control */}
        <div data-ev-id="ev_19e67936b4" className="relative flex-shrink-0">
          <button
            data-ev-id="ev_0634ce0afa"
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            className="px-2.5 sm:px-3 py-1.5 rounded-full border border-border text-xs sm:text-sm font-semibold hover:border-secondary hover:text-secondary transition-colors tabular-nums">

            {playbackRate}x
          </button>

          {showSpeedMenu &&
          <div
            data-ev-id="ev_613f6b74fd"
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-surface border border-border rounded-xl shadow-lg p-1.5 flex flex-col gap-1 z-10 min-w-[64px]">

              {[0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) =>
            <button
              data-ev-id="ev_48f0af4cb5"
              key={rate}
              onClick={() => changeSpeed(rate)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors tabular-nums ${
              playbackRate === rate ?
              'bg-secondary text-primary font-bold' :
              'hover:bg-muted'}`
              }>

                  {rate}x
                </button>
            )}
            </div>
          }
        </div>
      </div>
    </div>);

}
