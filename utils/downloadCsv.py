import gspread
import argparse
import os

csvSep = ";"

frameTypes = [
    ("special", "Special moves", "#frames_normal"),
    ("throws", "Throws", "#frames_throws"),
    ("tenhit", "10-hit", "#frames_tenhit"),
]

frameTypeToFilename = {
    "#frames_normal": "special",
    "#frames_throws": "throws",
    "#frames_tenhit": "#frametenhit"
}

def csvToArray(csvContent):
    result = [];
    lines = csvContent.splitlines();
    for line in lines:
        result.append(line.split(csvSep));
    return result
    
def writeFile(dirname, filename, data) :
  with open(os.path.join(dirname, filename), "w") as file:
    for row in data:
        file.write(csvSep.join(row) + "\n")  # Add a     
    
#input is a folder for a character which may contain multiple csv files (special moves, throws etc).
def convert(path, gSheet):
    print("Converting " + path)
    worksheetName = os.path.basename(path).lower();
    worksheet = gSheet.worksheet(worksheetName)
    wsData = worksheet.get_values();
    currentFilename = ""
    currentData = []
    for wsRow in wsData :
        if(len(wsRow) == 0 or wsRow[0].startswith("#")) :
            if(currentFilename) : 
                writeFile(path, currentFilename, currentData)
        if(len(wsRow) == 0) :
            continue
        if(wsRow[0].startswith("#")) :
            currentFilename = worksheetName + "-special.csv"
        else :
            currentData.append(wsRow)
    
    writeFile(path, currentFilename, currentData)

    return
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

    # remove old worksheet if it does exists
    try : 
      ws = gSheet.worksheet(worksheetName);
      gSheet.del_worksheet(ws);
    except :
      pass; 

    ws = gSheet.add_worksheet(title=worksheetName, rows=1, cols=1)
    ws.append_rows(worksheetData);
    
    
#outputDir is expected to contain one folder per character with multiple files (one for special moves, one for throws etc)
# initiate the parser
parser = argparse.ArgumentParser(description = 'This is a program to convert frames in custom csv format to html.')
parser.add_argument("-O", "--outputDir", required=True, help="Directory to store converted files")
parser.add_argument("-G", "--gameId", help="Identifier for the game, e.g TFR3 for tekken 7 fated retribution season 3")
args = parser.parse_args()

outputDir = args.outputDir # e.g. "C:/projects/rbnTekkenFrameData/frameData/T7/csv"


# not currently in use. Can be used when we support both T7 and T8
gameId = "T7"
if args.gameId :
    gameId = args.gameId

print("trying auth")
gc = gspread.oauth()
print("got auth")
gSheet = gc.open_by_url('https://docs.google.com/spreadsheets/d/1p-QCqB_Tb1GNX0KaicHr0tZwKa1taK5XeNvMr1N3D64')


# currently we loop throug all folders and expect to find a worksheet with similar name. It would probalby
# be better to loop through the worksheets and create folders instead
folders = []
for folder in os.listdir(outputDir) :
    folderPath = os.path.join(outputDir, folder) # folderPath will be folder of one char, e.g. "c:\frameData\T7\csv\Anna"
    if(os.path.isdir(folderPath)):
      convert(folderPath, gSheet)
      break


