import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Outlet } from '@remix-run/react'
import { environment } from '~/constants/environment.server'
import { SheetServiceMock } from '~/mock/SheetServiceMock'
import { SheetServiceImpl } from '~/services/sheetServiceImpl.server'
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

  const data = await service.getCharacterData(game, characterId, 'frameData')

  const { tables } = data

  const normalMoves = tables.find(t => t.name === 'frames_normal')
  const moves: Move[] = normalMoves ? frameDataTableToJson(normalMoves) : []

  return json(
    { ...data, moves },
    { headers: getCacheControlHeaders({ seconds: 60 * 5 }) },
  )
}

export const handle = {
  type: 'frameData',
}

export default function Index() {
  return <Outlet />
}
