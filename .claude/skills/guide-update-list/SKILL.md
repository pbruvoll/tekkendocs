---
name: guide-update-list
description: Make a short list for a guide's author of the parts of a character guide that game patches have made outdated. Pass one or more character ids.
disable-model-invocation: true
---

For each character id given, write an **update list**: a short list the guide's author can skim to see which parts of their guide need updating after the patches released since the guide was written. The author is an expert on the character and knows the game. The list only has to point them to the right places.

## Steps

1. Read the whole guide: `data/guides/<char>/<char>-guide.csv`. Note `GameVersion` in `#about`; that is the version the guide was written for.
2. Get the patch notes since that version:
   `PYTHONIOENCODING=utf-8 python .claude/skills/guide-update-list/scripts/wavu_patch_notes.py <char> --since <GameVersion>`.
   It prints the character's own changes and the Common (system) changes for every Tekken 8 patch on wavu.wiki newer than that version.
3. Match every change against the guide. A change goes on the list when the move appears anywhere in the guide (key moves, punishers, combos, frame traps, defense tips, the prose sections) **and** could make what the guide says there wrong. Patch notes and guides use slightly different notation (`WS 1,1` vs `ws1,1`, `SS 4` vs `SS.4`), so match moves loosely.
   - New moves always go on the list, as a suggestion for where they could fit (key moves, or a list of moves in `#installments` / `#heat_system`). Get the startup, block and hit frames from `data/wavuConvertedCsv/<char>/<char>-special.csv`.
   - Common changes go on the list when they name the character or change a mechanic the guide relies on (Heat, Heat Dash, the character's powered-up state, Rage Art).
   - Leave out changes to moves the guide never mentions. A buff that leaves the guide's text true is fine to leave out too.
   - When a patch note is vague ("changed the opponent's behavior on hit") and the guide has a combo from that move, list it as something to check.
4. Write the list. Done when every change from step 2 is either on the list or left out by the rules in step 3.

## The list

The user pastes the list to the author on X or Discord as is, so put exactly the author's part, and nothing else, in a ```` ```text ```` code block per character. Write it as plain text, since X shows markdown symbols literally: section names on their own line, items starting with `- `, no `**` or `#`. Keep each block under 2000 characters (Discord's message limit). If a list is longer, split it at a section boundary into several blocks and label them (1/2), (2/2).

It starts with a title line and a one-sentence intro saying these are suggestions, e.g.:

```text
Claudio guide: suggested updates for Season 3
These are the changes since the guide was written (version 2.03) that may affect it. Have a look and update whatever you agree with.

Key moves:
- b+3: b+3,n,3 is now -12 on block. The text says "only -10".
```

Group the items under the guide section where the author edits them, using readable section names (Key moves, Combos, Heat system…). Each item names the row (quote the command from the guide's first column) and says in one line what changed. Where the guide states a number that's now wrong, quote it. Old → new frame numbers are enough; skip explanations an expert doesn't need.

After the code block, tell the user (not the author):
- the wavu patch pages used, linked,
- the changes left out and why, in one line,
- what else to update: `GameVersion` / `LastUpdated` in `#about`, and the character's `version` in `characterGuideAuthors` in `app/services/staticDataService.ts` if the season changed.

The frame data in `data/wavuConvertedCsv` covers specific frame numbers. Compare it with an older commit only to answer a specific question. Diffs between parser versions produce false "new" and "removed" moves (a typo on the wiki once dropped Claudio's d+1,2), so a frame data diff is not a source of changes.
