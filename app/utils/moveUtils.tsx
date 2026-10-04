import { type Move } from '~/types/Move';

const urlEncodedColon = encodeURIComponent(':');

export const commandToUrlSegment = (command: string): string => {
  return command.replace(/[/+ ]/g, '');
};

export const commandToUrlSegmentEncoded = (command: string): string => {
  return commandToUrlSegment(command).replace(/:/g, urlEncodedColon);
};

/** Builds an id in the same format as wavu ids, e.g. devil-jin + 1 => "Devil Jin-1" */
export const createMoveId = (characterId: string, command: string): string => {
  const characterName = characterId
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  return `${characterName}-${command}`;
};

export const charIdFromMove = (move: Pick<Move, 'id'>): string => {
  const index = move.id.lastIndexOf('-');
  return move.id.slice(0, index).replace(' ', '-').toLowerCase();
};

export const videoFileNameFromMove = (move: Move): string => {
  return `${move.id
    .split('-')
    .pop()
    ?.toLowerCase()
    .replace(/ /g, '-')
    .replace(/\(/g, '')
    .replace(/\)/g, '')
    .replace(/\*/g, 'x')
    .replace(/:/g, 'j')
    .replace(/#/g, 'j')}.mp4`;
};
