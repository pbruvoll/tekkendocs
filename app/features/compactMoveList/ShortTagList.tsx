// Like MovePropertyTagList, but with short labels so tags fit on the command
// line. The full name is in the tooltip.
import { type MoveTag, MoveTags } from '~/constants/moveTags';
import { type Move } from '~/types/Move';
import {
  getInterruptibleFrames,
  isDuckableString,
  isSteppableString,
} from '~/utils/frameDataUtils';

type TagLabel = { key: string; short: string; full: string };

const tagsToLabel: Partial<Record<MoveTag, Omit<TagLabel, 'key'>>> = {
  [MoveTags.HighCrush]: { short: 'H.Crush', full: 'High Crush' },
  [MoveTags.LowCrush]: { short: 'L.Crush', full: 'Low Crush' },
  [MoveTags.Parry]: { short: 'Parry', full: 'Parry' },
};

const getTagLabels = (move: Move, minInterruptibleFrames = 0): TagLabel[] => {
  const moveTags = move.tags || {};
  const tagKeys = Object.keys(moveTags) as MoveTag[];
  const interruptibleFrames = getInterruptibleFrames(move);
  const steppable = moveTags[MoveTags.Steppable];

  const labels: TagLabel[] = tagKeys.flatMap((tagKey) => {
    const label = tagsToLabel[tagKey];
    return label ? [{ key: tagKey, ...label }] : [];
  });
  if (isDuckableString(move)) {
    labels.push({ key: 'duckable', short: 'Duck', full: 'Duckable' });
  }
  if (isSteppableString(move)) {
    labels.push({
      key: 'steppable',
      short: steppable && steppable !== 'SS' ? steppable : 'Step',
      full: `Steppable ${steppable === 'SS' ? '' : steppable}`,
    });
  }
  if (
    interruptibleFrames !== undefined &&
    interruptibleFrames >= minInterruptibleFrames
  ) {
    labels.push({
      key: 'interruptible',
      short: `Int i${interruptibleFrames}`,
      full: `Interruptible i${interruptibleFrames}`,
    });
  }
  return labels;
};

const Tag = ({
  children,
  title,
}: React.PropsWithChildren<{ title?: string }>) => (
  <span
    title={title}
    className="rounded border border-muted-foreground/40 bg-muted/40 px-1 text-[0.65rem] leading-4 whitespace-nowrap"
  >
    {children}
  </span>
);

export const ShortTagList = ({
  move,
  minInterruptibleFrames,
}: {
  move: Move;
  minInterruptibleFrames?: number;
}) => {
  const labels = getTagLabels(move, minInterruptibleFrames);
  if (labels.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {labels.map((l) => (
        <Tag key={l.key} title={l.full}>
          {l.short}
        </Tag>
      ))}
    </div>
  );
};
