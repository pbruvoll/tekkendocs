# this script will read the csv files in the given folder and upload them to the specified google sheet

import gspread
import argparse
import os
import csv

csvSep = ";"

def convert(path, gSheet):
    print("Converting " + path)

    f = open(path, "r", newline="", encoding='utf-8')
    csvContent = csv.reader(f, delimiter=csvSep)
    
    csvRows = []
    for row in csvContent:
        csvRows.append(row);
    
    worksheetName = path.split(os.sep)[-1].split(".")[0].lower() 
        
    

    # remove old worksheet if it does exists
    try : 
      ws = gSheet.worksheet(worksheetName);
      gSheet.del_worksheet(ws);
    except :
      pass; 

    ws = gSheet.add_worksheet(title=worksheetName, rows=1, cols=1)
    ws.append_rows(csvRows);
    
    
#inputDir is expected to contain one file per character with a csv file
# initiate the parser
parser = argparse.ArgumentParser(description = 'This is a program to convert frames in custom csv format to html.')
parser.add_argument("-I", "--inputDir", required=True, help="Directory to look for files to convert")
args = parser.parse_args()

inputDir = args.inputDir # e.g. "C:\documents\tekkendocs\kye-converted"

gc = gspread.oauth()
gSheet = gc.open_by_url('https://docs.google.com/spreadsheets/d/1qmfAaoXC6P1lABbq5nHTrdKQYD0l_9A5RaXnXWd2Das')


charNum = 0
charNumOffset = 0 # used to start from a offset if last upload did not complete
for filePath in os.listdir(inputDir) :
    print(filePath)
    charNum = charNum +1
    if charNum < charNumOffset :
        continue

    fullFilePath = os.path.join(inputDir, filePath)
    if(os.path.isfile(fullFilePath)):
      convert(fullFilePath, gSheet)

