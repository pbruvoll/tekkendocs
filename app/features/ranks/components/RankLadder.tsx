import { RankGroupSection } from '~/features/ranks/components/RankGroupSection';
import { getRankGroupAccent } from '~/features/ranks/rankGroupAccents';
import { rankGroups } from '~/features/ranks/utils/rankGroups';

export const RankLadder = () => {
  let position = 1;
  return (
    <div className="flex flex-col gap-8">
      {rankGroups.map((group) => {
        const startPosition = position;
        position += group.ranks.length;
        return (
          <RankGroupSection
            key={group.name}
            group={group}
            accent={getRankGroupAccent(group.name)}
            startPosition={startPosition}
          />
        );
      })}
    </div>
  );
};
