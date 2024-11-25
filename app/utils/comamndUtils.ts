export const compressCommand = (command: string): string => {
  return command.replace(/^CH /, '').replace(/[ .+/()]/g, '').toLowerCase()
}
