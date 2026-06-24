import { ArrowLeft } from 'lucide-react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  type MetaFunction,
  useBlocker,
  useNavigate,
  useRouteLoaderData,
  useSearchParams,
} from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentContainer } from '~/components/ContentContainer';
import { MoveFilterDialog } from '~/components/MoveFilterDialog';
import { characterInfoT8List } from '~/constants/characterInfoListT8';
import { filterKey } from '~/constants/filterConstants';
import { QuizCharacterFilter } from '~/features/frameQuiz/components/QuizCharacterFilter';
import {
  type QuizModifier,
  QuizModifierControls,
  type QuizModifiers,
} from '~/features/frameQuiz/components/QuizModifierControls';
import { QuizQuestionCard } from '~/features/frameQuiz/components/QuizQuestionCard';
import {
  type MoveRange,
  QuizRangeSelection,
} from '~/features/frameQuiz/components/QuizRangeSelection';
import { answerLabelByBucket } from '~/features/frameQuiz/constants';
import {
  getAnswerBucket,
  getCharacterDisplayName,
  getEligibleQuizMoves,
} from '~/features/frameQuiz/moveSelection';
import {
  charQuizStatsStore,
  clearCharData,
  computeNextStats,
  defaultPersistedFrameQuizStats,
  type PersistedFrameQuizStats,
  quizStatsStore,
  RECENT_ANSWER_WINDOW,
  updateCharData,
} from '~/features/frameQuiz/quizStats';
import {
  appendRecentQuestionId,
  takeQuestionFromBag,
} from '~/features/frameQuiz/random';
import { getFrameQuizRankForStreak } from '~/features/frameQuiz/streakRank';
import {
  type AnswerBucket,
  type QuestionFeedback,
  type QuizMove,
} from '~/features/frameQuiz/types';
import { getFilterFromParams, isFilterValueActive } from '~/utils/filterUtils';
import { filterMoves } from '~/utils/frameDataUtils';
import { generateMetaTags } from '~/utils/seoUtils';
import { type LoaderData } from './_mainLayout.t8_._allFrameData';

const RECENT_QUESTION_WINDOW = 20;

type PendingAdvance = {
  nextQuestion: QuizMove | null;
  recentQuestionIds: string[];
  questionBag: QuizMove[];
  questionBagCursor: number;
};

export const meta: MetaFunction = ({ matches, location }) => {
  const searchParams = new URLSearchParams(location.search);
  const moveFilter = getFilterFromParams(searchParams);
  const character = moveFilter.character;
  const singleCharacterName =
    character?.length === 1 ? getCharacterDisplayName(character[0]) : null;
  const title = singleCharacterName
    ? `${singleCharacterName} Endless Frame Quiz | TekkenDocs`
    : 'Tekken 8 Endless Frame Quiz | TekkenDocs';

  return generateMetaTags({
    matches,
    title,
    description:
      'Endless frame data quiz. Guess the block frame and see how many you can get right in a row!',
    image: { url: '/t8/pages/framequiz.png' },
    url: '/t8/framequiz',
  });
};

