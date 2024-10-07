export const compressCommand = (command: string): string => {
  return command.replace(/[ .+/]/g, '').toLowerCase();
}
