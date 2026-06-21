import { type Move } from '~/types/Move';
import { compressCommand } from '~/utils/commandUtils';

export const MoveSummary = ({
  command,
  compressedCommandMap,
}: {
  command: string;
  compressedCommandMap: Record<string, Move>;
}) => {
  const move = compressedCommandMap[compressCommand(command.split(' | ')[0])];
  if (!move) return null;
  const items = [
    move.hitLevel && move.hitLevel,
    move.startup?.split(',')[0],
    move.block && `${move.block} oB`,
    move.hit && `${move.hit} oH`,
    move.counterHit && `${move.counterHit} oCH`,
  ].filter(Boolean) as string[];

  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {items.map((item, i) => (
        <span
          key={i}
          className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
        >
          {item}
        </span>
      ))}
    </div>
  );
};
