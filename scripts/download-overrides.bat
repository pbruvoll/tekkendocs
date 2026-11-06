@echo off
rem Downloads every <character-id>-override sheet from the T8 spreadsheet to data/t8/overrides
python "%~dp0downloadOverrides.py"
pause
