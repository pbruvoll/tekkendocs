import { type Move, type MoveT8 } from '~/types/Move';

const urlEncodedColon = encodeURIComponent(':');

export const commandToUrlSegment = (command: string): string => {
  return command.replace(/[/+ ]/g, '');
};

export const commandToUrlSegmentEncoded = (command: string): string => {
  return commandToUrlSegment(command).replace(/:/g, urlEncodedColon);
};

export const isWavuMove = (move: Move): move is MoveT8 => {
  return 'id' in move && move.id !== undefined;
};

export const charIdFromMove = (move: Pick<MoveT8, 'id'>): string => {
  const index = move.id.lastIndexOf('-');
  return move.id.slice(0, index).replace(' ', '-').toLowerCase();
};

export const videoFileNameFromMove = (move: MoveT8): string => {
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
