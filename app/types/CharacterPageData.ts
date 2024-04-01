import { type CharacterDataType } from './CharacterDataType'
import { type Game } from './Game'
import { type Move } from './Move'
import type { TableData } from './TableData'

export type CharacterPageData = {
  game: Game
  dataType: CharacterDataType
  characterName: string
  editUrl: string
  tables: TableData[]
}

export type CharacterPageFrameData = CharacterPageData & {
  moves: Move[]
}
