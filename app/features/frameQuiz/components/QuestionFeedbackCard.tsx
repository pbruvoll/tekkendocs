import { type QuestionFeedback } from '~/features/frameQuiz/types';

type QuestionFeedbackCardProps = {
  questionFeedback: QuestionFeedback;
  isFeedbackVisible: boolean;
  onContinue: () => void;
};

export const QuestionFeedbackCard = ({
  questionFeedback,
  isFeedbackVisible,
  onContinue,
}: QuestionFeedbackCardProps) => {
  return (
    <div className="flex justify-center">
      <button
        type="button"
        onClick={onContinue}
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
                {questionFeedback.isCorrect ? 'Excellent!' : 'Not quite'}
              </p>
              {!questionFeedback.isCorrect && (
                <p className="mt-1 text-sm">
                  You picked: {questionFeedback.selectedLabel}
                </p>
              )}
              <p className="mt-1 text-sm">
                Correct block frames: {questionFeedback.correctBlockValue}
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
  );
};
