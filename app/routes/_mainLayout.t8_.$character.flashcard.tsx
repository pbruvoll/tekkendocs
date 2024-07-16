import { useMemo, useState } from 'react'
import { PlayIcon } from '@radix-ui/react-icons'
import { type MetaFunction } from '@remix-run/node'
import cx from 'classix'
import invariant from 'tiny-invariant'
import { Button, buttonVariants } from '@/components/ui/button'
import { ContentContainer } from '~/components/ContentContainer'
import {
  FlashCardAnswer,
  type FlashCardAnswerType,
} from '~/features/flashCards/FlashCardAnswer'
import { useFlashCardAppState } from '~/features/flashCards/useFlashCardAppState'
import { useFrameData } from '~/hooks/useFrameData'
import type { CharacterFrameData } from '~/types/CharacterFrameData'
import { type Move } from '~/types/Move'
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
  const [moveToShow, setMoveToShow] = useState<Move | undefined>()
  const { characterName, moves } = useFrameData()
  const viableMoves = useMemo(
    () => moves.filter(move => Boolean(move.block)),
    [moves],
  )
  const numViableMoves = viableMoves.length
  const [flashCardAppState, setFlashCardAppState] = useFlashCardAppState()
  const charFlashCardState = useMemo(
    () =>
      flashCardAppState[characterName] || {
        [FlashCardAnswer.Correct]: [],
        [FlashCardAnswer.Wrong]: [],
        [FlashCardAnswer.Ignored]: [],
      },
    [characterName, flashCardAppState],
  )

  console.log({ flashCardAppState, charFlashCardState })

  const unseenMoves = useMemo(() => {
    console.log('filter')
    return viableMoves
      .filter(
        m =>
          !charFlashCardState.correct.includes(m.command) &&
          !charFlashCardState.wrong.includes(m.command) &&
          !charFlashCardState.ignored.includes(m.command),
      )
      .map(m => m.command)
  }, [
    charFlashCardState.correct,
    charFlashCardState.ignored,
    charFlashCardState.wrong,
    viableMoves,
  ])

  const findAndSetMoveToShow = () => {
    let command = ''
    if (unseenMoves.length > 0) {
      command = unseenMoves[Math.floor(Math.random() * unseenMoves.length)]
    } else if (charFlashCardState.wrong.length > 0) {
      command =
        charFlashCardState.wrong[
          Math.floor(Math.random() * charFlashCardState.wrong.length)
        ]
    } else if (charFlashCardState.correct.length > 0) {
      command =
        charFlashCardState.correct[
          Math.floor(Math.random() * charFlashCardState.correct.length)
        ]
    }
    setMoveToShow(viableMoves.find(m => m.command === command))
  }

  console.log({ flashCardAppState, unseenMoves })

  const handleAnswer = (answer: FlashCardAnswerType) => {
    invariant(moveToShow)
    const newCharFlashCardState = {
      [FlashCardAnswer.Correct]: charFlashCardState.correct.filter(
        c => c !== moveToShow.command,
      ),
      [FlashCardAnswer.Wrong]: charFlashCardState.wrong.filter(
        c => c !== moveToShow.command,
      ),
      [FlashCardAnswer.Ignored]: charFlashCardState.ignored.filter(
        c => c !== moveToShow.command,
      ),
    }
    if (answer === 'correct') {
      newCharFlashCardState.correct = [
        ...newCharFlashCardState.correct,
        moveToShow.command,
      ]
    } else if (answer === 'ignored') {
      newCharFlashCardState.ignored = [
        ...newCharFlashCardState.ignored,
        moveToShow.command,
      ]
    } else if (answer === 'wrong') {
      newCharFlashCardState.wrong = [
        ...newCharFlashCardState.wrong,
        moveToShow.command,
      ]
    }
    setFlashCardAppState({
      ...flashCardAppState,
      [characterName]: newCharFlashCardState,
    })
    findAndSetMoveToShow()
  }

  return (
    <ContentContainer
      enableBottomPadding
      enableTopPadding
      className="flex justify-center"
    >
      <div>
        <h1 className="p-2 text-center text-lg">
          Flash cards for {characterName}
        </h1>
        {numViableMoves === 0 ? (
          <div>No moves available for {characterName}</div>
        ) : !moveToShow ? (
          <StartPage
            onStart={() => findAndSetMoveToShow()}
            numUnseen={unseenMoves.length}
            numCorrect={charFlashCardState.correct.length}
            numWrong={charFlashCardState.wrong.length}
            numIngnored={charFlashCardState.ignored.length}
            onResetState={() =>
              setFlashCardAppState({
                ...flashCardAppState,
                [characterName]: {
                  [FlashCardAnswer.Correct]: [],
                  [FlashCardAnswer.Wrong]: [],
                  [FlashCardAnswer.Ignored]: [],
                },
              })
            }
          />
        ) : (
          <FlashCardGame moveToShow={moveToShow} onAnswer={handleAnswer} />
        )}
      </div>
    </ContentContainer>
  )
}

