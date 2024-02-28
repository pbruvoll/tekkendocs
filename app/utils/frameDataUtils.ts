import invariant from 'tiny-invariant'
import { type Move } from '~/types/Move'
import { type SortOrder } from '~/types/SortOrder'
import { type TableData,TableDataWithHeader } from '~/types/TableData'
import { sortRowsByNumber, sortRowsByString } from './sortingUtils'

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
  return normalFrameData.rows.map(row => {
    return {
      command: row[0],
      hitLevel: row[1],
      damage: row[2],
      startup: row[3],
      block: row[4],
      hit: row[5],
      counterHit: row[6],
      notes: row[7],
    }
  })
}

export const isHomingMove = (move: Move) => {
  return move.notes?.match(/homing/i)
}

export const isTornadoMove = (move: Move) => {
  return move.notes?.match(/tornado/i)
}

export const isBalconyBreak = (move: Move) => {
  return move.notes?.match(/balcony break/i)
}

export const isHeatEngager = (move: Move) => {
  return move.notes?.match(/heat engager/i)
}

export const isHeatMove = (move: Move) => {
  return move.command?.startsWith('H.')
}

export const isPowerCrush = (move: Move) => {
  return move.notes?.match(/power crush/i)
}

export const filterRows = (rows: string[][], filter: MoveFilter | undefined) => {
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
      return Number(blockFrameStr) <= blockFrameMax
    })
  }

  if (filter.blockFrameMin !== undefined) {
    const blockFrameMin = filter.blockFrameMin
    filterFuncs.push((row: string[]) => {
      const blockFrameStr = row[4]
      if (!blockFrameStr) {
        return false
      }
      return Number(blockFrameStr) >= blockFrameMin
    })
  }

  return rows.filter(row => {
    return filterFuncs.every(ff => ff(row))
  })
}

const isColumnNumericMap: Set<string> = new Set<string>([
  'damage',
  'start up frame',
  'block frame',
  'hit frame',
  'counter hit frame',
])

export const sortRows = (rows: string[][], headers: string[], orderByColumnName: string, sortDirection: SortOrder) => {
  const orderByColumnIndex = orderByColumnName
    ? headers.findIndex(h => h.toLowerCase() === orderByColumnName)
    : -1
  if (orderByColumnIndex >= 0) {
    if (isColumnNumericMap.has(orderByColumnName)) {
      return sortRowsByNumber(
        rows,
        orderByColumnIndex,
        sortDirection === 'asc',
      )
    }
    return sortRowsByString(
      rows,
      orderByColumnIndex,
      sortDirection === 'asc',
    )
  }
  return rows
}
