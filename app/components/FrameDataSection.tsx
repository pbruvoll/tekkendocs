import { useMemo, useState } from 'react'
import { useSearchParams } from '@remix-run/react'
import { Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { orderByKey } from '~/constants/sortConstants'
import { sortOptions } from '~/constants/sortOptions'
import { type Move } from '~/types/Move'
import { type MoveFilter } from '~/types/MoveFilter'
import { getFilterFromParams } from '~/utils/filterUtils'
import { getMoveFilterTypes } from '~/utils/frameDataUtils'
import { getSortByQueryParamValue, getSortSettings } from '~/utils/sortingUtils'
import { ContentContainer } from './ContentContainer'
import { FrameDataFilterDialog } from './FrameDataFilterDialog'
import { FrameDataTable } from './FrameDataTableV2'

export type FrameDataSectionProps = {
  moves: Move[]
  hasMultipleCharacters: boolean
}
export const FrameDataSection = ({
  moves,
  hasMultipleCharacters,
}: FrameDataSectionProps) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const sortSettings = getSortSettings(searchParams)
  const sortByQueryParamValue = sortSettings
    ? getSortByQueryParamValue(sortSettings)
    : ''

  const [searchQuery, setSearchQuery] = useState<string>('')

  const filter: MoveFilter = useMemo(() => {
    const filterFromParams = getFilterFromParams(searchParams)
    return {
      ...filterFromParams,
      searchQuery: searchQuery.toLowerCase().replace(/ /g, ''),
    }
  }, [searchParams, searchQuery])

  const moveTypes = useMemo(() => getMoveFilterTypes(moves), [moves])

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

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value
    setSearchQuery(searchValue)
  }

  return (
    <>
      <ContentContainer className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter />
          <Input
            onChange={e => handleOnChange(e)}
            placeholder="ff2,1+2"
          ></Input>
        </div>

        <div className="flex items-center justify-end gap-4">
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
            stances={moveTypes.stances}
            states={moveTypes.states}
            transitions={moveTypes.transitions}
            removeFilterValue={removeFilterValue}
            setFilterValue={setFilterValue}
            addFilterElement={addFilterElement}
            removeFilterElement={removeFilterElement}
          />
        </div>
      </ContentContainer>

      <FrameDataTable
        className="mt-3"
        moves={moves}
        filter={filter}
        hasMultipleCharacters={hasMultipleCharacters}
      />
    </>
  )
}
