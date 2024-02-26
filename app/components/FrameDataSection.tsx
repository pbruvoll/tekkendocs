import { MixerHorizontalIcon } from '@radix-ui/react-icons'
import { Button, Dialog, Flex, Text } from '@radix-ui/themes'
import { useSearchParams } from '@remix-run/react'
import { filterKey, hitLevelValue } from '~/constants/filterConstants'
import { type HitLevel } from '~/types/FilterTypes'
import { type TableDataWithHeader } from '~/types/TableData'
import { FrameDataTable } from './FrameDataTable'

export type FrameDataSectionProps = {
  table: TableDataWithHeader
}
export const FrameDataSection = ({ table }: FrameDataSectionProps) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const hitLevelFilter = (searchParams.get(filterKey.HitLevel) || undefined) as
    | HitLevel
    | undefined
  return (
    <>
      <div className="flex justify-end">
        <Dialog.Root>
          <Dialog.Trigger>
            <Button>
              <MixerHorizontalIcon width="16" height="16" /> Filter
              {hitLevelFilter ? ' (1)' : ''}
            </Button>
          </Dialog.Trigger>

          <Dialog.Content style={{ maxWidth: 450 }}>
            <Dialog.Title>Filter</Dialog.Title>
            <Dialog.Description size="2" mb="4">
              Filter which moves are
            </Dialog.Description>

            <Flex direction="column" gap="3">
              <Text as="div" size="2" mb="1" weight="bold">
                Hit level
              </Text>
              <div className="flex gap-3">
                <Button
                  variant={
                    hitLevelFilter === hitLevelValue.Low ? 'solid' : 'outline'
                  }
                  onClick={() =>
                    setSearchParams(prev => {
                      if (hitLevelFilter === hitLevelValue.Low) {
                        prev.delete(filterKey.HitLevel)
                      } else {
                        prev.set(filterKey.HitLevel, hitLevelValue.Low)
                      }
                      return prev
                    })
                  }
                >
                  Low
                </Button>
                <Button
                  variant={
                    hitLevelFilter === hitLevelValue.Mid ? 'solid' : 'outline'
                  }
                  onClick={() =>
                    setSearchParams(prev => {
                      if (hitLevelFilter === hitLevelValue.Mid) {
                        prev.delete(filterKey.HitLevel)
                      } else {
                        prev.set(filterKey.HitLevel, hitLevelValue.Mid)
                      }
                      return prev
                    })
                  }
                >
                  Mid
                </Button>
                <Button
                  variant={
                    hitLevelFilter === hitLevelValue.High ? 'solid' : 'outline'
                  }
                  onClick={() =>
                    setSearchParams(prev => {
                      if (hitLevelFilter === hitLevelValue.High) {
                        prev.delete(filterKey.HitLevel)
                      } else {
                        prev.set(filterKey.HitLevel, hitLevelValue.High)
                      }
                      return prev
                    })
                  }
                >
                  High
                </Button>
              </div>
            </Flex>

            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button>Close</Button>
              </Dialog.Close>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      </div>
      <FrameDataTable
        className="mt-3"
        table={table}
        hitLevelFilter={hitLevelFilter}
      />
    </>
  )
}
