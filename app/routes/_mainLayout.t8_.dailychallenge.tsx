import { useEffect, useMemo, useRef, useState } from 'react';
import {
  data,
  type MetaFunction,
  useLoaderData,
  useSearchParams,
} from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentContainer } from '~/components/ContentContainer';
import { MoveVideo } from '~/components/MoveVideo';
import { characterInfoT8List } from '~/constants/characterInfoListT8';
import { environment } from '~/constants/environment.server';
import { hitLevelValue } from '~/constants/filterConstants';
import { useAppState } from '~/hooks/useAppState';
import tekkenDocsLogoIcon from '~/images/logo/tekkendocs-logo-icon.svg';
import { SheetServiceMock } from '~/mock/SheetServiceMock';
import { SheetServiceImpl } from '~/services/sheetServiceImpl.server';
import { type Move } from '~/types/Move';
import { type SheetService } from '~/types/SheetService';
import { frameDataTableToJson } from '~/utils/frameDataUtils';
import { getCacheControlHeaders } from '~/utils/headerUtils';
import { charIdFromMove, isWavuMove } from '~/utils/moveUtils';
import { generateMetaTags } from '~/utils/seoUtils';
import { rankGroups } from './_mainLayout.t8_.ranks';

const questionsPerDay = 10;
const maxStoredDailyChallengeDays = 30;

type DailyMove = {
  id: string;
  move: Move;
  blockValue: number;
};

type AnswerBucket =
  | 'plus'
  | 'zeroToMinusNine'
  | 'minusTenToMinusEleven'
  | 'minusTwelveToMinusFourteen'
  | 'minusFifteenOrLess';

type AnswerOption = {
  bucket: AnswerBucket;
  label: string;
};

type SessionAnswer = {
  moveId: string;
  characterName: string;
  command: string;
  rawBlock: string;
  selectedBucket: AnswerBucket;
  correctBucket: AnswerBucket;
  selectedLabel: string;
  correctLabel: string;
  isCorrect: boolean;
};

type QuestionFeedback = {
  isCorrect: boolean;
  selectedLabel: string;
  correctBlockValue: string;
};

type PendingAdvance = {
  score: number;
  answers: SessionAnswer[];
};

const answerOptions: AnswerOption[] = [
  { bucket: 'plus', label: '+1 or more' },
  { bucket: 'zeroToMinusNine', label: '0 to -9' },
  { bucket: 'minusTenToMinusEleven', label: '-10 to -11' },
  { bucket: 'minusTwelveToMinusFourteen', label: '-12 to -14' },
  { bucket: 'minusFifteenOrLess', label: '-15 or more' },
];

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

const answerLabelByBucket = answerOptions.reduce<Record<AnswerBucket, string>>(
  (current, option) => {
    current[option.bucket] = option.label;
    return current;
  },
  {
    plus: '',
    zeroToMinusNine: '',
    minusTenToMinusEleven: '',
    minusTwelveToMinusFourteen: '',
    minusFifteenOrLess: '',
  },
);

