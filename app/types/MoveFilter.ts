import { type HitLevel } from './FilterTypes'

export type MoveFilter = {
  hitLevels?: HitLevel[]
  blockFrameMin?: number
  blockFrameMax?: number
  hitFrameMin?: number
  hitFrameMax?: number
  homing?: boolean
  tornado?: boolean
  balconyBreak?: boolean
  heatEngager?: boolean
  jails?: boolean
  numHitsMin?: number
  numHitsMax?: number
  highCrush?: boolean
  lowCrush?: boolean
  powerCrush?: boolean
  spike?: boolean
  removeRecoveryHealth?: boolean
  weapon?: boolean
  floorBreak?: boolean
  elbow?: boolean
  knee?: boolean
  wallCrush?: boolean
  hitsGrounded?: boolean
  video?: boolean
  chip?: boolean
  stance?: string[]
}
