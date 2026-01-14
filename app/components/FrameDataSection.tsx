import { Filter } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { orderByKey } from '~/constants/sortConstants';
import { sortOptions } from '~/constants/sortOptions';
import { type GameRouteId } from '~/types/GameRouteId';
import { type Move } from '~/types/Move';
import { type MoveFilter } from '~/types/MoveFilter';
import { type SearchParamsChanges } from '~/types/SearchParamsChanges';
import { getFilterFromParams } from '~/utils/filterUtils';
import { getMoveFilterTypes } from '~/utils/frameDataUtils';
import {
  getSortByQueryParamValue,
  getSortSettings,
} from '~/utils/sortingUtils';
import { useUserSettings } from '~/utils/userSettings';
import { ContentContainer } from './ContentContainer';
import { DynamicFrameDataList } from './DynamicFrameDataList';
import { FrameDataFilterDialog } from './FrameDataFilterDialog';

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
  const [searchParams, setSearchParams] = useSearchParams();
  const { frameDataViewMode, setFrameDataViewMode } = useUserSettings();
  const sortSettings = getSortSettings(searchParams);
  const sortByQueryParamValue = sortSettings
    ? getSortByQueryParamValue(sortSettings)
    : '';

  const [searchQuery, setSearchQuery] = useState<string>('');

  const filter: MoveFilter = useMemo(() => {
    const filterFromParams = getFilterFromParams(searchParams);
    return {
      ...filterFromParams,
      searchQuery: searchQuery
        ? searchQuery.toLowerCase().replace(/ /g, '')
        : undefined,
    };
  }, [searchParams, searchQuery]);

  const moveTypes = useMemo(() => getMoveFilterTypes(moves), [moves]);

  const setFilterValue = (key: string, value: string) => {
    setSearchParams((prev) => {
      const newSearchParams = new URLSearchParams(prev);
      newSearchParams.set(key, value);
      return newSearchParams;
    });
  };

  const removeFilterValue = (key: string) => {
    setSearchParams((prev) => {
      prev.delete(key);
      return prev;
    });
  };

  const updateFilterValues = (changes: SearchParamsChanges) => {
    setSearchParams((prev) => {
      const newSearchParams = new URLSearchParams(prev);
      changes.set.forEach(({ key, value }) => {
        newSearchParams.set(key, value);
      });
      changes.remove.forEach((key) => {
        newSearchParams.delete(key);
      });
      return newSearchParams;
    });
  };

  const addFilterElement = (key: string, element: string) => {
    setSearchParams((prev) => {
      prev.append(key, element);
      return prev;
    });
  };

  const removeFilterElement = (key: string, element: string) => {
    setSearchParams((prev) => {
      prev.delete(key, element);
      return prev;
    });
  };

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value;
    setSearchQuery(searchValue);
  };

  return (
    <>
      <ContentContainer className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter />
          <Input
            onChange={(e) => handleOnChange(e)}
            placeholder="ff2,1+2"
          ></Input>
        </div>

        <div className="flex items-center justify-end gap-4">
          <div>
            <select
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
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            >
              <option value="">Sort by</option>
              {sortOptions.map(({ displayName, value }) => (
                <option key={value} value={value}>
                  {displayName}
                </option>
              ))}
            </select>
          </div>

          <FrameDataFilterDialog
            filter={filter}
            stances={moveTypes.stances}
            states={moveTypes.states}
            transitions={moveTypes.transitions}
            removeFilterValue={removeFilterValue}
            setFilterValue={setFilterValue}
            updateFilterValues={updateFilterValues}
            addFilterElement={addFilterElement}
            removeFilterElement={removeFilterElement}
          />
        </div>
      </ContentContainer>

      <ContentContainer className="flex items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-2">
          <Switch
            checked={frameDataViewMode === 'simple'}
            onCheckedChange={(checked) =>
              setFrameDataViewMode(checked ? 'simple' : 'default')
            }
          />
          <label
            htmlFor="simple-view"
            className="cursor-pointer text-sm font-medium"
          >
            Simple View
          </label>
        </div>
      </ContentContainer>

      <DynamicFrameDataList
        className="mt-3"
        gameRouteId={gameRouteId}
        moves={moves}
        filter={filter}
        charId={charId}
        viewMode={
          searchParams.get('viewMode') === 'video'
            ? 'videoCards'
            : frameDataViewMode
        }
      />
    </>
  );
};
