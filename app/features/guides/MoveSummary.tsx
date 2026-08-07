import cx from 'classix';
import { type Move } from '~/types/Move';
import { compressCommand } from '~/utils/commandUtils';

/** Frames a move is punishable at when blocked, used to tint the on block chip */
const punishableOnBlock = -10;

const blockChipStyle = (block: string | undefined) => {
  if (!block) return 'bg-muted text-muted-foreground';
  const frames = parseInt(block, 10);
  if (Number.isNaN(frames)) return 'bg-muted text-muted-foreground';
  if (frames <= punishableOnBlock)
    return 'bg-destructive/15 text-foreground-destructive';
  if (frames >= 0) return 'bg-success/15 text-foreground-success';
  return 'bg-muted text-muted-foreground';
};

export const MoveSummary = ({
  command,
  compressedCommandMap,
  className,
}: {
  command: string;
  compressedCommandMap: Record<string, Move>;
  className?: string;
}) => {
  const move = compressedCommandMap[compressCommand(command.split(' | ')[0])];
  if (!move) return null;
  const items = [
    move.hitLevel && { text: move.hitLevel },
    move.startup && { text: move.startup.split(',')[0] },
    move.block && {
      text: `${move.block} oB`,
      chipClassName: blockChipStyle(move.block),
    },
    move.hit && { text: `${move.hit} oH` },
    move.counterHit && { text: `${move.counterHit} oCH` },
  ].filter(Boolean) as { text: string; chipClassName?: string }[];

  if (!items.length) return null;

  return (
    <div className={cx('flex flex-wrap gap-1', className)}>
      {items.map(({ text, chipClassName }) => (
        <span
          key={text}
          className={cx(
            'rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums',
            chipClassName ?? 'bg-muted text-muted-foreground',
          )}
        >
          {text}
        </span>
      ))}
    </div>
  );
};
