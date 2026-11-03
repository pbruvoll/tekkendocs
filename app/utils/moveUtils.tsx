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

/** Splits a move id like "Devil Jin-1,2" in the character name and the command.
 * The command may hold '-' (Steve-after-2steps+1), of the names only Jack-8 does */
const moveIdPattern = /^(Jack-8|[^-]*)-(.*)$/s;
const splitMoveId = (id: string) => {
  const match = moveIdPattern.exec(id);
  return {
    characterName: match ? match[1] : id,
    command: match ? match[2] : '',
  };
};

export const charIdFromMove = (move: Pick<Move, 'id'>): string =>
  splitMoveId(move.id).characterName.replace(/ /g, '-').toLowerCase();

/** The url of the move page. Without a charId, the character is taken from the move id */
export const moveUrlFor = (
  gameRouteId: string,
  charId: string | undefined,
  move: Move,
) =>
  `/${gameRouteId}/${charId || charIdFromMove(move)}/${commandToUrlSegmentEncoded(move.command)}`;

export const hasVideo = (move: Pick<Move, 'ytVideo' | 'video'>) =>
  Boolean(move.ytVideo || move.video);

export const videoFileNameFromMove = (move: Move): string => {
  return `${splitMoveId(move.id)
    .command.toLowerCase()
    .replace(/ /g, '-')
    .replace(/\(/g, '')
    .replace(/\)/g, '')
    .replace(/\*/g, 'x')
    .replace(/:/g, 'j')
    .replace(/#/g, 'j')}.mp4`;
};
