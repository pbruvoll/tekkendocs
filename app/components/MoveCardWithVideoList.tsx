import cx from 'classix';
import { type FrameDataListProps } from '~/types/FrameDataListProps';
import { type MoveT8 } from '~/types/Move';
import { charIdFromMove, commandToUrlSegmentEncoded } from '~/utils/moveUtils';
import { ContentContainer } from './ContentContainer';
import { MoveCardWithVideo } from './MoveCardWithVideo';

type MoveCardWithVideoListProps = FrameDataListProps;

export function MoveCardWithVideoList({
  gameRouteId,
  charId,
  moves,
  forceShowCharacter,
  className,
}: MoveCardWithVideoListProps) {
  const showCharacter = forceShowCharacter || !charId;
  return (
    <ContentContainer>
      <div className={cx('flex flex-col items-center gap-4', className)}>
        {moves.map((move) => {
          const computedCharId = charId || charIdFromMove(move as MoveT8);
          const urlSegment = commandToUrlSegmentEncoded(move.command);
          const moveUrl = `/${gameRouteId}/${computedCharId}/${urlSegment}`;

          return (
            <MoveCardWithVideo
              key={move.wavuId || `${computedCharId}-${move.command}`}
              move={move}
              moveUrl={moveUrl}
              showCharacter={showCharacter}
              charId={computedCharId}
            />
          );
        })}
      </div>
    </ContentContainer>
  );
}
