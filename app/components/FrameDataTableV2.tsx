import { useMemo } from 'react'
import {
  CaretDownIcon,
  CaretSortIcon,
  CaretUpIcon,
  VideoIcon,
} from '@radix-ui/react-icons'
import { Table } from '@radix-ui/themes'
import { Link, useLocation, useSearchParams } from '@remix-run/react'
import { orderByKey } from '~/constants/sortConstants'
import { type Move } from '~/types/Move'
import { type MoveFilter } from '~/types/MoveFilter'
import { type SortOrder } from '~/types/SortOrder'
import { filterMoves, sortMovesV2 } from '~/utils/frameDataUtils'
import { charIdFromMove, commandToUrlSegment } from '~/utils/moveUtils'
import { getSortSettings } from '~/utils/sortingUtils'
import { ContentContainer } from './ContentContainer'

export type FrameDataTableProps = {
  moves: Move[]
  filter?: MoveFilter
  className?: string
  hasMultipleCharacters: boolean
}

const sortOrderIconMap: Record<SortOrder, React.ReactNode> = {
  '': <CaretSortIcon width="1.5rem" height="1.5rem" />,
  asc: <CaretDownIcon width="1.5rem" height="1.5rem" />,
  desc: <CaretUpIcon width="1.5rem" height="1.5rem" />,
}

const maxMovesToShow = 400

export const FrameDataTable = ({
  moves,
  className,
  filter,
  hasMultipleCharacters,
}: FrameDataTableProps) => {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const sortSettings = useMemo(
    () => getSortSettings(searchParams),
    [searchParams],
  )

  const createOrderLinkWithSearchParams = (columnName: string) => {
    const searchParamsCopy = new URLSearchParams(searchParams.toString())
    if (columnName === sortSettings?.sortByKey) {
      if (sortSettings.sortDirection === 'desc') {
        searchParamsCopy.delete(orderByKey)
      } else {
        searchParamsCopy.set(orderByKey, columnName + '_desc')
      }
    } else {
      searchParamsCopy.set(orderByKey, columnName + '_asc')
    }
    return location.pathname + '?' + searchParamsCopy.toString()
  }

  const filteredMoves = useMemo(() => {
    return filterMoves(moves, filter)
  }, [filter, moves])

  const sortedMoves = useMemo(() => {
    return sortMovesV2(filteredMoves, sortSettings)
  }, [filteredMoves, sortSettings])

  const paginatedMoves = useMemo(() => {
    if (sortedMoves.length > maxMovesToShow) {
      return sortedMoves.slice(0, maxMovesToShow)
    }
    return sortedMoves
  }, [sortedMoves])

  /**  Frame data imported from wavu wiki might not have unique commands. This might brake sorting
   * since react does not update dom properly. Therefor we set key based on sorting to force React
   * to create a new table */

  const tableHeaders: { id: keyof Move; displayName: string }[] = [
    { id: 'command', displayName: 'Command' },
    { id: 'hitLevel', displayName: 'Hit level' },
    { id: 'damage', displayName: 'Damage' },
    { id: 'startup', displayName: 'Startup' },
    { id: 'block', displayName: 'Block' },
    { id: 'hit', displayName: 'Hit' },
    { id: 'counterHit', displayName: 'Counter hit' },
    { id: 'notes', displayName: 'Notes' },
  ]

  return (
    <>
      <Table.Root variant="surface" className={className}>
        <Table.Header>
          <Table.Row>
            {hasMultipleCharacters && (
              <Table.ColumnHeaderCell>Char</Table.ColumnHeaderCell>
            )}
            {tableHeaders.map(h => (
              <Table.ColumnHeaderCell key={h.id}>
                <Link
                  to={createOrderLinkWithSearchParams(h.id)}
                  preventScrollReset
                  replace
                  className="flex flex-wrap items-end"
                >
                  {h.displayName}
                  {h.id.toLowerCase() === sortSettings?.sortByKey
                    ? sortOrderIconMap[sortSettings.sortDirection]
                    : sortOrderIconMap['']}
                </Link>
              </Table.ColumnHeaderCell>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {paginatedMoves.map(move => {
            const charId = hasMultipleCharacters
              ? charIdFromMove(move)
              : undefined
            return (
              <Table.Row key={move.moveNumber}>
                {charId && <Table.Cell>{charId}</Table.Cell>}
                <Table.Cell>
                  <Link
                    className="inline-flex items-center gap-2 text-text-primary"
                    style={{ textDecoration: 'none' }}
                    to={
                      (charId ? `../${charId}/` : '') +
                      commandToUrlSegment(move.command)
                    }
                  >
                    {move.command}
                    {(move.video || move.ytVideo) && <VideoIcon />}
                  </Link>
                </Table.Cell>
                <Table.Cell>{move.hitLevel}</Table.Cell>
                <Table.Cell>{move.damage}</Table.Cell>
                <Table.Cell>{move.startup}</Table.Cell>
                <Table.Cell>{move.block}</Table.Cell>
                <Table.Cell>{move.hit}</Table.Cell>
                <Table.Cell>{move.counterHit}</Table.Cell>
                <Table.Cell>
                  {move.notes &&
                    move.notes
                      .split('\n')
                      .map((line, index) => <div key={index}>{line}</div>)}
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table.Root>
      {paginatedMoves.length < sortedMoves.length && (
        <ContentContainer className="my-4">
          Showing {paginatedMoves.length} of {sortedMoves.length} moves
        </ContentContainer>
      )}
    </>
  )
}
