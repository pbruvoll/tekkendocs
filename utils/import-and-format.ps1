Set-Location "$PSScriptRoot\wavu-importer"
python src/main.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "Python script failed with exit code $LASTEXITCODE" -ForegroundColor Red
    Read-Host "Press Enter to close"
    exit $LASTEXITCODE
}
Set-Location "$PSScriptRoot\.."
python utils\wavuJsonToCsv.py -I utils\wavu-importer\src\json_movelist -O data\wavuConvertedCsv
if ($LASTEXITCODE -ne 0) {
    Write-Host "Convert script failed with exit code $LASTEXITCODE" -ForegroundColor Red
    Read-Host "Press Enter to close"
    exit $LASTEXITCODE
}
yarn format
Read-Host "Press Enter to close"
