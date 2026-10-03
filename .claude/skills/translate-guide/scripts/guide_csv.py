"""Helpers for translating a tekkendocs guide csv.

  python guide_csv.py cells <char>
      Prints every prose cell of data/guides/<char>/<char>-guide.csv as `(record, column)`
      followed by the english text. These are the only cells to translate.

  python guide_csv.py build <char> <lang> <translations.py>
      <translations.py> defines T = {(record, column): 'translated text', ...} covering every
      prose cell. Writes data/guides/<char>/<char>-guide-<lang>.csv (all other cells copied
      verbatim) and runs the self-checks. Exits non-zero when a check fails.

Records are 1-based csv records (a quoted cell can span several lines, so they are not
line numbers). Use ''' strings in the translations file so quoted commands need no escaping.
"""
import collections
import csv
import io
import pathlib
import re
import runpy
import sys

GUIDES = pathlib.Path(__file__).resolve().parents[4] / 'data' / 'guides'
SEP = ';'  # CSV_SEP in scripts/downloadGuides.py

# section id -> columns holding prose. Everything else is structural, see SKILL.md
PROSE_COLUMNS = {
    'introduction': [0],
    'strengths': [0],
    'weaknesses': [0],
    'heat_system': [0],
    'gameplan': [0],
    'about_author': [0],
    'key_moves': [1],
    'panic_moves': [1],
    'punishers_whiff': [1],
    'knowledge_checks': [1],
    'defense_moves': [1],
    'matchups_good': [1],
    'matchups_bad': [1],
    'installments': [1],
    'resources_external': [1],
    'punishers_standing': [2],
    'punishers_crouching': [2],
    'stances': [2],
    'defense_tips': [0, 1],
}

QUOTED = re.compile(r'".*?"')  # same split as app/components/TextWithCommand.tsx
RTL_LANGUAGES = {'ur'}  # rtlGuideLanguages in app/features/guideLanguage/guideLanguage.ts
LINK_URL = re.compile(r'\]\(([^)]+)\)')  # [label](url) in app/components/TextWithLinks.tsx, labels may be translated


def load(path):
    raw = path.read_bytes().decode('utf-8')
    return list(csv.reader(io.StringIO(raw, newline=''), delimiter=SEP))


def dump(rows):
    buf = io.StringIO(newline='')
    csv.writer(buf, delimiter=SEP).writerows(rows)
    return buf.getvalue().encode('utf-8')


def starts_with_latin(text):
    """True when the first letter outside quoted commands and markdown links is latin.
    Each guide paragraph takes the direction of its first letter (unicode-bidi: plaintext)."""
    text = re.sub(r'\[[^\]]*\]\([^)]*\)', '', QUOTED.sub('', text))
    first = re.search(r'[^\W\d_]', text)
    return bool(first and first.group().isascii())


def prose_cells(rows):
    """(record, column) of every non-empty prose cell, in file order."""
    cells = []
    section = None
    header_pending = False
    for i, row in enumerate(rows):
        first = row[0] if row else ''
        if first.startswith('#'):
            section, header_pending = first[1:], True
            continue
        if section is None:  # the guide title above the first section, in any column
            cells.extend((i + 1, j) for j, cell in enumerate(row) if cell.strip())
            continue
        if not first:  # the parser drops rows with an empty first cell
            continue
        if header_pending:  # the header row after each marker stays english
            header_pending = False
            continue
        for col in PROSE_COLUMNS.get(section, []):
            if col < len(row) and row[col].strip():
                cells.append((i + 1, col))
    return cells


def cmd_cells(char):
    rows = load(GUIDES / char / f'{char}-guide.csv')
    for rec, col in prose_cells(rows):
        print(f'({rec}, {col})  {rows[rec - 1][col]!r}')


def cmd_build(char, lang, translations_path):
    en = load(GUIDES / char / f'{char}-guide.csv')
    T = runpy.run_path(translations_path)['T']
    expected = set(prose_cells(en))
    errors = []
    if missing := expected - set(T):
        errors.append(f'missing translations: {sorted(missing)}')
    if extra := set(T) - expected:
        errors.append(f'not prose cells: {sorted(extra)}')

    out = [list(r) for r in en]
    for (rec, col), text in T.items():
        if (rec, col) not in expected:
            continue
        src = en[rec - 1][col]
        # keep the source cell's surrounding whitespace, e.g. a trailing newline
        lead = src[: len(src) - len(src.lstrip())]
        trail = src[len(src.rstrip()):]
        cell = lead + text.strip() + trail
        out[rec - 1][col] = cell
        # multiset: word order may move a command within a sentence, but none may change
        a = collections.Counter(QUOTED.findall(src))
        b = collections.Counter(QUOTED.findall(cell))
        if a != b:
            errors.append(f'quoted commands differ in ({rec}, {col}): '
                          f'lost {dict(a - b)}, added {dict(b - a)}')
        if lang in RTL_LANGUAGES and starts_with_latin(cell):
            errors.append(f'({rec}, {col}) starts with a latin word, so the paragraph renders left-to-right: '
                          f'reword it to start with a word in the script, e.g. {cell[:30]!r}')
        if collections.Counter(LINK_URL.findall(src)) != collections.Counter(LINK_URL.findall(cell)):
            errors.append(f'markdown link urls differ in ({rec}, {col})')

    target = GUIDES / char / f'{char}-guide-{lang}.csv'
    target.write_bytes(dump(out))

    written = load(target)
    if len(written) != len(en):
        errors.append('row count differs')
    for i, (a, b) in enumerate(zip(en, written)):
        if len(a) != len(b):
            errors.append(f'column count differs on record {i + 1}')
        for j, (x, y) in enumerate(zip(a, b)):
            if x != y and (i + 1, j) not in expected:
                errors.append(f'structural cell changed ({i + 1}, {j})')

    for e in errors:
        print('ERROR', e)
    print(f'{target.name}: {len(expected)} prose cells, {len(errors)} errors')
    sys.exit(1 if errors else 0)


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    match sys.argv[1:]:
        case ['cells', char]:
            cmd_cells(char)
        case ['build', char, lang, path]:
            cmd_build(char, lang, path)
        case _:
            print(__doc__)
            sys.exit(2)
