import { Pencil1Icon } from '@radix-ui/react-icons'
import { Heading, Link as RadixLink, Table } from '@radix-ui/themes'
import { type DataFunctionArgs, json, type MetaFunction } from '@remix-run/node'
import { Link, NavLink, useLoaderData } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { ContentContainer } from '~/components/ContentContainer'
import { ResourcesTable } from '~/components/ResourcesTable'
import { hasHeaderMap } from '~/constants/hasHeaderMap'
import { tableIdToDisplayName } from '~/constants/tableIdToDisplayName'
import { useFrameData } from '~/hooks/useFrameData'
import { getSheet } from '~/services/googleSheetService.server'
import type { CharacterFrameData } from '~/types/CharacterFrameData'
import type { Game } from '~/types/Game'
import type { RouteHandle } from '~/types/RouteHandle'
import { type TableData } from '~/types/TableData'
import { cachified } from '~/utils/cache.server'
import {
  frameDataTableToJson,
  isBalconyBreak,
  isHomingMove,
  isTornadoMove,
} from '~/utils/frameDataUtils'
import { getCacheControlHeaders } from '~/utils/headerUtils'
import { commandToUrlSegment } from '~/utils/moveUtils'
import { generateMetaTags } from '~/utils/seoUtils'
import { sheetSectionToTable, sheetToSections } from '~/utils/sheetUtils.server'

export const loader = async ({ params }: DataFunctionArgs) => {
  const character = params.character
  if (!character) {
    throw new Response(null, {
      status: 400,
      statusText: 'Character cant be empty',
    })
  }

  const game: Game = 'T8'

  const sheetName = `${character}-meta`
  const key = `${sheetName}|_|${game}`
  const { sheet, freshValueContext } = await cachified({
    key,
    ttl: 1000 * 30,
    staleWhileRevalidate: 1000 * 60 * 60 * 24 * 3,
    async getFreshValue(context) {
      const sheet = await getSheet(sheetName, game)
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

export const meta: MetaFunction = ({ data, params, matches }) => {
  const frameData = matches.find(
    m => (m.handle as RouteHandle)?.type === 'frameData',
  )?.data
  if (!frameData) {
    return [
      {
        title: 'TekkenDocs - Uknown character',
      },
      {
        description: `There is no character with the ID of ${params.character}.`,
      },
    ]
  }
  const { characterName } = frameData as CharacterFrameData
  const characterId = characterName.toLocaleLowerCase()
  const characterTitle =
    characterName[0].toUpperCase() + characterName.substring(1)
  const title = `${characterTitle} Tekken 8 Cheat Sheet | TekkenDocs`
  const description = `An overview of the most important information for ${characterTitle} in Tekken 8. The page has concise set of notes used for quick reference, including key moves, punisher and combos`

  return generateMetaTags({
    matches,
    title,
    description,
    image: { url: `/t8/avatars/${characterId}-512.png` },
    url: `/t8/${characterId}/meta`,
  })
}

export default function Index() {
  const {
    characterName,
    editUrl,
    tables: metaTables,
  } = useLoaderData<typeof loader>()
  const { tables: frameDataTables } = useFrameData()
  const normalFrameData = frameDataTables.find(t => t.name === 'frames_normal')
  invariant(normalFrameData)
  const frameData = frameDataTableToJson(normalFrameData)
  const homingMoves = frameData.filter(m => isHomingMove(m))
  const homingTable: TableData = {
    name: 'moves_homing',
    rows: homingMoves.map(m => [m.command]),
    headers: ['Command'],
  }

  const tornadoMoves = frameData.filter(m => isTornadoMove(m))
  const tornadoTable: TableData = {
    name: 'moves_tornado',
    rows: tornadoMoves.map(m => [m.command]),
    headers: ['Command'],
  }

  const balconyBreakMoves = frameData.filter(m => isBalconyBreak(m))
  const balconyBreakTable: TableData = {
    name: 'moves_balconybreak',
    rows: balconyBreakMoves.map(m => [m.command]),
    headers: ['Command'],
  }

  const tables = metaTables.concat([
    homingTable,
    tornadoTable,
    balconyBreakTable,
  ])

  if (tables.length === 0) {
    return <div>Invalid or no data</div>
  }
  return (
    <>
      <ContentContainer enableTopPadding>
        <div className="flex items-center justify-between">
          <Heading as="h1" my="2" className="capitalize">
            {characterName}
          </Heading>
          <a
            className="flex items-center gap-2 text-text-primary"
            style={{ color: 'var(--accent-a11)' }}
            target="blank"
            href={editUrl}
          >
            <Pencil1Icon />
            Edit
          </a>
        </div>
        <nav className="flex gap-3">
          <NavLink to="../">Frame data</NavLink>
          <NavLink to="">Cheat sheet</NavLink>
          <NavLink to="../antistrat">Anti strats</NavLink>
        </nav>
      </ContentContainer>
      <ContentContainer disableXPadding>
        {tables.map(table => {
          const columnNums = (table.headers || table.rows[0]).map(
            (_, index) => index,
          )
          if (table.name === 'resources_external') {
            return (
              <ResourcesTable
                key={table.name}
                rows={table.rows}
                headers={table.headers as string[]}
              />
            )
          }
          return (
            <section key={table.name} className="mt-8">
              <ContentContainer>
                <Heading as="h2" mb="4" size="4">
                  {tableIdToDisplayName[table.name]}
                </Heading>
              </ContentContainer>
              <Table.Root variant="surface" style={{ width: '100%' }}>
                {table.headers && (
                  <Table.Header>
                    <Table.Row>
                      {table.headers.map(h => (
                        <Table.ColumnHeaderCell key={h}>
                          {h}
                        </Table.ColumnHeaderCell>
                      ))}
                    </Table.Row>
                  </Table.Header>
                )}
                <Table.Body>
                  {table.rows.map((row, i) => {
                    return (
                      <Table.Row key={row[0]}>
                        {columnNums.map(j => {
                          const cell = row[j] || ''
                          if (
                            table.headers &&
                            (table.headers[j] === 'Command' ||
                              table.headers[j] === 'Secondary' ||
                              table.headers[j] === 'Starter')
                          ) {
                            //this is a command, so make it link
                            return (
                              <Table.Cell key={j}>
                                <RadixLink asChild>
                                  <Link
                                    className="text-[#ab6400]"
                                    style={{ textDecoration: 'none' }}
                                    to={`/t8/${characterName}/${commandToUrlSegment(
                                      cell,
                                    )}`}
                                  >
                                    {cell}
                                  </Link>
                                </RadixLink>
                              </Table.Cell>
                            )
                          }
                          return <Table.Cell key={j}>{cell}</Table.Cell>
                        })}
                      </Table.Row>
                    )
                  })}
                </Table.Body>
              </Table.Root>
            </section>
          )
        })}
      </ContentContainer>
    </>
  )
}
