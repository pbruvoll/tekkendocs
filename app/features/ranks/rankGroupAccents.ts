/**
 * Accent color per rank group. The group names in `t8Ranks` already describe the
 * color of the in-game rank plate, so the ladder is tinted to match it.
 */
export const rankGroupAccents: Record<string, string> = {
  Silver: 'oklch(0.82 0.02 250)',
  'Light blue': 'oklch(0.83 0.13 205)',
  Green: 'oklch(0.82 0.19 145)',
  Yellow: 'oklch(0.88 0.17 95)',
  Orange: 'oklch(0.78 0.17 55)',
  Red: 'oklch(0.68 0.21 25)',
  Purple: 'oklch(0.7 0.21 305)',
  Blue: 'oklch(0.67 0.19 260)',
  'Gold (Purple)': 'oklch(0.78 0.14 330)',
  Gold: 'oklch(0.85 0.16 85)',
  'God of Destruction': 'oklch(0.65 0.25 20)',
};

export const defaultRankGroupAccent = 'oklch(0.75 0.02 250)';

export const getRankGroupAccent = (group: string): string =>
  rankGroupAccents[group] ?? defaultRankGroupAccent;
