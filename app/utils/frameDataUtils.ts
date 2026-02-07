import invariant from 'tiny-invariant';
import { StanceNormal } from '~/constants/filterConstants';
import { MoveTags } from '~/constants/moveTags';
import { type HitLevel } from '~/types/FilterTypes';
import { type Move } from '~/types/Move';
import { type MoveFilter } from '~/types/MoveFilter';
import { type SortOrder } from '~/types/SortOrder';
import { type SortSettings } from '~/types/SortSettings';
import { type TableData } from '~/types/TableData';
import { cleanCommand } from './filterUtils';
import {
  sortMovesByNumber,
  sortMovesByString,
  sortRowsByNumber,
  sortRowsByString,
} from './sortingUtils';
import { tagStringToRecord } from './tagUtils';

export const frameDataTableToJson = (normalFrameData: TableData): Move[] => {
  invariant(normalFrameData.headers);
  const lowerCaseHeaders = normalFrameData.headers.map((h) => h.toLowerCase());
  const commandIndex = lowerCaseHeaders.indexOf('command');
  const hitLevelIndex = lowerCaseHeaders.indexOf('hit level');
  const damageIndex = lowerCaseHeaders.indexOf('damage');
  const startupIndex = lowerCaseHeaders.indexOf('start up frame');
  const blockIndex = lowerCaseHeaders.indexOf('block frame');
  const hitIndex = lowerCaseHeaders.indexOf('hit frame');
  const counterHitIndex = lowerCaseHeaders.indexOf('counter hit frame');
  const notesIndex = lowerCaseHeaders.indexOf('notes');

  invariant(commandIndex >= 0);
  invariant(hitLevelIndex >= 0);
  invariant(damageIndex >= 0);
  invariant(startupIndex >= 0);
  invariant(blockIndex >= 0);
  invariant(hitIndex >= 0);
  invariant(counterHitIndex >= 0);
  invariant(notesIndex >= 0);

  const tagsIndex = lowerCaseHeaders.indexOf('tags');
  const transitionIndex = lowerCaseHeaders.indexOf('transitions');
  const imageIndex = lowerCaseHeaders.indexOf('image');
  const videoIndex = lowerCaseHeaders.indexOf('video');
  const wavuIdIndex = lowerCaseHeaders.indexOf('wavu id');
  const nameIndex = lowerCaseHeaders.indexOf('name');
  const recoveryIndex = lowerCaseHeaders.indexOf('recovery');

  // check optional columns
  if (tagsIndex >= 0) {
    invariant(imageIndex >= 0);
    invariant(videoIndex >= 0);
  }

  return normalFrameData.rows.map((row, index) => {
    return {
      moveNumber: index + 1,
      command: row[commandIndex],
      name: row[nameIndex],
      hitLevel: row[hitLevelIndex],
      damage: row[damageIndex],
      startup: row[startupIndex],
      block: row[blockIndex],
      hit: row[hitIndex],
      counterHit: row[counterHitIndex],
      notes: row[notesIndex],
      wavuId: row[wavuIdIndex],
      tags: row[tagsIndex] ? tagStringToRecord(row[tagsIndex]) : undefined,
      transitions: row[transitionIndex]
        ? row[transitionIndex].split(',')
        : undefined,
      image: row[imageIndex],
      video: row[videoIndex],
      recovery: row[recoveryIndex],
    };
  });
};

