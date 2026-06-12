import { VideoIcon } from '@radix-ui/react-icons';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { type Move } from '~/types/Move';
import { MoveVideo } from './MoveVideo';

export type MovePreviewDialogProps = {
  move: Move;
  url: string;
  prefixText?: string;
};
export function MovePreviewDialogButton({
  move,
  url,
  prefixText,
}: MovePreviewDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 whitespace-nowrap"
        >
          {prefixText && <span>{prefixText}</span>}
          <VideoIcon className="w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25 dark">
        <DialogHeader>
          <DialogTitle>
            <Link className="text-primary" to={url}>
              {move.command}
            </Link>
          </DialogTitle>
          {move.name && <DialogDescription>{move.name}</DialogDescription>}
        </DialogHeader>
        <div className="mt-4 max-w-150">
          <MoveVideo move={move} />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
