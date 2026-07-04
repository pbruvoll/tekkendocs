import { Commands } from '~/components/Commands';
import { ComboSequence } from './ComboSequence';
import { useGuideContext } from './GuideContext';
import { type Combo } from './GuideData';
import { GuideSectionHeading } from './GuideSectionHeading';

type CombosProps = {
  combos: Combo[];
  title: string;
};
export const Combos = ({ combos, title }: CombosProps) => {
  const { charUrl, compressedCommandMap } = useGuideContext();
  return (
    <section className="my-10" id={title.toLowerCase().replace(/ /g, '-')}>
      <GuideSectionHeading title={title} />
      <div className="grid gap-3">
        {combos.map(({ combo, starter }) => (
          <article
            key={starter}
            className="rounded-xl border border-border bg-card/50 p-4"
          >
            <h3 className="mb-2 font-semibold">
              <Commands
                charUrl={charUrl}
                compressedCommandMap={compressedCommandMap}
                command={starter}
              />
            </h3>
            <div className="grid gap-2">
              {combo.split(' | ').map((comboItem, index) => (
                <div key={`${comboItem}-${index}`}>
                  <ComboSequence combo={comboItem} />
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
