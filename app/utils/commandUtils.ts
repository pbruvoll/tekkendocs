export const compressCommand = (command: string): string => {
  return command
    .replace(/^CH /, '') // remove starting with CH
    .replace('WR', 'fff')
    .replace('hFC', 'FC')
    .replace(/\([^)]*\)$/, '') //remove parentheses at the end 1,2 (ob 12) => 1,2 (only relevatn for anti start guide)
    .replace(/[ .+/()]/g, '') //remove parentheses (1),2 => 1,2
    .toLowerCase()
    .replace(/(?<=[a-z]),(?=[a-z])/g, ''); //f,f1,2 => ff1,2 // only relevant for anti strat guide
};

export const removeTransitionInput = (command: string): string => {
  return command.replace(/[~,][a-z]+$/g, ''); //1,2~f => 1,2, f+2,df => f+2
};

/** Words and symbols guide authors use to join moves, e.g. "b+1 into uf+4" */
const commandSeparatorRegex =
  /( \| | into | to | > | -> | → | ▶ | \/ | or | & | and )/i;

export type CommandPart = {
  type: 'command' | 'separator';
  text: string;
};

/** Splits a text with several moves into its commands and the separators between them,
 * e.g. "b+1 into uf+4" => b+1 (command), " into " (separator), uf+4 (command).
 * A text that is a move by itself is never split */
export const splitCommands = (
  command: string,
  compressedCommandMap: Record<string, unknown>,
): CommandPart[] => {
  const compressed = compressCommand(command);
  if (
    compressedCommandMap[compressed] ||
    compressedCommandMap[removeTransitionInput(compressed)]
  ) {
    return [{ type: 'command', text: command }];
  }
  return command.split(commandSeparatorRegex).map((text) => ({
    type: commandSeparatorRegex.test(text) ? 'separator' : 'command',
    text,
  }));
};

/** The commands in a text with several moves, e.g. "b+1 into uf+4" => ["b+1", "uf+4"] */
export const getCommands = (
  command: string,
  compressedCommandMap: Record<string, unknown>,
): string[] =>
  splitCommands(command, compressedCommandMap)
    .filter((part) => part.type === 'command')
    .map((part) => part.text);
