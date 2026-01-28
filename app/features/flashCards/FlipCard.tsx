import { motion } from 'motion/react';
import { type ReactNode } from 'react';

export type FlipCardProps = {
  flipped: boolean;
  front: ReactNode;
  back: ReactNode;
  className?: string;
};

export const FlipCard = ({
  flipped,
  front,
  back,
  className,
}: FlipCardProps) => {
  return (
    <div className={className} style={{ perspective: '1200px' }}>
      <motion.div
        className="relative h-full w-full"
        initial={false}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{
          duration: 0.6,
          type: 'spring',
          stiffness: 100,
          damping: 15,
        }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front face */}
        <div
          className="absolute inset-0 h-full w-full overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {front}
        </div>

        {/* Back face */}
        <div
          className="absolute inset-0 h-full w-full overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {back}
        </div>
      </motion.div>
    </div>
  );
};
