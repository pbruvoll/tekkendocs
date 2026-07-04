import cx from 'classix';
import { X } from 'lucide-react';
import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { MovePropertyIconList } from '~/components/MovePropertyIconList';
import { MovePropertyTagList } from '~/components/MovePropertyTagList';
import { MoveVideo } from '~/components/MoveVideo';
import {
  getCharacterDisplayName,
  hasVisibleProperties,
  parseBlockValue,
} from '~/features/frameQuiz/moveSelection';
import { type Move } from '~/types/Move';
import { getRecoveryFrames } from '~/utils/frameDataUtils';
import { commandToUrlSegmentEncoded } from '~/utils/moveUtils';
import { t8AvatarBrandMap } from '~/utils/t8AvatarMap';
import {
  parseDamageTotal,
  parseRecoveryValue,
  parseStartupFrames,
} from './compareUtils';

type CompareRowSpec = {
  label: string;
  getValue: (move: Move) => string | undefined;
  getNumericValue?: (move: Move) => number | null;
  higherIsBetter?: boolean;
  formatDiff?: (diff: number) => string;
};

const compareRows: CompareRowSpec[] = [
  {
    label: 'Hit level',
    getValue: (move) => move.hitLevel,
  },
  {
    label: 'Damage',
    getValue: (move) => move.damage,
    getNumericValue: (move) => parseDamageTotal(move.damage || ''),
    higherIsBetter: true,
    formatDiff: (diff) => `${diff} more damage`,
  },
  {
    label: 'Startup',
    getValue: (move) => move.startup,
    getNumericValue: (move) => parseStartupFrames(move.startup || ''),
    higherIsBetter: false,
    formatDiff: (diff) => `${diff}f faster`,
  },
  {
    label: 'On block',
    getValue: (move) => move.block,
    getNumericValue: (move) => parseBlockValue(move.block || ''),
    higherIsBetter: true,
    formatDiff: (diff) => `${diff}f better`,
  },
  {
    label: 'On hit',
    getValue: (move) => move.hit,
    getNumericValue: (move) => parseBlockValue(move.hit || ''),
    higherIsBetter: true,
    formatDiff: (diff) => `${diff}f better`,
  },
  {
    label: 'On counter hit',
    getValue: (move) => move.counterHit,
    getNumericValue: (move) => parseBlockValue(move.counterHit || ''),
    higherIsBetter: true,
    formatDiff: (diff) => `${diff}f better`,
  },
  {
    label: 'Recovery',
    getValue: (move) => getRecoveryFrames(move),
    getNumericValue: parseRecoveryValue,
    higherIsBetter: false,
    formatDiff: (diff) => `${diff}f shorter`,
  },
];

type RowComparison = {
  winner: 'a' | 'b' | null;
  diff: number;
};

const getRowComparison = (
  row: CompareRowSpec,
  moveA: Move,
  moveB: Move,
): RowComparison => {
  if (!row.getNumericValue) {
    return { winner: null, diff: 0 };
  }
  const valueA = row.getNumericValue(moveA);
  const valueB = row.getNumericValue(moveB);
  if (valueA === null || valueB === null || valueA === valueB) {
    return { winner: null, diff: 0 };
  }
  const aIsBetter = row.higherIsBetter ? valueA > valueB : valueA < valueB;
  return {
    winner: aIsBetter ? 'a' : 'b',
    diff: Math.round(Math.abs(valueA - valueB) * 10) / 10,
  };
};

const RowLabel = ({ children }: { children: ReactNode }) => (
  <div className="col-span-2 mt-1.5 border-b border-border/50 pb-0.5 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
    {children}
  </div>
);

const ValueCell = ({
  value,
  isBetter,
  diffLabel,
}: {
  value: string | undefined;
  isBetter: boolean;
  diffLabel?: string;
}) => (
  <div className="flex flex-col items-center gap-1 py-1 text-center">
    <span
      className={cx(
        'wrap-break-word min-w-0 max-w-full tabular-nums',
        isBetter && 'font-semibold text-foreground-success',
      )}
    >
      {value || '–'}
    </span>
    {isBetter && diffLabel && (
      <span className="whitespace-nowrap rounded-full bg-foreground-success/15 px-2 py-0.5 text-xs text-foreground-success">
        {diffLabel}
      </span>
    )}
  </div>
);

