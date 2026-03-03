import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import { type GameRouteId } from '~/types/GameRouteId';
import { type Move } from '~/types/Move';
import { type MoveFilter } from '~/types/MoveFilter';
import { filterMoves, sortMovesV2 } from '~/utils/frameDataUtils';
import { getSortSettings } from '~/utils/sortingUtils';
import { type FrameDataViewMode } from '~/utils/userSettings';
import { ContentContainer } from './ContentContainer';
import { FrameDataTable } from './FrameDataTableV2';
import { MoveCardWithVideoList } from './MoveCardWithVideoList';
import { SimpleMovesTable } from './SimpleMovesTable';

export type DynamicFrameDataListProps = {
  gameRouteId: GameRouteId;
  charId?: string;
  moves: Move[];
  filter?: MoveFilter;
  className?: string;
  viewMode: FrameDataViewMode;
};

const maxMovesToShow = 400;

const getPageSearchParams = (searchParams: URLSearchParams, page: number) => {
  const nextSearchParams = new URLSearchParams(searchParams);
  nextSearchParams.set('page', String(page));
  return `?${nextSearchParams.toString()}`;
};

const PAGE_KEY = 'page';

export const DynamicFrameDataList = ({
  gameRouteId,
  charId,
  moves,
  className,
  filter,
  viewMode,
}: DynamicFrameDataListProps) => {
  const [searchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get(PAGE_KEY) || '1', 10);

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

  const totalPages = Math.max(
    1,
    Math.ceil(sortedMoves.length / maxMovesToShow),
  );
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const paginatedMoves = useMemo(() => {
    if (sortedMoves.length > maxMovesToShow) {
      return sortedMoves.slice(
        (currentPage - 1) * maxMovesToShow,
        currentPage * maxMovesToShow,
      );
    }
    return sortedMoves;
  }, [sortedMoves, currentPage]);

  const FrameDataList = useMemo(() => {
    switch (viewMode) {
      case 'videoCards':
        return MoveCardWithVideoList;
      case 'simple':
        return SimpleMovesTable;
      case 'default':
        return FrameDataTable;
    }
  }, [viewMode]);

  return (
    <>
      <FrameDataList
        gameRouteId={gameRouteId}
        charId={charId}
        moves={paginatedMoves}
        className={className}
        sortSettings={sortSettings}
      />
      <ContentContainer className="my-4">
        {hasPrev && (
          <Link
            className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded border text-primary transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            to={getPageSearchParams(searchParams, currentPage - 1)}
          >
            {'<'}
          </Link>
        )}
        Showing{' '}
        {currentPage > 1 ? `${(currentPage - 1) * maxMovesToShow + 1}-` : ''}
        {sortedMoves.length > maxMovesToShow &&
          `${Math.min(currentPage * maxMovesToShow, sortedMoves.length)} of `}
        {`${sortedMoves.length} moves`}
        {hasNext && (
          <Link
            className="ml-2 inline-flex h-7 w-7 items-center justify-center rounded border text-primary transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            to={getPageSearchParams(searchParams, currentPage + 1)}
          >
            {'>'}
          </Link>
        )}
      </ContentContainer>
    </>
  );
};
