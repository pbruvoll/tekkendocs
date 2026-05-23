import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { MovePropertyIconList } from '~/components/MovePropertyIconList';
import { MovePropertyTagList } from '~/components/MovePropertyTagList';
import { MoveVideo } from '~/components/MoveVideo';
import { ShowNotes } from '~/components/ShowNotes';
import { hasVisibleProperties } from '~/features/frameQuiz/moveSelection';
import { type SessionAnswer } from '~/features/frameQuiz/types';
import { type Move } from '~/types/Move';

type AnswerDetailsCardProps = {
  answer: SessionAnswer;
  index: number;
  move?: Move;
  answerMoveHref: string | null;
};

export const AnswerDetailsCard = ({
  answer,
  index,
  move,
  answerMoveHref,
}: AnswerDetailsCardProps) => {
  const [showNotes, setShowNotes] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const moveHasVideo = Boolean(move && (move.video || move.ytVideo));
  const moveHasVisibleProperties = move ? hasVisibleProperties(move) : false;

  return (
    <div
      id={`answer-details-${index + 1}`}
      className="scroll-mt-24 rounded border p-3"
    >
      <p className="font-medium">
        Q{index + 1}: {answer.characterName}:{' '}
        {answerMoveHref ? (
          <Link className="text-primary" to={answerMoveHref}>
            {answer.command}
          </Link>
        ) : (
          answer.command
        )}
      </p>
      <div className="mt-2 flex flex-wrap items-start gap-2 text-sm">
        <div className="rounded-md bg-muted/60 px-2 py-1">
          <p className="text-[11px] text-muted-foreground">You picked</p>
          <p className="font-medium">{answer.selectedLabel}</p>
        </div>
        <div className="rounded-md bg-muted/60 px-2 py-1">
          <p className="text-[11px] text-muted-foreground">Correct</p>
          <p className="font-medium">{answer.rawBlock}</p>
        </div>
        <div
          className={`inline-flex min-h-11 items-center rounded-md px-2.5 py-1 font-medium ${
            answer.isCorrect
              ? 'bg-foreground-success/10 text-foreground-success'
              : 'bg-foreground-destructive/10 text-foreground-destructive'
          }`}
        >
          {answer.isCorrect ? 'Correct' : 'Wrong'}
        </div>
      </div>

      {move ? (
        <div className="mt-3 border-t border-border/80 pt-3">
          <div className="space-y-3">
            {moveHasVideo ? (
              <div>
                <Button
                  type="button"
                  variant="outline"
                  className={`h-6 rounded-full border-2 px-2.5 text-[11px] ${
                    showVideo
                      ? 'bg-accent text-accent-foreground hover:bg-accent'
                      : 'text-muted-foreground'
                  }`}
                  onClick={() => setShowVideo((current) => !current)}
                >
                  {showVideo ? 'Hide video' : 'Show video'}
                </Button>
                <AnimatePresence>
                  {showVideo ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <MoveVideo className="my-2 max-w-96" move={move} />
                      <Button
                        type="button"
                        variant="outline"
                        className="mb-1 h-6 rounded-full border-2 px-2.5 text-[11px] bg-accent text-accent-foreground hover:bg-accent"
                        onClick={() => setShowVideo(false)}
                      >
                        Hide video
                      </Button>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ) : null}
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <div className="text-muted-foreground">Startup</div>
              <div className="font-medium">{move.startup || '-'}</div>

              <div className="text-muted-foreground">Damage</div>
              <div className="font-medium">{move.damage || '-'}</div>

              <div className="text-muted-foreground">Hit / C.Hit</div>
              <div className="font-medium">
                {move.hit || '-'}
                {move.counterHit && move.counterHit !== move.hit && (
                  <span className="font-normal text-muted-foreground">
                    {' '}
                    / {move.counterHit}
                  </span>
                )}
              </div>

              <div className="text-muted-foreground">Level</div>
              <div className="font-medium">{move.hitLevel || '-'}</div>

              {moveHasVisibleProperties ? (
                <>
                  <div className="text-muted-foreground">Properties</div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <MovePropertyIconList move={move} size="small" />
                    <MovePropertyTagList move={move} />
                  </div>
                </>
              ) : null}

              {move.notes ? (
                <div className="col-span-2 flex flex-col items-start gap-1">
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
          </div>
        </div>
      ) : null}
    </div>
  );
};
