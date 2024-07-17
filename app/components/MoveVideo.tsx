import ReactPlayer from 'react-player/youtube'
import { useHydrated } from 'remix-utils/use-hydrated'
import { type Move } from '~/types/Move'

export type MoveVideoProps = {
  move: Move
}

export const MoveVideo = ({ move }: MoveVideoProps) => {
  const isHydrated = useHydrated()

  if (move.video) {
    return (
      <>
        <video
          className="mb-2 mt-4 aspect-video max-w-full"
          src={`https://wavu.wiki/t/Special:Redirect/file/${move?.video}`}
          style={{
            width: '640px',
          }}
          loop
          controls
          autoPlay
          muted
        />
        <div className="text-sm">Video from Wavu wiki</div>
      </>
    )
  }

  if (move.ytVideo && isHydrated) {
    return (
      <div className="mt-4 aspect-video w-[600px] max-w-full">
        <ReactPlayer
          playing
          width="100%"
          height="100%"
          controls
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
