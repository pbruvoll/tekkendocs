import { useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { type Move } from '~/types/Move';
import { type MoveFilter } from '~/types/MoveFilter';
import { filterMoves, sortMovesV2 } from '~/utils/frameDataUtils';
import { getSortSettings } from '~/utils/sortingUtils';
import { type FrameDataViewMode } from '~/utils/userSettings';
import { ContentContainer } from './ContentContainer';
import { FrameDataTable } from './FrameDataTableV2';
import { SimpleMovesTable } from './SimpleMovesTable';

export type DynamicFrameDataListProps = {
  moves: Move[];
  filter?: MoveFilter;
  className?: string;
  hasMultipleCharacters: boolean;
  viewMode: FrameDataViewMode;
};

const maxMovesToShow = 400;

export const DynamicFrameDataList = ({
  moves,
  className,
  filter,
  hasMultipleCharacters,
  viewMode,
}: DynamicFrameDataListProps) => {
  const [searchParams] = useSearchParams();
  const sortSettings = useMemo(
    () => getSortSettings(searchParams),
    [searchParams],
  );

  const filteredMoves = useMemo(() => {
    return filterMoves(moves, filter);
  }, [filter, moves]);

  const sortedMoves = useMemo(() => {
    return sortMovesV2(filteredMoves, sortSettings);
  }, [filteredMoves, sortSettings]);

  const paginatedMoves = useMemo(() => {
    if (sortedMoves.length > maxMovesToShow) {
      return sortedMoves.slice(0, maxMovesToShow);
    }
    return sortedMoves;
  }, [sortedMoves]);

  return (
    <>
      {viewMode === 'default' ? (
        <FrameDataTable
          className={className}
          moves={paginatedMoves}
          hasMultipleCharacters={hasMultipleCharacters}
        />
      ) : (
        <SimpleMovesTable
          className={className}
          moves={paginatedMoves}
          hasMultipleCharacters={hasMultipleCharacters}
        />
      )}
      {paginatedMoves.length < sortedMoves.length && (
        <ContentContainer className="my-4">
          Showing {paginatedMoves.length} of {sortedMoves.length} moves
        </ContentContainer>
      )}
    </>
  );
};
