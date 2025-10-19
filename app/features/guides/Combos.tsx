import { Commands } from '~/components/Commands';
import { useGuideContext } from './GuideContext';
import { type Combo } from './GuideData';
import { GuideSectionHeading } from './GuideSectionHeading';
import { formatCombo } from './guideUtils';

type CombosProps = {
  combos: Combo[];
  title: string;
};
export const Combos = ({ combos, title }: CombosProps) => {
  const { charUrl, compressedCommandMap } = useGuideContext();
  return (
    <section className="my-6 mb-10" id={title.toLowerCase().replace(/ /g, '-')}>
      <GuideSectionHeading title={title} />
      {combos.map(({ combo, starter }) => (
        <section key={starter} className="my-2 mb-4">
          <Commands
            charUrl={charUrl}
            compressedCommandMap={compressedCommandMap}
            command={starter}
          />
          <div className="ml-4 mt-1">{formatCombo(combo)}</div>
        </section>
      ))}
    </section>
  );
};
