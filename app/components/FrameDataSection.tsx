import { useMemo } from 'react'
import { useSearchParams } from '@remix-run/react'
import { orderByKey } from '~/constants/sortConstants'
import { sortOptions } from '~/constants/sortOptions'
import { type Move } from '~/types/Move'
import { type MoveFilter } from '~/types/MoveFilter'
import { type TableDataWithHeader } from '~/types/TableData'
import { getFilterFromParams } from '~/utils/filterUtils'
import { getStances } from '~/utils/frameDataUtils'
import { getSortByQueryParamValue, getSortSettings } from '~/utils/sortingUtils'
import { ContentContainer } from './ContentContainer'
import { FrameDataFilterDialog } from './FrameDataFilterDialog'
import { FrameDataTable } from './FrameDataTableV2'

export type FrameDataSectionProps = {
  table: TableDataWithHeader
  moves: Move[]
}
export const FrameDataSection = ({ moves }: FrameDataSectionProps) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const sortSettings = getSortSettings(searchParams)
  const sortByQueryParamValue = sortSettings
    ? getSortByQueryParamValue(sortSettings)
    : ''

  const filter: MoveFilter = useMemo(() => {
    return getFilterFromParams(searchParams)
  }, [searchParams])

  const stances = useMemo(() => getStances(moves), [moves])

  const setFilterValue = (key: string, value: string) => {
    setSearchParams(prev => {
      prev.set(key, value)
      return prev
    })
  }

  const removeFilterValue = (key: string) => {
    setSearchParams(prev => {
      prev.delete(key)
      return prev
    })
  }

  const addFilterElement = (key: string, element: string) => {
    setSearchParams(prev => {
      prev.append(key, element)
      return prev
    })
  }

  const removeFilterElement = (key: string, element: string) => {
    setSearchParams(prev => {
      /** @ts-ignore */
      prev.delete(key, element)
      return prev
    })
  }

  return (
    <>
      <ContentContainer className="flex items-center justify-end gap-4">
        <div>
          <select
            aria-label="Sort by"
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
          stances={stances}
          removeFilterValue={removeFilterValue}
          setFilterValue={setFilterValue}
          addFilterElement={addFilterElement}
          removeFilterElement={removeFilterElement}
        />
      </ContentContainer>

      <FrameDataTable className="mt-3" moves={moves} filter={filter} />
    </>
  )
}
