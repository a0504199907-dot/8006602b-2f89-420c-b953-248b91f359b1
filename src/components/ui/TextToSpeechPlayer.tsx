import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TextToSpeechPlayerProps {
  text: string;
  title?: string;
}

export default function TextToSpeechPlayer({ text }: TextToSpeechPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  const cleanText = text
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
  const estimatedDuration = Math.max(1, Math.ceil((wordCount / 150) * 60));

  useEffect(() => {
    setDuration(estimatedDuration);
  }, [estimatedDuration]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate;
  }, [playbackRate, audioUrl]);

  const fetchTtsAudio = useCallback(async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('tts-hebrew', {
        body: { text: cleanText, voice: 'he-IL-AvriNeural', rate: '+0%', pitch: '+0Hz' },
      });
      if (error) { console.warn('tts-hebrew invoke error:', error); return null; }
      let blob: Blob | null = null;
      if (data instanceof Blob) blob = data;
      else if (data instanceof ArrayBuffer) blob = new Blob([data], { type: 'audio/mpeg' });
      else if (data && typeof data === 'object' && (data as { error?: string }).error) return null;
      if (!blob) return null;
      return URL.createObjectURL(blob);
    } catch (err) {
      console.warn('tts-hebrew fetch failed:', err);
      return null;
    }
  }, [cleanText]);

  const fallbackSpeak = useCallback((fromPosition: number = 0) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const remaining = fromPosition > 0
      ? cleanText.slice(Math.floor((fromPosition / estimatedDuration) * cleanText.length))
      : cleanText;
    const utterance = new SpeechSynthesisUtterance(remaining);
    utterance.lang = 'he-IL';
    utterance.rate = playbackRate * 0.95;
    utterance.pitch = 0.7;
    utterance.onstart = () => {
      setIsPlaying(true);
      startTimeRef.current = Date.now() - fromPosition * 1000;
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        if (elapsed >= estimatedDuration) {
          setCurrentTime(estimatedDuration);
          window.speechSynthesis.cancel();
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsPlaying(false);
          setCurrentTime(0);
        } else {
          setCurrentTime(Math.floor(elapsed));
        }
      }, 100);
    };
    utterance.onend = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsPlaying(false);
      setCurrentTime(0);
    };
    utterance.onerror = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsPlaying(false);
    };
    window.speechSynthesis.speak(utterance);
  }, [cleanText, estimatedDuration, playbackRate]);

  const startPlayback = useCallback(async (fromPosition: number = 0) => {
    if (audioUrl && audioRef.current) {
      try {
        audioRef.current.currentTime = fromPosition;
        audioRef.current.playbackRate = playbackRate;
        await audioRef.current.play();
        setIsPlaying(true);
        return;
      } catch (err) { console.warn('audio play failed:', err); }
    }
    setIsLoading(true);
    const url = await fetchTtsAudio();
    setIsLoading(false);
    if (url) {
      setUsingFallback(false);
      setAudioUrl(url);
      setTimeout(async () => {
        if (audioRef.current) {
          audioRef.current.currentTime = fromPosition;
          audioRef.current.playbackRate = playbackRate;
          try { await audioRef.current.play(); setIsPlaying(true); }
          catch (err) { console.warn('audio play after load failed:', err); }
        }
      }, 50);
      return;
    }
    setUsingFallback(true);
    fallbackSpeak(fromPosition);
  }, [audioUrl, fetchTtsAudio, fallbackSpeak, playbackRate]);

  const togglePlay = () => {
    if (isPlaying) {
      if (usingFallback) {
        if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
        if (intervalRef.current) clearInterval(intervalRef.current);
        pausedTimeRef.current = currentTime;
        setIsPlaying(false);
      } else if (audioRef.current) {
        audioRef.current.pause();
        pausedTimeRef.current = audioRef.current.currentTime;
        setIsPlaying(false);
      }
    } else {
      startPlayback(pausedTimeRef.current || 0);
    }
  };

  const skip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    setCurrentTime(newTime);
    pausedTimeRef.current = newTime;
    if (usingFallback) {
      if (isPlaying) fallbackSpeak(newTime);
    } else if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      if (isPlaying) audioRef.current.play().catch(() => {});
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = 1 - (clickX / rect.width);
    const newTime = Math.max(0, Math.min(duration, ratio * duration));
    setCurrentTime(newTime);
    pausedTimeRef.current = newTime;
    if (usingFallback) {
      if (isPlaying) fallbackSpeak(newTime);
    } else if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      if (isPlaying) audioRef.current.play().catch(() => {});
    }
  };

  const changeSpeed = (rate: number) => {
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
    if (audioRef.current) audioRef.current.playbackRate = rate;
    if (usingFallback && isPlaying) fallbackSpeak(currentTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="bg-gradient-to-br from-surface to-muted/30 border border-border rounded-2xl p-4 sm:p-5 shadow-sm"
      dir="rtl">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="auto"
          onTimeUpdate={() => { if (audioRef.current) setCurrentTime(audioRef.current.currentTime); }}
          onLoadedMetadata={() => {
            if (audioRef.current && audioRef.current.duration && isFinite(audioRef.current.duration)) {
              setDuration(audioRef.current.duration);
            }
          }}
          onEnded={() => { setIsPlaying(false); setCurrentTime(0); pausedTimeRef.current = 0; }}
          onError={() => { console.warn('audio element error'); setIsPlaying(false); }} />
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-foreground/80">
          <Volume2 className="w-4 h-4 text-secondary" />
          <span className="text-sm font-medium">האזנה לכתבה</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {Math.ceil(duration / 60)} דקות קריאה
        </span>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={() => skip(-5)}
          className="relative w-10 h-10 rounded-full flex items-center justify-center text-foreground/70 hover:text-secondary hover:bg-secondary/10 transition-colors flex-shrink-0"
          aria-label="5 שניות אחורה"
          title="5 שניות אחורה">
          <RotateCcw className="w-6 h-6" strokeWidth={1.75} />
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold pt-[1px] pointer-events-none">5</span>
        </button>

        <button
          onClick={togglePlay}
          disabled={isLoading}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-secondary text-primary flex items-center justify-center hover:bg-secondary-light transition-all shadow-md hover:shadow-lg flex-shrink-0 disabled:opacity-60"
          aria-label={isPlaying ? 'השהה' : 'נגן'}>
          {isLoading ? (
            <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ms-0.5" />
          )}
        </button>

        <button
          onClick={() => skip(5)}
          className="relative w-10 h-10 rounded-full flex items-center justify-center text-foreground/70 hover:text-secondary hover:bg-secondary/10 transition-colors flex-shrink-0"
          aria-label="5 שניות קדימה"
          title="5 שניות קדימה">
          <RotateCw className="w-6 h-6" strokeWidth={1.75} />
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold pt-[1px] pointer-events-none">5</span>
        </button>

        <div className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3">
          <span className="text-xs text-muted-foreground font-mono tabular-nums flex-shrink-0">
            {formatTime(currentTime)}
          </span>
          <div
            className="flex-1 min-w-[40px] h-2 bg-muted rounded-full cursor-pointer relative group"
            onClick={handleProgressClick}>
            <div
              className="absolute inset-y-0 right-0 bg-secondary rounded-full transition-all"
              style={{ width: `${progress}%` }} />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-secondary rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ right: `calc(${progress}% - 7px)` }} />
          </div>
          <span className="text-xs text-muted-foreground font-mono tabular-nums flex-shrink-0">
            {formatTime(duration)}
          </span>
        </div>

        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            className="px-2.5 sm:px-3 py-1.5 rounded-full border border-border text-xs sm:text-sm font-semibold hover:border-secondary hover:text-secondary transition-colors tabular-nums">
            {playbackRate}x
          </button>
          {showSpeedMenu && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-surface border border-border rounded-xl shadow-lg p-1.5 flex flex-col gap-1 z-10 min-w-[64px]">
              {[0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                <button
                  key={rate}
                  onClick={() => changeSpeed(rate)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors tabular-nums ${playbackRate === rate ? 'bg-secondary text-primary font-bold' : 'hover:bg-muted'}`}>
                  {rate}x
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
