import { type HitLevel } from './FilterTypes'

export type MoveFilter = {
  hitLevel?: HitLevel
  blockFrameMin?: number
  blockFrameMax?: number
  hitFrameMin?: number
  hitFrameMax?: number
  homing?: boolean
  tornado?: boolean
  balconyBreak?: boolean
  heatEngager?: boolean
  jails?: boolean
  numHitsMin?: number,
  numHitsMax?: number,
  removeRecoveryHealth?: boolean,
  chip?: boolean,
}
