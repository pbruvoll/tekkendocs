import { type Move } from '~/types/Move';

/**
 * True when a hit like "L" or "sl,L" ends with a low. A special low (sl) can be
 * blocked standing, so it does not count
 */
export const isLowHit = (hit: string | undefined) =>
  /^l/i.test(hit?.split(',').at(-1)?.trim() ?? '');

/**
 * A high after a low is only worth calling duckable when it can be ducked
 * after the low hits, so it is not when wavu notes a combo from normal hit.
 * Jails are handled by noJails
 */
export const canDuckHighAfterLowHit = (move: Pick<Move, 'notes'>) =>
  !(move.notes || '')
    .split('\n')
    .some(
      (line) =>
        /not duckable/i.test(line) ||
        (/combos? from/i.test(line) && !/\bCH\b/i.test(line)),
    );
