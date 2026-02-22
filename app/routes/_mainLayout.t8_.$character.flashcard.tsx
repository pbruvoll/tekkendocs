import { Heading } from '@radix-ui/themes';
import { type ChangeEvent, useId, useMemo, useState } from 'react';
import { type MetaFunction, useSearchParams } from 'react-router';
import invariant from 'tiny-invariant';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ContentContainer } from '~/components/ContentContainer';
import { FrameDataFilterDialog } from '~/components/FrameDataFilterDialog';
import Nav, { type NavLinkInfo } from '~/components/Nav';
import { TaskProgress } from '~/components/TaskProgress';
import { AnimatedCollapsible } from '~/features/flashCards/AnimatedCollapsible';
import {
  FlashCardAnswer,
  type FlashCardAnswerType,
} from '~/features/flashCards/FlashCardAnswer';
import { FlashCardDeck } from '~/features/flashCards/FlashCardDeck';
import { FlipCard } from '~/features/flashCards/FlipCard';
import { FlashCardBack } from '~/features/flashCards/flashCardBack';
import { FlashCardFront } from '~/features/flashCards/flashCardFront';
import { useFlashCardAppState } from '~/features/flashCards/useFlashCardAppState';
import { useFrameData } from '~/hooks/useFrameData';
import { characterGuideAuthors } from '~/services/staticDataService';
import { type CharacterFrameData } from '~/types/CharacterFrameData';
import { type Move } from '~/types/Move';
import { type MoveFilter } from '~/types/MoveFilter';
import { type RouteHandle } from '~/types/RouteHandle';
import { type SearchParamsChanges } from '~/types/SearchParamsChanges';
import { getFilterFromParams } from '~/utils/filterUtils';
import { filterMoves, getMoveFilterTypes } from '~/utils/frameDataUtils';
import { getCacheControlHeaders } from '~/utils/headerUtils';
import * as filterUtils from '~/utils/searchParamsFilterUtils';
import { generateMetaTags } from '~/utils/seoUtils';
import { t8AvatarMap } from '~/utils/t8AvatarMap';

const navData: NavLinkInfo[] = [
  { link: '../', displayName: 'Frame data' },
  { link: '../meta', displayName: 'Cheat sheet' },
  { link: '../antistrat', displayName: 'Anti strats' },
  { link: '', displayName: 'Flash card' },
];

export const headers = () => getCacheControlHeaders({ seconds: 60 * 5 });

export const meta: MetaFunction = ({ params, matches }) => {
  const frameData = matches.find(
    (m) => (m.handle as RouteHandle)?.type === 'frameData',
  )?.loaderData;
  if (!frameData) {
    return [
      {
        title: 'TekkenDocs - Uknown character',
      },
      {
        description: `There is no character with the ID of ${params.character}.`,
      },
    ];
  }
  const { characterName } = frameData as CharacterFrameData;
  const characterId = characterName.toLocaleLowerCase();
  const characterTitle =
    characterName[0].toUpperCase() + characterName.substring(1);
  const title = `${characterTitle} Tekken 8 Flash Cards | TekkenDocs`;
  const description = `Flashcards for ${characterTitle} in Tekken 8.`;

  return generateMetaTags({
    matches,
    title,
    description,
    image: { url: `/t8/avatars/${characterId}-512.png` },
    url: `/t8/${characterId}/flashcard`,
  });
};

