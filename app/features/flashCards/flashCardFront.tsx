import cx from 'classix'
import { buttonVariants } from '@/components/ui/button'
import { type Move, type MoveT8 } from '~/types/Move'
import { charIdFromMove } from '~/utils/moveUtils'
import { ShowVideoButton } from './showVideoButton'

export type FlashCardFrontProps = {
  move: Move
  showCharName: boolean
  onFlip: () => void
}

export var toggled: boolean

export function toggleFrontCard(): void {
  if (toggled) {
    toggled = false
  } else {
    toggled = true
  }
}
export const FlashCardFront = ({
  move,
  showCharName,
  onFlip,
}: FlashCardFrontProps) => {
  if (!toggled) {
    return (
      <div className="flex h-full w-full flex-col bg-foreground/10">
        <button
          type="button"
          className="flex w-full flex-grow items-center justify-center p-2 text-xl"
          onClick={onFlip}
        >
          {showCharName && `${charIdFromMove(move as MoveT8)} `}
          {move.command}
        </button>
        <ShowVideoButton move={move} className="m-1 my-3" hideFrameData />
        <button
          className="flex w-full items-center justify-center p-2 text-lg"
          onClick={onFlip}
        >
          <div
            className={cx(
              buttonVariants({ variant: 'default' }),
              'mt-auto h-12 w-24',
            )}
          >
            Flip
          </div>
        </button>
      </div>
    )
  }
  return <div className="flex h-full w-full flex-col bg-foreground/10"></div>
}