export const applyOverride = (
  moves: Move[],
  overrideNormalFrameData: TableData,
) => {
  invariant(overrideNormalFrameData.headers);
  const lowerCaseHeaders = overrideNormalFrameData.headers.map((h) =>
    h.toLowerCase(),
  );
  const commandIndex = lowerCaseHeaders.indexOf('command');
  const wavuIdIndex = lowerCaseHeaders.indexOf('wavu id');
  const ytVideoIndex = lowerCaseHeaders.indexOf('yt video');
  const ytStartIndex = lowerCaseHeaders.indexOf('yt start');
  const ytEndIndex = lowerCaseHeaders.indexOf('yt end');
  const tagsIndex = lowerCaseHeaders.indexOf('tags');
  const [overrideRecordByCommand, overrideRecordByWavuId] =
    overrideNormalFrameData.rows.reduce<
      [Record<string, Partial<Move>>, Record<string, Partial<Move>>]
    >(
      (current, row) => {
        const [movesByCommand, movesByWavuId] = current;
        const ytVideo = row[ytVideoIndex];
        const tags = row[tagsIndex] ? tagStringToRecord(row[tagsIndex]) : null;
        if (!ytVideo && !tags) {
          return current;
        }

        const overrideMove: Partial<Move> = {};

        if (ytVideo) {
          overrideMove.ytVideo = {
            id: ytVideo,
            start: row[ytStartIndex],
            end: row[ytEndIndex],
          };
        }
        if (tags) {
          overrideMove.tags = tags;
        }
        movesByCommand[row[commandIndex]] = overrideMove;
        movesByWavuId[row[wavuIdIndex]] = overrideMove;
        return current;
      },
      [{}, {}],
    );

  moves.forEach((move, index) => {
    const override =
      overrideRecordByCommand[move.command] ||
      overrideRecordByWavuId[move.wavuId || ''];
    if (override) {
      if (override.ytVideo) {
        move.ytVideo = override.ytVideo;
        // see if this can be video can be used for moves that starts with same command (use video for 1,1,2 also for 1, 1)
        let prevIndex = index - 1;
        while (
          prevIndex >= 0 &&
          !moves[prevIndex].ytVideo &&
          move.command.startsWith(moves[prevIndex].command)
        ) {
          moves[prevIndex].ytVideo = move.ytVideo;
          prevIndex--;
        }
      }
      if (override.tags) {
        move.tags = {
          ...move.tags,
          ...override.tags,
        };
      }
    }
  });
};

export const isHomingMove = (move: Move) => {
  return /homing/i.test(move.notes || '');
};

export const isTornadoMove = (move: Move) => {
  return /tornado/i.test(move.notes || '');
};

export const isBalconyBreak = (move: Move) => {
  return /balcony break/i.test(move.notes || '');
};

export const isReversalBreak = (move: Move) => {
  return /reversal break/i.test(move.notes || '');
};

export const isHeatEngager = (move: Move) => {
  return /heat engager/i.test(move.notes || '');
};

export const isHeatMove = (move: Move) => {
  return move.command?.startsWith('H.');
};

export const isPowerCrush = (move: Move) => {
  return /power crush/i.test(move.notes || '');
};

export const jails = (move: Move) => {
  return /jail/i.test(move.notes || '') && !/not jail/i.test(move.notes || '');
};

export const noJails = (move: Move) => {
  return (
    ((move.hitLevel || '').split(', ').length > 1 &&
      !/jail/i.test(move.notes || '')) ||
    /not jail/i.test(move.notes || '')
  );
};

export const isDuckableString = (move: Move) => {
  if (move.tags?.[MoveTags.Duckable] !== undefined) {
    return true;
  }
  const lastHitLevel = move.hitLevel?.split(', ').pop()?.[0]?.toLowerCase();
  return noJails(move) && (lastHitLevel as HitLevel) === 'h';
};

export const hitsGrounded = (move: Move) => {
  const lastHitLevel = move.hitLevel?.split(',').pop();
  return !!lastHitLevel && lastHitLevel === lastHitLevel.toUpperCase();
};

export const isChip = (move: Move) => {
  return /chip/i.test(move.notes || '');
};

export const removesRecoverableHealth = (move: Move) => {
  return /Erases opponent/i.test(move.notes || '');
};

export const recoverFullCrouch = (move: Move) => {
  return (
    move.recovery?.includes('FC') ||
    move.notes
      .toLowerCase()
      .split('\n')
      .some((s) => s.includes('transition') && s.includes('fc'))
  );
};

