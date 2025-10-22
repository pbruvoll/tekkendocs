import { type CreditPerson, type CreditRole } from '~/types/CreditPerson';
import { type TableData } from '~/types/TableData';

export const creditsTableToJson = (
  table: TableData,
): CreditPerson[] | undefined => {
  if (
    !table.headers ||
    table.headers[0].toLowerCase() !== 'name' ||
    table.headers[1] !== 'url' ||
    table.headers[2] !== 'role'
  ) {
    console.warn('invalid credits table header', table.headers);
    return undefined;
  }
  if (table.rows.length === 0) {
    return undefined;
  }
  return table.rows.map((r) => {
    return {
      name: r[0],
      url: r[1],
      role: r[2].toLowerCase() as CreditRole,
    };
  });
};
