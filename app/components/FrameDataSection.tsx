import { Filter, X } from 'lucide-react';
import { useDeferredValue, useId, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { Input } from '~/components/ui/input';
import {
  NativeSelect,
  NativeSelectOption,
} from '~/components/ui/native-select';
import { filterKey } from '~/constants/filterConstants';
import { orderByKey } from '~/constants/sortConstants';
import { sortOptions } from '~/constants/sortOptions';
import { useFavorites } from '~/features/favorites/useFavorites';
import { useSearchParamState } from '~/hooks/useSearchParamState';
import { type GameRouteId } from '~/types/GameRouteId';
import { type Move } from '~/types/Move';
import { type MoveFilter } from '~/types/MoveFilter';
import { getFilterFromParams } from '~/utils/filterUtils';
import { getMoveFilterTypes } from '~/utils/frameDataUtils';
import * as filterUtils from '~/utils/searchParamsFilterUtils';
import {
  getSortByQueryParamValue,
  getSortSettings,
} from '~/utils/sortingUtils';
import { type FrameDataViewMode, useUserSettings } from '~/utils/userSettings';
import { ContentContainer } from './ContentContainer';
import { DynamicFrameDataList } from './DynamicFrameDataList';
import { FrameDataFilterDialog } from './FrameDataFilterDialog';

const viewMode = 'viewMode';

const isFrameDataViewMode = (
  value: string | null,
): value is FrameDataViewMode =>
  value === 'default' ||
  value === 'table' ||
  value === 'simple' ||
  value === 'videoCards';

export type FrameDataSectionProps = {
  gameRouteId: GameRouteId;
  charId?: string;
  moves: Move[];
};
export const FrameDataSection = ({
  gameRouteId,
  charId,
  moves,
}: FrameDataSectionProps) => {
  const viewModeId = useId();
  const [searchParams, setSearchParams] = useSearchParams();
  const viewModeFromSearchParams = searchParams.get(viewMode);

  const { frameDataViewMode: viewModeFromStore, setFrameDataViewMode } =
    useUserSettings();
  const frameDataViewMode = isFrameDataViewMode(viewModeFromSearchParams)
    ? viewModeFromSearchParams
    : viewModeFromStore;

  const sortSettings = getSortSettings(searchParams);
  const sortByQueryParamValue = sortSettings
    ? getSortByQueryParamValue(sortSettings)
    : '';

  const filterFromUrl: MoveFilter = useMemo(
    () => getFilterFromParams(searchParams),
    [searchParams],
  );

  const [searchQuery, setSearchQuery] = useSearchParamState(filterKey.Query);

  const filter = useMemo(
    () => ({ ...filterFromUrl, searchQuery: searchQuery || undefined }),
    [filterFromUrl, searchQuery],
  );

  // Lets React keep the input responsive while filtering the move list lags behind
  const deferredFilter = useDeferredValue(filter);

  const moveTypes = useMemo(() => getMoveFilterTypes(moves), [moves]);

  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  return (
    <>
      <ContentContainer className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex w-full items-center gap-2 mt-1 sm:w-auto">
          <Filter className="shrink-0" />
          <div className="relative w-full">
            <Input
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search moves, ff2,1+2, power crush, etc."
              value={searchQuery}
              className="pr-8"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <div className="flex-1 sm:flex-none">
            <NativeSelect
              size="sm"
              className="w-full max-w-48"
              aria-label="Sort by"
              value={sortByQueryParamValue}
              onChange={(e) => {
                setSearchParams((prev) => {
                  if (e.target.value) {
                    prev.set(orderByKey, e.target.value);
                  } else {
                    prev.delete(orderByKey);
                  }
                  return prev;
                });
              }}
            >
              <NativeSelectOption value="">Sort by</NativeSelectOption>
              {sortOptions.map(({ displayName, value }) => (
                <NativeSelectOption key={value} value={value}>
                  {displayName}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          <FrameDataFilterDialog
            filter={filter}
            stances={moveTypes.stances}
            states={moveTypes.states}
            transitions={moveTypes.transitions}
            removeFilterValue={(key) =>
              filterUtils.removeFilterValue(setSearchParams, key)
            }
            setFilterValue={(key, value) =>
              filterUtils.setFilterValue(setSearchParams, key, value)
            }
            updateFilterValues={(changes) =>
              filterUtils.updateFilterValues(setSearchParams, changes)
            }
            addFilterElement={(key, element) =>
              filterUtils.addFilterElement(setSearchParams, key, element)
            }
            removeFilterElement={(key, element) =>
              filterUtils.removeFilterElement(setSearchParams, key, element)
            }
          />
        </div>
      </ContentContainer>

      <ContentContainer className="flex items-center gap-2 py-2">
        <label htmlFor={viewModeId} className="text-sm font-medium">
          View Mode
        </label>
        <NativeSelect
          size="sm"
          id={viewModeId}
          aria-label="View mode"
          value={frameDataViewMode}
          onChange={(e) => {
            const newViewMode = (e.target.value ||
              'default') as FrameDataViewMode;
            setSearchParams((prev) => {
              prev.set(viewMode, newViewMode);
              return prev;
            });
            setFrameDataViewMode(newViewMode);
          }}
        >
          <NativeSelectOption value="default">Default</NativeSelectOption>
          <NativeSelectOption value="table">Table</NativeSelectOption>
          <NativeSelectOption value="simple">Simple</NativeSelectOption>
          <NativeSelectOption value="videoCards">
            Video Cards
          </NativeSelectOption>
        </NativeSelect>
      </ContentContainer>

      <DynamicFrameDataList
        className="mt-3"
        gameRouteId={gameRouteId}
        moves={moves}
        filter={deferredFilter}
        charId={charId}
        viewMode={frameDataViewMode}
        favorites={favorites}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
      />
    </>
  );
};
