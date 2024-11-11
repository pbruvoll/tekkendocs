import { type CreditPerson, type CreditRole } from '~/types/CreditPerson'
import { type TableId } from '~/types/TableId'
import { type SheetSection } from '~/utils/sheetUtils.server'
import { type GuideData } from './GuideData'

export const tablesToGuideData = (
  sheetSections: SheetSection[],
): Partial<GuideData> => {
  const guideData: Partial<GuideData> = {}
  sheetSections.forEach(section => {
    const tableId = section.sectionId
    const rows = section.rows.slice(1)
    const handler = tableHandlers[tableId]
    if (!handler) {
      console.warn(`No handler for table ${tableId}`)
      return
    }
    handler(rows, guideData)
  })

  return guideData
}

const tableHandlers: Partial<
  Record<TableId, (rows: string[][], guideData: Partial<GuideData>) => void>
> = {
  resources_external: (rows, guideData) => {
    guideData.externalResources = rows.map(row => ({
      url: row[0],
      name: row[1],
    }))
  },
  credits: (rows, guideData) => {
    const credits: CreditPerson[] = rows.map(r => {
      return {
        name: r[0],
        url: r[1],
        role: r[2].toLowerCase() as CreditRole,
      }
    })
    const authors = credits.filter(c => c.role === 'author')
    const contributors = credits.filter(c => c.role !== 'author')
    guideData.authors = authors
    guideData.contributors = contributors
  },
  key_moves: (rows, guideData) => {
    guideData.keyMoves = rows.map(row => ({
      command: row[0],
      description: row[1],
    }))
  },
  introduction: (rows, guideData) => {
    guideData.introduction = rows.map(row => row[0])
  },
  strengths: (rows, guideData) => {
    guideData.strengths = rows.map(row => row[0])
  },
  weaknesses: (rows, guideData) => {
    guideData.weaknesses = rows.map(row => row[0])
  },
  punishers_standing: (rows, guideData) => {
    guideData.standingPunishers = rows.map(row => ({
      startup: row[0],
      command: row[1],
      description: row[2],
    }))
  },
}
