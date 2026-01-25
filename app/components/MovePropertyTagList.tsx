import { type MoveTag, MoveTags } from '~/constants/moveTags';

import { type Move } from '~/types/Move';

const tagsToName: Partial<Record<MoveTag, string>> = {
  [MoveTags.HighCrush]: 'High Crush',
  [MoveTags.LowCrush]: 'Low Crush',
  [MoveTags.Elbow]: 'Elbow',
  [MoveTags.Knee]: 'Knee',
  [MoveTags.Parry]: 'Parry',
  [MoveTags.Weapon]: 'Weapon',
  [MoveTags.WallCrush]: 'Wall Crush',
};

type MovePropertyTagListProps = {
  move: Move;
};

export const MovePropertyTagList = ({ move }: MovePropertyTagListProps) => {
  const moveTags = move.tags || {};
  const tagKeys = Object.keys(moveTags) as MoveTag[];

  return (
    <div className="flex flex-wrap gap-1">
      {tagKeys.map((tagKey) => {
        const name = tagsToName[tagKey];
        if (!name) {
          return null;
        }

        return (
          <span key={tagKey} className="rounded bg-muted px-1.5 py-0.5 text-xs">
            {name}
          </span>
        );
      })}
    </div>
  );
};
