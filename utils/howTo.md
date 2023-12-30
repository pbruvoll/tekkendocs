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
