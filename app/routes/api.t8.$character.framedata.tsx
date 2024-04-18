import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { environment } from '~/constants/environment.server'
import { hasHeaderMap } from '~/constants/hasHeaderMap'
import { SheetServiceMock } from '~/mock/SheetServiceMock'
import { getSheet } from '~/services/googleSheetService.server'
import { SheetServiceImpl } from '~/services/sheetServiceImpl.server'
import type { Game } from '~/types/Game'
import type { Move } from '~/types/Move'
import { type SheetService } from '~/types/SheetService'
import type { Throw } from '~/types/Throw'
import { cachified } from '~/utils/cache.server'
import { frameDataTableToJson } from '~/utils/frameDataUtils'
import { getCacheControlHeaders } from '~/utils/headerUtils'
import { sheetSectionToTable, sheetToSections } from '~/utils/sheetUtils.server'

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const characterId = params.character
  if (!characterId) {
    throw new Response(null, {
      status: 400,
      statusText: 'Character cant be empty',
    })
  }

  const game: Game = 'T8'

  const service: SheetService = environment.useMockData
    ? new SheetServiceMock()
    : new SheetServiceImpl()

  const sheetData = await service.getCharacterData(
    game,
    characterId,
    'frameData',
  )

  const { tables, characterName, editUrl } = sheetData

  const normalMoves = tables.find(t => t.name === 'frames_normal')
  const moves: Move[] = normalMoves ? frameDataTableToJson(normalMoves) : []
  const data = { characterName, editUrl, game, framesNormal: moves }

  return json(data, { headers: getCacheControlHeaders({ seconds: 60 * 5 }) })
}
