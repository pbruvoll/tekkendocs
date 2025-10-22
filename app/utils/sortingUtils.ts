import { orderByKey } from '~/constants/sortConstants';
import { type Move } from '~/types/Move';
import { type SortByKey } from '~/types/SortByKey';
import { type SortSettings } from '~/types/SortSettings';

export const sortRowsByString = (
  rows: string[][],
  index: number,
  asc: boolean,
): string[][] => {
  return [...rows].sort((a, b) => compareStrings(a[index], b[index], asc));
};

export const sortMovesByString = (
  moves: Move[],
  toString: (move: Move) => string,
  asc: boolean,
): Move[] => {
  return [...moves].sort((a, b) =>
    compareStrings(toString(a), toString(b), asc),
  );
};

const compareNumberStrings = (a: string, b: string, asc: boolean) => {
  const aInt = parseInt(a?.startsWith('i') ? a.slice(1) : a, 10);
  const bInt = parseInt(b?.startsWith('i') ? b.slice(1) : b, 10);
  if (Number.isNaN(aInt) && Number.isNaN(bInt)) {
    return 0;
  }
  if (Number.isNaN(aInt)) {
    return 1;
  }
  if (Number.isNaN(bInt)) {
    return -1;
  }
  return asc ? bInt - aInt : aInt - bInt;
};

const compareStrings = (a: string, b: string, asc: boolean) => {
  if (!a && !b) {
    return 0;
  }
  if (!a) {
    return 1;
  }
  if (!b) {
    return -1;
  }
  return asc
    ? a.localeCompare(b, 'en', {
        sensitivity: 'accent',
      })
    : b.localeCompare(a, 'en', { sensitivity: 'accent' });
};

export const sortRowsByNumber = (
  rows: string[][],
  index: number,
  asc: boolean,
): string[][] => {
  return [...rows].sort((a, b) =>
    compareNumberStrings(a[index], b[index], asc),
  );
};

export const sortMovesByNumber = (
  moves: Move[],
  toString: (move: Move) => string,
  asc: boolean,
): Move[] => {
  return [...moves].sort((a, b) =>
    compareNumberStrings(toString(a), toString(b), asc),
  );
};

export const getSortSettings = (
  searchParams: URLSearchParams,
): SortSettings | undefined => {
  const orderByParamValue = searchParams.get(orderByKey) || '';
  if (!orderByParamValue) {
    return undefined;
  }
  const [orderByColumnName, orderDirectionName] = orderByParamValue.split('_');

  return {
    sortByKey: orderByColumnName as SortByKey,
    sortDirection: orderDirectionName === 'asc' ? 'asc' : 'desc',
  };
};

export const getSortByQueryParamValue = (
  sortSettings: SortSettings,
): string => {
  return (
    sortSettings.sortByKey +
    (sortSettings.sortDirection === 'asc' ? '_asc' : '')
  );
};
