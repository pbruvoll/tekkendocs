import { characterInfoT8List } from '~/constants/characterInfoListT8';
import { hitLevelValue } from '~/constants/filterConstants';
import { MoveTags } from '~/constants/moveTags';
import { type Move } from '~/types/Move';
import { charIdFromMove } from '~/utils/moveUtils';
import { type AnswerBucket, type QuizMove } from './types';

export const parseBlockValue = (block: string): number | null => {
  const direct = Number.parseInt(block, 10);
  if (!Number.isNaN(direct)) {
    return direct;
  }

  const simplified = (block.match(/i?[+-]?\d+/)?.[0] || '').replace(/^i/i, '');
  const parsed = Number.parseInt(simplified, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

export const getCharacterDisplayName = (charId: string): string =>
  characterInfoT8List.find((char) => char.id === charId)?.displayName ?? charId;

export const getMoveCharacterDisplayName = (move: Move): string =>
  getCharacterDisplayName(charIdFromMove(move));

export const getAnswerBucket = (blockValue: number): AnswerBucket => {
  if (blockValue >= 1) {
    return 'plus';
  }
  if (blockValue >= -9) {
    return 'zeroToMinusNine';
  }
  if (blockValue >= -11) {
    return 'minusTenToMinusEleven';
  }
  if (blockValue >= -14) {
    return 'minusTwelveToMinusFourteen';
  }
  return 'minusFifteenOrLess';
};

export const isThrowHitLevel = (hitLevel: string): boolean => {
  // Hit levels separate the inputs of a string with `, ` and the hits of a
  // single input with `,`. A move is a throw when one of its inputs is one,
  // e.g. King's `1,2,2+4` (`h, h, t`). Attack throws like Bryan's `ws2`
  // (`m,t`) are blockable attacks that only become a throw on hit, so their
  // block frames are still worth quizzing.
  return hitLevel
    .split(', ')
    .some((input) =>
      input.trim().toLowerCase().startsWith(hitLevelValue.Throw),
    );
};

// Face up/down + feet towards/away/left. Moves recovering on the ground are
// punished on wakeup rather than by the listed block frames, so they do not
// belong in the quiz.
const groundedRecoveryStates = ['FUFT', 'FUFA', 'FUFL', 'FDFT', 'FDFA', 'FDFL'];

export const isGroundedRecoveryState = (recoveryState: string): boolean => {
  const upperCased = recoveryState.toUpperCase();
  return groundedRecoveryStates.some((state) => upperCased.includes(state));
};

// Wavu marks every move that is a 10-hit string, or part of one, with this
// line in the notes. They are left out of the quiz.
export const isTenHitStringMove = (notes: string): boolean => {
  return notes
    .split('\n')
    .some((line) => line.trim().toLowerCase() === '* 10-hit combo string');
};

export const hasVisibleProperties = (move: Move): boolean => {
  return Object.keys(move.tags || {}).length > 0;
};

// When we import moves from wavu, a move without its own video gets the video
// of a longer move in the same string as a fallback
// (fillMissingVideosFromExtendedInput in utils/wavuJsonToCsv.py), e.g. Nina's
// df+3,2,1 shows df+3,2,1,4. Such a move does not have a video that strictly
// matches its command, so it is left out of the quiz.
const createBorrowedVideoCheck = (moves: Move[]) => {
  const commandsByVideo = new Map<string, string[]>();
  for (const move of moves) {
    if (move.video) {
      const commands = commandsByVideo.get(move.video) ?? [];
      commands.push(move.command);
      commandsByVideo.set(move.video, commands);
    }
  }
  return (move: Move): boolean =>
    (commandsByVideo.get(move.video ?? '') ?? []).some((command) =>
      command.startsWith(`${move.command},`),
    );
};

export const getEligibleQuizMoves = (moves: Move[]): QuizMove[] => {
  const hasBorrowedVideo = createBorrowedVideoCheck(moves);
  return moves.reduce<QuizMove[]>((current, move) => {
    if (!move.video || hasBorrowedVideo(move)) {
      return current;
    }

    if (
      move.tags?.[MoveTags.RageArt] !== undefined ||
      move.tags?.[MoveTags.HeatBurst] !== undefined
    ) {
      return current;
    }

    const hitLevel = move.hitLevel?.trim().toLowerCase();
    if (!hitLevel) {
      return current;
    }

    if (isThrowHitLevel(hitLevel)) {
      return current;
    }

    if (hitLevel.startsWith('ub') || hitLevel.endsWith('!')) {
      return current;
    }

    if (isGroundedRecoveryState(move.recoveryState || '')) {
      return current;
    }

    if (isTenHitStringMove(move.notes || '')) {
      return current;
    }

    const blockValue = parseBlockValue(move.block || '');
    if (blockValue === null) {
      return current;
    }

    current.push({ id: move.id, move, blockValue });
    return current;
  }, []);
};
