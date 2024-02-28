import { useMemo } from 'react'
import { MixerHorizontalIcon } from '@radix-ui/react-icons'
import { Button, Dialog, Flex, Text } from '@radix-ui/themes'
import { useSearchParams } from '@remix-run/react'
import { filterKey, hitLevelValue } from '~/constants/filterConstants'
import { type HitLevel } from '~/types/FilterTypes'
import { type MoveFilter } from '~/types/MoveFilter'
import { type TableDataWithHeader } from '~/types/TableData'
import { getFilterFromParams } from '~/utils/filterUtils'
import { ContentContainer } from './ContentContainer'
import { FrameDataFilterDialog } from './FrameDataFilterDialog'
import { FrameDataTable } from './FrameDataTable'

export type FrameDataSectionProps = {
  table: TableDataWithHeader
}
export const FrameDataSection = ({ table }: FrameDataSectionProps) => {
  const [searchParams, setSearchParams] = useSearchParams()

  const filter: MoveFilter = useMemo(() => {
    return getFilterFromParams(searchParams)
  }, [searchParams])

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
