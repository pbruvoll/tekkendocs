import invariant from 'tiny-invariant'
import { type HitLevel } from '~/types/FilterTypes'
import { type Move } from '~/types/Move'
import { type MoveFilter } from '~/types/MoveFilter'
import { type SortOrder } from '~/types/SortOrder'
import { type SortSettings } from '~/types/SortSettings'
import { type TableData } from '~/types/TableData'
import {
  sortMovesByNumber,
  sortMovesByString,
  sortRowsByNumber,
  sortRowsByString,
} from './sortingUtils'
import { tagStringToRecord } from './tagUtils'

export const frameDataTableToJson = (normalFrameData: TableData): Move[] => {
  invariant(normalFrameData.headers)
  const lowerCaseHeaders = normalFrameData.headers.map(h => h.toLowerCase())
  const commandIndex = lowerCaseHeaders.findIndex(h => h === 'command')
  const hitLevelIndex = lowerCaseHeaders.findIndex(h => h === 'hit level')
  const damageIndex = lowerCaseHeaders.findIndex(h => h === 'damage')
  const startupIndex = lowerCaseHeaders.findIndex(h => h === 'start up frame')
  const blockIndex = lowerCaseHeaders.findIndex(h => h === 'block frame')
  const hitIndex = lowerCaseHeaders.findIndex(h => h === 'hit frame')
  const counterHitIndex = lowerCaseHeaders.findIndex(
    h => h === 'counter hit frame',
  )
  const notesIndex = lowerCaseHeaders.findIndex(h => h === 'notes')

  invariant(commandIndex >= 0)
  invariant(hitLevelIndex >= 0)
  invariant(damageIndex >= 0)
  invariant(startupIndex >= 0)
  invariant(blockIndex >= 0)
  invariant(hitIndex >= 0)
  invariant(counterHitIndex >= 0)
  invariant(notesIndex >= 0)

  const tagsIndex = lowerCaseHeaders.findIndex(h => h === 'tags')
  const imageIndex = lowerCaseHeaders.findIndex(h => h === 'image')
  const videoIndex = lowerCaseHeaders.findIndex(h => h === 'video')
  const wavuIdIndex = lowerCaseHeaders.findIndex(h => h === 'wavu id')
  const nameIndex = lowerCaseHeaders.findIndex(h => h === 'name')
  const recoveryIndex = lowerCaseHeaders.findIndex(h => h === 'recovery')

  // check optional columns
  if (tagsIndex >= 0) {
    invariant(imageIndex >= 0)
    invariant(videoIndex >= 0)
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
      image: row[imageIndex],
      video: row[videoIndex],
      recovery: row[recoveryIndex],
    }
  })
}

export const applyOverride = (
  moves: Move[],
  overrideNormalFrameData: TableData,
) => {
  invariant(overrideNormalFrameData.headers)
  const lowerCaseHeaders = overrideNormalFrameData.headers.map(h =>
    h.toLowerCase(),
  )
  const commandIndex = lowerCaseHeaders.findIndex(h => h === 'command')
  const wavuIdIndex = lowerCaseHeaders.findIndex(h => h === 'wavu id')
  const ytVideoIndex = lowerCaseHeaders.findIndex(h => h === 'yt video')
  const ytStartIndex = lowerCaseHeaders.findIndex(h => h === 'yt start')
  const ytEndIndex = lowerCaseHeaders.findIndex(h => h === 'yt end')
  const [overrideRecordByCommand, overrideRecordByWavuId] =
    overrideNormalFrameData.rows.reduce<
      [Record<string, Partial<Move>>, Record<string, Partial<Move>>]
    >(
      (current, row) => {
        const [movesByCommand, movesByWavuId] = current
        const ytVideo = row[ytVideoIndex]
        if (ytVideo) {
          movesByCommand[row[commandIndex]] = {
            ytVideo: {
              id: ytVideo,
              start: row[ytStartIndex],
              end: row[ytEndIndex],
            },
          }
          movesByWavuId[row[wavuIdIndex]] = movesByCommand[row[commandIndex]]
        }
        return current
      },
      [{}, {}],
    )

  moves.forEach((move, index) => {
    const override =
      overrideRecordByCommand[move.command] ||
      overrideRecordByWavuId[move.wavuId || '']
    if (override) {
      move.ytVideo = override.ytVideo
      if (move.ytVideo) {
        // see if this can be video can be used for moves that starts with same command (use video for 1,1,2 also for 1, 1)
        let prevIndex = index - 1
        while (
          prevIndex >= 0 &&
          !moves[prevIndex].ytVideo &&
          move.command.startsWith(moves[prevIndex].command)
        ) {
          moves[prevIndex].ytVideo = move.ytVideo
          prevIndex--
        }
      }
    }
  })
}

