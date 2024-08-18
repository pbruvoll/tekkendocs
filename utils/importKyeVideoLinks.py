# this script extract videolinks from moves in the googel docs from kye at https://docs.google.com/document/d/1pmXilaPdgBIzCTYk3JEarm0VgxLMQx9MRuWi1WbNNeU/edit
# the script assumed the files have been downloaded as txt files

import argparse
import os
import csv
import re

csvSep = ";"

    
def convert(filePath, outDir):
    fileName = os.path.basename(filePath)
    charName = fileName.split(".")[0]
    print("Converting data for " + charName)
        
    f = open(filePath, "r", encoding='utf-8')
    textDataLines = f.readlines()
    f.close()
    csvContent = [];
    csvContent.append(["Command", "YT Video", "YT Start", "YT End"])
    startTimes = []
    for i in range(len(textDataLines)):
        line = textDataLines[i]
        matches = re.findall(r'\[(.*?)\]', line)
        if(len(matches) == 0 or matches[0].strip() == "Command") :
            continue 
        command = matches[0].strip()
        if(len(matches) == 1) :
            csvContent.append([command])
            continue

        if(not "://youtu" in matches[1]) :
            csvContent.append([command])
            continue

        fullLink = matches[1].strip() #  https://youtu.be/HSi65ip2sjw?list=PLq8qrbY4w2-OrQxh3xLnv2k7nm6jroMBK&t=65
        splitted = fullLink.split("?") # [https://youtu.be/HSi65ip2sjw, list=PLq8qrbY4w2-OrQxh3xLnv2k7nm6jroMBK&t=65]
        videoId = splitted[0].split("/")[-1] # HSi65ip2sjw
        startTime = splitted[-1].split("=")[-1] # 65
        startTimes.append(int(startTime))
        csvContent.append([command, videoId.replace("\\", ""), startTime])

    startTimes.sort()

    for i in range(1, len(csvContent)):
        if(len(csvContent[i]) == 1) :
            continue
        startTime = int(csvContent[i][2])
        endTime = next((x for x in startTimes if x > startTime), None)
        csvContent[i].append(endTime)
            
        

    
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
    

