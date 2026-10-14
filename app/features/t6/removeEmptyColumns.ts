import { type TableDataWithHeader } from '~/types/TableData';

/**Removes the columns which have no value in any row, e.g. hit level, which the T6 data is missing
 * @example headers [a, b], rows [[1, ''], [2, '']] => headers [a], rows [[1], [2]]
 */
export const removeEmptyColumns = (
  table: TableDataWithHeader,
): TableDataWithHeader => {
  const keptColumns = table.headers
    .map((_, index) => index)
    .filter((index) => table.rows.some((row) => row[index]));
  return {
    ...table,
    headers: keptColumns.map((index) => table.headers[index]),
    rows: table.rows.map((row) => keptColumns.map((index) => row[index] || '')),
  };
};
