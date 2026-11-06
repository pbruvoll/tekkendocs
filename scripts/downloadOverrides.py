"""Downloads every <character-id>-override sheet from the T8 spreadsheet to csv.

The override sheets hold the YouTube videos, and a few extra tags, for the moves of
a character. utils/wavuJsonToCsv.py adds them to the frame data csv files, so they
are part of what is uploaded, also for mokujin.

Only the columns the converter reads are kept. Rows without a video or tags are
dropped, as they do not change anything.

Output: data/t8/overrides/<character-id>-override.csv
"""

import csv
import os
import re
import sys

import gspread

SPREADSHEET_ID = "1IDC11ShZjpo6p5k8kV24T-jumjY27oQZlwvKr_lb4iM"
OVERRIDE_SUFFIX = "-override"
CSV_SEP = ";"
SECTION = "#frames_normal"
# the lower case header in the sheet -> the header in the csv
COLUMNS = {
    "wavu id": "Wavu id",
    "command": "Command",
    "tags": "Tags",
    "yt video": "YT Video",
    "yt start": "YT Start",
    "yt end": "YT End",
}

repoRoot = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
outputRoot = os.path.join(repoRoot, "data", "t8", "overrides")
characterListPath = os.path.join(repoRoot, "app", "constants", "characterInfoListT8.ts")


def fail(message):
    print("ERROR: " + message)
    sys.exit(1)


def loadEnv(path):
    if not os.path.isfile(path):
        fail("Could not find " + path + ". It must contain the google service account credentials.")
    env = {}
    with open(path, encoding="utf-8") as file:
        for line in file:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            env[key.strip()] = value.strip().strip('"').strip("'")
    return env


def authorize():
    env = loadEnv(os.path.join(repoRoot, ".env"))
    clientEmail = env.get("GOOGLE_SHEETS_CLIENT_EMAIL")
    privateKey = env.get("GOOGLE_SHEETS_PRIVATE_KEY")
    if not clientEmail or not privateKey:
        fail("GOOGLE_SHEETS_CLIENT_EMAIL and GOOGLE_SHEETS_PRIVATE_KEY must both be set in .env")
    return gspread.service_account_from_dict(
        {
            "type": "service_account",
            "client_email": clientEmail,
            # the key is stored on a single line with literal \n, same as for the server
            "private_key": privateKey.replace("\\n", "\n"),
            "token_uri": "https://oauth2.googleapis.com/token",
        },
        scopes=["https://www.googleapis.com/auth/spreadsheets.readonly"],
    )


def loadCharacterIds():
    """The spreadsheet also holds a test-override sheet, so we only keep real characters"""
    with open(characterListPath, encoding="utf-8") as file:
        characterIds = re.findall(r"^\s+id: '([^']+)'", file.read(), re.MULTILINE)
    if not characterIds:
        fail("Did not find any character ids in " + characterListPath)
    return set(characterIds)


def toOverrideRows(sheetRows):
    """The header row follows the #frames_normal row. Some sheets have helper columns
    for converting minutes to seconds, those are not kept"""
    header = None
    inSection = False
    rows = []
    for row in sheetRows:
        firstCell = row[0].strip() if row else ""
        if firstCell.startswith("#"):
            inSection = firstCell == SECTION
            header = None
            continue
        if not inSection or not any(cell.strip() for cell in row):
            continue
        if header is None:
            header = [cell.strip().lower() for cell in row]
            continue
        values = {}
        for index, name in enumerate(header):
            if name in COLUMNS and name not in values and index < len(row):
                values[name] = row[index].strip()
        if values.get("yt video") or values.get("tags"):
            rows.append([values.get(name, "") for name in COLUMNS])
    return rows


def writeOverride(characterId, rows):
    os.makedirs(outputRoot, exist_ok=True)
    filePath = os.path.join(outputRoot, characterId + OVERRIDE_SUFFIX + ".csv")
    with open(filePath, "w", newline="", encoding="utf-8") as file:
        csvWriter = csv.writer(file, delimiter=CSV_SEP, lineterminator=os.linesep)
        csvWriter.writerow(list(COLUMNS.values()))
        csvWriter.writerows(rows)


if __name__ == "__main__":
    characterIds = loadCharacterIds()
    gSheet = authorize().open_by_key(SPREADSHEET_ID)

    titles = []
    for worksheet in gSheet.worksheets():
        if not worksheet.title.endswith(OVERRIDE_SUFFIX):
            continue
        if worksheet.title[: -len(OVERRIDE_SUFFIX)] not in characterIds:
            print("Skipping " + worksheet.title + ", it is not a character")
            continue
        titles.append(worksheet.title)

    if not titles:
        fail("Did not find any character sheets ending with " + OVERRIDE_SUFFIX)

    # one request for all the sheets, as fetching them one by one runs into the
    # limit of 60 read requests per minute. A range of just the sheet name gives all its
    # columns. The names contain "-", so they are quoted
    response = gSheet.values_batch_get(["'" + title + "'" for title in titles])
    for title, valueRange in zip(titles, response.get("valueRanges", [])):
        characterId = title[: -len(OVERRIDE_SUFFIX)]
        rows = toOverrideRows(valueRange.get("values", []))
        writeOverride(characterId, rows)
        print("  " + characterId + " (" + str(len(rows)) + " rows)")

    print("Wrote " + str(len(titles)) + " overrides to " + outputRoot)
