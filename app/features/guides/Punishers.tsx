import { useState } from 'react';
import { Commands } from '~/components/Commands';
import { Heading } from '~/components/ui/heading';
import { HeartButton } from '~/features/favorites/HeartButton';
import { useAreFavorites } from '~/features/favorites/useFavorites';
import { findGuideMoves } from '~/features/guideMoves/findGuideMoves';
import { formatStartup } from '~/features/guideMoves/formatStartup';
import { MoveVideoPanel } from '~/features/guideMoves/MoveVideoPanel';
import { ToggleVideoButton } from '~/features/guideMoves/ToggleVideoButton';
import { cn } from '~/lib/utils';
import { useGuideContext } from './GuideContext';
import { type Punisher, type WhiffPunisher } from './GuideData';
import { GuideSectionHeading } from './GuideSectionHeading';

type PunishersProps = {
  standing?: Punisher[];
  crouching?: Punisher[];
  whiff?: WhiffPunisher[];
};
export const Punishers = ({ standing, crouching, whiff }: PunishersProps) => {
  const { texts } = useGuideContext();
  return (
    <section className="my-6 mb-10" id="punishers">
      <GuideSectionHeading section="punishers" />
      {!!standing?.length && (
        <PunisherList title={texts.standingPunishers} punishers={standing} />
      )}
      {!!crouching?.length && (
        <PunisherList title={texts.crouchingPunishers} punishers={crouching} />
      )}
      {!!whiff?.length && (
        <PunisherList title={texts.whiffPunishers} punishers={whiff} />
      )}
    </section>
  );
};

// standing and crouching punishers have a startup, whiff punishers don't
type PunisherItem = WhiffPunisher & { startup?: string };

// lines the description and video up under the command: the startup chip's
// min-w-10 plus the row's gap-x-3
const underCommand = 'sm:ps-13';

const PunisherList = ({
  title,
  punishers,
}: {
  title: string;
  punishers: PunisherItem[];
}) => (
  <section className="mb-6">
    <Heading
      as="h3"
      size="4"
      className="border-s-4 border-muted-foreground bg-muted p-2 uppercase"
    >
      {title}
    </Heading>
    {punishers.map((punisher, index) => (
      <PunisherRow key={index} {...punisher} />
    ))}
  </section>
);

const PunisherRow = ({ startup, command, description }: PunisherItem) => {
  const { charUrl, compressedCommandMap } = useGuideContext();
  const [showVideo, setShowVideo] = useState(false);
  const { moves, moveWithVideo } = findGuideMoves(
    command,
    compressedCommandMap,
  );
  const { isFavorite, toggleFavorite } = useAreFavorites(moves);
  // whiff punishers have no startup in the guide, so take it from frame data
  const startupText = formatStartup(startup ?? moves[0]?.startup);

  return (
    <div className="border-b border-border py-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {/* kept when empty (but invisible), so the commands stay lined up */}
        <span className="min-w-10 rounded bg-muted px-1.5 py-0.5 text-center text-xs tabular-nums text-muted-foreground empty:invisible">
          {startupText}
        </span>
        <span className="font-bold">
          <Commands
            command={command}
            charUrl={charUrl}
            compressedCommandMap={compressedCommandMap}
          />
        </span>
        {moveWithVideo && (
          <ToggleVideoButton
            showVideo={showVideo}
            setShowVideo={setShowVideo}
          />
        )}
        {moves.length > 0 && (
          <HeartButton
            className="ms-auto"
            isFavorite={isFavorite}
            onToggle={toggleFavorite}
            size={15}
          />
        )}
      </div>
      {description && (
        <p className={cn('mt-0.5 text-muted-foreground', underCommand)}>
          {description}
        </p>
      )}
      <MoveVideoPanel
        className={underCommand}
        move={moveWithVideo}
        showVideo={showVideo}
        setShowVideo={setShowVideo}
      />
    </div>
  );
};
