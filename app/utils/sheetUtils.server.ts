import type { TableData } from '~/types/TableData'
import type { TableId } from '~/types/TableId'

export type SheetSection = {
  sectionId: TableId
  rows: string[][]
}
/**Parses a sheet content and splits it into sections based on rows starting with #
 * @example [[#id1], [1,2], [#id2], [3,4]] => [{sectionId: id1}, rows: [[1,2]]}, {sectionId : id2, ...}]
 */
export const sheetToSections = (sheetData: string[][]): SheetSection[] => {
  const sections: SheetSection[] = []
  let rows = sheetData
  let idIndex = rows.findIndex(row => row[0]?.startsWith('#'))
  while (idIndex >= 0) {
    const sectionId = rows[idIndex][0].slice(1) as TableId // "#s_id" => "s_id"
    rows = rows.slice(idIndex + 1)
    const nextIdIndex = rows.findIndex(row => row[0]?.startsWith('#'))
    const endIndex = nextIdIndex >= 0 ? nextIdIndex : rows.length
    const content = rows.slice(0, endIndex).filter(row => Boolean(row[0]))
    idIndex = nextIdIndex
    sections.push({ sectionId, rows: content })
  }
  return sections
}

type ToTableOptions = {
  name: TableId
  sheetSection: SheetSection
  hasHeader: boolean
}
export const sheetSectionToTable = ({
  name,
  sheetSection,
  hasHeader,
}: ToTableOptions): TableData => {
  if (!hasHeader) {
    return {
      name,
      rows: sheetSection.rows,
    }
  }

  const lastEmptyIndex = sheetSection.rows[0].lastIndexOf('')
  const headers = sheetSection.rows[0]
  const rows = sheetSection.rows.slice(1)
  return {
    name,
    headers: lastEmptyIndex >= 0 ? headers.slice(0, lastEmptyIndex) : headers,
    rows:
      lastEmptyIndex >= 0 ? rows.map(r => r.slice(0, lastEmptyIndex)) : rows,
  }
}

/**Parses a sheet content aand splits it into sections based on given tableHeaders
 * @example [[tableHeaders[0], '', tableHeaders[1]], [1,2,3]] => [{sectionId: tableHeaders[0], rows: [[1,2]]}, {sectionId: tableHeaders[1] : rows: [[3]]}]
 */
export const sheetWeakFormatToSections = (
  sheetData: string[][],
  tableHeaders: string[],
): SheetSection[] => {
  const sections: SheetSection[] = []
  const tableHeadersLowerCase = tableHeaders.map(t => t.toLocaleLowerCase())
  let currentRow = 0
  let currentColumn = 0
  while (true) {
    const tableHeading = findTableHeading(
      sheetData,
      tableHeadersLowerCase,
      currentRow,
      currentColumn,
    )
    if (!tableHeading) {
      break
    }
    const numColumns = getNumColumns(sheetData, tableHeading)
    const tableData = parseTableData(
      sheetData,
      tableHeadersLowerCase,
      tableHeading.i + 1,
      tableHeading.j,
      numColumns,
    )
    if (tableData.length) {
      sections.push({
        rows: tableData,
        sectionId: tableHeading.value as TableId,
      })
    }
    currentRow = tableHeading.i + tableData.length + 1
    currentColumn = tableHeading.j
  }
  return sections
}

const findTableHeading = (
  sheetData: string[][],
  tableHeadersLowerCase: string[],
  startRow: number,
  startColumn: number,
) => {
  let i = startRow
  let j = startColumn
  while (true) {
    const value = sheetData[i]?.[j]
    if (value === undefined) {
      if (i === 0) {
        return null
      }
      if (i > sheetData.length - 1) {
        i = 0
        j += 1
        continue
      }
      i += 1
      continue
    }
    if (typeof value !== 'string') {
      i += 1
      continue
    }
    const valueLowerCase = value.toLocaleLowerCase()
    const tableHeader = tableHeadersLowerCase.find(th => th === valueLowerCase)
    if (tableHeader) {
      return { i, j, value }
    }
    i += 1
  }
}
function getNumColumns(
  sheetData: string[][],
  tableHeading: { i: number; j: number; value: string },
) {
  let currentColumn = tableHeading.j + 1
  let numColumns = 1
  while (sheetData[tableHeading.i][currentColumn] === '') {
    numColumns += 1
    currentColumn += 1
  }
  return numColumns
}

function parseTableData(
  sheetData: string[][],
  tableHeadersLowerCase: string[],
  startRow: number,
  startColumn: number,
  numColumns: number,
) {
  const tableData: string[][] = []
  let i = startRow
  const j = startColumn
  let maxColumnCount = 1
  while (true) {
    const value = sheetData[i]?.[j]?.toLocaleLowerCase()
    if (value === undefined || tableHeadersLowerCase.includes(value)) {
      break
    }
    if (value) {
      const row = sheetData[i].slice(j, j + numColumns)
      const firstEmptyIndex = row.findIndex(r => !r)
      const columnCount = firstEmptyIndex < 0 ? numColumns : firstEmptyIndex
      maxColumnCount = Math.max(maxColumnCount, columnCount)
      tableData.push(sheetData[i].slice(j, j + numColumns))
    }
    i += 1
  }

  if (maxColumnCount < numColumns) {
    return tableData.map(row => row.slice(0, maxColumnCount))
  }

  return tableData
}
