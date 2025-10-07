import { type Move } from '~/types/Move'
import { compressCommand } from '~/utils/commandUtils'

export const MoveSummary = ({
  command,
  compressedCommandMap,
}: {
  command: string
  compressedCommandMap: Record<string, Move>
}) => {
  const move = compressedCommandMap[compressCommand(command.split(' | ')[0])]
  if (!move) return null
  return (
    <div className="text-sm text-muted-foreground">
      {[
        move.hitLevel && move.hitLevel,
        move.startup?.split(',')[0],
        move.block && `${move.block} oB`,
        move.hit && `${move.hit} oH`,
        move.counterHit && `${move.counterHit} oCH`,
      ]
        .filter(Boolean)
        .join(', ')}
    </div>
  )
}
