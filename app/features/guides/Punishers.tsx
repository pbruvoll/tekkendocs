import { Commands } from '~/components/Commands';
import { useGuideContext } from './GuideContext';
import { type Punisher, type WhiffPunisher } from './GuideData';
import { GuideSectionHeading } from './GuideSectionHeading';

type PunishersProps = {
  standing?: Punisher[];
  crouching?: Punisher[];
  whiff?: WhiffPunisher[];
};
export const Punishers = ({ standing, crouching, whiff }: PunishersProps) => {
  return (
    <section id="punishers">
      <GuideSectionHeading title="Punishers" />
      <div className="flex gap-2 md:gap-4 lg:gap-8">
        {standing && <PunisherList title="Standing" punishers={standing} />}
        {crouching && <PunisherList title="Crouching" punishers={crouching} />}
        {whiff && <PunisherList title="Whiff punishers" punishers={whiff} />}
      </div>
    </section>
  );
};

const PunisherList = ({
  title,
  punishers,
}: {
  title: string;
  punishers: (Omit<Punisher, 'startup'> & { startup?: string })[];
}) => {
  const { charUrl, compressedCommandMap } = useGuideContext();
  return (
    <section className="grow">
      <div className="mb-2 bg-muted text-center">{title}</div>
      {punishers?.map(({ startup, command, description }, index) => (
        <div key={index} className="mb-2">
          {startup ? `${startup}f ` : ''}
          <Commands
            command={command}
            charUrl={charUrl}
            compressedCommandMap={compressedCommandMap}
          />{' '}
          {description ? `(${description})` : ''}
        </div>
      ))}
    </section>
  );
};
