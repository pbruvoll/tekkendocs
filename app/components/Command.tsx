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
  command: commandProp,
  charUrl,
  compressedCommandMap,
}: CommandProps) => {
  let command = commandProp;
  const compressedCommand = compressCommand(command);
  let move =
    compressedCommandMap[compressedCommand] ||
    compressedCommandMap[removeTransitionInput(compressedCommand)];
  if (!move) {
    // Get command and link if command is formatted with [command](link)
    const markdownLinkRegex = /^\[([^\]]+)\]\(([^)]+)\)$/;
    const match = commandProp.match(markdownLinkRegex);
    if (match) {
      command = match[1];
      move = compressedCommandMap[compressCommand(match[2])];
      if (!move && match[2]?.startsWith('https')) {
        // A little work around to support external links in guides
        return (
          <a
            className="text-primary"
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
          >
            {command}
          </a>
        );
      }
    }
  }
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
