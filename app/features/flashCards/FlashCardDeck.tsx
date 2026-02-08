import { AnimatePresence, motion } from 'motion/react';
import { type ReactNode } from 'react';

export type FlashCardDeckProps = {
  cardKey: string;
  children: ReactNode;
};

// Deck card variants for stacked background cards
// Uses scale + vertical offset to stay within bounds (no overflow)
const deckCardStyles = [
  // Card 1 - middle of deck
  {
    id: 'deck-1',
    transform: 'translateY(6px) translateX(6px)',
    opacity: 0.8,
    zIndex: 1,
  },
  // Card 2 - back of deck
  {
    id: 'deck-2',
    transform: 'translateY(12px) translateX(12px)',
    opacity: 0.5,
    zIndex: 0,
  },
];

// Animation variants for the active card
// Enter: starts at the deck-1 position (behind the active card), then scales up
// Exit: flies off to the left like a discarded card
const cardVariants = {
  enter: {
    y: 8,
    opacity: 0.8,
    scale: 0.95,
  },
  center: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.15,
      ease: 'easeOut' as const,
    },
  },
  exit: {
    x: -300,
    opacity: 0,
    rotate: -10,
    scale: 0.95,
    transition: {
      duration: 0.15,
    },
  },
};

export const FlashCardDeck = ({ cardKey, children }: FlashCardDeckProps) => {
  return (
    <div className="relative h-115 w-full max-w-80">
      {/* Background deck cards */}
      {deckCardStyles.map((style) => (
        <div
          key={style.id}
          className="absolute inset-0 rounded-2xl border border-border bg-muted shadow-md"
          style={{
            transform: style.transform,
            opacity: style.opacity,
            zIndex: style.zIndex,
          }}
        />
      ))}

      {/* Active card with animations */}
      <AnimatePresence mode="wait">
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
