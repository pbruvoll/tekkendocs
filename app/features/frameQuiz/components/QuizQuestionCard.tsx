import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { AnimatedNumber } from '~/components/AnimatedNumber';
import { MoveVideo } from '~/components/MoveVideo';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { getAnswerOptions } from '~/features/frameQuiz/frameType';
import { getMoveCharacterDisplayName } from '~/features/frameQuiz/moveSelection';
import { getFrameQuizRankForStreak } from '~/features/frameQuiz/streakRank';
import {
  type FrameRange,
  type QuestionFeedback,
  type QuizFrameType,
  type QuizMove,
} from '~/features/frameQuiz/types';
import { QuizSoundToggle } from '~/features/quizSounds/QuizSoundToggle';
import { type Move } from '~/types/Move';
import { AnswerOptionButtons } from './AnswerOptionButtons';
import { QuestionFeedbackCard } from './QuestionFeedbackCard';
import { type QuizModifiers } from './QuizModifierControls';
import { VideoPlaceholder } from './VideoPlaceholder';

type QuizQuestionCardProps = {
  question: QuizMove;
  frameType: QuizFrameType;
  modifiers: QuizModifiers;
  questionFeedback: QuestionFeedback | null;
  isFeedbackVisible: boolean;
  displayedStreak: number;
  sourceMoves: Move[];
  autoShowDetails: boolean;
  onAnswer: (range: FrameRange) => void;
  onContinue: () => void;
};

export const QuizQuestionCard = ({
  question,
  frameType,
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
    <Card className="mx-auto w-full max-w-2xl shadow-sm">
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
            <QuizSoundToggle />
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
      <CardContent>
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
          on {frameType}?
        </p>

        <div className="min-h-44">
          {questionFeedback ? (
            <QuestionFeedbackCard
              questionFeedback={questionFeedback}
              frameType={frameType}
              isFeedbackVisible={isFeedbackVisible}
              onContinue={onContinue}
              move={question.move}
              sourceMoves={sourceMoves}
              autoShowDetails={autoShowDetails}
            />
          ) : (
            <AnswerOptionButtons
              options={getAnswerOptions(frameType, modifiers.hard)}
              frameType={frameType}
              onAnswer={onAnswer}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
