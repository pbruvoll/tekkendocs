import { Button, Flex, Text } from '@radix-ui/themes'
import { filterKey, hitLevelValue } from '~/constants/filterConstants'
import { type MoveFilter } from '~/types/MoveFilter'

export type FrameDataFilterSectionProps = {
  filter: MoveFilter
  setFilterValue: (key: string, value: string) => void
  removeFilterValue: (key: string) => void
}

export const FrameDataFilterSelection = ({
  filter,
  setFilterValue,
  removeFilterValue,
}: FrameDataFilterSectionProps) => {
  const { hitLevel, blockFrameMin, blockFrameMax } = filter
  return (
    <Flex direction="column" gap="5">
      <section className="flex flex-col gap-3">
        <Text as="div" size="2" mb="1" weight="bold">
          Hit level
        </Text>
        <div className="flex gap-3">
          <Button
            variant={hitLevel === hitLevelValue.Low ? 'solid' : 'outline'}
            onClick={() => {
              if (hitLevel === hitLevelValue.Low) {
                removeFilterValue(filterKey.HitLevel)
              } else {
                setFilterValue(filterKey.HitLevel, hitLevelValue.Low)
              }
            }}
          >
            Low
          </Button>
          <Button
            variant={hitLevel === hitLevelValue.Mid ? 'solid' : 'outline'}
            onClick={() => {
              if (hitLevel === hitLevelValue.Mid) {
                removeFilterValue(filterKey.HitLevel)
              } else {
                setFilterValue(filterKey.HitLevel, hitLevelValue.Mid)
              }
            }}
          >
            Mid
          </Button>
          <Button
            variant={hitLevel === hitLevelValue.High ? 'solid' : 'outline'}
            onClick={() => {
              if (hitLevel === hitLevelValue.High) {
                removeFilterValue(filterKey.HitLevel)
              } else {
                setFilterValue(filterKey.HitLevel, hitLevelValue.High)
              }
            }}
          >
            High
          </Button>
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <Text as="div" size="2" mb="1" weight="bold">
          Block frames
        </Text>
        <div className="flex gap-3">
          <Button
            variant={blockFrameMin === 1 ? 'solid' : 'outline'}
            onClick={() => {
              removeFilterValue(filterKey.BlockFrameMax)
              if (blockFrameMin === 1) {
                removeFilterValue(filterKey.BlockFrameMin)
              } else {
                setFilterValue(filterKey.BlockFrameMin, '1')
              }
            }}
          >
            Pluss
          </Button>
          <Button
            variant={blockFrameMax === -10 ? 'solid' : 'outline'}
            onClick={() => {
              removeFilterValue(filterKey.BlockFrameMin)
              if (blockFrameMax === -10) {
                removeFilterValue(filterKey.BlockFrameMax)
              } else {
                setFilterValue(filterKey.BlockFrameMax, '-10')
              }
            }}
          >
            Unsafe
          </Button>
          <Button
            variant={blockFrameMin === -9 ? 'solid' : 'outline'}
            onClick={() => {
              removeFilterValue(filterKey.BlockFrameMax)
              if (blockFrameMin === -9) {
                removeFilterValue(filterKey.BlockFrameMin)
              } else {
                setFilterValue(filterKey.BlockFrameMin, '-9')
              }
            }}
          >
            Safe
          </Button>
        </div>
      </section>
    </Flex>
  )
}
