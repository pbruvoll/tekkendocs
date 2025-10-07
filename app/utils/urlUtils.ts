export const getSearchParamString = <T extends string>(
  searchParams: URLSearchParams,
  key: string,
): T | undefined => {
  return (searchParams.get(key) || undefined) as T | undefined
}

export const getSearchParamNumber = (
  searchParams: URLSearchParams,
  key: string,
): number | undefined => {
  const valueStr = searchParams.get(key)
  if (!valueStr) return undefined
  const value = parseInt(valueStr, 10)
  return Number.isNaN(value) ? undefined : value
}

export const getSearchParamBoolean = (
  searchParams: URLSearchParams,
  key: string,
): boolean | undefined => {
  const valueStr = searchParams.get(key)
  if (valueStr === null) return undefined
  return true
}

export const getSearchParamStringList = <T extends string>(
  searchParams: URLSearchParams,
  key: string,
): T[] | undefined => {
  const list = searchParams.getAll(key)
  return list.length ? (list as T[]) : undefined
}
