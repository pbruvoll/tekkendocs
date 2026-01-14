import cx from 'classix';
import ReactPlayer from 'react-player/youtube';
import { useHydrated } from 'remix-utils/use-hydrated';
import { type Move } from '~/types/Move';

export type MoveVideoProps = {
  move: Move;
  hideFrameData?: boolean;
  className?: string;
  playing?: boolean;
};

export const MoveVideo = ({
  move,
  hideFrameData,
  className,
  playing = true,
}: MoveVideoProps) => {
  const isHydrated = useHydrated();

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
            playing={playing}
            controls
            width="100%"
            height="100%"
            muted
            config={{
              playerVars: {
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
          className="aspect-video"
          title="Move Video"
          src={`https://wavu.wiki/t/Special:Redirect/file/${move?.video}`}
        />
        {/* Used to load vidoe directly frm wavu, but seems it's blocked due to bot detections, so we load it in an iframe 
         The downside is that we loose autoPlay and loop
        */}
        {/* <video
          className="mb-2 aspect-video"
          src={`https://wavu.wiki/t/Special:Redirect/file/${move?.video}`}
          loop
          controls
          autoPlay
          muted
        /> */}
        <div className="text-xs text-muted-foreground">
          Video from Wavu wiki
        </div>
      </div>
    );
  }

  return null;
};
