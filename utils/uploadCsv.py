import gspread
import argparse
import os
import csv

csvSep = ";"

frameTypes = [
    ("special", "Special moves", "#frames_normal"),
    ("throws", "Throws", "#frames_throws"),
    ("tenhit", "10-hit", "#frames_tenhit"),
]
    
#input is a folder for a character which may contain multiple csv files (special moves, throws etc).
def convert(path, gSheet):
    print("Converting " + path)
    worksheetData = [];
    filePaths = []
    for frameFile in os.listdir(path) :
        filePaths.append(os.path.join(path, frameFile));
        
    #e.g filePaths = ["c:\anna\anna-throws.csv", "c:\anna\anna-special.csv"]
    
    moveTypeToContent = {};
        
    for filePath in filePaths:
        f = open(filePath, "r", newline="")
        csvContent = csv.reader(f, delimiter=csvSep)
        csvRows = []
        for row in csvContent:
            csvRows.append(row);
        moveType = filePath.split(".")[-2].split("-")[-1]
        moveTypeToContent[moveType] = csvRows 
        
    
    for frameType in frameTypes: #e.g frameType = ("special", "Special Moves")
        if(frameType[0] in moveTypeToContent) :
            worksheetData.append([frameType[2]]);
            worksheetData = worksheetData + moveTypeToContent[frameType[0]];
            worksheetData.append([]);
    
    worksheetName = os.path.basename(path).lower();

    # remove old worksheet if it does exists
    try : 
      ws = gSheet.worksheet(worksheetName);
      gSheet.del_worksheet(ws);
    except :
      pass; 

    ws = gSheet.add_worksheet(title=worksheetName, rows=1, cols=1)
    ws.append_rows(worksheetData);
    
    
#inputDir is expected to contain one folder per character with multiple files (one for special moves, one for throws etc)
# initiate the parser
parser = argparse.ArgumentParser(description = 'This is a program to convert frames in custom csv format to html.')
parser.add_argument("-I", "--inputDir", required=True, help="Directory to look for files to convert")
parser.add_argument("-G", "--gameId", required=True, help="Identifier for the game, e.g TFR3 for tekken 7 fated retribution season 3")
args = parser.parse_args()

inputDir = args.inputDir # e.g. "C:/projects/rbnTekkenFrameData/frameData/T7/csv"

gameIdToUrl = {
    "T7": 'https://docs.google.com/spreadsheets/d/1p-QCqB_Tb1GNX0KaicHr0tZwKa1taK5XeNvMr1N3D64',
    "T8": "https://docs.google.com/spreadsheets/d/1IDC11ShZjpo6p5k8kV24T-jumjY27oQZlwvKr_lb4iM"
}

# not currently in use. Can be used when we support both T7 and T8
gameId = args.gameId
sheetUrl = gameIdToUrl[gameId]

gc = gspread.oauth()
gSheet = gc.open_by_url(sheetUrl)


folders = []
charNum = 0
charNumOffset = 25 # used to start from a offset if last upload did not complete
for folder in os.listdir(inputDir) :
    charNum = charNum +1
    if charNum < charNumOffset :
        continue

    folderPath = os.path.join(inputDir, folder) # folderPath will be folder of one char, e.g. "c:\Anna"
    if(os.path.isdir(folderPath)):
      convert(folderPath, gSheet);

