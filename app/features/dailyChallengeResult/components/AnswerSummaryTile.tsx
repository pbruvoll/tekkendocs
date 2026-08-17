import { getCharacterAvatarSrc } from '~/features/dailyChallengeResult/characterAvatar';
import { type SessionAnswer } from '~/features/frameQuiz/types';

type AnswerSummaryTileProps = {
  answer: SessionAnswer;
  index: number;
};

export const AnswerSummaryTile = ({
  answer,
  index,
}: AnswerSummaryTileProps) => {
  const { isCorrect } = answer;
  const avatarSrc = getCharacterAvatarSrc(answer.characterName);

  return (
    <a
      href={`#answer-details-${index + 1}`}
      title={answer.characterName}
      className={`relative block overflow-hidden rounded border p-2 text-center transition-colors hover:bg-accent/40 ${
        isCorrect
          ? 'border-foreground-success/40 bg-foreground-success/10'
          : 'border-foreground-destructive/40 bg-foreground-destructive/10'
      }`}
    >
      {/* The tile is much wider than it is tall, so the crop is biased upwards
          to keep the character's face in frame. */}
      {avatarSrc && (
        <img
          src={avatarSrc}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top opacity-30"
        />
      )}
      <p className="relative text-xs text-muted-foreground">Q{index + 1}</p>
      <p
        className={`relative text-sm font-semibold ${
          isCorrect ? 'text-foreground-success' : 'text-foreground-destructive'
        }`}
      >
        {isCorrect ? 'OK' : 'X'}
      </p>
    </a>
  );
};
