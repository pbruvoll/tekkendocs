# include standard modules
import argparse
from difflib import get_close_matches
import os
import json
import csv
csvSep = ";"

columns = [
    {"wavuId": "input", "displayName": "Command"},
    {"wavuId": "target", "displayName": "Hit level"},
    {"wavuId": "damage", "displayName": "Damage"},
    {"wavuId": "startup", "displayName": "Start up frame"},
    {"wavuId": "on_block", "displayName": "Block frame"},
    {"wavuId": "on_hit", "displayName": "Hit frame"},
    {"wavuId": "on_ch", "displayName": "Counter hit frame"},
    {"wavuId": "notes", "displayName": "Notes"},
]
    
#input is a folder for a character which may contain multiple csv files (special moves, throws etc).
#one json file will be generated for each chracter conntaining move type as key
def convert(filePath, outDir):
    fileName = os.path.basename(filePath)
    charName = fileName.split(".")[0]
    print("Converting data for " + charName)
    

        
    f = open(filePath, "r")
    jsonData = json.load(f)
    f.close()
    csvContent = [list(map(lambda x: x["displayName"], columns))];
    for move in jsonData : 
        csvContent.append(list(map(lambda x: move[x["wavuId"]], columns)));
    
    outputFilePath = os.path.join(outDir, charName + ".csv")
    outputFile = open(outputFilePath, "w", newline="")
    csvWriter = csv.writer(outputFile, delimiter=csvSep)
    csvWriter.writerows(csvContent);
    
#inputDir is expected to contain one folder per character with multiple files (one for special moves, one for throws etc)
# initiate the parser
parser = argparse.ArgumentParser(description = 'This is a program to convert frames in json to  custom csv format')
parser.add_argument("-I", "--inputDir", required=True, help="Directory to look for files to convert")
parser.add_argument("-O", "--outputDir", required=True, help="Directory to store converted files")
args = parser.parse_args()

inputDir = args.inputDir
outputDir = args.outputDir

os.makedirs(outputDir, exist_ok = True)

for csvFile in os.listdir(inputDir) :
    filePath = os.path.join(inputDir, csvFile)
    print("converting ", filePath)
    convert(filePath, outputDir)
        


