import { type Move } from '~/types/Move'

export const commandToUrlSegment = (command: string): string => {
  return command.replace(/[/+ ]/g, '')
}

export const charIdFromMove = (move: Move): string => {
  const index = move.wavuId.lastIndexOf('-')
  return move.wavuId.slice(0, index).replace(' ', '-').toLowerCase()
}
