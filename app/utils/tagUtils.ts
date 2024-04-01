export const tagStringToRecord = (
  tagString: string,
): Record<string, string> => {
  const tagValues = tagString.split(',')
  const tagValuePairs = tagValues.map(t => {
    const splitted = t.split(/(?<=[A-Za-z])(?=\d)/).map(s => s.trim()) // "pc8-11" => ["pc", "8-11"] and "pc" => ["pc", ""]
    splitted[1] = splitted[1] || ''
    return splitted
  })
  return Object.fromEntries(tagValuePairs)
}
