import { characterInfoT8List } from '~/constants/characterInfoListT8';
import { hitLevelValue } from '~/constants/filterConstants';
import { MoveTags } from '~/constants/moveTags';
import { type Move } from '~/types/Move';
import { charIdFromMove, isWavuMove } from '~/utils/moveUtils';
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

export const getMoveId = (move: Move): string => {
  return move.wavuId || `${move.moveNumber}-${move.command}`;
};

export const getCharacterDisplayName = (charId: string): string =>
  characterInfoT8List.find((char) => char.id === charId)?.displayName ?? charId;

export const getMoveCharacterDisplayName = (move: Move): string => {
  if (!isWavuMove(move)) {
    return 'Move';
  }

  return getCharacterDisplayName(charIdFromMove(move));
};

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

export const hasVisibleProperties = (move: Move): boolean => {
  return Object.keys(move.tags || {}).length > 0;
};

export const getEligibleQuizMoves = (moves: Move[]): QuizMove[] => {
  return moves.reduce<QuizMove[]>((current, move, currentIndex) => {
    if (!move.video) {
      return current;
    }

    if (move.video === moves[currentIndex + 1]?.video) {
      // Avoid fallback full-string videos duplicated across move rows.
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

    if (hitLevel.startsWith(hitLevelValue.Throw)) {
      return current;
    }

    if (hitLevel.startsWith('ub') || hitLevel.endsWith('!')) {
      return current;
    }

    const blockValue = parseBlockValue(move.block || '');
    if (blockValue === null) {
      return current;
    }

    const moveId = getMoveId(move);

    current.push({ id: moveId, move, blockValue });
    return current;
  }, []);
};
