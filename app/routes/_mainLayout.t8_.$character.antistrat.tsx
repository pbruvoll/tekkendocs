import { Pencil1Icon } from '@radix-ui/react-icons'
import { Heading, Link as RadixLink, Table } from '@radix-ui/themes'
import { type DataFunctionArgs, json, type MetaFunction } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { ContentContainer } from '~/components/ContentContainer'
import Nav, { type ObjectParams } from '~/components/Nav'
import { tableIdToDisplayName } from '~/constants/tableIdToDisplayName'
import type { CharacterFrameData } from '~/types/CharacterFrameData'
import type { RouteHandle } from '~/types/RouteHandle'
import { getCharacterFromParams } from '~/utils/characterRoute.utils.server'
import { getCacheControlHeaders } from '~/utils/headerUtils'
import { commandToUrlSegment } from '~/utils/moveUtils'
import { generateMetaTags } from '~/utils/seoUtils'
import { getSheetService } from '~/utils/sheetServiceUtils.server'

const navData: ObjectParams[] = [
  { link: '../', value: 'Frame data' },
  { link: '../meta', value: 'Cheat sheet' },
  { link: '', value: 'Anti strats' },
]
export const loader = async ({ params }: DataFunctionArgs) => {
  const character = getCharacterFromParams(params)
  const sheetService = getSheetService()
  const sheet = await sheetService.getCharacterData(
    'T8',
    character,
    'antiStrat',
  )

  const { editUrl, tables } = sheet

  return json(
    { characterName: character, editUrl, tables },
    {
      headers: {
        ...getCacheControlHeaders({ seconds: 60 * 5 }),
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
  const title = `${characterTitle} Tekken 8 Anti Strat | TekkenDocs`
  const description = `An overview of the most important information for for how to beat ${characterTitle} in Tekken 8. See the most important moves to punish, which side to to side step, strings to duck and much more`

  return generateMetaTags({
    title,
    description,
    matches,
    image: { url: `/t8/avatars/${characterId}-512.png` },
    url: `/t8/${characterId}/antistrat`,
  })
}

export default function Index() {
  const { characterName, editUrl, tables } = useLoaderData<typeof loader>()

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

        <Nav navData={navData} />
      </ContentContainer>
      <ContentContainer
        className="flex flex-wrap gap-2"
        enableBottomPadding
        disableXPadding
      >
        {tables.map(table => {
          const columnNums = (table.headers || table.rows[0]).map(
            (_, index) => index,
          )
          return (
            <section key={table.name} className="mt-8">
              <ContentContainer>
                <Heading as="h2" mb="4" size="4">
                  {tableIdToDisplayName[table.name] || table.name}
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
                          if (table.headers && table.headers[j] === 'Command') {
                            //this is a command, so make it link
                            return (
                              <Table.Cell key={j}>
                                <RadixLink asChild>
                                  <Link
                                    className="text-[#ab6400]"
                                    style={{ textDecoration: 'none' }}
                                    to={`/t7/${characterName}/${commandToUrlSegment(
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
