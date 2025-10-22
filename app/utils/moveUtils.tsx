import { type MoveT8 } from '~/types/Move';

const urlEncodedColon = encodeURIComponent(':');

export const commandToUrlSegment = (command: string): string => {
  return command.replace(/[/+ ]/g, '');
};

export const commandToUrlSegmentEncoded = (command: string): string => {
  return commandToUrlSegment(command).replace(/:/g, urlEncodedColon);
};

export const charIdFromMove = (move: MoveT8): string => {
  const index = move.wavuId.lastIndexOf('-');
  return move.wavuId.slice(0, index).replace(' ', '-').toLowerCase();
};
