import { useState } from 'react'
import { PlayIcon } from '@radix-ui/react-icons'
import cx from 'classix'
import { Button, buttonVariants } from '@/components/ui/button'
import { MoveVideo } from '~/components/MoveVideo'
import { type Move } from '~/types/Move'

export type FlashCardFrontProps = {
  move: Move
  onFlip: () => void
}
export const FlashCardFront = ({ move, onFlip }: FlashCardFrontProps) => {
  const [showVideo, setShowVideo] = useState(false)
  const moveHasVideo = !!(move.video || move.ytVideo)
  return (
    <div className="flex h-full w-full flex-col justify-between bg-foreground/10">
      <button
        type="button"
        className="flex w-full items-center justify-center p-2 text-xl"
        onClick={onFlip}
      >
        {move.command}
      </button>
      {moveHasVideo &&
        (showVideo ? (
          <MoveVideo move={move} />
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
        ))}
      <button
        className="flex w-full items-center justify-center p-2"
        onClick={onFlip}
      >
        <div className={cx(buttonVariants({ variant: 'default' }), 'mt-auto')}>
          Flip
        </div>
      </button>
    </div>
  )
}
