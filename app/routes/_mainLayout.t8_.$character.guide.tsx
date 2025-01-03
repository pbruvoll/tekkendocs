import { useMemo } from 'react'
import { Pencil1Icon } from '@radix-ui/react-icons'
import { Text } from '@radix-ui/themes'
import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { Authors } from '~/components/Authors'
import { ContentContainer } from '~/components/ContentContainer'
import Nav, { type NavLinkInfo } from '~/components/Nav'
import { PersonLinkList } from '~/components/PersonLinkList'
import { ComboEnders } from '~/features/guides/ComboEnders'
import { Combos } from '~/features/guides/Combos'
import { DefensiveTips } from '~/features/guides/DefensiveTips'
import { ExternalResources } from '~/features/guides/ExternalResources'
import { FrameTraps } from '~/features/guides/FrameTraps'
import { GuideContext } from '~/features/guides/GuideContext'
import { GuideNav } from '~/features/guides/GuideNav'
import { tablesToGuideData } from '~/features/guides/guideUtils.server'
import { HeatSystem } from '~/features/guides/HeatSystem'
import { Introduction } from '~/features/guides/Introduction'
import { KeyMoves } from '~/features/guides/KeyMoves'
import { Punishers } from '~/features/guides/Punishers'
import { StrengthsWeaknesses } from '~/features/guides/StrengthsWeaknesses'
import { WallCombos } from '~/features/guides/WallCombos'
import { useFrameData } from '~/hooks/useFrameData'
import { getSheet } from '~/services/googleSheetService.server'
import type { CharacterFrameData } from '~/types/CharacterFrameData'
import type { Game } from '~/types/Game'
import { type Move } from '~/types/Move'
import type { RouteHandle } from '~/types/RouteHandle'
import { cachified } from '~/utils/cache.server'
import { compressCommand } from '~/utils/commandUtils'
import { gameNameMap } from '~/utils/gameNameMap'
import { getCacheControlHeaders } from '~/utils/headerUtils'
import { generateMetaTags } from '~/utils/seoUtils'
import { sheetToSections } from '~/utils/sheetUtils.server'
import { t8AvatarMap } from '~/utils/t8AvatarMap'

