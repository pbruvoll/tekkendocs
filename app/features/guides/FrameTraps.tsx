import { Commands } from '~/components/Commands';
import { useGuideContext } from './GuideContext';
import { type FrameTrap } from './GuideData';
import { GuideSectionHeading } from './GuideSectionHeading';

type FrameTrapsProps = {
  frameTraps: FrameTrap[];
};
export const FrameTraps = ({ frameTraps }: FrameTrapsProps) => {
  const { charUrl, compressedCommandMap } = useGuideContext();
  return (
    <section className="my-6 mb-10" id="frame-traps">
      <GuideSectionHeading section="frameTraps" />
      {frameTraps.map(({ starter, trap }, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: Static list, and starters can repeat
        <section key={index} className="my-2 mb-4">
          <Commands
            charUrl={charUrl}
            compressedCommandMap={compressedCommandMap}
            command={starter}
          />{' '}
          →{' '}
          <Commands
            charUrl={charUrl}
            compressedCommandMap={compressedCommandMap}
            command={trap}
          />
        </section>
      ))}
    </section>
  );
};
