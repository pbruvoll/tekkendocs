import { AnimatePresence, motion } from 'motion/react';
import { MoveVideo } from '~/components/MoveVideo';
import { type Move } from '~/types/Move';
import { ToggleVideoButton } from './ToggleVideoButton';

/** The video of a guide move, expanding below it with a button to close it. */
export const MoveVideoPanel = ({
  move,
  showVideo,
  setShowVideo,
  className,
}: {
  move?: Move;
  showVideo: boolean;
  setShowVideo: (show: boolean) => void;
  className?: string;
}) => (
  <AnimatePresence>
    {showVideo && move && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{ overflow: 'hidden' }}
        className={className}
      >
        <MoveVideo className="max-w-96 my-2" move={move} />
        <ToggleVideoButton
          showVideo={showVideo}
          className="mb-2"
          setShowVideo={setShowVideo}
        />
      </motion.div>
    )}
  </AnimatePresence>
);
