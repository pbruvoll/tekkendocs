import type { TableId } from '~/types/TableId'

export const tableIdToDisplayName: Record<TableId, string> = {
  frames_normal: 'Standard',
  frames_tenhit: '10 hit',
  frames_throws: 'Throws',
  key_moves: 'Key moves',
  combos_ender: 'Combo enders',
  combos_normal: 'Combos',
  combos_small: 'Small combos',
  combos_wall: 'Wall combos',
  punishers_crouching: 'While standing punishers',
  punishers_standing: 'Standing punishers',
  punishers_whiff: 'Whiff punishers',
  videos_match: 'Match videos',
}
