import { useMemo } from 'react'
import { Pencil1Icon } from '@radix-ui/react-icons'
import { Heading, Table } from '@radix-ui/themes'
import { type DataFunctionArgs, json, type MetaFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { Commands } from '~/components/Commands'
import { ContentContainer } from '~/components/ContentContainer'
import Nav, { type NavLinkInfo } from '~/components/Nav'
import { TextWithCommand } from '~/components/TextWithCommand'
import { tableIdToDisplayName } from '~/constants/tableIdToDisplayName'
import { useFrameData } from '~/hooks/useFrameData'
import { characterGuideAuthors } from '~/services/staticDataService'
import type { CharacterFrameData } from '~/types/CharacterFrameData'
import { type Move } from '~/types/Move'
import type { RouteHandle } from '~/types/RouteHandle'
import { getCharacterFromParams } from '~/utils/characterRoute.utils.server'
import { compressCommand } from '~/utils/commandUtils'
import { getCacheControlHeaders } from '~/utils/headerUtils'
import { generateMetaTags } from '~/utils/seoUtils'
import { getSheetService } from '~/utils/sheetServiceUtils.server'
import { t8AvatarMap } from '~/utils/t8AvatarMap'

const navData: NavLinkInfo[] = [
  { link: '../', displayName: 'Frame data' },
  { link: '../meta', displayName: 'Cheat sheet' },
  { link: '', displayName: 'Anti strats' },
  { link: '../flashcard', displayName: 'Flash card' },
]

export const headers = () => getCacheControlHeaders({ seconds: 60 * 5 })

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
    { characterName: character, editUrl, tables, gameId: sheet.game },
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
  const { characterName, editUrl, tables, gameId } =
    useLoaderData<typeof loader>()

  const { moves: frameData } = useFrameData()
  const compressedCommandMap = useMemo(() => {
    return frameData.reduce<Record<string, Move>>((prev, current) => {
      prev[compressCommand(current.command)] = current
      return prev
    }, {})
  }, [frameData])

  const charUrl = `/${gameId.toLowerCase()}/${characterName}`

  if (tables.length === 0) {
    return <div>Invalid or no data</div>
  }

  return (
    <>
      <ContentContainer enableTopPadding>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              className="aspect-square w-12"
              src={t8AvatarMap[characterName]}
              alt={characterName}
            />
            <Heading as="h1" my="2" className="capitalize">
              {characterName}
            </Heading>
          </div>
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

        <Nav
          navData={
            characterGuideAuthors['T8'][characterName]
              ? [...navData, { displayName: 'Guide', link: '../guide' }]
              : navData
          }
        ></Nav>
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
                <Table.Body>
                  {table.rows.map((row, i) => {
                    return (
                      <Table.Row key={i}>
                        {columnNums.map(j => {
                          const cell = row[j] || ''
                          return (
                            <Table.Cell key={j}>
                              {characterName === 'asuka' ? (
                                <TextWithCommand
                                  text={cell}
                                  charUrl={charUrl}
                                  compressedCommandMap={compressedCommandMap}
                                />
                              ) : (
                                <Commands
                                  command={cell}
                                  charUrl={charUrl}
                                  compressedCommandMap={compressedCommandMap}
                                />
                              )}
                            </Table.Cell>
                          )
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
