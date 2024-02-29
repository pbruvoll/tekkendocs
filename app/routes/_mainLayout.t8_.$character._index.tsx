import { Pencil1Icon } from '@radix-ui/react-icons'
import { Heading, Link as RadixLink, Table } from '@radix-ui/themes'
import type { HeadersFunction } from '@remix-run/node'
import { Link, type MetaFunction, NavLink } from '@remix-run/react'
import { ContentContainer } from '~/components/ContentContainer'
import { FrameDataSection } from '~/components/FrameDataSection'
import { orderByKey } from '~/constants/sortConstants'
import { tableIdToDisplayName } from '~/constants/tableIdToDisplayName'
import { useFrameData } from '~/hooks/useFrameData'
import type { CharacterFrameData } from '~/types/CharacterFrameData'
import type { RouteHandle } from '~/types/RouteHandle'
import { type SortOrder } from '~/types/SortOrder'
import { type TableDataWithHeader } from '~/types/TableData'
import { filterToDescription, getFilterFromParams } from '~/utils/filterUtils'
import { filterRows, sortRows } from '~/utils/frameDataUtils'
import { getCacheControlHeaders } from '~/utils/headerUtils'
import { commandToUrlSegment } from '~/utils/moveUtils'
import { generateMetaTags } from '~/utils/seoUtils'

export const headers: HeadersFunction = args => ({
  ...getCacheControlHeaders({ seconds: 60 * 5 }),
  'X-Td-Cachecontext': args.loaderHeaders.get('X-Td-Cachecontext') || 'none',
})

export function shouldRevalidate() {
  return false
}

export const meta: MetaFunction = ({ data, params, matches, location }) => {
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
  const { characterName, tables } = frameData as CharacterFrameData
  const characterId = characterName.toLocaleLowerCase()
  const characterTitle =
    characterName[0].toUpperCase() + characterName.substring(1)
  const title = `${characterTitle} Tekken 8 Frame Data | TekkenDocs`

  let rowsDescription: string = ''
  // the the actual filtered and sorted frame data
  const table = tables.find(t => t.name === 'frames_normal')
  if (table) {
    const searchParams = new URLSearchParams(location.search)

    const orderByParamValue = searchParams.get(orderByKey) || ''
    const [orderByColumnName, orderDirectionName] = orderByParamValue.split('_')

    const sortDirection: SortOrder =
      orderDirectionName === 'asc' ? 'asc' : 'desc'

    const filter = getFilterFromParams(searchParams)

    const filteredRows = filterRows(table.rows, filter)
    const headers = (table as TableDataWithHeader).headers

    const sortedRows = sortRows(
      filteredRows,
      headers,
      orderByColumnName,
      sortDirection,
    )

    const orderDesription = sortDirection
      ? `order by ${orderByColumnName} ${orderDirectionName}`
      : ''

    const filterStr = filterToDescription(filter)
    const filterDescription = filterStr ? `filter : ${filterStr}` : ''

    rowsDescription = [
      [orderDesription, filterDescription].filter(Boolean).join(', '),
      [headers[0], headers[1], headers[2], headers[4], headers[5]].join(' | '),
    ]
      .concat(
        sortedRows
          .slice(0, 9)
          .map(r => [r[0], r[1], r[2], r[3], r[4], r[5]].join(' | ')),
      )
      .filter(Boolean)
      .join('\n')
  }

  const description = `Frame data for ${characterTitle} in Tekken 8\n${rowsDescription}`

  return generateMetaTags({
    matches,
    description,
    title,
    url: '/t8/' + characterId,
    image: { url: `/t8/avatars/${characterId}-512.png` },
  })
}

export default function Index() {
  const { tables, editUrl, characterName } = useFrameData()
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
            className="flex items-center gap-2"
            style={{ color: 'var(--accent-a11)' }}
            target="blank"
            href={editUrl}
          >
            <Pencil1Icon />
            Edit
          </a>
        </div>
        <nav className="flex gap-3">
          <NavLink to="">Frame data</NavLink>
          <NavLink to="meta">Guide</NavLink>
          <NavLink to="antistrat">Anti strats</NavLink>
        </nav>
      </ContentContainer>
      <ContentContainer disableXPadding>
        {tables.map(table => {
          const columnNums = (table.headers || table.rows[0]).map(
            (_, index) => index,
          )
          if (table.headers && table.name === 'frames_normal') {
            return (
              <FrameDataSection
                key={table.name}
                table={table as TableDataWithHeader}
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
                          if (j === 0 && table.name === 'frames_normal') {
                            //this is a command, so make it link
                            return (
                              <Table.Cell key={j}>
                                <RadixLink asChild>
                                  <Link
                                    className="text-[#ab6400]"
                                    style={{ textDecoration: 'none' }}
                                    to={commandToUrlSegment(cell)}
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
