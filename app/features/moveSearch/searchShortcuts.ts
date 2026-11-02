import { type MoveFilter } from '~/types/MoveFilter';

/**
 * Search shortcuts, such as "pc" for power crush. filterMoves applies the
 * filter of a move query that is a shortcut, instead of a text search.
 * A Map, so queries such as "constructor" do not find inherited properties
 */
const shortcutFilters = new Map<string, MoveFilter>(
  Object.entries({
    pc: { powerCrush: true },
    he: { heatEngager: true },
    hs: { heatSmash: true },
    hom: { homing: true },
    hc: { highCrush: true },
    cs: { highCrush: true },
    lc: { lowCrush: true },
    js: { lowCrush: true },
    // Hit levels are of the last input, like the hit level filter
    low: { hitLevels: ['l'] },
    mid: { hitLevels: ['m'] },
    high: { hitLevels: ['h'] },
    throw: { hitLevels: ['t'] },
  }),
);

/** The filter of a search shortcut, or undefined if the query is not one */
export const getShortcutFilter = (
  moveQuery: string | undefined,
): MoveFilter | undefined =>
  moveQuery
    ? shortcutFilters.get(moveQuery.replace(/\s/g, '').toLowerCase())
    : undefined;
