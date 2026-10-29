import { expect, test } from 'vitest';
import {
  getNextSortSearchParams,
  getSortByQueryParamValue,
  getSortSettings,
} from './sortingUtils';

test('getSearchSettings', () => {
  expect(getSortSettings(new URLSearchParams('foo=bar'))).toBeUndefined();
  expect(getSortSettings(new URLSearchParams('orderby=block'))).toMatchObject({
    sortDirection: 'desc',
    sortByKey: 'block',
  });
  expect(
    getSortSettings(new URLSearchParams('orderby=block_asc')),
  ).toMatchObject({
    sortDirection: 'asc',
    sortByKey: 'block',
  });
});

test('getSortByQueryParamValue', () => {
  expect(
    getSortByQueryParamValue({ sortByKey: 'block', sortDirection: 'asc' }),
  ).toBe('block_asc');
  expect(
    getSortByQueryParamValue({ sortByKey: 'block', sortDirection: 'desc' }),
  ).toBe('block');
});

test('getNextSortSearchParams', () => {
  const next = (search: string) =>
    getNextSortSearchParams(new URLSearchParams(search), 'block').toString();
  expect(next('viewMode=table')).toBe('viewMode=table&orderby=block_asc');
  expect(next('orderby=hit_asc')).toBe('orderby=block_asc');
  expect(next('orderby=block_asc')).toBe('orderby=block_desc');
  expect(next('orderby=block_desc')).toBe('');
});