type LoaderData = {
  moves: Move[];
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

export const loader = async () => {
  const game = 'T8' as const;
  const service: SheetService = environment.useMockData
    ? new SheetServiceMock()
    : new SheetServiceImpl();

  const sheetData = await service.getCharacterData(
    game,
    'mokujin',
    'frameData',
  );
  const normalMoves = sheetData.tables.find(
    (table) => table.name === 'frames_normal',
  );
  const moves = normalMoves ? frameDataTableToJson(normalMoves) : [];

  return data<LoaderData>(
    { moves },
    {
      headers: getCacheControlHeaders({ seconds: 60 * 5 }),
    },
  );
};

const parseBlockValue = (block: string): number | null => {
  const direct = Number.parseInt(block, 10);
  if (!Number.isNaN(direct)) {
    return direct;
  }

  const simplified = (block.match(/i?[+-]?\d+/)?.[0] || '').replace(/^i/i, '');
  const parsed = Number.parseInt(simplified, 10);
  if (Number.isNaN(parsed)) {
    return null;
  }
  return parsed;
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

const createSeed = (seedValue: string): number => {
  let hash = 2166136261;
  for (let i = 0; i < seedValue.length; i++) {
    hash ^= seedValue.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const createRandom = (seedValue: string): (() => number) => {
  let state = createSeed(seedValue);
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const deterministicSample = <T,>(
  values: T[],
  sampleCount: number,
  seedValue: string,
): T[] => {
  if (sampleCount >= values.length) {
    return [...values];
  }

  const random = createRandom(seedValue);
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(random() * (index + 1));
    const current = shuffled[index];
    shuffled[index] = shuffled[randomIndex];
    shuffled[randomIndex] = current;
  }

  return shuffled.slice(0, sampleCount);
};

const getAnswerBucket = (blockValue: number): AnswerBucket => {
  if (blockValue >= 1) {
    return 'plus';
  }
  if (blockValue >= -9) {
    return 'zeroToMinusNine';
  }
  if (blockValue >= -11) {
    return 'minusTenToMinusEleven';
  }
  if (blockValue >= -14) {
    return 'minusTwelveToMinusFourteen';
  }
  return 'minusFifteenOrLess';
};

const getMoveId = (move: Move): string => {
  return move.wavuId || `${move.moveNumber}-${move.command}`;
};

const getMoveCharacterDisplayName = (move: Move): string => {
  if (!isWavuMove(move)) {
    return 'Move';
  }

  const charId = charIdFromMove(move);
  return (
    characterInfoT8List.find((char) => char.id === charId)?.displayName ||
    charId
  );
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
  const { moves } = useLoaderData<typeof loader>();
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

  const eligibleMoves = useMemo(() => {
    const seenMoveIds = new Set<string>();
    return moves.reduce<DailyMove[]>((current, move, currentIndex) => {
      if (!move.video) {
        return current;
      }

      if (move.video === moves[currentIndex + 1]?.video) {
        // dont use mvoes that has vidoes with fallback to full string vid
        return current;
      }

      if (move.hitLevel?.trim().toLowerCase().startsWith(hitLevelValue.Throw)) {
        return current;
      }

      const blockValue = parseBlockValue(move.block || '');
      if (blockValue === null) {
        return current;
      }

      const moveId = getMoveId(move);
      if (seenMoveIds.has(moveId)) {
        return current;
      }
      seenMoveIds.add(moveId);

      current.push({ id: moveId, move, blockValue });
      return current;
    }, []);
  }, [moves]);

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
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={handleContinueAfterFeedback}
                      className={`w-full max-w-2xl rounded-2xl border px-4 py-4 text-left transition-all duration-300 sm:px-5 sm:py-5 ${
                        questionFeedback.isCorrect
                          ? 'border-foreground-success/35 bg-foreground-success/15'
                          : 'border-foreground-destructive/35 bg-foreground-destructive/15'
                      } ${
                        isFeedbackVisible
                          ? 'translate-y-0 opacity-100'
                          : 'translate-y-2 opacity-0'
                      }`}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3 sm:items-center">
                          <div
                            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-background text-lg font-bold ${
                              questionFeedback.isCorrect
                                ? 'text-foreground-success'
                                : 'text-foreground-destructive'
                            }`}
                          >
                            {questionFeedback.isCorrect ? 'OK' : 'X'}
                          </div>
                          <div>
                            <p
                              className={`text-2xl font-extrabold tracking-tight ${
                                questionFeedback.isCorrect
                                  ? 'text-foreground-success'
                                  : 'text-foreground-destructive'
                              }`}
                            >
                              {questionFeedback.isCorrect
                                ? 'Excellent!'
                                : 'Not quite'}
                            </p>
                            {!questionFeedback.isCorrect && (
                              <p className="mt-1 text-sm">
                                You picked: {questionFeedback.selectedLabel}
                              </p>
                            )}
                            <p className="mt-1 text-sm">
                              Correct block frames:{' '}
                              {questionFeedback.correctBlockValue}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`w-full rounded-xl px-6 py-3 text-center text-lg font-black tracking-wide text-background shadow-[inset_0_-4px_0_0_rgba(0,0,0,0.15)] sm:w-auto ${
                            questionFeedback.isCorrect
                              ? 'bg-foreground-success'
                              : 'bg-foreground-destructive'
                          }`}
                        >
                          CONTINUE
                        </div>
                      </div>
                    </button>
                  </div>
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
                  TekkenDocs Daily Challenge {todayDisplayDate || todayKey}
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
                    <div
                      key={`summary-${answer.moveId}`}
                      className={`rounded border p-2 text-center ${
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
                    </div>
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
                {completedAnswers.map((answer, index) => (
                  <div
                    key={`details-${answer.moveId}`}
                    className="rounded border p-3"
                  >
                    <p className="font-medium">
                      Q{index + 1}: {answer.characterName}: {answer.command}
                    </p>
                    <p className="text-sm">
                      Your answer: {answer.selectedLabel}
                    </p>
                    <p className="text-sm">Correct answer: {answer.rawBlock}</p>
                    <p
                      className={`text-sm font-medium ${answer.isCorrect ? 'text-foreground-success' : 'text-foreground-destructive'}`}
                    >
                      {answer.isCorrect ? 'Correct' : 'Wrong'}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </ContentContainer>
  );
}
