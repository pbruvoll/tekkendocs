import cx from 'classix';
import { Square, Volume2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { normalizeSpeechText } from '~/utils/speechUtils';

type PlayTextAudioButtonLabels = {
  play: string;
  stop: string;
  notSupported: string;
};

const defaultLabels: PlayTextAudioButtonLabels = {
  play: 'Play audio',
  stop: 'Stop audio playback',
  notSupported: 'Audio playback is not supported',
};

type PlayTextAudioButtonProps = {
  text: string;
  className?: string;
  /** Accessible labels, for pages in another language */
  labels?: PlayTextAudioButtonLabels;
};

export const PlayTextAudioButton = ({
  text,
  className,
  labels = defaultLabels,
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

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
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
    // the nearest lang, so a translated guide is read with a voice for its language
    utterance.lang =
      event.currentTarget.closest('[lang]')?.getAttribute('lang') || 'en-US';
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
          ? labels.stop
          : isSupported
            ? labels.play
            : labels.notSupported
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
