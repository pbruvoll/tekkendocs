# How to use the downloadCsv and uploadCSV which interacts with the spreadheet.

They use the gspread lib which is documented here : https://docs.gspread.org/en/latest/index.html
You need to generate a credentials.json file which you place in C:\Users\<userName>\AppData\Roaming\gspread
This is done from google cloud at https://console.cloud.google.com/apis/credentials?supportedpurview=project
Select the project and select "+ Create Credential".
Select OAuth Client ID
Select Application type = Desktop App
After it is created, download the json file, rename it to credential.json and place in the folder C:\Users\<userName>\AppData\Roaming\gspread

If you at some point get error that it was not able to authenticate, remove the file authorized_user.json in the same folder as it might have expired