export const forcesCrouchOnBlock = (move: Move) => {
  return /\dc/i.test(move.block || '');
};

export const forcesCrouchOnHit = (move: Move) => {
  return /\dc/.test(move.hit || '') || /\dc/.test(move.counterHit || '');
};

export const isCounterHitMove = (move: Move) => {
  if (move.counterHit && move.counterHit !== move.hit) return true;
  if (move.command.startsWith('CH ') || move.command.startsWith('CH.'))
    return true;
  return false;
};

export const hasTag = (tag: string, move: Move) => {
  return move.tags?.[tag] !== undefined;
};

export const filterRows = (
  rows: string[][],
  filter: MoveFilter | undefined,
) => {
  if (!filter) {
    return rows;
  }

  const filterFuncs: ((row: string[]) => boolean)[] = [];
  if (filter.hitLevels?.length) {
    filterFuncs.push((row: string[]) => {
      const lastHitLevel = row[1]?.split(', ').pop()?.[0]?.toLowerCase();
      return !!filter.hitLevels?.includes(lastHitLevel as HitLevel);
    });
  }

  if (filter.startupFrameMax !== undefined) {
    const startupFrameMax = filter.startupFrameMax;
    filterFuncs.push((row: string[]) => {
      const startupFrameStr = row[3];
      if (!startupFrameStr) {
        return false;
      }
      return parseInt(startupFrameStr, 10) <= startupFrameMax;
    });
  }

  if (filter.startupFrameMin !== undefined) {
    const startupFrameMin = filter.startupFrameMin;
    filterFuncs.push((row: string[]) => {
      const startupFrameStr = row[3];
      if (!startupFrameStr) {
        return false;
      }
      return parseInt(startupFrameStr, 10) >= startupFrameMin;
    });
  }

  if (filter.blockFrameMax !== undefined) {
    const blockFrameMax = filter.blockFrameMax;
    filterFuncs.push((row: string[]) => {
      const blockFrameStr = row[4];
      if (!blockFrameStr) {
        return false;
      }
      return parseInt(blockFrameStr, 10) <= blockFrameMax;
    });
  }

  if (filter.blockFrameMin !== undefined) {
    const blockFrameMin = filter.blockFrameMin;
    filterFuncs.push((row: string[]) => {
      const blockFrameStr = row[4];
      if (!blockFrameStr) {
        return false;
      }
      return parseInt(blockFrameStr, 10) >= blockFrameMin;
    });
  }

  if (filter.hitFrameMax !== undefined) {
    const hitFrameMax = filter.hitFrameMax;
    filterFuncs.push((row: string[]) => {
      const hitFrameStr = row[5];
      if (!hitFrameStr) {
        return false;
      }
      return parseInt(hitFrameStr, 10) <= hitFrameMax;
    });
  }

  if (filter.hitFrameMin !== undefined) {
    const hitFrameMin = filter.hitFrameMin;
    filterFuncs.push((row: string[]) => {
      const hitFrameStr = row[5];
      if (!hitFrameStr) {
        return false;
      }
      return parseInt(hitFrameStr, 10) >= hitFrameMin;
    });
  }

  if (filter.numHitsMin !== undefined) {
    const numHits = filter.numHitsMin;
    filterFuncs.push((row: string[]) => {
      const moveHits = (row[1] || '').split(',').length;
      return moveHits >= numHits;
    });
  }

  if (filter.numHitsMax !== undefined) {
    const numHits = filter.numHitsMax;
    filterFuncs.push((row: string[]) => {
      const moveHits = (row[1] || '').split(',').length;
      return moveHits <= numHits;
    });
  }

  const propFilters = [
    [filter.balconyBreak, isBalconyBreak],
    [filter.reversalBreak, isReversalBreak],
    [filter.heatEngager, isHeatEngager],
    [filter.homing, isHomingMove],
    [filter.tornado, isTornadoMove],
    [filter.jails, jails],
    [filter.chip, isChip],
    [filter.removeRecoveryHealth, removesRecoverableHealth],
    [filter.recoverFullCrouch, recoverFullCrouch],
    [filter.forcesCrouchOnBlock, forcesCrouchOnBlock],
    [filter.forcesCrouchOnHit, forcesCrouchOnHit],
  ] as const;
  propFilters.forEach(([filterValue, filterFunc]) => {
    if (filterValue) {
      filterFuncs.push((row: string[]) => {
        return filterFunc({ notes: row[7] } as Move);
      });
    }
  });

  if (filter.stance && filter.stance.length > 0) {
    const stance = filter.stance;
    filterFuncs.push((row: string[]) => {
      const commandStance = getStance(row[0]);
      return !!(commandStance && stance.includes(commandStance));
    });
  }

  return rows.filter((row) => {
    return filterFuncs.every((ff) => ff(row));
  });
};

