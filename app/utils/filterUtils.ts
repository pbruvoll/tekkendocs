import { filterKey } from '~/constants/filterConstants'
import { type HitLevel } from '~/types/FilterTypes'
import { type MoveFilter } from '~/types/MoveFilter'
import {
  getSearchParamBoolean,
  getSearchParamNumber,
  getSearchParamString,
} from './urlUtils'

export const getFilterFromParams = (
  searchParams: URLSearchParams,
): MoveFilter => {
  return {
    hitLevel: getSearchParamString<HitLevel>(searchParams, filterKey.HitLevel),
    blockFrameMin: getSearchParamNumber(searchParams, filterKey.BlockFrameMin),
    blockFrameMax: getSearchParamNumber(searchParams, filterKey.BlockFrameMax),
    hitFrameMin: getSearchParamNumber(searchParams, filterKey.HitFrameMin),
    hitFrameMax: getSearchParamNumber(searchParams, filterKey.HitFrameMax),
    balconyBreak: getSearchParamBoolean(searchParams, filterKey.BalconyBreak),
    heatEngager: getSearchParamBoolean(searchParams, filterKey.HeatEngager),
    homing: getSearchParamBoolean(searchParams, filterKey.Homing),
    tornado: getSearchParamBoolean(searchParams, filterKey.Tornado),
    jails: getSearchParamBoolean(searchParams, filterKey.Jails),
    numHitsMin: getSearchParamNumber(searchParams, filterKey.NumHitsMin),
    numHitsMax: getSearchParamNumber(searchParams, filterKey.NumHitsMax),
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
