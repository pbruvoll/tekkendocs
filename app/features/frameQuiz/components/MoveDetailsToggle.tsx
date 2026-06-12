import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { type Move } from '~/types/Move';
import { MoveDetailsPanel } from './MoveDetailsPanel';

type MoveDetailsToggleProps = {
  move: Move;
  sourceMoves: Move[];
};

export const MoveDetailsToggle = ({
  move,
  sourceMoves,
}: MoveDetailsToggleProps) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="mt-3">
      <button
        type="button"
        className="rounded-full border border-border/70 px-3 py-1 text-xs font-medium hover:bg-accent/30"
        aria-expanded={showDetails}
        onClick={() => setShowDetails((current) => !current)}
      >
        {showDetails ? 'Hide move details' : 'Show move details'}
      </button>

      <AnimatePresence initial={false}>
        {showDetails ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <MoveDetailsPanel move={move} sourceMoves={sourceMoves} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
