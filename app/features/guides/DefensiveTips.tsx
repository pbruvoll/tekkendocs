import { Heading } from '@radix-ui/themes';
import { TextWithCommand } from '~/components/TextWithCommand';
import { useGuideContext } from './GuideContext';
import { type DefensiveTip } from './GuideData';
import { GuideSectionHeading } from './GuideSectionHeading';

type DefensiveTipsProps = {
  tips: DefensiveTip[];
};
export const DefensiveTips = ({ tips }: DefensiveTipsProps) => {
  const { charUrl, compressedCommandMap } = useGuideContext();
  return (
    <section className="my-10" id="defensive-tips">
      <GuideSectionHeading title="Defensive tips" />
      <div className="grid gap-3">
        {tips.map(({ title, description }) => (
          <section
            key={title}
            className="rounded-xl border border-border bg-card/50 p-4"
          >
            <Heading as="h3" mb="1" size="3">
              {title}
            </Heading>
            <div className="leading-relaxed">
              <TextWithCommand
                text={description}
                charUrl={charUrl}
                compressedCommandMap={compressedCommandMap}
              />
            </div>
          </section>
        ))}
      </div>
    </section>
  );
};
