export const tagStringToRecord = (
  tagString: string,
): Record<string, string> => {
  const tagValues = tagString.split(' ');
  const tagValuePairs = tagValues.map((t) => {
    if (t.includes(':')) {
      const idx = t.indexOf(':');
      return [t.slice(0, idx), t.slice(idx + 1)]; // "stp:SSR" => ["stp", "SSR"]
    }
    const splitted = t.split(/(?<=[A-Za-z])(?=\d)/).map((s) => s.trim()); // "pc8-11" => ["pc", "8-11"] and "pc" => ["pc", ""]
    splitted[0] = splitted[0].replace('~', '').replace('?', ''); // to fix cases where tag = "pc?~"
    splitted[1] = splitted[1] || '';
    return splitted;
  });
  return Object.fromEntries(tagValuePairs);
};
