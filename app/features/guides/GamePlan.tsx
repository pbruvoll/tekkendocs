import { TextWithCommand } from '~/components/TextWithCommand';
import { useGuideContext } from './GuideContext';
import { GuideSectionHeading } from './GuideSectionHeading';

type GamePlanProps = {
  sections: string[];
};
export const GamePlan = ({ sections }: GamePlanProps) => {
  const { charUrl, compressedCommandMap } = useGuideContext();
  return (
    <section id="game-plan" className="my-6 mb-10">
      <GuideSectionHeading title="Game Plan" />
      {sections.map((section, index) => (
        <p key={index} className="my-2 mb-4">
          <TextWithCommand
            text={section}
            charUrl={charUrl}
            compressedCommandMap={compressedCommandMap}
          />
        </p>
      ))}
    </section>
  );
};
