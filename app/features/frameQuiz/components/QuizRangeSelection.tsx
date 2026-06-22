import { Button } from '@/components/ui/button';

const MOVE_RANGE_LENGTHS = [20, 50];

export type MoveRange = { start: number; end: number };

function generateRanges(total: number, rangeSize: number): MoveRange[] {
  if (total <= rangeSize) return [];
  const ranges: MoveRange[] = [];
  let start = 1;
  while (start <= total) {
    ranges.push({ start, end: Math.min(start + rangeSize - 1, total) });
    start += rangeSize;
  }
  if (ranges.length >= 2) {
    const last = ranges[ranges.length - 1];
    if (last.end - last.start + 1 < 10) {
      ranges.pop();
      ranges[ranges.length - 1].end = last.end;
    }
  }
  return ranges.length >= 2 ? ranges : [];
}

type QuizRangeSelectionProps = {
  eligibleMoveCount: number;
  selectedRange: MoveRange | null;
  onRangeChange: (range: MoveRange | null) => void;
};

export const QuizRangeSelection = ({
  eligibleMoveCount,
  selectedRange,
  onRangeChange,
}: QuizRangeSelectionProps) => {
  const rows = MOVE_RANGE_LENGTHS.map((rangeSize) => ({
    rangeSize,
    ranges: generateRanges(eligibleMoveCount, rangeSize),
  })).filter(({ ranges }) => ranges.length >= 2);

  if (rows.length === 0) return null;

  return (
    <div className="mt-6 border-t border-border/60 pt-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Practice range
      </p>
      <div className="space-y-3">
        {rows.map(({ rangeSize, ranges }, idx) => (
          <div key={rangeSize}>
            {idx > 0 && <div className="mb-3 border-t border-border/40" />}
            <p className="mb-2 text-xs text-muted-foreground">
              Sets of {rangeSize}
            </p>
            <div className="flex flex-wrap gap-2">
              {ranges.map((r) => {
                const isSelected =
                  selectedRange?.start === r.start &&
                  selectedRange?.end === r.end;
                return (
                  <Button
                    key={r.start}
                    size="sm"
                    variant={isSelected ? 'default' : 'outline'}
                    onClick={() => onRangeChange(isSelected ? null : r)}
                  >
                    {r.start}–{r.end}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
