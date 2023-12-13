import type { TableData } from '~/types/TableData'
import type { TableId } from '~/types/TableId'

export type SheetSection = {
  sectionId: TableId
  rows: string[][]
}
/**Parses a sheet content a splits  it into sections based on rows starting with #
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
