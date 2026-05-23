import { useEffect, useMemo, useRef, useState } from 'react';
import {
  type MetaFunction,
  useRouteLoaderData,
  useSearchParams,
} from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentContainer } from '~/components/ContentContainer';
import { MoveVideo } from '~/components/MoveVideo';
import { AnswerDetailsCard } from '~/features/frameQuiz/components/AnswerDetailsCard';
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
import { deterministicSample } from '~/features/frameQuiz/random';
import {
  type AnswerBucket,
  type PendingAdvance,
  type QuestionFeedback,
  type SessionAnswer,
} from '~/features/frameQuiz/types';
import { useAppState } from '~/hooks/useAppState';
import tekkenDocsLogoIcon from '~/images/logo/tekkendocs-logo-icon.svg';
import {
  charIdFromMove,
  commandToUrlSegmentEncoded,
  isWavuMove,
} from '~/utils/moveUtils';
import { generateMetaTags } from '~/utils/seoUtils';
import { type LoaderData } from './_mainLayout.t8_._allFrameData';
import { rankGroups } from './_mainLayout.t8_.ranks';

const questionsPerDay = 10;
const maxStoredDailyChallengeDays = 30;

const allRanks = rankGroups.flatMap((group) => group.ranks);

// Explicit score-to-image table for quick remapping.
const rankImageByScore: Record<number, string> = {
  0: allRanks[0]?.image || '',
  1: allRanks[allRanks.length - 16]?.image || '',
  2: allRanks[allRanks.length - 15]?.image || '',
  3: allRanks[allRanks.length - 14]?.image || '',
  4: allRanks[allRanks.length - 13]?.image || '',
  5: allRanks[allRanks.length - 12]?.image || '',
  6: allRanks[allRanks.length - 11]?.image || '',
  7: allRanks[allRanks.length - 10]?.image || '',
  8: allRanks[allRanks.length - 9]?.image || '',
  9: allRanks[allRanks.length - 8]?.image || '',
  10: allRanks[allRanks.length - 1]?.image || '',
};

export const meta: MetaFunction = ({ matches }) => {
  return generateMetaTags({
    matches,
    title: 'Tekken 8 Daily Challenge | TekkenDocs',
    description:
      'Daily frame data quiz with 10 moves. Guess the block frame and keep your streak alive.',
    image: { url: '/images/tekkendocs-og-image-v2.png' },
    url: '/t8/dailychallenge',
  });
};

const formatLocalDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatLocalDisplayDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
  }).format(date);
};

const getPreviousDateKey = (dateKey: string): string => {
  const [year, month, day] = dateKey.split('-').map(Number);
  if (!year || !month || !day) {
    return '';
  }
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - 1);
  return formatLocalDateKey(date);
};

const calculateStreakEndingAt = (
  dailyResultsByDate: Record<string, { score: number; totalQuestions: number }>,
  endDateKey: string,
): number => {
  let streak = 0;
  let cursor = endDateKey;
  while (cursor && dailyResultsByDate[cursor]) {
    streak += 1;
    cursor = getPreviousDateKey(cursor);
  }
  return streak;
};

const getRankImageForScore = (score: number): string => {
  const clampedScore = Math.max(0, Math.min(score, questionsPerDay));
  return rankImageByScore[clampedScore] || '';
};

const keepMostRecentDays = <T,>(
  byDate: Record<string, T>,
  maxDays: number,
): Record<string, T> => {
  const dateKeys = Object.keys(byDate).sort();
  if (dateKeys.length <= maxDays) {
    return byDate;
  }

  const keepSet = new Set(dateKeys.slice(-maxDays));
  return Object.fromEntries(
    Object.entries(byDate).filter(([dateKey]) => keepSet.has(dateKey)),
  );
};

