import { Commands } from '~/components/Commands';
import { GuideCardColumn } from './GuideCardColumn';
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
    <section id="punishers" className="my-10">
      <GuideSectionHeading title="Punishers" />
      <div className="grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
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
    <GuideCardColumn title={title}>
      {punishers?.map(({ startup, command, description }, index) => (
        <li key={`${command}-${index}`} className="flex items-baseline gap-2">
          {startup && (
            <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
              {startup}
            </span>
          )}
          <span>
            <Commands
              command={command}
              charUrl={charUrl}
              compressedCommandMap={compressedCommandMap}
            />
            {description && (
              <span className="text-sm text-muted-foreground">
                {' '}
                {description}
              </span>
            )}
          </span>
        </li>
      ))}
    </GuideCardColumn>
  );
};
