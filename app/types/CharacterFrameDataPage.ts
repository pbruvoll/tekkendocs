import { type CharacterDataType } from './CharacterDataType';
import { type Game } from './Game';
import { type Move } from './Move';
import { type TableData } from './TableData';

export type CharacterFrameDataPage = {
  game: Game;
  dataType: CharacterDataType;
  characterName: string;
  editUrl: string;
  tables: TableData[];
  moves: Move[];
};
