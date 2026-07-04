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
    <section className="my-10" id="frame-traps">
      <GuideSectionHeading title="Frame Traps" />
      <div className="grid gap-2">
        {frameTraps.map(({ starter, trap }) => (
          <div
            key={starter}
            className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card/50 px-3 py-2"
          >
            <span>
              <Commands
                charUrl={charUrl}
                compressedCommandMap={compressedCommandMap}
                command={starter}
              />
            </span>
            <span aria-hidden className="text-muted-foreground/70">
              →
            </span>
            <span>
              <Commands
                charUrl={charUrl}
                compressedCommandMap={compressedCommandMap}
                command={trap}
              />
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
