import { type Move } from '~/types/Move';
import { splitCommands } from '~/utils/commandUtils';
import { Command } from './Command';

export type CommandsProps = {
  command: string;
  charUrl: string;
  compressedCommandMap: Record<string, Move>;
};

/* Shows a command as a link. This component is similary to Command, but is supports multiple commands with the synttax
command1 | command2, or joined with words like "command1 into command2" */
export const Commands = ({
  command,
  charUrl,
  compressedCommandMap,
}: CommandsProps) => {
  return splitCommands(command, compressedCommandMap).map((part, index) => {
    if (part.type === 'separator') {
      return <span key={index}>{part.text}</span>;
    }
    return (
      <Command
        key={index}
        command={part.text}
        charUrl={charUrl}
        compressedCommandMap={compressedCommandMap}
      />
    );
  });
};
