export const commandToUrlSegment = (command: string): string => {
  return command.replace(/[/+ ]/g, '')
}
