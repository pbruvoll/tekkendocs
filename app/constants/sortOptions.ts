import { getSortByQueryParamValue } from '~/utils/sortingUtils'

export const sortOptions: {
  displayName: string
  value: string
}[] = [
  { 
    displayName: 'Start up',
    value: getSortByQueryParamValue({ sortByKey: 'startup', sortDirection: 'desc' }),
  },
  {
    displayName: 'Block (low - high)',
    value: getSortByQueryParamValue({
      sortByKey: 'block',
      sortDirection: 'desc',
    }),
  },
  {
    displayName: 'Block (high - low)',
    value: getSortByQueryParamValue({
      sortByKey: 'block',
      sortDirection: 'asc',
    }),
  },
  {
    displayName: 'Hit (low - high)',
    value: getSortByQueryParamValue({
      sortByKey: 'hit',
      sortDirection: 'desc',
    }),
  },
  {
    displayName: 'Hit (high - low)',
    value: getSortByQueryParamValue({
      sortByKey: 'hit',
      sortDirection: 'asc',
    }),
  },
  {
    displayName: 'Counter hit',
    value: getSortByQueryParamValue({
      sortByKey: 'counterHit',
      sortDirection: 'asc',
    }),
  },

  {
    displayName: 'Damage',
    value: getSortByQueryParamValue({
      sortByKey: 'damage',
      sortDirection: 'asc',
    }),
  },
  {
    displayName: 'Low Crush',
    value: getSortByQueryParamValue({
      sortByKey: 'lowCrush',
      sortDirection: 'desc',
    }),
  },
  {
    displayName: 'High Crush',
    value: getSortByQueryParamValue({
      sortByKey: 'highCrush',
      sortDirection: 'desc',
    }),
  }
]
