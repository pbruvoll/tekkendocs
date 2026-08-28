# Wavu-wikitext

Downloads the raw wikitext of the movelist pages on wavu.wiki, meaning the exact text which is shown
when a page is opened for editing, with the templates still in place (`{{MoveDataHeader}}`,
`{{Move|...}}`, `{{MoveInherit|...}}` and so on).

Note that this is something different from what `utils/wavu-importer` downloads. The importer asks
the cargo database for the values of each move and stores them as json. This script stores the page
source as it is written on the wiki.

The only requirement is `requests`, which is already installed if the wavu importer has been used.

## How to run it

Without arguments, the movelist of every character is downloaded. There is also
`utils\download-wavu-wikitext.bat`, which can be double clicked to do the same.

```
tekkendocs\utils\wavu-wikitext>python download_wikitext.py
```

One or more characters can be given to download only those.

```
tekkendocs\utils\wavu-wikitext>python download_wikitext.py "Anna"
tekkendocs\utils\wavu-wikitext>python download_wikitext.py "Anna" "Armor King" "Jack-8"
```

The characters are the ones in the character list of the wavu importer
(`utils\wavu-importer\src\resources\character_list.json`). `-` can be used instead of space, so
`armor king` and `armor-king` both work.

The files are written to `utils\wavu-wikitext\data`, one file per character (`Armor King`
becomes `armor-king.txt`).
