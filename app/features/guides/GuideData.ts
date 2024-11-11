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

export type GuideData = {
  externalResources: ExternalResource[]
  authors: Author[]
  contributors: Contributer[]
  keyMoves: KeyMove[]
  introduction: string[]
  strengths: string[]
  weaknesses: string[]
  standingPunishers: Punisher[]
}
