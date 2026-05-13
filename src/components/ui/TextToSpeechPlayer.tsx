import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, RotateCw } from 'lucide-react';

interface TextToSpeechPlayerProps {
  text: string;
  title?: string;
}

export default function TextToSpeechPlayer({ text, title }: TextToSpeechPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  // Clean text for reading
  const cleanText = text.
  replace(/<[^>]*>/g, '') // Remove HTML tags
  .replace(/\s+/g, ' ') // Normalize whitespace
  .trim();

  // Estimate duration based on Hebrew speech rate (~150 words per minute)
  const wordsPerMinute = 150;
  const wordCount = cleanText.split(/\s+/).length;
  const estimatedDuration = Math.ceil(wordCount / wordsPerMinute * 60);

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.speechSynthesis) {
      setIsSupported(false);
    }
    setDuration(estimatedDuration);

    return () => {
      stopSpeech();
    };
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

    // Cancel any existing speech
    window.speechSynthesis.cancel();

    // Calculate starting position in text
    const charPosition = Math.floor(fromPosition / estimatedDuration * cleanText.length);
    const textToSpeak = cleanText.substring(charPosition);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'he-IL';
    utterance.rate = playbackRate;

    // Try to find a Hebrew voice
    const voices = window.speechSynthesis.getVoices();
    const hebrewVoice = voices.find((v) => v.lang.startsWith('he'));
    if (hebrewVoice) {
      utterance.voice = hebrewVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      startTimeRef.current = Date.now() - fromPosition * 1000;

      // Update progress
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
  }, [cleanText, estimatedDuration, playbackRate, stopSpeech]);

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
    const newTime = Math.floor(percentage * duration);

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
    <div data-ev-id="ev_66d2bdda89" className="bg-surface border border-border rounded-2xl p-4 shadow-sm">
      <div data-ev-id="ev_b42bf6e63b" className="flex items-center gap-4">
        {/* Play/Pause Button */}
        <button data-ev-id="ev_13226de820"
        onClick={togglePlay}
        className="w-12 h-12 rounded-full border-2 border-foreground/20 flex items-center justify-center hover:border-secondary hover:text-secondary transition-colors flex-shrink-0"
        aria-label={isPlaying ? 'השהה' : 'נגן'}>

          {isPlaying ?
          <Pause className="w-5 h-5" /> :

          <Play className="w-5 h-5 mr-[-2px]" />
          }
        </button>

        {/* Current Time */}
        <span data-ev-id="ev_10326dced7" className="text-sm text-muted-foreground font-mono w-12 flex-shrink-0">
          {formatTime(currentTime)}
        </span>

        {/* Progress Bar */}
        <div data-ev-id="ev_e5ba5a17b4"
        className="flex-1 h-1.5 bg-muted rounded-full cursor-pointer relative group"
        onClick={handleProgressClick}>

          <div data-ev-id="ev_c584b00091"
          className="absolute inset-y-0 right-0 bg-foreground/30 rounded-full transition-all"
          style={{ width: `${progress}%` }} />

          <div data-ev-id="ev_867239e767"
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-muted-foreground rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ right: `calc(${progress}% - 6px)` }} />

        </div>

        {/* Skip Buttons */}
        <div data-ev-id="ev_5f580676d3" className="flex items-center gap-1 flex-shrink-0">
          <button data-ev-id="ev_5010fffd9e"
          onClick={() => skip(-5)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="5 שניות אחורה">

            <RotateCcw className="w-4 h-4" />
            <span data-ev-id="ev_8f32570c61" className="text-[10px] absolute mt-3">5</span>
          </button>
          <button data-ev-id="ev_e9e208699c"
          onClick={() => skip(5)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="5 שניות קדימה">

            <RotateCw className="w-4 h-4" />
            <span data-ev-id="ev_b35791b681" className="text-[10px] absolute mt-3">5</span>
          </button>
        </div>

        {/* Duration */}
        <span data-ev-id="ev_802e952f42" className="text-sm text-muted-foreground font-mono w-12 flex-shrink-0">
          {formatTime(duration)}
        </span>

        {/* Speed Control */}
        <div data-ev-id="ev_19e67936b4" className="relative flex-shrink-0">
          <button data-ev-id="ev_0634ce0afa"
          onClick={() => setShowSpeedMenu(!showSpeedMenu)}
          className="px-3 py-1.5 rounded-full border border-border text-sm font-medium hover:border-secondary transition-colors">

            {playbackRate}x
          </button>
          
          {showSpeedMenu &&
          <div data-ev-id="ev_613f6b74fd" className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-surface border border-border rounded-xl shadow-lg p-2 flex flex-col gap-1 z-10">
              {[0.8, 1, 1.2, 1.5, 2].map((rate) =>
            <button data-ev-id="ev_48f0af4cb5"
            key={rate}
            onClick={() => changeSpeed(rate)}
            className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${
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

      {/* Label */}
      <div data-ev-id="ev_d59d20f574" className="mt-3 text-center text-xs text-muted-foreground">
        האזינו לכתבה • {Math.ceil(estimatedDuration / 60)} דקות קריאה
      </div>
    </div>);

}