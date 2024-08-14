# this script extract videolinks from moves in the googel docs from kye at https://docs.google.com/document/d/1pmXilaPdgBIzCTYk3JEarm0VgxLMQx9MRuWi1WbNNeU/edit
# the script assumed the files have been downloaded as txt files

import argparse
import os
import csv
import json

csvSep = ";"

    
def convert(filePath, outDir):
    fileName = os.path.basename(filePath)
    charName = fileName.split(".")[0]
    print("Converting data for " + charName)
        
    f = open(filePath, "r", encoding='utf-8')
    textData = json.load(f)
    f.close()
    csvContent = [];

    
    outputFilePath = os.path.join(outDir, charName + ".csv")
    outputFile = open(outputFilePath, "w", newline="", encoding='utf-8')
    csvWriter = csv.writer(outputFile, delimiter=csvSep, lineterminator=os.linesep)
    csvWriter.writerows(csvContent);
    
    
    
#inputDir is expected to contain one folder per character with multiple files (one for special moves, one for throws etc)
# initiate the parser
parser = argparse.ArgumentParser(description = 'This is a parse videlinks from google sheet from twitter user kye.')
parser.add_argument("-I", "--inputDir", required=True, help="Directory to look for files to import")
parser.add_argument("-O", "--outputDir", required=True, help="Directory to store converted files")
args = parser.parse_args()

inputDir = args.inputDir
outputDir = args.outputDir

os.makedirs(outputDir, exist_ok = True)

for txtFile in os.listdir(inputDir) :
    filePath = os.path.join(inputDir, txtFile)
    print("converting ", filePath)
    convert(filePath, outputDir)
    

