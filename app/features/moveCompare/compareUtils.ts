import { type Move } from '~/types/Move';

export const parseStartupFrames = (startup: string): number | null => {
  const match = startup.match(/i?(\d+)/i);
  if (!match) {
    return null;
  }
  return Number.parseInt(match[1], 10);
};

export const parseDamageTotal = (damage: string): number | null => {
  const numbers = damage.match(/\d+(?:\.\d+)?/g);
  if (!numbers) {
    return null;
  }
  return numbers.reduce((sum, value) => sum + Number(value), 0);
};

export const parseRecoveryValue = (move: Move): number | null => {
  const recovery = move.recovery;
  if (!recovery) {
    return null;
  }
  const parsed = Number.parseInt(recovery, 10);
  return Number.isNaN(parsed) ? null : parsed;
};
