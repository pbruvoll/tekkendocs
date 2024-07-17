import { useState } from 'react'
import { PlayIcon } from '@radix-ui/react-icons'
import cx from 'classix'
import { Button, buttonVariants } from '@/components/ui/button'
import { type Move } from '~/types/Move'

export type FlashCardFrontProps = {
  move: Move
  onFlip: () => void
}
export const FlashCardFront = ({ move, onFlip }: FlashCardFrontProps) => {
  const [showVideo, setShowVideo] = useState(false)
  return (
    <div className="bg-foreground/10 h-full w-full">
      <button
        type="button"
        className="flex w-full items-center justify-center p-2 text-xl"
        onClick={onFlip}
      >
        {move.command}
      </button>
      {move.video && showVideo ? (
        <>
          <video
            className="aspect-video max-w-full p-2 pb-1"
            src={`https://wavu.wiki/t/Special:Redirect/file/${move?.video}`}
            style={{
              width: '640px',
            }}
            loop
            controls
            autoPlay
            muted
          />
          <div className="pb-1 pl-2 text-sm">Video from Wavu wiki</div>
        </>
      ) : (
        <div className="flex items-center justify-center">
          <Button
            size="lg"
            onClick={() => setShowVideo(true)}
            className="flex w-16 items-center justify-center p-2"
          >
            <PlayIcon />
          </Button>
        </div>
      )}
      <button
        className="flex w-full items-center justify-center p-2"
        onClick={onFlip}
      >
        <div className={cx(buttonVariants({ variant: 'default' }), 'w-32')}>
          Flip
        </div>
      </button>
    </div>
  )
}
