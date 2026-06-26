import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedNumber } from '~/components/AnimatedNumber';
import { MoveVideo } from '~/components/MoveVideo';
import { answerOptions } from '~/features/frameQuiz/constants';
import { getMoveCharacterDisplayName } from '~/features/frameQuiz/moveSelection';
import { getFrameQuizRankForStreak } from '~/features/frameQuiz/streakRank';
import {
  type AnswerBucket,
  type QuestionFeedback,
  type QuizMove,
} from '~/features/frameQuiz/types';
import { type Move } from '~/types/Move';
import { QuestionFeedbackCard } from './QuestionFeedbackCard';
import { type QuizModifiers } from './QuizModifierControls';
import { VideoPlaceholder } from './VideoPlaceholder';

type QuizQuestionCardProps = {
  question: QuizMove;
  modifiers: QuizModifiers;
  questionFeedback: QuestionFeedback | null;
  isFeedbackVisible: boolean;
  displayedStreak: number;
  sourceMoves: Move[];
  autoShowDetails: boolean;
  onAnswer: (bucket: AnswerBucket) => void;
  onContinue: () => void;
};

export const QuizQuestionCard = ({
  question,
  modifiers,
  questionFeedback,
  isFeedbackVisible,
  displayedStreak,
  sourceMoves,
  autoShowDetails,
  onAnswer,
  onContinue,
}: QuizQuestionCardProps) => {
  const shouldReduceMotion = useReducedMotion();
  const [rankAnimationKey, setRankAnimationKey] = useState(0);
  const previousRankImageRef = useRef<string | null>(null);
  const streakRank = getFrameQuizRankForStreak(displayedStreak);

  useEffect(() => {
    const previousImage = previousRankImageRef.current;
    const currentImage = streakRank.image;

    if (
      previousImage !== null &&
      currentImage !== previousImage &&
      !shouldReduceMotion
    ) {
      setRankAnimationKey((k) => k + 1);
    }

    previousRankImageRef.current = currentImage;
  }, [streakRank.image, shouldReduceMotion]);

  const characterName = getMoveCharacterDisplayName(question.move);
  const command = question.move.command;
  const answered = questionFeedback !== null;
  const commandRevealed = !modifiers.hideCommand || answered;
  const videoRevealed = !modifiers.hideVideo || answered;

  return (
    <Card className="mx-auto w-full max-w-2xl border-border/70 shadow-sm">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="min-w-0 flex-1">
            <span className="inline-flex min-w-0 flex-wrap gap-x-1 gap-y-1">
              <span className="whitespace-nowrap">
                {characterName}
                {commandRevealed ? ':' : ''}
              </span>
              {commandRevealed && (
                <span className="wrap-break-word">{command}</span>
              )}
            </span>
          </CardTitle>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            <p className="whitespace-nowrap text-lg font-medium">
              Streak{' '}
              <AnimatedNumber
                value={displayedStreak}
                className="inline-block tabular-nums"
                duration={0.26}
                animateOnDecrease={false}
              />
            </p>
            {streakRank.image && (
              <motion.div
                key={rankAnimationKey}
                initial={shouldReduceMotion ? undefined : { scale: 1, y: 0 }}
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
                  src={streakRank.image}
                  className="h-12 w-auto"
                  alt={`${streakRank.name} rank for streak ${displayedStreak}`}
                />
              </motion.div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        {videoRevealed ? (
          <MoveVideo
            move={question.move}
            className="mb-4 overflow-hidden rounded-lg"
          />
        ) : (
          <VideoPlaceholder className="mb-4 overflow-hidden rounded-lg" />
        )}

        <p className="mb-4">
          How many frames is{' '}
          {commandRevealed ? (
            <span className="font-bold">{command}</span>
          ) : (
            'this move'
          )}{' '}
          on block?
        </p>

        <div className="min-h-44">
          {questionFeedback ? (
            <QuestionFeedbackCard
              questionFeedback={questionFeedback}
              isFeedbackVisible={isFeedbackVisible}
              onContinue={onContinue}
              move={question.move}
              sourceMoves={sourceMoves}
              autoShowDetails={autoShowDetails}
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {answerOptions.map((option) => (
                <Button
                  key={option.bucket}
                  variant="outline"
                  onClick={() => onAnswer(option.bucket)}
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
  );
};
