import { useState } from 'react'
import { PlayIcon } from '@radix-ui/react-icons'
import cx from 'classix'
import { Button } from '@/components/ui/button'
import { MoveVideo } from '~/components/MoveVideo'
import { type Move } from '~/types/Move'

export type ShowVideoButtonProps = {
  move: Move
  className?: string
  hideFrameData?: boolean
}
export const ShowVideoButton = ({
  move,
  className,
  hideFrameData,
}: ShowVideoButtonProps) => {
  const [showVideo, setShowVideo] = useState(false)
  const moveHasVideo = !!(move.video || move.ytVideo)
  if (!moveHasVideo) {
    return null
  }
  if (showVideo) {
    return (
      <MoveVideo
        move={move}
        className={className}
        hideFrameData={hideFrameData}
      />
    )
  }
  return (
    <div className={cx('flex items-center justify-center', className)}>
      <Button
        size="lg"
        variant="secondary"
        onClick={() => setShowVideo(true)}
        className="flex w-16 items-center justify-center p-2"
      >
        <PlayIcon />
      </Button>
    </div>
  )
}
