import { type CharacterDataType } from './CharacterDataType';
import { type Game } from './Game';
import { type Move } from './Move';

export type CharacterFrameDataPage = {
  game: Game;
  dataType: CharacterDataType;
  characterName: string;
  editUrl: string;
  moves: Move[];
};
