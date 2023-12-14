import gspread
import argparse
import os

csvSep = ";"

frameTypeToFilename = {
    "#frames_normal": "special",
    "#frames_throws": "throws",
    "#frames_tenhit": "tenhit"
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
    # we use currentColumnCount to avoid adding empty cells at the end of the column
    # usually the spreadsheet has multiple table with different number of columns, but when 
    # we read data all rows has the max number of columns in the sheet
    currentColumnCount = 0
    for wsRow in wsData :
        if(len(wsRow) == 0 or wsRow[0].startswith("#")) :
            if(currentFilename) : 
                writeFile(path, currentFilename, currentData)
                currentData = []
                currentColumnCount = 0
        if(len(wsRow) == 0 or len(wsRow[0]) == 0) :
            continue
        if(wsRow[0].startswith("#")) :
            currentFilename = worksheetName + "-" + frameTypeToFilename[wsRow[0]] + ".csv"
        else :
            if currentColumnCount == 0 :
                
                currentColumnCount = len(wsRow)
                # Iterate through the array in reverse order
                for i in range(len(wsRow) - 1, -1, -1):
                    if wsRow[i] == "":
                        currentColumnCount = i
                
            currentData.append(wsRow[0:currentColumnCount])
    
    writeFile(path, currentFilename, currentData)
    
    
#outputDir is expected to contain one folder per character with multiple files (one for special moves, one for throws etc)
# initiate the parser
parser = argparse.ArgumentParser(description = 'This is a program to convert frames in custom csv format to html.')
parser.add_argument("-O", "--outputDir", required=True, help="Directory to store converted files")
parser.add_argument("-G", "--gameId", help="Identifier for the game, e.g TFR3 for tekken 7 fated retribution season 3")
args = parser.parse_args()

outputDir = args.outputDir # e.g. "C:/projects/rbnTekkenFrameData/frameData/T7/csv"


# not currently in use. Can be used when we support both T7 and T8
gameId = "T8"
if args.gameId :
    gameId = args.gameId

print("trying auth")
gc = gspread.oauth()
print("got auth")
#T7 : 
#gSheet = gc.open_by_url('https://docs.google.com/spreadsheets/d/1p-QCqB_Tb1GNX0KaicHr0tZwKa1taK5XeNvMr1N3D64')
gSheet = gc.open_by_url('https://docs.google.com/spreadsheets/d/1IDC11ShZjpo6p5k8kV24T-jumjY27oQZlwvKr_lb4iM')



# currently we loop throug all folders and expect to find a worksheet with similar name. It would probalby
# be better to loop through the worksheets and create folders instead
folders = []
charNum = 0
charNumOffset = 0 # used to start from a offset if last upload did not complete
for folder in os.listdir(outputDir) :
    charNum = charNum +1
    # to filter a specific character
    # if "Yoshimitsu" not in folder : 
    #     continue
    if charNum < charNumOffset :
        continue
    folderPath = os.path.join(outputDir, folder) # folderPath will be folder of one char, e.g. "c:\frameData\T7\csv\Anna"
    if(os.path.isdir(folderPath)):
      convert(folderPath, gSheet)
      


