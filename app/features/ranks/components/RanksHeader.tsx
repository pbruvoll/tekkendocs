import { getRankGroupAccent } from '~/features/ranks/rankGroupAccents';
import { rankGroups } from '~/features/ranks/utils/rankGroups';

const rankCount = rankGroups.reduce(
  (total, group) => total + group.ranks.length,
  0,
);

/** The whole ladder as one gradient, each group taking a share of its size. */
const spectrum = `linear-gradient(to right, ${rankGroups
  .map((group) => getRankGroupAccent(group.name))
  .join(', ')})`;

export const RanksHeader = () => {
  return (
    <header className="mb-8 translate-y-0 opacity-100 transition-[opacity,translate] duration-500 ease-out motion-reduce:transition-none starting:translate-y-3 starting:opacity-0">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Tekken 8 · Season 2
      </p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">Ranks</h1>
      <p className="mt-2 max-w-prose leading-relaxed text-muted-foreground">
        All {rankCount} ranks in Tekken 8, from Beginner to God of Destruction
        &#8734;, with the rank points needed to reach each one.
      </p>
      <div
        aria-hidden
        style={{ backgroundImage: spectrum }}
        className="mt-5 h-1 w-full origin-left rounded-full transition-transform duration-700 ease-out motion-reduce:transition-none starting:scale-x-0"
      />
    </header>
  );
};
