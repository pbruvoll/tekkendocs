import { Heading, Link as RadixLink, Table, Text } from '@radix-ui/themes'
import {
  Link,
  type MetaFunction,
  useMatches,
  useParams,
} from '@remix-run/react'
import { ContentContainer } from '~/components/ContentContainer'
import { getCharacterFrameData } from '~/utils/characterPageUtils'
import { getCacheControlHeaders } from '~/utils/headerUtils'
import { commandToUrlSegment } from '~/utils/moveUtils'

export const headers = () => getCacheControlHeaders({ seconds: 60 * 5 })

export const meta: MetaFunction = ({ params, matches }) => {
  const character = params.character
  const move = params.move
  const frameData = getCharacterFrameData(matches)

  if (!frameData || !move || !character || !frameData.headers) {
    return [
      {
        title: 'TekkenDocs - Uknown character',
      },
      {
        description: `There is no character with the ID of ${params.character}.`,
      },
    ]
  }
  const characterId = character?.toLocaleLowerCase()
  const characterTitle = character[0].toUpperCase() + character.substring(1)
  const title = `${move} - ${characterTitle} Tekken8 Frame Data | TekkenDocs`

  const data = findMoveRow(move, frameData.rows)
  if (!data) {
    return [
      {
        title,
      },
      {
        description: `Frame data for ${params.move}.`,
      },
    ]
  }

  const { headers: dataHeaders, rows } = frameData
  const moveRow = findMoveRow(move, rows) || []

  const description = dataHeaders
    .map((header, index) => `${header}:   ${moveRow[index] || ''}`)
    .join('\n')

  return [
    { title },
    { description },
    { property: 'og:title', content: title },
    { property: 'description', content: description },
    { property: 'og:description', content: description },
    { property: 'og:image', content: `/t8/avatars/${characterId}-512.png` },
    {
      tagName: 'link',
      rel: 'canonical',
      href: 'https://tekkendocs.com/t8/' + characterId + '/' + move,
    },
  ]
}

const findMoveRow = (
  command: string,
  rows: string[][],
): string[] | undefined => {
  return rows.find(row => row[0] && commandToUrlSegment(row[0]) === command)
}

export default function Move() {
  const params = useParams()
  const move = params['move']
  const characterName = params['character']

  const matches = useMatches()
  const characterFrameData = getCharacterFrameData(matches)
  if (
    !characterName ||
    !move ||
    !characterFrameData ||
    !characterFrameData.headers
  ) {
    return <div>Missing character, move, frame data or headers</div>
  }

  const headers: string[] = characterFrameData.headers
  const moveRow = findMoveRow(move, characterFrameData.rows)
  if (!moveRow) {
    return <div>Not able to find frame data for the move {move}</div>
  }

  return (
    <ContentContainer enableTopPadding enableBottomPadding>
      <Text size="7" mr="6" as="span">
        Tekken 8
      </Text>
      <Heading mt="2" mb="4" as="h1" className="inline capitalize">
        <RadixLink asChild>
          <Link to={'/' + characterName} className="capatalize">
            {characterName}
          </Link>
        </RadixLink>
        : {moveRow[0]}
      </Heading>
      <Table.Root variant="surface" className="mt-4" style={{ width: '100%' }}>
        <Table.Body>
          {headers.slice(1).map((header, i) => {
            return (
              <Table.Row key={header}>
                <Table.Cell>{header}</Table.Cell>
                <Table.Cell>{moveRow[i + 1] || ''}</Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table.Root>
    </ContentContainer>
  )
}
