import { Filter } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Input } from '@/components/ui/input';
import { orderByKey } from '~/constants/sortConstants';
import { sortOptions } from '~/constants/sortOptions';
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
  const viewModeId = useId();
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

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value;
    setSearchQuery(searchValue);
  };

  return (
    <>
      <ContentContainer className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex w-full items-center gap-2 mt-1 sm:w-auto">
          <Filter className="shrink-0" />
          <Input
            onChange={(e) => handleOnChange(e)}
            placeholder="Search moves, ff2,1+2, power crush, etc."
          ></Input>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <div className="flex-1 sm:flex-none">
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
              className="block w-full max-w-48 rounded-lg border border-gray-300 bg-gray-50 p-2.5 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
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
        <select
          id={viewModeId}
          aria-label="View mode"
          value={frameDataViewMode}
          onChange={(e) => {
            setFrameDataViewMode(
              (e.target.value || 'default') as
                | 'default'
                | 'simple'
                | 'videoCards',
            );
          }}
          className="rounded-lg border border-gray-300 bg-gray-50 p-2.5 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        >
          <option value="default">Default</option>
          <option value="simple">Simple</option>
          <option value="videoCards">Video Cards</option>
        </select>
      </ContentContainer>

      <DynamicFrameDataList
        className="mt-3"
        gameRouteId={gameRouteId}
        moves={moves}
        filter={filter}
        charId={charId}
        viewMode={frameDataViewMode}
      />
    </>
  );
};
