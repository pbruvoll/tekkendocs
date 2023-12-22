import { type DataFunctionArgs, json } from '@remix-run/node'
import { Outlet } from '@remix-run/react'
import { SheetServiceImpl } from '~/services/sheetServiceImpl.server'
import type { Game } from '~/types/Game'
import { type SheetService } from '~/types/SheetService'
import { getCacheControlHeaders } from '~/utils/headerUtils'

export const loader = async ({ params }: DataFunctionArgs) => {
  const characterId = params.character
  if (!characterId) {
    throw new Response(null, {
      status: 400,
      statusText: 'Character cant be empty',
    })
  }

  const game: Game = 'T8'

  const service: SheetService = new SheetServiceImpl()

  const data = await service.getCharacterData(game, characterId, 'frameData')

  return json(data, { headers: getCacheControlHeaders({ seconds: 60 * 5 }) })
}

export const handle = {
  type: 'frameData',
}

export default function Index() {
  return <Outlet />
}
