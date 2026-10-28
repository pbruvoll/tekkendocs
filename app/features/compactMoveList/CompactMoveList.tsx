// Compact move list: each move is a small card, so the values clearly belong to
// the command above them. The values sit in an inset strip, and missing values
// are faint, so real values stand out. Video, favorite and details (chevron)
// have fixed slots, at the far right on desktop. Tapping anywhere on the card
// opens the details. The video opens in a modal that repeats the frame data,
// so the list doesn't jump.
import {
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  SquarePlay,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router';
import { MovePropertyIconList } from '~/components/MovePropertyIconList';
import { MoveVideo } from '~/components/MoveVideo';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { orderByKey } from '~/constants/sortConstants';
import { HeartButton } from '~/features/favorites/HeartButton';
import { cn } from '~/lib/utils';
import { type FrameDataListProps } from '~/types/FrameDataListProps';
import { type Move } from '~/types/Move';
import { type SortByKey } from '~/types/SortByKey';
import { getSortSettings } from '~/utils/sortingUtils';
import {
  BlockValue,
  CommandText,
  CounterHitValue,
  HitValue,
  hasVideo,
  moveKey,
  moveUrlFor,
  StartupValue,
  WrapAtCommas,
} from './moveValues';
import { ShortTagList } from './ShortTagList';

// lvl | dmg (sm+) | startup | block | hit | ch
const valueCols =
  'grid grid-cols-[1.2fr_1fr_1fr_1fr_1fr] sm:grid-cols-[1.4fr_1.4fr_1fr_1fr_1fr_1fr] gap-x-2 px-2 md:w-[28rem] md:shrink-0';

// mobile: command + actions on top, values below. md: command | values | actions
const cardCols =
  'grid grid-cols-[minmax(0,1fr)_auto] items-center md:grid-cols-[minmax(0,1fr)_28rem_auto] md:gap-x-4';

// Same cycle as the Default table: asc, desc, then off
const SortLink = ({
  sortKey,
  center,
  className,
  children,
}: React.PropsWithChildren<{
  sortKey: SortByKey;
  center?: boolean;
  className?: string;
}>) => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const sortSettings = getSortSettings(searchParams);
  const active = sortSettings?.sortByKey === sortKey;

  const params = new URLSearchParams(searchParams);
  if (!active) params.set(orderByKey, `${sortKey}_asc`);
  else if (sortSettings.sortDirection === 'asc')
    params.set(orderByKey, `${sortKey}_desc`);
  else params.delete(orderByKey);

  const Icon = !active
    ? ChevronsUpDown
    : sortSettings.sortDirection === 'asc'
      ? ChevronDown
      : ChevronUp;
  return (
    <Link
      to={`${location.pathname}?${params.toString()}`}
      replace
      preventScrollReset
      className={cn(
        'flex items-center gap-0.5 hover:text-foreground',
        center && 'justify-center',
        active && 'text-primary',
        className,
      )}
    >
      {children}
      <Icon className={cn('size-3 shrink-0', !active && 'opacity-40')} />
    </Link>
  );
};

