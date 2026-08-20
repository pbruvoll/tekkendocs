# Wavu-importer

This folder contains utility for downloading frame data from the wavu.wiki
The source code in this folder is heavly inspired by the source code of the discord bot which reads data from wavu wiki and is found here https://github.com/TLNBS2405/heihachi
Currently it is basically a subset of the code, just removing all the parts with discord.

## Getting started

First install all requirements for python by running
tekkendocs\utils\wavu-importer>pip install -r requirements.txt

Then you can run the export with

```
tekkendocs\utils\wavu-importer>python src\main.py
```

This will download frame data for the characters specified in tekkendocs\utils\wavu-importer\src\resources\character_list.json
and store one file for each character in tekkendocs\utils\wavu-importer\src\json_movelist

## What the json files contain

The importer only downloads the data and cleans up the html (removes tags, unescapes entities and
normalizes the values). It stores the fields with the names wavu uses, and it stores each move as
wavu has it, which means that a move only holds its own values plus a `parent` pointing at the move
it continues. As an example, the second hit of Leo 1,2 has the input ",2" and the parent "Leo-1".

Fields wavu has no value for are left out of the file, so a move only has the fields which are
actually set. Anything reading the files must handle missing fields.

Joining a move with its parent, deriving values which do not exist in wavu (such as tags) and
sorting the moves is done by tekkendocs\utils\wavuParsing.py, which is used by
tekkendocs\utils\wavuJsonToCsv.py when the json files are converted to csv.
