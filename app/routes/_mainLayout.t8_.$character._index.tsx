import { Pencil1Icon } from '@radix-ui/react-icons'
import { Heading } from '@radix-ui/themes'
import { type HeadersFunction } from 'react-router';
import { type MetaFunction } from 'react-router';
import { ContentContainer } from '~/components/ContentContainer'
import { FrameDataSection } from '~/components/FrameDataSection'
import Nav, { type NavLinkInfo } from '~/components/Nav'
import { orderByKey } from '~/constants/sortConstants'
import { useFrameData } from '~/hooks/useFrameData'
import { characterGuideAuthors } from '~/services/staticDataService'
import { type CharacterFrameDataPage } from '~/types/CharacterFrameDataPage'
import { type Move } from '~/types/Move'
import { type RouteHandle } from '~/types/RouteHandle'
import { type SortOrder } from '~/types/SortOrder'
import { filterToDescription, getFilterFromParams } from '~/utils/filterUtils'
import { filterMoves, sortMoves } from '~/utils/frameDataUtils'
import { getCacheControlHeaders } from '~/utils/headerUtils'
import { generateMetaTags } from '~/utils/seoUtils'
import { t8AvatarMap } from '~/utils/t8AvatarMap'

const navData: NavLinkInfo[] = [
  { link: '', displayName: 'Frame data' },
  { link: 'meta', displayName: 'Cheat Sheet' },
  { link: 'antistrat', displayName: 'Anti strats' },
  { link: 'flashcard', displayName: 'Flash card' },
]

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

  const { characterName, moves } = frameData as CharacterFrameDataPage
  const characterId = characterName.toLocaleLowerCase()
  const characterTitle =
    characterName[0].toUpperCase() + characterName.substring(1)
  const title = `${characterTitle} Tekken 8 Frame Data | TekkenDocs`

  let rowsDescription: string = ''
  // the the actual filtered and sorted frame data
  const searchParams = new URLSearchParams(location.search)

  const orderByParamValue = searchParams.get(orderByKey) || ''
  const [orderByColumnName, orderDirectionName] = orderByParamValue.split('_')

  const sortDirection: SortOrder = orderDirectionName === 'asc' ? 'asc' : 'desc'

  const filter = getFilterFromParams(searchParams)

  const filteredMoves = filterMoves(moves, filter)

  const sortedMoves = sortMoves(
    filteredMoves,
    orderByColumnName as keyof Move,
    sortDirection,
  )

  const orderDesription = orderDirectionName
    ? `order by ${orderByColumnName} ${orderDirectionName}`
    : ''

  const filterStr = filterToDescription(filter)
  const filterDescription = filterStr ? `filter : ${filterStr}` : ''

  rowsDescription = [
    [orderDesription, filterDescription].filter(Boolean).join(', '),
    ['Command', 'Hit level', 'Damage', 'Block frame', 'Hit frame'].join(' | '),
  ]
    .concat(
      sortedMoves
        .slice(0, 9)
        .map(({ command, hitLevel, damage, block, hit }) =>
          [command, hitLevel, damage, block, hit].join(' | '),
        ),
    )
    .filter(Boolean)
    .join('\n')

  const description = `Frame data for ${characterTitle} in Tekken 8\n${rowsDescription}`

  return generateMetaTags({
    matches,
    description,
    title,
    url: `/t8/${characterId}`,
    image: { url: `/t8/avatars/${characterId}-brand-512.png` },
  })
}

export default function Index() {
  const { tables, editUrl, characterName, moves } = useFrameData()
  if (moves.length === 0) {
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
            characterGuideAuthors.T8[characterName]
              ? [...navData, { displayName: 'Guide', link: 'guide' }]
              : navData
          }
        ></Nav>
      </ContentContainer>
      <ContentContainer disableXPadding>
        {tables.map(table => {
          if (table.headers && table.name === 'frames_normal') {
            return (
              <FrameDataSection
                key={table.name}
                moves={moves}
                hasMultipleCharacters={characterName === 'mokujin'}
              />
            )
          }
          return <div key={table.name}>Unknown table name {table.name}</div>
        })}
      </ContentContainer>
    </>
  )
}