export function CompactMoveList({
  gameRouteId,
  charId,
  moves,
  forceShowCharacter,
  isFavorite,
  onToggleFavorite,
}: FrameDataListProps) {
  const showCharacter = forceShowCharacter || !charId;
  return (
    <div className="mx-auto max-w-5xl px-2 text-sm tabular-nums sm:px-4">
      <div className="sticky top-header-height z-10 -mx-2 mb-1.5 bg-background px-2 py-2 text-[0.7rem] font-medium text-muted-foreground uppercase sm:-mx-4 sm:px-4">
        <div className={cn(cardCols, 'px-2')}>
          <SortLink sortKey="command" className="hidden md:flex">
            Command
          </SortLink>
          <div
            className={cn(valueCols, 'col-span-2 md:col-span-1 md:col-start-2')}
          >
            <SortLink sortKey="hitLevel">Lvl</SortLink>
            <SortLink sortKey="damage" className="hidden sm:flex">
              Dmg
            </SortLink>
            <SortLink sortKey="startup" center>
              Start
            </SortLink>
            <SortLink sortKey="block" center>
              Block
            </SortLink>
            <SortLink sortKey="hit" center>
              Hit
            </SortLink>
            <SortLink sortKey="counterHit" center>
              CH
            </SortLink>
          </div>
          <span className="hidden w-20 md:block" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        {moves.map((move) => (
          <Card
            key={moveKey(move)}
            move={move}
            url={moveUrlFor(gameRouteId, charId, move)}
            showCharacter={showCharacter}
            isFavorite={isFavorite?.(move) ?? false}
            onToggleFavorite={
              onToggleFavorite ? () => onToggleFavorite(move) : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}

const stopPropagation = (e: React.SyntheticEvent) => e.stopPropagation();

const Values = ({ move, className }: { move: Move; className?: string }) => (
  <div className={cn(valueCols, 'text-center font-semibold', className)}>
    {/* wraps at commas instead of cutting off, so the whole string stays visible */}
    <span className="text-left font-normal text-muted-foreground">
      <WrapAtCommas text={move.hitLevel} />
    </span>
    <span className="hidden text-left font-normal text-muted-foreground sm:block">
      <WrapAtCommas text={move.damage} />
    </span>
    <StartupValue move={move} />
    <BlockValue move={move} />
    <HitValue move={move} />
    <CounterHitValue move={move} />
  </div>
);

const VideoDialogButton = ({ move, url }: { move: Move; url: string }) => (
  <Dialog>
    <DialogTrigger
      aria-label={`Show video of ${move.command}`}
      onClick={stopPropagation}
      className="rounded p-1 hover:text-foreground"
    >
      <SquarePlay className="size-4" />
    </DialogTrigger>
    {/* React events bubble through the portal, so keep clicks in the modal from toggling the card */}
    <DialogContent
      onClick={stopPropagation}
      className="dark gap-3 p-4 sm:max-w-2xl sm:p-6"
    >
      <DialogHeader className="pr-8">
        <DialogTitle>
          <Link className="text-primary" to={url}>
            {move.command}
          </Link>
        </DialogTitle>
        {move.name && <DialogDescription>{move.name}</DialogDescription>}
      </DialogHeader>
      <div className="tabular-nums">
        <div
          className={cn(
            valueCols,
            'text-center text-[0.7rem] font-medium text-muted-foreground uppercase md:w-auto',
          )}
        >
          <span className="text-left">Lvl</span>
          <span className="hidden text-left sm:block">Dmg</span>
          <span>Start</span>
          <span>Block</span>
          <span>Hit</span>
          <span>CH</span>
        </div>
        <Values
          move={move}
          className="mt-1 rounded-md bg-muted/40 py-1 md:w-auto"
        />
      </div>
      <div className="aspect-video w-full overflow-hidden rounded-md">
        <MoveVideo move={move} />
      </div>
    </DialogContent>
  </Dialog>
);

const Card = ({
  move,
  url,
  showCharacter,
  isFavorite,
  onToggleFavorite,
}: {
  move: Move;
  url: string;
  showCharacter: boolean;
  isFavorite: boolean;
  onToggleFavorite?: () => void;
}) => {
  const [showDetails, setShowDetails] = useState(false);
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: the chevron button is the keyboard path
    // biome-ignore lint/a11y/noStaticElementInteractions: same as above
    <div
      onClick={() => setShowDetails(!showDetails)}
      className="cursor-pointer rounded-lg border border-border/70 bg-muted/25 px-2 pt-1 pb-1.5 hover:border-border"
    >
      <div className={cardCols}>
        <div className="col-start-1 row-start-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 py-0.5">
          {showCharacter && (
            <span className="text-muted-foreground capitalize">
              {move.characterId}
            </span>
          )}
          <Link
            to={url}
            onClick={stopPropagation}
            className="text-base font-semibold text-primary"
          >
            <CommandText command={move.command} />
          </Link>
          <span className="contents [&_img]:size-5">
            <MovePropertyIconList move={move} size="small" />
          </span>
          {/* same threshold as the "Interruptible string" filter */}
          <ShortTagList move={move} minInterruptibleFrames={6} />
        </div>
        {/* fixed slots, so each button is in the same place on every card */}
        <div className="col-start-2 row-start-1 -mr-1 grid w-[5.25rem] grid-cols-3 place-items-center self-start text-muted-foreground md:col-start-3 md:self-center">
          {hasVideo(move) ? (
            <VideoDialogButton move={move} url={url} />
          ) : (
            <span />
          )}
          {onToggleFavorite ? (
            <HeartButton
              isFavorite={isFavorite}
              onToggle={onToggleFavorite}
              size={16}
            />
          ) : (
            <span />
          )}
          <button
            type="button"
            aria-label={showDetails ? 'Hide details' : 'Show details'}
            aria-expanded={showDetails}
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(!showDetails);
            }}
            className={cn(
              'rounded p-1 hover:text-foreground',
              showDetails && 'text-primary',
            )}
          >
            <ChevronDown
              className={cn(
                'size-4 transition-transform',
                showDetails && 'rotate-180',
              )}
            />
          </button>
        </div>
        <Values
          move={move}
          className="col-span-2 row-start-2 mt-1 rounded-md bg-background/70 py-1 md:col-span-1 md:col-start-2 md:row-start-1 md:mt-0"
        />
      </div>
      {showDetails && (
        <div className="mt-2 space-y-0.5 px-1 text-sm">
          <dl className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs">
            {move.name && (
              <div className="flex basis-full gap-1">
                <dt className="text-muted-foreground">Name</dt>
                <dd className="font-semibold">{move.name}</dd>
              </div>
            )}
            <div className="flex gap-1 sm:hidden">
              <dt className="text-muted-foreground">Damage</dt>
              <dd>{move.damage}</dd>
            </div>
            {move.recovery && (
              <div className="flex gap-1">
                <dt className="text-muted-foreground">Recovery</dt>
                <dd>{move.recovery}</dd>
              </div>
            )}
          </dl>
          {move.notes ? (
            <div>
              <div className="text-xs text-muted-foreground">Notes</div>
              {move.notes.split('\n').map((line, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: Static list
                <div key={i}>{line}</div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground">No notes for this move</div>
          )}
        </div>
      )}
    </div>
  );
};
