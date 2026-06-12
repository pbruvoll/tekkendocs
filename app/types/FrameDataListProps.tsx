import { type Move } from './Move';
import { type SortSettings } from './SortSettings';

export type FrameDataListProps = {
  gameRouteId: string;
  charId?: string;
  moves: Move[];
  disableLinks?: boolean;
  stickyHeader?: boolean;
  forceShowCharacter?: boolean;
  className?: string;
  sortSettings?: SortSettings;
};
