import { useWindowVirtualizer } from '@tanstack/react-virtual';
import cx from 'classix';
import { useRef } from 'react';
import { type FrameDataListProps } from '~/types/FrameDataListProps';
import { type MoveT8 } from '~/types/Move';
import { charIdFromMove, commandToUrlSegmentEncoded } from '~/utils/moveUtils';
import { ContentContainer } from './ContentContainer';
import { MoveCardWithVideo } from './MoveCardWithVideo';

type MoveCardWithVideoListProps = FrameDataListProps;

// Estimated height of each MoveCardWithVideo component (in pixels)
const ESTIMATED_ITEM_HEIGHT = 350;
const GAP_SIZE = 16; // gap-4 = 1rem = 16px

export function MoveCardWithVideoList({
  gameRouteId,
  charId,
  moves,
  forceShowCharacter,
  className,
}: MoveCardWithVideoListProps) {
  const showCharacter = forceShowCharacter || !charId;
  const listRef = useRef<HTMLDivElement>(null);

  const virtualizer = useWindowVirtualizer({
    count: moves.length,
    estimateSize: () => ESTIMATED_ITEM_HEIGHT + GAP_SIZE,
    scrollMargin: listRef.current?.offsetTop ?? 0,
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <ContentContainer>
      <div
        ref={listRef}
        className={cx('flex flex-col items-center', className)}
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => {
          const move = moves[virtualItem.index];
          const computedCharId = charId || charIdFromMove(move as MoveT8);
          const urlSegment = commandToUrlSegmentEncoded(move.command);
          const moveUrl = `/${gameRouteId}/${computedCharId}/${urlSegment}`;

          return (
            <div
              key={move.wavuId || `${computedCharId}-${move.command}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                transform: `translateY(${virtualItem.start - virtualizer.options.scrollMargin}px)`,
              }}
            >
              <MoveCardWithVideo
                move={move}
                moveUrl={moveUrl}
                showCharacter={showCharacter}
                charId={computedCharId}
              />
            </div>
          );
        })}
      </div>
    </ContentContainer>
  );
}
