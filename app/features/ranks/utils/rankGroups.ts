import { type T8Rank, t8Ranks } from '~/constants/t8Ranks';

export type Rank = Omit<T8Rank, 'group'>;

export type RankGroup = {
  name: string;
  ranks: Rank[];
};

export const rankGroups: RankGroup[] = t8Ranks.reduce<RankGroup[]>(
  (groups, rank) => {
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
  },
  [],
);

export const formatPoints = (points: number | undefined): string =>
  points === undefined ? '???' : points.toLocaleString('en-US');

/** "0 – 8,000 pts" for the group, so you can see the span it covers at a glance. */
export const getGroupPointRange = ({ ranks }: RankGroup): string => {
  const first = ranks[0]?.points;
  const last = ranks[ranks.length - 1]?.points;
  if (first === undefined || last === undefined) {
    return '';
  }
  return first === last
    ? `${formatPoints(first)} pts`
    : `${formatPoints(first)} – ${formatPoints(last)} pts`;
};
