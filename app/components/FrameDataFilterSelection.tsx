import { Button, Flex, Text } from '@radix-ui/themes';
import { filterKey, hitLevelValue } from '~/constants/filterConstants';
import { stanceNameMap, stateNameMap } from '~/constants/stanceNameMap';
import { type MoveFilter } from '~/types/MoveFilter';
import { type SearchParamsChanges } from '~/types/SearchParamsChanges';
import { SearchParamsState } from '~/utils/searchParameState';
import { RangeSlider } from './RangeSlider';

export type FrameDataFilterSectionProps = {
  filter: MoveFilter;
  stances: string[];
  states: string[];
  transitions: string[];
  setFilterValue: (key: string, value: string) => void;
  removeFilterValue: (key: string) => void;
  updateFilterValues: (changes: SearchParamsChanges) => void;
  addFilterElement: (key: string, element: string) => void;
  removeFilterElement: (key: string, element: string) => void;
};

export const FrameDataFilterSelection = ({
  filter,
  setFilterValue,
  removeFilterValue,
  updateFilterValues,
  addFilterElement,
  removeFilterElement,
  stances,
  states,
  transitions,
}: FrameDataFilterSectionProps) => {
  const {
    hitLevels,
    startupFrameMin,
    startupFrameMax,
    blockFrameMin,
    blockFrameMax,
    hitFrameMin,
    hitFrameMax,
    numHitsMin,
    numHitsMax,
    balconyBreak,
    reversalBreak,
    heatSmash,
    heatEngager,
    homing,
    tornado,
    jails,
    noJails,
    duckableString,
    chip,
    spike,
    highCrush,
    lowCrush,
    elbow,
    knee,
    weapon,
    floorBreak,
    powerCrush,
    parry,
    wallCrush,
    hitsGrounded,
    video,
    noVideo,
    stance: stanceFilter,
    transition: transitionFilter,
    removeRecoveryHealth,
    forcesCrouchOnBlock,
    forcesCrouchOnHit,
    recoverFullCrouch,
  } = filter;
  return (
    <Flex direction="column" gap="5">
      <section className="flex flex-col gap-3">
        <Text as="div" size="3" mb="1" weight="bold">
          Hit level
        </Text>
        <div className="flex flex-wrap gap-3">
          <Button
            variant={
              hitLevels?.includes(hitLevelValue.Low) ? 'solid' : 'outline'
            }
            onClick={() => {
              if (hitLevels?.includes(hitLevelValue.Low)) {
                removeFilterElement(filterKey.HitLevel, hitLevelValue.Low);
              } else {
                addFilterElement(filterKey.HitLevel, hitLevelValue.Low);
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
                removeFilterElement(filterKey.HitLevel, hitLevelValue.Mid);
              } else {
                addFilterElement(filterKey.HitLevel, hitLevelValue.Mid);
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
                removeFilterElement(filterKey.HitLevel, hitLevelValue.High);
              } else {
                addFilterElement(filterKey.HitLevel, hitLevelValue.High);
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
                removeFilterElement(filterKey.HitLevel, hitLevelValue.Throw);
              } else {
                addFilterElement(filterKey.HitLevel, hitLevelValue.Throw);
              }
            }}
          >
            Throw
          </Button>
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <Text as="div" size="3" mb="1" weight="bold">
          Block frames
        </Text>
        <div className="flex flex-wrap gap-3">
          <Button
            variant={blockFrameMin === 1 ? 'solid' : 'outline'}
            onClick={() => {
              const searchParamsState = new SearchParamsState();
              searchParamsState.removeFilterValue(filterKey.BlockFrameMax);
              if (blockFrameMin === 1) {
                searchParamsState.removeFilterValue(filterKey.BlockFrameMin);
              } else {
                searchParamsState.setFilterValue(filterKey.BlockFrameMin, '1');
              }
              updateFilterValues(searchParamsState.getChanges());
            }}
          >
            Plus
          </Button>
          <Button
            variant={blockFrameMax === -10 ? 'solid' : 'outline'}
            onClick={() => {
              const searchParamsState = new SearchParamsState();
              searchParamsState.remove(filterKey.BlockFrameMin);
              if (blockFrameMax === -10) {
                searchParamsState.remove(filterKey.BlockFrameMax);
              } else {
                searchParamsState.set(filterKey.BlockFrameMax, '-10');
              }
              updateFilterValues(searchParamsState.getChanges());
            }}
          >
            Unsafe
          </Button>
          <Button
            variant={blockFrameMin === -9 ? 'solid' : 'outline'}
            onClick={() => {
              const searchParamsState = new SearchParamsState();
              searchParamsState.removeFilterValue(filterKey.BlockFrameMax);
              if (blockFrameMin === -9) {
                searchParamsState.removeFilterValue(filterKey.BlockFrameMin);
              } else {
                searchParamsState.setFilterValue(filterKey.BlockFrameMin, '-9');
              }
              updateFilterValues(searchParamsState.getChanges());
            }}
          >
            Safe
          </Button>
        </div>
        <RangeSlider
          values={[blockFrameMin, blockFrameMax]}
          max={10}
          min={-17}
          onValuesCommit={(values) => {
            const searchParamsState = new SearchParamsState();
            if (values[0] === undefined) {
              searchParamsState.remove(filterKey.BlockFrameMin);
            } else {
              searchParamsState.set(
                filterKey.BlockFrameMin,
                values[0].toString(),
              );
            }
            if (values[1] === undefined) {
              searchParamsState.remove(filterKey.BlockFrameMax);
            } else {
              searchParamsState.set(
                filterKey.BlockFrameMax,
                values[1].toString(),
              );
            }
            updateFilterValues(searchParamsState.getChanges());
          }}
        />
      </section>
      <section className="flex flex-col gap-3">
        <Text as="div" size="3" mb="1" weight="bold">
          Hit frames
        </Text>
        <div className="flex flex-wrap gap-3">
          <Button
            variant={hitFrameMin === 0 ? 'solid' : 'outline'}
            onClick={() => {
              const searchParamsState = new SearchParamsState();
              searchParamsState.remove(filterKey.HitFrameMax);
              if (hitFrameMin === 0) {
                searchParamsState.remove(filterKey.HitFrameMin);
              } else {
                searchParamsState.set(filterKey.HitFrameMin, '0');
              }
              updateFilterValues(searchParamsState.getChanges());
            }}
          >
            Non negative
          </Button>
          <Button
            variant={hitFrameMax === -1 ? 'solid' : 'outline'}
            onClick={() => {
              const searchParamsState = new SearchParamsState();
              searchParamsState.remove(filterKey.HitFrameMin);
              if (hitFrameMax === -1) {
                searchParamsState.remove(filterKey.HitFrameMax);
              } else {
                searchParamsState.set(filterKey.HitFrameMax, '-1');
              }
              updateFilterValues(searchParamsState.getChanges());
            }}
          >
            Negative
          </Button>
        </div>
        <RangeSlider
          values={[hitFrameMin, hitFrameMax]}
          max={10}
          min={-10}
          onValuesCommit={(values) => {
            const searchParamsState = new SearchParamsState();
            if (values[0] === undefined) {
              searchParamsState.remove(filterKey.HitFrameMin);
            } else {
              searchParamsState.set(
                filterKey.HitFrameMin,
                values[0].toString(),
              );
            }
            if (values[1] === undefined) {
              searchParamsState.remove(filterKey.HitFrameMax);
            } else {
              searchParamsState.set(
                filterKey.HitFrameMax,
                values[1].toString(),
              );
            }
            updateFilterValues(searchParamsState.getChanges());
          }}
        />
      </section>
      <section className="flex flex-col gap-3">
        <Text as="div" size="3" mb="1" weight="bold">
          Startup frames
        </Text>
        <RangeSlider
          values={[startupFrameMin, startupFrameMax]}
          max={30}
          min={6}
          onValuesCommit={(values) => {
            const searchParamsState = new SearchParamsState();
            if (values[0] === undefined) {
              searchParamsState.remove(filterKey.StartupFrameMin);
            } else {
              searchParamsState.set(
                filterKey.StartupFrameMin,
                values[0].toString(),
              );
            }
            if (values[1] === undefined) {
              searchParamsState.remove(filterKey.StartupFrameMax);
            } else {
              searchParamsState.set(
                filterKey.StartupFrameMax,
                values[1].toString(),
              );
            }
            updateFilterValues(searchParamsState.getChanges());
          }}
        />
      </section>
      <section className="flex flex-col gap-3">
        <Text as="div" size="3" mb="1" weight="bold">
          Crush
        </Text>
        <div className="flex flex-wrap gap-3">
          {(
            [
              [filterKey.LowCrush, lowCrush, 'Low crush'],
              [filterKey.HighCrush, highCrush, 'High crush'],
              [filterKey.PowerCrush, powerCrush, 'Power crush'],
              [filterKey.Parry, parry, 'Parry'],
            ] as const
          ).map(([key, value, displayName]) => {
            return (
              <Button
                key={key}
                variant={value ? 'solid' : 'outline'}
                onClick={() => {
                  if (value) {
                    removeFilterValue(key);
                  } else {
                    setFilterValue(key, '');
                  }
                }}
              >
                {displayName}
              </Button>
            );
          })}
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <Text as="div" size="3" mb="1" weight="bold">
          Properties
        </Text>
        <div className="flex flex-wrap gap-3">
          {(
            [
              [filterKey.HeatSmash, heatSmash, 'Heat Smash'],
              [filterKey.HeatEngager, heatEngager, 'Heat Engager'],
              [filterKey.BalconyBreak, balconyBreak, 'Balcony Break'],
              [filterKey.ReversalBreak, reversalBreak, 'Reversal Break'],
              [filterKey.WallCrush, wallCrush, 'Wall Crush'],
              [filterKey.Homing, homing, 'Homing'],
              [filterKey.Tornado, tornado, 'Tornado Spin'],
              [filterKey.Jails, jails, 'Jails'],
              [filterKey.NoJails, noJails, 'Doesnt jail'],
              [filterKey.DuckableString, duckableString, 'Duckable string'],
              [filterKey.HitsGrounded, hitsGrounded, 'Hits grounded'],
              [filterKey.Chip, chip, 'Chip'],
              [
                filterKey.RemoveRecoveryHealth,
                removeRecoveryHealth,
                'Removes recoverable health',
              ],
              [filterKey.RecoverFullCrouch, recoverFullCrouch, 'Recover FC'],
              [
                filterKey.ForcesCrouchOnBlock,
                forcesCrouchOnBlock,
                'Forces crouch on block',
              ],
              [
                filterKey.ForcesCrouchOnHit,
                forcesCrouchOnHit,
                'Forces crouch on hit or counter',
              ],
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
                    removeFilterValue(key);
                  } else {
                    setFilterValue(key, '');
                  }
                }}
              >
                {displayName}
              </Button>
            );
          })}
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <Text as="div" size="3" mb="1" weight="bold">
          States
        </Text>
        <div className="flex flex-wrap gap-3">
          {states.map((state) => {
            const active = stanceFilter?.includes(state);
            return (
              <Button
                key={state}
                variant={active ? 'solid' : 'outline'}
                onClick={() => {
                  if (active) {
                    removeFilterElement(filterKey.Stance, state);
                  } else {
                    addFilterElement(filterKey.Stance, state);
                  }
                }}
              >
                {stateNameMap[state] || state}
              </Button>
            );
          })}
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <Text as="div" size="3" mb="1" weight="bold">
          Stances
        </Text>
        <div className="flex flex-wrap gap-3">
          {stances.map((stance) => {
            const active = stanceFilter?.includes(stance);
            return (
              <Button
                key={stance}
                variant={active ? 'solid' : 'outline'}
                onClick={() => {
                  if (active) {
                    removeFilterElement(filterKey.Stance, stance);
                  } else {
                    addFilterElement(filterKey.Stance, stance);
                  }
                }}
              >
                {stanceNameMap[stance] || stance}
              </Button>
            );
          })}
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <Text as="div" size="3" mb="1" weight="bold">
          Transitions / Recovery
        </Text>
        <div className="flex flex-wrap gap-3">
          {transitions.map((transition) => {
            const active = transitionFilter?.includes(transition);
            return (
              <Button
                key={transition}
                variant={active ? 'solid' : 'outline'}
                onClick={() => {
                  if (active) {
                    removeFilterElement(filterKey.Transition, transition);
                  } else {
                    addFilterElement(filterKey.Transition, transition);
                  }
                }}
              >
                {transition}
              </Button>
            );
          })}
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <Text as="div" size="3" mb="1" weight="bold">
          Media
        </Text>
        <div className="flex flex-wrap gap-3">
          <Button
            variant={video ? 'solid' : 'outline'}
            onClick={() => {
              if (video) {
                removeFilterValue(filterKey.Video);
              } else {
                setFilterValue(filterKey.Video, '');
              }
            }}
          >
            Video
          </Button>
          <Button
            variant={noVideo ? 'solid' : 'outline'}
            onClick={() => {
              if (noVideo) {
                removeFilterValue(filterKey.NoVideo);
              } else {
                setFilterValue(filterKey.NoVideo, '');
              }
            }}
          >
            No Video
          </Button>
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <Text as="div" size="3" mb="1" weight="bold">
          Number of hits
        </Text>
        <div className="flex flex-wrap gap-3">
          <Button
            variant={numHitsMin === 1 && numHitsMax === 1 ? 'solid' : 'outline'}
            onClick={() => {
              const searchParamsState = new SearchParamsState();
              if (numHitsMin === 1 && numHitsMax === 1) {
                searchParamsState.remove(filterKey.NumHitsMin);
                searchParamsState.remove(filterKey.NumHitsMax);
              } else {
                searchParamsState.set(filterKey.NumHitsMin, '1');
                searchParamsState.set(filterKey.NumHitsMax, '1');
              }
              updateFilterValues(searchParamsState.getChanges());
            }}
          >
            1
          </Button>
          <Button
            variant={numHitsMin === 2 && numHitsMax === 2 ? 'solid' : 'outline'}
            onClick={() => {
              const searchParamsState = new SearchParamsState();
              if (numHitsMin === 2 && numHitsMax === 2) {
                searchParamsState.remove(filterKey.NumHitsMin);
                searchParamsState.remove(filterKey.NumHitsMax);
              } else {
                searchParamsState.set(filterKey.NumHitsMin, '2');
                searchParamsState.set(filterKey.NumHitsMax, '2');
              }
              updateFilterValues(searchParamsState.getChanges());
            }}
          >
            2
          </Button>
          <Button
            variant={
              numHitsMin === 3 && numHitsMax === undefined ? 'solid' : 'outline'
            }
            onClick={() => {
              const searchParamsState = new SearchParamsState();
              searchParamsState.remove(filterKey.NumHitsMax);
              if (numHitsMin === 3 && numHitsMax === undefined) {
                searchParamsState.remove(filterKey.NumHitsMin);
              } else {
                searchParamsState.set(filterKey.NumHitsMin, '3');
              }
              updateFilterValues(searchParamsState.getChanges());
            }}
          >
            3+
          </Button>
        </div>
      </section>
    </Flex>
  );
};
