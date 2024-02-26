import { useMemo } from 'react'
import {
  CaretDownIcon,
  CaretSortIcon,
  CaretUpIcon,
} from '@radix-ui/react-icons'
import { Table } from '@radix-ui/themes'
import { Link, useLocation, useSearchParams } from '@remix-run/react'
import { type HitLevel } from '~/types/FilterTypes'
import { type SortOrder } from '~/types/SortOrder'
import { type TableDataWithHeader } from '~/types/TableData'
import { commandToUrlSegment } from '~/utils/moveUtils'
import { sortRowsByNumber, sortRowsByString } from '~/utils/sortingUtils'

export type FrameDataTableProps = {
  table: TableDataWithHeader
  hitLevelFilter?: HitLevel
  className?: string
}

const isColumnNumericMap: Set<string> = new Set<string>([
  'damage',
  'start up frame',
  'block frame',
  'hit frame',
  'counter hit frame',
])

const sortOrderIconMap: Record<SortOrder, React.ReactNode> = {
  '': <CaretSortIcon width="1.5rem" height="1.5rem" />,
  asc: <CaretDownIcon width="1.5rem" height="1.5rem" />,
  desc: <CaretUpIcon width="1.5rem" height="1.5rem" />,
}

export const FrameDataTable = ({
  table,
  className,
  hitLevelFilter,
}: FrameDataTableProps) => {
  const columnNums = (table.headers || table.rows[0]).map((_, index) => index)
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const orderByParamValue = searchParams.get('orderby') || ''
  const [orderByColumnName, orderDirectionName] = orderByParamValue.split('_')

  const orderByKey = 'orderby'

  const sortDirection: SortOrder = orderDirectionName === 'asc' ? 'asc' : 'desc'

  const createOrderLinkWithSearchParams = (columnName: string) => {
    const searchParamsCopy = new URLSearchParams(searchParams.toString())
    if (columnName === orderByColumnName) {
      if (sortDirection === 'desc') {
        searchParamsCopy.delete(orderByKey)
      } else {
        searchParamsCopy.set(orderByKey, columnName + '_desc')
      }
    } else {
      searchParamsCopy.set(orderByKey, columnName + '_asc')
    }
    return location.pathname + '?' + searchParamsCopy.toString()
  }

  const filteredRows = useMemo(() => {
    return table.rows.filter(row => {
      const lastHitLevel = row[1]?.split(',').pop()
      return !hitLevelFilter || lastHitLevel?.toLowerCase() === hitLevelFilter
    })
  }, [hitLevelFilter, table.rows])

  const sortedRows = useMemo(() => {
    const orderByColumnIndex = orderByColumnName
      ? table.headers.findIndex(h => h.toLowerCase() === orderByColumnName)
      : -1
    if (orderByColumnIndex >= 0) {
      if (isColumnNumericMap.has(orderByColumnName)) {
        return sortRowsByNumber(
          filteredRows,
          orderByColumnIndex,
          sortDirection === 'asc',
        )
      }
      return sortRowsByString(
        filteredRows,
        orderByColumnIndex,
        sortDirection === 'asc',
      )
    }
    return filteredRows
  }, [orderByColumnName, table.headers, filteredRows, sortDirection])

  /**  Frame data imported from wavu wiki might not have unique commands. This might brake sorting
   * since react does not update dom properly. Therefor we set key based on sorting to force React
   * to create a new table */

  return (
    <Table.Root
      variant="surface"
      className={className}
      key={orderByColumnName + sortDirection + hitLevelFilter}
    >
      {table.headers && (
        <Table.Header>
          <Table.Row>
            {table.headers.map(h => (
              <Table.ColumnHeaderCell key={h}>
                <Link
                  to={createOrderLinkWithSearchParams(h.toLowerCase())}
                  className="flex flex-wrap items-end"
                >
                  {h}
                  {h.toLowerCase() === orderByColumnName
                    ? sortOrderIconMap[sortDirection]
                    : sortOrderIconMap['']}
                </Link>
              </Table.ColumnHeaderCell>
            ))}
          </Table.Row>
        </Table.Header>
      )}
      <Table.Body>
        {sortedRows.map((row, i) => {
          return (
            <Table.Row key={row[0]}>
              {columnNums.map(j => {
                const cell = row[j] || ''
                if (j === 0 && table.name === 'frames_normal') {
                  //this is a command, so make it link
                  return (
                    <Table.Cell key={j}>
                      <Link
                        className="text-text-primary"
                        style={{ textDecoration: 'none' }}
                        to={commandToUrlSegment(cell)}
                      >
                        {cell}
                      </Link>
                    </Table.Cell>
                  )
                }
                return <Table.Cell key={j}>{cell}</Table.Cell>
              })}
            </Table.Row>
          )
        })}
      </Table.Body>
    </Table.Root>
  )
}
