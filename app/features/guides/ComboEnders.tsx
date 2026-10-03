import { Command } from '~/components/Command';
import { getGuideSectionId } from '~/features/guideLanguage/texts/guideTexts';
import { useGuideContext } from './GuideContext';
import { type ComboEnder } from './GuideData';
import { GuideSectionHeading } from './GuideSectionHeading';
import { formatCombo } from './guideUtils';

type ComboEndersProps = {
  comboEnders: ComboEnder[];
};
export const ComboEnders = ({ comboEnders }: ComboEndersProps) => {
  const carry = comboEnders.filter((c) => c.type === 'carry');
  const floorBreak = comboEnders.filter((c) => c.type === 'floor_break');
  const wallBreak = comboEnders.filter((c) => c.type === 'wall_break');
  const { texts } = useGuideContext();

  return (
    <section className="my-6 mb-10" id={getGuideSectionId('comboEnders')}>
      <GuideSectionHeading section="comboEnders" />
      <div className="flex gap-2 md:gap-4 lg:gap-8">
        {!!carry.length && (
          <EnderList title={texts.carryEnders} enders={carry} />
        )}
        {!!floorBreak.length && (
          <EnderList title={texts.floorBreakEnders} enders={floorBreak} />
        )}
        {!!wallBreak.length && (
          <EnderList title={texts.wallBreakEnders} enders={wallBreak} />
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
    <section className="grow">
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
