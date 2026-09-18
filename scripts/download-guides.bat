@echo off
rem Downloads every <character-id>-guide sheet from the T8 spreadsheet to data/guides
python "%~dp0downloadGuides.py"
pause
