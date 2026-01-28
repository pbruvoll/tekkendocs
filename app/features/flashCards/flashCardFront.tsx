import cx from 'classix';
import { buttonVariants } from '@/components/ui/button';
import { type Move, type MoveT8 } from '~/types/Move';
import { charIdFromMove } from '~/utils/moveUtils';
import { ShowVideoButton } from './showVideoButton';

export type FlashCardFrontProps = {
  move: Move;
  showCharName: boolean;
  autoPlay?: boolean;
  onFlip: () => void;
};
export const FlashCardFront = ({
  move,
  showCharName,
  autoPlay,
  onFlip,
}: FlashCardFrontProps) => {
  return (
    <div className="flex h-full w-full flex-col bg-foreground/10">
      <button
        type="button"
        className="flex w-full flex-1 items-center justify-center p-4 text-2xl font-semibold"
        onClick={onFlip}
      >
        {showCharName && `${charIdFromMove(move as MoveT8)} `}
        {move.command}
      </button>
      <div className="flex flex-1 items-center justify-center px-4">
        <ShowVideoButton
          autoPlay={autoPlay}
          move={move}
          className="w-full"
          hideFrameData
        />
      </div>
      <button
        className="flex w-full flex-1 items-center justify-center p-2 text-lg"
        type="button"
        onClick={onFlip}
      >
        <div
          className={cx(buttonVariants({ variant: 'default' }), 'h-12 w-24')}
        >
          Flip
        </div>
      </button>
    </div>
  );
};
