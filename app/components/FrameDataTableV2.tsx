import {
  CaretDownIcon,
  CaretSortIcon,
  CaretUpIcon,
} from '@radix-ui/react-icons';
import { Table } from '@radix-ui/themes';
import { useMemo } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router';
import { orderByKey } from '~/constants/sortConstants';
import { type FrameDataListProps } from '~/types/FrameDataListProps';
import { type Move, type MoveT8 } from '~/types/Move';
import { type SortOrder } from '~/types/SortOrder';
import { charIdFromMove, commandToUrlSegmentEncoded } from '~/utils/moveUtils';
import { getSortSettings } from '~/utils/sortingUtils';
import { MovePreviewDialogButton } from './MovePreviewDialogButton';

export type FrameDataTableProps = FrameDataListProps;

const sortOrderIconMap: Record<SortOrder, React.ReactNode> = {
  '': <CaretSortIcon width="1.5rem" height="1.5rem" />,
  asc: <CaretDownIcon width="1.5rem" height="1.5rem" />,
  desc: <CaretUpIcon width="1.5rem" height="1.5rem" />,
};

export const FrameDataTable = ({
  gameRouteId,
  charId,
  moves,
  className,
  forceShowCharacter,
}: FrameDataTableProps) => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const sortSettings = useMemo(
    () => getSortSettings(searchParams),
    [searchParams],
  );

  const showCharacter = forceShowCharacter || !charId;

  const createOrderLinkWithSearchParams = (columnName: string) => {
    const searchParamsCopy = new URLSearchParams(searchParams.toString());
    if (columnName === sortSettings?.sortByKey) {
      if (sortSettings.sortDirection === 'desc') {
        searchParamsCopy.delete(orderByKey);
      } else {
        searchParamsCopy.set(orderByKey, `${columnName}_desc`);
      }
    } else {
      searchParamsCopy.set(orderByKey, `${columnName}_asc`);
    }
    return `${location.pathname}?${searchParamsCopy.toString()}`;
  };

  const tableHeaders: { id: keyof Move; displayName: string }[] = [
    { id: 'command', displayName: 'Command' },
    { id: 'hitLevel', displayName: 'Hit level' },
    { id: 'damage', displayName: 'Damage' },
    { id: 'startup', displayName: 'Startup' },
    { id: 'block', displayName: 'Block' },
    { id: 'hit', displayName: 'Hit' },
    { id: 'counterHit', displayName: 'Counter hit' },
    { id: 'notes', displayName: 'Notes' },
  ];

  return (
    <Table.Root variant="surface" className={className}>
      <Table.Header>
        <Table.Row>
          {showCharacter && (
            <Table.ColumnHeaderCell>Char</Table.ColumnHeaderCell>
          )}
          {tableHeaders.map((h) => (
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
        {moves.map((move) => {
          const computedCharId = charId || charIdFromMove(move as MoveT8);
          const moveUrl = `/${gameRouteId}/${computedCharId}/${commandToUrlSegmentEncoded(move.command)}`;
          return (
            <Table.Row key={move.moveNumber}>
              {showCharacter && <Table.Cell>{computedCharId}</Table.Cell>}
              <Table.Cell>
                <span className="inline-flex items-center gap-2 text-primary">
                  <Link style={{ textDecoration: 'none' }} to={moveUrl}>
                    {move.command}
                  </Link>
                  {(move.ytVideo || move.video) && (
                    <MovePreviewDialogButton move={move} url={moveUrl} />
                  )}
                </span>
              </Table.Cell>
              <Table.Cell>{move.hitLevel}</Table.Cell>
              <Table.Cell>{move.damage}</Table.Cell>
              <Table.Cell>{move.startup}</Table.Cell>
              <Table.Cell>{move.block}</Table.Cell>
              <Table.Cell>{move.hit}</Table.Cell>
              <Table.Cell>{move.counterHit}</Table.Cell>
              <Table.Cell>
                {move.notes?.split('\n').map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table.Root>
  );
};
