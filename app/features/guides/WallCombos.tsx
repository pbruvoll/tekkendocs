import { Command } from '~/components/Command';
import { useGuideContext } from './GuideContext';
import { type WallCombo } from './GuideData';
import { GuideSectionHeading } from './GuideSectionHeading';
import { formatCombo } from './guideUtils';

type WallCombosProps = {
  wallCombos: WallCombo[];
};
export const WallCombos = ({ wallCombos }: WallCombosProps) => {
  const normal = wallCombos.filter((c) => c.type === 'normal');
  const tornado = wallCombos.filter((c) => c.type === 'tornado');

  return (
    <section
      className="my-6 mb-10"
      id={'Combo Enders'.toLowerCase().replace(/ /g, '-')}
    >
      <GuideSectionHeading title="Wall Combos" />
      <div className="flex gap-2 md:gap-4 lg:gap-8">
        {!!normal.length && <EnderList title="Normal" enders={normal} />}
        {!!tornado.length && (
          <EnderList title="With tornado" enders={tornado} />
        )}
      </div>
    </section>
  );
};

const EnderList = ({
  title,
  enders,
}: {
  title: string;
  enders: { combo: string }[];
}) => {
  const { charUrl, compressedCommandMap } = useGuideContext();
  return (
    <section className="flex-grow">
      <div className="mb-2 bg-muted text-center">{title}</div>
      {enders?.map(({ combo }, index) => (
        <div key={index} className="mb-2">
          {combo.includes('>') ? (
            formatCombo(combo)
          ) : (
            <Command
              command={combo}
              charUrl={charUrl}
              compressedCommandMap={compressedCommandMap}
            />
          )}
        </div>
      ))}
    </section>
  );
};
