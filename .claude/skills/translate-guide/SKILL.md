---
name: translate-guide
description: Translate a tekkendocs English character guide CSV into another language (Korean, Japanese, Spanish, Urdu, or a new one), producing data/guides/<char>/<char>-guide-<lang>.csv with every structural and notation cell preserved byte-for-byte. Use when the user wants a character guide translated, or wants an existing translated guide CSV checked or extended.
---

<what-to-do>

Translate `data/guides/<char>/<char>-guide.csv` into `data/guides/<char>/<char>-guide-<lang>.csv`.

1. Read the **entire** source CSV first. Later sections reuse terminology from earlier ones.
2. Read the language's glossary in [glossaries/](./glossaries/) (`ko.md`, `ja.md`, `es.md`, `ur.md`).
   Use its terms. It is the accumulated result of previous runs. For a new language, create
   `glossaries/<lang>.md` following the same shape.
3. List the cells to translate: `python .claude/skills/translate-guide/scripts/guide_csv.py cells <char>`.
   Only those cells are prose. Everything else is structural and is copied verbatim by the script.
4. Write the translations as a Python file in the scratchpad: `T = {(record, column): '''text''', ...}`.
   Use `'''` strings so the `"…"` quoted commands need no escaping.
5. When a term is not in the glossary, **research it**: search Tekken sites written in that language
   (see the glossary's sources) for the word players actually use, rather than inventing a
   translation. **Append the new term to the glossary** with where it came from, so the next run
   inherits it.
6. Build and self-check: `python .claude/skills/translate-guide/scripts/guide_csv.py build <char> <lang> <file.py>`.
   Fix every error it reports and rerun until it exits cleanly.
7. Run the parser smoke test below, then report.

If the language is new to the site, also add it to `guideLanguages` in
`app/features/guideLanguage/guideLanguage.ts`, and translate the page's static texts (meta title and
description, section headings, labels, the machine-translation disclaimer) in a new
`app/features/guideLanguage/texts/<lang>.ts`, registered in `guideTexts` in `texts/guideTexts.ts`
(the `Record` type forces this). Use the same glossary terms as the csv. A right-to-left language
also goes in `rtlGuideLanguages` in `guideLanguage.ts`.

</what-to-do>

<supporting-info>

## The format contract

`app/utils/sheetUtils.server.ts` → `sheetToSections` and `app/features/guides/guideUtils.server.ts`
→ `tablesToGuideData` parse **purely positionally**. The following are structural, not prose:

| Element | Rule | Why |
| --- | --- | --- |
| `#section_marker` rows | never translate | `sheetToSections` keys off `row[0]?.startsWith('#')`; the ids are the `TableId` union in `app/types/TableId.ts` |
| Header row after each marker (`Command;Description`) | keep English | dropped by the parser, but keeping it English keeps diffs against the source readable |
| Text inside `"…"` within a description | verbatim | `app/components/TextWithCommand.tsx` splits on `/(".*?")/` and turns each quoted chunk into a frame-data link via `Command.tsx`. Changing these breaks the links |
| Command / Startup / Combo / Starter / Trap columns | verbatim | e.g. `i14`, `df+1`, `df+1 > 4,4 > fc df+1,4 > SNK 2 T!` |
| ` \| ` separator in a command cell | verbatim, keep the surrounding spaces | `command.split(' \| ')` in `Commands.tsx`, `KeyMoves.tsx`, `Combos.tsx`, `MoveSummary.tsx` |
| `#combos_ender` col A | `wall_break` / `floor_break` / `carry` | cast to `ComboEnderType` |
| `#combos_wall` col A | `normal` / `tornado` | cast to `WallComboType` |
| `#stances` col A | `stance` / `command` | cast to a literal union |
| `#credits` col C | `author` | compared to `'author'` in `guideUtils.server.ts` |
| `#credits` col A/B | name + URL verbatim | a real person's handle |
| `#about` col A | `GameVersion` / `LastUpdated` | keys read in `app/constants/guideAbout.ts` |
| `#resources_external` col A | URL verbatim | col B (the title) *is* translated |
| Stance abbreviations `SNK`, `PGN`, `FC`, `WS`, `WR`, `T!` | verbatim | notation |
| CSV mechanics | `;` delimiter, `"` escaped as `""`, UTF-8, no BOM, CRLF | matches `CSV_SEP` and Python's `csv.writer` in `scripts/downloadGuides.py` |

`PROSE_COLUMNS` in `scripts/guide_csv.py` encodes which section columns are prose. Re-verify it
against the parsers when they change, since they are the source of truth.

**What is translated**: the guide title row; the body text of `#introduction`, `#strengths`,
`#weaknesses`, `#heat_system`, `#gameplan`, `#about_author`; the `Description` column of
`#key_moves`, `#panic_moves`, `#punishers_*`, `#knowledge_checks`, `#defense_moves`, `#matchups_*`,
`#installments`; `Title` + `Description` of `#defense_tips`; `Description` of `#stances`; the `Name`
column of `#resources_external`.

## Move names

**Keep notation only.** Players in most languages use move nicknames, but quoted commands are
parsed into frame-data links, so they must stay verbatim. Do not replace `"1,2,1"` with a nickname.
Quoted English words like `"electric"` or `"Knowledge check"` are also links/bold text: keep them.
Unquoted notation in prose (e.g. `F+3, 1+2`) is plain text; keep it verbatim too.

## Row shape quirks

Some rows genuinely have fewer columns than their section's header (e.g. Dragunov's
`#punishers_standing` rows `i12;4,1`). The script keeps them as-is. A leading space inside a quoted
command (Dragunov has `"" WS+3""`) is part of the cell; the multiset check catches it if lost.
The script also keeps each cell's leading/trailing whitespace from the source.

## Right-to-left languages

The guide container gets `dir="rtl"`, and `ContentContainer` gives every descendant
`unicode-bidi: plaintext`, so each paragraph and inline element takes the direction of its own text.
Notation (`df+1,4`, `SNK 2 T!`) therefore stays left-to-right. Two things to do in the text itself:

- Write signed frame numbers as words (Urdu: `مائنس 13`, `پلس 8`). In RTL text the bidi algorithm
  displays `-13` as `13-`. Notation columns are untouched.
- Prefer transliterating loanwords into the script over Latin words, so prose is not broken up by
  left-to-right runs. Keep Latin only for notation and abbreviations like `SNK`, `KND`, `i10`.

Check the result in a browser (`?lang=<lang>&preview=true`), especially the punishers and stances.

## Self-check

The `build` command checks: every prose cell translated and nothing else changed; same row count
and per-row column count; section markers identical; quoted commands identical as a **multiset**
per cell (word order may legitimately move a command within a sentence, so eyeball reordered ones).

**Parser smoke test**: put a temporary test in `app/` (vitest only picks up `app/**`) that reads the
CSV with `parseCsv` (`app/features/guideLanguage/csvUtils.server.ts`), runs `sheetToSections` and
`tablesToGuideData`, and asserts `console.warn` is not called (`No handler for table` warnings).
Delete it afterwards.

## Scope

The site serves translations from the CDN: `getGuideSource` in
`app/features/guideLanguage/guideSource.server.ts` fetches
`<cdn>/t8/guides/<char>/<char>-guide-<lang>.csv` and falls back to the English Google Sheet. The
user uploads the CSV to the CDN themselves; do not upload it. Until it is uploaded, `?lang=<lang>`
shows English. To preview locally, temporarily read the local file in `getGuideSource` and revert.

</supporting-info>
