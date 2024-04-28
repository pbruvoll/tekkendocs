import { useState } from 'react'
import {
  Button,
  Heading,
  Link as RadixLink,
  Table,
  Text,
} from '@radix-ui/themes'
import {
  Link,
  type MetaFunction,
  useMatches,
  useParams,
} from '@remix-run/react'
import { ContentContainer } from '~/components/ContentContainer'
import { type Move } from '~/types/Move'
import {
  getCharacterFrameData,
  getCharacterFrameDataMoves,
} from '~/utils/characterPageUtils'
import { getCacheControlHeaders } from '~/utils/headerUtils'
import { commandToUrlSegment } from '~/utils/moveUtils'

export const headers = () => getCacheControlHeaders({ seconds: 60 * 5 })

export const meta: MetaFunction = ({ params, matches }) => {
  const character = params.character
  const command = params.move
  const frameData = getCharacterFrameData(matches)

  if (!frameData || !command || !character || !frameData.headers) {
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
  let title = `${command} - ${characterTitle} Tekken8 Frame Data | TekkenDocs`

  const data = findMoveRow(command, frameData.rows)
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
  const moveRow = findMoveRow(command, rows) || []

  const moves = getCharacterFrameDataMoves(matches)
  const move: Move | undefined = moves ? findMove(command, moves) : undefined

  if (move) {
    title = `${move.command} - ${characterTitle} Tekken8 Frame Data | TekkenDocs`
  }

  const description = dataHeaders
    .slice(0, 8)
    .map((header, index) => `${header}:   ${moveRow[index] || ''}`)
    .join('\n')

  const image =
    move?.image && move?.image.startsWith('File:')
      ? `https://wavu.wiki/t/Special:Redirect/file/${move?.image}`
      : `/t8/avatars/${characterId}-512.png`

  return [
    { title },
    { description },
    { property: 'og:title', content: title },
    { property: 'description', content: description },
    { property: 'og:description', content: description },
    { property: 'og:image', content: image },
    {
      tagName: 'link',
      rel: 'canonical',
      href: 'https://tekkendocs.com/t8/' + characterId + '/' + command,
    },
  ]
}

const findMoveRow = (
  command: string,
  rows: string[][],
): string[] | undefined => {
  return rows.find(row => row[0] && commandToUrlSegment(row[0]) === command)
}

const findMove = (command: string, moves: Move[]): Move | undefined => {
  return moves.find(move => commandToUrlSegment(move.command) === command)
}

export default function Move() {
  const params = useParams()
  const command = params['move']
  const characterName = params['character']
  const [showVideo, setShowVideo] = useState(true)

  const matches = useMatches()
  const characterFrameData = getCharacterFrameData(matches)
  if (
    !characterName ||
    !command ||
    !characterFrameData ||
    !characterFrameData.headers
  ) {
    return <div>Missing character, move, frame data or headers</div>
  }

  const headers: string[] = characterFrameData.headers
  const moveRow = findMoveRow(command, characterFrameData.rows)
  if (!moveRow) {
    return <div>Not able to find frame data for the move {command}</div>
  }

  let videoLink =
    characterName === 'nina' && moveRow[0] === 'df+1,2'
      ? 'https://www.youtube.com/embed/E1KQf-UJ95M?si=QXJB5-VhaS5-bZMz&start=160&autoplay=1&mute=1&end=162&rel=0'
      : undefined

  if (characterName === 'nina' && moveRow[0] === 'f+2,1,3') {
    videoLink =
      'https://www.youtube.com/embed/jKrpLuRJUjI?&start=104&autoplay=1&mute=1&end=112&rel=0'
  }

  const handleReloadVideo = () => {
    setShowVideo(false)
    setTimeout(() => setShowVideo(true), 1)
  }

  const moves = getCharacterFrameDataMoves(matches)
  const move: Move | undefined = moves ? findMove(command, moves) : undefined

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
      {move?.video && (
        <>
          <video
            className="mb-2 mt-4 aspect-video max-w-full"
            src={`https://wavu.wiki/t/Special:Redirect/file/${move?.video}`}
            style={{
              width: '640px',
            }}
            loop
            controls
            autoPlay
            muted
          />
          <div className="text-sm">Video from Wavu wiki</div>
        </>
      )}
      <Table.Root variant="surface" className="mt-4" style={{ width: '100%' }}>
        <Table.Body>
          {headers.slice(1, 8).map((header, i) => {
            return (
              <Table.Row key={header}>
                <Table.Cell>{header}</Table.Cell>
                <Table.Cell>{moveRow[i + 1] || ''}</Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table.Root>
      {videoLink && showVideo && (
        <>
          <iframe
            className="aspect-video max-w-full"
            width="560"
            //height="315"
            src={videoLink}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
          <Button onClick={handleReloadVideo}>Reload</Button>
        </>
      )}
    </ContentContainer>
  )
}
