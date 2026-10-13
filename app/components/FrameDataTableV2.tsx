import {
  ChevronDownIcon,
  ChevronsUpDownIcon,
  ChevronUpIcon,
} from 'lucide-react';
import { useMemo } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { orderByKey } from '~/constants/sortConstants';
import { type FrameDataListProps } from '~/types/FrameDataListProps';
import { type Move } from '~/types/Move';
import { type SortOrder } from '~/types/SortOrder';
import { charIdFromMove, commandToUrlSegmentEncoded } from '~/utils/moveUtils';
import { getSortSettings } from '~/utils/sortingUtils';
import { MovePreviewDialogButton } from './MovePreviewDialogButton';

export type FrameDataTableProps = FrameDataListProps;

// The 1.5rem box keeps the column widths; the padding keeps the arrows small
const sortOrderIconMap: Record<SortOrder, React.ReactNode> = {
  '': <ChevronsUpDownIcon size="1.5rem" className="p-0.75" />,
  asc: <ChevronDownIcon size="1.5rem" className="p-0.75" />,
  desc: <ChevronUpIcon size="1.5rem" className="p-0.75" />,
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
    <div className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            {showCharacter && <TableHead>Char</TableHead>}
            {tableHeaders.map((h) => (
              <TableHead key={h.id}>
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
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {moves.map((move) => {
            const computedCharId = charId || charIdFromMove(move);
            const moveUrl = `/${gameRouteId}/${computedCharId}/${commandToUrlSegmentEncoded(move.command)}`;
            return (
              <TableRow key={move.moveNumber}>
                {showCharacter && <TableCell>{computedCharId}</TableCell>}
                <TableCell>
                  <span className="inline-flex items-center gap-2 text-primary">
                    <Link style={{ textDecoration: 'none' }} to={moveUrl}>
                      {move.command}
                    </Link>
                    {(move.ytVideo || move.video) && (
                      <MovePreviewDialogButton move={move} url={moveUrl} />
                    )}
                  </span>
                </TableCell>
                <TableCell>{move.hitLevel}</TableCell>
                <TableCell>{move.damage}</TableCell>
                <TableCell>{move.startup}</TableCell>
                <TableCell>{move.block}</TableCell>
                <TableCell>{move.hit}</TableCell>
                <TableCell>{move.counterHit}</TableCell>
                <TableCell>
                  {move.notes?.split('\n').map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
