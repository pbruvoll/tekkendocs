"""Downloads every <character-id>-guide sheet from the T8 spreadsheet to csv.

Only the three first columns are downloaded, as the rest of the sheet is static
helper content which the site never reads.

Output: data/guides/<character-id>/<character-id>-guide.csv
"""

import csv
import os
import re
import sys

import gspread

SPREADSHEET_ID = "1IDC11ShZjpo6p5k8kV24T-jumjY27oQZlwvKr_lb4iM"
GUIDE_SUFFIX = "-guide"
CSV_SEP = ";"
# number of sheets we ask for in one batch request, to keep the request url sane
BATCH_SIZE = 30

repoRoot = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
outputRoot = os.path.join(repoRoot, "data", "guides")
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
    """The spreadsheet also holds template and example guides, so we only keep real characters"""
    with open(characterListPath, encoding="utf-8") as file:
        characterIds = re.findall(r"^\s+id: '([^']+)'", file.read(), re.MULTILINE)
    if not characterIds:
        fail("Did not find any character ids in " + characterListPath)
    return set(characterIds)


def fetchGuideRows(gSheet, titles):
    """Returns a dict of sheet title to rows, fetching the sheets in batches"""
    rowsByTitle = {}
    for start in range(0, len(titles), BATCH_SIZE):
        batch = titles[start : start + BATCH_SIZE]
        # the sheet names contain "-", so they have to be quoted in a1 notation
        ranges = ["'" + title + "'!A:C" for title in batch]
        response = gSheet.values_batch_get(ranges)
        valueRanges = response.get("valueRanges", [])
        for title, valueRange in zip(batch, valueRanges):
            rowsByTitle[title] = valueRange.get("values", [])
    return rowsByTitle


def writeGuide(characterId, rows):
    dirPath = os.path.join(outputRoot, characterId)
    os.makedirs(dirPath, exist_ok=True)
    filePath = os.path.join(dirPath, characterId + GUIDE_SUFFIX + ".csv")
    with open(filePath, "w", newline="", encoding="utf-8") as file:
        csv.writer(file, delimiter=CSV_SEP).writerows(rows)


characterIds = loadCharacterIds()
gc = authorize()
gSheet = gc.open_by_key(SPREADSHEET_ID)

guideTitles = []
for worksheet in gSheet.worksheets():
    if not worksheet.title.endswith(GUIDE_SUFFIX):
        continue
    if worksheet.title[: -len(GUIDE_SUFFIX)] not in characterIds:
        print("Skipping " + worksheet.title + ", it is not a character")
        continue
    guideTitles.append(worksheet.title)

if not guideTitles:
    fail("Did not find any character sheets ending with " + GUIDE_SUFFIX)

print("Found " + str(len(guideTitles)) + " character guides")
rowsByTitle = fetchGuideRows(gSheet, guideTitles)

for title in guideTitles:
    rows = rowsByTitle.get(title, [])
    characterId = title[: -len(GUIDE_SUFFIX)]
    writeGuide(characterId, rows)
    print("  " + characterId + " (" + str(len(rows)) + " rows)")

print("Wrote " + str(len(guideTitles)) + " guides to " + outputRoot)
