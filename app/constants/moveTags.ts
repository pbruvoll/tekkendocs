export const MoveTags = {
  Chip: 'chp',
  Duckable: 'dck',
  Elbow: 'elb',
  FloorBreak: 'fbr',
  ForceCrouch: 'fcb',
  HeatEngager: 'he',
  Homing: 'hom',
  HighCrush: 'cs',
  Knee: 'kne',
  LowCrush: 'js',
  Parry: 'ps',
  PowerCrush: 'pc',
  Spike: 'spk',
  Tornado: 'trn',
  WallBreak: 'bbr',
  WallCrush: 'wc',
  Weapon: 'wpn',
} as const;

export type MoveTag = (typeof MoveTags)[keyof typeof MoveTags];

export const moveTagToDescription: Partial<Record<MoveTag, string>> = {
  [MoveTags.Chip]: 'Causes chip damage',
  [MoveTags.FloorBreak]: 'Breaks the floor on hit',
  [MoveTags.HeatEngager]: 'Engages Heat mode on hit',
  [MoveTags.Homing]: 'Homing attack',
  [MoveTags.Spike]: 'Causes spike damage',
  [MoveTags.PowerCrush]: 'Power crush move',
  [MoveTags.Tornado]: 'Tornado attack',
  [MoveTags.WallBreak]: 'Breaks the wall on hit',
};
