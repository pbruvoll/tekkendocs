import { filterKey } from "~/constants/filterConstants"
import { type HitLevel } from "~/types/FilterTypes"
import { type MoveFilter } from "~/types/MoveFilter"
import { getSearchParamNumber, getSearchParamString } from "./urlUtils"

export const getFilterFromParams = (searchParams: URLSearchParams): MoveFilter => {
    return {
      hitLevel: getSearchParamString<HitLevel>(
        searchParams,
        filterKey.HitLevel,
      ),
      blockFrameMin: getSearchParamNumber(
        searchParams,
        filterKey.BlockFrameMin,
      ),
      blockFrameMax: getSearchParamNumber(
        searchParams,
        filterKey.BlockFrameMax,
      ),
    }
}

