import { cx } from 'class-variance-authority';
import { Heading } from '@/components/ui/heading';
import { Commands } from '~/components/Commands';
import { TextWithCommand } from '~/components/TextWithCommand';
import { useGuideContext } from './GuideContext';
import { type Stance } from './GuideData';
import { GuideSectionHeading } from './GuideSectionHeading';
import { MoveSummary } from './MoveSummary';

type StancesProps = {
  stances: Stance[];
};
export const Stances = ({ stances }: StancesProps) => {
  const { charUrl, compressedCommandMap } = useGuideContext();
  return (
    <section className="my-6 mb-10" id="stances">
      <GuideSectionHeading section="stances" />
      {stances.map(({ type, command, description }, index) => (
        <section
          key={command}
          className={cx(
            'my-2 mb-4',
            type === 'stance' && index > 0 ? 'mt-10' : 'mt-2',
          )}
        >
          <Heading as="h3" size="3" className="mb-1">
            <Commands
              charUrl={charUrl}
              compressedCommandMap={compressedCommandMap}
              command={command}
            />
          </Heading>
          {description && (
            <TextWithCommand
              text={description}
              charUrl={charUrl}
              compressedCommandMap={compressedCommandMap}
            />
          )}
          <MoveSummary
            command={command}
            compressedCommandMap={compressedCommandMap}
          />
        </section>
      ))}
    </section>
  );
};