export const isHomingMove = (move: Move) => {
  return /homing/i.test(move.notes || '')
}

export const isTornadoMove = (move: Move) => {
  return /tornado/i.test(move.notes || '')
}

export const isBalconyBreak = (move: Move) => {
  return /balcony break/i.test(move.notes || '')
}

export const isHeatEngager = (move: Move) => {
  return /heat engager/i.test(move.notes || '')
}

export const isHeatMove = (move: Move) => {
  return move.command?.startsWith('H.')
}

export const isPowerCrush = (move: Move) => {
  return /power crush/i.test(move.notes || '')
}

export const jails = (move: Move) => {
  return /jail/i.test(move.notes || '')
}

export const noJails = (move: Move) => {
  return (
    (move.hitLevel || '').split(',').length > 1 &&
    !/jail/i.test(move.notes || '')
  )
}

export const hitsGrounded = (move: Move) => {
  const lastHitLevel = move.hitLevel?.split(',').pop()
  return !!lastHitLevel && lastHitLevel === lastHitLevel.toUpperCase()
}

export const isChip = (move: Move) => {
  return /chip/i.test(move.notes || '')
}

export const removesRecoverableHealth = (move: Move) => {
  return /Erases opponent/i.test(move.notes || '')
}

export const recoverFullCrouch = (move: Move) => {
  return (move.recovery && move.recovery.includes("FC")) || move.notes.toLowerCase().split("\n").some(s => s.includes("transition") && s.includes("fc"));
}

export const hasTag = (tag: string, move: Move) => {
  return move.tags?.[tag] !== undefined
}

