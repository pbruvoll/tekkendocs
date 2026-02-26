# How to use the different utilities in this folder

## How to use the downloadCsv and uploadCSV which interacts with the spreadheet.

They use the gspread lib which is documented here : https://docs.gspread.org/en/latest/index.html
You need to generate a credentials.json file which you place in C:\Users\<userName>\AppData\Roaming\gspread
This is done from google cloud at https://console.cloud.google.com/apis/credentials?supportedpurview=project
Select the project and select "+ Create Credential".
Select OAuth Client ID
Select Application type = Desktop App
After it is created, download the json file, rename it to credential.json and place in the folder C:\Users\<userName>\AppData\Roaming\gspread

If you at some point get error that it was not able to authenticate, remove the file authorized_user.json in the same folder as it might have expired

## How to download data from tekkendocs.com to local csv

C:\projects\tekkendocs>python utils\downloadCsv.py -O ..\rbnTekkenFrameData\frameData\T8\csv

## Generate html pages for rbnorway.org

Run C:\projects\rbnorway-frame-data\converters\runCsvToHtml.bat

## How to get data from wavu.wiki to tekkendocs.com

### How to download frame data from wavu.wiki

Wavu.wiki is a site with frame data for tekken, and it seems they are actively adding data for Tekken 8.
In the folder utils/wavu-importer, there is a python script to download the frame data
To download the data, run the command

```
tekkendocs\utils\wavu-importer>python src/main.py
```

this will download the data as json to tekkendocs\utils\wavu-importer\src\json_movelist

### How to convert the frame data from wavu.wiki

To convert the json files to csv files on tekkendocs format, run the following command

```
tekkendocs>python utils\wavuJsonToCsv.py -I utils\wavu-importer\src\json_movelist -O data\wavuConvertedCsv
```

This will store the data as csv in the folder tekkendocs\data\wavuConverterCsv

### How to upload the data to tekkendocs

Now the data can be uploaded to the spread sheet in the normal way. Run the command

```
tekkendocs>python utils\uploadCsv.py -I data\wavuConvertedCsv -G T8
```

### How to count number of moves per character

```
tekkendocs>python utils\countMoves.py -I data\wavuConvertedCsv -G T8 -O app\data\character-move-count.json
```

## How to convert videos recursively to a target resolution

The script below scans the input folder recursively, mirrors folder structure into the output folder, and converts common video files.

```
tekkendocs>python utils\convertVideoResolution.py -I <inputFolder> -O <outputFolder> --width 480
```

- If only `--width` is specified, aspect ratio is preserved.
- If both `--width` and `--height` are specified, exact dimensions are forced.
- Default filename postfix is `-<width>` (example: `myVideo.mp4` -> `myVideo-480.mp4`).

### Optional output format

If `--format` is omitted, source format is preserved.

```
tekkendocs>python utils\convertVideoResolution.py -I C:\documents\tekkendocs\t8\videos\alisa -O C:\documents\tekkendocs\t8\videos\alisa-converted --width 480
```

Force output format:

```
tekkendocs>python utils\convertVideoResolution.py -I C:\documents\tekkendocs\t8\videos\alisa -O C:\documents\tekkendocs\t8\videos\alisa-converted --width 480 --format mp4
```

### GIF output with frame rate

For GIF conversion, you can specify FPS:

```
tekkendocs>python utils\convertVideoResolution.py -I C:\documents\tekkendocs\t8\videos\alisa -O C:\documents\tekkendocs\t8\videos\alisa-converted --width 480 --format gif --fps 15
```

`--fps` is only valid when `--format gif` is used.

### Overwrite existing output files

By default, existing output files are skipped. To overwrite them:

```
tekkendocs>python utils\convertVideoResolution.py -I <inputFolder> -O <outputFolder> --width 480 --overwrite
```
