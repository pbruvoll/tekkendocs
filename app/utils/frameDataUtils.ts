import invariant from 'tiny-invariant'
import { type Move } from '~/types/Move'
import { type MoveFilter } from '~/types/MoveFilter'
import { type SortOrder } from '~/types/SortOrder'
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
  invariant(normalFrameData.headers[0].localeCompare('command'))
  invariant(normalFrameData.headers[1].localeCompare('hit level'))
  invariant(normalFrameData.headers[2].localeCompare('damage'))
  invariant(normalFrameData.headers[3].localeCompare('start up frame'))
  invariant(normalFrameData.headers[4].localeCompare('block frame'))
  invariant(normalFrameData.headers[5].localeCompare('hit frame'))
  invariant(normalFrameData.headers[5].localeCompare('counter hit frame'))
  invariant(normalFrameData.headers[7].localeCompare('notes'))
  // check optional columns
  invariant(
    normalFrameData.headers.length < 9 ||
      normalFrameData.headers[8].localeCompare('tags'),
  )
  invariant(
    normalFrameData.headers.length < 10 ||
      normalFrameData.headers[9].localeCompare('image'),
  )
  invariant(
    normalFrameData.headers.length < 11 ||
      normalFrameData.headers[10].localeCompare('video'),
  )
  invariant(normalFrameData.headers.length < 12 ||
    normalFrameData.headers[11].localeCompare('short')
  )
  return normalFrameData.rows.map((row, index) => {
    const myTags = row[8] ? tagStringToRecord(row[8]) : undefined
    console.log('myTags', myTags)
    return {
      moveNumber: index + 1,
      command: row[0],
      hitLevel: row[1],
      damage: row[2],
      startup: row[3],
      block: row[4],
      hit: row[5],
      counterHit: row[6],
      notes: row[7],
      tags: row[8] ? tagStringToRecord(row[8]) : undefined,
      image: row[9],
      video: row[10],
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

export const isChip = (move: Move) => {
  return /chip/i.test(move.notes || '')
}

export const removesRecoverableHealth = (move: Move) => {
  return /Erases opponent/i.test(move.notes || '')
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
  if (filter.hitLevel) {
    filterFuncs.push((row: string[]) => {
      const lastHitLevel = row[1]?.split(',').pop()
      return lastHitLevel?.toLowerCase() === filter.hitLevel
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
  if (filter.hitLevel) {
    filterFuncs.push((move: Move) => {
      const lastHitLevel = move.hitLevel?.split(',').pop()
      return lastHitLevel?.toLowerCase() === filter.hitLevel
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
    [filter.heatEngager, isHeatEngager],
    [filter.homing, isHomingMove],
    [filter.tornado, isTornadoMove],
    [filter.jails, jails],
    [filter.chip, isChip],
    [filter.removeRecoveryHealth, removesRecoverableHealth],
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
      const commandStance = getStance(move.command)
      return !!(commandStance && stance.includes(commandStance))
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
        (move: Move) => move.hitLevel.split(',').pop() || '',
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

export const getStances = (moves: Move[]): Set<string> => {
  return moves.reduce((stanceSet, move) => {
    const stance = getStance(move.command)
    if (stance) {
      stanceSet.add(stance)
    }
    return stanceSet
  }, new Set<string>())
}

export const getStance = (command: string): string | undefined => {
  const splitted = command.split(/[ .]/)
  return splitted.length > 1 ? splitted[0] : undefined
}
