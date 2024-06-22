# include standard modules
import argparse
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
    {"wavuId": "tags", "displayName": "Tags"},
    {"wavuId": "id", "displayName": "Wavu id"},
    {"wavuId": "name", "displayName": "Name"},
    {"wavuId": "recovery", "displayName": "Recovery"},
    {"wavuId": "image", "displayName": "Image"},
    {"wavuId": "video", "displayName": "Video"},
]

def correctMove(move, charName) : 
    match charName :
        case "nina":
            move["input"] = move["input"].replace("SWA.b", "qcb").replace("CD.", "qcf+")


    move["input"] = move["input"].replace("SWA.", "qcb+")
    
#input is a folder for a character which may contain multiple csv files (special moves, throws etc).
#one json file will be generated for each chracter conntaining move type as key
def convert(filePath, outDir):
    fileName = os.path.basename(filePath)
    charName = fileName.split(".")[0]
    print("Converting data for " + charName)

    #make a folder per char to output in same format as for tekken 7
    charOutDir = os.path.join(outDir, charName);

    os.makedirs(charOutDir, exist_ok = True)
    

        
    f = open(filePath, "r")
    jsonData = json.load(f)
    f.close()
    csvContent = [list(map(lambda x: x["displayName"], columns))];
    for move in jsonData : 
        correctMove(move, charName)
        csvContent.append(list(map(lambda x: move.get(x["wavuId"], ""), columns)));
    
    outputFilePath = os.path.join(charOutDir, charName + "-special.csv")
    outputFile = open(outputFilePath, "w", newline="", encoding='utf-8')
    csvWriter = csv.writer(outputFile, delimiter=csvSep, lineterminator=os.linesep)
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
    
        