export const filterMoves = (moves: Move[], filter: MoveFilter | undefined) => {
  if (!filter) {
    return moves;
  }

  if (filter.searchQuery) {
    const searchQuery = filter.searchQuery.toLowerCase();
    return moves.filter((move) => {
      return (
        cleanCommand(move.command).includes(cleanCommand(searchQuery)) ||
        (searchQuery.length >= 3 &&
          !/\d/.test(searchQuery) &&
          (move.hitLevel.toLowerCase().includes(searchQuery) ||
            move.notes?.replace(/ /g, '').toLowerCase().includes(searchQuery) ||
            move.name?.replace(/ /g, '').toLowerCase().includes(searchQuery) ||
            move.tags?.[searchQuery] !== undefined))
      );
    });
  }

  const filterFuncs: ((move: Move) => boolean)[] = [];
  if (filter.hitLevels?.length) {
    filterFuncs.push((move: Move) => {
      const lastHitLevel = move.hitLevel?.split(', ').pop()?.[0]?.toLowerCase();
      return !!filter.hitLevels?.includes(lastHitLevel as HitLevel);
    });
  }

  if (filter.startupFrameMax !== undefined) {
    const startupFrameMax = filter.startupFrameMax;
    filterFuncs.push((move: Move) => {
      const startupFrameStr = move.startup;
      if (!startupFrameStr) {
        return false;
      }
      return parseInt(startupFrameStr.replace('i', ''), 10) <= startupFrameMax;
    });
  }

  if (filter.startupFrameMin !== undefined) {
    const startupFrameMin = filter.startupFrameMin;
    filterFuncs.push((move: Move) => {
      const startupFrameStr = move.startup;
      if (!startupFrameStr) {
        return false;
      }
      return parseInt(startupFrameStr.replace('i', ''), 10) >= startupFrameMin;
    });
  }

  if (filter.blockFrameMax !== undefined) {
    const blockFrameMax = filter.blockFrameMax;
    filterFuncs.push((move: Move) => {
      const blockFrameStr = move.block;
      if (!blockFrameStr) {
        return false;
      }
      return parseInt(blockFrameStr, 10) <= blockFrameMax;
    });
  }

  if (filter.blockFrameMin !== undefined) {
    const blockFrameMin = filter.blockFrameMin;
    filterFuncs.push((move: Move) => {
      const blockFrameStr = move.block;
      if (!blockFrameStr) {
        return false;
      }
      return parseInt(blockFrameStr, 10) >= blockFrameMin;
    });
  }

  if (filter.hitFrameMax !== undefined) {
    const hitFrameMax = filter.hitFrameMax;
    filterFuncs.push((move: Move) => {
      const hitFrameStr = move.hit;
      if (!hitFrameStr) {
        return false;
      }
      return parseInt(hitFrameStr, 10) <= hitFrameMax;
    });
  }

  if (filter.hitFrameMin !== undefined) {
    const hitFrameMin = filter.hitFrameMin;
    filterFuncs.push((move: Move) => {
      const hitFrameStr = move.hit;
      if (!hitFrameStr) {
        return false;
      }
      return parseInt(hitFrameStr, 10) >= hitFrameMin;
    });
  }

  if (filter.numHitsMin !== undefined) {
    const numHits = filter.numHitsMin;
    filterFuncs.push((move: Move) => {
      const moveHits = (move.hitLevel || '').split(',').length;
      return moveHits >= numHits;
    });
  }

  if (filter.numHitsMax !== undefined) {
    const numHits = filter.numHitsMax;
    filterFuncs.push((move: Move) => {
      const moveHits = (move.hitLevel || '').split(',').length;
      return moveHits <= numHits;
    });
  }

  const propFilters = [
    [filter.balconyBreak, isBalconyBreak],
    [filter.reversalBreak, isReversalBreak],
    [filter.heatSmash, (move: Move) => hasTag('hs', move)],
    [filter.heatEngager, isHeatEngager],
    [filter.homing, isHomingMove],
    [filter.tornado, isTornadoMove],
    [filter.jails, jails],
    [filter.noJails, noJails],
    [filter.duckableString, isDuckableString],
    [filter.hitsGrounded, hitsGrounded],
    [filter.video, (move: Move) => !!move.ytVideo],
    [filter.noVideo, (move: Move) => !move.ytVideo],
    [filter.chip, isChip],
    [filter.removeRecoveryHealth, removesRecoverableHealth],
    [filter.recoverFullCrouch, recoverFullCrouch],
    [filter.forcesCrouchOnBlock, forcesCrouchOnBlock],
    [filter.forcesCrouchOnHit, forcesCrouchOnHit],
    [filter.counterHit, isCounterHitMove],
    [filter.powerCrush, (move: Move) => hasTag('pc', move)],
    [filter.highCrush, (move: Move) => hasTag('cs', move)],
    [filter.lowCrush, (move: Move) => hasTag('js', move)],
    [filter.parry, (move: Move) => hasTag('ps', move)],
    [filter.spike, (move: Move) => hasTag('spk', move)],
    [filter.wallCrush, (move: Move) => hasTag('wc', move)],
    [filter.elbow, (move: Move) => hasTag('elb', move)],
    [filter.knee, (move: Move) => hasTag('kne', move)],
    [filter.weapon, (move: Move) => hasTag('wpn', move)],
    [filter.floorBreak, (move: Move) => hasTag('fbr', move)],
  ] as const;
  propFilters.forEach(([filterValue, filterFunc]) => {
    if (filterValue) {
      filterFuncs.push((move: Move) => {
        return filterFunc(move);
      });
    }
  });

  if (filter.stance && filter.stance.length > 0) {
    const stance = filter.stance;
    filterFuncs.push((move: Move) => {
      if (!move.command) return false;
      const stanceSplitted = move.command.split('.', 2);
      if (stance.includes(StanceNormal)) {
        return (
          stanceSplitted.length === 1 &&
          !move.command.startsWith('ws') &&
          (move.hitLevel?.split(', ').pop()?.[0]?.toLowerCase() as HitLevel) !==
            't'
        );
      }
      if (stanceSplitted.length > 1) return stance.includes(stanceSplitted[0]);
      return !!(move.command && stance.some((s) => move.command.startsWith(s)));
    });
  }

  if (filter.transition && filter.transition.length > 0) {
    const transition = filter.transition;
    filterFuncs.push((move: Move) => {
      return !!move.transitions?.some((t) => transition.includes(t));
    });
  }

  return moves.filter((move) => {
    return filterFuncs.every((ff) => ff(move));
  });
};

