export type Move = {
  moveNumber: number
  command: string
  name?: string,
  hitLevel: string
  damage: string
  startup: string
  block: string
  hit: string
  counterHit: string
  notes: string
  tags?: Record<string, string>
  image?: string
  video?: string
  recovery?: string
}
