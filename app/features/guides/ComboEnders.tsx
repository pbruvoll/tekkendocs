import { Command } from '~/components/Command';
import { ComboSequence } from './ComboSequence';
import { GuideCardColumn } from './GuideCardColumn';
import { useGuideContext } from './GuideContext';
import { type ComboEnder } from './GuideData';
import { GuideSectionHeading } from './GuideSectionHeading';

type ComboEndersProps = {
  comboEnders: ComboEnder[];
};
export const ComboEnders = ({ comboEnders }: ComboEndersProps) => {
  const carry = comboEnders.filter((c) => c.type === 'carry');
  const floorBreak = comboEnders.filter((c) => c.type === 'floor_break');
  const wallBreak = comboEnders.filter((c) => c.type === 'wall_break');

  return (
    <section
      className="my-10"
      id={'Combo Enders'.toLowerCase().replace(/ /g, '-')}
    >
      <GuideSectionHeading title="Combo Enders" />
      <div className="grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
        {!!carry.length && <EnderList title="Carry" enders={carry} />}
        {!!floorBreak.length && (
          <EnderList title="Floor break" enders={floorBreak} />
        )}
        {!!wallBreak.length && (
          <EnderList title="Wall break" enders={wallBreak} />
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
