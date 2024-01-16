export const sortRowsByString = (
  rows: string[][],
  index: number,
  asc: boolean,
): string[][] => {
  return [...rows].sort((a, b) => compareStrings(a[index], b[index], asc))
}

const compareNumberStrings = (a: string, b: string, asc: boolean) => {
  const aInt = parseInt(a?.startsWith('i') ? a.slice(1) : a)
  const bInt = parseInt(b?.startsWith('i') ? b.slice(1) : b)
  if (isNaN(aInt) && isNaN(bInt)) {
    return 0
  }
  if (isNaN(aInt)) {
    return 1
  }
  if (isNaN(bInt)) {
    return -1
  }
  return asc ? bInt - aInt : aInt - bInt
}

const compareStrings = (a: string, b: string, asc: boolean) => {
  if (!a && !b) {
    return 0
  }
  if (!a) {
    return 1
  }
  if (!b) {
    return -1
  }
  return asc
    ? a.localeCompare(b, 'en', {
        sensitivity: 'accent',
      })
    : b.localeCompare(b, 'en', { sensitivity: 'accent' })
}

export const sortRowsByNumber = (
  rows: string[][],
  index: number,
  asc: boolean,
): string[][] => {
  return [...rows].sort((a, b) => compareNumberStrings(a[index], b[index], asc))
}
