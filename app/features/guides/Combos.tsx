import { Commands } from '~/components/Commands';
import {
  type GuideSectionKey,
  getGuideSectionId,
} from '~/features/guideLanguage/texts/guideTexts';
import { useGuideContext } from './GuideContext';
import { type Combo } from './GuideData';
import { GuideSectionHeading } from './GuideSectionHeading';
import { formatCombo } from './guideUtils';

type CombosProps = {
  combos: Combo[];
  section: GuideSectionKey;
};
export const Combos = ({ combos, section }: CombosProps) => {
  const { charUrl, compressedCommandMap } = useGuideContext();
  return (
    <section className="my-6 mb-10" id={getGuideSectionId(section)}>
      <GuideSectionHeading section={section} />
      {combos.map(({ combo, starter }) => (
        <section key={starter} className="my-2 mb-4">
          <Commands
            charUrl={charUrl}
            compressedCommandMap={compressedCommandMap}
            command={starter}
          />
          {combo.split(' | ').map((comboItem, index) => (
            <div className="ml-4 mt-1" key={index}>
              {formatCombo(comboItem)}
            </div>
          ))}
        </section>
      ))}
    </section>
  );
};
