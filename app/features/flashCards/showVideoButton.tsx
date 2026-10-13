import { PlayIcon } from 'lucide-react';
import { useState } from 'react';
import { MoveVideo } from '~/components/MoveVideo';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import { type Move } from '~/types/Move';

export type ShowVideoButtonProps = {
  move: Move;
  className?: string;
  autoPlay?: boolean;
  hideFrameData?: boolean;
};
export const ShowVideoButton = ({
  move,
  className,
  autoPlay,
  hideFrameData,
}: ShowVideoButtonProps) => {
  const [showVideo, setShowVideo] = useState(false);
  const moveHasVideo = !!(move.video || move.ytVideo);
  if (!moveHasVideo) {
    return null;
  }
  if (showVideo || autoPlay) {
    return (
      <MoveVideo
        move={move}
        className={className}
        hideFrameData={hideFrameData}
      />
    );
  }
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Button
        size="lg"
        variant="outline"
        onClick={() => setShowVideo(true)}
        className="flex w-16 items-center justify-center p-2"
      >
        <PlayIcon />
      </Button>
    </div>
  );
};
