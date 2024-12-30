import type { TableId } from '~/types/TableId'

export const tableIdToDisplayName: Record<TableId, string> = {
  frames_normal: 'Standard',
  frames_tenhit: '10 hit',
  frames_throws: 'Throws',
  moves_homing: 'Homing moves',
  moves_balconybreak: 'Balcony Break moves',
  moves_tornado: 'Tornado moves',
  moves_heat: 'Heat moves',
  moves_heatengager: 'Heat Engagers',
  moves_powercrush: 'Power Crush',
  key_moves: 'Key moves',
  panic_moves: 'Panice moves',
  combos_ender: 'Combo enders',
  combos_normal: 'Combos',
  combos_beginner: 'Beginner combos',
  combos_small: 'Small combos',
  combos_wall: 'Wall combos',
  punishers_crouching: 'While standing punishers',
  punishers_standing: 'Standing punishers',
  punishers_whiff: 'Whiff punishers',
  videos_match: 'Match videos',
  resources_external: 'External resources',
  credits: '', // custom rendering
  introduction: 'Introduction',
  strengths: 'Strengths',
  weaknesses: 'Weaknesses',
  heat_system: 'Heat system',
  frame_traps: 'Frame traps',
  knowledge_checks: 'Knowledge checks',
  defense_tips: 'Defense tips',
  defense_moves: 'Defense moves',
}
