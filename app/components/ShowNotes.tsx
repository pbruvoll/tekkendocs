import { cx } from 'class-variance-authority';
import { ChevronDown, ChevronRight, ChevronUp } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { type Move } from '~/types/Move';

export type ShowNotesDetailsProps = {
  showNotes: boolean;
  move: Move;
  className?: string;
};
const ShowNotesDetails = ({
  showNotes,
  move,
  className,
}: ShowNotesDetailsProps) => {
  return (
    <AnimatePresence>
      {showNotes && (
        <motion.p
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          style={{ overflow: 'hidden' }}
          className={cx('mt-2 ml-1 text-sm', className)}
        >
          {move.notes.split('\n').map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </motion.p>
      )}
    </AnimatePresence>
  );
};

type ShowNotesTriggerProps = {
  showNotes: boolean;
  setShowNotes: (show: boolean) => void;
  className?: string;
};
const ShowNotesTrigger = ({
  showNotes,
  setShowNotes,
  className,
}: ShowNotesTriggerProps) => {
  return (
    <button
      type="button"
      onClick={() => setShowNotes(!showNotes)}
      className={cx(
        `text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1`,
        className,
      )}
    >
      <span>{showNotes ? 'Hide details' : 'View details'}</span>
      {showNotes ? (
        <ChevronUp className="h-4 w-4" />
      ) : (
        <ChevronDown className="h-4 w-4" />
      )}
    </button>
  );
};

export const ShowNotes = {
  Trigger: ShowNotesTrigger,
  Details: ShowNotesDetails,
};
