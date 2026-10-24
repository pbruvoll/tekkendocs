import { Heading } from '~/components/ui/heading';

type KeyGroup = {
  title: string;
  entries: [code: string, meaning: string][];
};

const keyGroups: KeyGroup[] = [
  {
    title: 'Commands',
    entries: [
      ['f, b, u, d', 'Forward, back, up, down. A capital letter is held'],
      ['f,F', 'Dash'],
      ['f,f,F', 'Run'],
      ['~', 'Immediately after'],
      ['*', 'Hold the button'],
      ['ws', 'While standing up'],
      ['FC.', 'While crouching'],
      ['SS.', 'During sidestep'],
      ['BT.', 'Back turned'],
      ['OTG.', 'Against a grounded opponent'],
    ],
  },
  {
    title: 'Hit levels',
    entries: [
      ['h, m, l', 'High, mid, low'],
      ['sm', 'Special mid'],
      ['t', 'Throw'],
      ['!', 'Unblockable'],
      ['M, L', 'Hits a grounded opponent'],
    ],
  },
  {
    title: 'Frames',
    entries: [
      ['a', 'Opponent is launched'],
      ['d', 'Opponent is knocked down'],
      ['c', 'Crouching'],
      ['g', 'Opponent can only block'],
      ['s', 'Opponent is staggered'],
      ['KND', 'Knockdown'],
      ['JG', 'Launch'],
      ['+, -', 'Plus or minus, the exact frames are not known'],
    ],
  },
  {
    title: 'Positions',
    entries: [
      ['FUFA', 'Face up, feet away'],
      ['FUFT', 'Face up, feet towards'],
      ['FDFA', 'Face down, feet away'],
      ['FDFT', 'Face down, feet towards'],
    ],
  },
];

/** Explains the notation of the T6 frame data, which is the same as for the T8 frame data */
export const NotationKey = () => {
  return (
    <section className="mt-8">
      <Heading as="h2" size="4" className="mb-3">
        Notation
      </Heading>
      <div className="grid gap-4 sm:grid-cols-2">
        {keyGroups.map(({ title, entries }) => (
          <div key={title}>
            <h3 className="mb-1 text-sm font-semibold">{title}</h3>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm">
              {entries.map(([code, meaning]) => (
                <div key={code} className="contents">
                  <dt className="font-semibold text-primary">{code}</dt>
                  <dd className="text-muted-foreground">{meaning}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
};