const MoveHeader = ({
  move,
  onClear,
  clearLabel,
}: {
  move: Move;
  onClear: () => void;
  clearLabel: string;
}) => {
  const charId = move.characterId;
  const content = (
    <>
      {charId && (
        <img
          src={t8AvatarBrandMap[charId]}
          alt=""
          className="h-12 w-12 rounded-lg"
        />
      )}
      <span className="font-semibold">
        {charId ? getCharacterDisplayName(charId) : 'Move'}
      </span>
      <span className="wrap-break-word min-w-0 max-w-full text-sm text-primary">
        {move.command}
      </span>
      {move.name && (
        <span className="wrap-break-word min-w-0 max-w-full text-xs text-muted-foreground">
          {move.name}
        </span>
      )}
    </>
  );

  return (
    <div className="relative min-w-0">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute -top-1 right-0"
        aria-label={clearLabel}
        onClick={onClear}
      >
        <X className="h-4 w-4" />
      </Button>
      {charId ? (
        <Link
          to={`/t8/${charId}/${commandToUrlSegmentEncoded(move.command)}`}
          className="flex min-w-0 flex-col items-center gap-1 text-center no-underline"
        >
          {content}
        </Link>
      ) : (
        <div className="flex min-w-0 flex-col items-center gap-1 text-center">
          {content}
        </div>
      )}
    </div>
  );
};

const PropertiesCell = ({ move }: { move: Move }) => (
  <div className="flex flex-wrap content-start items-center justify-center gap-1.5 py-1">
    <MovePropertyIconList move={move} size="small" />
    <MovePropertyTagList move={move} />
  </div>
);

const NotesCell = ({ move }: { move: Move }) => (
  <div className="wrap-break-word min-w-0 whitespace-pre-line py-1 text-sm">
    {move.notes || '–'}
  </div>
);

const MoveVideoCell = ({ move }: { move: Move }) =>
  move.video || move.ytVideo ? (
    <MoveVideo move={move} className="mb-2 mt-3 overflow-hidden rounded-lg" />
  ) : (
    <div className="mb-2 mt-3 flex aspect-video items-center justify-center rounded-lg bg-muted/30 text-sm text-muted-foreground">
      No video
    </div>
  );

type MoveComparisonProps = {
  moveA: Move;
  moveB: Move;
  onClearMoveA: () => void;
  onClearMoveB: () => void;
};

export const MoveComparison = ({
  moveA,
  moveB,
  onClearMoveA,
  onClearMoveB,
}: MoveComparisonProps) => {
  const showProperties =
    hasVisibleProperties(moveA) || hasVisibleProperties(moveB);
  const showNotes = !!(moveA.notes || moveB.notes);

  return (
    <div className="grid grid-cols-2 gap-x-3 sm:gap-x-8">
      <MoveHeader
        move={moveA}
        onClear={onClearMoveA}
        clearLabel="Clear move 1"
      />
      <MoveHeader
        move={moveB}
        onClear={onClearMoveB}
        clearLabel="Clear move 2"
      />
      <MoveVideoCell move={moveA} />
      <MoveVideoCell move={moveB} />
      {compareRows.map((row) => {
        const { winner, diff } = getRowComparison(row, moveA, moveB);
        const diffLabel = row.formatDiff?.(diff);
        return (
          <Fragment key={row.label}>
            <RowLabel>{row.label}</RowLabel>
            <ValueCell
              value={row.getValue(moveA)}
              isBetter={winner === 'a'}
              diffLabel={diffLabel}
            />
            <ValueCell
              value={row.getValue(moveB)}
              isBetter={winner === 'b'}
              diffLabel={diffLabel}
            />
          </Fragment>
        );
      })}
      {showProperties && (
        <>
          <RowLabel>Properties</RowLabel>
          <PropertiesCell move={moveA} />
          <PropertiesCell move={moveB} />
        </>
      )}
      {showNotes && (
        <>
          <RowLabel>Notes</RowLabel>
          <NotesCell move={moveA} />
          <NotesCell move={moveB} />
        </>
      )}
    </div>
  );
};
