@echo off
call "%~dp0import-and-format.bat"
if %errorlevel% neq 0 exit /b %errorlevel%

call "%~dp0upload.bat"
exit /b %errorlevel%
