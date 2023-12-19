import { type DataFunctionArgs, json } from '@remix-run/node'
import { Outlet } from '@remix-run/react'
import { hasHeaderMap } from '~/constants/hasHeaderMap'
import type { Game } from '~/types/Game'
import { cachified } from '~/utils/cache.server'
import { getSheet } from '~/services/googleSheetService.server'
import { getCacheControlHeaders } from '~/utils/headerUtils'
import { sheetSectionToTable, sheetToSections } from '~/utils/sheetUtils.server'

export const loader = async ({ params }: DataFunctionArgs) => {
  const character = params.character
  if (!character) {
    throw new Response(null, {
      status: 400,
      statusText: 'Character cant be empty',
    })
  }

  const game: Game = 'T7'

  const key = `${character}|_|${game}`
  const { sheet, freshValueContext } = await cachified({
    key,
    ttl: 1000 * 30,
    staleWhileRevalidate: 1000 * 60 * 60 * 24 * 3,
    async getFreshValue(context) {
      const sheet = await getSheet(character, game)
      return { sheet, freshValueContext: context }
    },
  })
  if (!sheet) {
    throw new Response(
      `Not able to find data for character ${character} in game ${game}`,
      { status: 500, statusText: 'server error' },
    )
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

  return json(
    { characterName: character, editUrl, tables },
    {
      headers: {
        ...getCacheControlHeaders({ seconds: 60 * 5 }),
        'X-Td-Cachecontext': JSON.stringify(freshValueContext),
      },
    },
  )
}

export const handle = {
  type: 'frameData',
}

export default function Index() {
  return <Outlet />
}
