import { type HitLevel } from './FilterTypes'

export type MoveFilter = {
  hitLevels?: HitLevel[]
  startupFrameMin?: number
  startupFrameMax?: number
  blockFrameMin?: number
  blockFrameMax?: number
  hitFrameMin?: number
  hitFrameMax?: number
  homing?: boolean
  tornado?: boolean
  balconyBreak?: boolean
  heatSmash?: boolean
  heatEngager?: boolean
  jails?: boolean
  noJails?: boolean
  numHitsMin?: number
  numHitsMax?: number
  highCrush?: boolean
  lowCrush?: boolean
  powerCrush?: boolean
  parry?: boolean
  spike?: boolean
  removeRecoveryHealth?: boolean
  recoverFullCrouch?: boolean
  weapon?: boolean
  floorBreak?: boolean
  elbow?: boolean
  knee?: boolean
  wallCrush?: boolean
  hitsGrounded?: boolean
  video?: boolean
  chip?: boolean
  searchQuery?: string
  stance?: string[]
  transition?: string[]
}
