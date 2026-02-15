export const compressCommand = (command: string): string => {
  return command
    .replace(/^CH /, '') // remove starting with CH
    .replace('WR', 'fff')
    .replace(/\([^)]*\)$/, '') //remove parentheses at the end 1,2 (ob 12) => 1,2 (only relevatn for anti start guide)
    .replace(/[ .+/()]/g, '') //remove parentheses (1),2 => 1,2
    .toLowerCase()
    .replace(/(?<=[a-z]),(?=[a-z])/g, ''); //f,f1,2 => ff1,2 // only relevant for anti strat guide
};

export const removeTransitionInput = (command: string): string => {
  return command.replace(/[~,][a-z]+$/g, ''); //1,2~f => 1,2, f+2,df => f+2
};
