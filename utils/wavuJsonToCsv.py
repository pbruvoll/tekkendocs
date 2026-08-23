# include standard modules
import argparse
import os
import json
import csv
import re
import wavuParsing
csvSep = ";"

allTrans = {}

notesCleanPattern = re.compile(r'\[\[.*?\|(.+?)\]\]') # [[Dragunov movelist#Dragunov-f,f,F+4|Snap Knee Assault]] -> Snap Knee Assault

columns = [
    {"wavuId": "input", "displayName": "Command"},
    {"wavuId": "target", "displayName": "Hit level"},
    {"wavuId": "damage", "displayName": "Damage"},
    {"wavuId": "startup", "displayName": "Start up frame"},
    {"wavuId": "block", "displayName": "Block frame"},
    {"wavuId": "hit", "displayName": "Hit frame"},
    {"wavuId": "ch", "displayName": "Counter hit frame"},
    {"wavuId": "notes", "displayName": "Notes"},
    {"wavuId": "tags", "displayName": "Tags"}, # this value is created by wavuParsing and not present in Wavu
    {"wavuId": "transitions", "displayName": "Transitions"}, # this value is created by this converter and not present in Wavu
    {"wavuId": "name", "displayName": "Name"},
    {"wavuId": "recovery_frames", "displayName": "Recovery"}, # split out of the recv field of wavu by wavuParsing
    {"wavuId": "recovery_state", "displayName": "Recovery state"}, # split out of the recv field of wavu by wavuParsing
    {"wavuId": "image", "displayName": "Image"},
    {"wavuId": "video", "displayName": "Video"},
    {"wavuId": "id", "displayName": "Wavu id"},
]

# 2,STB.4 -> STB.4,2
def moveInstallmentToFront(input, installment):
    match = re.search(r'(\s|,|~)' + re.escape(installment) + r'\.', input)
    if match :
        input = input[:match.start()+1] + input[match.end():]
        return installment + "." + input

    return input

# "Transitions to ZEN", "Cancel to BT with" -> "ZEN", "BT"
transToIgnore = ("with", "attack", "attacks", "standing", "throw", "block", "second", "triple", "releasing", "heel", "arm", "hell's", "awakened", "backdash", "dash", "evasive", "h", "n", "snap", "avalanche", "strings")
def getTransitions(move) :
    notes = re.sub(r'r\d+\??', '', move["notes"])
    matches = re.findall(r'(?:enter|cancel to|links to|transition to)\s+((?:(?:r\d|t\d|\d\d|cs|\+|-|\()[^\s]*\s+)*)?(\S*(\s\S*\s?(?:extensions|roll|step|tackle))?)', notes, re.IGNORECASE)
    # destinations come from two overlapping sources: the notes, which name one per way
    # of reaching it ("Transition to RLX" and "Cancel to RLX with D" are both RLX), and
    # recovery_state, since a move recovering in a state ends up in it. the notes often
    # name the state a move recovers in as well, so they are keyed by name to hold each
    # destination once, in the order it is first named. recovery_state holds the state
    # alone, such as "FC", and the states apart when there are several, as "BT JGS"
    mentions = [match[1] for match in matches] + move.get("recovery_state", "").split()
    destinations = {}
    for mention in mentions :
        destination = re.sub(r'[(),]', '', mention)
        if destination and destination.lower() not in transToIgnore :
            destinations[destination] = None
    allTrans.update({element: "1" for element in destinations})
    return ",".join(destinations)

def fillMissingVideoFromExtendedInput(move, moves):
    if move.get("video"):
        return

    moveInput = move.get("input", "")
    if not moveInput:
        return

    inputPrefix = moveInput + ","
    for otherMove in moves:
        otherVideo = otherMove.get("video")
        otherInput = otherMove.get("input", "")
        if otherVideo and otherInput.startswith(inputPrefix):
            move["video"] = otherVideo
            break

def generateVideoLink(move) :
    if move.get("video") :
        return
    if move["id"].startswith("Anna-df+3,2,1,2,4") and move["id"] != "Anna-df+3,2,1,2,4,1,2,2,3+4,2":
        return
    move["video"] = "t8-p2-" + move["id"].replace(" ", "-").replace("*", "x").replace(":", "j").replace("(", "").replace(")", "").lower() + ".mp4"

def correctMove(move, charName) : 
    input = move["input"]

    match charName :
        case "bryan":
            input = moveInstallmentToFront(input, "SNE")
        case "claudio":
            input = moveInstallmentToFront(input, "STB")
        case "heihachi":
            input = moveInstallmentToFront(input, "WAR")
        case "fahkumram":
                input = moveInstallmentToFront(input, "GRF")
        case "jin": 
            input = input.replace("CD.", "f,n,d,")
        case "kazuya":
            input = moveInstallmentToFront(input, "DVK")            
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

    # currently needed for moves like Paul H.b+2,1*
    move["block"] = re.sub(notesCleanPattern, r'\1', move.get("block", ""))

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
    # the json only holds the raw values of each move, so join them with their
    # parents and derive tags and notes before converting
    moves = wavuParsing.parse_movelist(jsonData)
    csvContent = [list(map(lambda x: x["displayName"], columns)) + ["Character id"]];
    for move in moves :
        if charName == "miary-zo" or charName == "fahkumram" or charName == "anna" or charName == "armor-king" or charName == "shaheen" or charName == "kunimitsu" or charName == "bob":
            generateVideoLink(move)
    for move in moves :
        fillMissingVideoFromExtendedInput(move, moves)
        correctMove(move, charName)
        csvContent.append(list(map(lambda x: move.get(x["wavuId"], ""), columns)) + [charName]);
    
    outputFilePath = os.path.join(charOutDir, charName + "-special.csv")
    outputFile = open(outputFilePath, "w", newline="", encoding='utf-8')
    csvWriter = csv.writer(outputFile, delimiter=csvSep, lineterminator=os.linesep)
    csvWriter.writerows(csvContent);
    
#inputDir is expected to contain one folder per character with multiple files (one for special moves, one for throws etc)
# guarded so that the functions above can be imported by test_wavuJsonToCsv
if __name__ == "__main__" :
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


