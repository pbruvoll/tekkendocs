import { expect, test } from 'vitest';
import { getSortByQueryParamValue, getSortSettings } from './sortingUtils';
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
