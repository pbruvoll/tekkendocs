import { AnimatePresence, motion } from 'motion/react';
import { type ReactNode } from 'react';

export type FlashCardDeckProps = {
  cardKey: string;
  children: ReactNode;
};

// Deck card variants for stacked background cards
const deckCardStyles = [
  // Card 1 - middle of deck (slightly offset)
  {
    id: 'deck-1',
    transform: 'translateX(8px) translateY(8px) rotate(2deg)',
    opacity: 0.6,
    zIndex: 1,
  },
  // Card 2 - back of deck (more offset)
  {
    id: 'deck-2',
    transform: 'translateX(16px) translateY(16px) rotate(4deg)',
    opacity: 0.3,
    zIndex: 0,
  },
];

// Animation variants for the active card
const cardVariants = {
  enter: {
    x: 300,
    opacity: 0,
    rotate: 15,
    scale: 0.9,
  },
  center: {
    x: 0,
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
  exit: {
    x: -300,
    opacity: 0,
    rotate: -15,
    scale: 0.9,
    transition: {
      duration: 0.3,
    },
  },
};

export const FlashCardDeck = ({ cardKey, children }: FlashCardDeckProps) => {
  return (
    <div className="relative h-115 w-80">
      {/* Background deck cards */}
      {deckCardStyles.map((style) => (
        <div
          key={style.id}
          className="absolute inset-0 rounded-2xl border border-border/50 bg-muted/50 shadow-md"
          style={{
            transform: style.transform,
            opacity: style.opacity,
            zIndex: style.zIndex,
          }}
        />
      ))}

      {/* Active card with animations */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={cardKey}
          className="absolute inset-0"
          style={{ zIndex: 10 }}
          variants={cardVariants}
          initial="enter"
          animate="center"
          exit="exit"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