export const filterRows = (
  rows: string[][],
  filter: MoveFilter | undefined,
) => {
  if (!filter) {
    return rows
  }

  const filterFuncs: ((row: string[]) => boolean)[] = []
  if (filter.hitLevels && filter.hitLevels.length) {
    filterFuncs.push((row: string[]) => {
      const lastHitLevel = row[1]?.split(', ').pop()?.[0]?.toLowerCase()
      return !!filter.hitLevels?.includes(lastHitLevel as HitLevel)
    })
  }

  if (filter.blockFrameMax !== undefined) {
    const blockFrameMax = filter.blockFrameMax
    filterFuncs.push((row: string[]) => {
      const blockFrameStr = row[4]
      if (!blockFrameStr) {
        return false
      }
      return parseInt(blockFrameStr) <= blockFrameMax
    })
  }

  if (filter.blockFrameMin !== undefined) {
    const blockFrameMin = filter.blockFrameMin
    filterFuncs.push((row: string[]) => {
      const blockFrameStr = row[4]
      if (!blockFrameStr) {
        return false
      }
      return parseInt(blockFrameStr) >= blockFrameMin
    })
  }

  if (filter.hitFrameMax !== undefined) {
    const hitFrameMax = filter.hitFrameMax
    filterFuncs.push((row: string[]) => {
      const hitFrameStr = row[5]
      if (!hitFrameStr) {
        return false
      }
      return parseInt(hitFrameStr) <= hitFrameMax
    })
  }

  if (filter.hitFrameMin !== undefined) {
    const hitFrameMin = filter.hitFrameMin
    filterFuncs.push((row: string[]) => {
      const hitFrameStr = row[5]
      if (!hitFrameStr) {
        return false
      }
      return parseInt(hitFrameStr) >= hitFrameMin
    })
  }

  if (filter.numHitsMin !== undefined) {
    const numHits = filter.numHitsMin
    filterFuncs.push((row: string[]) => {
      const moveHits = (row[1] || '').split(',').length
      return moveHits >= numHits
    })
  }

  if (filter.numHitsMax !== undefined) {
    const numHits = filter.numHitsMax
    filterFuncs.push((row: string[]) => {
      const moveHits = (row[1] || '').split(',').length
      return moveHits <= numHits
    })
  }

  const propFilters = [
    [filter.balconyBreak, isBalconyBreak],
    [filter.heatEngager, isHeatEngager],
    [filter.homing, isHomingMove],
    [filter.tornado, isTornadoMove],
    [filter.jails, jails],
    [filter.chip, isChip],
    [filter.removeRecoveryHealth, removesRecoverableHealth],
  ] as const
  propFilters.forEach(([filterValue, filterFunc]) => {
    if (filterValue) {
      filterFuncs.push((row: string[]) => {
        return filterFunc({ notes: row[7] } as Move)
      })
    }
  })

  if (filter.stance && filter.stance.length > 0) {
    const stance = filter.stance
    filterFuncs.push((row: string[]) => {
      const commandStance = getStance(row[0])
      return !!(commandStance && stance.includes(commandStance))
    })
  }

  return rows.filter(row => {
    return filterFuncs.every(ff => ff(row))
  })
}

export const filterMoves = (moves: Move[], filter: MoveFilter | undefined) => {
  if (!filter) {
    return moves
  }

  const filterFuncs: ((move: Move) => boolean)[] = []
  if (filter.hitLevels && filter.hitLevels.length) {
    filterFuncs.push((move: Move) => {
      const lastHitLevel = move.hitLevel?.split(', ').pop()?.[0]?.toLowerCase()
      return !!filter.hitLevels?.includes(lastHitLevel as HitLevel)
    })
  }

  if (filter.blockFrameMax !== undefined) {
    const blockFrameMax = filter.blockFrameMax
    filterFuncs.push((move: Move) => {
      const blockFrameStr = move.block
      if (!blockFrameStr) {
        return false
      }
      return parseInt(blockFrameStr) <= blockFrameMax
    })
  }

  if (filter.blockFrameMin !== undefined) {
    const blockFrameMin = filter.blockFrameMin
    filterFuncs.push((move: Move) => {
      const blockFrameStr = move.block
      if (!blockFrameStr) {
        return false
      }
      return parseInt(blockFrameStr) >= blockFrameMin
    })
  }

  if (filter.hitFrameMax !== undefined) {
    const hitFrameMax = filter.hitFrameMax
    filterFuncs.push((move: Move) => {
      const hitFrameStr = move.hit
      if (!hitFrameStr) {
        return false
      }
      return parseInt(hitFrameStr) <= hitFrameMax
    })
  }

  if (filter.hitFrameMin !== undefined) {
    const hitFrameMin = filter.hitFrameMin
    filterFuncs.push((move: Move) => {
      const hitFrameStr = move.hit
      if (!hitFrameStr) {
        return false
      }
      return parseInt(hitFrameStr) >= hitFrameMin
    })
  }

  if (filter.numHitsMin !== undefined) {
    const numHits = filter.numHitsMin
    filterFuncs.push((move: Move) => {
      const moveHits = (move.hitLevel || '').split(',').length
      return moveHits >= numHits
    })
  }

  if (filter.numHitsMax !== undefined) {
    const numHits = filter.numHitsMax
    filterFuncs.push((move: Move) => {
      const moveHits = (move.hitLevel || '').split(',').length
      return moveHits <= numHits
    })
  }

  const propFilters = [
    [filter.balconyBreak, isBalconyBreak],
    [filter.heatSmash, (move: Move) => hasTag('hs', move)],
    [filter.heatEngager, isHeatEngager],
    [filter.homing, isHomingMove],
    [filter.tornado, isTornadoMove],
    [filter.jails, jails],
    [filter.noJails, noJails],
    [filter.hitsGrounded, hitsGrounded],
    [filter.video, (move: Move) => !!(move.video || move.ytVideo)],
    [filter.chip, isChip],
    [filter.removeRecoveryHealth, removesRecoverableHealth],
    [filter.recoverFullCrouch, recoverFullCrouch],
    [filter.powerCrush, (move: Move) => hasTag('pc', move)],
    [filter.highCrush, (move: Move) => hasTag('cs', move)],
    [filter.lowCrush, (move: Move) => hasTag('js', move)],
    [filter.spike, (move: Move) => hasTag('spk', move)],
    [filter.wallCrush, (move: Move) => hasTag('wc', move)],
    [filter.elbow, (move: Move) => hasTag('elb', move)],
    [filter.knee, (move: Move) => hasTag('kne', move)],
    [filter.weapon, (move: Move) => hasTag('wpn', move)],
    [filter.floorBreak, (move: Move) => hasTag('fbr', move)],
  ] as const
  propFilters.forEach(([filterValue, filterFunc]) => {
    if (filterValue) {
      filterFuncs.push((move: Move) => {
        return filterFunc(move)
      })
    }
  })

  if (filter.stance && filter.stance.length > 0) {
    const stance = filter.stance
    filterFuncs.push((move: Move) => {
      if (!move.command) return false
      const stanceSplitted = move.command.split('.', 2)
      if (stanceSplitted.length > 1) return stance.includes(stanceSplitted[0])
      return !!(move.command && stance.some(s => move.command.startsWith(s)))
    })
  }

  return moves.filter(move => {
    return filterFuncs.every(ff => ff(move))
  })
}

