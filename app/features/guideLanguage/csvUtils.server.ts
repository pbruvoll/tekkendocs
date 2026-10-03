/** The guide csv files are written by scripts/downloadGuides.py, which uses ";" */
const DELIMITER = ';';
const QUOTE = '"';

/**Parses csv content into rows of cells, the same shape google sheets returns.
 * Quoted cells may contain the delimiter, newlines and "" escaped quotes.
 * @example 'a;b\n"c;d";e' => [['a', 'b'], ['c;d', 'e']]
 */
export const parseCsv = (content: string): string[][] => {
  const rows: string[][] = [];
  let cells: string[] = [];
  let cell = '';
  let isQuoted = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];

    if (isQuoted) {
      if (char !== QUOTE) {
        cell += char;
      } else if (content[i + 1] === QUOTE) {
        cell += QUOTE;
        i++;
      } else {
        isQuoted = false;
      }
      continue;
    }

    switch (char) {
      case QUOTE:
        isQuoted = true;
        break;
      case DELIMITER:
        cells.push(cell);
        cell = '';
        break;
      case '\n':
        cells.push(cell);
        rows.push(cells);
        cells = [];
        cell = '';
        break;
      case '\r':
        break;
      default:
        cell += char;
    }
  }

  // a trailing newline would otherwise add an empty row
  if (cell || cells.length) {
    cells.push(cell);
    rows.push(cells);
  }

  return rows;
};
