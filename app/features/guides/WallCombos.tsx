import { Command } from '~/components/Command';
import { ComboSequence } from './ComboSequence';
import { GuideCardColumn } from './GuideCardColumn';
import { useGuideContext } from './GuideContext';
import { type WallCombo } from './GuideData';
import { GuideSectionHeading } from './GuideSectionHeading';

type WallCombosProps = {
  wallCombos: WallCombo[];
};
export const WallCombos = ({ wallCombos }: WallCombosProps) => {
  const normal = wallCombos.filter((c) => c.type === 'normal');
  const tornado = wallCombos.filter((c) => c.type === 'tornado');

  return (
    <section
      className="my-10"
      id={'Wall Combos'.toLowerCase().replace(/ /g, '-')}
    >
      <GuideSectionHeading title="Wall Combos" />
      <div className="grid items-start gap-4 md:grid-cols-2">
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
    <GuideCardColumn title={title}>
      {enders?.map(({ combo }, index) => (
        <li key={`${combo}-${index}`}>
          {combo.includes('>') ? (
            <ComboSequence combo={combo} />
          ) : (
            <Command
              command={combo}
              charUrl={charUrl}
              compressedCommandMap={compressedCommandMap}
            />
          )}
        </li>
      ))}
    </GuideCardColumn>
  );
};
