import { type SheetObject } from '~/services/googleSheetService.server';
import { type CharacterDataType } from './CharacterDataType';
import { type CharacterPageData } from './CharacterPageData';
import { type Game } from './Game';
import { type GameDataType } from './GameDataType';

export interface SheetService {
  getCharacterData: (
    game: Game,
    characterId: string,
    dataType: CharacterDataType,
  ) => Promise<CharacterPageData>;
  getGameData: (game: Game, dataType: GameDataType) => Promise<SheetObject>;
}
