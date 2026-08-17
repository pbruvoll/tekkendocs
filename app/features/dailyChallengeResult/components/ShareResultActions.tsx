import { ShareImageButton } from '~/features/dailyChallengeResult/components/ShareImageButton';
import { ShareResultButton } from '~/features/dailyChallengeResult/components/ShareResultButton';
import { type DailyResultSummary } from '~/features/dailyChallengeResult/types';

type ShareResultActionsProps = DailyResultSummary & { className?: string };

export const ShareResultActions = ({
  className,
  ...summary
}: ShareResultActionsProps) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className ?? ''}`}>
      <ShareResultButton {...summary} />
      <ShareImageButton {...summary} />
    </div>
  );
};
