import type { TableId } from '~/types/TableId'

export const hasHeaderMap: Record<TableId, boolean> = {
  frames_normal: true,
  frames_throws: true,
  frames_tenhit: false,
  key_moves: true,
  combos_ender: true,
  combos_normal: true,
  combos_small: true,
  combos_wall: true,
  punishers_crouching: true,
  punishers_standing: true,
  punishers_whiff: true,
  videos_match: true,
}
