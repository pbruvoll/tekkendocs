import { type Move, type MoveT8 } from './Move';
import { type SortSettings } from './SortSettings';

export type FrameDataListProps = {
  gameRouteId: string;
  charId?: string;
  moves: Move[];
  stickyHeader?: boolean;
  forceShowCharacter?: boolean;
  className?: string;
  sortSettings?: SortSettings;
  isFavorite?: (move: MoveT8) => boolean;
  onToggleFavorite?: (move: MoveT8) => void;
};
