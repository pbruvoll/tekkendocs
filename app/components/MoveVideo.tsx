import cx from 'classix';
import ReactPlayer from 'react-player/youtube';
import { useHydrated } from 'remix-utils/use-hydrated';
import { type Move } from '~/types/Move';

export type MoveVideoProps = {
  move: Move;
  hideFrameData?: boolean;
  className?: string;
};

export const MoveVideo = ({
  move,
  hideFrameData,
  className,
}: MoveVideoProps) => {
  const isHydrated = useHydrated();

  if (move.ytVideo && isHydrated) {
    return (
      <div className={cx('relative aspect-video', className)}>
        <ReactPlayer
          playing
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
        {hideFrameData && (
          <div className="absolute bottom-0 right-[2%] aspect-square w-1/12 bg-black" />
        )}
      </div>
    );
  }

  if (move.video) {
    return (
      <div className={cx(className)}>
        <iframe
          className="mb-2 aspect-video"
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
