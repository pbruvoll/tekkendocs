import { Link } from 'react-router';
import { type Move } from '~/types/Move';
import { compressCommand } from '~/utils/commandUtils';
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
  const move = compressedCommandMap[compressCommand(command)];
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
