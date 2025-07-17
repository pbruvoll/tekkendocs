import { filterKey } from '~/constants/filterConstants'
import { type HitLevel } from '~/types/FilterTypes'
import { type MoveFilter } from '~/types/MoveFilter'
import {
  getSearchParamBoolean,
  getSearchParamNumber,
  getSearchParamStringList,
} from './urlUtils'

/** A function which removes "+", but only if it is not between two digits, e.g d+2 => d2 and 1+2 => 1+2 */

export const cleanCommand = (move: string): string => {
  return move
    .replace(/,|n,|\//g, '')
    .replace(/([A-Za-z])\+/g, '$1')
    .toLowerCase()
}

export const getFilterFromParams = (
  searchParams: URLSearchParams,
): MoveFilter => {
  return {
    hitLevels: getSearchParamStringList<HitLevel>(
      searchParams,
      filterKey.HitLevel,
    ),
    startupFrameMin: getSearchParamNumber(
      searchParams,
      filterKey.StartupFrameMin,
    ),
    startupFrameMax: getSearchParamNumber(
      searchParams,
      filterKey.StartupFrameMax,
    ),
    blockFrameMin: getSearchParamNumber(searchParams, filterKey.BlockFrameMin),
    blockFrameMax: getSearchParamNumber(searchParams, filterKey.BlockFrameMax),
    hitFrameMin: getSearchParamNumber(searchParams, filterKey.HitFrameMin),
    hitFrameMax: getSearchParamNumber(searchParams, filterKey.HitFrameMax),
    balconyBreak: getSearchParamBoolean(searchParams, filterKey.BalconyBreak),
    reversalBreak: getSearchParamBoolean(searchParams, filterKey.ReversalBreak),
    heatSmash: getSearchParamBoolean(searchParams, filterKey.HeatSmash),
    heatEngager: getSearchParamBoolean(searchParams, filterKey.HeatEngager),
    homing: getSearchParamBoolean(searchParams, filterKey.Homing),
    tornado: getSearchParamBoolean(searchParams, filterKey.Tornado),
    jails: getSearchParamBoolean(searchParams, filterKey.Jails),
    noJails: getSearchParamBoolean(searchParams, filterKey.NoJails),
    numHitsMin: getSearchParamNumber(searchParams, filterKey.NumHitsMin),
    numHitsMax: getSearchParamNumber(searchParams, filterKey.NumHitsMax),
    stance: getSearchParamStringList(searchParams, filterKey.Stance),
    highCrush: getSearchParamBoolean(searchParams, filterKey.HighCrush),
    lowCrush: getSearchParamBoolean(searchParams, filterKey.LowCrush),
    powerCrush: getSearchParamBoolean(searchParams, filterKey.PowerCrush),
    parry: getSearchParamBoolean(searchParams, filterKey.Parry),
    elbow: getSearchParamBoolean(searchParams, filterKey.Elbow),
    knee: getSearchParamBoolean(searchParams, filterKey.Knee),
    weapon: getSearchParamBoolean(searchParams, filterKey.Weapon),
    floorBreak: getSearchParamBoolean(searchParams, filterKey.FloorBreak),
    wallCrush: getSearchParamBoolean(searchParams, filterKey.WallCrush),
    hitsGrounded: getSearchParamBoolean(searchParams, filterKey.HitsGrounded),
    video: getSearchParamBoolean(searchParams, filterKey.Video),
    spike: getSearchParamBoolean(searchParams, filterKey.Spike),
    transition: getSearchParamStringList(searchParams, filterKey.Transition),
    recoverFullCrouch: getSearchParamBoolean(
      searchParams,
      filterKey.RecoverFullCrouch,
    ),
    removeRecoveryHealth: getSearchParamBoolean(
      searchParams,
      filterKey.RemoveRecoveryHealth,
    ),
    forcesCrouchOnBlock: getSearchParamBoolean(
      searchParams,
      filterKey.ForcesCrouchOnBlock,
    ),
    forcesCrouchOnHit: getSearchParamBoolean(
      searchParams,
      filterKey.ForcesCrouchOnHit,
    ),
    chip: getSearchParamBoolean(searchParams, filterKey.Chip),
  }
}

export const filterToDescription = (filter: MoveFilter): string => {
  return Object.entries(filter)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${value}`)
    .join(' & ')
}