export default function FlashCard() {
  const [moveToShow, setMoveToShow] = useState<Move | undefined>();
  const { characterName, moves } = useFrameData();
  const showCharName = characterName === 'mokujin';
  const allViableMoves = useMemo(
    () => moves.filter((move) => Boolean(move.block)),
    [moves],
  );

  const [searchParams, setSearchParams] = useSearchParams();

  const moveFilter = useMemo(
    () => getFilterFromParams(searchParams),
    [searchParams],
  );

  const moveFilterTypes = useMemo(
    () => getMoveFilterTypes(allViableMoves),
    [allViableMoves],
  );

  const viableMoves = useMemo(
    () => filterMoves(allViableMoves, moveFilter),
    [allViableMoves, moveFilter],
  );
  const numViableMoves = viableMoves.length;

  const [numMovesToPractice, setNumMovesToPractice] = useState<
    number | undefined
  >(undefined);
  const [startFromMoveNumber, setStartFromMoveNumber] = useState<
    number | undefined
  >(undefined);

  const handleStartFromMoveNumChange = (e: ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    setStartFromMoveNumber(num ? num : undefined);
  };

  const handleNumMovesToPracticeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    setNumMovesToPractice(num ? num : undefined);
  };

  const [flashCardAppState, setFlashCardAppState] = useFlashCardAppState();
  const charFlashCardState = useMemo(
    () =>
      flashCardAppState[characterName] || {
        [FlashCardAnswer.Correct]: [],
        [FlashCardAnswer.Wrong]: [],
        [FlashCardAnswer.Ignored]: [],
      },
    [characterName, flashCardAppState],
  );

  const unseenMoves = useMemo(() => {
    return viableMoves
      .filter(
        (m) =>
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
      .map((m) => (showCharName ? m.wavuId : m.command));
  }, [
    charFlashCardState.correct,
    charFlashCardState.ignored,
    charFlashCardState.wrong,
    showCharName,
    viableMoves,
  ]);

  const viableMovesSubSet = useMemo(() => {
    if (!numMovesToPractice && !startFromMoveNumber) {
      return viableMoves;
    }
    const startIndex = Math.max(0, startFromMoveNumber || 0 - 1);
    return viableMoves.slice(
      startIndex,
      startIndex + (numMovesToPractice || viableMoves.length),
    );
  }, [numMovesToPractice, startFromMoveNumber, viableMoves]);

  const charFlashCardStateSubSet = useMemo(() => {
    return {
      [FlashCardAnswer.Correct]: charFlashCardState.correct.filter((c) =>
        viableMovesSubSet.some((m) =>
          showCharName ? m.wavuId === c : m.command === c,
        ),
      ),
      [FlashCardAnswer.Wrong]: charFlashCardState.wrong.filter((c) =>
        viableMovesSubSet.some((m) =>
          showCharName ? m.wavuId === c : m.command === c,
        ),
      ),
      [FlashCardAnswer.Ignored]: charFlashCardState.ignored.filter((c) =>
        viableMovesSubSet.some((m) =>
          showCharName ? m.wavuId === c : m.command === c,
        ),
      ),
    };
  }, [
    charFlashCardState.correct,
    charFlashCardState.ignored,
    charFlashCardState.wrong,
    showCharName,
    viableMovesSubSet,
  ]);

  const unseenMovesSubSet = useMemo(() => {
    return unseenMoves.filter((c) =>
      viableMovesSubSet.some((m) =>
        showCharName ? m.wavuId === c : m.command === c,
      ),
    );
  }, [showCharName, unseenMoves, viableMovesSubSet]);

  const findAndSetMoveToShow = () => {
    let command = '';
    const numWrong = charFlashCardStateSubSet.wrong.length;
    const numCorrect = charFlashCardStateSubSet.correct.length;
    const numUnseen = unseenMovesSubSet.length;
    if (numWrong >= 7 || (numWrong > 0 && numUnseen === 0)) {
      command =
        charFlashCardStateSubSet.wrong[Math.floor(Math.random() * numWrong)];
    } else if (numUnseen > 0) {
      const index = Math.floor(Math.random() * numUnseen);
      command = unseenMovesSubSet[index]!;
    } else if (numCorrect > 0) {
      command =
        charFlashCardStateSubSet.correct[
          Math.floor(Math.random() * numCorrect)
        ];
    }
    setMoveToShow(
      viableMovesSubSet.find((m) =>
        showCharName ? m.wavuId === command : m.command === command,
      ),
    );
  };

  const handleAnswer = (answer: FlashCardAnswerType) => {
    invariant(moveToShow);
    const newCharFlashCardState = {
      [FlashCardAnswer.Correct]: charFlashCardState.correct.filter((c) =>
        showCharName ? c !== moveToShow.wavuId : c !== moveToShow.command,
      ),
      [FlashCardAnswer.Wrong]: charFlashCardState.wrong.filter((c) =>
        showCharName ? c !== moveToShow.wavuId : c !== moveToShow.command,
      ),
      [FlashCardAnswer.Ignored]: charFlashCardState.ignored.filter((c) =>
        showCharName ? c !== moveToShow.wavuId : c !== moveToShow.command,
      ),
    };
    if (answer === 'correct') {
      newCharFlashCardState.correct = [
        ...newCharFlashCardState.correct,
        showCharName ? moveToShow.wavuId! : moveToShow.command,
      ];
    } else if (answer === 'ignored') {
      newCharFlashCardState.ignored = [
        ...newCharFlashCardState.ignored,
        showCharName ? moveToShow.wavuId! : moveToShow.command,
      ];
    } else if (answer === 'wrong') {
      newCharFlashCardState.wrong = [
        ...newCharFlashCardState.wrong,
        showCharName ? moveToShow.wavuId! : moveToShow.command,
      ];
    }
    setFlashCardAppState({
      ...flashCardAppState,
      [characterName]: newCharFlashCardState,
    });
    findAndSetMoveToShow();
  };

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
        </div>

        <Nav
          navData={
            characterGuideAuthors.T8[characterName]
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
        <div className="w-full max-w-96 px-2">
          <h1 className="sr-only">Flash cards</h1>
          {numViableMoves === 0 ? (
            <div>No moves available for {characterName}</div>
          ) : !moveToShow ? (
            <StartPage
              characterName={characterName}
              onStart={() => findAndSetMoveToShow()}
              numUnseen={unseenMoves.length}
              numCorrect={charFlashCardState.correct.length}
              numWrong={charFlashCardState.wrong.length}
              numIngnored={charFlashCardState.ignored.length}
              numMovesToPractice={numMovesToPractice}
              startFromMoveNum={startFromMoveNumber}
              handleStartFromMoveNumChange={handleStartFromMoveNumChange}
              handleNumMovesToPracticeChange={handleNumMovesToPracticeChange}
              filter={moveFilter}
              setFilterValue={(key, value) =>
                filterUtils.setFilterValue(setSearchParams, key, value)
              }
              removeFilterValue={(key) =>
                filterUtils.removeFilterValue(setSearchParams, key)
              }
              updateFilterValues={(changes) =>
                filterUtils.updateFilterValues(setSearchParams, changes)
              }
              addFilterElement={(key, element) =>
                filterUtils.addFilterElement(setSearchParams, key, element)
              }
              removeFilterElement={(key, element) =>
                filterUtils.removeFilterElement(setSearchParams, key, element)
              }
              stances={moveFilterTypes.stances}
              states={moveFilterTypes.states}
              transitions={moveFilterTypes.transitions}
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
  );
}

type StartPageProps = {
  characterName: string;
  onStart: () => void;
  onResetState: () => void;
  numMovesToPractice: number | undefined;
  startFromMoveNum: number | undefined;
  handleStartFromMoveNumChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleNumMovesToPracticeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  numUnseen: number;
  numCorrect: number;
  numWrong: number;
  numIngnored: number;
  filter: MoveFilter;
  setFilterValue: (key: string, value: string) => void;
  removeFilterValue: (key: string) => void;
  updateFilterValues: (changes: SearchParamsChanges) => void;
  addFilterElement: (key: string, element: string) => void;
  removeFilterElement: (key: string, element: string) => void;
  stances: string[];
  states: string[];
  transitions: string[];
};
const StartPage = ({
  characterName,
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
  filter,
  setFilterValue,
  removeFilterValue,
  updateFilterValues,
  addFilterElement,
  removeFilterElement,
  stances,
  states,
  transitions,
}: StartPageProps) => {
  const totalMoves = numCorrect + numUnseen + numWrong;
  const numMovesId = useId();
  const startFromMoveId = useId();

  return (
    <div className="flex flex-col items-center">
      <Card className="w-full max-w-96">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Flash Cards</CardTitle>
          <CardDescription>
            Test your knowledge of{' '}
            <span className="capitalize">{characterName}</span>'s frame data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onStart} className="w-full text-lg mb-2" size="lg">
            Start Practice
          </Button>

          <AnimatedCollapsible title="How it works">
            <p className="text-sm text-muted-foreground">
              Guess a property of the move shown (e.g. frames on block), then
              flip to check. "Wrong" cards appear more often. "Ignore" hides
              cards permanently.
            </p>
          </AnimatedCollapsible>

          <TaskProgress numCompleted={numCorrect} total={totalMoves} />

          <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
            <h4 className="font-medium">Current Progress</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Unseen:</span>
              <span className="font-medium">{numUnseen}</span>
              <span className="text-muted-foreground">Correct:</span>
              <span className="font-medium text-foreground-success">
                {numCorrect}
              </span>
              <span className="text-muted-foreground">Wrong:</span>
              <span className="font-medium text-foreground-destructive">
                {numWrong}
              </span>
              <span className="text-muted-foreground">Ignored:</span>
              <span className="font-medium">{numIngnored}</span>
            </div>
          </div>

          <AnimatedCollapsible
            title="Advanced Settings"
            className="my-2"
            defaultOpen
          >
            <FrameDataFilterDialog
              filter={filter}
              stances={stances}
              states={states}
              transitions={transitions}
              setFilterValue={setFilterValue}
              removeFilterValue={removeFilterValue}
              updateFilterValues={updateFilterValues}
              addFilterElement={addFilterElement}
              removeFilterElement={removeFilterElement}
            />

            <div className="space-y-2 mt-2">
              <Label htmlFor={numMovesId} className="text-sm">
                Number of moves to practice (1 - {totalMoves})
              </Label>
              <Input
                type="string"
                id={numMovesId}
                value={numMovesToPractice}
                placeholder={totalMoves.toString()}
                onChange={handleNumMovesToPracticeChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={startFromMoveId} className="text-sm">
                Start from move # (1 - {totalMoves - (numMovesToPractice || 0)})
              </Label>
              <Input
                type="string"
                id={startFromMoveId}
                placeholder="1"
                value={startFromMoveNum}
                onChange={handleStartFromMoveNumChange}
              />
            </div>
          </AnimatedCollapsible>

          <Button
            onClick={onResetState}
            variant="outline"
            className="w-full"
            size="sm"
          >
            Reset Progress
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export type FlashCardGameProps = {
  onAnswer: (flashCardAnswer: FlashCardAnswerType) => void;
  moveToShow: Move;
  numUnseen: number;
  numCorrect: number;
  numWrong: number;
  showCharName: boolean;
};
const FlashCardGame = ({
  onAnswer,
  moveToShow,
  numCorrect,
  numUnseen,
  numWrong,
  showCharName,
}: FlashCardGameProps) => {
  const [flipped, setFlipped] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const handleAnswer = (answer: FlashCardAnswerType) => {
    setFlipped(false);
    onAnswer(answer);
  };

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <FlashCardDeck cardKey={moveToShow.command}>
        <FlipCard
          flipped={flipped}
          className="h-full w-full"
          front={
            <FlashCardFront
              move={moveToShow}
              showCharName={showCharName}
              autoPlay={autoPlay}
              onFlip={() => setFlipped(true)}
            />
          }
          back={<FlashCardBack move={moveToShow} onAnswer={handleAnswer} />}
        />
      </FlashCardDeck>

      <TaskProgress
        className="w-full max-w-96"
        numCompleted={numCorrect}
        total={numCorrect + numUnseen + numWrong}
      />

      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">Auto play video</span>
        <Switch checked={autoPlay} onCheckedChange={setAutoPlay} />
      </div>
    </div>
  );
};