const isColumnNumericMap: Set<string> = new Set<string>([
  'damage',
  'start up frame',
  'block frame',
  'hit frame',
  'counter hit frame',
]);

export const sortRows = (
  rows: string[][],
  headers: string[],
  orderByColumnName: string,
  sortDirection: SortOrder,
) => {
  const orderByColumnIndex = orderByColumnName
    ? headers.findIndex((h) => h.toLowerCase() === orderByColumnName)
    : -1;
  if (orderByColumnIndex >= 0) {
    if (isColumnNumericMap.has(orderByColumnName)) {
      return sortRowsByNumber(
        rows,
        orderByColumnIndex,
        sortDirection === 'asc',
      );
    }
    return sortRowsByString(rows, orderByColumnIndex, sortDirection === 'asc');
  }
  return rows;
};

export const sortMoves = (
  moves: Move[],
  orderByProp: keyof Move | undefined,
  sortDirection: SortOrder,
) => {
  if (!orderByProp) {
    return moves;
  }
  const asc = sortDirection === 'asc';
  switch (orderByProp) {
    case 'command': {
      return sortMovesByString(moves, (move: Move) => move.command, asc);
    }
    case 'hitLevel': {
      return sortMovesByString(
        moves,
        (move: Move) => move.hitLevel.split(', ').pop() || '',
        asc,
      );
    }
    case 'damage': {
      return sortMovesByNumber(
        moves,
        (move: Move) => move.damage.split(',').pop() || '',
        asc,
      );
    }
    case 'startup': {
      return sortMovesByNumber(moves, (move: Move) => move.startup, asc);
    }
    case 'block': {
      return sortMovesByNumber(moves, (move: Move) => move.block, asc);
    }
    case 'hit': {
      return sortMovesByNumber(moves, (move: Move) => move.hit, asc);
    }
    case 'counterHit': {
      return sortMovesByNumber(moves, (move: Move) => move.counterHit, asc);
    }
    case `notes`: {
      return sortMovesByNumber(
        moves,
        (move: Move) => move.tags?.js || move.tags?.cs || move.tags?.pc || '',
        asc,
      );
    }
  }
  return moves;
};

