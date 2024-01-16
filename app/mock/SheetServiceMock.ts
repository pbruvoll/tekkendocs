import { type SheetObject } from '~/services/googleSheetService.server'
import { type CharacterDataType } from '~/types/CharacterDataType'
import { type CharacterPageData } from '~/types/CharacterPageData'
import { type Game } from '~/types/Game'
import { type SheetService } from '~/types/SheetService'
import { tables as kazuyaTables } from './mock-t8-kazuya-framedata'
import { tables as ninaTables } from './mock-t8-nina-framedata'

export class SheetServiceMock implements SheetService {
  getCharacterData(
    game: Game,
    characterId: string,
    dataType: CharacterDataType,
  ): Promise<CharacterPageData> {
    return Promise.resolve({
      characterName: characterId,
      dataType,
      editUrl: 'https://tekkendocs.com/fakeUrl',
      game,
      tables: characterId === 'nina' ? ninaTables : kazuyaTables,
    })
  }

  getGameData(game: Game, dataType: 'todo'): Promise<SheetObject> {
    throw 'not implemented'
  }
}
