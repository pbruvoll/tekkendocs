import { hasHeaderMap } from '~/constants/hasHeaderMap'
import { type CharacterDataType } from '~/types/CharacterDataType'
import { type CharacterPageData } from '~/types/CharacterPageData'
import { type Game } from '~/types/Game'
import { type GameDataType } from '~/types/GameDataType'
import { ServerStatusCode } from '~/types/ServerStatusCode'
import { type SheetService } from '~/types/SheetService'
import { cachified } from '~/utils/cache.server'
import { createErrorResponse } from '~/utils/errorUtils'
import { sheetSectionToTable, sheetToSections } from '~/utils/sheetUtils.server'
import { getSheetObject, type SheetObject } from './googleSheetService.server'

const gameToCharacterDocname: Record<Game, string> = {
  T8: '1IDC11ShZjpo6p5k8kV24T-jumjY27oQZlwvKr_lb4iM',
  T7: '1p-QCqB_Tb1GNX0KaicHr0tZwKa1taK5XeNvMr1N3D64',
  TT2: 'todo',
}

const characterDataTypeToSuffix: Record<CharacterDataType, string> = {
  cheatSheet: '-meta',
  frameData: '',
}

export class SheetServiceImpl implements SheetService {
  async getCharacterData(
    game: Game,
    characterId: string,
    dataType: CharacterDataType,
  ): Promise<CharacterPageData> {
    const key = [game, characterId, dataType].join('|_|')
    const spreadSheetDocumentId = gameToCharacterDocname[game]
    const sheetName = characterId + characterDataTypeToSuffix[dataType]

    const timeToLiveSec = 30
    const staleWhileRevalidateSec = 60 * 60 * 24 * 3
    const { sheet } = await cachified({
      key,
      ttl: 1000 * timeToLiveSec,
      staleWhileRevalidate: 1000 * staleWhileRevalidateSec,
      async getFreshValue() {
        const sheet = await getSheetObject(sheetName, spreadSheetDocumentId)
        return { sheet }
      },
    })
    if (!sheet) {
      throw createErrorResponse({
        title: `Not able to find data for character ${characterId} in game ${game}`,
        status: 500,
      })
    }

    const { editUrl, rows } = sheet
    const sheetSections = sheetToSections(rows)
    const tables = sheetSections.map(ss =>
      sheetSectionToTable({
        name: ss.sectionId,
        sheetSection: ss,
        hasHeader: hasHeaderMap[ss.sectionId],
      }),
    )

    console.log(JSON.stringify(tables, null, 4))
    return {
      characterName: characterId,
      dataType,
      editUrl,
      game,
      tables,
    }
  }

  async getGameData(game: Game, dataType: GameDataType): Promise<SheetObject> {
    throw createErrorResponse({
      title: 'getGameData is not yet implemented',
      status: ServerStatusCode.NotFound,
    })
  }
}
