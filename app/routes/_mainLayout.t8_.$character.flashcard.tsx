import { useMemo, useState } from 'react'
import { Heading } from '@radix-ui/themes'
import { type MetaFunction } from '@remix-run/node'
import cx from 'classix'
import invariant from 'tiny-invariant'
import { Button } from '@/components/ui/button'
import { ContentContainer } from '~/components/ContentContainer'
import Nav, { type NavLinkInfo } from '~/components/Nav'
import { TaskProgress } from '~/components/TaskProgress'
import {
  FlashCardAnswer,
  type FlashCardAnswerType,
} from '~/features/flashCards/FlashCardAnswer'
import { FlashCardBack } from '~/features/flashCards/flashCardBack'
import { FlashCardFront } from '~/features/flashCards/flashCardFront'
import { useFlashCardAppState } from '~/features/flashCards/useFlashCardAppState'
import { useFrameData } from '~/hooks/useFrameData'
import type { CharacterFrameData } from '~/types/CharacterFrameData'
import { type Move } from '~/types/Move'
import type { RouteHandle } from '~/types/RouteHandle'
import { generateMetaTags } from '~/utils/seoUtils'
import { t8AvatarMap } from '~/utils/t8AvatarMap'

const navData: NavLinkInfo[] = [
  { link: '../', displayName: 'Frame data' },
  { link: '../meta', displayName: 'Cheat sheet' },
  { link: '../antistrat', displayName: 'Anti strats' },
  { link: '', displayName: 'Flash card' },
]

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

  const unseenMoves = useMemo(() => {
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
    const numWrong = charFlashCardState.wrong.length
    const numCorrect = charFlashCardState.correct.length
    const numUnseen = unseenMoves.length
    if (numWrong >= 7 || (numWrong > 0 && numUnseen === 0)) {
      command = charFlashCardState.wrong[Math.floor(Math.random() * numWrong)]
    } else if (numUnseen > 0) {
      command = unseenMoves[Math.floor(Math.random() * numUnseen)]
    } else if (numCorrect > 0) {
      command =
        charFlashCardState.correct[Math.floor(Math.random() * numCorrect)]
    }
    setMoveToShow(viableMoves.find(m => m.command === command))
  }

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
    <>
      {' '}
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
        </div>

        <Nav navData={navData}></Nav>
      </ContentContainer>
      <ContentContainer
        enableBottomPadding
        enableTopPadding
        className="flex justify-center"
      >
        <div>
          <h1 className="mb-4 p-2 text-center text-xl">Flash cards</h1>
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
            <FlashCardGame
              moveToShow={moveToShow}
              onAnswer={handleAnswer}
              numUnseen={unseenMoves.length}
              numCorrect={charFlashCardState.correct.length}
              numWrong={charFlashCardState.wrong.length}
            />
          )}
        </div>
      </ContentContainer>
    </>
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
      <Button onClick={onStart} className="m-4 text-xl">
        Start
      </Button>
      <TaskProgress
        className="self-stretch"
        numCompleted={numCorrect}
        total={numCorrect + numUnseen + numWrong}
      />
      <div className="prose prose-invert mt-8">
        <h3>How it works</h3>
        <p>
          A flash card shows a move on the front side. Your job is to guess a
          property of the move, for example how many frames it is on block. Then
          you flip the card and check if yor guess was correct. Cards marked as
          "Wrong" will be shown again sooner than cards marked as "Correct".
          Card marked as "Ignore" will never be shown again.
        </p>

        <h3 className="py-2">Current State</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>Unseen: </div>
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
      <Button onClick={onStart} className="m-4 text-xl">
        Start
      </Button>
    </div>
  )
}

export type FlashCardGameProps = {
  onAnswer: (flashCardAnswer: FlashCardAnswerType) => void
  moveToShow: Move
  numUnseen: number
  numCorrect: number
  numWrong: number
}
const FlashCardGame = ({
  onAnswer,
  moveToShow,
  numCorrect,
  numUnseen,
  numWrong,
}: FlashCardGameProps) => {
  const [flipped, setFlipped] = useState(false)

  const handleAnswer = (answer: FlashCardAnswerType) => {
    setFlipped(false)
    onAnswer(answer)
  }

  return (
    <>
      <div
        key={moveToShow.command}
        className="group w-80 animate-in fade-in [perspective:1000px]"
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
      <TaskProgress
        className="mt-4 self-stretch"
        numCompleted={numCorrect}
        total={numCorrect + numUnseen + numWrong}
      />
    </>
  )
}
