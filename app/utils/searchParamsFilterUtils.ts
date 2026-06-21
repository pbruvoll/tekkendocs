import { type NavigateOptions } from 'react-router';
import { type SearchParamsChanges } from '~/types/SearchParamsChanges';

type SetSearchParams = (
  fn: (prev: URLSearchParams) => URLSearchParams,
  opts?: NavigateOptions,
) => void;

const noScrollReset: NavigateOptions = { preventScrollReset: true };

export const setFilterValue = (
  setSearchParams: SetSearchParams,
  key: string,
  value: string,
) => {
  setSearchParams((prev) => {
    const newSearchParams = new URLSearchParams(prev);
    newSearchParams.set(key, value);
    return newSearchParams;
  }, noScrollReset);
};

export const removeFilterValue = (
  setSearchParams: SetSearchParams,
  key: string,
) => {
  setSearchParams((prev) => {
    prev.delete(key);
    return prev;
  }, noScrollReset);
};

export const updateFilterValues = (
  setSearchParams: SetSearchParams,
  changes: SearchParamsChanges,
) => {
  setSearchParams((prev) => {
    const newSearchParams = new URLSearchParams(prev);
    changes.set.forEach(({ key, value }) => {
      newSearchParams.set(key, value);
    });
    changes.remove.forEach((key) => {
      newSearchParams.delete(key);
    });
    return newSearchParams;
  }, noScrollReset);
};

export const addFilterElement = (
  setSearchParams: SetSearchParams,
  key: string,
  element: string,
) => {
  setSearchParams((prev) => {
    prev.append(key, element);
    return prev;
  }, noScrollReset);
};

export const removeFilterElement = (
  setSearchParams: SetSearchParams,
  key: string,
  element: string,
) => {
  setSearchParams((prev) => {
    prev.delete(key, element);
    return prev;
  }, noScrollReset);
};
