import { Button, Flex, Text } from '@radix-ui/themes'
import { filterKey, hitLevelValue } from '~/constants/filterConstants'
import { stanceNameMap, stateNameMap } from '~/constants/stanceNameMap'
import { type MoveFilter } from '~/types/MoveFilter'
import { RangeSlider } from './RangeSlider'

export type FrameDataFilterSectionProps = {
  filter: MoveFilter
  stances: string[]
  states: string[]
  setFilterValue: (key: string, value: string) => void
  removeFilterValue: (key: string) => void
  addFilterElement: (key: string, element: string) => void
  removeFilterElement: (key: string, element: string) => void
}

export const FrameDataFilterSelection = ({
  filter,
  setFilterValue,
  removeFilterValue,
  addFilterElement,
  removeFilterElement,
  stances,
  states,
}: FrameDataFilterSectionProps) => {
  const {
    hitLevels,
    blockFrameMin,
    blockFrameMax,
    hitFrameMin,
    hitFrameMax,
    numHitsMin,
    numHitsMax,
    balconyBreak,
    heatSmash,
    heatEngager,
    homing,
    tornado,
    jails,
    noJails,
    chip,
    spike,
    highCrush,
    lowCrush,
    elbow,
    knee,
    weapon,
    floorBreak,
    powerCrush,
    wallCrush,
    hitsGrounded,
    video,
    stance: stanceFilter,
    removeRecoveryHealth,
    recoverFullCrouch,
  } = filter
  return (
    <Flex direction="column" gap="5">
      <section className="flex flex-col gap-3">
        <Text as="div" size="2" mb="1" weight="bold">
          Hit level
        </Text>
        <div className="flex flex-wrap gap-3">
          <Button
            variant={
              hitLevels?.includes(hitLevelValue.Low) ? 'solid' : 'outline'
            }
            onClick={() => {
              if (hitLevels?.includes(hitLevelValue.Low)) {
                removeFilterElement(filterKey.HitLevel, hitLevelValue.Low)
              } else {
                addFilterElement(filterKey.HitLevel, hitLevelValue.Low)
              }
            }}
          >
            Low
          </Button>
          <Button
            variant={
              hitLevels?.includes(hitLevelValue.Mid) ? 'solid' : 'outline'
            }
            onClick={() => {
              if (hitLevels?.includes(hitLevelValue.Mid)) {
                removeFilterElement(filterKey.HitLevel, hitLevelValue.Mid)
              } else {
                addFilterElement(filterKey.HitLevel, hitLevelValue.Mid)
              }
            }}
          >
            Mid
          </Button>
          <Button
            variant={
              hitLevels?.includes(hitLevelValue.High) ? 'solid' : 'outline'
            }
            onClick={() => {
              if (hitLevels?.includes(hitLevelValue.High)) {
                removeFilterElement(filterKey.HitLevel, hitLevelValue.High)
              } else {
                addFilterElement(filterKey.HitLevel, hitLevelValue.High)
              }
            }}
          >
            High
          </Button>
          <Button
            variant={
              hitLevels?.includes(hitLevelValue.Throw) ? 'solid' : 'outline'
            }
            onClick={() => {
              if (hitLevels?.includes(hitLevelValue.Throw)) {
                removeFilterElement(filterKey.HitLevel, hitLevelValue.Throw)
              } else {
                addFilterElement(filterKey.HitLevel, hitLevelValue.Throw)
              }
            }}
          >
            Throw
          </Button>
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <Text as="div" size="2" mb="1" weight="bold">
          Block frames
        </Text>
        <div className="flex flex-wrap gap-3">
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
        <RangeSlider
          values={[blockFrameMin, blockFrameMax]}
          max={10}
          min={-17}
          onValuesCommit={values => {
            if (values[0] === undefined) {
              removeFilterValue(filterKey.BlockFrameMin)
            } else setFilterValue(filterKey.BlockFrameMin, values[0].toString())
            if (values[1] === undefined) {
              removeFilterValue(filterKey.BlockFrameMax)
            } else setFilterValue(filterKey.BlockFrameMax, values[1].toString())
          }}
        />
      </section>
      <section className="flex flex-col gap-3">
        <Text as="div" size="2" mb="1" weight="bold">
          Hit frames
        </Text>
        <div className="flex flex-wrap gap-3">
          <Button
            variant={hitFrameMin === 0 ? 'solid' : 'outline'}
            onClick={() => {
              removeFilterValue(filterKey.HitFrameMax)
              if (hitFrameMin === 0) {
                removeFilterValue(filterKey.HitFrameMin)
              } else {
                setFilterValue(filterKey.HitFrameMin, '0')
              }
            }}
          >
            Non negative
          </Button>
          <Button
            variant={hitFrameMax === -1 ? 'solid' : 'outline'}
            onClick={() => {
              removeFilterValue(filterKey.HitFrameMin)
              if (hitFrameMax === -1) {
                removeFilterValue(filterKey.HitFrameMax)
              } else {
                setFilterValue(filterKey.HitFrameMax, '-1')
              }
            }}
          >
            Negative
          </Button>
        </div>
        <RangeSlider
          values={[hitFrameMin, hitFrameMax]}
          max={10}
          min={-10}
          onValuesCommit={values => {
            if (values[0] === undefined) {
              removeFilterValue(filterKey.HitFrameMin)
            } else setFilterValue(filterKey.HitFrameMin, values[0].toString())
            if (values[1] === undefined) {
              removeFilterValue(filterKey.HitFrameMax)
            } else setFilterValue(filterKey.HitFrameMax, values[1].toString())
          }}
        />
      </section>
      <section className="flex flex-col gap-3">
        <Text as="div" size="2" mb="1" weight="bold">
          Crush
        </Text>
        <div className="flex flex-wrap gap-3">
          {(
            [
              [filterKey.LowCrush, lowCrush, 'Low crush'],
              [filterKey.HighCrush, highCrush, 'High crush'],
              [filterKey.PowerCrush, powerCrush, 'Power crush'],
            ] as const
          ).map(([key, value, displayName]) => {
            return (
              <Button
                key={key}
                variant={value ? 'solid' : 'outline'}
                onClick={() => {
                  if (value) {
                    removeFilterValue(key)
                  } else {
                    setFilterValue(key, '')
                  }
                }}
              >
                {displayName}
              </Button>
            )
          })}
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <Text as="div" size="2" mb="1" weight="bold">
          Properties
        </Text>
        <div className="flex flex-wrap gap-3">
          {(
            [
              [filterKey.HeatSmash, heatSmash, 'Heat Smash'],
              [filterKey.HeatEngager, heatEngager, 'Heat Engager'],
              [filterKey.BalconyBreak, balconyBreak, 'Balcony Break'],
              [filterKey.WallCrush, wallCrush, 'Wall Crush'],
              [filterKey.Homing, homing, 'Homing'],
              [filterKey.Tornado, tornado, 'Tornado Spin'],
              [filterKey.Jails, jails, 'Jails'],
              [filterKey.NoJails, noJails, 'Doesnt jail'],
              [filterKey.HitsGrounded, hitsGrounded, 'Hits grounded'],
              [filterKey.Chip, chip, 'Chip'],
              [
                filterKey.RemoveRecoveryHealth,
                removeRecoveryHealth,
                'Removes recoverable health',
              ],
              [filterKey.RecoverFullCrouch, recoverFullCrouch, 'Recover FC'],
              [filterKey.Spike, spike, 'Spike'],
              [filterKey.FloorBreak, floorBreak, 'Floor break'],
              [filterKey.Elbow, elbow, 'Elbow'],
              [filterKey.Knee, knee, 'Knee'],
              [filterKey.Weapon, weapon, 'Weapon'],
            ] as const
          ).map(([key, value, displayName]) => {
            return (
              <Button
                key={key}
                variant={value ? 'solid' : 'outline'}
                onClick={() => {
                  if (value) {
                    removeFilterValue(key)
                  } else {
                    setFilterValue(key, '')
                  }
                }}
              >
                {displayName}
              </Button>
            )
          })}
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <Text as="div" size="2" mb="1" weight="bold">
          States
        </Text>
        <div className="flex flex-wrap gap-3">
          {states.map(state => {
            const active = stanceFilter?.includes(state)
            return (
              <Button
                key={state}
                variant={active ? 'solid' : 'outline'}
                onClick={() => {
                  if (active) {
                    removeFilterElement(filterKey.Stance, state)
                  } else {
                    addFilterElement(filterKey.Stance, state)
                  }
                }}
              >
                {stateNameMap[state] || state}
              </Button>
            )
          })}
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <Text as="div" size="2" mb="1" weight="bold">
          Stances
        </Text>
        <div className="flex flex-wrap gap-3">
          {stances.map(stance => {
            const active = stanceFilter?.includes(stance)
            return (
              <Button
                key={stance}
                variant={active ? 'solid' : 'outline'}
                onClick={() => {
                  if (active) {
                    removeFilterElement(filterKey.Stance, stance)
                  } else {
                    addFilterElement(filterKey.Stance, stance)
                  }
                }}
              >
                {stanceNameMap[stance] || stance}
              </Button>
            )
          })}
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <Text as="div" size="2" mb="1" weight="bold">
          Media
        </Text>
        <div className="flex flex-wrap gap-3">
          <Button
            variant={video ? 'solid' : 'outline'}
            onClick={() => {
              if (video) {
                removeFilterValue(filterKey.Video)
              } else {
                setFilterValue(filterKey.Video, '')
              }
            }}
          >
            Video
          </Button>
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <Text as="div" size="2" mb="1" weight="bold">
          Number of hits
        </Text>
        <div className="flex flex-wrap gap-3">
          <Button
            variant={numHitsMin === 1 && numHitsMax === 1 ? 'solid' : 'outline'}
            onClick={() => {
              if (numHitsMin === 1 && numHitsMax === 1) {
                removeFilterValue(filterKey.NumHitsMin)
                removeFilterValue(filterKey.NumHitsMax)
              } else {
                setFilterValue(filterKey.NumHitsMin, '1')
                setFilterValue(filterKey.NumHitsMax, '1')
              }
            }}
          >
            1
          </Button>
          <Button
            variant={numHitsMin === 2 && numHitsMax === 2 ? 'solid' : 'outline'}
            onClick={() => {
              if (numHitsMin === 2 && numHitsMax === 2) {
                removeFilterValue(filterKey.NumHitsMin)
                removeFilterValue(filterKey.NumHitsMax)
              } else {
                setFilterValue(filterKey.NumHitsMin, '2')
                setFilterValue(filterKey.NumHitsMax, '2')
              }
            }}
          >
            2
          </Button>
          <Button
            variant={
              numHitsMin === 3 && numHitsMax === undefined ? 'solid' : 'outline'
            }
            onClick={() => {
              removeFilterValue(filterKey.NumHitsMax)
              if (numHitsMin === 3 && numHitsMax === undefined) {
                removeFilterValue(filterKey.NumHitsMax)
              } else {
                setFilterValue(filterKey.NumHitsMin, '3')
              }
            }}
          >
            3+
          </Button>
        </div>
      </section>
    </Flex>
  )
}
