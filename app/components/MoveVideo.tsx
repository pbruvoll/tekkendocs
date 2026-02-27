import cx from 'classix';
import { useState } from 'react';
import FilePlayer from 'react-player/file';
import ReactPlayer from 'react-player/youtube';
import { useHydrated } from 'remix-utils/use-hydrated';
import { cdnUrl, internalMoveVideoSet } from '~/services/staticDataService';
import { type Move } from '~/types/Move';
import { charIdFromMove, isWavuMove } from '~/utils/moveUtils';

export type MoveVideoProps = {
  move: Move;
  hideFrameData?: boolean;
  className?: string;
  playing?: boolean;
  preload?: boolean;
};

export const MoveVideo = ({
  move,
  hideFrameData,
  className,
  playing: playingProp = true,
  preload = false,
}: MoveVideoProps) => {
  const isHydrated = useHydrated();

  const [hasStarted, setHasStarted] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const [playing, setPlaying] = useState(playingProp);
  const [originalPlaying, setOriginalPlaying] = useState(playingProp);
  if (playingProp !== originalPlaying) {
    setOriginalPlaying(playingProp);
    setPlaying(playingProp);
  }

  const charId = isWavuMove(move) ? charIdFromMove(move) : undefined;

  if (move.video && charId && internalMoveVideoSet.has(charId) && isHydrated) {
    const videoCharUrl =
      charId === 'azucena' ? 'azucena-converted-426' : charId;
    const videoBase =
      move.video.replace('File:', '').replace('.mp4', '') +
      (charId === 'azucena' ? '-426' : charId === 'asuka' ? '-640' : '');

    return (
      <div className={cx('relative aspect-video', className)}>
        {/* Loading indicator behind the video - no z-index so video stays on top */}
        {playing && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
              <span className="text-sm text-muted-foreground">
                Loading video...
              </span>
            </div>
          </div>
        )}
        {/* Video player on top - once loaded it covers the loading indicator */}
        <button
          type="button"
          className="absolute inset-0"
          onClick={() => setShowControls(true)}
        >
          <FilePlayer
            playing={playing}
            onPlay={() => setHasStarted(true)}
            controls={showControls}
            playsinline
            width="100%"
            height="100%"
            muted
            onClickPreview={() => setPlaying(true)}
            light={
              playing || hasStarted || preload ? undefined : (
                <div className="w-full h-full " />
              )
            }
            // playIcon={<div>play</div>}
            loop
            url={`${cdnUrl}/t8/videos/${videoCharUrl}/${videoBase}.mp4`}
          />
        </button>
        {hideFrameData && (
          <div className="absolute bottom-0 right-[2%] z-10 aspect-square w-1/12 bg-black" />
        )}
      </div>
    );
  }

  if (move.ytVideo && isHydrated) {
    return (
      <div className={cx('relative aspect-video', className)}>
        {/* Loading indicator behind the video - no z-index so video stays on top */}
        <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            <span className="text-sm text-muted-foreground">
              Loading video...
            </span>
          </div>
        </div>
        {/* Video player on top - once loaded it covers the loading indicator */}
        <div className="absolute inset-0">
          <ReactPlayer
            playing={playing || (preload && !hasStarted)}
            controls
            playsinline
            onPlay={() => setHasStarted(true)}
            width="100%"
            height="100%"
            muted
            config={{
              playerVars: {
                playsinline: 1,
                start: move.ytVideo.start || undefined,
                end: move.ytVideo.end || undefined,
                rel: 0,
              },
            }}
            loop
            url={`https://www.youtube.com/watch?v=${move.ytVideo.id}`}
          />
        </div>
        {hideFrameData && (
          <div className="absolute bottom-0 right-[2%] z-10 aspect-square w-1/12 bg-black" />
        )}
      </div>
    );
  }

  if (move.video) {
    return (
      <div className={cx(className)}>
        <iframe
          className="aspect-video w-full"
          title="Move Video"
          src={`https://wavu.wiki/t/Special:Redirect/file/${move?.video}`}
        />
        <div className="text-xs text-muted-foreground">
          Video from Wavu wiki
        </div>
      </div>
    );
  }

  return null;
};
