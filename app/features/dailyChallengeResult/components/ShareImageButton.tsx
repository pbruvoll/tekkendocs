import { Check, Download, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  renderResultImage,
  resultImageFileName,
} from '~/features/dailyChallengeResult/renderResultImage';
import { getRankForScore } from '~/features/dailyChallengeResult/scoreRank';
import { type DailyResultSummary } from '~/features/dailyChallengeResult/types';
import {
  type ShareStatus,
  useShareResult,
} from '~/features/dailyChallengeResult/useShareResult';
import tekkenDocsLogoIcon from '~/images/logo/tekkendocs-logo-icon.svg';

type ShareImageButtonProps = DailyResultSummary & { className?: string };

const labelByStatus: Partial<Record<ShareStatus, string>> = {
  pending: 'Preparing...',
  copied: 'Copied!',
  downloaded: 'Saved!',
  error: 'Share failed',
};

const iconByStatus: Partial<Record<ShareStatus, typeof ImageIcon>> = {
  pending: Loader2,
  copied: Check,
  downloaded: Download,
};

export const ShareImageButton = ({
  displayDate,
  score,
  totalQuestions,
  streak,
  answers,
  className,
}: ShareImageButtonProps) => {
  const { status, shareImage } = useShareResult();

  const handleShare = () => {
    const rank = getRankForScore(score, totalQuestions);
    shareImage(
      () =>
        renderResultImage({
          displayDate,
          score,
          totalQuestions,
          rankName: rank?.name ?? '',
          rankImageSrc: rank?.image ?? '',
          logoSrc: tekkenDocsLogoIcon,
          streak,
          results: answers.map(({ isCorrect, characterName }) => ({
            isCorrect,
            characterName,
          })),
        }),
      resultImageFileName,
    );
  };

  const Icon = iconByStatus[status] ?? ImageIcon;

  return (
    <Button
      variant="outline"
      className={className}
      onClick={handleShare}
      disabled={status === 'pending'}
    >
      <Icon
        className={`mr-2 h-4 w-4 ${status === 'pending' ? 'animate-spin' : ''}`}
        aria-hidden
      />
      <span className="min-w-24 text-center" aria-live="polite">
        {labelByStatus[status] ?? 'Share image'}
      </span>
    </Button>
  );
};
