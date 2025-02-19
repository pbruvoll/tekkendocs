# include standard modules
import argparse
import os
import json
import csv
import re
csvSep = ";"

allTrans = {}

notesCleanPattern = re.compile(r'\[\[.*?\|(.+?)\]\]') # [[Dragunov movelist#Dragunov-f,f,F+4|Snap Knee Assault]] -> Snap Knee Assault

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
    {"wavuId": "transitions", "displayName": "Transitions"}, # this value is created by this converter and not present in Wavu
    {"wavuId": "id", "displayName": "Wavu id"},
    {"wavuId": "name", "displayName": "Name"},
    {"wavuId": "recovery", "displayName": "Recovery"},
    {"wavuId": "image", "displayName": "Image"},
    {"wavuId": "video", "displayName": "Video"},
]

# 2,STB.4 -> STB.4,2
def moveInstallmentToFront(input, installment):
    match = re.search(r'(\s|,)' + re.escape(installment) + r'\.', input)
    if match :
        input = input[:match.start()+1] + input[match.end():]
        return installment + "." + input

    return input

# "Transitions to ZEN", "Cancel to BT with" -> "ZEN", "BT"
transToIgnore = ("with", "attack", "attacks", "standing", "throw", "block", "second", "triple", "releasing", "heel", "arm", "hell's", "awakened", "backdash", "dash", "evasive", "h", "n", "snap", "avalanche", "strings")
def getTransitions(move) :
    notes = re.sub(r'r\d+\??', '', move["notes"])
    matches = re.findall(r'(?:enter|cancel to|links to|transition to)\s+((?:(?:r\d|t\d|\d\d|cs|\+|-|\()[^\s]*\s+)*)?(\S*(\s\S*\s?(?:extensions|roll|step|tackle))?)', notes, re.IGNORECASE)
    filtered = [match[1] for match in matches if match[1].lower() not in transToIgnore]
    recoveryValue = move["recovery"].split(" ")[-1]
    if recoveryValue :
        splitted = recoveryValue.split("/")
        for recovery in splitted :
            if not re.match(r'^[rs]\??$', recovery) and not re.match(r'^[irt]?\d', recovery) and not re.match(r'^js?\d?', recovery) and not re.match(r'^a?s', recovery) and not recovery == "ws" and not recovery == "HEAT" :
                filtered.append("FC" if recovery == "rFC" or recovery == "hFC" else recovery)
    if len(filtered) > 0 :
        filtered = [re.sub(r'[(),]', '', s) for s in filtered]
        allTrans.update({element: "1" for element in filtered})
        return ",".join(filtered)
    return ""

def correctMove(move, charName) : 
    input = move["input"]

    match charName :
        case "bryan":
            input = moveInstallmentToFront(input, "SNE")
        case "claudio":
            input = moveInstallmentToFront(input, "STB")
        case "heihachi":
            input = moveInstallmentToFront(input, "WAR")
        case "nina":
            input = input.replace("SWA.b", "qcb").replace("CD.", "qcf+")
        case "paul":
            input = input.replace("CS.", "qcf+")
        case "leo":
            input = input.replace("CD.", "qcf+")
            input = moveInstallmentToFront(input, "LTG")



    input = input.replace("SWA.", "qcb+") #.replace("WS.", "WS+")
    # input = re.sub(r'(?<![a-zA-Z])SS.', "SS+", input)

    # move heat notation to the front (Heihachi "uf+4, H.1" -> "H.uf+4, 1")
    input = moveInstallmentToFront(input, "H")

    move["input"] = input

    move["notes"] = re.sub(notesCleanPattern, r'\1', move["notes"])

    move["transitions"] = getTransitions(move)
    if move["transitions"].find("ws") > -1 : 
        print("error move : ", move["input"], move["notes"])
    
#input is a folder for a character which may contain multiple csv files (special moves, throws etc).
#one json file will be generated for each chracter conntaining move type as key
def convert(filePath, outDir):
    fileName = os.path.basename(filePath)
    charName = fileName.split(".")[0]
    print("Converting data for " + charName)

    #make a folder per char to output in same format as for tekken 7
    charOutDir = os.path.join(outDir, charName);

    os.makedirs(charOutDir, exist_ok = True)
    

        
    f = open(filePath, "r", encoding='utf-8')
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
    # if not "zafi" in filePath :
    #      continue
    convert(filePath, outputDir)

print("Transitions collected:")
for key, value in allTrans.items() :
    print (key)


