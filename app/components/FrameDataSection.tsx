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
import { FrameDataFilterSelection } from './FrameDataFilterSelection'
import { FrameDataTable } from './FrameDataTable'

export type FrameDataSectionProps = {
  table: TableDataWithHeader
}
export const FrameDataSection = ({ table }: FrameDataSectionProps) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const hitLevelFilter = (searchParams.get(filterKey.HitLevel) || undefined) as
    | HitLevel
    | undefined

  const filter: MoveFilter = useMemo(() => {
    return {
      hitLevel: (searchParams.get(filterKey.HitLevel) || undefined) as
        | HitLevel
        | undefined,
    }
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

      <FrameDataTable
        className="mt-3"
        table={table}
        hitLevelFilter={hitLevelFilter}
      />
    </>
  )
}
