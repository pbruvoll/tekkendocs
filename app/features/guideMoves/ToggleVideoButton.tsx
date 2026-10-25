import { Button } from '~/components/ui/button';
import { useGuideContext } from '~/features/guides/GuideContext';
import { cn } from '~/lib/utils';

export const ToggleVideoButton = ({
  showVideo,
  setShowVideo,
  className,
}: {
  showVideo: boolean;
  setShowVideo: (show: boolean) => void;
  className?: string;
}) => {
  const { texts } = useGuideContext();
  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        'rounded-full h-6 px-3 border-2 border-border text-xs',
        showVideo
          ? 'bg-accent text-accent-foreground hover:bg-accent'
          : 'text-muted-foreground',
        className,
      )}
      onClick={() => setShowVideo(!showVideo)}
    >
      {showVideo ? texts.hideVideo : texts.showVideo}
    </Button>
  );
};
