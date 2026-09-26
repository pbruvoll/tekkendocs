---
name: translate-guide-korean
description: Translate a tekkendocs English character guide CSV into Korean, producing data/guides/<char>/<char>-guide-ko.csv with every structural and notation cell preserved byte-for-byte. Use when the user wants a character guide translated to Korean, or wants an existing Korean guide CSV checked or extended.
---

<what-to-do>

Translate `data/guides/<char>/<char>-guide.csv` into `data/guides/<char>/<char>-guide-ko.csv`.

1. Read the **entire** source CSV first. Do not translate section by section without having seen the
   whole file — later sections reuse terminology established earlier.
2. Read [GLOSSARY.md](./GLOSSARY.md). Use its terms. It is the accumulated result of previous runs.
3. Walk the source top to bottom and translate **only prose**. Everything in the contract table below
   is structural and must be copied verbatim. When in doubt, copy verbatim.
4. When a term is not in `GLOSSARY.md`, search a Korean Tekken source (철권 교실, 나무위키,
   철권8 마이너 갤러리, the official Korean 철권 8 site) rather than inventing a translation.
   **Append the new term to `GLOSSARY.md`** with its source, so the next run inherits it.
5. Never reorder, add, or drop rows. Preserve blank padding rows so the two files diff cleanly
   side by side.
6. Run the self-check below before reporting done.

Generate the output with a script rather than by hand-writing the CSV. Copy every cell from the
English file verbatim and override only the cells being translated — that way row count, column
count, notation columns and enum columns cannot drift. A throwaway script in the scratchpad is fine.

</what-to-do>

<supporting-info>

## The format contract

`app/utils/sheetUtils.server.ts` → `sheetToSections` and `app/features/guides/guideUtils.server.ts`
→ `tablesToGuideData` parse **purely positionally**. The following are structural, not prose:

| Element | Rule | Why |
| --- | --- | --- |
| `#section_marker` rows | never translate | `sheetToSections` keys off `row[0]?.startsWith('#')`; the ids are the `TableId` union in `app/types/TableId.ts` |
| Header row after each marker (`Command;Description`) | keep English | dropped by `rows.slice(1)`, but keeping it English keeps diffs against the source readable |
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
| CSV mechanics | `;` delimiter, `"` escaped as `""`, UTF-8, no BOM | matches `CSV_SEP` in `scripts/downloadGuides.py` |

These pointers are deliberate: re-verify the rules against those files rather than trusting this
table, since the parsers can change.

**What is translated**: the body text of `#introduction`, `#strengths`, `#weaknesses`,
`#heat_system`; the `Description` column of `#key_moves`, `#panic_moves`, `#punishers_*`,
`#knowledge_checks`, `#defense_moves`; `Title` + `Description` of `#defense_tips`; the `Name`
column of `#resources_external`; and the guide title row (e.g. `Dragunov Guide` → `드라구노프 공략`).
`#about_author` is often empty — leave it empty.

## Move names

**Keep notation only.** Korean players mostly use move nicknames (원투원, 어썰트, 토스업,
데들리 스콜피온), but quoted commands are parsed into frame-data links, so they must stay verbatim.
Do not replace `"1,2,1"` with a nickname, and do not add the nickname alongside it.

## Row shape quirks

Some rows genuinely have fewer columns than their section's header — e.g. Dragunov's
`#punishers_standing` rows `i12;4,1` and `i15;df+2` have only 2 columns. Keep them at 2 columns;
do not pad them. And a leading space inside a quoted command (Dragunov line 6 has `"" WS+3""`) is
part of the cell — preserve it exactly.

## Self-check before reporting done

1. **Row/section parity** — same number of `#` markers, in the same order; same row count per section.
2. **Column parity** — per row, the same field count as the corresponding English row.
3. **Quoted commands preserved** — extract every `"…"` from both files using the same regex
   `TextWithCommand.tsx` uses (`/(".*?")/`). Compare them as **multisets**, not ordered lists: Korean
   clause order legitimately moves commands within a sentence (a causal clause fronts, so
   `… threaten "1,2,1" … because of "Df+1,(4)"` becomes `"Df+1,(4)" 이기 때문에 … "1,2,1"`). The
   multiset must match exactly; per-cell order differences are fine, but eyeball each one to confirm
   it is a word-order change and not a dropped or substituted command.
4. **Enum/structural columns identical** — col A of `#combos_ender`, `#combos_wall`, `#stances`,
   `#about`; col C of `#credits`; col A of `#resources_external`; all Command/Startup/Combo columns.
5. **CSV well-formed** — parses with the `;` delimiter and yields the same shape
   `scripts/downloadGuides.py` writes.
6. **No untranslated prose left** — scan description cells for runs of ASCII words that are not notation.
7. **Parser smoke test** — run the Korean file through `sheetToSections` + `tablesToGuideData` in a
   scratch script and confirm every section id resolves with no `No handler for table` warning.

## Scope

The output is a **local mirror only**. The site renders guides live from Google Sheets via
`getSheet(`${character}-guide`, 'T8')` in `app/routes/_mainLayout.t8_.$character.guide.tsx`; the CSVs under
`data/guides/` are a one-way download produced by `scripts/downloadGuides.py`. A Korean CSV will not
appear on the site without new plumbing — there is no i18n in the repo at all (`<html lang="en">` is
hardcoded in `app/root.tsx`, and the section headings in `app/features/guides/GuideNav.tsx` are
hardcoded English). Do not add locale routing or upload to Sheets unless asked.

</supporting-info>
