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



