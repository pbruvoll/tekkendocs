import {
  CaretDownIcon,
  CaretSortIcon,
  CaretUpIcon,
} from '@radix-ui/react-icons';
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
import { type MoveFilter } from '~/types/MoveFilter';
import { type SortOrder } from '~/types/SortOrder';
import { type TableDataWithHeader } from '~/types/TableData';
import { filterRows, sortRows } from '~/utils/frameDataUtils';
import { commandToUrlSegment } from '~/utils/moveUtils';

export type FrameDataTableProps = {
  table: TableDataWithHeader;
  filter?: MoveFilter;
  className?: string;
};

const sortOrderIconMap: Record<SortOrder, React.ReactNode> = {
  '': <CaretSortIcon width="1.5rem" height="1.5rem" />,
  asc: <CaretDownIcon width="1.5rem" height="1.5rem" />,
  desc: <CaretUpIcon width="1.5rem" height="1.5rem" />,
};

export const FrameDataTable = ({
  table,
  className,
  filter,
}: FrameDataTableProps) => {
  const maxRows = 8;
  const columnNums = (table.headers || table.rows[0])
    .map((_, index) => index)
    .slice(0, maxRows);
  const tableHeaders = table.headers.slice(0, maxRows);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const orderByParamValue = searchParams.get(orderByKey) || '';
  const [orderByColumnName, orderDirectionName] = orderByParamValue.split('_');

  const sortDirection: SortOrder =
    orderDirectionName === 'asc' ? 'asc' : 'desc';

  const createOrderLinkWithSearchParams = (columnName: string) => {
    const searchParamsCopy = new URLSearchParams(searchParams.toString());
    if (columnName === orderByColumnName) {
      if (sortDirection === 'desc') {
        searchParamsCopy.delete(orderByKey);
      } else {
        searchParamsCopy.set(orderByKey, `${columnName}_desc`);
      }
    } else {
      searchParamsCopy.set(orderByKey, `${columnName}_asc`);
    }
    return `${location.pathname}?${searchParamsCopy.toString()}`;
  };

  const filteredRows = useMemo(() => {
    return filterRows(table.rows, filter);
  }, [filter, table.rows]);

  const sortedRows = useMemo(() => {
    return sortRows(
      filteredRows,
      table.headers,
      orderByColumnName,
      sortDirection,
    );
  }, [orderByColumnName, table.headers, filteredRows, sortDirection]);

  /**  Frame data imported from wavu wiki might not have unique commands. This might brake sorting
   * since react does not update dom properly. Therefor we set key based on sorting to force React
   * to create a new table */

  return (
    <Table
      className={className}
      key={orderByColumnName + sortDirection + JSON.stringify(filter)}
    >
      <TableHeader>
        <TableRow>
          {tableHeaders.map((h) => (
            <TableHead key={h}>
              <Link
                to={createOrderLinkWithSearchParams(h.toLowerCase())}
                className="flex flex-wrap items-end"
              >
                {h}
                {h.toLowerCase() === orderByColumnName
                  ? sortOrderIconMap[sortDirection]
                  : sortOrderIconMap['']}
              </Link>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedRows.map((row) => {
          return (
            <TableRow key={row[0]}>
              {columnNums.map((j) => {
                const cell = row[j] || '';
                if (j === 0) {
                  //this is a command, so make it link
                  return (
                    <TableCell key={j}>
                      <Link
                        className="text-primary"
                        style={{ textDecoration: 'none' }}
                        to={commandToUrlSegment(cell)}
                      >
                        {cell}
                      </Link>
                    </TableCell>
                  );
                }
                if (j === 7) {
                  //notes column, perserve new lines
                  return (
                    <TableCell key={j}>
                      {cell.split('\n').map((line, index) => (
                        <div key={index}>{line}</div>
                      ))}
                    </TableCell>
                  );
                }
                return <TableCell key={j}>{cell}</TableCell>;
              })}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
