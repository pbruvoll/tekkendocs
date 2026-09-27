import { motion } from 'motion/react';
import { InView } from '@/components/core/InView';
import { RankCard } from '~/features/ranks/components/RankCard';
import {
  getGroupPointRange,
  type RankGroup,
} from '~/features/ranks/utils/rankGroups';

export type RankGroupSectionProps = {
  group: RankGroup;
  accent: string;
  /** Ladder position of this group's first rank, starting at 1. */
  startPosition: number;
};

export const RankGroupSection = ({
  group,
  accent,
  startPosition,
}: RankGroupSectionProps) => {
  return (
    <section
      style={{ '--rank-accent': accent } as React.CSSProperties}
      className="scroll-mt-header-height"
      aria-labelledby={`rank-group-${startPosition}`}
    >
      <div className="mb-3 flex items-center gap-3">
        <span
          aria-hidden
          className="h-6 w-1 shrink-0 rounded-full bg-(--rank-accent)"
        />
        <h2
          id={`rank-group-${startPosition}`}
          className="text-base font-semibold tracking-tight text-(--rank-accent) xs:text-lg"
        >
          {group.name}
        </h2>
        <span className="text-xs tabular-nums text-muted-foreground xs:text-sm">
          {getGroupPointRange(group)}
        </span>
        <span
          aria-hidden
          className="h-px grow bg-linear-to-r from-(--rank-accent)/40 to-transparent"
        />
      </div>

      <InView
        viewOptions={{ once: true, margin: '0px 0px -80px 0px' }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.04 } },
        }}
      >
        {/* One grid for every group, so a rank plate is the same size wherever
            it sits on the ladder, even though most groups leave the last row
            short. */}
        <ul className="grid grid-cols-2 gap-2 xs:grid-cols-3 xs:gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {group.ranks.map((rank, index) => (
            <motion.li
              key={rank.name}
              className="h-full"
              variants={{
                hidden: { opacity: 0, translateY: 16, filter: 'blur(6px)' },
                visible: { opacity: 1, translateY: 0, filter: 'blur(0px)' },
              }}
            >
              <RankCard
                accent={accent}
                image={rank.image}
                name={rank.name}
                points={rank.points}
                position={startPosition + index}
              />
            </motion.li>
          ))}
        </ul>
      </InView>
    </section>
  );
};