export const sortMovesV2 = (
  moves: Move[],
  sortSettings: SortSettings | undefined,
) => {
  if (!sortSettings) {
    return moves;
  }
  const asc = sortSettings.sortDirection === 'asc';
  switch (sortSettings.sortByKey) {
    case 'command': {
      return sortMovesByString(moves, (move: Move) => move.command, asc);
    }
    case 'hitLevel': {
      return sortMovesByString(
        moves,
        (move: Move) => move.hitLevel.split(', ').pop() || '',
        asc,
      );
    }
    case 'damage': {
      return sortMovesByNumber(
        moves,
        (move: Move) => move.damage.split(',').pop() || '',
        asc,
      );
    }
    case 'startup': {
      return sortMovesByNumber(moves, (move: Move) => move.startup, asc);
    }
    case 'block': {
      return sortMovesByNumber(moves, (move: Move) => move.block, asc);
    }
    case 'hit': {
      return sortMovesByNumber(moves, (move: Move) => move.hit, asc);
    }
    case 'counterHit': {
      return sortMovesByNumber(moves, (move: Move) => move.counterHit, asc);
    }
    case 'recovery': {
      return sortMovesByNumber(
        moves,
        (move: Move) => getRecoveryFrames(move) || '',
        asc,
      );
    }
    case `notes`: {
      return sortMovesByNumber(
        moves,
        (move: Move) => move.tags?.js || move.tags?.cs || move.tags?.pc || '',
        asc,
      );
    }
    case 'highCrush': {
      return sortMovesByNumber(
        moves,
        (move: Move) => (move.tags?.cs ?? '100') || '90', // if no cs, use 100 to make it sort last, if no value for cs, make it 90 to sort after moves with a cs value
        asc,
      );
    }
    case 'lowCrush': {
      return sortMovesByNumber(
        moves,
        (move: Move) => (move.tags?.js ?? '100') || '90',
        asc,
      );
    }
  }
  return moves;
};

