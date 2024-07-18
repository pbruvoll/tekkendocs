import { useState } from 'react'
import { PlayIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import { MoveVideo } from '~/components/MoveVideo'
import { type Move } from '~/types/Move'

export type ShowVideoButtonProps = {
  move: Move
}
export const ShowVideoButton = ({ move }: ShowVideoButtonProps) => {
  const [showVideo, setShowVideo] = useState(false)
  const moveHasVideo = !!(move.video || move.ytVideo)
  if (!moveHasVideo) {
    return null
  }
  if (showVideo) {
    return <MoveVideo move={move} />
  }
  return (
    <div className="flex items-center justify-center">
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
