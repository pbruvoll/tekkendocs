import { useState } from 'react';
import { MovePropertyIconList } from '~/components/MovePropertyIconList';
import { MovePropertyTagList } from '~/components/MovePropertyTagList';
import { ShowNotes } from '~/components/ShowNotes';
import { SimpleMovesTable } from '~/components/SimpleMovesTable';
import { type Move } from '~/types/Move';
import { getRecoveryFrames, getRelatedMoves } from '~/utils/frameDataUtils';

type MoveDetailsPanelProps = {
  move: Move;
  sourceMoves: Move[];
};

export const MoveDetailsPanel = ({
  move,
  sourceMoves,
}: MoveDetailsPanelProps) => {
  const [showNotes, setShowNotes] = useState(false);

  const relatedMoves = move.characterId
    ? getRelatedMoves(
        move,
        sourceMoves.filter(
          (candidate) => candidate.characterId === move.characterId,
        ),
      )
    : [];

  const relatedMovesCharId = move.characterId;

  return (
    <div className="mt-3 rounded-xl border border-border/70 bg-background/70 p-3 sm:p-4">
      <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <div className="text-muted-foreground">Hit level</div>
        <div className="font-medium">{move.hitLevel || '-'}</div>

        <div className="text-muted-foreground">Damage</div>
        <div className="font-medium">{move.damage || '-'}</div>

        <div className="text-muted-foreground">Startup</div>
        <div className="font-medium">{move.startup || '-'}</div>

        <div className="text-muted-foreground">Block</div>
        <div className="font-medium">{move.block || '-'}</div>

        <div className="text-muted-foreground">Hit</div>
        <div className="font-medium">{move.hit || '-'}</div>

        <div className="text-muted-foreground">Counter hit</div>
        <div className="font-medium">{move.counterHit || '-'}</div>

        <div className="text-muted-foreground">Recovery frames</div>
        <div className="font-medium">{getRecoveryFrames(move) ?? 'N/A'}</div>

        <div className="text-muted-foreground">Properties</div>
        <div className="flex flex-wrap items-center gap-1.5">
          <MovePropertyIconList move={move} size="small" />
          <MovePropertyTagList move={move} />
        </div>

        {move.notes ? (
          <div className="col-span-2 mt-1 flex flex-col items-start gap-1">
            <ShowNotes.Trigger
              showNotes={showNotes}
              setShowNotes={setShowNotes}
            />
            <ShowNotes.Details
              showNotes={showNotes}
              move={move}
              className="mt-0 ml-0"
            />
          </div>
        ) : null}
      </div>

      {relatedMoves.length > 0 && (
        <div className="mt-5 border-t border-border/70 pt-2">
          <h3 className="mb-4 text-base font-semibold leading-none">
            Related moves
          </h3>
          <div className="overflow-x-auto">
            <SimpleMovesTable
              moves={relatedMoves}
              charId={relatedMovesCharId}
              gameRouteId="t8"
              disableLinks
              stickyHeader={false}
              className="min-w-[600px]"
            />
          </div>
        </div>
      )}
    </div>
  );
};
