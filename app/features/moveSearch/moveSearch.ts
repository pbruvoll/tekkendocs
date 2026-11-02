import { characterInfoT8List } from '~/constants/characterInfoListT8';
import { type Move } from '~/types/Move';

/**
 * Shared text search for moves, used by the global search page, the
 * character frame data page and the move compare picker.
 *
 * Move query rules:
 * - Spaces inside the query are ignored, so "f f 2" is the same as "ff2"
 * - The stance dot is optional, so "bad1" and "bad 1" match "BAD.1"
 * - Neutral is optional, so "ff2" matches both "f,f,n,2" and "f,F+2", while
 *   "ffn2" only matches "f,f,n,2"
 * - "?" is a wildcard, so "1?2" matches "1,1,2" ("*" means hold in commands)
 * - A trailing space means the command must match exactly, so "df1 " does
 *   not match "df1,2". Not when the query has other spaces, such as "f f "
 * - Queries of 3+ characters without digits also match name, notes, hit
 *   level and tags
 *
 * Results are ranked: exact command, command prefix, command contains, and
 * finally text matches. Within a rank the original order is kept.
 */

const rank = {
  exact: 0,
  prefix: 1,
  contains: 2,
  text: 3,
} as const;

type Rank = (typeof rank)[keyof typeof rank];

const escapeRegExp = (value: string) =>
  value.replace(/[*.+^${}()|[\]\\]/g, '\\$&');

/**
 * Same as cleanCommand, plus dropping the stance dot, so "BAD.1" matches
 * "bad1". With keepNeutral "f,f,n,2" becomes "ffn2" instead of "ff2"
 */
const normalizeCommand = (command: string, keepNeutral: boolean) =>
  command
    .replace(keepNeutral ? /[,/]/g : /n,|[,/]/g, '')
    .replace(/([A-Za-z])\+/g, '$1')
    .replace(/\./g, '')
    .toLowerCase();

/** An "n" between inputs, so stance names such as KIN and SEN do not count */
const neutralInQuery = /(?<=[udfb\d.])n(?=[udfb\d]|$)/;

const normalizeText = (value: string | undefined) =>
  value?.replace(/\s/g, '').toLowerCase() ?? '';

type NormalizedMove = {
  command: string;
  commandWithNeutral: string;
  /** Hit level, notes and name, separated by a newline the query cannot contain */
  text: string;
};

// Moves are not changed after loading, so normalize each move only once
// instead of on every keystroke
const normalizedMoves = new WeakMap<Move, NormalizedMove>();

const getNormalizedMove = (move: Move): NormalizedMove => {
  let normalized = normalizedMoves.get(move);
  if (!normalized) {
    normalized = {
      command: normalizeCommand(move.command, false),
      commandWithNeutral: normalizeCommand(move.command, true),
      text: [move.hitLevel, move.notes, move.name]
        .map(normalizeText)
        .join('\n'),
    };
    normalizedMoves.set(move, normalized);
  }
  return normalized;
};

const createCommandMatcher = (
  query: string,
  exact: boolean,
): ((move: NormalizedMove) => Rank | undefined) => {
  // A query with a neutral, such as "ffn2", only matches commands with that
  // neutral. Without one, such as "fb2", the neutral in "f,n,b+2" is ignored
  const withNeutral = neutralInQuery.test(
    query.replace(/[,/]/g, '').replace(/([a-z])\+/g, '$1'),
  );
  const cleanQuery = normalizeCommand(query, true);
  const getCommand = (move: NormalizedMove) =>
    withNeutral ? move.commandWithNeutral : move.command;

  let isExact = (command: string) => command === cleanQuery;
  let isPrefix = (command: string) => command.startsWith(cleanQuery);
  let contains = (command: string) => command.includes(cleanQuery);
  if (cleanQuery.includes('?')) {
    const pattern = escapeRegExp(cleanQuery).replace(/\?/g, '.*');
    const exactRe = new RegExp(`^${pattern}$`);
    const prefixRe = new RegExp(`^${pattern}`);
    const containsRe = new RegExp(pattern);
    isExact = (command) => exactRe.test(command);
    isPrefix = (command) => prefixRe.test(command);
    contains = (command) => containsRe.test(command);
  }

  return (move) => {
    const command = getCommand(move);
    if (isExact(command)) return rank.exact;
    if (exact) return undefined;
    if (isPrefix(command)) return rank.prefix;
    if (contains(command)) return rank.contains;
    return undefined;
  };
};

const createTextMatcher = (
  query: string,
): ((move: Move, normalized: NormalizedMove) => boolean) | undefined => {
  if (query.length < 3 || /\d/.test(query)) {
    return undefined;
  }
  return (move, normalized) =>
    normalized.text.includes(query) || move.tags?.[query] !== undefined;
};

/** Returns the moves matching the query, best matches first */
export const searchMoves = (moves: Move[], moveQuery: string): Move[] => {
  const query = moveQuery.replace(/\s/g, '').toLowerCase();
  if (!query) {
    return moves;
  }
  // Only without other spaces, so typing "f f 2" does not briefly switch to
  // exact matching after "f "
  const exact = /^\s*\S+\s+$/.test(moveQuery);
  const matchCommand = createCommandMatcher(query, exact);
  const matchText = createTextMatcher(query);

  const buckets: Move[][] = [[], [], [], []];
  for (const move of moves) {
    const normalized = getNormalizedMove(move);
    const commandRank = matchCommand(normalized);
    if (commandRank !== undefined) {
      buckets[commandRank].push(move);
    } else if (matchText?.(move, normalized)) {
      buckets[rank.text].push(move);
    }
  }
  return buckets.flat();
};

/** Splits "drag f f 2" into the character part "drag" and the move part "f f 2" */
export const parseCharacterMoveQuery = (
  input: string,
): { characterQuery: string; moveQuery: string } => {
  const trimmed = input.trimStart();
  const spaceIndex = trimmed.indexOf(' ');
  if (spaceIndex === -1) {
    return { characterQuery: trimmed.toLowerCase(), moveQuery: '' };
  }
  return {
    characterQuery: trimmed.slice(0, spaceIndex).toLowerCase(),
    moveQuery: trimmed.slice(spaceIndex + 1),
  };
};

const normalizeCharacterId = (value: string) =>
  value.replace(/[-\s]/g, '').toLowerCase();

const aliasesById = new Map(
  characterInfoT8List.map((char) => [char.id, char.aliasList]),
);

/** Characters whose id starts with the query, or with an alias equal to it */
export const matchCharacters = <T extends { id: string }>(
  characters: T[],
  characterQuery: string,
): T[] => {
  const query = normalizeCharacterId(characterQuery);
  return characters.filter(
    (char) =>
      normalizeCharacterId(char.id).startsWith(query) ||
      !!aliasesById.get(char.id)?.includes(query),
  );
};
