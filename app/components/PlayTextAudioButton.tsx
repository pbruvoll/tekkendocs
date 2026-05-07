import cx from 'classix';
import { Square, Volume2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { normalizeSpeechText } from '~/utils/speechUtils';

type PlayTextAudioButtonProps = {
  text: string;
  className?: string;
};

export const PlayTextAudioButton = ({
  text,
  className,
}: PlayTextAudioButtonProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const hasText = text.trim().length > 0;

  const stopSpeech = useCallback(() => {
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setIsPlaying(false);
  }, []);

  const handleClick = () => {
    if (!isSupported || !hasText) {
      return;
    }

    if (isPlaying) {
      stopSpeech();
      return;
    }

    window.speechSynthesis.cancel();
    const normalizedText = normalizeSpeechText(text);
    if (!normalizedText) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(normalizedText);
    utterance.lang = document.documentElement.lang || 'en-US';
    utterance.onstart = () => {
      setIsPlaying(true);
    };
    utterance.onend = () => {
      utteranceRef.current = null;
      setIsPlaying(false);
    };
    utterance.onerror = () => {
      utteranceRef.current = null;
      setIsPlaying(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    setIsSupported(
      typeof SpeechSynthesisUtterance !== 'undefined' &&
        'speechSynthesis' in window,
    );

    return () => {
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
        utteranceRef.current = null;
      }
    };
  }, []);

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={!isSupported || !hasText}
      className={cx(
        'h-7 w-7 rounded-full border-2 border-border p-0 text-muted-foreground',
        isPlaying
          ? 'bg-accent text-accent-foreground hover:bg-accent'
          : undefined,
        className,
      )}
      aria-label={
        isPlaying
          ? 'Stop audio playback'
          : isSupported
            ? 'Play audio'
            : 'Audio playback is not supported'
      }
    >
      {isPlaying ? (
        <Square className="h-3.5 w-3.5" />
      ) : (
        <Volume2 className="h-3.5 w-3.5" />
      )}
    </Button>
  );
};
