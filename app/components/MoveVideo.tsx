import ReactPlayer from 'react-player/youtube'
import cx from 'classix'
import { useHydrated } from 'remix-utils/use-hydrated'
import { type Move } from '~/types/Move'

export type MoveVideoProps = {
  move: Move
  className?: string
}

export const MoveVideo = ({ move, className }: MoveVideoProps) => {
  const isHydrated = useHydrated()

  if (move.video) {
    return (
      <div className={cx(className)}>
        <video
          className="mb-2 aspect-video"
          src={`https://wavu.wiki/t/Special:Redirect/file/${move?.video}`}
          loop
          controls
          autoPlay
          muted
        />
        <div className="text-sm">Video from Wavu wiki</div>
      </div>
    )
  }

  if (move.ytVideo && isHydrated) {
    return (
      <div className="aspect-video">
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
      </div>
    )
  }

  return null
}
