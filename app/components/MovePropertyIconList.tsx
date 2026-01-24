import {
  type MoveTag,
  MoveTags,
  moveTagToDescription,
} from '~/constants/moveTags';
import ChipImg from '~/images/t8/icons/chip.webp';
import SpikeImg from '~/images/t8/icons/floor_break.webp';
import HeatImg from '~/images/t8/icons/heat.webp';
import HomingImg from '~/images/t8/icons/homing.webp';
import PowerCrushImg from '~/images/t8/icons/power_crush.webp';
import TornadoImg from '~/images/t8/icons/tornado.webp';
import WallBreakImg from '~/images/t8/icons/wall_break.webp';

import { type Move } from '~/types/Move';

const tagsToIconImage: Partial<Record<MoveTag, string>> = {
  [MoveTags.Chip]: ChipImg,
  [MoveTags.FloorBreak]: SpikeImg,
  [MoveTags.HeatEngager]: HeatImg,
  [MoveTags.Homing]: HomingImg,
  [MoveTags.Spike]: SpikeImg,
  [MoveTags.PowerCrush]: PowerCrushImg,
  [MoveTags.Tornado]: TornadoImg,
  [MoveTags.WallBreak]: WallBreakImg,
};

type MovePropertyIconListProps = {
  move: Move;
};

export const MovePropertyIconList = ({ move }: MovePropertyIconListProps) => {
  const moveTags = move.tags || {};
  const tagKeys = Object.keys(moveTags) as MoveTag[];

  return (
    <div className="flex gap-1">
      {tagKeys.map((tagKey) => {
        const iconImage = tagsToIconImage[tagKey];
        if (!iconImage) {
          return null;
        }
        const title = moveTagToDescription[tagKey] || tagKey;
        return <img key={tagKey} src={iconImage} alt={title} title={title} />;
      })}
    </div>
  );
};
