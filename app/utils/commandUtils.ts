export const compressCommand = (command: string): string => {
  return command
    .replace(/^CH /, '') // remove starting with CH
    .replace(/\([^)]*\)$/, '') //remove parentheses at the end 1,2 (ob 12) => 1,2
    .replace(/[ .+/()]/g, '') //remove parentheses (1),2 => 1,2
    .toLowerCase()
}
