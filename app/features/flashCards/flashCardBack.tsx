import { Button } from '@/components/ui/button';
import { MovePropertyIconList } from '~/components/MovePropertyIconList';
import { MovePropertyTagList } from '~/components/MovePropertyTagList';
import { type Move } from '~/types/Move';
import { FlashCardAnswer, type FlashCardAnswerType } from './FlashCardAnswer';
import { ShowVideoButton } from './showVideoButton';

export type FlashCardBackProps = {
  move: Move;
  onAnswer: (flashCardAnswer: FlashCardAnswerType) => void;
};

export const FlashCardBack = ({ move, onAnswer }: FlashCardBackProps) => {
  return (
    <div className="flex h-full flex-col bg-foreground/10">
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-center p-2">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <div className="text-muted-foreground">Block</div>
            <div className="font-medium">{move.block}</div>
            <div className="text-muted-foreground">Startup</div>
            <div className="font-medium">{move.startup}</div>
            <div className="text-muted-foreground">Hit / C.Hit</div>
            <div className="font-medium">
              {move.hit}
              {move.counterHit && move.counterHit !== move.hit && (
                <span className="text-muted-foreground font-normal">
                  {' '}
                  / {move.counterHit}
                </span>
              )}
            </div>
            <div className="text-muted-foreground">Level</div>
            <div className="font-medium">{move.hitLevel}</div>

            <div className="text-muted-foreground">Name</div>
            <div className="truncate font-medium">{move.name}</div>
            <div className="text-muted-foreground">Properties</div>
            <div className="col-span-1 flex flex-col gap-1">
              <MovePropertyIconList move={move} />
              <MovePropertyTagList move={move} />
            </div>
          </div>
        </div>
        <div className="flex min-h-36 items-center justify-center px-4 pb-2">
          <ShowVideoButton move={move} className="w-full" />
        </div>
      </div>
      <div className="flex w-full shrink-0 justify-between border-t border-border/50 p-2">
        <Button
          onClick={() => onAnswer(FlashCardAnswer.Wrong)}
          variant="destructive"
        >
          Wrong
        </Button>
        <Button
          onClick={() => onAnswer(FlashCardAnswer.Correct)}
          variant="success"
        >
          Correct
        </Button>
        <Button
          variant="outline"
          onClick={() => onAnswer(FlashCardAnswer.Ignored)}
        >
          Ignore
        </Button>
      </div>
    </div>
  );
};
