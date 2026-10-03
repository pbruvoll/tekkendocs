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
  const { texts } = useGuideContext();
  return (
    <section id="punishers">
      <GuideSectionHeading section="punishers" />
      <div className="flex gap-2 md:gap-4 lg:gap-8">
        {standing && (
          <PunisherList title={texts.standingPunishers} punishers={standing} />
        )}
        {crouching && (
          <PunisherList
            title={texts.crouchingPunishers}
            punishers={crouching}
          />
        )}
        {whiff && (
          <PunisherList title={texts.whiffPunishers} punishers={whiff} />
        )}
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
          {/* own element, so a translated rtl description keeps its direction */}
          {description ? <span>({description})</span> : ''}
        </div>
      ))}
    </section>
  );
};
