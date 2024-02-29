import { filterKey } from '~/constants/filterConstants'
import { type HitLevel } from '~/types/FilterTypes'
import { type MoveFilter } from '~/types/MoveFilter'
import { getSearchParamNumber, getSearchParamString } from './urlUtils'

export const getFilterFromParams = (
  searchParams: URLSearchParams,
): MoveFilter => {
  return {
    hitLevel: getSearchParamString<HitLevel>(searchParams, filterKey.HitLevel),
    blockFrameMin: getSearchParamNumber(searchParams, filterKey.BlockFrameMin),
    blockFrameMax: getSearchParamNumber(searchParams, filterKey.BlockFrameMax),
    hitFrameMin: getSearchParamNumber(searchParams, filterKey.HitFrameMin),
    hitFrameMax: getSearchParamNumber(searchParams, filterKey.HitFrameMax),
  }
}

export const filterToDescription = (filter: MoveFilter): string => {
  return Object.entries(filter)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${value}`)
    .join(' & ')
}
