import { useInView } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { type Move } from '~/types/Move';
import { MoveVideo } from './MoveVideo';

export type MoveCardWithVideoProps = {
  move: Move;
  moveUrl: string;
  showCharacter?: boolean;
  charId?: string;
};

/** Helper to determine frame advantage color */
const getFrameColor = (value: string): string => {
  if (!value || value === 'N/A' || value === '—') {
    return 'text-muted-foreground';
  }
  const num = parseInt(value, 10);
  if (Number.isNaN(num)) return 'text-foreground';
  if (num > 0) return 'text-text-success';
  if (num < 0) return 'text-text-destructive';
  return 'text-foreground';
};

/** Frame data cell component */
const FrameCell = ({
  label,
  value,
  colorize = false,
}: {
  label: string;
  value: string;
  colorize?: boolean;
}) => (
  <div className="flex flex-col items-center gap-1">
    <span className="text-xs text-muted-foreground uppercase">{label}</span>
    <span
      className={cn('text-lg font-semibold', colorize && getFrameColor(value))}
    >
      {value || '—'}
    </span>
  </div>
);

export const MoveCardWithVideo = ({
  move,
  moveUrl,
}: MoveCardWithVideoProps) => {
  const hasTags = move.tags && Object.keys(move.tags).length > 0;
  const tagsList =
    hasTags && move.tags
      ? Object.entries(move.tags).map(
          ([key, value]) => key + (value ? `:${value}` : ''),
        )
      : [];
  const hasVideo = Boolean(move.ytVideo);

  const cardRef = useRef<HTMLAnchorElement>(null);
  const isInView = useInView(cardRef, { margin: '-100px' });
  const [hasBeenInView, setHasBeenInView] = useState(false);

  useEffect(() => {
    if (isInView) {
      const timeout = setTimeout(() => setHasBeenInView(true), 100);
      return () => clearTimeout(timeout);
    }
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
              <CardTitle className="text-text-primary text-xl font-bold">
                {move.command}
              </CardTitle>
            </CardHeader>

            {/* Video on small screens - shown right after command */}
            {hasVideo && (
              <div className="mb-4 aspect-video w-full lg:hidden">
                {hasBeenInView ? (
                  <MoveVideo move={move} playing={isInView} />
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
                <FrameCell label="Startup" value={move.startup} />
                <FrameCell label="Hit Level" value={move.hitLevel} />
                <div className="flex flex-col items-center">
                  <span className="text-xs text-muted-foreground uppercase">
                    Properties
                  </span>
                  <span className="text-sm font-medium">
                    {hasTags ? (
                      <span className="flex flex-wrap justify-center gap-1">
                        {tagsList.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-muted px-1.5 py-0.5 text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {tagsList.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{tagsList.length - 3}
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
                <FrameCell label="Block" value={move.block} colorize />
                <FrameCell label="Hit" value={move.hit} colorize />
                <FrameCell label="Counter" value={move.counterHit} colorize />
              </div>
            </CardContent>
          </div>

          {/* Video section on large screens - right side */}
          {hasVideo ? (
            <div className="hidden aspect-video w-1/2 shrink-0 lg:block">
              {hasBeenInView ? (
                <MoveVideo move={move} playing={isInView} />
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
