import { Command } from '~/components/Command';
import { getGuideSectionId } from '~/features/guideLanguage/texts/guideTexts';
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
  const { texts } = useGuideContext();

  return (
    <section className="my-6 mb-10" id={getGuideSectionId('wallCombos')}>
      <GuideSectionHeading section="wallCombos" />
      <div className="flex gap-2 md:gap-4 lg:gap-8">
        {!!normal.length && (
          <EnderList title={texts.normalWallCombos} enders={normal} />
        )}
        {!!tornado.length && (
          <EnderList title={texts.tornadoWallCombos} enders={tornado} />
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
