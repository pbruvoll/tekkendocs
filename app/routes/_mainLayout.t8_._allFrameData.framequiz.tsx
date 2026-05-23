import { useEffect, useMemo, useRef, useState } from 'react';
import { type MetaFunction, useRouteLoaderData } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentContainer } from '~/components/ContentContainer';
import { MoveVideo } from '~/components/MoveVideo';
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
  pickRandomQuizMoveExcludingRecent,
} from '~/features/frameQuiz/random';
import { getFrameQuizRankForStreak } from '~/features/frameQuiz/streakRank';
import {
  type AnswerBucket,
  type QuestionFeedback,
  type QuizMove,
} from '~/features/frameQuiz/types';
import { generateMetaTags } from '~/utils/seoUtils';
import { type LoaderData } from './_mainLayout.t8_._allFrameData';

const RECENT_QUESTION_WINDOW = 20;

type PendingAdvance = {
  nextQuestion: QuizMove | null;
  recentQuestionIds: string[];
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
  const [recentQuestionIds, setRecentQuestionIds] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuizMove | null>(null);
  const [questionFeedback, setQuestionFeedback] =
    useState<QuestionFeedback | null>(null);
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
  const feedbackAnimationFrameRef = useRef<number | null>(null);
  const [pendingAdvance, setPendingAdvance] = useState<PendingAdvance | null>(
    null,
  );

  const eligibleMoves = useMemo(() => getEligibleQuizMoves(moves), [moves]);

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

  const currentCharacterName = currentQuestion
    ? getMoveCharacterDisplayName(currentQuestion.move)
    : '';
  const currentCommand = currentQuestion?.move.command ?? '';
  const currentStreakRank = getFrameQuizRankForStreak(consecutiveCorrectStreak);
  const accuracyPercent =
    totalAnswered === 0 ? 0 : Math.round((score / totalAnswered) * 100);
  const accuracyText = `${accuracyPercent}% - ${score}/${totalAnswered}`;

  const handleStart = () => {
    const firstQuestion = pickRandomQuizMoveExcludingRecent(eligibleMoves, []);
    setScore(0);
    setTotalAnswered(0);
    setConsecutiveCorrectStreak(0);
    setRecentQuestionIds([]);
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
    const nextRecentQuestionIds = appendRecentQuestionId(
      recentQuestionIds,
      currentQuestion.id,
      RECENT_QUESTION_WINDOW,
    );
    const nextQuestion = pickRandomQuizMoveExcludingRecent(
      eligibleMoves,
      nextRecentQuestionIds,
    );

    setScore(nextScore);
    setTotalAnswered(nextTotalAnswered);
    setConsecutiveCorrectStreak(nextConsecutiveCorrectStreak);

    setPendingAdvance({
      nextQuestion,
      recentQuestionIds: nextRecentQuestionIds,
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
    setQuestionFeedback(null);
    setPendingAdvance(null);
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
      <h1 className="mb-5 mt-2 text-center text-2xl font-semibold tracking-tight">
        Endless Frame Quiz
      </h1>

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
                    Streak {consecutiveCorrectStreak}
                  </p>
                  {currentStreakRank.image && (
                    <img
                      src={currentStreakRank.image}
                      className="h-12 w-auto"
                      alt={`${currentStreakRank.name} rank for streak ${consecutiveCorrectStreak}`}
                    />
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
          <p className="text-center text-sm text-muted-foreground">
            Accuracy: {accuracyText}
          </p>
        </div>
      )}
    </ContentContainer>
  );
}
