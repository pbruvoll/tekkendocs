import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { SimpleMovesTable } from '~/components/SimpleMovesTable';
import { type Move } from '~/types/Move';
import { getRelatedMoves } from '~/utils/frameDataUtils';
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
  const relatedMoves = move.characterId
    ? getRelatedMoves(
        move,
        sourceMoves.filter(
          (candidate) => candidate.characterId === move.characterId,
        ),
      )
    : [];

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
            className="space-y-5"
          >
            <MoveDetailsPanel move={move} />
            {relatedMoves.length > 0 && (
              <div>
                <h3 className="mb-3 text-base font-semibold leading-none">
                  Related moves
                </h3>
                <SimpleMovesTable
                  moves={relatedMoves}
                  charId={move.characterId}
                  gameRouteId="t8"
                  stickyHeader={false}
                />
              </div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
