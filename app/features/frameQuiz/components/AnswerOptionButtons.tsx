import { Button } from '~/components/ui/button';
import { formatFrameRange } from '~/features/frameQuiz/frameRange';
import {
  type FrameRange,
  type QuizFrameType,
} from '~/features/frameQuiz/types';

type AnswerOptionButtonsProps = {
  options: FrameRange[];
  frameType: QuizFrameType;
  onAnswer: (range: FrameRange) => void;
};

export const AnswerOptionButtons = ({
  options,
  frameType,
  onAnswer,
}: AnswerOptionButtonsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const label = formatFrameRange(option, frameType);
        return (
          <Button
            key={label}
            variant="outline"
            onClick={() => onAnswer(option)}
            className="min-w-33 justify-center rounded-full px-5"
          >
            {label}
          </Button>
        );
      })}
    </div>
  );
};
