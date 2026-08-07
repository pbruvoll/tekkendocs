import { Heading } from '@radix-ui/themes';
import { Commands } from '~/components/Commands';
import { TextWithCommand } from '~/components/TextWithCommand';
import { useGuideContext } from './GuideContext';
import { type Stance } from './GuideData';
import { GuideSectionHeading } from './GuideSectionHeading';
import { MoveSummary } from './MoveSummary';

type StancesProps = {
  stances: Stance[];
};

/** Groups the flat stance list into one group per stance, with its moves below it */
const groupStances = (stances: Stance[]) => {
  const groups: { stance?: Stance; moves: Stance[] }[] = [];
  for (const entry of stances) {
    if (entry.type === 'stance' || !groups.length) {
      groups.push(
        entry.type === 'stance'
          ? { stance: entry, moves: [] }
          : { moves: [entry] },
      );
    } else {
      groups[groups.length - 1].moves.push(entry);
    }
  }
  return groups;
};

export const Stances = ({ stances }: StancesProps) => {
  const { charUrl, compressedCommandMap } = useGuideContext();
  const groups = groupStances(stances);
  return (
    <section className="my-10" id="stances">
      <GuideSectionHeading title="Stances" />
      <div className="grid gap-4">
        {groups.map(({ stance, moves }, index) => (
          <article
            key={stance?.command ?? `group-${index}`}
            className="rounded-xl border border-border bg-card/50 p-4"
          >
            {stance && (
              <div>
                <Heading as="h3" size="4">
                  <Commands
                    charUrl={charUrl}
                    compressedCommandMap={compressedCommandMap}
                    command={stance.command}
                  />
                </Heading>
                {stance.description && (
                  <div className="mt-2 leading-relaxed">
                    <TextWithCommand
                      text={stance.description}
                      charUrl={charUrl}
                      compressedCommandMap={compressedCommandMap}
                    />
                  </div>
                )}
                <MoveSummary
                  className="mt-2"
                  command={stance.command}
                  compressedCommandMap={compressedCommandMap}
                />
              </div>
            )}
            {!!moves.length && (
              <div className="mt-4 grid gap-4 border-l-2 border-border pl-4">
                {moves.map(({ command, description }) => (
                  <div key={command}>
                    <Heading as="h4" size="3">
                      <Commands
                        charUrl={charUrl}
                        compressedCommandMap={compressedCommandMap}
                        command={command}
                      />
                    </Heading>
                    {description && (
                      <div className="mt-1 leading-relaxed">
                        <TextWithCommand
                          text={description}
                          charUrl={charUrl}
                          compressedCommandMap={compressedCommandMap}
                        />
                      </div>
                    )}
                    <MoveSummary
                      className="mt-1.5"
                      command={command}
                      compressedCommandMap={compressedCommandMap}
                    />
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};
