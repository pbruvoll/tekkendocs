import { Link } from 'react-router';
import { type Move } from '~/types/Move';
import { compressCommand, removeTransitionInput } from '~/utils/commandUtils';
import { commandToUrlSegmentEncoded } from '~/utils/moveUtils';

export type CommandProps = {
  command: string;
  charUrl: string;
  compressedCommandMap: Record<string, Move>;
};
export const Command = ({
  command,
  charUrl,
  compressedCommandMap,
}: CommandProps) => {
  const compressedCommand = compressCommand(command);
  const move =
    compressedCommandMap[compressedCommand] ||
    compressedCommandMap[removeTransitionInput(compressedCommand)];
  if (!move) {
    return <b>{command}</b>;
  }
  return (
    <Link
      className="text-primary"
      style={{ textDecoration: 'none' }}
      to={`${charUrl}/${commandToUrlSegmentEncoded(move.command)}`}
    >
      {command}
    </Link>
  );
};
