import { type ChangeEvent, useMemo, useState } from 'react'
import { Heading } from '@radix-ui/themes'
import { type MetaFunction } from '@remix-run/node'
import cx from 'classix'
import invariant from 'tiny-invariant'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
import { characterGuideAuthors } from '~/services/staticDataService'
import type { CharacterFrameData } from '~/types/CharacterFrameData'
import { type Move } from '~/types/Move'
import type { RouteHandle } from '~/types/RouteHandle'
import { getCacheControlHeaders } from '~/utils/headerUtils'
import { generateMetaTags } from '~/utils/seoUtils'
import { t8AvatarMap } from '~/utils/t8AvatarMap'

const navData: NavLinkInfo[] = [
  { link: '../', displayName: 'Frame data' },
  { link: '../meta', displayName: 'Cheat sheet' },
  { link: '../antistrat', displayName: 'Anti strats' },
  { link: '', displayName: 'Flash card' },
]

export const headers = () => getCacheControlHeaders({ seconds: 60 * 5 })

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
  const showCharName = characterName === 'mokujin'
  const viableMoves = useMemo(
    () => moves.filter(move => Boolean(move.block)),
    [moves],
  )
  const numViableMoves = viableMoves.length

  const [numMovesToPractice, setNumMovesToPractice] = useState<
    number | undefined
  >(undefined)
  const [startFromMoveNumber, setStartFromMoveNumber] = useState<
    number | undefined
  >(undefined)

  const handleStartFromMoveNumChange = (e: ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value)
    setStartFromMoveNumber(num ? num : undefined)
  }

  const handleNumMovesToPracticeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value)
    setNumMovesToPractice(num ? num : undefined)
  }

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
          !charFlashCardState.correct.includes(
            showCharName ? m.wavuId! : m.command,
          ) &&
          !charFlashCardState.wrong.includes(
            showCharName ? m.wavuId! : m.command,
          ) &&
          !charFlashCardState.ignored.includes(
            showCharName ? m.wavuId! : m.command,
          ),
      )
      .map(m => (showCharName ? m.wavuId : m.command))
  }, [
    charFlashCardState.correct,
    charFlashCardState.ignored,
    charFlashCardState.wrong,
    showCharName,
    viableMoves,
  ])

  const viableMovesSubSet = useMemo(() => {
    if (!numMovesToPractice && !startFromMoveNumber) {
      return viableMoves
    }
    const startIndex = Math.max(0, startFromMoveNumber || 0 - 1)
    return viableMoves.slice(
      startIndex,
      startIndex + (numMovesToPractice || viableMoves.length),
    )
  }, [numMovesToPractice, startFromMoveNumber, viableMoves])

  const charFlashCardStateSubSet = useMemo(() => {
    return {
      [FlashCardAnswer.Correct]: charFlashCardState.correct.filter(c =>
        viableMovesSubSet.some(m =>
          showCharName ? m.wavuId === c : m.command === c,
        ),
      ),
      [FlashCardAnswer.Wrong]: charFlashCardState.wrong.filter(c =>
        viableMovesSubSet.some(m =>
          showCharName ? m.wavuId === c : m.command === c,
        ),
      ),
      [FlashCardAnswer.Ignored]: charFlashCardState.ignored.filter(c =>
        viableMovesSubSet.some(m =>
          showCharName ? m.wavuId === c : m.command === c,
        ),
      ),
    }
  }, [
    charFlashCardState.correct,
    charFlashCardState.ignored,
    charFlashCardState.wrong,
    showCharName,
    viableMovesSubSet,
  ])

  const unseenMovesSubSet = useMemo(() => {
    return unseenMoves.filter(c =>
      viableMovesSubSet.some(m =>
        showCharName ? m.wavuId === c : m.command === c,
      ),
    )
  }, [showCharName, unseenMoves, viableMovesSubSet])

  const findAndSetMoveToShow = () => {
    let command = ''
    const numWrong = charFlashCardStateSubSet.wrong.length
    const numCorrect = charFlashCardStateSubSet.correct.length
    const numUnseen = unseenMovesSubSet.length
    if (numWrong >= 7 || (numWrong > 0 && numUnseen === 0)) {
      command =
        charFlashCardStateSubSet.wrong[Math.floor(Math.random() * numWrong)]
    } else if (numUnseen > 0) {
      const index = Math.floor(Math.random() * numUnseen)
      command = unseenMovesSubSet[index]!
    } else if (numCorrect > 0) {
      command =
        charFlashCardStateSubSet.correct[Math.floor(Math.random() * numCorrect)]
    }
    setMoveToShow(
      viableMovesSubSet.find(m =>
        showCharName ? m.wavuId === command : m.command === command,
      ),
    )
  }

  const handleAnswer = (answer: FlashCardAnswerType) => {
    invariant(moveToShow)
    const newCharFlashCardState = {
      [FlashCardAnswer.Correct]: charFlashCardState.correct.filter(c =>
        showCharName ? c !== moveToShow.wavuId : c !== moveToShow.command,
      ),
      [FlashCardAnswer.Wrong]: charFlashCardState.wrong.filter(c =>
        showCharName ? c !== moveToShow.wavuId : c !== moveToShow.command,
      ),
      [FlashCardAnswer.Ignored]: charFlashCardState.ignored.filter(c =>
        showCharName ? c !== moveToShow.wavuId : c !== moveToShow.command,
      ),
    }
    if (answer === 'correct') {
      newCharFlashCardState.correct = [
        ...newCharFlashCardState.correct,
        showCharName ? moveToShow.wavuId! : moveToShow.command,
      ]
    } else if (answer === 'ignored') {
      newCharFlashCardState.ignored = [
        ...newCharFlashCardState.ignored,
        showCharName ? moveToShow.wavuId! : moveToShow.command,
      ]
    } else if (answer === 'wrong') {
      newCharFlashCardState.wrong = [
        ...newCharFlashCardState.wrong,
        showCharName ? moveToShow.wavuId! : moveToShow.command,
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

        <Nav
          navData={
            characterGuideAuthors['T8'][characterName]
              ? [...navData, { displayName: 'Guide', link: '../guide' }]
              : navData
          }
        ></Nav>
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
              numMovesToPractice={numMovesToPractice}
              startFromMoveNum={startFromMoveNumber}
              handleStartFromMoveNumChange={handleStartFromMoveNumChange}
              handleNumMovesToPracticeChange={handleNumMovesToPracticeChange}
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
              showCharName={showCharName}
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
  numMovesToPractice: number | undefined
  startFromMoveNum: number | undefined
  handleStartFromMoveNumChange: (e: ChangeEvent<HTMLInputElement>) => void
  handleNumMovesToPracticeChange: (e: ChangeEvent<HTMLInputElement>) => void
  numUnseen: number
  numCorrect: number
  numWrong: number
  numIngnored: number
}
const StartPage = ({
  onStart,
  numMovesToPractice,
  startFromMoveNum,
  handleStartFromMoveNumChange,
  handleNumMovesToPracticeChange,
  numCorrect,
  numIngnored,
  numUnseen,
  numWrong,
  onResetState,
}: StartPageProps) => {
  const totalMoves = numCorrect + numUnseen + numWrong

  return (
    <div className="flex flex-col items-center">
      <Button onClick={onStart} className="m-4 text-xl">
        Start
      </Button>
      <TaskProgress
        className="self-stretch"
        numCompleted={numCorrect}
        total={totalMoves}
      />
      <div className="prose prose-invert mt-8">
        <h3>How it works</h3>
        <p>
          A flash card shows a move on the front side. Your job is to guess a
          property of the move, for example how many frames it is on block. Then
          you flip the card and check if your guess was correct. Cards marked as
          "Wrong" will be shown again sooner than cards marked as "Correct".
          Card marked as "Ignore" will never be shown again.
        </p>

        <div className="mb-4 grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="num-moves">
            Number of moves to practice (1 - {totalMoves})
          </Label>
          <Input
            type="string"
            id="num-moves"
            value={numMovesToPractice}
            placeholder={totalMoves.toString()}
            onChange={handleNumMovesToPracticeChange}
          />
        </div>

        <div className="mb-2 grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="start-move">
            Start from move number (1 - {totalMoves - (numMovesToPractice || 0)}
            )
          </Label>
          <Input
            type="string"
            id="start-move"
            placeholder="1"
            value={startFromMoveNum}
            onChange={handleStartFromMoveNumChange}
          />
        </div>

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

      <Button onClick={onStart} className="mt-4 text-xl">
        Start
      </Button>
      <Button className="m-4" onClick={onResetState} variant="secondary">
        Reset state
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
  showCharName: boolean
}
const FlashCardGame = ({
  onAnswer,
  moveToShow,
  numCorrect,
  numUnseen,
  numWrong,
  showCharName,
}: FlashCardGameProps) => {
  const [flipped, setFlipped] = useState(false)
  const [autoPlay, setAutoPlay] = useState(false)
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
            'grid rounded-2xl border-[1.5px] border-foreground/50 transition-all duration-500 [transform-style:preserve-3d]',
            flipped && '[transform:rotateY(180deg)]',
          )}
        >
          <div className="col-start-1 row-start-1 [backface-visibility:hidden] [transform:rotateY(0deg)]">
            <FlashCardFront
              move={moveToShow}
              showCharName={showCharName}
              autoPlay={autoPlay}
              onFlip={() => setFlipped(true)}
            />
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
      <div className="flex items-center gap-4">
        <div>Auto play</div>
        <Switch checked={autoPlay} onCheckedChange={setAutoPlay} />
      </div>
    </>
  )
}
