export type KeyMove = {
  command: string
  description: string
}

export type KeyMovesProps = {
  moves: KeyMove[]
}

export const KeyMoves = ({ moves }: KeyMovesProps) => {
  return 'keyMoves'
}
