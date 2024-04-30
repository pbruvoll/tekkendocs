import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Outlet } from '@remix-run/react'
import { environment } from '~/constants/environment.server'
import { SheetServiceMock } from '~/mock/SheetServiceMock'
import { SheetServiceImpl } from '~/services/sheetServiceImpl.server'
import { type CharacterFrameDataPage } from '~/types/CharacterFrameDataPage'
import type { Game } from '~/types/Game'
import { type Move } from '~/types/Move'
import { type SheetService } from '~/types/SheetService'
import { frameDataTableToJson } from '~/utils/frameDataUtils'
import { getCacheControlHeaders } from '~/utils/headerUtils'

export function shouldRevalidate() {
  return false
}

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

  //let overrideSheetData: CharacterPageData | undefined = undefined
  // try {
  //   overrideSheetData = await service.getCharacterData(
  //     game,
  //     characterId,
  //     'overrideFrameData',
  //   )
  // } catch (e) {
  //   console.warn('overrideSheetData error', e)
  // }

  // const overrideNormalMoves = overrideSheetData?.tables.find(
  //   t => t.name === 'frames_normal',
  // )

  // const sheetData = await sheetDataPromise

  const { tables } = sheetData

  const normalMoves = tables.find(t => t.name === 'frames_normal')
  const moves: Move[] = normalMoves ? frameDataTableToJson(normalMoves) : []
  // if (overrideNormalMoves) {
  //   applyOverride(moves, overrideNormalMoves)
  // }
  const data: CharacterFrameDataPage = { ...sheetData, moves }

  return json(data, { headers: getCacheControlHeaders({ seconds: 60 * 5 }) })
}

export const handle = {
  type: 'frameData',
}

export default function Index() {
  return <Outlet />
}
