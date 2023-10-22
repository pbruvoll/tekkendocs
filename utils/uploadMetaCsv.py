# This script reads data (key moves, punisher etc) for all characters from csv-files and uploads
# them to the master google sheet data

import gspread
import argparse
import os
import json

csvSep = ";"

frameTypes = [
    ("special", "Special moves", "#frames_normal"),
    ("throws", "Throws", "#frames_throws"),
    ("tenhit", "10-hit", "#frames_tenhit"),
]

def csvToArray(csvContent):
    result = [];
    lines = csvContent.splitlines();
    for line in lines:
        result.append(line.split(csvSep));
    return result
    

    
#input is a folder for a character which may contain multiple csv files (special moves, throws etc).
def convert(path, worksheetName, gSheet):
    print("Converting " + path)
    f = open(path, "r")  
    content = json.load(f);
    #print(content)
    worksheetData = [];
    #keymoves
    keyMoves = [["#key_moves"], ["Command", "Description"]];
    worksheetData += keyMoves + list(map(lambda command : [command, ""], content["keyMoves"]))
    #standingPunishers
    standingPunishers = [["#punishers_standing"], ["Startup", "Command", "Description"]];
    worksheetData += [[]] + standingPunishers + list(map(lambda punisher : punisher + [""], content["standingPunishers"]))
    #crouchingPunishers
    crouchingPunishers = [["#punishers_crouching"], ["Command", "Description"]];
    worksheetData += [[]] + crouchingPunishers + list(map(lambda punisher : punisher + [""], content["crouchingPunishers"]))

    #whiffPunishers
    whiffPunishers = [["#punishers_whiff"], ["Command", "Description"]];
    worksheetData += [[]] + whiffPunishers + list(map(lambda command : [command, ""], content["whiffPunishers"]))

    #standardCombos
    standardCombos = [["#combos_normal"], ["Combo", "Starter"]];
    worksheetData += [[]] + standardCombos + content["standardCombos"]

    #smallCombos
    smallCombos = [["#combos_small"], ["Combo", "Starter"]];
    worksheetData += [[]] + smallCombos + content["smallCombos"]

    #comboEnders
    comboEnders = [["#combos_ender"], ["Type", "Combo"]];
    worksheetData += [[]] + comboEnders + content["comboEnders"]

    #wallCombos
    wallCombos = [["#combos_wall"], ["Type", "SubType", "Combo"]];
    worksheetData += [[]] + wallCombos + content["wallCombos"]


    crouchingPunishers

    #print("*****", worksheetData, worksheetName)

    # remove old worksheet if it does exists
    try : 
      ws = gSheet.worksheet(worksheetName);
      gSheet.del_worksheet(ws);
    except :
      pass; 

    ws = gSheet.add_worksheet(title=worksheetName, rows=1, cols=1)
    ws.append_rows(worksheetData);
    
    
#inputDir is expected to contain one folder per character
# initiate the parser
parser = argparse.ArgumentParser(description = 'This is a program to read character data (key moves etc) in custom csv format and upload to google sheet.')
parser.add_argument("-I", "--inputDir", required=True, help="Directory to look for files to convert")
parser.add_argument("-G", "--gameId", help="Identifier for the game, e.g TFR3 for tekken 7 fated retribution season 3")
args = parser.parse_args()

inputDir = args.inputDir # e.g. "C:\projects\rbnorway-frame-data\rbn-frontend\src\assets\metadata\T7"

gc = gspread.oauth()
gSheet = gc.open_by_url('https://docs.google.com/spreadsheets/d/1p-QCqB_Tb1GNX0KaicHr0tZwKa1taK5XeNvMr1N3D64')


charNum = 0
charNumOffset = 0 # used to start from a offset if last upload did not complete
for fileName in os.listdir(inputDir) :
    charNum = charNum +1
    if charNum < charNumOffset :
        continue
    sheetName = fileName.split(".")[0].lower()
    convert(os.path.join(inputDir, fileName), sheetName, gSheet);


