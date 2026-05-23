import { Card, Inset } from '@radix-ui/themes';
import { type MetaFunction } from 'react-router';
import { ContentContainer } from '~/components/ContentContainer';
import { type T8Rank, t8Ranks } from '~/constants/t8Ranks';
import { generateMetaTags } from '~/utils/seoUtils';

type Rank = Omit<T8Rank, 'group'>;

type RankGroup = {
  name: string;
  ranks: Rank[];
};

const rankGroups: RankGroup[] = t8Ranks.reduce<RankGroup[]>((groups, rank) => {
  const normalizedRank: Rank = {
    name: rank.name,
    image: rank.image,
    points: rank.points,
  };

  const currentGroup = groups[groups.length - 1];

  if (currentGroup?.name === rank.group) {
    currentGroup.ranks.push(normalizedRank);
    return groups;
  }

  groups.push({ name: rank.group, ranks: [normalizedRank] });
  return groups;
}, []);

export const meta: MetaFunction = ({ matches }) => {
  return generateMetaTags({
    title: 'Tekken 8 ranks',
    description: 'A list of all ranks in tekken 8',
    matches,
    image: { url: `/t8/pages/ranks.png` },
    url: `/t8/ranks`,
  });
};

const Ranks = () => {
  return (
    <ContentContainer enableBottomPadding enableTopPadding>
      <h1 className="text-xl">Tekken 8 Ranks - Season 2</h1>
      {rankGroups.map((rg) => (
        <RankGroupSection key={rg.name} name={rg.name} ranks={rg.ranks} />
      ))}
    </ContentContainer>
  );
};

export default Ranks;

const RankCard = ({ image, name, points }: Rank) => {
  return (
    <Card>
      <Inset clip="padding-box" side="top" pb="current">
        <img src={image} className="aspect-[2] w-full" alt={name} />
      </Inset>
      <div className="flex flex-col flex-wrap items-center gap-1 text-center text-sm">
        <div>{name}</div>
        <div>{points ?? '???'} pts</div>
      </div>
    </Card>
  );
};

const RankGroupSection = ({ name, ranks }: RankGroup) => {
  return (
    <section className="mt-6">
      <h2 className="mt-3 text-lg">{name}</h2>
      <div className="mt-3 grid grid-cols-3 gap-2 md:grid-cols-4 lg:grid-cols-5">
        {ranks.map((r) => (
          <RankCard
            key={r.name}
            image={r.image}
            name={r.name}
            points={r.points}
          />
        ))}
      </div>
    </section>
  );
};
