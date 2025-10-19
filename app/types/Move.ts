export type Move = {
  moveNumber: number;
  command: string;
  name?: string;
  hitLevel: string;
  damage: string;
  startup: string;
  block: string;
  hit: string;
  counterHit: string;
  notes: string;
  tags?: Record<string, string>;
  transitions?: string[];
  wavuId?: string;
  ytVideo?: { id: string; start?: string; end?: string };
  image?: string;
  video?: string;
  recovery?: string;
};

export type MoveT8 = Move & { wavuId: string };
