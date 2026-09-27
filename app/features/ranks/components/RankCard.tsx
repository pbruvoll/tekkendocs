import { formatPoints, type Rank } from '~/features/ranks/utils/rankGroups';

export type RankCardProps = Rank & {
  accent: string;
  /** Position in the full ladder, starting at 1. */
  position: number;
};

export const RankCard = ({
  image,
  name,
  points,
  accent,
  position,
}: RankCardProps) => {
  return (
    <article
      style={{ '--rank-accent': accent } as React.CSSProperties}
      className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition duration-300 hover:-translate-y-1 hover:border-(--rank-accent) hover:shadow-[0_0_0_1px_var(--rank-accent),0_10px_30px_-12px_var(--rank-accent)]"
    >
      <div className="relative">
        <img
          src={image}
          alt=""
          loading="lazy"
          className="aspect-[2] w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-1 top-1 rounded bg-black/55 px-1.5 py-0.5 text-[0.65rem] font-medium tabular-nums text-white/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          #{position}
        </span>
      </div>
      <div className="flex grow flex-col items-center gap-0.5 px-2 py-2 text-center">
        <h3 className="text-sm font-medium leading-tight">{name}</h3>
        <p className="text-xs tabular-nums text-muted-foreground">
          <span className="text-(--rank-accent)">{formatPoints(points)}</span>{' '}
          pts
        </p>
      </div>
      <div
        aria-hidden
        className="h-0.5 w-full origin-left scale-x-0 bg-(--rank-accent) transition-transform duration-300 group-hover:scale-x-100"
      />
    </article>
  );
};
