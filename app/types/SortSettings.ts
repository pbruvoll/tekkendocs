import { type SortByKey } from './SortByKey'
import { type SortOrder } from './SortOrder'

export type SortSettings = {
  sortByKey: SortByKey
  sortDirection: Exclude<SortOrder, ''>
}
