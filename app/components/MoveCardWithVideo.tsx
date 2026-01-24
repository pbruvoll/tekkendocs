import { useInView } from 'motion/react';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { type Move } from '~/types/Move';
import {
  getBlockFrameColorClasses,
  getHitFrameColorClasses,
  simplifyFrameValue,
} from '~/utils/frameDataViewUtils';
import { MoveVideo } from './MoveVideo';

export type MoveCardWithVideoProps = {
  move: Move;
  moveUrl: string;
  showCharacter?: boolean;
  charId?: string;
  /** Whether this card should play its video. Used to ensure only one video plays at a time. */
  shouldPlay?: boolean;
  shouldLoadVideo?: boolean;
  shouldPreload?: boolean;
  /** Callback when this card's in-view status changes */
  onInViewChange?: (inView: boolean) => void;
};

/** Frame data cell component */
const FrameCell = ({
  label,
  value,
  colorize,
}: {
  label: string;
  value: string;
  colorize?: 'hit' | 'block' | 'counter-hit';
}) => (
  <div className="flex flex-col items-center gap-1">
    <span className="text-xs text-muted-foreground uppercase">{label}</span>
    <span
      className={cn(
        'text-lg font-semibold',
        colorize &&
          (colorize === 'block'
            ? getBlockFrameColorClasses(value)
            : getHitFrameColorClasses(value)),
      )}
    >
      {value || '—'}
    </span>
  </div>
);

export const MoveCardWithVideo = ({
  move,
  moveUrl,
  shouldPlay,
  shouldPreload,
  shouldLoadVideo: shouldLoadVideoProp,
  onInViewChange,
}: MoveCardWithVideoProps) => {
  const hasTags = move.tags && Object.keys(move.tags).length > 0;
  const tagsList =
    hasTags && move.tags
      ? Object.keys(move.tags).filter((key) => key !== 'fs')
      : [];
  const hasVideo = Boolean(move.ytVideo);

  const cardRef = useRef<HTMLAnchorElement>(null);
  const isInView = useInView(cardRef, {
    margin: '50px 0px 300px 0px',
    amount: 'all',
  });
  const [shouldLoadVideo, setShouldLoadVideo] = useState(shouldLoadVideoProp);

  if (shouldLoadVideoProp && !shouldLoadVideo) {
    setShouldLoadVideo(true);
  }

  // Determine if video should play: use shouldPlay prop if provided, otherwise fall back to isInView
  const isPlaying = shouldPlay !== undefined ? shouldPlay : isInView;

  // Wrap callback in useEffectEvent to avoid stale closure issues
  const notifyInViewChange = useEffectEvent((inView: boolean) => {
    onInViewChange?.(inView);
  });

  useEffect(() => {
    if (isInView) {
      const timeout = setTimeout(() => {
        notifyInViewChange(isInView);
      }, 100);
      return () => clearTimeout(timeout);
    }
    notifyInViewChange(isInView);
  }, [isInView]);

  return (
    <Link
      ref={cardRef}
      to={moveUrl}
      className="block w-120 max-w-full lg:w-3xl"
    >
      <Card className="overflow-hidden bg-muted/30 border-accent border-2 transition-colors hover:border-text-primary/50">
        <div className="lg:flex">
          {/* Info section */}
          <div className="flex flex-col lg:w-1/2">
            <CardHeader className="p-4 pl-6">
              <CardTitle className="text-primary text-xl font-bold">
                {move.command}
              </CardTitle>
            </CardHeader>

            {/* Video on small screens - shown right after command */}
            {hasVideo && (
              <div className="mb-4 aspect-video w-full lg:hidden">
                {shouldLoadVideo || isPlaying ? (
                  <MoveVideo
                    move={move}
                    playing={isPlaying}
                    preload={shouldPreload}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted/30">
                    <span className="text-sm text-muted-foreground">
                      Loading...
                    </span>
                  </div>
                )}
              </div>
            )}

            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <FrameCell
                  label="Startup"
                  value={simplifyFrameValue(move.startup || '')}
                />
                <FrameCell label="Hit Level" value={move.hitLevel} />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground uppercase">
                    Properties
                  </span>
                  <span className="text-sm font-medium">
                    {hasTags ? (
                      <span className="flex flex-wrap justify-center gap-1 uppercase">
                        {tagsList.slice(0, 6).map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-muted px-1.5 py-0.5 text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {tagsList.length > 6 && (
                          <span className="text-xs text-muted-foreground">
                            +{tagsList.length - 6}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <FrameCell
                  label="Block"
                  value={simplifyFrameValue(move.block || '')}
                  colorize="block"
                />
                <FrameCell
                  label="Hit"
                  value={simplifyFrameValue(move.hit || '')}
                  colorize="hit"
                />
                <FrameCell
                  label="Counter"
                  value={simplifyFrameValue(move.counterHit || '')}
                  colorize="counter-hit"
                />
              </div>
            </CardContent>
          </div>

          {/* Video section on large screens - right side */}
          {hasVideo ? (
            <div className="hidden aspect-video w-1/2 shrink-0 lg:block">
              {shouldLoadVideo || isPlaying ? (
                <MoveVideo
                  move={move}
                  playing={isPlaying}
                  preload={shouldPreload}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted/30">
                  <span className="text-sm text-muted-foreground">
                    Loading...
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden aspect-video w-1/2 shrink-0 items-center justify-center bg-muted/20 lg:flex">
              <span className="text-sm text-muted-foreground">
                No video available
              </span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};