export default function FrameQuiz() {
  const { moves } = useRouteLoaderData<LoaderData>(
    'routes/_mainLayout.t8_._allFrameData',
  ) || { moves: [] };

  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [consecutiveCorrectStreak, setConsecutiveCorrectStreak] = useState(0);
  const [displayedStreak, setDisplayedStreak] = useState(0);
  const [recentQuestionIds, setRecentQuestionIds] = useState<string[]>([]);
  const [questionBag, setQuestionBag] = useState<QuizMove[]>([]);
  const [questionBagCursor, setQuestionBagCursor] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<QuizMove | null>(null);
  const [questionFeedback, setQuestionFeedback] =
    useState<QuestionFeedback | null>(null);
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
  const feedbackAnimationFrameRef = useRef<number | null>(null);
  const [pendingAdvance, setPendingAdvance] = useState<PendingAdvance | null>(
    null,
  );
  const storedStats = useSyncExternalStore(
    quizStatsStore.subscribe,
    quizStatsStore.getSnapshot,
    quizStatsStore.getServerSnapshot,
  );
  const [sessionStats, setSessionStats] = useState<PersistedFrameQuizStats>(
    defaultPersistedFrameQuizStats,
  );
  const persistedCharStats = useSyncExternalStore(
    charQuizStatsStore.subscribe,
    charQuizStatsStore.getSnapshot,
    charQuizStatsStore.getServerSnapshot,
  );
  const [activeModifiers, setActiveModifiers] = useState<QuizModifiers>({
    hideCommand: false,
    hideVideo: false,
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  // A `started` param present on mount is a stale reload of an in-progress
  // quiz (React state is gone). Treat it as "not started" so we render the
  // start screen directly instead of flashing the loading card, and strip the
  // param below. The ref is cleared once consumed so a later "Start quiz"
  // (which re-adds the param) still registers as started.
  const startedOnMount = useRef(searchParams.has('started'));
  const hasStarted = searchParams.has('started') && !startedOnMount.current;

  const moveFilter = useMemo(
    () => getFilterFromParams(searchParams),
    [searchParams],
  );

  const hasActiveFilter = useMemo(
    () => Object.values(moveFilter).some(isFilterValueActive),
    [moveFilter],
  );

  const pendingModifiers = useMemo(
    (): QuizModifiers => ({
      hideCommand: searchParams.has('hideCommand'),
      hideVideo: searchParams.has('hideVideo'),
    }),
    [searchParams],
  );

  const quizContextLabel = useMemo((): string | null => {
    const { character, ...otherFilters } = moveFilter;
    const hasCharacterFilter = isFilterValueActive(character);
    const hasOtherFilters =
      Object.values(otherFilters).some(isFilterValueActive);

    if (!hasCharacterFilter && !hasOtherFilters) {
      return null;
    }

    const singleCharacterName =
      character?.length === 1 ? getCharacterDisplayName(character[0]) : null;

    if (singleCharacterName && hasOtherFilters)
      return `${singleCharacterName} - Custom filter`;
    if (singleCharacterName) return singleCharacterName;
    return 'Custom filter';
  }, [moveFilter]);

  const characterFilteredMoves = useMemo(() => {
    if (!isFilterValueActive(moveFilter.character)) return moves;
    return filterMoves(moves, { character: moveFilter.character });
  }, [moves, moveFilter.character]);

  const eligibleMoves = useMemo(
    () =>
      getEligibleQuizMoves(
        hasActiveFilter ? filterMoves(moves, moveFilter) : moves,
      ),
    [moves, moveFilter, hasActiveFilter],
  );

  const [prevEligibleMovesLength, setPrevEligibleMovesLength] = useState(
    eligibleMoves.length,
  );

  const selectedMoveRange = useMemo((): MoveRange | null => {
    const startMove = Number(searchParams.get('startMove'));
    const numMoves = Number(searchParams.get('numMoves'));
    if (!startMove || !numMoves) return null;
    return { start: startMove, end: startMove + numMoves - 1 };
  }, [searchParams]);

  const rangedEligibleMoves = useMemo(() => {
    if (!selectedMoveRange) return eligibleMoves;
    return eligibleMoves.slice(
      selectedMoveRange.start - 1,
      selectedMoveRange.end,
    );
  }, [eligibleMoves, selectedMoveRange]);

  const singleCharacterId = useMemo(() => {
    const { character, ...otherFilters } = moveFilter;
    const hasOtherFilters =
      Object.values(otherFilters).some(isFilterValueActive) ||
      !!selectedMoveRange;
    return character?.length === 1 && !hasOtherFilters ? character[0] : null;
  }, [moveFilter, selectedMoveRange]);

  // Persist stats whenever there is no filter (global stats) or exactly one
  // character is selected (per-character stats). Any other filter combination
  // is session-only. The store/key is then chosen by `singleCharacterId`.
  const persistToStorage = !hasActiveFilter || !!singleCharacterId;

  const singleCharacterName = singleCharacterId
    ? getCharacterDisplayName(singleCharacterId)
    : null;

  // When practicing a single character, surface that character's persisted
  // stats. Otherwise use the global persisted stats, or session-only stats
  // when a non-character filter is active.
  const persistedStats = singleCharacterId
    ? (persistedCharStats.normal?.[singleCharacterId] ??
      defaultPersistedFrameQuizStats)
    : persistToStorage
      ? storedStats
      : sessionStats;

  const handleRangeChange = (range: MoveRange | null) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('startMove');
        next.delete('numMoves');
        if (range) {
          next.set('startMove', String(range.start));
          next.set('numMoves', String(range.end - range.start + 1));
        }
        return next;
      },
      { replace: true, preventScrollReset: true },
    );
  };

  const movePageBlocker = useBlocker(({ currentLocation, nextLocation }) => {
    return hasStarted && nextLocation.pathname !== currentLocation.pathname;
  });

  useEffect(() => {
    return () => {
      if (feedbackAnimationFrameRef.current !== null) {
        cancelAnimationFrame(feedbackAnimationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (startedOnMount.current) {
      startedOnMount.current = false;
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('started');
          return next;
        },
        { replace: true, preventScrollReset: true },
      );
    }
  }, [setSearchParams]);

  useEffect(() => {
    if (!questionFeedback) {
      setIsFeedbackVisible(false);
      return;
    }

    setIsFeedbackVisible(false);
    feedbackAnimationFrameRef.current = requestAnimationFrame(() => {
      setIsFeedbackVisible(true);
      feedbackAnimationFrameRef.current = null;
    });

    return () => {
      if (feedbackAnimationFrameRef.current !== null) {
        cancelAnimationFrame(feedbackAnimationFrameRef.current);
        feedbackAnimationFrameRef.current = null;
      }
    };
  }, [questionFeedback]);

  useEffect(() => {
    if (movePageBlocker.state !== 'blocked') {
      return;
    }

    const shouldProceed = window.confirm(
      'You are in an active quiz. Do you want to leave the quiz?',
    );

    if (shouldProceed) {
      movePageBlocker.proceed();
      return;
    }

    movePageBlocker.reset();
  }, [movePageBlocker.state, movePageBlocker.proceed, movePageBlocker.reset]);

  useEffect(() => {
    if (prevEligibleMovesLength === eligibleMoves.length) return;
    setPrevEligibleMovesLength(eligibleMoves.length);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('startMove');
        next.delete('numMoves');
        return next;
      },
      { replace: true, preventScrollReset: true },
    );
  }, [eligibleMoves.length, prevEligibleMovesLength, setSearchParams]);

  const selectedCharacters = moveFilter.character ?? [];

  const handleCharacterSelectionChange = (characters: string[]) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete(filterKey.Character);
        characters.forEach((id) => {
          next.append(filterKey.Character, id);
        });
        return next;
      },
      { replace: true, preventScrollReset: true },
    );
  };

  const handleToggleModifier = (modifier: QuizModifier) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (next.has(modifier)) {
          next.delete(modifier);
        } else {
          const other: QuizModifier =
            modifier === 'hideCommand' ? 'hideVideo' : 'hideCommand';
          next.delete(other);
          next.set(modifier, '');
        }
        return next;
      },
      { replace: true, preventScrollReset: true },
    );
  };

  const handleStart = () => {
    const {
      question: firstQuestion,
      questionBag: nextQuestionBag,
      questionBagCursor: nextQuestionBagCursor,
    } = takeQuestionFromBag([], 0, rangedEligibleMoves, []);
    setScore(0);
    setTotalAnswered(0);
    setConsecutiveCorrectStreak(0);
    setDisplayedStreak(0);
    setRecentQuestionIds([]);
    setQuestionBag(nextQuestionBag);
    setQuestionBagCursor(nextQuestionBagCursor);
    setQuestionFeedback(null);
    setIsFeedbackVisible(false);
    setPendingAdvance(null);
    setCurrentQuestion(firstQuestion);
    setActiveModifiers(pendingModifiers);
    setSessionStats(defaultPersistedFrameQuizStats);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('started', '');
      return next;
    });
  };

  const handleAnswer = (selectedBucket: AnswerBucket) => {
    if (!currentQuestion || questionFeedback) {
      return;
    }

    const correctBucket = getAnswerBucket(currentQuestion.blockValue);
    const isCorrect = selectedBucket === correctBucket;
    const nextScore = score + (isCorrect ? 1 : 0);
    const nextTotalAnswered = totalAnswered + 1;
    const nextConsecutiveCorrectStreak = isCorrect
      ? consecutiveCorrectStreak + 1
      : 0;
    const recentWindowSize = Math.max(
      1,
      Math.min(RECENT_QUESTION_WINDOW, rangedEligibleMoves.length - 1),
    );
    const nextRecentQuestionIds = appendRecentQuestionId(
      recentQuestionIds,
      currentQuestion.id,
      recentWindowSize,
    );
    const sourceQuestionBag = isCorrect ? questionBag : [];
    const sourceQuestionBagCursor = isCorrect ? questionBagCursor : 0;
    const {
      question: nextQuestion,
      questionBag: nextQuestionBag,
      questionBagCursor: nextQuestionBagCursor,
    } = takeQuestionFromBag(
      sourceQuestionBag,
      sourceQuestionBagCursor,
      rangedEligibleMoves,
      nextRecentQuestionIds,
    );

    setScore(nextScore);
    setTotalAnswered(nextTotalAnswered);
    setConsecutiveCorrectStreak(nextConsecutiveCorrectStreak);
    setDisplayedStreak(
      isCorrect ? nextConsecutiveCorrectStreak : consecutiveCorrectStreak,
    );

    if (persistToStorage) {
      if (singleCharacterId) {
        charQuizStatsStore.write(
          updateCharData(
            persistedCharStats,
            singleCharacterId,
            isCorrect,
            nextConsecutiveCorrectStreak,
          ),
        );
      } else {
        quizStatsStore.write(
          computeNextStats(
            storedStats,
            isCorrect,
            nextConsecutiveCorrectStreak,
          ),
        );
      }
    } else {
      setSessionStats((current) =>
        computeNextStats(current, isCorrect, nextConsecutiveCorrectStreak),
      );
    }

    setPendingAdvance({
      nextQuestion,
      recentQuestionIds: nextRecentQuestionIds,
      questionBag: nextQuestionBag,
      questionBagCursor: nextQuestionBagCursor,
    });
    setQuestionFeedback({
      isCorrect,
      selectedLabel: answerLabelByBucket[selectedBucket],
      correctBlockValue: currentQuestion.move.block,
    });
  };

  const handleContinueAfterFeedback = () => {
    if (!questionFeedback || !pendingAdvance) {
      return;
    }

    setRecentQuestionIds(pendingAdvance.recentQuestionIds);
    setCurrentQuestion(pendingAdvance.nextQuestion);
    setQuestionBag(pendingAdvance.questionBag);
    setQuestionBagCursor(pendingAdvance.questionBagCursor);
    setQuestionFeedback(null);
    setDisplayedStreak(consecutiveCorrectStreak);
    setPendingAdvance(null);
  };

  const handleResetPersistedStats = () => {
    if (singleCharacterId) {
      charQuizStatsStore.write(
        clearCharData(persistedCharStats, singleCharacterId),
      );
      return;
    }
    quizStatsStore.clear();
  };

  const currentSessionAccuracyPercent =
    totalAnswered === 0 ? 0 : Math.round((score / totalAnswered) * 100);
  const recentCorrectCount = persistedStats.recentAnswerResults.reduce(
    (count, isCorrect) => count + (isCorrect ? 1 : 0),
    0,
  );
  const recentAnswerCount = persistedStats.recentAnswerResults.length;
  const recentAccuracyPercent =
    recentAnswerCount === 0
      ? 0
      : Math.round((recentCorrectCount / recentAnswerCount) * 100);
  const recentAccuracyBarWidth = recentAccuracyPercent;
  const recentAccuracyBarColorClass =
    recentAccuracyPercent >= 80
      ? 'bg-emerald-500/80'
      : recentAccuracyPercent >= 65
        ? 'bg-orange-500/80'
        : 'bg-red-500/80';
  const personalBestRank = getFrameQuizRankForStreak(
    persistedStats.personalBestStreak,
  );

  const characterRankImages = useMemo(() => {
    const result: Record<string, string> = {};
    for (const { id: charId } of characterInfoT8List) {
      const streak =
        persistedCharStats.normal?.[charId]?.personalBestStreak ?? 0;
      result[charId] = getFrameQuizRankForStreak(streak).image;
    }
    return result;
  }, [persistedCharStats]);

  if (eligibleMoves.length === 0) {
    return (
      <ContentContainer enableBottomPadding enableTopPadding>
        <h1 className="my-4 text-2xl">Frame quiz</h1>
        <p>
          There are not enough valid Mokujin moves with video and parseable
          block frames to start the endless quiz right now.
        </p>
      </ContentContainer>
    );
  }

  return (
    <ContentContainer
      enableBottomPadding
      enableTopPadding
      className="max-w-4xl"
    >
      <div className="relative mb-2 mt-2 flex items-center justify-center">
        {hasStarted && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 text-primary"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-center text-2xl font-semibold tracking-tight">
          Endless Frame Quiz
        </h1>
      </div>
      {quizContextLabel && (
        <p className="mb-2 text-center text-sm text-muted-foreground">
          {quizContextLabel}
        </p>
      )}

      {!hasStarted && (
        <Card className="mx-auto w-full max-w-2xl border-border/70 shadow-sm">
          <CardHeader className="p-3 sm:p-6">
            <CardTitle>Endless frame quiz</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <p className="mb-4">
              Guess how many frames each move is on block. This mode is endless
              and keeps going until you stop. See how many you can get right in
              a row and try to climb the ranks!
            </p>
            <p className="mb-4 text-sm text-muted-foreground">
              Want to focus on a specific character, a subset of moves, or apply
              a custom filter? Use the options below before starting.
            </p>
            <Button className="mb-4" onClick={handleStart}>
              Start quiz
            </Button>
            <QuizModifierControls
              modifiers={pendingModifiers}
              onToggle={handleToggleModifier}
            />
            <QuizCharacterFilter
              selectedCharacters={selectedCharacters}
              onSelectionChange={handleCharacterSelectionChange}
              characterRankImages={characterRankImages}
            />
            {selectedCharacters.length === 1 && (
              <QuizRangeSelection
                eligibleMoveCount={eligibleMoves.length}
                selectedRange={selectedMoveRange}
                onRangeChange={handleRangeChange}
              />
            )}
            <div className="mt-6 border-t border-border/60 pt-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Custom Filters
              </p>
              <MoveFilterDialog
                triggerVariant="soft"
                moveFilter={moveFilter}
                moves={characterFilteredMoves}
              />
            </div>
            <Button className="mt-6" onClick={handleStart}>
              Start quiz
            </Button>
          </CardContent>
        </Card>
      )}

      {hasStarted && !currentQuestion && (
        <Card className="mx-auto w-full max-w-2xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Loading quiz...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please wait while frame data finishes loading.</p>
          </CardContent>
        </Card>
      )}

      {hasStarted && currentQuestion && (
        <div className="space-y-4">
          <QuizQuestionCard
            question={currentQuestion}
            modifiers={activeModifiers}
            questionFeedback={questionFeedback}
            isFeedbackVisible={isFeedbackVisible}
            displayedStreak={displayedStreak}
            sourceMoves={moves}
            onAnswer={handleAnswer}
            onContinue={handleContinueAfterFeedback}
          />
          <Card className="mx-auto w-full max-w-2xl border-border/70 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quiz performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border/60 bg-muted/25 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Current session
                  </p>
                  <p className="mt-1 text-lg font-semibold tabular-nums">
                    {currentSessionAccuracyPercent}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Accuracy {score}/{totalAnswered}
                  </p>
                </div>

                <div className="rounded-lg border border-border/60 bg-muted/25 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Last {RECENT_ANSWER_WINDOW} questions
                  </p>
                  <p className="mt-1 text-lg font-semibold tabular-nums">
                    {recentAccuracyPercent}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Correct {recentCorrectCount}/{recentAnswerCount}
                  </p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-[width] duration-300 ${recentAccuracyBarColorClass}`}
                      style={{ width: `${recentAccuracyBarWidth}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-border/60 bg-muted/25 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Questions answered total
                  </p>
                  <p className="mt-1 text-lg font-semibold tabular-nums">
                    {persistedStats.lifetimeAnsweredCount}
                  </p>
                </div>

                <div className="rounded-lg border border-border/60 bg-muted/25 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Personal best streak
                  </p>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <p className="text-lg font-semibold tabular-nums">
                      {persistedStats.personalBestStreak}
                    </p>
                    {personalBestRank.image && (
                      <img
                        src={personalBestRank.image}
                        className="h-11 w-auto"
                        alt={`${personalBestRank.name} rank for personal best streak ${persistedStats.personalBestStreak}`}
                      />
                    )}
                  </div>
                </div>
              </div>

              {persistToStorage && (
                <div className="border-t border-border/60 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResetPersistedStats}
                    className="h-auto px-0 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {singleCharacterName
                      ? `Reset ${singleCharacterName} stats`
                      : 'Reset saved stats'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </ContentContainer>
  );
}
