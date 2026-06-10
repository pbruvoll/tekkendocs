import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  type MetaFunction,
  useRouteLoaderData,
  useSearchParams,
} from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedNumber } from '~/components/AnimatedNumber';
import { ContentContainer } from '~/components/ContentContainer';
import { MoveVideo } from '~/components/MoveVideo';
import { characterInfoT8List } from '~/constants/characterInfoListT8';
import { QuestionFeedbackCard } from '~/features/frameQuiz/components/QuestionFeedbackCard';
import {
  answerLabelByBucket,
  answerOptions,
} from '~/features/frameQuiz/constants';
import {
  getAnswerBucket,
  getEligibleQuizMoves,
  getMoveCharacterDisplayName,
} from '~/features/frameQuiz/moveSelection';
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
const RECENT_ANSWER_WINDOW = 200;
const FRAME_QUIZ_STATS_STORAGE_KEY = 't8FrameQuizStatsV1';

type PersistedFrameQuizStats = {
  personalBestStreak: number;
  lifetimeAnsweredCount: number;
  recentAnswerResults: boolean[];
};

type PendingAdvance = {
  nextQuestion: QuizMove | null;
  recentQuestionIds: string[];
  questionBag: QuizMove[];
  questionBagCursor: number;
};

const defaultPersistedFrameQuizStats: PersistedFrameQuizStats = {
  personalBestStreak: 0,
  lifetimeAnsweredCount: 0,
  recentAnswerResults: [],
};

const sanitizePersistedFrameQuizStats = (
  value: unknown,
): PersistedFrameQuizStats => {
  if (!value || typeof value !== 'object') {
    return defaultPersistedFrameQuizStats;
  }

  const candidate = value as Partial<PersistedFrameQuizStats>;
  const personalBestStreak = Number.isFinite(candidate.personalBestStreak)
    ? Math.max(0, Math.floor(candidate.personalBestStreak ?? 0))
    : 0;
  const lifetimeAnsweredCount = Number.isFinite(candidate.lifetimeAnsweredCount)
    ? Math.max(0, Math.floor(candidate.lifetimeAnsweredCount ?? 0))
    : 0;
  const recentAnswerResults = Array.isArray(candidate.recentAnswerResults)
    ? candidate.recentAnswerResults
        .filter((answer): answer is boolean => typeof answer === 'boolean')
        .slice(-RECENT_ANSWER_WINDOW)
    : [];

  return {
    personalBestStreak,
    lifetimeAnsweredCount,
    recentAnswerResults,
  };
};