export const getStances = (moves: Move[]): Set<string> => {
  const allStances = moves.reduce((stanceSet, move) => {
    if (move.hitLevel.startsWith('t')) {
      return stanceSet;
    }
    const stance = getStance(move.command);
    if (stance) {
      stanceSet.add(stance);
    }
    return stanceSet;
  }, new Set<string>());
  const stances = new Set(
    Array.from(allStances).filter(
      (stance) =>
        ![
          'r',
          'back',
          'left',
          'right',
          'otg',
          'ch',
          'p',
          '(during',
          '(back',
          '(face',
        ].includes(stance.toLowerCase()) && !stance.includes(','),
    ),
  );
  return stances;
};

export const getStance = (command: string): string | undefined => {
  if (command.startsWith('ws')) {
    return 'ws';
  }
  const splitted = command.split(/[ .]/);
  return splitted.length > 1 ? splitted[0] : undefined;
};

const baseMovements = new Set([
  '',
  'f',
  'df',
  'd',
  'db',
  'b',
  'ub',
  'u',
  'uf',
  'qcf',
  'qcb',
  'hcf',
]);
// allKnwonStates = ['r', 'h', 'ws', "bt", "wr", "ch", 'ss', 'fc', 'hfc', '(back to wall)', "tackle", "(during enemy wall stun)", "(face down)"]
const knownStates = new Set([
  'r',
  'ws',
  'bt',
  'ss',
  'fc',
  'hfc',
  'p',
  'h',
  'otg',
  'wr',
  'ch',
  '(back to wall)',
  'tackle',
  '(during enemy wall stun)',
  '(airborne)',
  '(face down)',
]);

export type MoveFilterTypes = {
  movements: string[];
  states: string[];
  stances: string[];
  transitions: string[];
};

export const getMoveFilterTypes = (moves: Move[]): MoveFilterTypes => {
  const allStances = new Set<string>();
  const allTransitions = new Set<string>();
  const movements = new Set<string>();

  moves.forEach((move) => {
    if (move.hitLevel.startsWith('t')) {
      return;
    }

    if (move.transitions && move.transitions.length > 0) {
      move.transitions.forEach((transition) => {
        allTransitions.add(transition);
      });
    }

    if (move.command.startsWith('ws')) {
      allStances.add('ws');
      return;
    }
    const splittedMovement = move.command.split(/[\d+]/, 2);
    if (splittedMovement.length > 1) {
      const lowerCase = splittedMovement[0].toLowerCase();
      if (baseMovements.has(lowerCase.split(',', 1)[0])) {
        movements.add(lowerCase);
        return;
      }
    }
    const splittedStance = move.command.split('.', 2);
    if (splittedStance.length > 1 && !splittedStance[0].includes(',')) {
      allStances.add(splittedStance[0]);
      return;
    }
  });

  const stances: string[] = [];
  const states: string[] = [StanceNormal];
  Array.from(allStances).forEach((stance) => {
    if (knownStates.has(stance.toLowerCase())) {
      states.push(stance);
    } else {
      stances.push(stance);
    }
  });

  return {
    movements: Array.from(movements),
    stances,
    states,
    transitions: Array.from(allTransitions),
  };
};

export const getRecoveryFrames = (move: Move): string | undefined => {
  if (!move.recovery) return undefined;

  // match string like "t22 r18" or "r18? t22"
  const match = move.recovery.match(/(?:^|\s)r(\d\S*)(?=\s|$)/i);
  return match?.[1];
};

export const getRelatedMoves = (move: Move, moves: Move[]): Move[] => {
  const parts = move.command.split(',');
  return moves
    .filter((m) => {
      if (!m.command || !move.command || m.command === move.command) {
        return false;
      }

      // is ancestor
      const mParts = m.command.split(',');
      if (mParts.length < parts.length) {
        return move.command.startsWith(m.command);
      }

      // is sibling
      if (parts.length === mParts.length) {
        return (
          parts.length > 1 &&
          parts.slice(0, -1).join('') === mParts.slice(0, -1).join('')
        );
      }

      // is descendant
      return m.command.startsWith(move.command);
    })
    .sort(
      (a, b) =>
        (a.command.split(',').length === parts.length ? 1 : 0) -
        (b.command.split(',').length === parts.length ? 1 : 0),
    );
};
