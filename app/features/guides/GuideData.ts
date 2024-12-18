export type ExternalResource = {
  name: string
  url: string
}

type Author = {
  name: string
  url?: string
}

type Contributer = {
  name: string
  url?: string
}

export type Punisher = {
  startup: string
  command: string
  description?: string
}

export type KeyMove = {
  command: string
  description?: string
}

export type WhiffPunisher = {
  command: string
  description?: string
}

export type Combo = {
  starter: string
  combo: string
}

export type ComboEnderType = 'wall_break' | 'floor_break' | 'carry'
export type ComboEnder = {
  type: ComboEnderType
  combo: string
}
export type WallComboType = 'normal' | 'tornado'
export type WallCombo = {
  type: WallComboType
  combo: string
}

export type GuideData = {
  externalResources: ExternalResource[]
  authors: Author[]
  contributors: Contributer[]
  keyMoves: KeyMove[]
  panicMoves: KeyMove[]
  introduction: string[]
  strengths: string[]
  weaknesses: string[]
  standingPunishers: Punisher[]
  crouchingPunishers: Punisher[]
  whiffPunishers: WhiffPunisher[]
  heatSystem: string[]
  combos: Combo[]
  comboEnders: ComboEnder[]
  wallCombos: WallCombo[]
  smallCombos: Combo[]
}