const isColumnNumericMap: Set<string> = new Set<string>([
  'damage',
  'start up frame',
  'block frame',
  'hit frame',
  'counter hit frame',
])

export const sortRows = (
  rows: string[][],
  headers: string[],
  orderByColumnName: string,
  sortDirection: SortOrder,
) => {
  const orderByColumnIndex = orderByColumnName
    ? headers.findIndex(h => h.toLowerCase() === orderByColumnName)
    : -1
  if (orderByColumnIndex >= 0) {
    if (isColumnNumericMap.has(orderByColumnName)) {
      return sortRowsByNumber(rows, orderByColumnIndex, sortDirection === 'asc')
    }
    return sortRowsByString(rows, orderByColumnIndex, sortDirection === 'asc')
  }
  return rows
}

export const sortMoves = (
  moves: Move[],
  orderByProp: keyof Move | undefined,
  sortDirection: SortOrder,
) => {
  if (!orderByProp) {
    return moves
  }
  const asc = sortDirection === 'asc'
  switch (orderByProp) {
    case 'command': {
      return sortMovesByString(moves, (move: Move) => move.command, asc)
    }
    case 'hitLevel': {
      return sortMovesByString(
        moves,
        (move: Move) => move.hitLevel.split(', ').pop() || '',
        asc,
      )
    }
    case 'damage': {
      return sortMovesByNumber(
        moves,
        (move: Move) => move.damage.split(',').pop() || '',
        asc,
      )
    }
    case 'startup': {
      return sortMovesByNumber(moves, (move: Move) => move.startup, asc)
    }
    case 'block': {
      return sortMovesByNumber(moves, (move: Move) => move.block, asc)
    }
    case 'hit': {
      return sortMovesByNumber(moves, (move: Move) => move.hit, asc)
    }
    case 'counterHit': {
      return sortMovesByNumber(moves, (move: Move) => move.counterHit, asc)
    }
    case `notes`: {
      return sortMovesByNumber(
        moves,
        (move: Move) =>
          move.tags?.['js'] || move.tags?.['cs'] || move.tags?.['pc'] || '',
        asc,
      )
    }
  }
  return moves
}

