Set-Location "$PSScriptRoot\.."
python utils\uploadCsv.py -I data\wavuConvertedCsv -G T8
if ($LASTEXITCODE -ne 0) {
    Write-Host "Upload failed with exit code $LASTEXITCODE" -ForegroundColor Red
    Read-Host "Press Enter to close"
    exit $LASTEXITCODE
}
Read-Host "Press Enter to close"