export const meta: MetaFunction = ({ matches }) => {
  return generateMetaTags({
    matches,
    title: 'Tekken 8 Endless Frame Quiz | TekkenDocs',
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

  const [hasStarted, setHasStarted] = useState(false);
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
  const previousRankImageRef = useRef<string | null>(null);
  const [rankAnimationKey, setRankAnimationKey] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const [pendingAdvance, setPendingAdvance] = useState<PendingAdvance | null>(
    null,
  );
  const [persistedStats, setPersistedStats] = useState<PersistedFrameQuizStats>(
    defaultPersistedFrameQuizStats,
  );
  const [hasLoadedPersistedStats, setHasLoadedPersistedStats] = useState(false);

  const [searchParams] = useSearchParams();
  const moveFilter = useMemo(
    () => getFilterFromParams(searchParams),
    [searchParams],
  );

  const hasActiveFilter = useMemo(
    () => Object.values(moveFilter).some(isFilterValueActive),
    [moveFilter],
  );

  const persistToStorage = !hasActiveFilter;

  const quizContextLabel = useMemo((): string | null => {
    const { character, ...otherFilters } = moveFilter;
    const hasCharacterFilter = isFilterValueActive(character);
    const hasOtherFilters =
      Object.values(otherFilters).some(isFilterValueActive);

    if (!hasCharacterFilter && !hasOtherFilters) {
      return null;
    }

    const singleCharacterName =
      character?.length === 1
        ? (characterInfoT8List.find((c) => c.id === character[0])
            ?.displayName ?? character[0])
        : null;

    if (singleCharacterName && hasOtherFilters)
      return `${singleCharacterName} - Custom filter`;
    if (singleCharacterName) return singleCharacterName;
    return 'Custom filter';
  }, [moveFilter]);

  const eligibleMoves = useMemo(
    () =>
      getEligibleQuizMoves(
        hasActiveFilter ? filterMoves(moves, moveFilter) : moves,
      ),
    [moves, moveFilter, hasActiveFilter],
  );

  useEffect(() => {
    return () => {
      if (feedbackAnimationFrameRef.current !== null) {
        cancelAnimationFrame(feedbackAnimationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!persistToStorage) {
      setHasLoadedPersistedStats(true);
      return;
    }

    try {
      const stored = localStorage.getItem(FRAME_QUIZ_STATS_STORAGE_KEY);
      if (!stored) {
        setHasLoadedPersistedStats(true);
        return;
      }

      const parsed = JSON.parse(stored);
      setPersistedStats(sanitizePersistedFrameQuizStats(parsed));
    } catch {
      setPersistedStats(defaultPersistedFrameQuizStats);
      try {
        localStorage.removeItem(FRAME_QUIZ_STATS_STORAGE_KEY);
      } catch {
        // Ignore storage failures while recovering from corrupt data.
      }
    } finally {
      setHasLoadedPersistedStats(true);
    }
  }, [persistToStorage]);

  useEffect(() => {
    if (!hasLoadedPersistedStats || !persistToStorage) {
      return;
    }

    try {
      const isDefaultStats =
        persistedStats.personalBestStreak === 0 &&
        persistedStats.lifetimeAnsweredCount === 0 &&
        persistedStats.recentAnswerResults.length === 0;

      if (isDefaultStats) {
        localStorage.removeItem(FRAME_QUIZ_STATS_STORAGE_KEY);
        return;
      }

      localStorage.setItem(
        FRAME_QUIZ_STATS_STORAGE_KEY,
        JSON.stringify(persistedStats),
      );
    } catch {
      // Ignore storage write failures (e.g. quota exceeded/private mode).
    }
  }, [persistedStats, hasLoadedPersistedStats, persistToStorage]);

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

  const currentCharacterName = currentQuestion
    ? getMoveCharacterDisplayName(currentQuestion.move)
    : '';
  const currentCommand = currentQuestion?.move.command ?? '';
  const currentStreakRank = getFrameQuizRankForStreak(displayedStreak);
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
  const recentAccuracyBarWidth = Math.max(
    0,
    Math.min(100, recentAccuracyPercent),
  );
  const recentAccuracyBarColorClass =
    recentAccuracyPercent >= 80
      ? 'bg-emerald-500/80'
      : recentAccuracyPercent > 65
        ? 'bg-orange-500/80'
        : 'bg-red-500/80';
  const personalBestRank = getFrameQuizRankForStreak(
    persistedStats.personalBestStreak,
  );

  useEffect(() => {
    const previousRankImage = previousRankImageRef.current;
    const currentRankImage = currentStreakRank.image;

    if (
      previousRankImage !== null &&
      currentRankImage !== previousRankImage &&
      !shouldReduceMotion
    ) {
      setRankAnimationKey((current) => current + 1);
    }

    previousRankImageRef.current = currentRankImage;
  }, [currentStreakRank.image, shouldReduceMotion]);

  const handleStart = () => {
    const {
      question: firstQuestion,
      questionBag: nextQuestionBag,
      questionBagCursor: nextQuestionBagCursor,
    } = takeQuestionFromBag([], 0, eligibleMoves, []);
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
    setHasStarted(true);
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
      Math.min(RECENT_QUESTION_WINDOW, eligibleMoves.length - 1),
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
      eligibleMoves,
      nextRecentQuestionIds,
    );

    setScore(nextScore);
    setTotalAnswered(nextTotalAnswered);
    setConsecutiveCorrectStreak(nextConsecutiveCorrectStreak);
    setDisplayedStreak(
      isCorrect ? nextConsecutiveCorrectStreak : consecutiveCorrectStreak,
    );

    setPersistedStats((current) => {
      const nextRecentAnswerResults = [
        ...current.recentAnswerResults,
        isCorrect,
      ];
      const trimmedRecentAnswerResults =
        nextRecentAnswerResults.length <= RECENT_ANSWER_WINDOW
          ? nextRecentAnswerResults
          : nextRecentAnswerResults.slice(-RECENT_ANSWER_WINDOW);
      const nextStats: PersistedFrameQuizStats = {
        personalBestStreak: Math.max(
          current.personalBestStreak,
          nextConsecutiveCorrectStreak,
        ),
        lifetimeAnsweredCount: current.lifetimeAnsweredCount + 1,
        recentAnswerResults: trimmedRecentAnswerResults,
      };

      return nextStats;
    });

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
    setPersistedStats(defaultPersistedFrameQuizStats);
    try {
      localStorage.removeItem(FRAME_QUIZ_STATS_STORAGE_KEY);
    } catch {
      // Ignore storage failures and keep UI state reset.
    }
  };

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
      <h1 className="mb-2 mt-2 text-center text-2xl font-semibold tracking-tight">
        Endless Frame Quiz
      </h1>
      {quizContextLabel && (
        <p className="mb-2 text-center text-sm text-muted-foreground">
          {quizContextLabel}
        </p>
      )}

      {!hasStarted && (
        <Card className="mx-auto w-full max-w-2xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Endless frame quiz</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Guess how many frames each move is on block. This mode is endless
              and keeps going until you stop. See how many you can get right in
              a row and try to climb the ranks!
            </p>
            <Button onClick={handleStart}>Start quiz</Button>
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
          <Card className="mx-auto w-full max-w-2xl border-border/70 shadow-sm">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="min-w-0 flex-1">
                  <span className="inline-flex min-w-0 flex-wrap gap-x-1 gap-y-1">
                    <span className="whitespace-nowrap">
                      {currentCharacterName}:
                    </span>
                    <span className="wrap-break-word">{currentCommand}</span>
                  </span>
                </CardTitle>
                <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                  <p className="text-lg font-medium whitespace-nowrap">
                    Streak{' '}
                    <AnimatedNumber
                      value={displayedStreak}
                      className="inline-block tabular-nums"
                      duration={0.26}
                      animateOnDecrease={false}
                    />
                  </p>
                  {currentStreakRank.image && (
                    <motion.div
                      key={rankAnimationKey}
                      initial={
                        shouldReduceMotion ? undefined : { scale: 1, y: 0 }
                      }
                      animate={
                        shouldReduceMotion
                          ? undefined
                          : { scale: [1, 1.2, 1], y: [0, -1, 0] }
                      }
                      transition={
                        shouldReduceMotion
                          ? undefined
                          : { duration: 0.5, ease: 'easeOut' }
                      }
                      className="inline-flex"
                    >
                      <img
                        src={currentStreakRank.image}
                        className="h-12 w-auto"
                        alt={`${currentStreakRank.name} rank for streak ${displayedStreak}`}
                      />
                    </motion.div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <MoveVideo
                move={currentQuestion.move}
                className="mb-4 overflow-hidden rounded-lg"
              />
              <p className="mb-4">
                How many frames is{' '}
                <span className="font-bold">
                  {currentQuestion.move.command}
                </span>{' '}
                on block?
              </p>

              <div className="min-h-44">
                {questionFeedback ? (
                  <QuestionFeedbackCard
                    questionFeedback={questionFeedback}
                    isFeedbackVisible={isFeedbackVisible}
                    onContinue={handleContinueAfterFeedback}
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {answerOptions.map((option) => (
                      <Button
                        key={option.bucket}
                        variant="outline"
                        onClick={() => handleAnswer(option.bucket)}
                        className="min-w-33 justify-center rounded-full px-5"
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
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
                    Last 200 questions
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
                    Reset saved stats
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