const navData: NavLinkInfo[] = [
  { link: '../', displayName: 'Frame data' },
  { link: '', displayName: 'Cheat sheet' },
  { link: '../antistrat', displayName: 'Anti strats' },
  { link: '../flashcard', displayName: 'Flash card' },
]

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const character = params.character
  if (!character) {
    throw new Response(null, {
      status: 400,
      statusText: 'Character cant be empty',
    })
  }

  const game: Game = 'T8'

  const sheetName = `${character}-guide`
  const key = `${sheetName}|_|${game}`
  const { guideData, editUrl, freshValueContext } = await cachified({
    key,
    ttl: 1000 * 30,
    staleWhileRevalidate: 1000 * 60 * 60 * 24 * 3,
    async getFreshValue(context) {
      const sheet = await getSheet(sheetName, game)
      const { editUrl, rows } = sheet
      const sheetSections = sheetToSections(rows)
      const guideData = tablesToGuideData(sheetSections)

      return { guideData, editUrl, freshValueContext: context }
    },
  })
  if (!guideData) {
    throw new Response(
      `Not able to find data for character ${character} in game ${game}`,
      { status: 500, statusText: 'server error' },
    )
  }

  return json(
    { characterName: character, editUrl, guideData, game },
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
  const title = `${characterTitle} Tekken 8 Guide | TekkenDocs`
  const description = `An overview of the most important information for ${characterTitle} in Tekken 8. Quickly learn how the play the character by learning including key moves, punisher and combos`

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
    characterName: characterId,
    editUrl,
    guideData,
    game,
  } = useLoaderData<typeof loader>()
  const { moves: frameData } = useFrameData()
  const gameId = game.toLowerCase()
  const compressedCommandMap = useMemo(() => {
    return frameData.reduce<Record<string, Move>>((prev, current) => {
      prev[compressCommand(current.command)] = current
      return prev
    }, {})
  }, [frameData])
  invariant(frameData)

  const {
    authors,
    contributors,
    externalResources,
    keyMoves,
    panicMoves,
    heatSystem,
    introduction,
    strengths,
    weaknesses,
    standingPunishers,
    crouchingPunishers,
    whiffPunishers,
    combos,
    comboEnders,
    wallCombos,
    smallCombos,
    frameTraps,
    knowledgeChecks,
    defensiveTips,
    defensiveMoves,
  } = guideData
  const { top10Moves, notableMoves } = {
    top10Moves: keyMoves?.slice(0, 10),
    notableMoves: keyMoves?.slice(10),
  }

  return (
    <GuideContext.Provider
      value={{
        compressedCommandMap,
        charUrl: `/${gameId}/${characterId}`,
      }}
    >
      <ContentContainer enableTopPadding>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              className="aspect-square w-12"
              src={t8AvatarMap[characterId]}
              alt={characterId}
            />
            <Text size="6" my="2" className="font-bold capitalize">
              {characterId}
            </Text>
          </div>
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

        <Nav navData={navData}></Nav>
      </ContentContainer>
      <h1 className="sr-only">
        {characterId} {gameNameMap[game]} Guide
      </h1>
      <ContentContainer enableBottomPadding>
        {!!authors?.length && (
          <div className="mt-4">
            <Authors authors={authors} />
          </div>
        )}
        <GuideNav guideData={guideData}></GuideNav>
        {introduction?.length && <Introduction sections={introduction} />}
        {(strengths?.length || weaknesses?.length) && (
          <StrengthsWeaknesses strengths={strengths} weaknesses={weaknesses} />
        )}
        {heatSystem?.length && <HeatSystem heatSystem={heatSystem} />}
        {top10Moves?.length && (
          <KeyMoves moves={top10Moves} title="Top 10 Moves" />
        )}
        {(standingPunishers?.length ||
          crouchingPunishers?.length ||
          whiffPunishers?.length) && (
          <Punishers
            standing={standingPunishers}
            crouching={crouchingPunishers}
            whiff={whiffPunishers}
          />
        )}
        {combos?.length && <Combos combos={combos} title="Combos" />}
        {comboEnders?.length && <ComboEnders comboEnders={comboEnders} />}
        {wallCombos?.length && <WallCombos wallCombos={wallCombos} />}
        {smallCombos?.length && (
          <Combos combos={smallCombos} title="Small Combos" />
        )}
        {notableMoves?.length && (
          <KeyMoves moves={notableMoves} title="Notable Moves" />
        )}
        {panicMoves?.length && (
          <KeyMoves moves={panicMoves} title="Panic Moves" />
        )}
        {frameTraps?.length && <FrameTraps frameTraps={frameTraps} />}
        {knowledgeChecks?.length && (
          <KeyMoves moves={knowledgeChecks} title="Knowledge checks" />
        )}
        {defensiveTips?.length && <DefensiveTips tips={defensiveTips} />}
        {defensiveMoves?.length && (
          <KeyMoves moves={defensiveMoves} title="Defensive Move Handling" />
        )}
        {externalResources?.length && (
          <ExternalResources externalResources={externalResources} />
        )}
        {/* {tables.map(table => {
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
              <Heading as="h2" mb="4" size="4">
                {tableIdToDisplayName[table.name]}
              </Heading>
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
                                  <Command
                                    charUrl={`/t8/${characterName}`}
                                    compressedCommandMap={compressedCommandMap}
                                    command={cell}
                                  />
                                </RadixLink>
                              </Table.Cell>
                            )
                          }
                          if (table.name === 'key_moves') {
                            return (
                              <Table.Cell key={j}>
                                <TextWithCommand
                                  charUrl={`/t8/${characterName}`}
                                  compressedCommandMap={compressedCommandMap}
                                  text={cell}
                                />
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
        })} */}
        {!!contributors?.length && (
          <div className="mb-3 mt-3 flex justify-end">
            <div>
              <span>Contributors : </span>
              <PersonLinkList persons={contributors} />
            </div>
          </div>
        )}
      </ContentContainer>
    </GuideContext.Provider>
  )
}
