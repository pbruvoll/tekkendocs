import type { TableId } from './TableId'

export type TableData = {
  name: TableId
  headers?: string[]
  rows: string[][]
}

export type TableDataWithHeader = {
  name: TableId
  headers: string[]
  rows: string[][]
}
