import { Heading } from '@radix-ui/themes';
import cx from 'classix';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Commands } from '~/components/Commands';
import { MoveVideo } from '~/components/MoveVideo';
import { PlayTextAudioButton } from '~/components/PlayTextAudioButton';
import { TextWithCommand } from '~/components/TextWithCommand';
import { type Move } from '~/types/Move';
import { compressCommand } from '~/utils/commandUtils';
import { useGuideContext } from './GuideContext';
import { type KeyMove } from './GuideData';
import { GuideSectionHeading } from './GuideSectionHeading';
import { MoveSummary } from './MoveSummary';

type KeyMovesProps = {
  moves: KeyMove[];
  title: string;
};
export const KeyMoves = ({ moves, title }: KeyMovesProps) => {
  const { charUrl, compressedCommandMap } = useGuideContext();
  return (
    <section className="my-10" id={title.toLowerCase().replace(/ /g, '-')}>
      <GuideSectionHeading title={title} />
      <div className="grid gap-3">
        {moves.map(({ command, description }) => (
          <article
            key={command}
            className="rounded-xl border border-border bg-card/50 p-4"
          >
            <KeyMoveHeading
              command={command}
              description={description}
              compressedCommandMap={compressedCommandMap}
              charUrl={charUrl}
            />
            <MoveSummary
              className="mt-2"
              command={command}
              compressedCommandMap={compressedCommandMap}
            />
            {description && (
              <div className="mt-2 leading-relaxed">
                <TextWithCommand
                  text={description}
                  charUrl={charUrl}
                  compressedCommandMap={compressedCommandMap}
                />
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

const KeyMoveHeading = ({
  command,
  description,
  compressedCommandMap,
  charUrl,
}: {
  command: string;
  description?: string;
  compressedCommandMap: Record<string, Move>;
  charUrl: string;
}) => {
  const [showVideo, setShowVideo] = useState(false);

  const splitCommand = command.split(' | ');

  // find last youtube video
  let moveWithVideo: Move | undefined;
  for (let i = splitCommand.length - 1; i >= 0; i--) {
    const move = compressedCommandMap[compressCommand(splitCommand[i])];
    if (move?.ytVideo || move?.video) {
      moveWithVideo = move;
      break;
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        <Heading as="h3" size="4">
          <Commands
            charUrl={charUrl}
            compressedCommandMap={compressedCommandMap}
            command={command}
          />
        </Heading>
        {moveWithVideo && (
          <ToogleVideoButton
            showVideo={showVideo}
            setShowVideo={setShowVideo}
          />
        )}
        {description && (
          <PlayTextAudioButton text={description} className="ml-auto" />
        )}
      </div>
      <AnimatePresence>
        {showVideo && moveWithVideo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <MoveVideo
              className="my-2 max-w-96 rounded-lg"
              move={moveWithVideo}
            />
            <ToogleVideoButton
              showVideo={showVideo}
              className="mb-2"
              setShowVideo={setShowVideo}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ToogleVideoButton = ({
  showVideo,
  setShowVideo,
  className,
}: {
  showVideo: boolean;
  setShowVideo: (show: boolean) => void;
  className?: string;
}) => {
  return (
    <Button
      type="button"
      variant="outline"
      className={cx(
        'rounded-full h-6 px-3 border-2 border-border text-xs',
        showVideo
          ? 'bg-accent text-accent-foreground hover:bg-accent'
          : 'text-muted-foreground',
        className,
      )}
      onClick={() => setShowVideo(!showVideo)}
    >
      {showVideo ? 'Hide video' : 'Show video'}
    </Button>
  );
};
