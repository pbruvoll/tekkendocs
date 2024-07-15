import { useState } from 'react'
import { type MetaFunction } from '@remix-run/node'
import { Button } from '@/components/ui/button'
import { ContentContainer } from '~/components/ContentContainer'
import { useFrameData } from '~/hooks/useFrameData'
import type { CharacterFrameData } from '~/types/CharacterFrameData'
import type { RouteHandle } from '~/types/RouteHandle'
import { generateMetaTags } from '~/utils/seoUtils'

// const navData: NavLinkInfo[] = [
//   { link: '../', displayName: 'Frame data' },
//   { link: '', displayName: 'Cheat sheet' },
//   { link: '../antistrat', displayName: 'Anti strats' },
// ]

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
  const title = `${characterTitle} Tekken 8 Flash Cards | TekkenDocs`
  const description = `Flashcards for ${characterTitle} in Tekken 8.`

  return generateMetaTags({
    matches,
    title,
    description,
    image: { url: `/t8/avatars/${characterId}-512.png` },
    url: `/t8/${characterId}/flashcard`,
  })
}

export default function FlashCard() {
  const [showStartPage, setShowStartPage] = useState(true)
  const { characterName } = useFrameData()
  return (
    <ContentContainer enableBottomPadding enableTopPadding>
      <h1>Flash cards for {characterName}</h1>
      {showStartPage ? (
        <StartPage onStart={() => setShowStartPage(false)} />
      ) : (
        <FlashCardGame />
      )}
    </ContentContainer>
  )
}

type StartPageProps = {
  onStart: () => void
}
const StartPage = ({ onStart }: StartPageProps) => {
  return <Button onClick={onStart}>Start</Button>
}

const FlashCardGame = () => {
  const { moves, characterName } = useFrameData()
  const [showFront, setShowFront] = useState(true)
  const numMoves = moves.length
  const [moveToShow, setMoveToShow] = useState(
    moves[Math.floor(Math.random() * numMoves)],
  )
  if (moves.length === 0) {
    return <div>No moves available for {characterName}</div>
  }

  return (
    <>
      <div className="my-2 flex">
        <div className="border-card-foreground bg-card rounded-xl border p-2">
          {showFront ? (
            <h2>{moveToShow.command}</h2>
          ) : (
            <h2>{moveToShow.block}</h2>
          )}
        </div>
      </div>
      {showFront ? (
        <Button onClick={() => setShowFront(false)}>Flip</Button>
      ) : (
        <Button
          onClick={() => {
            setShowFront(true)
            setMoveToShow(() => moves[Math.floor(Math.random() * numMoves)])
          }}
        >
          Show next
        </Button>
      )}
    </>
  )
}
