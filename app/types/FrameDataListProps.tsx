import { type Move } from './Move';
import { type SortSettings } from './SortSettings';

export type FrameDataListProps = {
  gameRouteId: string;
  charId?: string;
  moves: Move[];
  stickyHeader?: boolean;
  forceShowCharacter?: boolean;
  className?: string;
  sortSettings?: SortSettings;
};