type StartPageProps = {
  onStart: () => void
  onResetState: () => void
  numUnseen: number
  numCorrect: number
  numWrong: number
  numIngnored: number
}
const StartPage = ({
  onStart,
  numCorrect,
  numIngnored,
  numUnseen,
  numWrong,
  onResetState,
}: StartPageProps) => {
  return (
    <div className="flex flex-col items-center">
      <div className="prose prose-invert">
        <p>
          A flash card shows a move on the front side. Your job is to guess a
          property of the move, for example how many frames it is on block. Then
          you flip the card and check if yor guess was correct{' '}
        </p>
      </div>

      <Button onClick={onStart} className="m-4 text-xl">
        Start
      </Button>
      <div>
        <p className="py-2 text-lg">Current State</p>
        <div className="grid grid-cols-2 gap-2">
          <div>Unssen: </div>
          <div>{numUnseen}</div>
          <div>Correct: </div>
          <div>{numCorrect}</div>
          <div>Wrong: </div>
          <div>{numWrong}</div>
          <div>Ignored: </div>
          <div>{numIngnored}</div>
        </div>
      </div>
      <Button className="mt-4" onClick={onResetState} variant="secondary">
        Reset state
      </Button>
    </div>
  )
}

export type FlashCardGameProps = {
  onAnswer: (flashCardAnswer: FlashCardAnswerType) => void
  moveToShow: Move
}
const FlashCardGame = ({ onAnswer, moveToShow }: FlashCardGameProps) => {
  const [flipped, setFlipped] = useState(false)

  const handleAnswer = (answer: FlashCardAnswerType) => {
    setFlipped(false)
    onAnswer(answer)
  }

  return (
    <div
      key={moveToShow.command}
      className="group h-96 w-80 animate-in fade-in [perspective:1000px]"
    >
      <div
        className={cx(
          'grid rounded-md border-[1.5px] border-foreground/50 transition-all duration-500 [transform-style:preserve-3d]',
          flipped && '[transform:rotateY(180deg)]',
        )}
      >
        <div className="col-start-1 row-start-1 [backface-visibility:hidden]">
          <FlashCardFront move={moveToShow} onFlip={() => setFlipped(true)} />
        </div>
        <div className="col-start-1 row-start-1 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <FlashCardBack move={moveToShow} onAnswer={handleAnswer} />
        </div>
      </div>
    </div>
  )
}

type FlashCardFrontProps = {
  move: Move
  onFlip: () => void
}
const FlashCardFront = ({ move, onFlip }: FlashCardFrontProps) => {
  const [showVideo, setShowVideo] = useState(false)
  return (
    <div className="h-full w-full bg-foreground/10">
      <button
        type="button"
        className="flex w-full items-center justify-center p-2 text-xl"
        onClick={onFlip}
      >
        {move.command}
      </button>
      {move.video && showVideo ? (
        <>
          <video
            className="aspect-video max-w-full p-2 pb-1"
            src={`https://wavu.wiki/t/Special:Redirect/file/${move?.video}`}
            style={{
              width: '640px',
            }}
            loop
            controls
            autoPlay
            muted
          />
          <div className="pb-1 pl-2 text-sm">Video from Wavu wiki</div>
        </>
      ) : (
        <div className="flex items-center justify-center">
          <Button
            size="lg"
            onClick={() => setShowVideo(true)}
            className="flex w-16 items-center justify-center p-2"
          >
            <PlayIcon />
          </Button>
        </div>
      )}
      <button
        className="flex w-full items-center justify-center p-2"
        onClick={onFlip}
      >
        <div className={cx(buttonVariants({ variant: 'default' }), 'w-32')}>
          Flip
        </div>
      </button>
    </div>
  )
}

type FlashCardBackProps = {
  move: Move
  onAnswer: (flashCardAnswer: FlashCardAnswerType) => void
}

const FlashCardBack = ({ move, onAnswer }: FlashCardBackProps) => {
  return (
    <div className="flex h-full flex-col bg-foreground/10">
      <div className="flex flex-grow items-center justify-center">
        <div className="grid grid-cols-2 gap-2 p-2">
          <div>Block</div>
          <div>{move.block}</div>
          <div>Hit</div>
          <div>{move.hit}</div>
          <div>Level</div>
          <div>{move.hitLevel}</div>
        </div>
      </div>
      <div className="flex w-full justify-between p-2">
        <Button
          onClick={() => onAnswer(FlashCardAnswer.Wrong)}
          className="bg-red-700 text-white"
        >
          Wrong
        </Button>
        <Button
          onClick={() => onAnswer(FlashCardAnswer.Correct)}
          className="bg-green-700 text-white"
        >
          Correct
        </Button>
        <Button onClick={() => onAnswer(FlashCardAnswer.Ignored)}>
          Ignore
        </Button>
      </div>
    </div>
  )
}
