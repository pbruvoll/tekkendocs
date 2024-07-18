import cx from 'classix'
import { buttonVariants } from '@/components/ui/button'
import { type Move } from '~/types/Move'
import { ShowVideoButton } from './showVideoButton'

export type FlashCardFrontProps = {
  move: Move
  onFlip: () => void
}
export const FlashCardFront = ({ move, onFlip }: FlashCardFrontProps) => {
  return (
    <div className="bg-foreground/10 flex h-full w-full flex-col">
      <button
        type="button"
        className="flex w-full flex-grow items-center justify-center p-2 text-xl"
        onClick={onFlip}
      >
        {move.command}
      </button>
      <ShowVideoButton move={move} className="m-1 my-3" />
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
