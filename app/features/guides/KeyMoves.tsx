import { useState } from 'react';
import { Commands } from '~/components/Commands';
import { PlayTextAudioButton } from '~/components/PlayTextAudioButton';
import { TextWithCommand } from '~/components/TextWithCommand';
import { Heading } from '~/components/ui/heading';
import { HeartButton } from '~/features/favorites/HeartButton';
import { useAreFavorites } from '~/features/favorites/useFavorites';
import {
  type GuideSectionKey,
  getGuideSectionId,
} from '~/features/guideLanguage/texts/guideTexts';
import { findGuideMoves } from '~/features/guideMoves/findGuideMoves';
import { MoveVideoPanel } from '~/features/guideMoves/MoveVideoPanel';
import { ToggleVideoButton } from '~/features/guideMoves/ToggleVideoButton';
import { type Move } from '~/types/Move';
import { useGuideContext } from './GuideContext';
import { type KeyMove } from './GuideData';
import { GuideSectionHeading } from './GuideSectionHeading';
import { MoveSummary } from './MoveSummary';

type KeyMovesProps = {
  moves: KeyMove[];
  section: GuideSectionKey;
};
export const KeyMoves = ({ moves, section }: KeyMovesProps) => {
  const { charUrl, compressedCommandMap } = useGuideContext();
  return (
    <section className="my-6 mb-10" id={getGuideSectionId(section)}>
      <GuideSectionHeading section={section} />
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
  const { texts } = useGuideContext();

  const { moves, moveWithVideo } = findGuideMoves(
    command,
    compressedCommandMap,
  );
  const { isFavorite, toggleFavorite } = useAreFavorites(moves);

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
          <ToggleVideoButton
            showVideo={showVideo}
            setShowVideo={setShowVideo}
          />
        )}
        <div className="ml-auto flex items-center gap-1">
          {moves.length > 0 && (
            <HeartButton
              isFavorite={isFavorite}
              onToggle={toggleFavorite}
              size={15}
            />
          )}
          {description && (
            <PlayTextAudioButton text={description} labels={texts.audio} />
          )}
        </div>
      </div>
      <MoveVideoPanel
        move={moveWithVideo}
        showVideo={showVideo}
        setShowVideo={setShowVideo}
      />
    </div>
  );
};
