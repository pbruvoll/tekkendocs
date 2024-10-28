import { filterKey } from '~/constants/filterConstants'
import { type HitLevel } from '~/types/FilterTypes'
import { type MoveFilter } from '~/types/MoveFilter'
import {
  getSearchParamBoolean,
  getSearchParamNumber,
  getSearchParamStringList,
} from './urlUtils'

export const getFilterFromParams = (
  searchParams: URLSearchParams,
): MoveFilter => {
  return {
    hitLevels: getSearchParamStringList<HitLevel>(
      searchParams,
      filterKey.HitLevel,
    ),
    blockFrameMin: getSearchParamNumber(searchParams, filterKey.BlockFrameMin),
    blockFrameMax: getSearchParamNumber(searchParams, filterKey.BlockFrameMax),
    hitFrameMin: getSearchParamNumber(searchParams, filterKey.HitFrameMin),
    hitFrameMax: getSearchParamNumber(searchParams, filterKey.HitFrameMax),
    balconyBreak: getSearchParamBoolean(searchParams, filterKey.BalconyBreak),
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
    elbow: getSearchParamBoolean(searchParams, filterKey.Elbow),
    knee: getSearchParamBoolean(searchParams, filterKey.Knee),
    weapon: getSearchParamBoolean(searchParams, filterKey.Weapon),
    floorBreak: getSearchParamBoolean(searchParams, filterKey.FloorBreak),
    wallCrush: getSearchParamBoolean(searchParams, filterKey.WallCrush),
    hitsGrounded: getSearchParamBoolean(searchParams, filterKey.HitsGrounded),
    video: getSearchParamBoolean(searchParams, filterKey.Video),
    spike: getSearchParamBoolean(searchParams, filterKey.Spike),
    recoverFullCrouch: getSearchParamBoolean(
      searchParams,
      filterKey.RecoverFullCrouch,
    ),
    removeRecoveryHealth: getSearchParamBoolean(
      searchParams,
      filterKey.RemoveRecoveryHealth,
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
