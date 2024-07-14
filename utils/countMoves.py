import argparse
import os
import csv
import json

csvSep = ";"

    
#input is a folder for a character which may contain multiple csv files (special moves, throws etc).
def countMoves(path):
    print("Counting " + path)
    moveCount = 0
    filePaths = []
    for frameFile in os.listdir(path) :
        filePaths.append(os.path.join(path, frameFile));
        
    #e.g filePaths = ["c:\anna\anna-throws.csv", "c:\anna\anna-special.csv"]
    
    moveTypeToContent = {};
        
    for filePath in filePaths:
        f = open(filePath, "r", newline="")
        csvContent = csv.reader(f, delimiter=csvSep)
        csvContent
        csvRows = []
        for row in csvContent:
            moveCount += 1

    
    characterName = os.path.basename(path).lower();

    return {'name': characterName, 'value': moveCount}
    
    
#inputDir is expected to contain one folder per character with multiple files (one for special moves, one for throws etc)
# initiate the parser
parser = argparse.ArgumentParser(description = 'This is a program to count then number of moves for each character in the custom csv format.')
parser.add_argument("-I", "--inputDir", required=True, help="Directory to look for files to count")
parser.add_argument("-G", "--gameId", required=True, help="Identifier for the game, e.g TFR3 for tekken 7 fated retribution season 3")
parser.add_argument("-O", "--outputDir", required=True, help="Directory to store converted files")
args = parser.parse_args()

inputDir = args.inputDir # e.g. "C:/projects/rbnTekkenFrameData/frameData/T7/csv"
outputDir = args.outputDir


# not currently in use. Can be used when we support both T7 and T8
gameId = args.gameId

chars = []

for folder in os.listdir(inputDir) :

    folderPath = os.path.join(inputDir, folder) # folderPath will be folder of one char, e.g. "c:\Anna"
    if(os.path.isdir(folderPath) and not "test" in folder):
      chars.append(countMoves(folderPath))

print(chars)


    
f = open(outputDir, "w", newline="", encoding='utf-8')
json.dump(chars, f)
f.close()