export default function DailyChallenge() {
  const now = new Date();
  const showRetryButton = useSearchParams()[0].get('retry') !== null;
  const { moves } = useRouteLoaderData<LoaderData>(
    'routes/_mainLayout.t8_._allFrameData',
  ) || { moves: [] };
  const [appState, setAppState, isAppStateHydrated] = useAppState();
  const [todayKey] = useState<string>(() => formatLocalDateKey(now));
  const [todayDisplayDate] = useState<string>(() =>
    formatLocalDisplayDate(now),
  );

  const [hasStarted, setHasStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [sessionAnswers, setSessionAnswers] = useState<SessionAnswer[]>([]);
  const [hasCompletedSession, setHasCompletedSession] = useState(false);
  const [questionFeedback, setQuestionFeedback] =
    useState<QuestionFeedback | null>(null);
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
  const feedbackAnimationFrameRef = useRef<number | null>(null);
  const [pendingAdvance, setPendingAdvance] = useState<PendingAdvance | null>(
    null,
  );

  useEffect(() => {
    return () => {
      if (feedbackAnimationFrameRef.current !== null) {
        cancelAnimationFrame(feedbackAnimationFrameRef.current);
      }
    };
  }, []);

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

  const eligibleMoves = useMemo(() => getEligibleQuizMoves(moves), [moves]);

  const dailyMoves = useMemo(() => {
    if (!todayKey) {
      return [];
    }
    return deterministicSample(
      eligibleMoves,
      questionsPerDay,
      `all-${todayKey}`,
    );
  }, [eligibleMoves, todayKey]);

  const moveById = useMemo(() => {
    return new Map(eligibleMoves.map(({ id, move }) => [id, move]));
  }, [eligibleMoves]);

  const dailyChallengeState = appState.dailyChallenge;
  const todayResult = dailyChallengeState.dailyResultsByDate[todayKey];

  const currentStreakToShow = useMemo(() => {
    const lastCompletedDate = dailyChallengeState?.lastCompletedDate;
    if (!lastCompletedDate) {
      return 0;
    }
    if (lastCompletedDate === todayKey) {
      return dailyChallengeState.currentStreak;
    }
    if (lastCompletedDate === getPreviousDateKey(todayKey)) {
      return dailyChallengeState.currentStreak;
    }
    return 0;
  }, [
    dailyChallengeState?.currentStreak,
    dailyChallengeState?.lastCompletedDate,
    todayKey,
  ]);

  const currentQuestion = dailyMoves[currentQuestionIndex];
  const currentQuestionLabel = currentQuestion
    ? `${getMoveCharacterDisplayName(currentQuestion.move)}: ${currentQuestion.move.command}`
    : '';

  const updateDailyChallengeState = (
    updates: Partial<typeof appState.dailyChallenge>,
  ) => {
    setAppState({
      ...appState,
      dailyChallenge: {
        ...appState.dailyChallenge,
        ...updates,
      },
    });
  };

  const saveInProgress = (
    dateKey: string,
    nextQuestionIndex: number,
    nextScore: number,
    nextAnswers: SessionAnswer[],
  ) => {
    updateDailyChallengeState({
      inProgress: {
        dateKey,
        currentQuestionIndex: Math.max(
          0,
          Math.min(nextQuestionIndex, questionsPerDay - 1),
        ),
        score: nextScore,
        sessionAnswers: nextAnswers,
      },
    });
  };

  const saveResult = (
    finalScore: number,
    completedAnswers: SessionAnswer[],
  ) => {
    if (todayResult) {
      return;
    }

    const previousDateKey = getPreviousDateKey(todayKey);
    const previousStreak = dailyChallengeState?.currentStreak || 0;
    const previousLastCompleted = dailyChallengeState?.lastCompletedDate;

    let nextStreak = 1;
    if (previousLastCompleted === todayKey) {
      nextStreak = previousStreak;
    } else if (previousLastCompleted === previousDateKey) {
      nextStreak = previousStreak + 1;
    }

    const nextResultsByDate = keepMostRecentDays(
      {
        ...dailyChallengeState.dailyResultsByDate,
        [todayKey]: {
          score: finalScore,
          totalQuestions: questionsPerDay,
        },
      },
      maxStoredDailyChallengeDays,
    );

    updateDailyChallengeState({
      dailyResultsByDate: nextResultsByDate,
      currentCompletedAnswers: {
        dateKey: todayKey,
        answers: completedAnswers,
      },
      currentStreak: nextStreak,
      lastCompletedDate: todayKey,
      inProgress: null,
    });
  };

  const advanceAfterFeedback = (
    nextScore: number,
    nextAnswers: SessionAnswer[],
  ) => {
    setQuestionFeedback(null);
    setPendingAdvance(null);

    if (currentQuestionIndex + 1 >= questionsPerDay) {
      saveResult(nextScore, nextAnswers);
      setHasStarted(false);
      setHasCompletedSession(true);
      return;
    }

    saveInProgress(todayKey, currentQuestionIndex + 1, nextScore, nextAnswers);

    setCurrentQuestionIndex((current) => current + 1);
  };

  const handleAnswer = (selectedBucket: AnswerBucket) => {
    if (!currentQuestion || questionFeedback) {
      return;
    }

    const correctBucket = getAnswerBucket(currentQuestion.blockValue);
    const isCorrect = selectedBucket === correctBucket;
    const nextScore = score + (isCorrect ? 1 : 0);

    const nextAnswers = [
      ...sessionAnswers,
      {
        moveId: currentQuestion.id,
        characterName: getMoveCharacterDisplayName(currentQuestion.move),
        command: currentQuestion.move.command,
        rawBlock: currentQuestion.move.block,
        selectedBucket,
        correctBucket,
        selectedLabel: answerLabelByBucket[selectedBucket],
        correctLabel: answerLabelByBucket[correctBucket],
        isCorrect,
      },
    ];

    setSessionAnswers(nextAnswers);
    setScore(nextScore);
    setPendingAdvance({ score: nextScore, answers: nextAnswers });
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
    advanceAfterFeedback(pendingAdvance.score, pendingAdvance.answers);
  };

  const handleStart = () => {
    saveInProgress(todayKey, 0, 0, []);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSessionAnswers([]);
    setQuestionFeedback(null);
    setIsFeedbackVisible(false);
    setPendingAdvance(null);
    setHasCompletedSession(false);
    setHasStarted(true);
  };

  const handleRetry = () => {
    const nextResultsByDate = { ...dailyChallengeState.dailyResultsByDate };
    delete nextResultsByDate[todayKey];
    const nextCurrentCompletedAnswers =
      dailyChallengeState.currentCompletedAnswers?.dateKey === todayKey
        ? null
        : dailyChallengeState.currentCompletedAnswers;

    let nextCurrentStreak = dailyChallengeState.currentStreak;
    let nextLastCompletedDate = dailyChallengeState.lastCompletedDate;
    if (nextLastCompletedDate === todayKey) {
      const previousDateKeys = Object.keys(nextResultsByDate)
        .filter((dateKey) => dateKey < todayKey)
        .sort();
      const previousMostRecentDate =
        previousDateKeys[previousDateKeys.length - 1];

      if (previousMostRecentDate) {
        nextLastCompletedDate = previousMostRecentDate;
        nextCurrentStreak = calculateStreakEndingAt(
          nextResultsByDate,
          previousMostRecentDate,
        );
      } else {
        nextCurrentStreak = 0;
        nextLastCompletedDate = null;
      }
    }

    setAppState({
      ...appState,
      dailyChallenge: {
        ...appState.dailyChallenge,
        dailyResultsByDate: nextResultsByDate,
        currentCompletedAnswers: nextCurrentCompletedAnswers,
        currentStreak: nextCurrentStreak,
        lastCompletedDate: nextLastCompletedDate,
        inProgress: {
          dateKey: todayKey,
          currentQuestionIndex: 0,
          score: 0,
          sessionAnswers: [],
        },
      },
    });

    setCurrentQuestionIndex(0);
    setScore(0);
    setSessionAnswers([]);
    setQuestionFeedback(null);
    setIsFeedbackVisible(false);
    setPendingAdvance(null);
    setHasCompletedSession(false);
    setHasStarted(true);
  };

  useEffect(() => {
    if (
      !isAppStateHydrated ||
      hasStarted ||
      hasCompletedSession ||
      todayResult
    ) {
      return;
    }

    const inProgress = appState.dailyChallenge.inProgress;
    if (inProgress?.dateKey === todayKey) {
      setCurrentQuestionIndex(
        Math.max(
          0,
          Math.min(inProgress.currentQuestionIndex, questionsPerDay - 1),
        ),
      );
      setScore(inProgress.score);
      setSessionAnswers(inProgress.sessionAnswers);
      setHasCompletedSession(false);
      setHasStarted(true);
    }
  }, [
    todayKey,
    todayResult,
    isAppStateHydrated,
    hasStarted,
    hasCompletedSession,
    appState.dailyChallenge.inProgress,
  ]);

  useEffect(() => {
    if (!todayKey) {
      return;
    }

    const inProgress = appState.dailyChallenge.inProgress;
    if (inProgress?.dateKey && inProgress.dateKey !== todayKey) {
      setAppState({
        ...appState,
        dailyChallenge: {
          ...appState.dailyChallenge,
          inProgress: null,
        },
      });
      return;
    }

    if (todayResult && inProgress?.dateKey === todayKey) {
      setAppState({
        ...appState,
        dailyChallenge: {
          ...appState.dailyChallenge,
          inProgress: null,
        },
      });
    }
  }, [todayKey, todayResult, appState, setAppState]);

  if (!isAppStateHydrated) {
    return (
      <ContentContainer
        enableBottomPadding
        enableTopPadding
        className="max-w-4xl"
      >
        <h1 className="mb-5 mt-2 text-center text-2xl font-semibold tracking-tight">
          Daily Challenge - {todayDisplayDate || todayKey}
        </h1>
        <Card className="mx-auto w-full max-w-2xl border-border/70 bg-linear-to-br from-background to-accent/20 shadow-sm">
          <CardHeader>
            <CardTitle>Loading challenge...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Loading your saved challenge progress...</p>
          </CardContent>
        </Card>
      </ContentContainer>
    );
  }

  if (eligibleMoves.length < questionsPerDay) {
    return (
      <ContentContainer enableBottomPadding enableTopPadding>
        <h1 className="my-4 text-2xl">Daily challenge</h1>
        <p>
          There are not enough valid Mokujin moves with video and parseable
          block frames to create a 10-question challenge right now.
        </p>
      </ContentContainer>
    );
  }

  const hasCompletedToday = Boolean(todayResult);
  const showCompletedView =
    hasCompletedSession || (hasCompletedToday && !hasStarted);
  const completedAnswers = hasCompletedSession
    ? sessionAnswers
    : dailyChallengeState.currentCompletedAnswers?.dateKey === todayKey
      ? dailyChallengeState.currentCompletedAnswers.answers
      : [];
  const completedScore = hasCompletedSession
    ? score
    : (todayResult?.score ?? 0);
  const completedRankImage = getRankImageForScore(completedScore);

  const getAnswerMoveHref = (answer: SessionAnswer): string | null => {
    const move = moveById.get(answer.moveId);
    if (!move || !isWavuMove(move)) {
      return null;
    }

    return `/t8/${charIdFromMove(move)}/${commandToUrlSegmentEncoded(move.command)}`;
  };

  return (
    <ContentContainer
      enableBottomPadding
      enableTopPadding
      className="max-w-4xl"
    >
      <h1 className="mb-5 mt-2 text-center text-2xl font-semibold tracking-tight">
        Daily Challenge - {todayDisplayDate || todayKey}
      </h1>

      {!hasStarted && !showCompletedView && (
        <Card className="mx-auto mb-4 w-full max-w-2xl border-border/70 bg-linear-to-br from-background to-accent/20 shadow-sm">
          <CardHeader>
            <CardTitle>
              Current streak: {currentStreakToShow} day
              {currentStreakToShow !== 1 ? 's' : ''}
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      {!hasCompletedToday && !hasStarted && !hasCompletedSession && (
        <Card className="mx-auto w-full max-w-2xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Today&apos;s challenge</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Guess how many frames each move is on block. You will get 10
              questions, and everyone gets the same set for today. Note that
              some videos may show additional hits of the string.
            </p>
            <Button onClick={handleStart}>Start challenge</Button>
          </CardContent>
        </Card>
      )}

      {hasStarted && dailyMoves.length < questionsPerDay && (
        <Card className="mx-auto w-full max-w-2xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Loading challenge...</CardTitle>
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
              <CardTitle className="flex gap-2 flex-wrap justify-between items-center">
                {currentQuestionLabel}
                <p className="text-lg font-medium">
                  Question {currentQuestionIndex + 1} / {questionsPerDay}
                </p>
              </CardTitle>
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
          <p className="text-center text-sm text-muted-foreground">
            Current score: {score} / {questionsPerDay}
          </p>
        </div>
      )}

      {showCompletedView && (
        <div className="space-y-4">
          <Card className="mx-auto w-full max-w-2xl border-border/70 bg-linear-to-br from-background to-accent/20 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <img
                  src={tekkenDocsLogoIcon}
                  className="aspect-[0.76] h-8"
                  alt="TekkenDocs"
                />
                <CardTitle>
                  TekkenDocs Daily Challenge {todayDisplayDate || todayKey}{' '}
                  {new Date().getDate() === 29 && new Date().getMonth() === 2
                    ? ' (v2)'
                    : ''}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 mt-1 flex items-center gap-3">
                <p className="text-xl font-semibold">
                  Score: {completedScore} / {questionsPerDay}
                </p>
                {completedRankImage && (
                  <img
                    src={completedRankImage}
                    className="h-10 w-auto"
                    alt={`Rank for score ${completedScore}`}
                  />
                )}
              </div>
              <div className="grid grid-cols-5 gap-2">
                {completedAnswers.map((answer, questionIndex) => {
                  const isCorrect = answer.isCorrect;
                  return (
                    <a
                      key={`summary-${answer.moveId}`}
                      href={`#answer-details-${questionIndex + 1}`}
                      className={`block rounded border p-2 text-center transition-colors hover:bg-accent/40 ${
                        isCorrect
                          ? 'border-foreground-success/40 bg-foreground-success/10'
                          : 'border-foreground-destructive/40 bg-foreground-destructive/10'
                      }`}
                    >
                      <p className="text-xs text-muted-foreground">
                        Q{questionIndex + 1}
                      </p>
                      <p
                        className={`text-sm font-semibold ${
                          isCorrect
                            ? 'text-foreground-success'
                            : 'text-foreground-destructive'
                        }`}
                      >
                        {isCorrect ? 'OK' : 'X'}
                      </p>
                    </a>
                  );
                })}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Current streak: {currentStreakToShow} day
                {currentStreakToShow !== 1 ? 's' : ''}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Come back tomorrow for a new challenge.
              </p>
              {showRetryButton && (
                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={handleRetry}
                >
                  Retry
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="mx-auto w-full max-w-2xl border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Answer Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {completedAnswers.map((answer, index) => {
                  const answerMove = moveById.get(answer.moveId);
                  const answerMoveHref = getAnswerMoveHref(answer);

                  return (
                    <AnswerDetailsCard
                      key={`details-${answer.moveId}`}
                      answer={answer}
                      index={index}
                      move={answerMove}
                      answerMoveHref={answerMoveHref}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </ContentContainer>
  );
}
