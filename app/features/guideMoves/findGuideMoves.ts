import { type Move } from '~/types/Move';
import { compressCommand, getCommands } from '~/utils/commandUtils';
import { hasVideo } from '~/utils/moveUtils';

/**
 * Looks up the moves of a guide command like "B1 | DF4,3" or "b+1 into uf+4".
 * All found moves are returned for the favorite heart; the video is the last
 * move that has one.
 */
export const findGuideMoves = (
  command: string,
  compressedCommandMap: Record<string, Move>,
) => {
  const moves = getCommands(command, compressedCommandMap)
    .map((part) => compressedCommandMap[compressCommand(part)])
    .filter((move): move is Move => !!move);
  const moveWithVideo = moves.filter(hasVideo).at(-1);
  return { moves, moveWithVideo };
};
