import { Heading } from '@radix-ui/themes';
import cx from 'classix';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Commands } from '~/components/Commands';
import { HeartButton } from '~/components/HeartButton';
import { MoveVideo } from '~/components/MoveVideo';
import { PlayTextAudioButton } from '~/components/PlayTextAudioButton';
import { TextWithCommand } from '~/components/TextWithCommand';
import { useFavorites } from '~/hooks/useFavorites';
import { type Move, type MoveT8 } from '~/types/Move';
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
    <section className="my-6 mb-10" id={title.toLowerCase().replace(/ /g, '-')}>
      <GuideSectionHeading title={title} />
      {moves.map(({ command, description }) => (
        <section key={command} className="my-2 mb-4">
          <KeyMoveHeading
            command={command}
            description={description}
            compressedCommandMap={compressedCommandMap}
            charUrl={charUrl}
          />
          {description && (
            <TextWithCommand
              text={description}
              charUrl={charUrl}
              compressedCommandMap={compressedCommandMap}
            />
          )}
          <MoveSummary
            command={command}
            compressedCommandMap={compressedCommandMap}
          />
        </section>
      ))}
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
  const { isFavorite, toggleFavorite } = useFavorites();

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

  // favorites are keyed on wavuId, so a move without one cant be favorited
  const firstMove = compressedCommandMap[compressCommand(splitCommand[0])];
  const favoriteMove = firstMove?.wavuId ? (firstMove as MoveT8) : undefined;

  return (
    <div>
      <div className="flex gap-4 items-center mb-1">
        <Heading as="h3" size="3">
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
        <div className="ml-auto flex items-center gap-1">
          {favoriteMove && (
            <HeartButton
              isFavorite={isFavorite(favoriteMove)}
              onToggle={() => toggleFavorite(favoriteMove)}
              size={15}
            />
          )}
          {description && <PlayTextAudioButton text={description} />}
        </div>
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
            <MoveVideo className="max-w-96 my-2" move={moveWithVideo} />
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