export const sortMovesV2 = (
  moves: Move[],
  sortSettings: SortSettings | undefined,
) => {
  if (!sortSettings) {
    return moves
  }
  const asc = sortSettings.sortDirection === 'asc'
  switch (sortSettings.sortByKey) {
    case 'command': {
      return sortMovesByString(moves, (move: Move) => move.command, asc)
    }
    case 'hitLevel': {
      return sortMovesByString(
        moves,
        (move: Move) => move.hitLevel.split(', ').pop() || '',
        asc,
      )
    }
    case 'damage': {
      return sortMovesByNumber(
        moves,
        (move: Move) => move.damage.split(',').pop() || '',
        asc,
      )
    }
    case 'startup': {
      return sortMovesByNumber(moves, (move: Move) => move.startup, asc)
    }
    case 'block': {
      return sortMovesByNumber(moves, (move: Move) => move.block, asc)
    }
    case 'hit': {
      return sortMovesByNumber(moves, (move: Move) => move.hit, asc)
    }
    case 'counterHit': {
      return sortMovesByNumber(moves, (move: Move) => move.counterHit, asc)
    }
    case `notes`: {
      return sortMovesByNumber(
        moves,
        (move: Move) =>
          move.tags?.['js'] || move.tags?.['cs'] || move.tags?.['pc'] || '',
        asc,
      )
    }
    case 'highCrush': {
      return sortMovesByNumber(
        moves,
        (move: Move) => (move.tags?.['cs'] ?? '100') || '90', // if no cs, use 100 to make it sort last, if no value for cs, make it 90 to sort after moves with a cs value
        asc,
      )
    }
    case 'lowCrush': {
      return sortMovesByNumber(
        moves,
        (move: Move) => (move.tags?.['js'] ?? '100') || '90',
        asc,
      )
    }
  }
  return moves
}

export const getStances = (moves: Move[]): Set<string> => {
  const allStances = moves.reduce((stanceSet, move) => {
    if (move.hitLevel.startsWith('t')) {
      return stanceSet
    }
    const stance = getStance(move.command)
    if (stance) {
      stanceSet.add(stance)
    }
    return stanceSet
  }, new Set<string>())
  const stances = new Set(
    Array.from(allStances).filter(
      stance =>
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
  )
  return stances
}

export const getStance = (command: string): string | undefined => {
  if (command.startsWith('ws')) {
    return 'ws'
  }
  const splitted = command.split(/[ .]/)
  return splitted.length > 1 ? splitted[0] : undefined
}

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
])
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
])

export type MoveFilterTypes = {
  movements: string[]
  states: string[]
  stances: string[]
}

export const getMoveFilterTypes = (moves: Move[]): MoveFilterTypes => {
  const allStances = new Set<string>()
  const movements = new Set<string>()

  moves.forEach(move => {
    if (move.hitLevel.startsWith('t')) {
      return
    }
    if (move.command.startsWith('ws')) {
      allStances.add('ws')
      return
    }
    const splittedMovement = move.command.split(/[\d+]/, 2)
    if (splittedMovement.length > 1) {
      const lowerCase = splittedMovement[0].toLowerCase()
      if (baseMovements.has(lowerCase.split(',', 1)[0])) {
        movements.add(lowerCase)
        return
      }
    }
    const splittedStance = move.command.split('.', 2)
    if (splittedStance.length > 1 && !splittedStance[0].includes(',')) {
      allStances.add(splittedStance[0])
      return
    }
  })

  const stances: string[] = []
  const states: string[] = []
  Array.from(allStances).forEach(stance => {
    if (knownStates.has(stance.toLowerCase())) {
      states.push(stance)
    } else {
      stances.push(stance)
    }
  })

  return {
    movements: Array.from(movements),
    stances,
    states,
  }
}
