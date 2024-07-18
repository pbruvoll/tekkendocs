import { Button } from '@/components/ui/button'
import { type Move } from '~/types/Move'
import { FlashCardAnswer, type FlashCardAnswerType } from './FlashCardAnswer'

export type FlashCardBackProps = {
  move: Move
  onAnswer: (flashCardAnswer: FlashCardAnswerType) => void
}

export const FlashCardBack = ({ move, onAnswer }: FlashCardBackProps) => {
  return (
    <div className="bg-foreground/10 flex h-full flex-col">
      <div className="flex flex-grow items-center justify-center">
        <div className="grid grid-cols-2 gap-2 p-2">
          <div>Block</div>
          <div>{move.block}</div>
          <div>Hit</div>
          <div>{move.hit}</div>
          <div>Level</div>
          <div>{move.hitLevel}</div>
        </div>
      </div>
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
          variant="secondary"
          onClick={() => onAnswer(FlashCardAnswer.Ignored)}
        >
          Ignore
        </Button>
      </div>
    </div>
  )
}
