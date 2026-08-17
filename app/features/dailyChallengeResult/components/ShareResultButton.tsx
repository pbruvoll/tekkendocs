import { Check, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getRankForScore } from '~/features/dailyChallengeResult/scoreRank';
import { buildDailyShareText } from '~/features/dailyChallengeResult/shareText';
import { type DailyResultSummary } from '~/features/dailyChallengeResult/types';
import {
  type ShareStatus,
  useShareResult,
} from '~/features/dailyChallengeResult/useShareResult';

type ShareResultButtonProps = DailyResultSummary & { className?: string };

const labelByStatus: Partial<Record<ShareStatus, string>> = {
  copied: 'Copied!',
  error: 'Copy failed',
};

export const ShareResultButton = ({
  displayDate,
  score,
  totalQuestions,
  streak,
  answers,
  className,
}: ShareResultButtonProps) => {
  const { status, shareText } = useShareResult();

  const handleShare = () => {
    shareText(
      buildDailyShareText({
        displayDate,
        score,
        totalQuestions,
        rankName: getRankForScore(score, totalQuestions)?.name ?? '',
        streak,
        results: answers.map((answer) => answer.isCorrect),
      }),
    );
  };

  return (
    <Button
      className={className}
      onClick={handleShare}
      disabled={status === 'pending'}
    >
      {status === 'copied' ? (
        <Check className="mr-2 h-4 w-4" aria-hidden />
      ) : (
        <Share2 className="mr-2 h-4 w-4" aria-hidden />
      )}
      <span className="min-w-24 text-center" aria-live="polite">
        {labelByStatus[status] ?? 'Share result'}
      </span>
    </Button>
  );
};
