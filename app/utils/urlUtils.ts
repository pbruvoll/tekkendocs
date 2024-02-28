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
  const value = Number(valueStr)
  return isNaN(value) ? undefined : value
}