import { useMemo } from 'react'
import { useSearchParams } from '@remix-run/react'
import { type Move } from '~/types/Move'
import { type MoveFilter } from '~/types/MoveFilter'
import { type TableDataWithHeader } from '~/types/TableData'
import { getFilterFromParams } from '~/utils/filterUtils'
import { getStances } from '~/utils/frameDataUtils'
import { ContentContainer } from './ContentContainer'
import { FrameDataFilterDialog } from './FrameDataFilterDialog'
import { FrameDataTable } from './FrameDataTableV2'

export type FrameDataSectionProps = {
  table: TableDataWithHeader
  moves: Move[]
}
export const FrameDataSection = ({ table, moves }: FrameDataSectionProps) => {
  const [searchParams, setSearchParams] = useSearchParams()

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
      <ContentContainer className="flex justify-end">
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
