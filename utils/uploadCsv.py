import gspread
import argparse
import os

gc = gspread.oauth()
sh = gc.open_by_url('https://docs.google.com/spreadsheets/d/1p-QCqB_Tb1GNX0KaicHr0tZwKa1taK5XeNvMr1N3D64')

csvSep = ";"

frameTypes = [
    ("special", "Special moves", "#framesnormal"),
    ("throws", "Throws", "#framethrows"),
    ("tenhit", "10-hit", "#frametenhit"),
]

def csvToArray(csvContent):
    result = [];
    lines = csvContent.splitlines();
    for line in lines:
        result.append(line.split(csvSep));
    return result
    

    
#input is a folder for a character which may contain multiple csv files (special moves, throws etc).
def convert(path, gameId):
    print("Converting " + path)
    worksheetData = [];
    filePaths = []
    for frameFile in os.listdir(path) :
        filePaths.append(os.path.join(path, frameFile));
        
    #e.g filePaths = ["c:\anna\anna-throws.csv", "c:\anna\anna-special.csv"]
    
    moveTypeToContent = {};
        
    for filePath in filePaths:
        f = open(filePath, "r")    
        fileContent = f.read()
        f.close()
        moveType = filePath.split(".")[-2].split("-")[-1]
        moveTypeToContent[moveType] = csvToArray(fileContent)
        
    
    for frameType in frameTypes: #e.g frameType = ("special", "Special Moves")
        if(frameType[0] in moveTypeToContent) :
            worksheetData.append([frameType[2]]);
            worksheetData = worksheetData + moveTypeToContent[frameType[0]];
            worksheetData.append([]);
    
    worksheetName = os.path.basename(path).lower();

    try : 
      ws = sh.worksheet(worksheetName);
      sh.del_worksheet(ws);
    except :
      pass; 

    ws = sh.add_worksheet(title=worksheetName, rows=1, cols=1)
    ws.append_rows(worksheetData);
    
    
#inputDir is expected to contain one folder per character with multiple files (one for special moves, one for throws etc)
# initiate the parser
parser = argparse.ArgumentParser(description = 'This is a program to convert frames in custom csv format to html.')
parser.add_argument("-I", "--inputDir", required=True, help="Directory to look for files to convert")
parser.add_argument("-G", "--gameId", help="Identifier for the game, e.g TFR3 for tekken 7 fated retribution season 3")
args = parser.parse_args()

inputDir = args.inputDir
inputDir = "C:/projects/rbnTekkenFrameData/frameData/T7/csv"
gameId = "T7"
    
if args.gameId :
    gameId = args.gameId


folders = []
for folder in os.listdir(inputDir) :
    folderPath = os.path.join(inputDir, folder) # folderPath will be folder of one char, e.g. "c:\Anna"
    if(os.path.isdir(folderPath)):
      convert(folderPath, gameId);


