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
  const value = parseInt(valueStr)
  return isNaN(value) ? undefined : value
}

export const getSearchParamBoolean = (
  searchParams: URLSearchParams,
  key: string,
): boolean | undefined => {
  const valueStr = searchParams.get(key)
  if (valueStr == undefined) return undefined
  return true;
}

