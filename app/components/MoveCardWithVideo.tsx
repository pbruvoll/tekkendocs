import { ChevronDown, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion, useInView } from 'motion/react';
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
import { MovePropertyIconList } from './MovePropertyIconList';
import { MovePropertyTagList } from './MovePropertyTagList';
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

const FrameHeading = ({ title }: { title: string }) => (
  <span className="text-xs font-medium text-muted-foreground uppercase">
    {title}
  </span>
);
const FrameValue = ({
  value,
  colorize,
}: {
  value: string;
  colorize?: 'hit' | 'block' | 'counter-hit';
}) => (
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
);

export const MoveCardWithVideo = ({
  move,
  moveUrl,
  shouldPlay,
  shouldPreload,
  shouldLoadVideo: shouldLoadVideoProp,
  onInViewChange,
}: MoveCardWithVideoProps) => {
  const hasVideo = Boolean(move.ytVideo);

  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, {
    margin: '50px 0px 300px 0px',
    amount: 'all',
  });
  const [shouldLoadVideo, setShouldLoadVideo] = useState(shouldLoadVideoProp);
  const [showNotes, setShowNotes] = useState(false);

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
    <div ref={cardRef} className="block w-120 max-w-full lg:w-3xl">
      <Card className="overflow-hidden bg-muted/30 border-accent border-2 transition-colors hover:border-text-primary/50">
        <div className="lg:flex">
          {/* Info section */}
          <div className="flex flex-col lg:w-1/2">
            <CardHeader className="p-4 pl-6">
              <CardTitle className="text-primary text-xl font-bold">
                <Link to={moveUrl}>{move.command}</Link>
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

            <CardContent className="space-y-3 p-4 pt-0">
              <div className="grid grid-cols-4 flex-wrap items-center justify-around gap-x-3 gap-y-2">
                <FrameHeading title="Startup" />
                <FrameHeading title="Hit Level" />
                <FrameHeading title="Block" />
                <FrameHeading title="Hit / C.Hit" />
                <FrameValue value={simplifyFrameValue(move.startup || '')} />
                <FrameValue value={move.hitLevel} />
                <FrameValue
                  value={simplifyFrameValue(move.block || '')}
                  colorize="block"
                />
                <span>
                  <FrameValue
                    value={simplifyFrameValue(move.hit || '')}
                    colorize="hit"
                  />
                  {move.counterHit && move.counterHit !== move.hit && (
                    <>
                      <span className="text-muted-foreground"> / </span>
                      <FrameValue
                        value={simplifyFrameValue(move.counterHit)}
                        colorize="hit"
                      />
                    </>
                  )}
                </span>
              </div>

              <div className="flex justify-between mt-1">
                <div className="pt-2 place-self-end">
                  {move.notes && (
                    <button
                      type="button"
                      onClick={() => setShowNotes(!showNotes)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    >
                      {showNotes ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <span>{showNotes ? 'Hide details' : 'View details'}</span>
                    </button>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <MovePropertyIconList move={move} />
                  <MovePropertyTagList move={move} />
                </div>
              </div>
              <AnimatePresence>
                {showNotes && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                    className="mt-2 ml-1 text-sm"
                  >
                    {move.notes.split('\n').map((line, index) => (
                      <div key={index}>{line}</div>
                    ))}
                  </motion.p>
                )}
              </AnimatePresence>
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
    </div>
  );
};
