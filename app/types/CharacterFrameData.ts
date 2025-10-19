import { type Move } from './Move';
import { type TableData } from './TableData';

export type CharacterFrameData = {
  characterName: string;
  editUrl: string;
  tables: TableData[];
  moves?: Move[];
};
