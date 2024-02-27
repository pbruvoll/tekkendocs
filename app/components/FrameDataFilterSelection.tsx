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
  const { hitLevel } = filter
  return (
    <Flex direction="column" gap="3">
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
    </Flex>
  )
}
