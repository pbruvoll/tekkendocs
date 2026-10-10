import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { filterKey, hitLevelValue } from '~/constants/filterConstants';
import { stanceNameMap, stateNameMap } from '~/constants/stanceNameMap';
import { type MoveFilter } from '~/types/MoveFilter';
import { type SearchParamsChanges } from '~/types/SearchParamsChanges';
import { SearchParamsState } from '~/utils/searchParameState';
import { FilterToggleButton } from './FilterToggleButton';
import { RangeSlider } from './RangeSlider';

export type FrameDataFilterSectionProps = {
  className?: string;
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
  className,
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
    interruptibleMin,
    interruptibleMax,
    balconyBreak,
    reversalBreak,
    heatSmash,
    heatEngager,
    homing,
    tornado,
    jails,
    noJails,
    duckableString,
    unblockable,
    chip,
    spike,
    steppable,
    highCrush,
    lowCrush,
    elbow,
    knee,
    head,
    shoulder,
    hip,
    weapon,
    floorBreak,
    powerCrush,
    parry,
    wallCrush,
    hitsGrounded,
    video,
    noVideo,
    embeddedVideo,
    noEmbeddedVideo,
    stance: stanceFilter,
    transition: transitionFilter,
    removeRecoveryHealth,
    forcesCrouchOnBlock,
    forcesCrouchOnHit,
    recoverFullCrouch,
    counterHit,
    favorite,
  } = filter;

  // the button only covers the "interruptible by i6 or slower" case, so a max
  // coming from the url means the filter is no longer the one the button sets
  const interruptibleActive =
    interruptibleMin === 6 && interruptibleMax === undefined;

  const renderPropertyButton = ([key, value, displayName]: readonly [
    string,
    boolean | undefined,
    string,
  ]) => {
    return (
      <FilterToggleButton
        key={key}
        active={value}
        onClick={() => {
          if (value) {
            removeFilterValue(key);
          } else {
            setFilterValue(key, '');
          }
        }}
      >
        {displayName}
      </FilterToggleButton>
    );
  };

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <section className="flex flex-col gap-3">
        <div className="mb-1 font-bold">Hit level</div>
        <div className="flex flex-wrap gap-3">
          <FilterToggleButton
            active={hitLevels?.includes(hitLevelValue.Low)}
            onClick={() => {
              if (hitLevels?.includes(hitLevelValue.Low)) {
                removeFilterElement(filterKey.HitLevel, hitLevelValue.Low);
              } else {
                addFilterElement(filterKey.HitLevel, hitLevelValue.Low);
              }
            }}
          >
            Low
          </FilterToggleButton>
          <FilterToggleButton
            active={hitLevels?.includes(hitLevelValue.Mid)}
            onClick={() => {
              if (hitLevels?.includes(hitLevelValue.Mid)) {
                removeFilterElement(filterKey.HitLevel, hitLevelValue.Mid);
              } else {
                addFilterElement(filterKey.HitLevel, hitLevelValue.Mid);
              }
            }}
          >
            Mid
          </FilterToggleButton>
          <FilterToggleButton
            active={hitLevels?.includes(hitLevelValue.High)}
            onClick={() => {
              if (hitLevels?.includes(hitLevelValue.High)) {
                removeFilterElement(filterKey.HitLevel, hitLevelValue.High);
              } else {
                addFilterElement(filterKey.HitLevel, hitLevelValue.High);
              }
            }}
          >
            High
          </FilterToggleButton>
          <FilterToggleButton
            active={hitLevels?.includes(hitLevelValue.Throw)}
            onClick={() => {
              if (hitLevels?.includes(hitLevelValue.Throw)) {
                removeFilterElement(filterKey.HitLevel, hitLevelValue.Throw);
              } else {
                addFilterElement(filterKey.HitLevel, hitLevelValue.Throw);
              }
            }}
          >
            Throw
          </FilterToggleButton>
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <div className="mb-1 font-bold">Block frames</div>
        <div className="flex flex-wrap gap-3">
          <FilterToggleButton
            active={blockFrameMin === 1}
            onClick={() => {
              const searchParamsState = new SearchParamsState();
              searchParamsState.remove(filterKey.BlockFrameMax);
              if (blockFrameMin === 1) {
                searchParamsState.remove(filterKey.BlockFrameMin);
              } else {
                searchParamsState.set(filterKey.BlockFrameMin, '1');
              }
              updateFilterValues(searchParamsState.getChanges());
            }}
          >
            Plus
          </FilterToggleButton>
          <FilterToggleButton
            active={blockFrameMax === -10}
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
          </FilterToggleButton>
          <FilterToggleButton
            active={blockFrameMin === -9}
            onClick={() => {
              const searchParamsState = new SearchParamsState();
              searchParamsState.remove(filterKey.BlockFrameMax);
              if (blockFrameMin === -9) {
                searchParamsState.remove(filterKey.BlockFrameMin);
              } else {
                searchParamsState.set(filterKey.BlockFrameMin, '-9');
              }
              updateFilterValues(searchParamsState.getChanges());
            }}
          >
            Safe
          </FilterToggleButton>
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
        <div className="mb-1 font-bold">Hit frames</div>
        <div className="flex flex-wrap gap-3">
          <FilterToggleButton
            active={hitFrameMin === 0}
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
          </FilterToggleButton>
          <FilterToggleButton
            active={hitFrameMax === -1}
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
          </FilterToggleButton>
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
        <div className="mb-1 font-bold">Startup frames</div>
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
        <div className="mb-1 font-bold">Crush</div>
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
              <FilterToggleButton
                key={key}
                active={value}
                onClick={() => {
                  if (value) {
                    removeFilterValue(key);
                  } else {
                    setFilterValue(key, '');
                  }
                }}
              >
                {displayName}
              </FilterToggleButton>
            );
          })}
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <div className="mb-1 font-bold">Properties</div>
        <div className="flex flex-wrap gap-3">
          <FilterToggleButton
            active={favorite}
            onClick={() => {
              if (favorite) {
                removeFilterValue(filterKey.Favorite);
              } else {
                setFilterValue(filterKey.Favorite, '');
              }
            }}
          >
            <Heart
              size={16}
              className={favorite ? 'fill-current' : 'fill-none'}
            />
            Favorite
          </FilterToggleButton>
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
              [filterKey.Steppable, steppable, 'Steppable string'],
            ] as const
          ).map(renderPropertyButton)}
          <FilterToggleButton
            active={interruptibleActive}
            onClick={() => {
              const searchParamsState = new SearchParamsState();
              searchParamsState.remove(filterKey.InterruptibleMax);
              if (interruptibleActive) {
                searchParamsState.remove(filterKey.InterruptibleMin);
              } else {
                searchParamsState.set(filterKey.InterruptibleMin, '6');
              }
              updateFilterValues(searchParamsState.getChanges());
            }}
          >
            Interruptible string
          </FilterToggleButton>
          {(
            [
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
              [filterKey.CounterHit, counterHit, 'Counter hit'],
              [filterKey.Spike, spike, 'Spike'],
              [filterKey.FloorBreak, floorBreak, 'Floor break'],
              [filterKey.Unblockable, unblockable, 'Unblockable'],
              [filterKey.Elbow, elbow, 'Elbow'],
              [filterKey.Knee, knee, 'Knee'],
              [filterKey.Head, head, 'Head'],
              [filterKey.Shoulder, shoulder, 'Shoulder'],
              [filterKey.Hip, hip, 'Hip'],
              [filterKey.Weapon, weapon, 'Weapon'],
            ] as const
          ).map(renderPropertyButton)}
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <div className="mb-1 font-bold">States</div>
        <div className="flex flex-wrap gap-3">
          {states.map((state) => {
            const active = stanceFilter?.includes(state);
            return (
              <FilterToggleButton
                key={state}
                active={active}
                onClick={() => {
                  if (active) {
                    removeFilterElement(filterKey.Stance, state);
                  } else {
                    addFilterElement(filterKey.Stance, state);
                  }
                }}
              >
                {stateNameMap[state] || state}
              </FilterToggleButton>
            );
          })}
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <div className="mb-1 font-bold">Stances</div>
        <div className="flex flex-wrap gap-3">
          {stances.map((stance) => {
            const active = stanceFilter?.includes(stance);
            return (
              <FilterToggleButton
                key={stance}
                active={active}
                onClick={() => {
                  if (active) {
                    removeFilterElement(filterKey.Stance, stance);
                  } else {
                    addFilterElement(filterKey.Stance, stance);
                  }
                }}
              >
                {stanceNameMap[stance] || stance}
              </FilterToggleButton>
            );
          })}
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <div className="mb-1 font-bold">Transitions / Recovery</div>
        <div className="flex flex-wrap gap-3">
          {transitions.map((transition) => {
            const active = transitionFilter?.includes(transition);
            return (
              <FilterToggleButton
                key={transition}
                active={active}
                onClick={() => {
                  if (active) {
                    removeFilterElement(filterKey.Transition, transition);
                  } else {
                    addFilterElement(filterKey.Transition, transition);
                  }
                }}
              >
                {transition}
              </FilterToggleButton>
            );
          })}
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <div className="mb-1 font-bold">Media</div>
        <div className="flex flex-wrap gap-3">
          <FilterToggleButton
            active={video}
            onClick={() => {
              if (video) {
                removeFilterValue(filterKey.Video);
              } else {
                setFilterValue(filterKey.Video, '');
              }
            }}
          >
            Video
          </FilterToggleButton>
          <FilterToggleButton
            active={noVideo}
            onClick={() => {
              if (noVideo) {
                removeFilterValue(filterKey.NoVideo);
              } else {
                setFilterValue(filterKey.NoVideo, '');
              }
            }}
          >
            No Video
          </FilterToggleButton>
          <FilterToggleButton
            active={embeddedVideo}
            onClick={() => {
              if (embeddedVideo) {
                removeFilterValue(filterKey.EmbeddedVideo);
              } else {
                setFilterValue(filterKey.EmbeddedVideo, '');
              }
            }}
          >
            Embedded Video
          </FilterToggleButton>
          <FilterToggleButton
            active={noEmbeddedVideo}
            onClick={() => {
              if (noEmbeddedVideo) {
                removeFilterValue(filterKey.NoEmbeddedVideo);
              } else {
                setFilterValue(filterKey.NoEmbeddedVideo, '');
              }
            }}
          >
            No Embedded Video
          </FilterToggleButton>
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <div className="mb-1 font-bold">Number of hits</div>
        <div className="flex flex-wrap gap-3">
          <FilterToggleButton
            active={numHitsMin === 1 && numHitsMax === 1}
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
          </FilterToggleButton>
          <FilterToggleButton
            active={numHitsMin === 2 && numHitsMax === 2}
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
          </FilterToggleButton>
          <FilterToggleButton
            active={numHitsMin === 3 && numHitsMax === undefined}
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
          </FilterToggleButton>
        </div>
      </section>
    </div>
  );
};
