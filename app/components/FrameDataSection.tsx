import { Filter, X } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Input } from '@/components/ui/input'
import { filterKey } from '~/constants/filterConstants'
import { orderByKey } from '~/constants/sortConstants'
import { sortOptions } from '~/constants/sortOptions'
import { type GameRouteId } from '~/types/GameRouteId'
import { type Move } from '~/types/Move'
import { type MoveFilter } from '~/types/MoveFilter'
import { getFilterFromParams } from '~/utils/filterUtils'
import { getMoveFilterTypes } from '~/utils/frameDataUtils'
import * as filterUtils from '~/utils/searchParamsFilterUtils'
import { getSortByQueryParamValue, getSortSettings } from '~/utils/sortingUtils'
import { type FrameDataViewMode, useUserSettings } from '~/utils/userSettings'
import { ContentContainer } from './ContentContainer'
import { DynamicFrameDataList } from './DynamicFrameDataList'
import { FrameDataFilterDialog } from './FrameDataFilterDialog'

const viewMode = 'viewMode'

const isFrameDataViewMode = (
  value: string | null,
): value is FrameDataViewMode =>
  value === 'default' || value === 'simple' || value === 'videoCards'

export type FrameDataSectionProps = {
  gameRouteId: GameRouteId
  charId?: string
  moves: Move[]
}
export const FrameDataSection = ({
  gameRouteId,
  charId,
  moves,
}: FrameDataSectionProps) => {
  const viewModeId = useId()
  const [searchParams, setSearchParams] = useSearchParams()
  const viewModeFromSearchParams = searchParams.get(viewMode)

  const { frameDataViewMode: viewModeFromStore, setFrameDataViewMode } =
    useUserSettings()
  const frameDataViewMode = isFrameDataViewMode(viewModeFromSearchParams)
    ? viewModeFromSearchParams
    : viewModeFromStore

  const sortSettings = getSortSettings(searchParams)
  const sortByQueryParamValue = sortSettings
    ? getSortByQueryParamValue(sortSettings)
    : ''

  const filterFromUrl: MoveFilter = useMemo(
    () => getFilterFromParams(searchParams),
    [searchParams],
  )

  const [searchQuery, setSearchQuery] = useState(
    filterFromUrl.searchQuery || '',
  )

  const filter = useMemo(
    () => ({ ...filterFromUrl, searchQuery: searchQuery || undefined }),
    [filterFromUrl, searchQuery],
  )

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => {
      setSearchParams(
        prev => {
          const newSearchParams = new URLSearchParams(prev)
          if (value) {
            newSearchParams.set(filterKey.Query, value)
          } else {
            newSearchParams.delete(filterKey.Query)
          }
          return newSearchParams
        },
        { replace: true, preventScrollReset: true },
      )
    }, 300)
  }

  useEffect(() => () => clearTimeout(searchDebounceRef.current), [])

  const moveTypes = useMemo(() => getMoveFilterTypes(moves), [moves])

  return (
    <>
      <ContentContainer className='flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between'>
        <div className='flex w-full items-center gap-2 mt-1 sm:w-auto'>
          <Filter className='shrink-0' />
          <div className='relative w-full'>
            <Input
              onChange={e => handleSearchChange(e.target.value)}
              placeholder='Search moves, ff2,1+2, power crush, etc.'
              value={searchQuery}
              className='pr-8'
            />
            {searchQuery && (
              <button
                type='button'
                aria-label='Clear search'
                onClick={() => handleSearchChange('')}
                className='absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-2 sm:gap-4'>
          <div className='flex-1 sm:flex-none'>
            <select
              aria-label='Sort by'
              value={sortByQueryParamValue}
              onChange={e => {
                setSearchParams(prev => {
                  if (e.target.value) {
                    prev.set(orderByKey, e.target.value)
                  } else {
                    prev.delete(orderByKey)
                  }
                  return prev
                })
              }}
              className='block w-full max-w-48 rounded-lg border border-gray-300 bg-gray-50 p-2.5 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500'
            >
              <option value=''>Sort by</option>
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
            removeFilterValue={key =>
              filterUtils.removeFilterValue(setSearchParams, key)
            }
            setFilterValue={(key, value) =>
              filterUtils.setFilterValue(setSearchParams, key, value)
            }
            updateFilterValues={changes =>
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

      <ContentContainer className='flex items-center gap-2 py-2'>
        <label htmlFor={viewModeId} className='text-sm font-medium'>
          View Mode
        </label>
        <select
          id={viewModeId}
          aria-label='View mode'
          value={frameDataViewMode}
          onChange={e => {
            const newViewMode = (e.target.value ||
              'default') as FrameDataViewMode
            setSearchParams(prev => {
              prev.set(viewMode, newViewMode)
              return prev
            })
            setFrameDataViewMode(newViewMode)
          }}
          className='rounded-lg border border-gray-300 bg-gray-50 p-2.5 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500'
        >
          <option value='default'>Default</option>
          <option value='simple'>Simple</option>
          <option value='videoCards'>Video Cards</option>
        </select>
      </ContentContainer>

      <DynamicFrameDataList
        className='mt-3'
        gameRouteId={gameRouteId}
        moves={moves}
        filter={filter}
        charId={charId}
        viewMode={frameDataViewMode}
      />
    </>
  )
}
