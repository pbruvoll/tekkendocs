import { Button } from '@/components/ui/button';
import { type Move } from '~/types/Move';
import { FlashCardAnswer, type FlashCardAnswerType } from './FlashCardAnswer';
import { ShowVideoButton } from './showVideoButton';

export type FlashCardBackProps = {
  move: Move;
  onAnswer: (flashCardAnswer: FlashCardAnswerType) => void;
};

export const FlashCardBack = ({ move, onAnswer }: FlashCardBackProps) => {
  return (
    <div className="flex h-full flex-col justify-between bg-foreground/10">
      <div className="flex grow items-center justify-center">
        <div className="grid grid-cols-2 gap-2 p-2">
          <div>Block</div>
          <div>{move.block}</div>
          <div>Startup</div>
          <div>{move.startup}</div>
          <div>Hit</div>
          <div>{move.hit}</div>
          <div>Level</div>
          <div>{move.hitLevel}</div>

          <div>Name</div>
          <div className="truncate">{move.name}</div>
          <div>Properties</div>
          <div className="truncate">
            {move.tags &&
              Object.entries(move.tags)
                .map(([key, _tag]) => key)
                .join(', ')}
          </div>
        </div>
      </div>
      <ShowVideoButton move={move} className="m-1 my-3" />
      <div className="flex w-full justify-between p-2">
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
