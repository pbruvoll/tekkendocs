import { Heading } from '@radix-ui/themes';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Commands } from '~/components/Commands';
import { MoveVideo } from '~/components/MoveVideo';
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
    <section className="my-6 mb-10" id={title.toLowerCase().replace(/ /g, '-')}>
      <GuideSectionHeading title={title} />
      {moves.map(({ command, description }) => (
        <section key={command} className="my-2 mb-4">
          <KeyMoveHeading
            command={command}
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
  compressedCommandMap,
  charUrl,
}: {
  command: string;
  compressedCommandMap: Record<string, Move>;
  charUrl: string;
}) => {
  const [showVideo, setShowVideo] = useState(false);

  const splitCommand = command.split(' | ');

  // find last youtube video
  let moveWithYtVideo: Move | undefined;
  for (let i = splitCommand.length - 1; i >= 0; i--) {
    const move = compressedCommandMap[compressCommand(splitCommand[i])];
    if (move?.ytVideo) {
      moveWithYtVideo = move;
      break;
    }
  }

  return (
    <div>
      <div className="flex gap-2 items-center mb-1">
        <Heading as="h3" size="3">
          <Commands
            charUrl={charUrl}
            compressedCommandMap={compressedCommandMap}
            command={command}
          />
        </Heading>
        {moveWithYtVideo && (
          <button type="button" onClick={() => setShowVideo(!showVideo)}>
            {showVideo ? 'Hide video' : 'Show video'}
          </button>
        )}
      </div>
      {showVideo && moveWithYtVideo && (
        <MoveVideo className="max-w-96 my-4" move={moveWithYtVideo} />
      )}
    </div>
  );
};
