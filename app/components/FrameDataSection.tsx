import { useMemo } from 'react'
import { MixerHorizontalIcon } from '@radix-ui/react-icons'
import { Button, Dialog, Flex, Text } from '@radix-ui/themes'
import { useSearchParams } from '@remix-run/react'
import { filterKey, hitLevelValue } from '~/constants/filterConstants'
import { type HitLevel } from '~/types/FilterTypes'
import { type MoveFilter } from '~/types/MoveFilter'
import { type TableDataWithHeader } from '~/types/TableData'
import { ContentContainer } from './ContentContainer'
import { FrameDataFilterDialog } from './FrameDataFilterDialog'
import { FrameDataTable } from './FrameDataTable'

const getSearchParamString = <T extends string>(
  searchParams: URLSearchParams,
  key: string,
): T | undefined => {
  return (searchParams.get(filterKey.HitLevel) || undefined) as T | undefined
}

const getSearchParamNumber = (
  searchParams: URLSearchParams,
  key: string,
): number | undefined => {
  const valueStr = searchParams.get(key)
  if (!valueStr) return undefined
  const value = Number(valueStr)
  return isNaN(value) ? undefined : value
}
export type FrameDataSectionProps = {
  table: TableDataWithHeader
}
export const FrameDataSection = ({ table }: FrameDataSectionProps) => {
  const [searchParams, setSearchParams] = useSearchParams()

  const filter: MoveFilter = useMemo(() => {
    return {
      hitLevel: getSearchParamString<HitLevel>(
        searchParams,
        filterKey.HitLevel,
      ),
      blockFrameMin: getSearchParamNumber(
        searchParams,
        filterKey.BlockFrameMin,
      ),
      blockFrameMax: getSearchParamNumber(
        searchParams,
        filterKey.BlockFrameMax,
      ),
    }
  }, [searchParams])

  console.log('filter', filter)

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

  return (
    <>
      <ContentContainer className="flex justify-end">
        <FrameDataFilterDialog
          filter={filter}
          removeFilterValue={removeFilterValue}
          setFilterValue={setFilterValue}
        />
      </ContentContainer>

      <FrameDataTable className="mt-3" table={table} filter={filter} />
    </>
  )
}
